# HGW global circular cooperative commercial agency — partner feed and operating protocol (proposal v0.2)
**Not a signed agreement. No actual partner listing data imported or licensed; no live quote engine.**

## Business model
HGW is a cross-border coordinator and marketplace aggregator, not buyer or inventory owner. Partners retain goods, control listings, and determine availability until the sale. All syndication requires a specific written license/contract. The HGW model avoids capital tied in stock, but still incurs operating expenses, service liabilities, chargeback/consumer risks, regulatory and insurance risks. No claim of zero risk.

## Source marketplace feed
Licensed API, signed CSV/SFTP export or authorized manual listing. No unauthorized scraping or use of Blocket Pro Import API as an export channel (official API documentation states it is for managing ads on Blocket/Bytbil, not powering other sites).
Track partner_id, license_id, original_listing_id, canonical_url, original-language title/description, translation provenance, original price/currency, photo rights, seller country, condition, availability, last_updated_at, permitted destinations, delist flag, sale status, legal restrictions. Sync deletions and prices promptly. Never display content if permissions are withdrawn.

## Buyer landed cost
Present independent line items: source item price, pickup, inspection, international freight, insurance, duties, VAT and fees, customs broker, last-mile delivery, HGW service charge, other known costs. Every quote carries provider, currency, exchange-rate source/time, quote time, expiry, scope, incoterm, tax basis, estimated/confirmed status. Don't label a total final until actual vendor quotes and regulatory eligibility are verified. For Egypt used cars, assess product-specific import eligibility under applicable current Egyptian rules before displaying purchase availability.

## Service flow
Buyer selects authorized item -> requests inspection -> source seller confirms availability -> inspection provider submits quote -> freight forwarder supplies route and dimensions -> customs broker verifies import/export and tariff -> insurer offers coverage -> buyer sees transparent estimated landed cost -> buyer authorizes steps -> regulated payment/escrow provider, if later integrated, handles funds -> delivery proof and dispute/refund processes.

## Cooperative / commercial-agency structure
HGW is a commercial agent or proposed global platform cooperative, not a reseller, importer of record by default, lender, warehouse operator or inventory acquirer. External inspection, shipping, customs clearance, last-mile delivery and insurance are **optional and unbundled** unless a particular transaction legally requires a step. A buyer may select their own qualified providers; HGW cannot guarantee imported goods' legal eligibility simply by listing them.

## Revenue and incentive waterfall
1. Record platform-collected gross revenues (commissions, optional coordination/service fees and other lawful agreed amounts). Do not include third-party seller gross sales, charity donations, or pass-through funds as platform-owned revenue.
2. Pay/refund applicable amounts, operating expenditures, legally required taxes and liabilities, direct costs, dispute provisions and risk reserve.
3. Determine the legally and financially distributable *surplus*, not raw gross revenue. If negative, do not pay incentives.
4. Allocate surplus between **special incentives** (individual/institution, measurable transaction contribution) and **general incentives** (all eligible workers/members, measured by published digital performance indicators).
5. Incentive formulas and percentage split must be voted and approved in the cooperative's adopted bylaws. Example 50/50 on website is demo only; real scheme needs living-wage, worker rights, legal entity, fairness, audit, conflict-of-interest and tax review.
6. Avoid double counting, manipulated trades, conflicts, or penalizing low-volume essential roles. Indicators may include fulfilled deals, quality, dispute resolution, verified reuse effect, job safety and customer satisfaction; decisions must be contestable.

## Equal direct and liquid democratic governance — proposed, not deployed
- All admitted stakeholder groups have equal representation in the constitutional architecture. Individual memberships get equal base vote irrespective of wealth. Institutions must be represented so an individual cannot vote twice through a legal entity; membership categories and voting chamber structure require legal review.
- Direct votes or revocable delegation to trusted representatives; one ballot counted per eligible member per resolution. Cycles and withdrawal handled by a tested protocol.
- Public aggregate results, rule changes, proposals, meeting minutes and material budget decisions. Protected personal identifiers, vote privacy, anti-coercion measures, verifiable cryptographic commitments and independent external audit; *no live encrypted voting exists yet*.
- Clear quorum, majority, minority protection, appeal, term lengths, conflict rules, and independent privacy/data policy. Financial ownership and governance control may have distinct regulatory constraints.

## Acceptance criteria
One duly authorized partner feed with documented license; a live permitted listing, buyer-side Arabic translation, at least two actual provider quotes, customs eligibility, source attribution, audit logs, tested price/takedown sync and signed commercial-agency and democratic governance principles where applicable. Before these, the interface stays clearly marked DEMO.
