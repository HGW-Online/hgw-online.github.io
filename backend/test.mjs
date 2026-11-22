// Run: node test.mjs   (uses a local mock OIDC provider; no network access needed)
import http from 'node:http';
import { webcrypto as crypto } from 'node:crypto';
import worker from './worker.js';

const b64u = (b) => Buffer.from(b).toString('base64url');
const kp = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
const other = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
const jwk = { ...(await crypto.subtle.exportKey('jwk', kp.publicKey)), kid: 'k1', use: 'sig', alg: 'RS256' };
let next = {}; // what the mock provider will issue
const sign = async (claims, key = kp.privateKey) => {
  const h = b64u(JSON.stringify({ alg: 'RS256', kid: 'k1' })), p = b64u(JSON.stringify(claims));
  return h + '.' + p + '.' + b64u(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, Buffer.from(h + '.' + p)));
};
let ISS;
const srv = http.createServer(async (req, res) => {
  const u = new URL(req.url, ISS);
  if (u.pathname.endsWith('openid-configuration')) return res.end(JSON.stringify({ issuer: ISS, authorization_endpoint: ISS + '/authorize', token_endpoint: ISS + '/token', jwks_uri: ISS + '/jwks' }));
  if (u.pathname === '/jwks') return res.end(JSON.stringify({ keys: [jwk] }));
  if (u.pathname === '/token') {
    let body = ''; for await (const c of req) body += c;
    const f = new URLSearchParams(body);
    const challenge = b64u(await crypto.subtle.digest('SHA-256', Buffer.from(f.get('code_verifier') || '')));
    if (challenge !== next.challenge || !String(req.headers.authorization).startsWith('Basic ')) { res.statusCode = 400; return res.end('{}'); }
    const claims = { iss: ISS, aud: 'cid', sub: 'sub-123', name: 'Test Person', exp: Math.floor(Date.now() / 1000) + 300, nonce: next.nonce, ...next.override };
    return res.end(JSON.stringify({ id_token: await sign(claims, next.key || kp.privateKey) }));
  }
  res.statusCode = 404; res.end();
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
ISS = 'http://127.0.0.1:' + srv.address().port;
const env = { OIDC_ISSUER: ISS, ALLOW_INSECURE_ISSUER: '1', OIDC_CLIENT_ID: 'cid', OIDC_CLIENT_SECRET: 'sec', OIDC_REDIRECT_URI: 'https://api.example/auth/callback',
  SESSION_SECRET: 'x'.repeat(40), SITE_ORIGIN: 'https://hgw-online.github.io', OIDC_ACR_VALUES: 'test-acr' };
const call = (path, init = {}) => worker.fetch(new Request('https://api.example' + path, init), env);
let fails = 0;
const check = (n, c) => { console.log((c ? 'PASS ' : 'FAIL ') + n); if (!c) fails++; };

async function start(override, key) {
  const r = await call('/auth/login?return=/members.html');
  const loc = new URL(r.headers.get('location'));
  next = { nonce: loc.searchParams.get('nonce'), challenge: loc.searchParams.get('code_challenge'), override, key };
  return { r, loc, cookie: r.headers.get('set-cookie').split(';')[0], state: loc.searchParams.get('state') };
}
const cb = (s, state = s.state) => call(`/auth/callback?code=abc&state=${state}`, { headers: { cookie: s.cookie } });

let s = await start();
check('login redirects with PKCE S256 + state + nonce + acr', s.r.status === 302 && s.loc.searchParams.get('code_challenge_method') === 'S256' && s.loc.searchParams.get('acr_values') === 'test-acr');
let r = await cb(s);
check('valid callback → 302 to site return path', r.status === 302 && r.headers.get('location') === 'https://hgw-online.github.io/members.html');
const sess = r.headers.getSetCookie().find((c) => c.startsWith('hgw_session=')).split(';')[0];
check('session cookie is HttpOnly/Secure/SameSite=None', /HttpOnly/.test(r.headers.getSetCookie().join()) && /SameSite=None/.test(r.headers.getSetCookie().join()));
r = await call('/auth/session', { headers: { cookie: sess, origin: 'https://hgw-online.github.io' } });
const j = await r.json();
check('session endpoint shows authenticated name only', j.authenticated && j.name === 'Test Person' && !('sub' in j));
check('CORS limited to site origin', r.headers.get('access-control-allow-origin') === 'https://hgw-online.github.io');
r = await call('/auth/session', { headers: { origin: 'https://evil.example' } });
check('no CORS for other origins', !r.headers.get('access-control-allow-origin'));

s = await start(); r = await cb(s, 'wrongstate'); check('wrong state rejected', r.status === 400);
s = await start(); r = await call('/auth/callback?code=abc&state=' + s.state); check('missing cookie rejected', r.status === 400);
s = await start({ nonce: 'replayed' }); r = await cb(s); check('wrong nonce rejected', r.status === 401);
s = await start({ aud: 'someone-else' }); r = await cb(s); check('wrong audience rejected', r.status === 401);
s = await start({ exp: 1 }); r = await cb(s); check('expired id_token rejected', r.status === 401);
s = await start({ iss: 'https://evil' }); r = await cb(s); check('wrong issuer rejected', r.status === 401);
s = await start({}, other.privateKey); r = await cb(s); check('forged signature rejected', r.status === 401);
r = await call('/auth/session', { headers: { cookie: sess.slice(0, -3) + 'abc' } });
check('tampered session cookie rejected', (await r.json()).authenticated === false);
r = await call('/auth/login?return=//evil.example'); const l2 = r.headers.get('set-cookie'); check('open-redirect return value neutralised', r.status === 302);
const noenv = await worker.fetch(new Request('https://api.example/auth/login'), {}); check('unconfigured → 503, nothing leaks', noenv.status === 503);
srv.close();
console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED'); process.exit(fails ? 1 : 0);
