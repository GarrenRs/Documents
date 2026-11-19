# 08 — Feature reuse / repair / build / remove matrix

**Assessment date:** 2026-11-20.
**Mode:** Decision-support matrix only. No source, template, CSS, JS, database, schema, data, dependency, authentication, configuration, billing, deployment, or external-send change was made.
**Basis:** Fresh four-interface evidence, notification trace, ANAE/FX official-source research, and reconciliation with prior `AUDIT/`, `DISCOVERY/`, and `PRODUCT_RECONSTRUCTION/` conclusions.

---

## Evidence conventions

| Label | Meaning |
| --- | --- |
| `VERIFIED FACT` | Directly observed in source, templates, data, documentation, or controlled runtime/browser evidence. |
| `OWNER-PROVIDED CONTEXT` | Supplied by the product owner; not independently verified as an implementation fact. |
| `DOCUMENTED INTENT` | Explicitly stated in existing documentation or product-facing copy. |
| `INFERENCE` | Reasoned interpretation supported by evidence. |
| `STRATEGIC PROPOSAL` | Decision recommendation only; not an existing capability and not authorization to implement. |
| `UNKNOWN` | Insufficient evidence. |

**Decision meanings:**
- **Reuse** — preserve the product idea/UX as a design reference; do not assume current code is safe to reuse unchanged.
- **Repair** — keep the capability but correct verified defects or governance gaps before it can support the owner vision.
- **Build** — required or strongly indicated by the owner vision but not implemented in the current product.
- **Remove** — do not carry forward into the target product; where absent, keep explicitly excluded.

---

## 1. Matrix

| # | Feature / capability | Evidence | Owner-vision relevance | Decision | Rationale | Label |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | Public landing and informational pages | `/`, `/about`, `/verification`, `/standards`, `/mastery`, `/privacy`, `/terms`, `/security-audit` all render; positioning copy is explicit. | Public Academy trust and philosophy layer. | **Reuse** | Preserve the proof-of-work, anti-marketplace, anti-bidding, anti-social positioning and information architecture. | `VERIFIED FACT` / `STRATEGIC PROPOSAL` |
| 2 | Public profile and project/case-study presentation | Profiles and project detail render; fresh confirm captures show identity, skills, case studies, inquiry CTA. | Public Professional Wallet core. | **Reuse** | Strongest product identity; preserve as design/UX reference, subject to repairs below. | `VERIFIED FACT` |
| 3 | Six visual themes | Luxury Gold, Modern Dark, Clean Light, Terracotta Red, Vibrant Green, Silver Grey; `silver-grey` persisted live. | Differentiated professional presentation. | **Reuse** | Verified working presentation vocabulary; “Silver” is a theme, not a plan. | `VERIFIED FACT` |
| 4 | Structured inquiry taxonomy and form UX | Public inquiry persisted; fields include request type, interest area, seriousness, preferred contact, message. | Direct professional inquiry without marketplace drift. | **Reuse** | Preserve the interaction model; delivery and storage discipline handled in repair rows. | `VERIFIED FACT` |
| 5 | Public directory / catalog | `/catalog` renders placeholder `Our directory is currently being prepared.` | Discovery of ANAE digital professionals. | **Build** | No populated directory exists; prior reconstruction deferred it, but the four-interface vision needs a discovery decision. | `VERIFIED FACT` / `STRATEGIC PROPOSAL` |
| 6 | Public wallet SEO and mobile presentation | SEO metadata null; mobile overflow `446 > 390`; landing overflow `402 > 390`. | Shareable professional identity and future QR-card destination. | **Repair** | Blocks credible public sharing, search, and mobile QR journeys. | `VERIFIED FACT` |
| 7 | Project-detail interaction | Page renders content but throws `TypeError: Cannot read properties of null (reading 'addEventListener')` at `static/js/script.js:25:17`. | Case-study evidence experience. | **Repair** | Runtime page error must be resolved before wallet presentation can be trusted. | `VERIFIED FACT` |
| 8 | Member identity/about/skills/projects CRUD | Live edits changed JSON and public profile reflected them. | Private Workspace core. | **Repair** | Working loop, but observed JSON-only persistence lacks the transactional governance needed for a professional environment. | `VERIFIED FACT` |
| 9 | Admin user directory and verification controls | Directory renders synthetic users and verification/demo state. | Governance and ANAE review foundation. | **Repair** | Useful primitive, but verification criteria and audit basis are not ANAE-aligned. | `VERIFIED FACT` / `INFERENCE` |
| 10 | Admin settings and backup surfaces | Settings shows Themes/Notifications/Backups; direct Telegram/SMTP GETs are 405; prior audit found backup access concerns. | Governance and operational trust. | **Repair** | Keep the functions, but require restricted access, audited actions, and safe credential handling. | `VERIFIED FACT` |
| 11 | Telegram/SMTP sender code | Multiple send paths; responses discarded; no retry/queue/dedupe/audit. Owner reports operational use. | Connected external platforms. | **Repair** | Code exists and may work operationally, but delivery state is unprovable and no durable record exists. | `VERIFIED FACT` / `OWNER-PROVIDED CONTEXT` |
| 12 | Notification outbox, retry, and delivery record | No queue/outbox/retry/dedupe/delivery status found; in-app is 30s poll. | Professional environment needs reliable communication. | **Repair** | Required to distinguish persistence, attempt, provider acceptance, and receipt. | `VERIFIED FACT` |
| 13 | Sitemap and robots | Both return 200; sitemap used isolated origin; prior audit identified latent invalid `/project/<id>` path. | Public discoverability. | **Repair** | Correct host/canonical policy and route targets before production use. | `VERIFIED FACT` |
| 14 | Registration / onboarding | `/register` returns HTTP 500. | Any future ANAE professional onboarding. | **Repair** | Broken path must be fixed or replaced under an explicit onboarding design. | `VERIFIED FACT` |
| 15 | Security baseline | No CSRF, permissive CSP, insecure cookie/debug defaults from prior audit; unauthenticated notification poll returned 200. | Trust prerequisite for ANAE professionals. | **Repair** | Cannot be deferred in a professional work environment handling identity and inquiries. | `VERIFIED FACT` |
| 16 | Dual JSON + SQL persistence | Public inquiry dual write observed; prior audit found no transaction across stores. | Data integrity for public identity and private workspace. | **Repair** | Move toward one authoritative transactional store; JSON becomes migration input only if owner approves. | `VERIFIED FACT` |
| 17 | Academy content and enablement operations | Public standards pages exist; admin search found no announcement/course/lesson/academy-content/broadcast controls. | Academy/enablement pillar. | **Build** | Owner vision requires an operational Academy layer; exact scope remains an owner decision. | `VERIFIED FACT` / `OWNER-PROVIDED CONTEXT` |
| 18 | ANAE profile, activity code, and evidence states | No ANAE fields or flow found; official catalogue provides activity codes. | Core target-segment definition. | **Build** | Must tie to official codes/labels and owner-controlled review; no ANAE endorsement assumed. | `VERIFIED FACT` / `STRATEGIC PROPOSAL` |
| 19 | QR identity card / QR destination | QR appears in official ANAE card framework; no product QR implementation found. | Owner-specified future capability. | **Build** | Treat as future scope with official-boundary and authorisation decisions; public wallet must first be mobile/SEO ready. | `VERIFIED FACT` / `OWNER-PROVIDED CONTEXT` |
| 20 | Arabic/English and RTL readiness | No `lang="ar"`, `dir="rtl"`, or Arabic strings found; confirm metadata shows `lang="en"`, `dir=""`. | Explicit owner requirement. | **Build** | Requires locale, content, and RTL design decisions; not a cosmetic edit. | `VERIFIED FACT` / `OWNER-PROVIDED CONTEXT` |
| 21 | External-platform connectors | Telegram/SMTP code only; no connector framework, OAuth/webhook registry, or credential vault found. | Explicit owner requirement. | **Build** | Needs platform list, compliance review, provider-agnostic boundary, and connection-state audit. | `VERIFIED FACT` / `OWNER-PROVIDED CONTEXT` |
| 22 | Internal member-to-member / member-admin messaging as-is | Threads persist, non-participant view is denied, but archive hard-deletes root and orphans replies; prior reconstruction rejected the model. | Not explicitly required by current owner vision. | **Remove** | Do not carry forward defective semantics. Replace only with a governed model the owner approves. | `VERIFIED FACT` / `STRATEGIC PROPOSAL` |
| 23 | General CRM/client pipeline language | `/dashboard/clients` shows `Strategic Partnerships`, `PENDING PIPELINE`, `CAPITAL VALUE $0.00`; prior reconstruction rejected general CRM. | Would reduce product to generic CRM; conflicts with identity. | **Remove** | Remove general pipeline framing. Any client/contact data must be subordinated to professional proof and inquiry, not become a CRM product. | `VERIFIED FACT` / `STRATEGIC PROPOSAL` |
| 24 | Demo mode in production product | Demo writes allowed; `Training Phase Active` plus `Project added successfully` observed. | Useful only for isolated training/demonstration, not the ANAE product. | **Remove** | Keep synthetic/demo capability only in isolated evaluation environments, never as a production entitlement state. | `VERIFIED FACT` / `STRATEGIC PROPOSAL` |
| 25 | Dead subscription mockup, obsolete guides, broken documentation target | Prior audit found dead `subscription.html` with missing `payment` endpoint; `/documentation` 404; Telegram guides are legacy. | Distracts from Academy identity and may imply unsupported pricing/payment. | **Remove** | Do not reuse rejected prices, dead payment mockups, or obsolete documentation as product surface. | `VERIFIED FACT` |
| 26 | Financial wallet, ledger, payout, FX, or crypto settlement features | No such concept exists; regulatory research creates strong boundaries. | Explicitly outside intended product identity. | **Remove** | Keep explicitly excluded. Do not represent Codexx as a financial wallet or as satisfying repatriation. | `VERIFIED FACT` / `STRATEGIC PROPOSAL` |

---

## 2. Decision totals

| Decision | Count | Rows |
| --- | ---: | --- |
| Reuse | 4 | 1–4 |
| Repair | 11 | 6–16 |
| Build | 6 | 5, 17–21 |
| Remove | 5 | 22–26 |
| **Total** | **26** | 1–26 |

`VERIFIED FACT:` The totals are derived from the matrix rows above.

---

## 3. Interpretation

`INFERENCE:` The current product has a strong **presentation core** and a weak **governance/integration core** for the owner’s vision. Reuse should therefore concentrate on product vocabulary and UX patterns, while repair/build work concentrates on trust, verification, bilingual readiness, integration evidence, and communication governance.

`STRATEGIC PROPOSAL:` Priority order for owner consideration:
1. repair public wallet presentation and core security/data integrity;
2. define and govern Academy scope;
3. define ANAE verification and activity-code policy;
4. decide the communication model;
5. plan Arabic/RTL and QR identity work;
6. select external platforms and compliance boundaries;
7. only then consider public directory/discovery expansion.

`UNKNOWN:` Owner decisions on Academy scope, ANAE evidence standard, QR timing, platform list, communication model, and commercial packaging remain open.

**Status:** Matrix complete for owner review. No implementation authorized or performed.
