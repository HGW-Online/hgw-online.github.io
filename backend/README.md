# HGW identity backend (Signicat OIDC)

A small Cloudflare Worker that signs users in through Signicat (Swedish BankID, EU eIDs) using OpenID Connect
authorization code flow with PKCE, state, nonce and full ID-token validation. It stores no personal identity number:
the session cookie holds only `sub` and a display name and expires after 1 hour.

## Endpoints
`GET /auth/login?return=/path` · `GET /auth/callback` · `GET /auth/session` · `POST /auth/logout`

## What you must do in Signicat (cannot be done from code)
1. Contract with Signicat and create an OIDC client; enable the BankID / eID methods you need.
2. Register the redirect URI `https://<your-api-host>/auth/callback`.
3. From the Signicat dashboard/documentation copy: the **issuer URL** (the base that serves `/.well-known/openid-configuration`), the **client id/secret**, and the **acr_values** for each method you want to force (verify against their docs; they are not hard-coded here).

## Deploy
```
cd backend
npx wrangler secret put OIDC_CLIENT_SECRET
npx wrangler secret put SESSION_SECRET      # 32+ random characters
# set OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_REDIRECT_URI, OIDC_ACR_VALUES in wrangler.toml [vars]
npx wrangler deploy
```
Then put the Worker URL in `/auth-config.js` (`window.HGW_AUTH_BASE`). Use a subdomain of your own domain so cookies are first-party.

## Test
`node test.mjs` (mock identity provider; checks PKCE, state, nonce, issuer, audience, expiry, forged signature, CORS, open redirect).

## Still required before real use
Privacy notice and GDPR lawful basis, server-side authorization for any protected action (identity ≠ permission), rate limiting, monitoring.
