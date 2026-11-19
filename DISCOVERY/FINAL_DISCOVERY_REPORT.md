# FINAL DISCOVERY REPORT — Codexx Academy

**Discovery date:** 2026-11-19
**Workspace:** `D:\Codexx-Academy-F-VV-main`
**Mission:** Deep system discovery, isolated environment preparation, and live product reconstruction — not repair, redesign, or implementation.
**Status:** Final. Source, documentation, owner-context reconciliation, dependency installation, isolated runtime, and live browser evidence are complete.

---

## Evidence conventions

| Label | Meaning |
| --- | --- |
| VERIFIED FACT | Directly observed in source, templates, data, or controlled runtime/browser evidence. |
| DOCUMENTED INTENT | Explicitly stated in existing documentation or product-facing copy. |
| OWNER-PROVIDED CONTEXT | Supplied by the product owner in the discovery brief. |
| INFERENCE | Reasoned interpretation supported by evidence. |
| STRATEGIC PROPOSAL | Possible future direction only; not an existing capability. |
| UNKNOWN | Insufficient evidence. |

Where evidence sources disagree, the disagreement is recorded rather than forced into a false conclusion.

---

## 1. Executive summary

**VERIFIED FACT:** Codexx Academy is a **single-module Flask proof-of-work professional portfolio application** with public portfolio/project presentation, private per-member portfolio editing, six CSS color themes, a verified-member directory, structured contact inquiries, private CRM-style client records, admin user management, and member↔administration internal messaging. Evidence: `app.py:24,3570`, `app.py:473-504,1461-1582,2238-2328,2862-3438`, `templates/index.html:76-444`, `models.py:20-91`, and final live runtime results.

**VERIFIED FACT:** The product explicitly positions itself as **not** a marketplace, freelance marketplace, bidding platform, social network, or paid-exposure service (`templates/landing.html:319-324`; `templates/pages/about.html:25,55`; `templates/pages/terms.html:31`).

**VERIFIED FACT:** There is **no wallet** in the repository or live runtime: zero occurrences of "wallet" across source, templates, static assets, data, and documentation; no balance, ledger, payout, payment, invoice, or wallet address model/route/UI exists. "Silver" is a CSS color theme, confirmed live by persisting `silver-grey` and re-rendering the public profile. "Premium" is aesthetic/positioning language plus CSS naming, not a paid tier.

**VERIFIED FACT:** The technical condition is that of an **early-stage prototype operating as a production-like service**: broad feature surface, but a 3,570-line monolith, duplicated/unpinned dependencies, no Git baseline, no tests, no CI, no migrations, dual unsynchronized persistence (`data.json` + SQLAlchemy), inconsistent identity values, permissive security defaults, and several broken routes.

**VERIFIED FACT:** Approved communication policy overrides legacy code: communication is Members ↔ Administration only; member-to-member is forbidden; deleting means archiving with full history preserved; permanent deletion is not authorized in Phase 1 (`AUDIT/08:20-54`). The current implementation does not satisfy these rules. Live archive behavior produced a success flash without deleting the thread and without creating any archive state.

**INFERENCE:** The product's legitimate identity is a **verified professional presentation and direct-inquiry system**, not a wallet, marketplace, social network, or financial product. Its strongest verified loop is `portfolio → inquiry → private CRM/admin oversight`, with member↔admin internal messaging as a separate channel.

**VERIFIED FACT:** This discovery mission did not modify application source, templates, JS/CSS, schemas, databases, production data, dependencies, deployments, or Git state. All tooling and runtime artifacts were created in an isolated workspace outside the application source, with documentation artifacts only under `DISCOVERY/`.

---

## 2. What was discovered

### 2.1 Product identity

**VERIFIED FACT:** Public portfolio presentation includes hero/identity, about, skills, projects, contact inquiry, social links, photo, and verification badge (`templates/index.html:76-444`). Project evidence pages exist (`templates/project_detail.html:97-188`).

**VERIFIED FACT:** Private member workspaces edit general/about/skills/projects/clients/social/contact/theme data in JSON (`app.py:2521-2774,3235-3438`). There is no publish/unpublish state; public rendering reads the latest JSON directly (`app.py:473-504`).

**VERIFIED FACT:** Discovery surfaces are a landing gallery and a people directory, both dependent on verification flags (`app.py:1461-1582`). The live catalog correctly showed its empty state with unverified synthetic accounts.

**INFERENCE:** "Academy" is a trust/verification brand, not an implemented learning-management system; no course, enrollment, lesson, progress, or certificate model exists in `models.py:20-91` or the route set.

### 2.2 Wallet/Silver/premium reconciliation

| Owner context | Evidence | Conclusion |
| --- | --- | --- |
| Advanced digital wallet | OWNER-PROVIDED CONTEXT; zero repository/runtime evidence | Not implemented; UNKNOWN external intent. |
| Premium wallet templates | OWNER-PROVIDED CONTEXT; "premium" is style/marketing only | Not implemented. |
| Silver-style templates | OWNER-PROVIDED CONTEXT; `silver-grey` is one of six CSS themes | Confirmed as theme only by live runtime. |
| Professional identity/presentation | VERIFIED FACT | Strongly supported by source and live browser. |
| Freelancers/businesses/digital services | OWNER-PROVIDED CONTEXT; no such roles/models; explicit anti-marketplace copy | Not implemented. |

**VERIFIED FACT:** Dead `templates/dashboard/subscription.html:377-477` contains Free/Professional/Business paid plans and a missing `payment` endpoint; it is unreferenced and conflicts with "No fees on your work" and "no paid exposure".

### 2.3 Architecture and implementation

**VERIFIED FACT:** `app.py` contains 70 route functions / 72 decorators and 5 error handlers. `models.py` declares 7 models; only `User`, `Workspace`, and `Message` are used in the live data path. `Project`, `Skill`, `Client`, and `VisitorLog` are unused imports.

**VERIFIED FACT:** `load_data()`/`save_data()` implement JSON persistence as a read-modify-write of one document with no lock or atomic rename. SQL writes are independent commits; no transaction spans JSON and DB. Live public inquiry dual write was confirmed with the same UUID in both stores.

**VERIFIED FACT:** Importing `app.py` is state-changing: `db.create_all()`, directory creation, and scheduler start happen at import. The isolated launcher prevents these side effects from touching the repository or external services.

**VERIFIED FACT:** Authorization is session-boolean and route-local. `login_required` checks `session['admin_logged_in']`; `admin_required` checks `is_admin`; `disable_in_demo` has an endpoint allowlist and blocks only selected POSTs. Live demo project creation succeeded because `dashboard_add_project` is explicitly allowed in source.

**VERIFIED FACT:** Security headers are permissive: CSP `default-src *`, `frame-ancestors *`; no X-Frame-Options; `SESSION_COOKIE_SECURE=False`. The permissive CSP was reproduced in the live HTTP response.

### 2.4 Communication and notifications

**VERIFIED FACT:** Internal messaging uses a root `Message` plus `parent_id` replies; there is no Conversation model, direction field, initiator field, or archive state.

**VERIFIED FACT:** Member→admin send and both member/admin replies persisted in the live DB. Bob was denied access to another member's thread. The view enforces participation, but source lacks complete backend policy enforcement.

**VERIFIED FACT:** The “Archive Thread” link triggers a confirm dialog, then `dashboard_delete_message`. In the live run, a member sender received `Message deleted successfully` while the DB remained unchanged and no archive state was created. This is a false success message, not history-preserving archiving.

**VERIFIED FACT:** Notification bell is a live DB query plus 30-second client poll. Live polling returned HTTP 200, but no delivery guarantee was proven. Telegram/SMTP were blocked by design.

### 2.5 Documentation condition

**VERIFIED FACT:** Product philosophy documentation is broadly consistent. Technical architecture/security documentation is substantially overstated. `replit.md:20-51` and `audit_plan.md:30-38` claim multi-tenancy, CSRF, security headers, workspace scoping, and completed fixes that source does not support. The prior AUDIT package is the most reliable existing technical record because it separates source evidence from documentation claims.

**VERIFIED FACT:** No documentation or source file contains "wallet"; "ahead of its time" also has zero occurrences. "Silver" occurrences are exclusively the theme.

---

## 3. Technical condition

| Area | VERIFIED FACT condition | Severity / implication |
| --- | --- | --- |
| Repository | No `.git`, no Git CLI; branch/commit/remote UNKNOWN | High — no attributable baseline |
| Architecture | 3,570-line monolith, no tests/CI/migrations/service layer | High — fragile change surface |
| Persistence | JSON primary + DB partial, no transaction/locking | High — lost updates and divergence |
| Identity | Integer JSON IDs, UUID DB IDs, literal `'admin'`, env-admin `'None'` | High — authorization/archive risk |
| Communication | Core works but policy compliance gaps; archive semantics unmet | High — mandatory policy unmet |
| Demo mode | Project writes allowed by source allowlist | Medium — expectation mismatch |
| Security | No CSRF; permissive CSP/cookies; inconsistent ownership checks | High |
| Notifications | Multiple Telegram/SMTP paths, no retry/audit; live test endpoints | Medium-high |
| Operations | Import-time schedulers ×4 workers, local JSON-only backups, no persistent disk | High |
| Documentation | Aspirational claims conflict with source | Medium |
| Product surface | Broad and largely working portfolio CRUD/rendering | Preserve and stabilize |

**INFERENCE:** Technical debt is serious but does not justify a rewrite. The prior audit and this discovery converge on preservation plus phased remediation.

---

## 4. Runtime and live-test results

### 4.1 Environment baseline

**VERIFIED FACT:** Python 3.11.9 (deployment-compatible), Python 3.15.2 present but unused, pip 24.0, Node v26.13.0, npm 11.20.0. No Git, no lockfiles, no test configs, no DB files, no relevant env vars. Runtime data limited to `data.json` and `security/ip_log.json` (`DISCOVERY/evidence/logs/environment_baseline.md`).

### 4.2 Dependency installation

**VERIFIED FACT:** Application dependencies were installed into an isolated Python 3.11 venv using the repository manifest without modifying it. Installation exited 0. Effective versions include Flask 3.1.1, Werkzeug 3.1.3, gunicorn 23.0.0, SQLAlchemy 2.0.23, Flask-SQLAlchemy 3.1.1, APScheduler 3.10.4, WeasyPrint 65.1, requests 2.31.0, Alembic 1.13.0, and psycopg2-binary 2.9.10. Evidence: `DISCOVERY/evidence/logs/app_pip_install.log` and `effective_versions.txt`.

**VERIFIED FACT:** Playwright installation was attempted in a separate tooling venv. The first attempt failed with SSL `DECRYPTION_FAILED_OR_BAD_RECORD_MAC`; the bounded pinned retry exited 1 at the wheel download. `pw-venv` ended with only `pip==24.0` and `setuptools==65.5.0`. Playwright is BLOCKED and nonessential for this package.

**VERIFIED FACT:** System Chrome 157.0.8103.79 was used instead, via a Node.js Chrome DevTools Protocol harness. No npm install or application dependency change was required. System Edge 157.0.4341.60 was identified but not used.

### 4.3 Isolated runtime

**VERIFIED FACT:** Disposable app copy, synthetic data generator, loopback-only launcher, SQLite-in-copy DB, scheduler disablement, HTTP POST/SMTP blockers, and notification helper no-ops were prepared outside the source tree.

**VERIFIED FACT:** Final launch produced `DISCOVERY RUNTIME READY`, `Debug mode: off`, `Running on http://127.0.0.1:5001`, created `app-copy/discovery.db`, and returned HTTP 200 on `/`. Full startup/request log: `DISCOVERY/evidence/logs/app_runtime.log`.

**VERIFIED FACT:** No production DB, credentials, uploads, notifications, payments, deployment, or source files were used or modified.

### 4.4 Live browser evidence

**VERIFIED FACT:** Final CDP run: **23 cases, 23 completed, 0 failed**. No console errors and no failed requests occurred. Expected page errors were limited to `/documentation` (404) and `/register` (500).

**VERIFIED FACT:** Notable confirmations:
- public landing/profile/catalog render correctly; catalog empty state is verification-driven;
- public inquiry dual-writes JSON and DB with the same UUID;
- login/logout, role-split dashboards, invalid-login flash, and admin directory work;
- internal member→admin message and replies persist; non-participant access is denied;
- portfolio profile/project/theme edits persist publicly; `silver-grey` theme confirmed;
- demo-mode project creation succeeds and is explicitly allowed by source;
- archive control produces a false success flash with no DB deletion and no archive state;
- notification polling endpoint returns 200 but delivery is not proven.

**VERIFIED FACT:** Structured results, summary, logs, and 27 final screenshots are preserved in `DISCOVERY/evidence/`. Intermediate fixture/harness runs are separately archived rather than overwritten.

### 4.5 Runtime safety

**VERIFIED FACT:** Real Telegram HTTP POST and SMTP were blocked; scheduler disabled; bind limited to `127.0.0.1:5001`; disposable DB/JSON/Chrome profile only. No external side effect was executed.

---

## 5. Product identity assessment

**VERIFIED FACT:** The implemented and live-observed identity is a proof-of-work professional portfolio platform with verification gating, private workspace editing, direct inquiry, private CRM, and admin/member communication.

**INFERENCE:** The owner's wallet/Silver/premium/freelancer context is not supported by repository or runtime evidence. The most evidence-supported reading is that "wallet" is an external concept or future metaphor; Silver is a theme; premium is presentation language; project owners/service providers are audience copy, not implemented roles.

**INFERENCE:** The product should not be prematurely classified as a portfolio builder only, marketplace, social network, online academy, or financial wallet. It is best described as a **curated professional proof-of-work presentation and inquiry system with prototype workspace/CRM features**.

---

## 6. Strategic recommendations

All recommendations are STRATEGIC PROPOSALS requiring product-owner approval.

1. **Stabilize before expanding.** Enforce Gate 0 decisions, establish Git baseline, fix registration and communication correctness, then security and data integrity. Do not rewrite.
2. **Preserve the verified identity.** Keep proof-of-work, anti-paid-exposure, private execution/public presentation, six themes, and existing URLs/templates.
3. **Resolve communication semantics first.** Decide the four archive questions and admin identity model before implementation; then enforce backend policy.
4. **Treat wallet/premium/freelancer/organization ideas as new product discovery.** They are not reconstructions of current behavior.
5. **Consider AI only as optional content assistance first.** Profile/project wording help is low-risk; matching, verification decisions, and privileged automation are excluded initially (`DISCOVERY/11_AI_OPPORTUNITY_ASSESSMENT.md`).
6. **Avoid marketplace drift.** Service catalogs, rankings, paid exposure, and brokerage would conflict with explicit product copy unless the owner changes the positioning.
7. **Separate required fixes from expansion.** Required: baseline, communication correctness, security, data integrity, operations. Optional: themes, AI, client portal, organizations, services, wallet/payments.

---

## 7. What remains unknown

**UNKNOWN / requires owner decision or external evidence:**
1. Repository identity: remote, branch, commit, working-tree status — no Git metadata/CLI.
2. Production DB engine/schema/state and deployed env values.
3. Whether any wallet/Silver/premium specification existed outside this repository.
4. Four archive semantics: global vs per-participant hiding, admin archiving of member-initiated threads, restoration, reactivation after new message.
5. Whether Administration is intended as one identity or multiple distinguishable accounts.
6. Whether external deep links target dead templates/routes.
7. WeasyPrint success in the deployment image.
8. Hosting persistence for `data.json`, uploads, backups, and IP log.
9. Owner appetite, budget, and provider choice for AI or commercial expansion.
10. Runtime concurrency behavior under Gunicorn 4 workers; only a single-worker dev server was tested.
11. Visual design quality beyond rendered text/headings and preserved screenshots; this model could not inspect PNG contents.

---

## 8. Decisions required from the product owner

To close discovery and authorize a next phase, the owner must explicitly decide:

1. **Next phase approval:** authorize any source/schema/dependency changes in a future phase (this discovery does not).
2. **Archive semantics:** choose all four unresolved rules in `AUDIT/08:230-263`.
3. **Admin identity:** one Administration identity or multiple distinguishable admins.
4. **Wallet interpretation:** external context, future strategic concept, or rejected direction.
5. **Silver/Premium:** preserve as theme/style language or define a future commercial/presentation tier.
6. **Role vocabulary:** remain member/admin/demo/public visitor, or add freelancer/project-owner/business/organization roles.
7. **Monetization boundaries:** confirm anti-paid-exposure remains binding; decide fate of dead subscription mockup.
8. **Demo mode:** confirm whether project creation should remain allowed or be restricted.
9. **Distribution priority:** hosted curated platform, self-hosted workspace, or both.
10. **Expansion gate:** agree that optional product expansion waits until core stabilization.

---

## 9. Discovery package index

1. `01_PRODUCT_IDENTITY.md`
2. `02_SOURCE_CODE_RECONSTRUCTION.md`
3. `03_ENVIRONMENT_AND_RUNTIME.md`
4. `04_LIVE_TESTING_INFRASTRUCTURE.md`
5. `05_VISUAL_AND_RUNTIME_DISCOVERY.md`
6. `06_DIGITAL_WALLET_MODEL.md`
7. `07_ECOSYSTEM_AND_USER_JOURNEYS.md`
8. `08_FEATURE_AND_LIFECYCLE_MAP.md`
9. `09_DOCUMENTATION_REVIEW.md`
10. `10_PRODUCT_POSITIONING_AND_STRATEGY.md`
11. `11_AI_OPPORTUNITY_ASSESSMENT.md`
12. `12_MASTER_PRODUCT_ROADMAP.md`
13. `FINAL_DISCOVERY_REPORT.md`

Evidence: `DISCOVERY/evidence/screenshots/`, `evidence/logs/`, `evidence/results/`. Testing guide and copied harness scripts: `DISCOVERY/testing/`.

---

## 10. Closure statement

**VERIFIED FACT:** The discovery package reconstructs the product from source, data, documentation, owner context, and controlled runtime/live browser evidence. No remediation, implementation, deployment, or external side effect was performed.

**INFERENCE:** The product is ready for product-owner review and explicit approval of the next phase. Discovery stops here; no implementation or remediation begins automatically.

**Final instruction from mission:** Present findings for product-owner review and explicit approval before any next phase.
