# HGW — Humanity Global Welfare (bilingual static prototype)

**Status:** Demo prototype, published with GitHub Pages at <https://hgw-online.github.io/>. It is not a production commerce, banking, insurance or identity service.

## What the site contains

- Vision, philosophy and strategic goals (home page) and a site directory (`/hgw/`).
- 50+ independent section pages (commerce, protection, research, health, space infrastructure, value banks, governance), Arabic RTL / English LTR with the language choice remembered in the browser.
- Local demo shop: cart, unpaid demo checkout, order management (pending → confirmed → fulfilled, or cancelled), stock reservation/restoration, inventory alerts.
- Demo membership with a points ledger (1 point per USD of a fulfilled demo order; tier thresholds are demo values), local voting simulation with the ability to add demo proposals, and a transparency overview.
- Identity & checkout sandbox (`checkout-sandbox.html`): a purely local simulation.
- Installable PWA (manifest + service worker).

All demo records live in the visitor's browser (`localStorage`) and can be reset from the Transparency page.

## Local preview

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000/>.

## Automated checks

```bash
for f in *.js hgw/*.js; do node --check "$f"; done
```

## Not implemented (requires a backend and external contracts)

- Real identity (BankID, eIDAS / EUDI Wallet), accounts, roles and sessions
- Payment processing, bank accounts, financial ledgers, token or smart-contract operation
- Central database, backups, atomic stock reservation, audit logs
- Real governance voting or legal entity registry
- Store-published Android/iOS packages

GitHub Pages is static hosting and cannot provide any of the above by itself. Do not use the prototype for genuine commerce or to collect personal, identity or payment data.

## BankID authentication — integration plan

The header includes a **BankID information entry point only**. It does **not** authenticate anyone or claim to verify Swedish identities.

To activate:
1. Establish a contract with a BankID-authorized provider or relying-party integration partner, obtain test credentials and confirm production onboarding.
2. Deploy a secure backend with BankID authentication start/status/cancel endpoints. Store any provider certificates and secrets **server-side only**. Do not put them in GitHub Pages or client-side JavaScript.
3. Validate completed authentication **server-side** against the provider response. Use short-lived, HttpOnly, Secure, SameSite cookies for sessions, CSRF protection and rate limits; never trust a client-supplied identity or role.
4. Map the verified identity to a user account, then enforce owner/staff/vendor/shopper permissions on every server request. BankID proves identity, not organizational authorization.
5. Define GDPR retention, lawful basis, audit logs, account recovery, privacy notice and handling of personal identity numbers before production.
6. Test with provider sandbox credentials, accessibility/mobile handoff, timeout, cancellation, replay prevention and negative authorization tests.

**Do not ask for a personal identity number or BankID security code on this static site.** GitHub Pages cannot securely host the required backend.

## European electronic identity — eIDAS / EUDI Wallet plan

The **EU eID** button is an information-only entry point, not a functioning identity verification service. European eID is not one universal credential: different countries operate recognized national electronic identity schemes, and EUDI Wallet is an emerging cross-border wallet framework. Availability and relying-party onboarding vary by country and provider.

Implementation prerequisites:
1. Select an eIDAS-compatible identity broker or trusted integration and verify supported notified national eID schemes, assurance levels and EUDI Wallet compatibility.
2. Implement a secure server-side redirect/response flow using the integration's supported protocols; verify signatures, issuer, audience, state/nonce, expiration and replay protection.
3. Request only essential identity attributes, provide privacy notices and appropriate GDPR controls. Never store identity documents, private keys, or credentials in client-side code.
4. Map verified identities to accounts without assuming that an EU eID grants HGW roles; authorization must be server-side.
5. Test supported countries and wallet handoff, errors, cancellations, session expiration and account linking in a provider sandbox before production.

BankID and EU eID may share an account system, but each provider must be validated independently. Neither is live in this GitHub Pages demo.
