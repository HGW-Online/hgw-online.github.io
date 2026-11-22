# HGW — Transaction-Scoped Compliance Activation Matrix (design v0.1)

## Principle
Replace promises of "compliance with all the world's laws" with a **versioned, transaction-scoped jurisdictional compliance matrix**. The platform does NOT need branches in every country. Expand through qualified, independently licensed local partners in the priority markets. Applicable jurisdictions and conflicts are expected input, not design defects.

This is architecture, not a representation that up-to-date law or a licensed legal assessment has been completed. No jurisdiction below is designated "approved".

## Minimum mandatory profile per applicable jurisdiction
Record as an evidence-backed policy, not an unverified boolean:
- **Registration:** whether HGW/partner needs local business registration, tax/VAT/GST registration, representative or establishment; availability of an authorized foreign-provider alternative.
- **Licensing:** required broker/agent, insurer, guarantee, shipping, customs, lending, real estate, commodities, payments, securities or cryptoasset licenses; which legal entity/licensed partner carries each regulated role.
- **Identity:** when KYC/KYB, beneficial-owner identification, customer due diligence, sanctions/AML, transaction monitoring and enhanced checks apply; identity must be risk- and activity-scoped rather than always requiring full identity for browsing.
- **Consumer:** seller disclosures, advertising, contract language, pre-contract information, withdrawal/returns/warranties, unfair terms, refunds, disputes, privacy and personal-data rules.
- **Product/transfers:** import/export eligibility, customs, controls, food/energy safety, ownership/registration, securities and cryptoasset classifications.

## Rule record schema
Each policy rule must have:
`rule_id, rule_version, jurisdiction_code, jurisdiction_level (country/state/region), activity, counterparty_role, asset_category, transaction_phase, payment_type, service_type, applicability_conditions, requirement_type, required_action, evidence_uri, authority, valid_from, reviewed_at, review_due_at, owner, status (draft/reviewed/approved/revoked), blocking (boolean), conflict_tags, exception_authority, audit_hash`.
Do not insert real credentials or personal KYC documents in a public repo.

## Activation algorithm
1. Browse-only flow: use relevant platform, marketing, privacy and listing rules. No unnecessary financial KYC for an anonymous reader. Record target countries where content is marketed.
2. When buyer requests a quote or contract, resolve all relevant jurisdictions **independently**: seller establishment, buyer residence, location/title of goods, physical origin/destination, provider location, payment route, fulfillment, applicable market targeting, contract governing law. Do NOT infer that law chosen in a contract displaces mandatory local rules.
3. Classify service as mere introduction vs agent/intermediary vs regulated payment/insurer/guarantor/lender/exchange. Use product type and buyer/seller type to activate country-, state- and category-specific rules.
4. Fetch a *versioned, reviewed* policy bundle for each jurisdiction. Require minimum profile: registration, licensing, identity, consumer rules and product restrictions. If absent, expired or inconclusive, mark `HOLD_REVIEW` and block checkout, settlement and binding pledges.
5. Combine cumulative requirements where compatible. If one jurisdiction prohibits while another permits, the prohibited path blocks transaction until an authorized alternative legal route is validated. Never override consumer mandatory protection, sanctions or product bans by choosing a permissive jurisdiction. For contradictory requirements, route to qualified counsel, not auto-resolve.
6. Select qualified local **licensed partners** for regulated roles; verify licenses with issuing authority where possible, expiration, geographic scope, and any change notices.
7. Record effective policy versions, rationale, participating country rules, evidence, customer consent and immutable audit events for each transaction. Re-evaluate after material changes in counterparties, products, route or payment instruments.
8. Only emit `ELIGIBLE_FOR_NEXT_STEP` once each required rule and partner has been independently verified and a responsible human/compliance approver has signed off. Status must not imply HGW guarantees the transaction.

## Fail-closed states
- `INFORMATION_ONLY`: browse, no transaction commitment.
- `HOLD_REVIEW`: unknown, conflicting, expired or not-reviewed rule/evidence; quote display may be illustrative only.
- `BLOCKED`: prohibited trade, sanctions, license missing, not legally eligible.
- `ELIGIBLE_FOR_NEXT_STEP`: reviewed and licensed workflow can proceed, not final legal guarantee.
No automatic allowance on unknown legal status; no arbitrary appeal bypass.

## Partner registry
Per entity: `partner_id, jurisdiction, registered_company_name, regulator, license_category, license_number (non-secret), verification_source, license_valid_until, service_area, permissions, data_protection_contract, insurance_scope, due_diligence_status, last_reviewed, complaint_contact`.
Do not portray any partner as verified/licensed until independent checks are recorded.

## Priority market lanes (illustrative, unverified)
- Sweden / EU ↔ Egypt: used-goods cross-border transactions and import eligibility, export documentation, currency and consumer issues.
- Sweden / EU ↔ Gulf: customs, product restrictions, agency, e-commerce and financial settlement variations.
- Sweden / EU ↔ US: federal + state-level obligations, importer, tax and payment roles.
- Other routes: `HOLD_REVIEW` until a complete minimum jurisdiction profile and qualified local partner availability are established.
These are **routing scenarios, not legal conclusions or a complete current legal matrix**.

## Operational tests
- Unknown jurisdiction -> HOLD_REVIEW.
- Prohibited good in destination -> BLOCKED.
- Licensed local partner missing -> HOLD_REVIEW/BLOCKED as law requires.
- Contradictory obligations -> HOLD_REVIEW until legally reconciled.
- Expired source policy -> HOLD_REVIEW.
- Privacy laws require minimization -> don't collect unnecessary identity.
- Mid-transaction country/service changes -> recompute applicability and invalidate stale approval.
- Completion -> only success-commission after contractually confirmed success.

## Knowledge and intellectual-property asset rules
For patent, algorithm, software, know-how, trade secret, copyright or other IP deals, activate applicable seller/owner and buyer jurisdictions, the scope of territorial protection, assignment/registration formalities, co-owner or employer consent, royalty/tax obligations, export restrictions for sensitive technology, confidentiality obligations, and legally required IP security-interest registration for collateral. Require independently documented chain of title and existing license/encumbrance checks. Keep proprietary algorithms, unreleased inventions, source code and secret data outside public listing payloads. Unknown/contested ownership -> HOLD_REVIEW; legally prohibited transfer -> BLOCKED.
