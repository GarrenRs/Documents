# PRODUCT VISION — Codexx Wallet

**Document class:** Product-definition decision record (not a technical specification).
**Decision authority:** Product owner. This document records the mandated product identity and the decisions that follow from it.
**Reading rule:** Statements tagged **EVIDENCE** describe the current application as verified. Statements tagged **DECISION** are proposed product definitions. They are not interchangeable.

---

## 1. Definitive product identity

**DECISION.** *Codexx Wallet* is a **paid, customer-owned professional digital wallet & private workspace**.

A "wallet" in this product is a **professional digital space owned and controlled by an individual or a business**. It is the customer's own addressable corner of the web: a presentation layer (the **public wallet**) backed by a working **private workspace** where the customer manages content, inquiries, announcements and settings. The public wallet is the shop window; the private workspace is the actual product value.

Customers pay for **ownership, control, presentation quality and utility** — not for a profile page. A Codexx Wallet is therefore an entitlement the customer buys and keeps under their control, with renewal/upgrade and export semantics, not a free account on a directory.

**EVIDENCE.** The current application has no notion of a paid, customer-owned wallet. It is a free member/portfolio site: three users, all `role=user`, integer IDs, no verification flag; portfolios and projects stored in `data.json`; no Plan, Subscription or Entitlement model; no purchase or provisioning flow [AUDIT/01 §6][DISCOVERY/06 §2][DISCOVERY/10 §8]. The term "wallet" does not occur anywhere in shipped code, data, templates or documentation — not as a renamed object, not as a route, not as a label [DISCOVERY/01 §4][DISCOVERY/06 §1]. **Codexx Wallet is a new product, not a rename of the current app.**

### 1.1 What the wallet is, and is not

| Aspect | DECISION — meaning in this product | Explicitly excluded |
|---|---|---|
| Nature | A professional digital space an individual/business owns and controls | A financial instrument or account |
| Ownership | Customer-owned; the customer decides content, design, publication and when to leave | Admin-owned or platform-curated content |
| Public face | Direct-link public wallet (presentation layer) | Public catalog/directory listing in v1 |
| Private face | Workspace for content, inquiries, announcements, settings | Internal member-to-member messaging |
| Commercial basis | Paid entitlement (tier + term); value = ownership, control, quality, utility | Paying for exposure, ranking or a profile page |
| Data | Customer data retained, exportable, tenant-scoped by `wallet_id` | Shared/commingled member data |

**DECISION.** "Silver" is a **CSS theme name only** — one of six theme styles — and "premium" is a **design/entitlement tier label only**. Neither term carries financial, status or ranking meaning beyond presentation quality and paid entitlement scope [DISCOVERY/01 §5.3][DISCOVERY/05 §3].

---

## 2. Evidence-vs-decision table

| # | EVIDENCE (verified current state) | DECISION (mandated product definition) |
|---|---|---|
| 1 | Monolithic `app.py`, 3,570 lines / 131,660 B, 72 `@app.route` decorators; no Blueprints, factory, services, tests, migrations or CI [AUDIT/01 §3][AUDIT/02 §2] | Modular monolith: Flask + Jinja SSR, modules, one deployment, Alembic migrations, tests and CI as part of the build |
| 2 | Zero occurrences of "wallet" in code/data/templates/docs [DISCOVERY/01 §4][DISCOVERY/06 §1] | New product "Codexx Wallet"; no pretense of a rename |
| 3 | Free member accounts; no purchase, plan, subscription or entitlement tables [DISCOVERY/10 §8][DISCOVERY/06 §7] | Paid product; Plan / Subscription / Entitlement + policy service; provisioning on purchase |
| 4 | `data.json` authoritative for users/portfolios/projects/skills/clients/settings/notification secrets; SQL authoritative for messages; no cross-store transaction [AUDIT/01 §6][AUDIT/04 §3] | One database per deployment; all authoritative state in one transactional store |
| 5 | Internal messaging works member→admin only; 4 conflicting unread definitions; unvalidated receiver; reply without participant check; unauthenticated poll; no admin-initiation UI [AUDIT/08 §2.1–2.6][DISCOVERY/05 §4.2] | Remove all member-to-member messaging; replace with one-way Administration → wallet-owner Announcements with read receipts |
| 6 | "Archive" flashed success but deleted nothing and created no archive state [AUDIT/08 §2.5][DISCOVERY/05 §4.4] | Remove false archive; announcements are retained records, not conversations to archive |
| 7 | No CSRF; GET mutations; CSP `default-src *` / `script-src * 'unsafe-inline' 'unsafe-eval'` / `frame-ancestors *`; no X-Frame-Options; `SESSION_COOKIE_SECURE=False`; secret fallback literal; DEBUG on in prod [AUDIT/05 §4][AUDIT/06 §2] | Security baseline is a gate, not a phase: CSRF, no GET mutations, strict CSP, secure cookies with startup secret validation, server-side authorization, tenant scoping |
| 8 | 6 theme CSS files; only 4 templates load them; 49 templates; zero `dir="rtl"`, `lang="ar"` or Arabic strings; dashboard forced `dir="ltr"` [DISCOVERY/05 §3][AUDIT/06 §5] | Preserve and consolidate themes/portfolio UX; Arabic/RTL readiness is a v1 requirement |
| 9 | Live run: 23/23 cases, 0 console errors, 0 failed requests; theme switch persisted; inquiry dual-written; notification delivery unproven; demo mode allowed project writes [DISCOVERY/05 §1, §4.1, §4.3, §4.5] | Reuse validated UX patterns (public profile, project detail, inquiry taxonomy); remove demo mode; notifications must be proven, not assumed |
| 10 | Broken `/register` (500 via missing `url_for('login')`), `/documentation` 404, sitemap emits nonexistent `/project/<id>`, 403/503 templates extend missing base, orphan `subscription.html` [AUDIT/03 §4][DISCOVERY/05 §4.6] | Purchase-driven account creation; single coherent template hierarchy; no dead pages; print-ready HTML instead of WeasyPrint PDF in v1 |
| 11 | Prior audits recommended "preserve + phased remediation" [AUDIT/07 §1][AUDIT/FINAL_ASSESSMENT §Q7] | **Depart from that advice** — see §7. The mandate changed; this is reconstruction, not remediation |

---

## 3. Target customer

**DECISION.** Start with **individual professionals — freelancers, consultants and independent specialists** who need to present work and receive inquiries under their own controlled identity. They have a clear, immediate job: "give me a professional address I own, that looks excellent, and that lets clients reach me without a marketplace in between."

**DECISION.** **Business/organization wallets are deferred** until there is evidence of demand and a validated multi-seat/ownership model. Supporting evidence: the current data set contains only individual-style member accounts and no organization/team construct; the business journey is largely unsupported today and is documented as an aspiration rather than a working flow [DISCOVERY/07 §5, §8][DISCOVERY/10 §4]. Deferral is a scope decision, not a rejection of the segment.

**DECISION.** Non-targets for v1: buyers looking for a marketplace, freelancers seeking bids, job seekers, social-network users, and anyone expecting a free hosted profile.

---

## 4. Core value proposition

**DECISION.** *Codexx Wallet gives an individual professional a paid, owned, controlled digital space: a high-quality public presentation backed by a real private workspace — with inquiries, announcements and settings in one place — that keeps working for them and that they can export and leave with.*

Value pillars, in priority order:

1. **Ownership and control** — the wallet is the customer's; publication, design and data remain under their control; tenant isolation is enforced (`wallet_id`).
2. **Presentation quality** — polished public wallet and project detail UX, six preserved themes, direct-link access.
3. **Utility** — a working private workspace: content management, inquiry handling, one-way announcements, settings.
4. **Continuity** — clear entitlement lifecycle: renewal/upgrade, grace period, data retention, export, no artificial crippling.

**EVIDENCE.** The strongest verified assets are exactly the presentation/UX pieces: the live public profile, project detail, theme persistence and inquiry form worked in testing [DISCOVERY/05 §3, §4.1][DISCOVERY/10 §2]. The weakest areas are security, data integrity, communication semantics and commercialization [AUDIT/06][DISCOVERY/06 §5]. This is why the value proposition preserves the front-end patterns and rebuilds everything behind them.

---

## 5. Strict product boundaries

**DECISION.** Codexx Wallet is **not** any of the following, and these are explicit non-goals rather than "later" items:

| Boundary | DECISION statement |
|---|---|
| NOT a marketplace | No listings to browse, no buyers/sellers transacting, no catalog in v1 |
| NOT a freelance marketplace | No gigs, proposals, escrow or matching |
| NOT bidding | No auctions, offers or competitive pricing mechanisms |
| NOT a social network | No follows, likes, feeds, comments, DMs or member-to-member conversations |
| NOT a general CRM | No pipelining, deal stages, convert-to-client, or client relationship management beyond receiving inquiries |
| NOT an online academy / LMS | No courses, lessons, enrollment, progress or certificates |
| NOT paid exposure / ranking | No promoted placement, featured slots, search ranking or visibility purchases |
| NOT a financial product | No balances, ledger, payments between users, payouts, tokens, wallet addresses or stored value |

**DECISION.** Payment occurs only at the **provider boundary** for purchasing/renewing the entitlement. It is a billing transaction, not a feature of the wallet. The wallet itself contains no financial capability.

---

## 6. Design principles

**DECISION.** The following principles govern every subsequent scope and journey decision:

1. **Wallet-first tenancy.** Every operation is scoped to a `wallet_id`; no cross-wallet reads or writes except explicit Administration operations. Authorization is checked server-side per operation, never inferred from UI state.
2. **Public/private separation.** The public wallet is read-only presentation; all mutation happens in the authenticated private workspace.
3. **Paid ownership, not crippling.** Entitlements gate genuine cost and scope (storage, project count, themes, support). Limits reflect real cost; no arbitrary feature lobotomies to force upgrades.
4. **One source of truth.** Single transactional database; no authoritative state split across JSON and SQL [AUDIT/04 §3].
5. **Security is a gate.** CSRF protection, no GET mutations, strict CSP, secure session cookies with env secret and startup validation, no debug in production, audit log, encrypted off-instance backups with tested restore, privacy-preserving analytics [AUDIT/05][AUDIT/06].
6. **Plain web, durable output.** Flask/Jinja SSR with small vanilla JS/HTMX, no build step, no SPA. Print-ready HTML in v1 rather than a heavy PDF pipeline.
7. **Bilingual by construction.** English is the copy baseline; Arabic/RTL readiness is a v1 requirement, not a later add-on [DISCOVERY/05 §3].
8. **Reusable patterns, rebuilt foundations.** Preserve what users validated (public profile, project detail, inquiry taxonomy, theme CSS, template hierarchy, per-wallet URL shape, error-page wiring); rebuild the data, security and commercial layers.
9. **Admin is operational, never editorial.** Administration handles support, announcements, abuse and backups — not the content of customer wallets.

---

## 7. Explicit departure from prior "preserve + phased remediation" advice

**EVIDENCE.** Prior AUDIT/DISCOVERY work recommended preserving the existing system and applying phased remediation — Phase 0 baseline, Phase 1 communication correctness, Phase 2 security hardening, Phase 3 data integrity, and so on, with dead code cleanup last [AUDIT/07 §1, §5][AUDIT/FINAL_ASSESSMENT §Q7, §9]. DISCOVERY's preserve-vs-fix view likewise framed the task as fixing and completing what existed [DISCOVERY/08 §6][DISCOVERY/10 §12].

**DECISION.** This assessment **departs from that recommendation deliberately**. The reason is **not** that the old code is merely buggy — most of its defects were remediable in place. The reason is that **the product mandate changed**:

- The target is now a **paid, customer-owned professional wallet with strict tenant isolation**, not a free member portfolio site. Ownership, purchase, entitlement and export do not exist in the current model and cannot be "hardened" into existence [DISCOVERY/06 §7][DISCOVERY/10 §8].
- The commercial layer (Plan / Subscription / Entitlement + policy service) must be **separated from core logic**; the current monolith has no such seam [AUDIT/02 §2].
- One-way **Administration → owner Announcements** replaces member-to-member conversations entirely. That is a product-model change: conversations no longer exist, so the entire member↔member policy and archive apparatus in `AUDIT/08` is obsolete rather than fixable [AUDIT/08 §1, §4].
- **Direct-link-only access in v1** reverses the directory/discovery premise; **no public REST API**, **no SPA** and **no microservices** are fixed architecture choices, not remediation options.

**DECISION.** Therefore: preserve the *validated interface patterns and content* (see §6 and PRODUCT_SCOPE dispositions marked PORT & REFACTOR); **rebuild** the data, tenancy, security and commercial foundations; **remove** features that belong to a different product. Remediation-in-place was the right answer for the old mandate; reconstruction is the right answer for this one.

---

## 8. Architecture and commercial framing (summary only)

**DECISION — Architecture: Option A′, Modular Monolith, Server-Rendered Flask.**
Flask + Jinja SSR; small vanilla JS/HTMX; no build step; no SPA; no public REST API in v1; one deployment; PostgreSQL in production / SQLite in development; Alembic migrations; a single database; one background worker (notifications, receipts, scheduled entitlement transitions).

**DECISION.** React is **rejected**: there is no evidence of need; SSR is better for public content and SEO; the workspace is form/table CRUD, not rich client state; and React adds build, deployment, token, XSS and operational burden. Microservices are rejected for the same reason — one product, one deployment, one database.

**DECISION — Commercial model.** Entitlements are separated from core logic via **Plan / Subscription / Entitlement** tables plus a **policy service**. Tiers are **Starter/Base, Professional, Business**, defined by entitlements, not by features invented for upsell. **No prices are invented in these documents** — the product owner sets pricing with market evidence. Payment terms are **monthly, yearly and lifetime**; lifetime means a non-expiring entitlement with stated support and upgrade terms. On expiration: wallet becomes **read-only/unpublished**, data is **retained**, **export** remains available, and a **grace period** applies. No artificial crippling; limits reflect real cost.

*Full capability dispositions are in PRODUCT_SCOPE.md; lifecycle and control states are in CUSTOMER_JOURNEY.md.*

---

## 9. Success criteria

**DECISION.** The reconstruction is successful when all of the following hold:

1. **Identity is real.** A customer can purchase, own and control a Codexx Wallet; the product is not a free profile site. Ownership, control, presentation and utility are the paid value.
2. **Tenant isolation holds.** No wallet owner can read or mutate another wallet's data; every operation is authorized server-side and `wallet_id`-scoped.
3. **Commercial lifecycle works.** Plan/Subscription/Entitlement drive publication and scope; renewal, upgrade, expiration, grace and export behave as defined; no prices are assumed by the system.
4. **Communication is replaced.** No member-to-member messaging, threads or inbox exist; one-way announcements with read receipts work; the false archive is gone.
5. **Security gate passes.** CSRF, no GET mutations, strict CSP, secure cookies, env secrets, no prod debug, audit log, encrypted backups with tested restore, privacy-preserving analytics.
6. **Public experience is preserved and improved.** Direct-link public wallet and project detail render correctly; inquiry taxonomy and rate-limit/honeypot intent are retained; print-ready HTML replaces WeasyPrint PDF in v1.
7. **Bilingual v1.** English copy baseline plus Arabic/RTL readiness across public wallet and workspace.
8. **No dead weight.** Demo mode, broken register, subscription mockup, orphan portfolios, verification workflow, public catalog, duplicate notification senders, raw IP analytics and unused dependencies are gone.
9. **One source of truth.** All authoritative state in one transactional database with migrations; backups rebuilt and restorable.
10. **Admin stays operational.** No default admin content editing of customer wallets.

---

## 10. What this product is not (short form)

**DECISION.** Not a bank, not a payment wallet, not a ledger. Not a marketplace, not a bidding site. Not a social network with messages and threads. Not a CRM. Not a school. Not a paid-ranking or exposure business. Not a free profile page with a "wallet" label pasted on it. It is a **paid, owned, controlled professional digital space with a high-quality public face and a useful private workspace**.

---

Status: DECISION — awaiting product-owner approval. No implementation performed.
