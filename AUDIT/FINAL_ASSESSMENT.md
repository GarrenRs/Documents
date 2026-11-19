# FINAL ASSESSMENT — Independent Review and Answers

**Audit date:** 2026-11-19
**Target:** `D:\Codexx-Academy-F-VV-main` (Codexx Academy — Elite Proof-of-Work Ecosystem)
**Mode:** Read-only static audit. No source, database, dependency, Git, integration, or scheduled-job state was modified. Only the eight `AUDIT/*.md` files were created.
**Companion documents:** `01_SYSTEM_BASELINE.md`, `02_ARCHITECTURE_MAP.md`, `03_FEATURE_LIFECYCLE.md`, `04_DATABASE_AND_DATA_LIFECYCLE.md`, `05_INTEGRATIONS_AND_OPERATIONS.md`, `06_TECHNICAL_DEBT.md`, `07_RECOMMENDED_ACTION_PLAN.md`.

---

## 0. Independent review record

Before writing this assessment, the findings in documents 01–07 were re-checked directly against the source with a separate read-only AST/string analysis (no import of `app.py`, no runtime execution). Results:

| Re-verified claim | Result |
| --- | --- |
| `app.py` is 3,570 lines with exactly 72 `@app.route` registrations | CONFIRMED |
| No endpoint named `login`, `read_message`, `dashboard_clear_chat`, or `payment` exists | CONFIRMED |
| `register()` at `app.py:725` calls `url_for('login')` at `app.py:730` → 500 on every attempt | CONFIRMED |
| `internal_view.html:36` uses `message.date` while `dashboard_internal_view()` (`app.py:2998-3031`) passes a raw DB `Message` (`created_at` only, `models.py:84`) | CONFIRMED |
| `/documentation` target file absent; no `alembic.ini`, `migrations/`, `smtp_config.json`, `backups/`, `.git`, or DB file in snapshot | CONFIRMED |
| Data baseline: 3 users, all `role='user'`, none with `is_verified`; 5 portfolios; orphans `sarah_stratege` and `marcus_builds`; global arrays skills=5/projects=0/clients=0/messages=0 | CONFIRMED |
| `SESSION_COOKIE_SECURE=False` at `config.py:10` and `app.py:93`; `DEBUG=True` in `DevelopmentConfig` (`config.py:52`); `FLASK_ENV` absent from `render.yaml` | CONFIRMED |
| `BackgroundScheduler()` started at import (`app.py:120-121`); Gunicorn `--workers 4` (`render.yaml:6`) | CONFIRMED |
| No CSRF token library, no `csrf_token` usage in Python or templates | CONFIRMED |
| `get_unread_messages_count()` (`app.py:1099-1111`) and `get_latest_notifications()` (`app.py:1125-1134`) use different admin filters | CONFIRMED |
| `dashboard_internal_send()` accepts raw `receiver_id` (`app.py:2931`) and calls no notification helper (`app.py:2925-2992`) | CONFIRMED |
| `dashboard_reply_message()` has no participant check (`app.py:1289-1308`) and contains unreachable code at `app.py:1360-1364` | CONFIRMED |
| `create_backup()` copies only `data.json` (`app.py:507-535`); `download_backup` requires only login (`app.py:1940-1954`) | CONFIRMED |
| `sitemap()` emits `/project/<id>` (`app.py:1817-1828`) while the real route is `/portfolio/<username>/project/<int:project_id>` (`app.py:1784`) | CONFIRMED as code path |

**Precision refinements from the review (no change to conclusions):**

1. **Sitemap defect is latent.** Global `projects[]` is currently empty (0), so no invalid `/project/<id>` URLs are emitted with this snapshot. The defect activates as soon as a global project is added. It remains a VERIFIED code-path defect, but not currently observable in output.
2. **`message.date` is correctly scoped.** `message.date` also appears in `messages.html`, `internal_messages.html`, and `view_message.html`, but those receive dictionaries explicitly populated with a `date` key derived from `created_at` (`app.py:2822,2898,3062,2843`). Only `internal_view.html:36` receives a raw DB model and therefore renders blank. No additional defect was missed.
3. **No contradictions found** among documents 01–07 regarding routes, line numbers, severity, or remediation dependencies. The plan's sequencing constraints are consistent with the debt register.

---

## 1. Overall maturity verdict

**Maturity: early-stage prototype operating as a production-like service, with no engineering safety net.**

- The product surface is broad (72 routes, 42 templates, six themes, two messaging models, three notification channels, backups, PDF export), but the implementation is a single 3,570-line module with **no Blueprints, no service layer, no application factory, no tests, no CI, no migrations, and no version-control metadata** (`01` §2–4, `02` §1, `06` TD-46/TD-49).
- Two persistence systems (`data.json` and SQLAlchemy DB) are used without a synchronization or transaction boundary (`04` §1, TD-18). This is the single largest structural risk.
- Several documented "completed" fixes are absent in code (`01` §7, `02` §9, `05` §5.4, TD-48). Documentation cannot be used as evidence of completeness.
- The system **does run as a Flask application** and core public/dashboard flows exist, but active breakage, inconsistent identity, permissive security defaults, and incomplete internal communication make it unsuitable for unattended reliable operation without the Phase 0–2 work in `07`.

**Confidence in this verdict:** HIGH for all source-evidenced findings; UNKNOWN for deployed configuration, production DB state, and runtime concurrency behavior (no runtime test was permitted).

---

## Q1 — What exactly have we built?

A **single-module Flask web application** for a personal/portfolio "proof-of-work" platform with an admin/member dashboard. Concretely (`02` §2–3):

- **`app.py` (3,570 lines, 72 routes):** all routing, authentication, validation, portfolio CRUD, messaging, backups, notification delivery, scheduler, and security middleware in one module. No application factory; the WSGI object `app` is created directly (`app.py:24`).
- **`models.py` (91 lines):** 7 SQLAlchemy models (`Workspace`, `User`, `Project`, `Skill`, `Client`, `Message`, `VisitorLog`) plus a `SafeJSON` type decorator. Only `User`, `Workspace`, and `Message` are actually used in the live data path (`04` §2.3).
- **`config.py` (80 lines):** environment-driven config classes with a hard-coded secret fallback and `sqlite:///codexx.db` final fallback (`config.py:8,29`).
- **`data.json` (11.3 KB):** the *de facto primary store* for users, portfolios, projects, skills, clients, messages, settings, visitors, and notification credentials — despite being labelled "legacy" in docs (`01` §6.1, `04` §5).
- **Templates (42 HTML files):** public site, `pages/` information pages, and a `dashboard/` hierarchy with six selectable themes.
- **Static assets:** one global JS file, several CSS files, six themes, images, favicons.
- **Local filesystem state:** `security/ip_log.json` (127 entries), created-on-import `backups/` (absent in snapshot), and public `static/assets/uploads/`.
- **External side effects:** Telegram Bot API (four send paths), SMTP (five paths), jsDelivr/Google Fonts CDNs, WeasyPrint PDF generation.
- **Deployment descriptors:** `render.yaml` (Gunicorn, 4 workers), `Procfile` (inconsistent bare Gunicorn command), `build.sh`.

This is **not** the Blueprint-based, multi-tenant, CSRF-protected, migration-managed system described in `replit.md` and `audit_plan.md` (`02` §9).

---

## Q2 — How does the system actually work?

The real control flow is (`02` §4–7, `03` A–G):

1. **Startup:** importing `app.py` creates the Flask app, loads config, calls `db.create_all()` (`app.py:36-43`), creates local directories, and **starts two APScheduler jobs at import time** (`app.py:119-122,608-622`). Under Gunicorn with 4 workers this happens four times (INFERENCE, not runtime-tested).
2. **Request handling:** every rendered page goes through `inject_global_vars()` (`app.py:55-85`), which loads `data.json`, computes unread counts, and supplies theme/visitor stats. There is no service layer; routes mutate state directly.
3. **Identity:** login checks the env-derived admin credentials or iterates `data.json users[]` with Werkzeug password hashes (`app.py:2003-2052`). DB `User` rows are never consulted for login. Access is controlled by three decorators reading session booleans (`app.py:625-720`); `disable_in_demo` re-reads JSON on each call.
4. **Public surface:** portfolio pages load per-username JSON, conditionally write visitor stats, and render a selected theme (`app.py:474-504`). `/contact` writes a DB `Message` **and** a legacy JSON copy, then dispatches Telegram/SMTP notifications (`app.py:1657-1780`).
5. **Dashboard:** portfolio content (general/about/skills/projects/clients/social/contact) is JSON-only CRUD (`app.py:2524-2774,3238-3437`). Messages are DB-backed with JSON fallback in selected routes (`app.py:2780-3232`).
6. **Internal communication:** member→admin threads are DB rows with a literal `'admin'` receiver or a stringified JSON integer user ID (`app.py:2925-2992,2998-3035`). The bell badge is a live query plus a 30-second client poll (`base.html:233-309`).
7. **Background:** hourly backup copies `data.json` to local files and retains 20; an hourly "demo reset" job is an empty function (`app.py:507-622`).
8. **Response:** Jinja templates with inline JS; permissive security headers attached in `after_request` (`app.py:3552-3565`).

There is **no transaction spanning JSON and DB**, no central validation, no queued delivery, and no ownership abstraction. Each route re-implements filtering and authorization ad hoc.

---

## Q3 — Which features are genuinely complete?

Complete enough to be relied on, with caveats (`03`, `06` §6):

| Feature | Evidence | Caveat |
| --- | --- | --- |
| Login / logout and session flags | `app.py:2003-2052,2161-2165` | Session-only revocation; weak cookie/secret settings |
| Admin user directory, add user, verification toggle | `app.py:737-846,2059-2156` | Best-effort DB sync; DB failure only warns |
| Per-user portfolio editing (general, about, skills, projects, clients, social, contact, theme) | `app.py:2524-2774,3238-3437` | JSON-only; uploaded files never cleaned up |
| Public portfolio rendering with theme selection | `app.py:474-504,2241-2328` | Orphan portfolio cards lead to 404; catalog empty without `is_verified` |
| Contact form with DB write and notification dispatch | `app.py:1657-1780` | Depends on env/user credentials; dual write can partially fail |
| Basic backup create/list/download/restore for `data.json` | `app.py:507-622,1883-1998` | Not a full DR solution; no validation; download available to any logged-in user |
| DB-backed member→admin internal thread create/list/view/reply | `app.py:2862-3035,1272-1359` | Surrounding guarantees incomplete (see Q4) |
| Error pages for 403/404/500/503 and flash UX | `app.py:1428-1457`, templates | `400.html` unused; 413 handler may loop |
| Werkzeug password hashing; ORM-based SQL | `app.py:5,2029,2084` | No SQL injection found |
| PDF CV generation | `app.py:3519-3548` | Native WeasyPrint dependencies not declared; local success UNKNOWN |

**Not complete:** registration (500), any `read_message` workflow, admin-initiated internal messages via UI, internal message/reply notifications, migrations, CSRF, multi-worker-safe scheduling, restoration of DB/uploads/logs, documentation page.

---

## Q4 — What is the real state of internal communication?

**Verdict: the core flow works; the guarantees around it do not.** (`03` §C, `05` §3)

**Works:** A member can open `/dashboard/messages/internal/compose`, submit to `/dashboard/messages/internal/send` (`app.py:2925-2992`), which persists a DB `Message` with `category='internal'`, `receiver_id='admin'`; the thread appears in `/dashboard/messages/internal` (`app.py:2862-2906`), opens in `internal_view.html` (`app.py:2998-3035`), and replies are added via `dashboard_reply_message()` (`app.py:1272-1359`). View authorization for the *view* route is enforced (`app.py:3009-3012`).

**Broken or incomplete:**

- **No `read_message` endpoint** exists despite `ux_overhaul_plan.md:10`; mark-read is only a side effect of opening a thread, and only the parent is marked (`app.py:3014-3018`) — replies stay unread.
- **Three conflicting unread definitions:** admin count excludes replies (`app.py:1099-1104`), admin poll list includes them (`app.py:1125-1129`), member count includes every unread reply (`app.py:1108-1111`), and dashboard overview uses JSON `messages[]` (`app.py:2201-2205`). The server badge is overwritten by poll length in `base.html:245-267`.
- **No delivery notifications** for new internal messages or replies (`app.py:2925-2992,1272-1359`); recipients discover them only via the 30 s poll.
- **`receiver_id` is unvalidated** (`app.py:2931,2958,2980`): nonexistent IDs, self-sends, and cross-workspace IDs are accepted.
- **Reply route lacks a participant check** (`app.py:1289-1308`): any logged-in user with a message UUID can inject a reply.
- **"Archive Thread" is a hard delete** (`internal_view.html:75-79` → `app.py:3124-3163`), leaving replies orphaned; sender cannot delete own sent message.
- **Admin cannot initiate a thread via any reachable UI:** compose button hidden for admins (`internal_messages.html:16-20`), `user_profile.html` unreferenced, `/dashboard/chat` redirects (`app.py:1250-1266`), and `chat.html` references the missing `dashboard_clear_chat`.
- **UI defect:** initial parent timestamp renders blank because `internal_view.html:36` uses `message.date` on a DB model that only has `created_at` (re-verified; other templates are fine).
- **Polling endpoint is unauthenticated** (`app.py:1117-1154`) and silently returns `[]` on any exception, including NULL `created_at`.
- **No workspace filtering** on message queries (`app.py:2796-2814,2872`).

---

## Q5 — How does every major tool operate throughout its lifecycle?

| Tool / subsystem | Creation → use → update → deletion / end state | Source |
| --- | --- | --- |
| **Auth/session** | Login compares env admin or JSON hashes → sets session flags → decorators re-read JSON in demo mode → `logout` clears session; no server-side revocation | `app.py:625-720,2003-2052,2161-2165` |
| **User account** | Add: JSON append + best-effort DB `User`/`Workspace` sync → verify flag is the only synced update → demo flag/password are JSON-only → delete removes JSON only, orphaning DB rows/files | `app.py:788-904,2059-2156,3443-3505`; `03` A.4 |
| **Portfolio/project/skill/client** | Forms → JSON mutations via `load_data`/`save_data` → public render; images written to public uploads and never deleted on replacement/delete | `app.py:2524-2774,3238-3437`; `03` B |
| **Contact message** | Form → DB `Message` + JSON legacy copy (both writes, no transaction) → notifications dispatched → read flag updated in one store only → delete touches both | `app.py:1657-1780,1727-1754,3124-3163` |
| **Internal message/thread** | DB insert → thread deduplicated by first parent → parent read flag toggled on view → reply inserted with `parent_id` → "archive" hard-deletes parent only | `app.py:2925-2992,2998-3035,1272-1359,3124-3163` |
| **Notification bell** | Server query for badge → 30 s `fetch` of latest unread → JS overwrites badge and builds links → no mark-read API → list silently empties on error | `base.html:233-309`, `app.py:1090-1154` |
| **Telegram** | Four send helpers with three config sources → HTTPS `sendMessage` (sync or detached threads) → results discarded; no retry/queue/audit; settings routes perform live sends | `app.py:206-402,907-1009,2334-2397,2487-2518`; `05` §1 |
| **SMTP** | Five paths (helper, admin thread, unused confirmation, two inline blocks) → `starttls`+login+send → results unrecorded, no timeouts in sync paths; test route sends real mail | `app.py:371-402,241-262,1411-1416,1585-1653,1630-1648,2439-2481` |
| **Backup** | Hourly import-time job or manual POST → copy `data.json` only → metadata append → retain 20 → restore overwrites JSON without validation → download available to any logged-in user | `app.py:507-622,1883-1998`; `04` §7 |
| **Scheduler** | Two cron jobs started at import → hourly backup + no-op demo reset → logged failures only → `atexit` shutdown; no job store/locking | `app.py:119-122,593-622`; `05` §4 |
| **Visitor log** | Public portfolio GET → `track_visitor()` writes JSON and dedups per day → trimmed at 1000 entries → never deleted; `VisitorLog` model unused | `app.py:167-194,1157-1203` |
| **PDF CV** | `/download-cv` → lazy WeasyPrint import → render `cv_preview.html` → in-memory PDF → response; native deps undeclared | `app.py:3510-3548` |

---

## Q6 — What is redundant, broken, obsolete, or unnecessarily complicated?

**Broken (active):** `/register` → missing `login` endpoint (TD-01); `read_message` missing (TD-02); `/documentation` always 404 and invalid sitemap path (TD-13 — sitemap currently latent because global projects=0); orphan portfolios (TD-14); empty catalog due to missing `is_verified` (TD-15); `internal_view.html` blank date (TD-07).

**Redundant / duplicated:** `data.json` + DB representations of the same concepts with divergent IDs and read flags (TD-18/20); four Telegram senders and five SMTP paths (TD-41); config duplicated between `config.py` and `app.py:88-96` including double DB-URL normalization (TD-51); message filtering repeated in at least four functions (TD-50); duplicate/unpinned dependency blocks with five unused packages (TD-45).

**Obsolete / dead:** `Project`/`Skill`/`Client`/`VisitorLog` models unused (TD-26); deprecated `/dashboard/chat` that only redirects and `chat.html` referencing missing `dashboard_clear_chat` (TD-10); unreferenced templates including `subscription.html` with missing `payment` endpoint (TD-17); unreachable code at `app.py:1360-1364` and `3106-3118`, dead `conf` import at `1481-1483` (TD-11); hourly no-op `reset_demo_data()` (TD-12); unused helpers `DEMO_USER_CREDENTIALS`, `TELEGRAM_ENABLED`, `load_telegram_config`, `save_smtp_config`, `mark_message_as_read`, `save_message`, `send_confirmation_email` (`02` §8); `JSON_AS_ASCII` obsolete in Flask 3 (TD-29).

**Unnecessarily complicated:** six themes plus inline JS in multiple templates tied to a permissive CSP; per-request JSON rewrites with no atomicity; demo-mode endpoint allow/block lists naming routes that do not exist (`app.py:684,698`); literal `'admin'`, integer JSON IDs, and UUID DB IDs coexisting in one message schema.

**Misleading documentation:** `replit.md:45-51`, `audit_plan.md:30-38`, and `ux_overhaul_plan.md:10` assert fixes/features that are not in code (TD-48).

---

## Q7 — What should be preserved?

The working business logic and conventions that should remain behaviorally unchanged during remediation (`06` §6):

1. Login against env admin and JSON users, session flags, and logout clearing the session.
2. Per-user JSON portfolio isolation for general/about/skills/projects/clients/social/contact/theme.
3. Public portfolio rendering and the six-theme selection system.
4. DB-backed two-party internal thread create/list/view/reply for member→admin.
5. Contact form dual write plus notification dispatch (until a single authoritative store is chosen).
6. User verification criteria check and the admin-only user directory.
7. Basic backup create/list/download/restore mechanics for `data.json`.
8. Werkzeug password hashing and ORM-based SQL (no SQL injection found).
9. Error pages for 403/404/500/503 and the existing flash-message UX.
10. Existing URLs, flash strings, template hierarchy, and UI behavior unless a phase explicitly changes them.

**Do-not-touch sequencing constraints:** keep legacy JSON readers until DB parity is proven; keep Alembic in dependencies until migrations are introduced; do not tighten CSP before externalizing/noncing inline scripts; do not switch auth to DB before password hashes are reconciled; do not delete "unused" templates before ruling out external deep links; never run live Telegram/SMTP test sends.

---

## Q8 — What should be cleaned or corrected?

In priority order (full register in `06`, sequenced in `07`):

1. **Active breakage:** fix `url_for('login')` (TD-01); implement an authorized read-state endpoint (TD-02); fix the `internal_view.html` date (TD-07); fix or remove broken SEO/help routes (TD-13).
2. **Internal communication correctness:** one canonical unread query (TD-03); internal message/reply notifications (TD-04); validate `receiver_id` and reject self-send (TD-05); participant checks on reply/delete (TD-06/TD-33); decide archive vs delete (TD-08); give admins a compose UI (TD-09).
3. **Security:** CSRF + convert state-changing GETs to POST (TD-30); authenticate/guard the notifications endpoint (TD-16); centralize ownership checks (TD-33); `SESSION_COOKIE_SECURE` from environment and require `SESSION_SECRET` in production (TD-31/32); tighten CSP after inline-JS work (TD-31); escape Telegram HTML payloads (TD-35); trusted-proxy parsing and rate limiting on login/test endpoints (TD-34/38); fix `innerHTML` XSS sinks (TD-36).
4. **Data integrity:** define one authoritative store; atomic JSON writes with locking (TD-24); reconcile JSON↔DB user IDs and password hashes (TD-20/22); complete deletion cleanup (TD-21); move secrets out of `data.json` and rotate them (TD-23); full backup set with restore drill (TD-25); introduce Alembic migrations (TD-19); add FKs/indexes for message thread fields (TD-20).
5. **Operations:** explicit production config and no debug in production (TD-39); single/locked scheduler (TD-40); provision all env vars and clean dependencies (TD-44/45); timeouts, retry, and delivery log (TD-42/43); logging/alerting (TD-47/4.7).
6. **Cleanup last:** dead code/templates, duplicate helpers/config, documentation corrections, then incremental Blueprint extraction **without rewriting business logic** (TD-10/11/17/41/48/49/50/51/52/53).

---

## Q9 — What is the safest order of execution?

Follow `07_RECOMMENDED_ACTION_PLAN.md` exactly; no rewrite:

- **Phase 0 — Baseline and safety (do first):** establish real Git baseline and commit the unchanged tree; snapshot `data.json`, IP log, uploads, DB/backups if present; inventory env var *names*; create an isolated copy; add a test harness that avoids import-time side effects. Skipping this makes every later change un-attributable and un-rollbackable.
- **Phase 1 — Active breakage and communication correctness:** fix registration redirect, thread date, canonical unread query, read-state endpoint, receiver validation, reply participant check, archive semantics, and internal notification dispatch. Do not change the data model here.
- **Phase 2 — Security hardening without architecture change:** CSRF/POST conversions, notification endpoint guard, ownership checks, cookie/secret configuration, CSP only after inline-JS extraction, Telegram escaping, proxy/rate-limit fixes.
- **Phase 3 — Data integrity and secrets (highest risk):** JSON atomic writes, authoritative store decision and credential reconciliation, deletion cleanup, secret extraction/rotation, orphan/verification reconciliation, then migrations and FKs. Every step first on an isolated copy with a restore drill.
- **Phase 4 — Operational reliability:** production config, single/locked scheduler, full backups with restore drill, send timeouts/retry/log, dependency and env cleanup, structured logging.
- **Phase 5 — Cleanup and consolidation (last):** dead code/templates, duplicate config/notifications, broken SEO routes, incremental Blueprint extraction, documentation updates.

**Dependencies that must not be violated:** canonical unread semantics before read-state endpoint (1.3→1.4); receiver validation before notification wiring (1.6→1.9); identity semantics before ownership/DB work (Phase 1/2→3); Alembic baseline before FK migration (3.7→3.6); inline-JS extraction before CSP tightening (2.5a→2.5b); preserve Alembic dependency until migrations exist. Phases 1 and 2 may partially overlap after Phase 0; Phase 3 must not begin until identity is settled; Phase 5 is strictly last.

---

## 2. Verified functionality summary

| Area | Verified working | Verified broken / incomplete |
| --- | --- | --- |
| Identity | Login, logout, admin user add/list/verify | Registration (500), demo login unused, DB roles/`is_active` ignored, stale privileges |
| Portfolio | Per-user JSON CRUD, public render, themes | Orphan portfolios, empty catalog, uploads never cleaned |
| Messaging | Contact dual write + notifications; member→admin DB threads | read_message missing, 3 unread definitions, no internal notifications, reply/delete auth gaps, mislabeled delete |
| Notifications | Telegram/SMTP dispatch on contact/login/user events | 4 Telegram + 5 SMTP paths, no retry/dedup/audit, plaintext secrets, live test endpoints |
| Data | 7 models declared; JSON store works | No migrations, dual unsynchronized stores, ID mismatch, incomplete deletion, JSON-only backups |
| Operations | Backup create/list/restore, error pages, IP log | DEBUG default on, 4 duplicate schedulers, permissive CSP, no CSRF, no shared rate limit, local-FS-only state |
| Documentation | Routes/templates broadly match feature names | Security/completion claims unsupported by code |

---

## 3. Unresolved questions (require access not available in this snapshot)

1. **Repository identity:** remote, branch, commit, and working-tree status — UNKNOWN (no `.git`, no Git CLI).
2. **Production DB:** engine in use, schema version, row counts, and whether tables were created from the current models — UNKNOWN (no DB file present).
3. **Deployed environment:** actual values/names for `FLASK_ENV`, `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_*`, `TELEGRAM_*`, `SMTP_*` — UNKNOWN (audit shell has none; `render.yaml` omits several).
4. **Runtime concurrency:** whether duplicate schedulers and JSON write races actually manifest under the 4-worker deployment — INFERENCE only; no runtime test was performed because importing `app.py` is state-changing.
5. **External links:** whether any bookmarked/emailed deep links target `chat.html`, `subscription.html`, `user_profile.html`, `/register`, or `/documentation` — UNKNOWN; blocks deletion decisions in Phase 5.
6. **WeasyPrint success** in the deployment image — UNKNOWN; native libraries not declared in `build.sh`.
7. **Backup persistence** on the hosting platform — UNKNOWN; no persistent disk in `render.yaml`, local-FS state may not survive restarts.
8. **Data ownership** of orphan portfolios and the intended `is_verified` default — business decisions, not code facts.

---

## 4. Operational risk summary

| Risk | Severity | Evidence |
| --- | --- | --- |
| No VCS baseline; changes un-attributable | High | `01` §2 |
| DEBUG defaults on in production config selection | High | `config.py:52,79`; `render.yaml` no `FLASK_ENV` |
| Dual unsynchronized stores with no transaction | High | `04` §1, TD-18 |
| No migrations; schema drift undetectable | High | `app.py:36-43`; no Alembic files |
| No CSRF; GET state changes; weak authorization | High | TD-30, TD-33 |
| Plaintext notification secrets in `data.json`, downloadable by any logged-in user | High | TD-23; `app.py:1940-1954` |
| Per-worker schedulers duplicate backups | High (INFERENCE) | `app.py:119-122`; `render.yaml:6` |
| Backups exclude DB/uploads/IP log; local FS only | High | TD-25 |
| Inconsistent internal communication state and no delivery guarantees | High | Q4 |
| Permissive CSP; insecure cookie/secret defaults | Medium/High | TD-31/32 |
| No retry/dedup/audit on notifications | Medium | TD-42 |
| Docs assert completed security fixes that are absent | Medium | TD-48 |

---

## 5. Recommended next step

**Single next step:** execute **Phase 0 of `07_RECOMMENDED_ACTION_PLAN.md`** — establish a real, attributable Git baseline and take verified snapshots of all mutable state (`data.json`, IP log, uploads, DB/backups if present), then create an isolated copy and a side-effect-free test harness. Do **not** change application code, schema, data, dependencies, or integrations until that baseline exists and is recorded.

**After Phase 0, the highest-value first code change is Phase 1.1:** replace `url_for('login')` with `url_for('dashboard_login')` in `register()` (`app.py:730`), followed by the internal-communication correctness items in Phase 1.3–1.9.

---

## 6. Audit closure statement

All eight audit documents are complete. The audit was strictly read-only: no application source, database, schema, dependency, Git state, integration configuration, real message, or scheduled job was created, modified, or triggered. The only files created are:

```
AUDIT/01_SYSTEM_BASELINE.md
AUDIT/02_ARCHITECTURE_MAP.md
AUDIT/03_FEATURE_LIFECYCLE.md
AUDIT/04_DATABASE_AND_DATA_LIFECYCLE.md
AUDIT/05_INTEGRATIONS_AND_OPERATIONS.md
AUDIT/06_TECHNICAL_DEBT.md
AUDIT/07_RECOMMENDED_ACTION_PLAN.md
AUDIT/FINAL_ASSESSMENT.md
```

**Stopping here as instructed.** No implementation, refactoring, cleanup, dependency change, migration, or deployment action has been performed. Explicit approval is required before any implementation begins.
