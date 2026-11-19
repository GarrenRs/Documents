# PRODUCT SCOPE — Codexx Wallet (v1)

**Document class:** Product-definition decision record (not a technical specification).
**Companion documents:** PRODUCT_VISION.md (identity, boundaries, principles), CUSTOMER_JOURNEY.md (lifecycle and control states).
**Reading rule:** **EVIDENCE** = verified current state. **DECISION** = proposed scope. Disposition is the product-level action, not an implementation plan.

---

## 1. Scope statement

**DECISION.** v1 delivers a paid, customer-owned professional wallet: purchase-driven account creation, a direct-link public wallet with project presentation and inquiry capture, and a private workspace for content, inquiries, one-way announcements and settings — governed by commercial entitlements and a strict security/tenancy baseline. Everything that belongs to the old member/marketplace/product model is removed, not carried forward.

**DECISION.** Arabic/RTL readiness is a **v1 requirement** for both public wallet and workspace, with English as the copy baseline [DISCOVERY/05 §3].

---

## 2. Reassessment of every owner-named area

Legend — **In:** in v1 scope · **Out:** out of v1 scope · **BUILD NEW**, **PORT & REFACTOR**, **REMOVE**, **DEFER** = product disposition.

| Capability | In/Out | DECISION — rationale | Disposition |
|---|---|---|---|
| Internal member-to-member messaging | Out | Product is not a social network; conversations no longer exist. Current implementation is member→admin only, with 4 conflicting unread definitions, unvalidated `receiver_id`, reply without participant check and an unauthenticated poll [AUDIT/08 §2.1–2.6][DISCOVERY/05 §4.2]. | REMOVE |
| Threads / inbox / compose / reply / read-state / unread-poll machinery | Out | Inseparable from member-to-member messaging; no recipient counterpart remains. 4 unread definitions must not be "reconciled" — the machinery is deleted [AUDIT/08 §2.6]. | REMOVE |
| Deprecated chat | Out | No working chat product; only the messaging subsystem above. | REMOVE |
| False "archive" delete | Out | Flashed success but deleted nothing and created no archive state [AUDIT/08 §2.5][DISCOVERY/05 §4.4]. Announcements are retained records, not conversations to archive. | REMOVE |
| Member↔member policy apparatus (participants, forbidden flows, archive semantics, authorization rules) | Out | Superseded in full by one-way announcement policy — see §3. | REMOVE |
| One-way Administration → wallet-owner Announcements + per-recipient read receipts | In | The only retained communication path: append-only records, no replies, no threads, no member-to-member. | BUILD NEW |
| General client CRM / pipelining / convert-to-client | Out | Product is not a CRM; the `clients` data exists but is an aspirational, unsupported journey [DISCOVERY/07 §8][DISCOVERY/08 §4]. Inquiries are messages, not deals. | REMOVE |
| Public catalog / directory / discovery listing | Out (v1) | v1 is direct-link access only. A public catalog reverses the "owned space" premise and invites exposure-ranking expectations. Current catalog page is a discovery artifact, not a paid feature [DISCOVERY/05 §3][DISCOVERY/10 §7.1]. | DEFER |
| Verification-by-≥3-projects workflow | Out | No verification flag exists on accounts; the workflow is a documented convention, not a working gate, and conflicts with paid ownership [AUDIT/01 §6][DISCOVERY/06 §7]. | REMOVE |
| Dead `subscription.html` mockup | Out | Orphan template with a missing `url_for('payment')`; no real subscription model behind it [AUDIT/03 §4][DISCOVERY/05 §4.6]. Replaced by real entitlement records. | REMOVE |
| Demo mode (admin project writes on demo accounts) | Out | Allowed project writes in live testing and has no place in a paid, owned product [DISCOVERY/05 §4.3][DISCOVERY/05 §7]. | REMOVE |
| Themes (6 CSS files) and portfolio/project presentation UX | In | Validated in live testing: theme switch persisted; public profile and project detail rendered correctly. Consolidate loading — only 4 of 49 templates currently load the 6 theme files [DISCOVERY/05 §3, §5]. | PORT & REFACTOR |
| Administrative communication | In (redefined) | Admin sends one-way announcements and reads receipts; admin does **not** edit customer wallet content (see §6 and CUSTOMER_JOURNEY.md). | BUILD NEW |
| Public profile + project detail UX | In | Strongest verified asset; preserve structure, copy baseline and per-wallet URL shape [DISCOVERY/01 §6][DISCOVERY/05 §3]. | PORT & REFACTOR |
| Inquiry form taxonomy (name / email / type / message / honeypot / rate-limit intent) | In | Dual-write verified in live testing; honeypot and rate-limit intent retained as abuse controls [DISCOVERY/05 §4.1]. | PORT & REFACTOR |
| Template hierarchy / Jinja base / error-page wiring | In | Rebuild on one coherent hierarchy; 403/503 currently extend a missing `base.html` [AUDIT/03 §4]. | PORT & REFACTOR |
| Per-wallet public URL shape | In | Preserve addressability; makes the wallet a destination customers own [DISCOVERY/06 §2.3]. | PORT & REFACTOR |
| Werkzeug password hashing | In | Keep the verified approach; credential storage must remain salted/hashed [AUDIT/01 §5.2]. | PORT & REFACTOR |
| Backup concept | In (rebuilt) | Current backup is downloadable by any logged-in user [AUDIT/05 §5]. Rebuild as encrypted off-instance backups with tested restore; admin-operated only. | BUILD NEW |
| English copy baseline | In | Preserve as the source language for bilingual content [DISCOVERY/01 §6]. | PORT & REFACTOR |
| Arabic / RTL readiness | In (v1 requirement) | Zero `dir="rtl"`, `lang="ar"` or Arabic strings today; dashboard forced `dir="ltr"` [DISCOVERY/05 §3]. Build in from v1. | BUILD NEW |
| Purchase-driven account creation | In | `/register` currently 500s via missing `url_for('login')`; accounts must be created by entitlement purchase [AUDIT/03 §4][DISCOVERY/05 §4.6]. | BUILD NEW |
| Plan / Subscription / Entitlement + policy service | In | Commercial layer separated from core logic; no prices invented; tiers defined by entitlements [PRODUCT_VISION §8]. | BUILD NEW |
| Security baseline (CSRF, no GET mutations, strict CSP, secure cookies, env secrets, prod debug off, server-side authz, wallet scoping, audit log, privacy-preserving analytics) | In (gate) | Current baseline fails on all these points [AUDIT/05 §4][AUDIT/06 §2]. | BUILD NEW |
| Notifications (one operational sender + reliable receipts) | In | 4 Telegram + 5 SMTP paths, unescaped HTML, no retry/dedup/audit; delivery unproven in testing [AUDIT/05 §6][DISCOVERY/05 §4.5]. | BUILD NEW |
| Print-ready HTML (instead of WeasyPrint PDF) | In | v1 uses browser print output; heavy PDF pipeline deferred [PRODUCT_VISION §6]. | BUILD NEW |
| Raw IP visitor analytics | Out | Privacy risk; replace with privacy-preserving analytics [AUDIT/06 §4]. | REMOVE |
| Duplicate notification senders | Out | Consolidate to one sender with retry/dedup/audit [AUDIT/05 §6]. | REMOVE |
| Unused deps/templates (flask-login, flask-dance, oauthlib, PyJWT, email-validator, python-dotenv, alembic-as-unused, orphan templates) | Out | `requirements.txt` triplicated/unpinned; 5 orphan templates [AUDIT/01 §4.1][AUDIT/06 §5]. Alembic is retained as the chosen migration tool, not as dead weight. | REMOVE |
| GET state changes | Out | No GET may mutate state [AUDIT/06 §2]. | REMOVE |
| Telegram / SMTP setup guides | Out | Operational setup docs for a removed multi-sender mess; replace with a single documented operational procedure. | REMOVE |
| Public REST API / SPA / microservices | Out | Architecture choice Option A′: SSR monolith, no public API in v1 [PRODUCT_VISION §8]. | REMOVE |
| Business / organization wallets | Out (v1) | No evidence and no multi-seat ownership model today [DISCOVERY/07 §5][DISCOVERY/10 §4]. | DEFER |

---

## 3. Supersession of AUDIT/08 communication rules

**DECISION.** The archive and communication rules in `AUDIT/08` (participants, supported/forbidden flows, conversation lifecycle, per-participant hiding, restore semantics, reactivation by new message, and the Phase 1 acceptance gate) are **superseded in full** by this scope.

**DECISION.** Rationale: **conversations no longer exist**. Announcements are append-only administrative records with per-recipient read receipts — **retained records, not conversations to archive**. There is no reply, no thread, no unread-poll ambiguity to resolve and no "archive" action to define. The false archive is removed rather than repaired [AUDIT/08 §4, §5][DISCOVERY/05 §4.4]. The only communication rules that survive are: Administration may create announcements; wallet owners may read them; receipts record reads; nothing is editable by members.

---

## 4. v1 minimum module set

**DECISION.** v1 is complete when these ten modules exist and pass the success criteria in PRODUCT_VISION.md §9:

| # | Module | Minimum capability | Primary disposition |
|---|---|---|---|
| 1 | Identity & provisioning | Purchase-driven account creation; hashed credentials; session security | BUILD NEW |
| 2 | Commercial entitlement | Plan / Subscription / Entitlement records + policy service; tiers Starter/Base, Professional, Business; monthly/yearly/lifetime terms; no invented prices | BUILD NEW |
| 3 | Wallet tenancy | One wallet per customer; strict `wallet_id` scoping; server-side per-operation authorization | BUILD NEW |
| 4 | Public wallet | Direct-link public presentation; owner-controlled publish/unpublish; SEO-friendly SSR | PORT & REFACTOR |
| 5 | Project presentation | Project list + detail; theme application across all relevant templates | PORT & REFACTOR |
| 6 | Inquiries | Public inquiry form with name/email/type/message, honeypot and rate-limit intent; owner-visible inbox of inquiries (not conversations) | PORT & REFACTOR + BUILD NEW |
| 7 | Announcements | One-way Administration → owner append-only records with per-recipient read receipts | BUILD NEW |
| 8 | Workspace & settings | Content CRUD, design/theme selection, account settings, export request | BUILD NEW / PORT & REFACTOR |
| 9 | Security & audit | CSRF, no GET mutations, strict CSP, secure cookies, env secret validation, no prod debug, audit log, privacy-preserving analytics | BUILD NEW |
| 10 | Operations & continuity | Single DB + Alembic migrations; one background worker; one notification sender; encrypted off-instance backups with tested restore; print-ready HTML | BUILD NEW |
| — | Bilingual layer | English baseline + Arabic/RTL readiness across public wallet and workspace | BUILD NEW (v1 requirement) |

---

## 5. Named deferrals (explicitly not in v1)

**DECISION.**

- Public catalog / directory / discovery listing (direct links only in v1).
- Business / organization wallets and multi-seat ownership.
- Marketplace, bidding, exposure/ranking or promoted placement — non-goals, not deferrals (see PRODUCT_VISION §5).
- General CRM / pipelining / convert-to-client — removed, not deferred.
- WeasyPrint/generated PDF; v1 is print-ready HTML.
- Public REST API, SPA front end, React, microservices.
- Any financial capability (balances, ledger, payouts, tokens, addresses) — non-goal.
- Social features (follows, likes, comments, DMs) — non-goal.

---

## 6. Scope guardrails carried from the vision

**DECISION.**

- Admin is **operational only**: support, announcements, abuse, backups. **No admin content editing of customer wallets by default**; any exception requires explicit owner consent and is logged.
- Entitlement limits reflect real cost (storage, project count, theme scope, support terms); no artificial crippling.
- No prices are set in this document family; the owner decides with market evidence.
- Preserve validated patterns; rebuild broken foundations; remove features that belong to another product.

---

Status: DECISION — awaiting product-owner approval. No implementation performed.
