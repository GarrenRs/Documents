# 09 — Architecture and commercial impact

**Assessment date:** 2026-11-20.
**Mode:** Read-only reassessment of prior architecture decisions against the owner-clarified Academy/ANAE vision. No source, schema, data, dependency, configuration, billing, deployment, or external-send change was made.
**Companion evidence:** `01`–`08`, `evidence/results/official_source_research.md`.

---

## Evidence conventions

| Label | Meaning |
| --- | --- |
| `VERIFIED FACT` | Directly observed in source, templates, data, documentation, or controlled runtime/browser evidence. |
| `OWNER-PROVIDED CONTEXT` | Supplied by the product owner; not independently verified as an implementation fact. |
| `DOCUMENTED INTENT` | Explicitly stated in prior decision documents or product-facing copy. |
| `INFERENCE` | Reasoned interpretation supported by evidence. |
| `STRATEGIC PROPOSAL` | Decision recommendation only; not an existing capability and not implementation authorization. |
| `UNKNOWN` | Insufficient evidence. |

---

## 1. Executive reconciliation

`OWNER-PROVIDED CONTEXT:` The intended product is a professional digital work environment for Algerian ANAE self-employed digital professionals, with four interfaces, Academy/enablement, external platform connections, Arabic/English readiness, and future QR identity cards.

`VERIFIED FACT:` Prior `PRODUCT_RECONSTRUCTION/` selected **Option A′: server-rendered Flask modular monolith**, one relational database, Alembic, no React SPA, no public REST API in v1, one web pool plus one background worker, CSRF, wallet-scoped authorization, entitlement boundary, and removal of unsafe legacy paths.

`INFERENCE:` Option A′ should not be blindly reused as-is, because its product definition was a paid customer-owned professional wallet under a prior mandate. The current brief changes the market, identity, content, locale, verification, QR, and external-connector scope.

`STRATEGIC PROPOSAL:` Reaffirm Option A′ **as a technical substrate**, but re-scope its product boundaries around the four-interface ANAE environment. React/API/microservices remain unnecessary for the evidenced use case.

---

## 2. What remains technically valid

| Prior decision / finding | Current status | Basis |
| --- | --- | --- |
| Single Flask web application is over-concentrated: `app.py` 3,570 lines, 72 routes. | Valid problem statement | Fresh source baseline; prior AUDIT re-confirmed. |
| No Blueprints/factory/services/repositories/tests/migrations. | Valid problem statement | Fresh AST/source review. |
| Dual `data.json` + SQL persistence with no transaction boundary. | Valid problem statement | Live inquiry dual write; prior AUDIT. |
| No CSRF; permissive CSP; insecure cookie/debug defaults. | Valid problem statement | Prior AUDIT; fresh unauthenticated poll probe. |
| Public pages are SSR/content-oriented; workspace is form/table CRUD. | Valid architecture premise | Live UI evidence. |
| No need for React/SPA in v1. | Conditionally valid | No rich interactive designer requirement evidenced; SSR and minimal JS suffice for observed workflows. |
| No public REST API in v1. | Conditionally valid | No external consumer requirement evidenced; internal JSON endpoints can remain narrow. |
| One relational database and migrations. | Valid direction | Needed for integrity and governance; exact schema is an owner-approved future decision. |
| One background worker for delivery/backups. | Valid direction | Needed for outbox/retry/delivery state; not implemented here. |
| Remove unsafe internal messaging, demo mode, dead subscription mockup, GET mutations. | Mostly valid, with one open scope question | Defects are verified; the owner has not yet defined the target communication model under the new vision. |
| Arabic/RTL as v1 requirement. | Reaffirmed | Owner vision explicitly includes Arabic/English readiness; source has zero support. |

---

## 3. What must be reconsidered

| Prior assumption | Reconsideration required |
| --- | --- |
| Product = paid, customer-owned professional wallet. | Product = ANAE professional digital work environment with four interfaces; wallet means professional identity/presentation, not finances. |
| Initial customer = individual professional in generic sense. | Initial segment = Algerian ANAE-registered digital/IT auto-entrepreneur tied to official activity codes. |
| Public wallet + private workspace are the main surfaces. | Add operational Academy/enablement layer and governance around it. |
| Communication = one-way admin announcements only. | Still a strong proposal, but owner must decide between announcements, inquiry-only, or a scoped professional channel. |
| Entitlements/Plans at commercial boundary. | Packaging remains possible, but prices, provider, lifetime terms, and plan names are `UNKNOWN`; do not reuse dead mockup values. |
| Arabic/RTL is a technical workstream. | It is also a content-ownership and review workstream; owner must name responsible parties. |
| Backup concept preserved from legacy. | Must be scoped with restricted access, encryption, and restore verification; prior audit found unsafe backup access. |
| No catalog in v1. | Current four-interface vision needs a public discovery decision; catalog should not be silently dropped or silently enabled. |
| No external connector framework. | Owner now explicitly requires external platform connections; platform list and compliance review are open. |

`INFERENCE:` The technical architecture can remain simple; the product architecture must expand to include verification, Academy, locale, QR-identity, and connector boundaries.

---

## 4. Re-scoped logical architecture

`STRATEGIC PROPOSAL:` Use the following logical boundaries in any future, owner-approved phase. This is a product-architecture recommendation, not an implementation plan.

| Logical boundary | Responsibility | Evidence-driven requirement |
| --- | --- | --- |
| Public Academy interface | Landing, standards, information, Academy contact, public discovery. | Preserve positioning; repair documentation/catalog/SEO; define Academy content operations. |
| Public Professional Wallet interface | Public identity, case studies, skills, inquiry, CV preview, future QR destination. | Repair mobile/SEO/project error; add Arabic/RTL and ANAE evidence display only under policy. |
| Private Workspace interface | Member identity, proposition, competencies, gallery, contact, governed communication, preferences. | Keep private editing loop; remove general CRM framing and unsafe messaging semantics. |
| Administration interface | User governance, verification review, Academy publishing, announcements, settings, backups, audit. | Current admin is partial; no Academy controls found; verification needs ANAE evidence rules. |
| Identity and access | Session authentication, role/policy checks, owner-scoped data, secure cookies, CSRF. | Prior audit defects and current unauthenticated poll probe. |
| Verification / ANAE | Activity-code self-declaration, evidence records, review decisions, badge state, audit basis. | Official ANAE catalogue and owner target segment; no endorsement assumed. |
| Messaging / inquiry | Public inquiries, governed announcements, read/response state, thread semantics if approved. | Inquiry works; internal threads persist but archive is defective; communication model open. |
| Notification / outbox | Durable event records, retry, dedupe, provider attempts, acceptance, delivery state. | No existing outbox; external delivery unproven. |
| Localization / RTL | Arabic/English strings, direction, content ownership, RTL design review. | Source has zero Arabic/RTL; owner requires it. |
| External connectors | Adapter boundary for selected platforms, credentials outside app data, connection/delivery status. | Only Telegram/SMTP source paths exist; platform list open. |
| Governance / audit | Admin action log, verification decisions, publishing, backup/restore records. | Needed for professional trust and migration safety. |
| Data boundary | One relational source of truth, transactional writes, migration from legacy data if approved. | Dual JSON/SQL store is a verified integrity risk. |

`INFERENCE:` This boundary set preserves the simplicity of a modular monolith while giving the new product scope explicit homes.

---

## 5. Commercial impact

### 5.1 Value proposition shift

`VERIFIED FACT:` Current product value is proof-of-work presentation, private editing, direct inquiry, admin governance, and themes.

`OWNER-PROVIDED CONTEXT:` Desired value is a professional digital work environment for ANAE digital self-employed professionals with Academy enablement and external platform connectivity.

`STRATEGIC PROPOSAL:` The commercial story should rest on:
1. **Professional identity** — a credible public wallet of real work.
2. **ANAE-aligned positioning** — official activity vocabulary and owner-controlled review states.
3. **Private execution** — members manage their professional material before publishing.
4. **Direct inquiry** — no bidding, marketplace, or paid exposure.
5. **Academy enablement** — standards and guidance for better proof and professional practice.
6. **Bilingual readiness** — Arabic/English as a market requirement, not an afterthought.
7. **Governed trust** — audited verification, communication, and delivery states.

`INFERENCE:` The narrower ANAE segment increases credibility and focus, but also increases the cost of unsupported claims. ANAE endorsement, FX compliance, or QR authority must never be implied without evidence.

### 5.2 Packaging implications

`VERIFIED FACT:` Prior reconstruction proposed Base/Starter, Professional, and deferred Business packaging but explicitly stated no prices were invented and owner decisions were required.

`UNKNOWN:` Prices, billing provider, plan names, custom-domain policy, lifetime terms, refund policy, grace period, and Academy-content ownership.

`STRATEGIC PROPOSAL:` Do not reuse the dead subscription mockup or its hardcoded figures. Packaging should be decided after product scope and compliance boundaries are approved.

`STRATEGIC PROPOSAL:` Avoid packaging that monetises “paid exposure”, ranking, bidding, or client brokering; these conflict with verified public copy.

### 5.3 Regulatory-commercial boundary

`VERIFIED FACT:` Official-source research found no official Algerian approval evidence for RedotPay or Grey; PSP accounts are DZD-only and domestic; crypto-linked virtual-asset activity is prohibited under Loi 25-10 Art. 6 bis with product-specific application `UNKNOWN`.

`STRATEGIC PROPOSAL:` Commercial materials must not promise FX conversion, USD balances, offshore receipts, bank partnership, repatriation compliance, or crypto settlement.

`STRATEGIC PROPOSAL:` Academy content may reference official rules with dates and disclaimers, but must not provide individualized legal/tax/banking advice.

---

## 6. Risk and impact register

| Risk | Evidence | Commercial impact | Proposed treatment | Label |
| --- | --- | --- | --- | --- |
| ANAE endorsement misrepresentation | No partnership evidence; directory 503. | Trust and legal/reputational damage. | Explicit “independent platform” language; official-source references only. | `VERIFIED FACT` / `STRATEGIC PROPOSAL` |
| Product-scope creep into LMS/CRM/marketplace | No LMS; CRM language present; anti-marketplace copy explicit. | Diluted identity and higher cost. | Use matrix `08` as scope gate; owner sign-off. | `VERIFIED FACT` / `INFERENCE` |
| Arabic/RTL absence | Source and confirm metadata. | Excludes target audience; damages credibility. | Treat as first-class locale/content workstream. | `VERIFIED FACT` |
| Mobile/SEO defects | Wallet overflow `446 > 390`; null metadata. | Broken sharing/QR destination. | Repair before public scaling. | `VERIFIED FACT` |
| Notification delivery unproven | No outbox/receipt; owner report unverified. | Support burden and trust loss. | Durable delivery states and provider records. | `VERIFIED FACT` / `OWNER-PROVIDED CONTEXT` |
| Legacy data integrity | Dual JSON/SQL store. | Incorrect public identity or message state. | One transactional store; validated conversion if approved. | `VERIFIED FACT` |
| Security defects | No CSRF; permissive CSP; insecure defaults. | Professional identity risk. | Security baseline before expansion. | `VERIFIED FACT` |
| FX/provider claims | No RedotPay/Grey approval evidence. | Misleading financial claims. | Exclude financial-wallet and compliance claims. | `VERIFIED FACT` / `UNKNOWN` |
| Academy content ownership open | No content admin controls found. | Owner dependency blocks launch. | Owner must name content owner and review process. | `VERIFIED FACT` |
| External connector ambiguity | Only Telegram/SMTP code. | Unbounded scope. | Owner selects platform list and compliance criteria. | `VERIFIED FACT` / `UNKNOWN` |

---

## 7. Decision gates

`STRATEGIC PROPOSAL:` No implementation should begin until the owner decides:

1. Approve the four-interface ANAE professional-environment identity statement.
2. Reaffirm or revise Option A′ as the technical substrate.
3. Define Academy scope: standards/enablement only, or include courses/lessons/progress/certificates.
4. Define ANAE verification and activity-code policy.
5. Decide QR identity-card timing and authority boundaries.
6. Name Arabic/RTL content owners and reviewers.
7. Select external platforms and require compliance review.
8. Decide the communication model replacing defective internal threads.
9. Confirm no financial wallet, payout, FX, or crypto features.
10. Decide commercial packaging inputs: plans, pricing, provider, domains, terms, refunds, and grace period.
11. Approve any implementation phase explicitly.

---

## 8. Bottom line

`INFERENCE:` The prior architecture choice remains the right **technical shape**: a server-rendered modular Flask monolith with one database and a worker is simpler and better matched to the evidence than React, microservices, or a public API. What changes is the **product contract**: ANAE targeting, Academy enablement, bilingual/RTL readiness, QR identity, governed verification, and external connectors.

`STRATEGIC PROPOSAL:` Approve a re-scoped Option A′ only as an owner decision. Keep the technical simplicity; expand the product boundaries deliberately; do not implement before approval.

**Status:** Architecture and commercial-impact reconciliation complete. No implementation performed; no settings changed; no push requested.
