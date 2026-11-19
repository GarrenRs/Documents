# 05 — Visual and Runtime Discovery

**Discovery date:** 2026-11-19
**Status:** Final. 23/23 live browser cases completed in the final Chrome CDP run; 0 harness failures.

---

## Evidence conventions

| Label | Meaning |
| --- | --- |
| VERIFIED FACT | Directly observed in source or controlled runtime/browser evidence. |
| DOCUMENTED INTENT | Stated in docs or product-facing copy. |
| INFERENCE | Reasoned interpretation supported by evidence. |
| STRATEGIC PROPOSAL | Possible future direction only. |
| UNKNOWN | Insufficient evidence. |

This document correlates four evidence sources: source code, persistence, live browser behavior, and docs/owner context. Where they disagree, the disagreement is recorded rather than forced into a single conclusion.

---

## 1. Evidence sources and runtime result

**VERIFIED FACT:** Isolated runtime design, synthetic data generator, side-effect blockers, and browser tooling are documented in `DISCOVERY/03_ENVIRONMENT_AND_RUNTIME.md` and `DISCOVERY/04_LIVE_TESTING_INFRASTRUCTURE.md`.

**VERIFIED FACT:** Evidence targets:
- screenshots: `DISCOVERY/evidence/screenshots/` and `final_run/`
- logs: `DISCOVERY/evidence/logs/`
- structured results: `DISCOVERY/evidence/results/live_results.json`
- human-readable summary: `DISCOVERY/evidence/results/live_summary.md`
- harness guide: `DISCOVERY/testing/README.md`

**VERIFIED FACT:** Final runtime:
- launch: `DISCOVERY RUNTIME READY`; debug off; `127.0.0.1:5001`
- health: HTTP 200
- DB: disposable `app-copy/discovery.db` created
- browser: system Chrome 157.0.8103.79 via CDP
- cases: 23 total, 23 completed, 0 failed
- final log: `DISCOVERY/evidence/logs/cdp_run.log`

**VERIFIED FACT:** The final run used valid theme IDs and logged out before each login. Earlier fixture-induced invalid-theme CSS errors and session-inheritance artifacts are preserved in archived runs but are not present in the final results.

---

## 2. Case execution ledger

| ID | Case | Observed result | Evidence | Status |
| --- | --- | --- | --- | --- |
| PUB-01 | Public landing page | HTTP 200; title `Codexx Academy \| Elite Proof-of-Work Portfolio Ecosystem`; H1 `Where Real Work Is Shown, Not Sold` | `PUB-01_landing.png` | COMPLETED |
| PUB-02 | Public professional profile | HTTP 200; headings include `Professional Path`, `Core Competencies`, `Case Studies & Evidence`, `Initiate Cooperation` | `PUB-02_profile.png` | COMPLETED |
| PUB-03 | Public catalog | HTTP 200; empty state: directory is currently being prepared | `PUB-03_catalog.png` | COMPLETED |
| PUB-04 | Documentation route | HTTP 404 with rendered 404 page; expected page error recorded | results JSON | COMPLETED |
| PUB-05 | Public inquiry submission | Flash `Your message has been delivered.`; DB 0→1; same UUID in `alice_member` JSON messages | `PUB-05_after_inquiry.png`, results JSON | COMPLETED |
| AUTH-01 | Login page | HTTP 200; `Login - Dashboard` | `AUTH-01_login.png` | COMPLETED |
| AUTH-02 | Invalid login | Flash `Invalid credentials. Please try again.` | results JSON | COMPLETED |
| AUTH-03 | Member login/dashboard | Member nav: Identity, Proposition, Competencies, Gallery, CRM, Inbox, Internal messages; notification poll 200 | `AUTH-03_member_dashboard.png` | COMPLETED |
| AUTH-04 | Admin login/dashboard | Admin nav: User Directory, Channels, Inbox, Internal messages, Global Settings, Access Standards | `AUTH-04_admin_dashboard.png` | COMPLETED |
| AUTH-05 | Registration attempt | HTTP 500; rendered error page; page error recorded | `AUTH-05_register.png` | COMPLETED |
| COM-01 | Member internal message | Flash `New thread started.`; DB 1→2; receiver literal `admin` | `COM-01_inbox.png`, `COM-02_compose.png`, `COM-03_after_send.png` | COMPLETED |
| COM-02 | Member reply in own thread | Reply persisted; DB 2→3 | `COM-04_thread_view.png`, `COM-05_after_reply.png` | COMPLETED |
| COM-03 | Admin reply to member thread | Reply persisted; DB 3→4; DB row stores `sender_id='None'` | `COM-06_admin_thread.png` | COMPLETED |
| COM-04 | Non-participant access | Bob sees `Access denied.`; no DB change | `COM-07_unauthorized.png` | COMPLETED |
| COM-05 | Archive link hard-delete behavior | JS confirm accepted; flash `Message deleted successfully`; DB unchanged 4→4; no archive state; see §4.4 | `COM-08_before_archive.png`, `COM-09_after_archive.png` | COMPLETED |
| NOT-01 | Notification polling | `/dashboard/notifications/latest` returned 200; no badge/delivery proof | results JSON | COMPLETED |
| PF-01 | Portfolio profile editing | General/about/skills writes persisted; skill `Python` replaced by `Playwright` in synthetic JSON | `PF-01_general.png`, `PF-02_after_edit.png` | COMPLETED |
| PF-02 | Project lifecycle | Project add persisted; Alice projects `Synthetic Project` → `Synthetic Project`, `Discovery Project` | `PF-03_add_project.png`, `PF-04_projects_list.png` | COMPLETED |
| PF-03 | Public profile after edits | Public profile reflected edited name/title/skills/project | `PF-05_public_after_edits.png` | COMPLETED |
| PF-04 | Silver-grey theme selection | JSON theme `luxury-gold` → `silver-grey`; public profile HTTP 200 | `PF-06_silver_theme.png`, `PF-07_public_silver_theme.png` | COMPLETED |
| ADM-01 | Admin user management | HTTP 200; admin-only directory | `ADM-01_users.png` | COMPLETED |
| ADM-02 | Demo-mode project creation | Demo account successfully added project; source allowlist permits it | `ADM-02_demo_project.png` | COMPLETED |
| AUTH-06 | Logout/session | Logout then `/dashboard` returned to login state | `AUTH-06_before_logout.png` | COMPLETED |

**VERIFIED FACT:** Final case counts: 23 total, 23 completed, 0 failed. No console errors and no failed network requests were observed. The only page errors were the expected resource errors for `/documentation` (404) and `/register` (500).

---

## 3. Static visual expectations confirmed

**VERIFIED FACT:** Public portfolio rendered the expected proof-of-work sections: hero/identity, about/professional path, skills, project case studies, and contact inquiry. No wallet, balance, payout, or payment UI appeared.

**VERIFIED FACT:** Public profile uses the viewed user's server-side theme. Selecting `silver-grey` persisted in JSON and the public profile re-rendered with HTTP 200. This confirms Silver is a CSS color theme, not a product tier.

**VERIFIED FACT:** Landing gallery and catalog depend on verification flags. With synthetic accounts lacking `is_verified`, the catalog showed its empty state.

**VERIFIED FACT:** Dashboard navigation differs by role: members see portfolio/CRM/message links; administration sees User Directory, Channels, Global Settings, and Access Standards. Dashboard pages carry `noindex, nofollow` in source.

**VERIFIED FACT:** The rendered CSP header remained permissive at runtime: `default-src *`, `script-src * 'unsafe-inline' 'unsafe-eval'`, `frame-ancestors *`.

---

## 4. Correlation findings

### 4.1 Contact inquiry dual write — VERIFIED FACT

The public inquiry produced flash `Your message has been delivered.`, inserted one DB `messages` row, and appended one message to `data.json` under `alice_member`. Both records share UUID `9067a849-262f-4efc-86e1-5e2e7e93b61d`. This confirms the dual-write path for portfolio inquiries in the isolated runtime. It does not prove atomicity under concurrency.

### 4.2 Internal messaging — VERIFIED FACT

Member→administration send, member reply, and admin reply each persisted one DB row. The view enforces participation for Bob (`Access denied.`). The root message uses literal receiver `admin`, while the admin reply uses receiver `1` and `sender_id='None'`. This is a runtime confirmation of the source-level identity mismatch.

**INFERENCE:** The approved Members ↔ Administration policy is partially implemented at the UI/view layer, but the data model and route checks do not enforce it as a durable business rule.

### 4.3 Demo mode — VERIFIED FACT

`carol_demo` submitted a project and received `Project added successfully`; the project persisted in `data.json`. Source `app.py:651-718` explicitly includes `dashboard_add_project` in the demo allowlist. Therefore demo mode is not a global write block. The earlier expectation of a hard demo restriction was incorrect; source and runtime agree.

### 4.4 Archive semantics — VERIFIED FACT / UNKNOWN

The “Archive Thread” control uses a JavaScript confirm (`templates/dashboard/internal_view.html:75-78`). The final harness accepted the dialog and followed `GET /dashboard/messages/delete/<id>`.

Observed:
- flash: `Message deleted successfully`
- DB message count: 4 → 4
- root thread: still present
- replies: still present
- no archive flag/state exists in the model

Source `app.py:3121-3157` deletes a single DB row only when the actor is admin or the row's `receiver_id` equals the session user id. For a member who sent the internal message (`receiver_id='admin'`), deletion is skipped, yet the success flash is still emitted.

**VERIFIED FACT:** The current behavior is a false-positive success flash for this actor and does not implement history-preserving archive semantics.

**UNKNOWN:** The owner's four archive decisions remain unresolved. Nothing in this runtime justifies choosing global hiding, per-participant archiving, restoration, or reactivation behavior.

### 4.5 Notifications — VERIFIED FACT

The dashboard polled `/dashboard/notifications/latest` and received HTTP 200. No notification payload or badge state was proven, and real transports were blocked by design. This confirms polling activity, not delivery.

### 4.6 Broken routes — VERIFIED FACT

`/documentation` returned 404 and `/register` returned 500 in the browser, matching the static audit. These are existing product defects observed in a clean final run.

---

## 5. Console, network, and persistence summary

| Category | Final result |
| --- | --- |
| Console errors | 0 across all 23 cases |
| Failed requests | 0 across all 23 cases |
| Expected page errors | `/documentation` 404; `/register` 500 |
| Notification endpoint | HTTP 200 on dashboard/message cases |
| Backup endpoint | `/api/backups` 200 observed while opening settings |
| DB message count | 0 → 1 (public inquiry) → 4 (three internal messages); unchanged by archive probe |
| JSON profile writes | name/title/description/about/skills/project/theme persisted |
| Demo JSON write | `Demo Allowed Project` persisted under `carol_demo` |
| Theme | `luxury-gold` → `silver-grey`; public profile re-rendered |
| Side effects outside disposable workspace | None observed |

---

## 6. Source/runtime/documentation disagreements

| Area | Source or doc expectation | Runtime finding | Classification |
| --- | --- | --- | --- |
| Wallet/Silver/premium | Owner context mentions advanced wallet and premium/Silver templates | No wallet/financial UI; Silver is a CSS theme; premium is style/copy | VERIFIED FACT + OWNER-PROVIDED CONTEXT |
| Registration | Route exists in source | HTTP 500 in browser | VERIFIED FACT |
| Documentation | Known dead route | HTTP 404 in browser | VERIFIED FACT |
| Catalog | Verification-filtered directory | Empty state with unverified synthetic accounts | VERIFIED FACT |
| Demo mode | Sometimes assumed to block writes | Project creation allowed and persisted; source allowlist confirms | VERIFIED FACT |
| Archive | UI says “Archive Thread”; flash says deleted | No DB deletion for member sender; no archive state; false success flash | VERIFIED FACT |
| Internal identity | `'admin'` vs integer user IDs vs env admin username | Literal `admin`, receiver `1`, sender_id `'None'` all observed in DB | VERIFIED FACT |
| Notifications | Bell/poll implies fresh notifications | Poll 200 only; no delivery proof | VERIFIED FACT |
| CSP/security docs | Docs claim strong headers | Permissive CSP reproduced at runtime | VERIFIED FACT |
| Browser tooling | Initial docs planned Playwright | Playwright blocked; CDP harness used | VERIFIED FACT |

---

## 7. Runtime safety observations

**VERIFIED FACT:** The isolated runtime blocked real Telegram HTTP POST, real SMTP, scheduler jobs, and production DB access. It bound only to loopback. No real payment or notification was executed.

**VERIFIED FACT:** Startup stdout/stderr, DB creation, health check, console/network events, and persistence effects were captured in `DISCOVERY/evidence/`.

**INFERENCE:** The runtime evidence is sufficient for product reconstruction and safety-first gap identification. It is not a production parity test.

---

## 8. Screenshot inventory

**VERIFIED FACT:** The final run produced 27 PNGs under `DISCOVERY/evidence/screenshots/` and `DISCOVERY/evidence/screenshots/final_run/`. Representative captures include:
- public: `PUB-01_landing.png`, `PUB-02_profile.png`, `PUB-03_catalog.png`, `PUB-05_after_inquiry.png`
- auth/dashboard: `AUTH-01_login.png`, `AUTH-03_member_dashboard.png`, `AUTH-04_admin_dashboard.png`, `AUTH-05_register.png`, `AUTH-06_before_logout.png`
- communication: `COM-01_inbox.png`, `COM-02_compose.png`, `COM-03_after_send.png`, `COM-04_thread_view.png`, `COM-05_after_reply.png`, `COM-06_admin_thread.png`, `COM-07_unauthorized.png`, `COM-08_before_archive.png`, `COM-09_after_archive.png`
- portfolio/admin: `PF-01_general.png`, `PF-02_after_edit.png`, `PF-03_add_project.png`, `PF-04_projects_list.png`, `PF-05_public_after_edits.png`, `PF-06_silver_theme.png`, `PF-07_public_silver_theme.png`, `ADM-01_users.png`, `ADM-02_demo_project.png`

**VERIFIED FACT:** `COM-05_after_reply.png` is a legacy filename for the member-reply case; the archive case uses `COM-08_before_archive.png` and `COM-09_after_archive.png`.

**VERIFIED FACT:** This model could not visually inspect PNG contents; visual conclusions are based on rendered body text, headings, network logs, and persistence snapshots.

---

## 9. Visual/runtime verdict

**VERIFIED FACT:** The live product behaves as a proof-of-work professional portfolio with inquiry handling, private portfolio editing, admin/member messaging, and role-split dashboards. No wallet or financial surface appeared anywhere in the live run.

**INFERENCE:** The runtime confirms the source-derived product identity and exposes concrete stabilization targets: registration, documentation route, archive semantics, identity normalization, demo-mode clarity, and security headers. It does not justify a rewrite.

**STRATEGIC PROPOSAL:** Any later phase should preserve the verified portfolio/inquiry loop and first resolve owner decisions on archive semantics and Administration identity before changing communication code.
