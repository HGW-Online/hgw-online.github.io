# HGW Circular Marketplace — deployment and operations

## Implemented
- Standalone `marketplace-live.html` with Arabic RTL, account login (magic link), public offers, seller listings, buyer inspection/shipping/buy requests, partner applications and owner-specific request dashboard.
- Public GitHub Pages page will operate in **LOCAL DEMO** unless Supabase is configured and the database migration applied.
- Static GitHub Pages cannot itself provide multi-user persistent accounts, storage, or real order processing. The backend is Supabase Auth + PostgreSQL with RLS.
- Payments, commissions, invoices, inspection guarantees, shipping booking, and automatic settlements are **NOT** live.

## Connect real backend
1. Create a **dedicated Supabase project** belonging to the correct HGW legal/admin account. Enable email OTP/magic link provider, confirm your email delivery quota and set **Site URL** to `https://hgw-online.github.io/marketplace-live.html` (add this URL to Redirect URLs). Test the email flow.
2. In Supabase SQL Editor, run `supabase/marketplace.sql` and check policies in Authentication/Database. Use development/test accounts first.
3. Put the *public* Project URL and *public anon/publishable key* in `marketplace-config.js`. These values are intentionally public; **never** add database passwords, service-role keys or private tokens to the repository.
4. Verify: A seller can publish an offer; an anonymous visitor sees published offers but not drafts; another user cannot modify the seller's listing; a buyer can submit a service request; other users cannot read that private request; partner application remains pending until reviewed manually by privileged backend.
5. Get legal review of consumer rights, GDPR controller/processor agreements, retention/deletion process, commercial insurance, taxes/VAT and applicable marketplace intermediary rules prior to collecting customer data in production.
6. Set a spending limit, backup strategy, abuse/rate limiting and monitoring. Review threat model and security audit before promoting from pilot to production.

## Business metrics to add via trusted server-side reporting
Daily: unique active buyers/sellers, approved listings, valid purchase requests, inspections requested and completed, shipping quotes, conversion rate, dispute rate, paid gross merchandise volume and realized commission revenue. Do not count demo local storage as live data. Secure aggregation with a private dashboard; never expose other customers' transactions.

## Security limitations
- Partner authentication verifies only email ownership; it does not independently verify the business, professional credentials, identity, insurance, or licenses.
- RLS blocks unauthorized row reading/writing when database setup is correct. Nevertheless deploy only after a proper privacy/security assessment.
- A partner application **is not approval**. Requests are private to the requester. Matching/quoting, admin workflows, shipping APIs and payments require separate reviewed backend services.
- No public or private API keys/secrets should be committed beyond the explicitly public anon config.
