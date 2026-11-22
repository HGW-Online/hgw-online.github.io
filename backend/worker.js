// HGW identity backend — OpenID Connect relying party for Signicat (BankID / eID).
// Runs as a Cloudflare Worker (or any runtime with fetch + WebCrypto).
// No national ID number is stored: the session keeps only `sub` and a display name.
'use strict';

const enc = new TextEncoder();
const dec = new TextDecoder();
const b64u = {
  enc: (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
  dec: (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), (c) => c.charCodeAt(0)),
};
const rand = (n) => b64u.enc(crypto.getRandomValues(new Uint8Array(n)));
const now = () => Math.floor(Date.now() / 1000);

async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
async function signToken(payload, secret) {
  const body = b64u.enc(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(body));
  return body + '.' + b64u.enc(sig);
}
async function verifyToken(token, secret) {
  if (typeof token !== 'string') return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const ok = await crypto.subtle.verify('HMAC', await hmacKey(secret), b64u.dec(sig), enc.encode(body));
  if (!ok) return null;
  const payload = JSON.parse(dec.decode(b64u.dec(body)));
  return payload.exp && payload.exp > now() ? payload : null;
}

function cookies(req) {
  const out = {};
  for (const part of (req.headers.get('cookie') || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}
const setCookie = (name, value, opts) =>
  `${name}=${value}; Path=${opts.path}; HttpOnly; Secure; SameSite=${opts.sameSite}; Max-Age=${opts.maxAge}`;

let discoveryCache = null;
async function discovery(env) {
  if (discoveryCache && discoveryCache.at > Date.now() - 3600e3 && discoveryCache.issuer === env.OIDC_ISSUER) return discoveryCache.doc;
  if (!env.OIDC_ISSUER.startsWith('https://') && env.ALLOW_INSECURE_ISSUER !== '1') throw new Error('OIDC_ISSUER must be https');
  const res = await fetch(env.OIDC_ISSUER.replace(/\/$/, '') + '/.well-known/openid-configuration');
  if (!res.ok) throw new Error('discovery failed');
  const doc = await res.json();
  discoveryCache = { at: Date.now(), issuer: env.OIDC_ISSUER, doc };
  return doc;
}

async function verifyIdToken(idToken, env, doc, nonce) {
  const [h, p, s] = String(idToken).split('.');
  if (!h || !p || !s) throw new Error('malformed id_token');
  const header = JSON.parse(dec.decode(b64u.dec(h)));
  if (header.alg !== 'RS256') throw new Error('unsupported alg');
  const jwks = await (await fetch(doc.jwks_uri)).json();
  const jwk = (jwks.keys || []).find((k) => k.kid === header.kid && (!k.use || k.use === 'sig'));
  if (!jwk) throw new Error('signing key not found');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64u.dec(s), enc.encode(h + '.' + p));
  if (!valid) throw new Error('bad signature');
  const c = JSON.parse(dec.decode(b64u.dec(p)));
  const aud = Array.isArray(c.aud) ? c.aud : [c.aud];
  if (c.iss !== doc.issuer) throw new Error('bad issuer');
  if (!aud.includes(env.OIDC_CLIENT_ID)) throw new Error('bad audience');
  if (!c.exp || c.exp + 60 < now()) throw new Error('expired');
  if (c.nonce !== nonce) throw new Error('bad nonce');
  return c;
}

function cors(req, env, extra = {}) {
  const headers = { 'Cache-Control': 'no-store', ...extra };
  if (req.headers.get('origin') === env.SITE_ORIGIN) {
    headers['Access-Control-Allow-Origin'] = env.SITE_ORIGIN;
    headers['Access-Control-Allow-Credentials'] = 'true';
    headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS';
    headers['Vary'] = 'Origin';
  }
  return headers;
}
const json = (req, env, status, body, extra) =>
  new Response(JSON.stringify(body), { status, headers: cors(req, env, { 'Content-Type': 'application/json', ...extra }) });

// Only same-site relative paths are accepted as a post-login destination.
const safeReturn = (v) => (typeof v === 'string' && /^\/[A-Za-z0-9\-._~\/?=&%#]*$/.test(v) && !v.startsWith('//') ? v : '/');

async function login(req, env, url) {
  const doc = await discovery(env);
  const state = rand(16), nonce = rand(16), verifier = rand(32);
  const challenge = b64u.enc(await crypto.subtle.digest('SHA-256', enc.encode(verifier)));
  const cookie = await signToken({ state, nonce, verifier, ret: safeReturn(url.searchParams.get('return')), exp: now() + 600 }, env.SESSION_SECRET);
  const q = new URLSearchParams({
    response_type: 'code', client_id: env.OIDC_CLIENT_ID, redirect_uri: env.OIDC_REDIRECT_URI,
    scope: env.OIDC_SCOPE || 'openid profile', state, nonce, code_challenge: challenge, code_challenge_method: 'S256',
  });
  if (env.OIDC_ACR_VALUES) q.set('acr_values', env.OIDC_ACR_VALUES);
  return new Response(null, {
    status: 302,
    headers: { Location: doc.authorization_endpoint + '?' + q, 'Cache-Control': 'no-store',
      'Set-Cookie': setCookie('hgw_oidc', cookie, { path: '/auth', sameSite: 'Lax', maxAge: 600 }) },
  });
}

async function callback(req, env, url) {
  const saved = await verifyToken(cookies(req).hgw_oidc, env.SESSION_SECRET);
  if (url.searchParams.get('error')) return json(req, env, 400, { error: 'authentication_cancelled_or_failed' });
  if (!saved || url.searchParams.get('state') !== saved.state || !url.searchParams.get('code')) return json(req, env, 400, { error: 'invalid_state' });
  try {
    const doc = await discovery(env);
    const body = new URLSearchParams({ grant_type: 'authorization_code', code: url.searchParams.get('code'),
      redirect_uri: env.OIDC_REDIRECT_URI, code_verifier: saved.verifier });
    const res = await fetch(doc.token_endpoint, { method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: 'Basic ' + btoa(env.OIDC_CLIENT_ID + ':' + env.OIDC_CLIENT_SECRET) },
      body });
    if (!res.ok) throw new Error('token exchange failed');
    const tok = await res.json();
    const claims = await verifyIdToken(tok.id_token, env, doc, saved.nonce);
    const name = claims.name || [claims.given_name, claims.family_name].filter(Boolean).join(' ') || null;
    const session = await signToken({ sub: claims.sub, name, exp: now() + 3600 }, env.SESSION_SECRET);
    const headers = new Headers({ Location: env.SITE_ORIGIN + saved.ret, 'Cache-Control': 'no-store' });
    headers.append('Set-Cookie', setCookie('hgw_session', session, { path: '/', sameSite: 'None', maxAge: 3600 }));
    headers.append('Set-Cookie', setCookie('hgw_oidc', '', { path: '/auth', sameSite: 'Lax', maxAge: 0 }));
    return new Response(null, { status: 302, headers });
  } catch (e) {
    return json(req, env, 401, { error: 'verification_failed' });
  }
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(req, env, { 'Access-Control-Allow-Headers': 'Content-Type' }) });
    if (!env.OIDC_ISSUER || !env.OIDC_CLIENT_ID || !env.OIDC_CLIENT_SECRET || !env.OIDC_REDIRECT_URI || !env.SESSION_SECRET || !env.SITE_ORIGIN)
      return json(req, env, 503, { error: 'not_configured' });
    if (url.pathname === '/auth/login' && req.method === 'GET') return login(req, env, url);
    if (url.pathname === '/auth/callback' && req.method === 'GET') return callback(req, env, url);
    if (url.pathname === '/auth/session' && req.method === 'GET') {
      const s = await verifyToken(cookies(req).hgw_session, env.SESSION_SECRET);
      return json(req, env, 200, s ? { authenticated: true, name: s.name } : { authenticated: false });
    }
    if (url.pathname === '/auth/logout' && req.method === 'POST')
      return json(req, env, 200, { authenticated: false }, { 'Set-Cookie': setCookie('hgw_session', '', { path: '/', sameSite: 'None', maxAge: 0 }) });
    return json(req, env, 404, { error: 'not_found' });
  },
};
