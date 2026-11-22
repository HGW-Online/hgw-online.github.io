# HGW global second-hand network — partner feed and commercial protocol (proposal v0.1)
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

## Net profit sharing
Product sale price goes to product seller (less agreed platform fees if lawful); vendors receive direct agreed service costs. Shared net service profit = eligible collected service revenues minus agreed direct costs, refunds, taxes and provisions. Divide the remaining distributable service profit equally only among contributing parties identified in a signed transaction-level agreement. Partners not involved do not automatically get shares. Charitable donations and restricted goods must not be treated as ordinary commercial inventory.

## Acceptance criteria
One duly authorized partner feed with documented license; a live permitted listing, buyer-side Arabic translation, at least two actual provider quotes, customs eligibility, source attribution, audit logs, tested price/takedown sync and signed revenue-sharing terms. Before these, the interface stays clearly marked DEMO.
