# 02 — Source Code Reconstruction

**Discovery date:** 2026-11-19
**Scope:** Architecture and internal logic of the Python application: entry points, routes, models, persistence, authentication, messaging, notifications, uploads, schedulers, configuration, and mismatches. Only `app.py`, `models.py`, and `config.py` exist as Python modules; no additional utility modules were found.

---

## Evidence conventions

| Label | Meaning |
| --- | --- |
| VERIFIED FACT | Directly observed in source/config/data with a file/line reference. |
| DOCUMENTED INTENT | Stated in docs or deployment descriptors. |
| OWNER-PROVIDED CONTEXT | Supplied by the product owner. |
| INFERENCE | Reasoned interpretation supported by evidence. |
| STRATEGIC PROPOSAL | Possible future direction only. |
| UNKNOWN | Insufficient evidence. |

References: `app.py:<line>`, `models.py:<line>`, `config.py:<line>`. All paths are under `D:\Codexx-Academy-F-VV-main`.

---

## 1. Architecture summary

**VERIFIED FACT:** The application is a single Flask module:
- `app.py` is 3,570 lines and 131,660 bytes; the WSGI object `app` is created directly at `app.py:24`.
- There are **70 route functions / 72 `@app.route` decorators** and 5 error handlers.
- `models.py` is 91 lines and defines one shared `db = SQLAlchemy()` plus seven models and a `SafeJSON` type decorator.
- `config.py` is 80 lines and defines environment-driven config classes.
- No application factory, Blueprints, service layer, test suite, migrations, or additional Python modules exist.

**INFERENCE:** This is a monolithic prototype-style architecture. Route handlers directly read/write state, invoke external notifications, render templates, and perform authorization checks inline. There is no separation between presentation, domain logic, and persistence.

### 1.1 Startup sequence

**VERIFIED FACT:** Importing `app.py` performs state-changing work:
1. Loads config via `get_config()` / `app.config.from_object(conf)` (`app.py:24-26`).
2. Normalizes `postgres://` to `postgresql://` (`app.py:28-32`).
3. Calls `db.init_app(app)` (`app.py:34`).
4. Calls `db.create_all()` and executes `SELECT 1` inside an app context; failures are logged only (`app.py:36-43`).
5. Builds env admin credentials and hashes the admin password at import (`app.py:100-113`).
6. Builds a hard-coded demo credential hash (`app.py:198-202`).
7. Creates directories: upload folder (`app.py:116`), `backups/` (`app.py:117`), `security/` (`app.py:132`).
8. Registers a context processor that performs JSON loads on every request (`app.py:55-85`).
9. Starts a `BackgroundScheduler` at import (`app.py:120-122`) and registers `atexit` shutdown.
10. Adds two hourly cron jobs *after* scheduler start (`app.py:608-622`): hourly backup and a no-op demo reset.
11. Installs global `after_request` security headers (`app.py:3551-3565`).
12. Under direct execution, runs `app.run(host='0.0.0.0', port=5000, debug=True)` (`app.py:3568-3570`).

**INFERENCE:** Because `render.yaml:6` starts Gunicorn with 4 workers, each worker imports `app.py` and would start its own scheduler and directory/DB initialization. No distributed lock or shared job store exists, so duplicate hourly backups are likely in production (runtime concurrency not tested).

---

## 2. Route map

**VERIFIED FACT:** Route inventory below was derived from AST/decorator parsing. Default methods are GET unless stated; Flask also adds implicit HEAD/OPTIONS. Custom decorators are defined at `app.py:625` (`login_required`), `app.py:638` (`admin_required`), and `app.py:651` (`disable_in_demo`).

### 2.1 Public / informational routes

| Route | Endpoint | Lines | Status |
| --- | --- | --- | --- |
| `/portfolio/<username>` | `user_portfolio` | `app.py:473-504` | Renders per-user JSON portfolio; 404 if user absent; admin redirected to landing. |
| `/` | `index` | `1461-1491` | Renders `landing.html`. |
| `/landing` | `landing` | `1494-1497` | Redirects to `/`. |
| `/verification`, `/privacy`, `/terms`, `/about`, `/mastery`, `/standards`, `/security-audit` | respective endpoints | `1500-1539` | Static informational pages. |
| `/catalog` | `catalog` | `1542-1582` | Verified-member directory; hides unverified portfolios from anonymous visitors. |
| `/portfolio/<username>/project/<int:project_id>` | `project_detail` | `1783-1800` | JSON-only project lookup. |
| `/sitemap.xml` | `sitemap` | `1803-1847` | Emits invalid `/project/<id>` URLs; no portfolio URLs. |
| `/robots.txt` | `robots` | `1850-1871` | Allows `/project/` path that has no route. |
| `/favicon.ico` | `favicon` | `1874-1877` | Sends `static/favicon.ico`. |
| `/guides/telegram-bot-token`, `/guides/telegram-chat-id` | guide endpoints | `2214-2226` | Static guides. |
| `/documentation` | `documentation` | `2226-2235` | Reads a missing file path → always renders `404.html`. |
| `/cv-preview`, `/download-cv` | CV endpoints | `3508-3548` | `@disable_in_demo`, no login; WeasyPrint PDF generation. |

### 2.2 Contact / notification polling

| Route | Endpoint | Lines | Status |
| --- | --- | --- | --- |
| `/dashboard/notifications/latest` | `get_latest_notifications` | `1117-1154` | Public URL; returns `[]` when no session identity; no auth decorator. |
| `/contact/academy` POST | `contact_academy` | `1367-1425` | Inserts `platform` message; sends admin notification and email. |
| `/contact` POST | `contact` | `1656-1780` | Portfolio inquiry; dual DB/JSON write; notification dispatch. |

### 2.3 Auth / session

| Route | Endpoint | Lines | Status |
| --- | --- | --- | --- |
| `/register` GET/POST | `register` | `724-730` | **Broken**: calls missing `url_for('login')` → `BuildError`/500. |
| `/dashboard/login` GET/POST | `dashboard_login` | `2002-2052` | Env admin or JSON user login. |
| `/dashboard/logout` | `dashboard_logout` | `2159-2165` | `session.clear()`; guarded by `login_required`. |

### 2.4 Dashboard core / user administration

| Route | Endpoint | Lines | Notes |
| --- | --- | --- | --- |
| `/dashboard/users` | `dashboard_users` | `733-741` | Admin only. |
| `/dashboard/user/<int:user_id>` | `dashboard_view_user` | `744-774` | JSON user lookup; DB verification sync mismatch. |
| `/dashboard/access-instructions` | `access_instructions` | `777-781` | Login required. |
| `/dashboard/users/toggle-verification/<user_id>` POST | `dashboard_toggle_user_verification` | `784-846` | Requires full access + ≥3 JSON projects. |
| `/dashboard/user/<int:user_id>/toggle-demo` POST | `toggle_user_demo` | `849-874` | Demo POST restriction applies. |
| `/dashboard/user/<int:user_id>/delete` POST | `delete_user` | `877-904` | JSON-only deletion; DB row orphaned. |
| `/dashboard/users/add` POST | `dashboard_add_user` | `2055-2156` | JSON write plus best-effort DB sync. |
| `/dashboard` | `dashboard` | `2168-2211` | Main dashboard. |

### 2.5 Settings / integrations

| Route | Lines | Notes |
| --- | --- | --- |
| `/dashboard/settings` GET/POST | `2238-2328` | Theme selection, backup UI; DEMO GET blocked by decorator. |
| `/dashboard/telegram` POST | `2331-2397` | Saves Telegram config; may send test events. |
| `/dashboard/smtp` POST | `2400-2436` | Saves SMTP config. |
| `/dashboard/email-test` POST | `2439-2481` | Live SMTP test endpoint (blocked in discovery runtime). |
| `/dashboard/telegram-test` POST | `2484-2518` | Live Telegram test endpoint (blocked in discovery runtime). |

### 2.6 Portfolio editors

| Area | Lines | Persistence |
| --- | --- | --- |
| General/profile + photo | `2521-2546` | JSON + upload file. |
| About | `2549-2563` | JSON. |
| Skills | `2566-2599` | JSON. |
| Projects list/add/edit/delete | `2602-2723` | JSON + upload files. |
| Contact info | `2726-2746` | JSON. |
| Social links | `2749-2774` | JSON; POST blocked in demo. |

### 2.7 Clients / account

| Route | Lines | Notes |
| --- | --- | --- |
| `/dashboard/clients` | `3235-3253` | Private client list. |
| `/dashboard/clients/add` GET/POST | `3256-3349` | Sends Telegram lead notice. |
| `/dashboard/clients/edit/<int:client_id>` | `3352-3406` | Sends Telegram status-change notice. |
| `/dashboard/clients/view/<int:client_id>` | `3409-3422` | Login only; no demo decorator. |
| `/dashboard/clients/delete/<int:client_id>` | `3425-3437` | State-changing GET. |
| `/dashboard/change-password` | `3440-3498` | JSON hash only. |

### 2.8 Messaging

| Route | Lines | Notes |
| --- | --- | --- |
| `/dashboard/chat[/<user_id>]` | `1246-1266` | Deprecated; redirects except admin list without ID. |
| `/dashboard/messages/reply/<message_id>` POST | `1269-1359` | No participant check; dead tail at `1360-1364`. |
| `/dashboard/messages` | `2777-2856` | DB + JSON legacy merge. |
| `/dashboard/messages/internal` | `2859-2906` | Internal parent list; per-user Python filter. |
| `/dashboard/messages/internal/compose[/<receiver_id>]` | `2909-2919` | Receiver from URL; backend admin-initiation path hidden in UI. |
| `/dashboard/messages/internal/send` POST | `2922-2992` | Raw `receiver_id`; no policy validation. |
| `/dashboard/messages/internal/view/<message_id>` | `2995-3035` | Only route with explicit participant/admin check. |
| `/dashboard/messages/view/<message_id>` | `3038-3105` | Dual DB/JSON lookup; dead tail at `3106-3118`. |
| `/dashboard/messages/delete/<message_id>` | `3121-3163` | Destructive GET labelled "Archive" in UI. |
| `/dashboard/messages/convert/<message_id>` | `3166-3232` | State-changing GET; creates JSON client. |

### 2.9 Backup / API

| Route | Lines | Notes |
| --- | --- | --- |
| `/dashboard/backups` | `1881-1885` | Redirects to settings anchor. |
| `/backup/create` POST | `1888-1907` | Login only; demo restrictions do not apply. |
| `/backup/restore/<filename>` POST | `1910-1937` | Restores JSON after recovery copy. |
| `/backup/download/<filename>` | `1940-1958` | Login only. |
| `/backup/delete/<filename>` POST | `1961-1986` | Deletes backup file/metadata. |
| `/api/backups` | `1989-1998` | JSON metadata only. |

### 2.10 Error handlers

**VERIFIED FACT:** `app.py:1428` (403), `1434` (404), `1440` (500, logs error), `1447` (503), `1453` (413 flash + redirect to same URL). The 413 redirect can loop if the oversized request is retried (INFERENCE). `400.html`, `403.html`, and `503.html` extend a missing `templates/base.html` (presentation inventory).

---

## 3. Data models

**VERIFIED FACT:** `models.py` defines:

| Model | Lines | Key fields | Usage |
| --- | --- | --- | --- |
| `SafeJSON` | `9-18` | TypeDecorator selecting PostgreSQL `JSONB` or generic `JSON` | Column type for `User.badges`, `Project.technologies` |
| `Workspace` | `20-28` | UUID `id`, unique `slug`, `name`, `plan`, timestamps | Created only on user add (`app.py:2130-2147`) |
| `User` | `30-41` | UUID `id`, `workspace_id` FK, unique username/email, `password_hash`, `role`, `is_active`, `is_verified`, `badges` | Queried at `app.py:837,1259,1699,2137-2148`; many fields unused |
| `Project` | `43-51` | workspace FK, title, description, image, technologies | **Unused** in live data path; JSON-only projects |
| `Skill` | `53-59` | workspace FK, name, level | **Unused** |
| `Client` | `61-68` | workspace FK, name, email, status | **Unused** |
| `Message` | `70-84` | UUID `id`, nullable `workspace_id`, name/email/message, `is_read`, `is_internal`, `sender_id`, `receiver_id`, `parent_id`, `sender_role`, `category`, `created_at` | Central messaging table |
| `VisitorLog` | `86-91` | workspace FK, IP address, timestamp | **Unused**; visitors tracked in JSON |

**VERIFIED FACT:** There are no `relationship()` declarations, cascade rules, indexes, or `ondelete` clauses. `parent_id`, `sender_id`, and `receiver_id` are plain `String` columns with no FK.

**VERIFIED FACT:** DB `User.id` defaults to a UUID string (`models.py:32`) while JSON users have integer IDs (`app.py:2082`; `data.json` users 1/2/3). Verification sync uses `db.session.get(User, str(user_id))` with an integer from the URL (`app.py:837`), and compose uses `User.query.get(receiver_id)` with template/form values (`app.py:2885,2917`). These identifier spaces likely miss (INFERENCE).

---

## 4. Dual persistence

### 4.1 JSON authority

**VERIFIED FACT:** `load_data(username=None)` (`app.py:411-446`):
1. Reads `data.json` if present.
2. With a username, returns `data['portfolios'][username]` verbatim if present.
3. Otherwise constructs a default portfolio template with `settings.theme='luxury-gold'` and empty arrays.
4. Without a username, returns the whole document.
5. On any exception, logs and returns `{}`.

**VERIFIED FACT:** `save_data(user_data, username=None)` (`app.py:449-470`):
1. Re-reads the whole `data.json` from disk.
2. With username, assigns `all_data['portfolios'][username] = user_data`.
3. Without username, updates top-level keys (e.g. `users`).
4. Writes the whole document back with UTF-8, `ensure_ascii=False`, `indent=2`.
5. Logs exceptions but does not raise.

**INFERENCE:** This is a read-modify-write of one shared JSON file without locking or atomic rename; concurrent requests can lose updates. Per-user isolation is only a nested dictionary keyed by session/route username.

**VERIFIED FACT:** Other JSON stores:
- `backups/backups.json` metadata (`app.py:544,562,1978`).
- `smtp_config.json` fallback (`app.py:351-364`); absent in checkout.
- `security/ip_log.json` activity log (`app.py:131,167-194`; trims to 1000 at `app.py:189`).

### 4.2 SQL usage and consistency gaps

**VERIFIED FACT:** `db.session` operations are direct: user/message/workspace inserts (`app.py:1307,1403,1739,2133,2148,2963,2984`), commits (`app.py:840,1308,1404,1740,2134,2149,2967,2985,3018,3055,3093,3136`), deletion (`app.py:3135`), and rollbacks in some paths. No explicit transaction spans JSON and DB.

**VERIFIED FACT:** Specific divergences:
- `/contact` commits DB then writes JSON and dispatches notifications; exception rollback only affects DB (`app.py:1727-1778`).
- `dashboard_add_user` writes JSON first and optionally syncs DB; DB failure only warns (`app.py:2081-2153`).
- `delete_user` removes JSON user/portfolio but never deletes DB `User` (`app.py:896-902`).
- `dashboard_change_password` updates JSON hash only (`app.py:3492-3494`).
- `track_visitor()` writes per-user JSON visitors (`app.py:1163,1201`) but `get_visitor_count()` reads global `visitors` (`app.py:1206-1209`).
- `dashboard_toggle_user_verification` saves JSON then commits DB; its outer exception handler does not roll back (`app.py:834-846`).

**INFERENCE:** JSON is the de facto authoritative store for login, portfolios, settings, visitors, and notification credentials. SQL is authoritative only for message rows. There is no reconciliation mechanism.

---

## 5. Authentication and authorization

### 5.1 Identity sources

**VERIFIED FACT:** Env admin:
- `get_admin_credentials()` reads `ADMIN_USERNAME`/`ADMIN_PASSWORD` and hashes at import; missing values disable env-admin login (`app.py:100-110`).
- Login sets `admin_logged_in`, `is_admin=True`, `is_demo_mode=False`, `username`; **no `user_id`** (`app.py:2011-2023`).

**VERIFIED FACT:** JSON users:
- Login loops `data['users']` and verifies Werkzeug hashes (`app.py:2026-2047`).
- Sets `user_id`, `is_admin = (role == 'admin')`, `is_demo_mode = user.get('is_demo', True)` (`app.py:2031-2039`).
- `session['email']` is never set, yet handlers read it (`app.py:1298,1338,1379,2953,2975`), so member emails are often empty.

**VERIFIED FACT:** `DEMO_USER_CREDENTIALS` at `app.py:198-202` is unused; demo behavior comes from JSON `is_demo`.

### 5.2 Decorators

**VERIFIED FACT:** `login_required` checks only `session['admin_logged_in']` (`app.py:625-635`) — despite the name, it gates all logged-in users. `admin_required` checks `session.get('is_admin')` (`app.py:638-648`). `disable_in_demo` (`app.py:651-720`) refreshes demo/admin flags from JSON only when `user_id` exists, has an unused `allowed_endpoints` list, blocks only listed POST endpoints, fully blocks three settings/backup endpoints, and does not block state-changing GETs.

**INFERENCE:** Authorization is session-boolean based, route-local, and vulnerable to stale privileges and inconsistent identity values. Hidden UI controls are not security boundaries.

### 5.3 Security headers

**VERIFIED FACT:** `after_request` at `app.py:3551-3565` sets a permissive CSP (`default-src *`, `frame-ancestors *`), `X-Content-Type-Options: nosniff`, and HSTS. No `X-Frame-Options` header is set. `SESSION_COOKIE_SECURE` is forced false at `app.py:93`, overriding config.

---

## 6. Internal messaging

**VERIFIED FACT:** The `messages` table mixes contact, platform, and internal categories. A thread is a root `Message` with `parent_id=None` plus replies referencing the root UUID (`models.py:70-84`; `app.py:2941-2969`). No Conversation model, direction flag, initiator flag, or archive state exists.

**VERIFIED FACT:** `dashboard_internal_send()` (`app.py:2922-2992`) accepts raw `receiver_id` from the form (`app.py:2931`), truncates content to 5000 chars, finds or creates a root, and inserts replies. No receiver existence check, self-send check, or member→member prohibition exists in source.

**VERIFIED FACT:** `dashboard_reply_message()` (`app.py:1269-1359`) accepts any message ID and computes the other party from the row; no participant check. Dead duplicated code follows at `app.py:1360-1364`.

**VERIFIED FACT:** `dashboard_internal_view()` (`app.py:2995-3035`) is the only messaging route with explicit admin-or-participant enforcement (`app.py:3009-3012`). It marks the parent read and loads direct replies.

**VERIFIED FACT:** "Archive" link (`templates/dashboard/internal_view.html:75-79`) calls `dashboard_delete_message()` (`app.py:3121-3163`), which performs `db.session.delete()` and removes the current user's JSON copy. Replies become orphaned. No restore route exists.

**VERIFIED FACT:** Neither internal send nor reply dispatches a notification helper. Recipients rely on polling (`app.py:1090-1154`; `templates/dashboard/base.html:233-309`).

**VERIFIED FACT / INFERENCE:** Env admin has no `session['user_id']`, so `str(session.get('user_id'))` yields `"None"` in internal send/reply/list/view (`app.py:2927,1274,2866,3001`). Admin-sent rows carry `sender_id='None'`; member replies to them target `"None"`, while admin unread/notification queries require `'admin'` (`app.py:1103,1128`). Admin-originated threads therefore break unread accounting.

**VERIFIED FACT:** Admin initiation exists at the backend via `/dashboard/messages/internal/compose/<receiver_id>` (`app.py:2910`) but the UI hides the compose button for admins (`templates/dashboard/internal_messages.html:16-20`), and `user_profile.html` with compose links is unreferenced. Compose performs `User.query.get(receiver_id)` (`app.py:2917`), but callers pass JSON integer IDs; on failure the template defaults to `'admin'`.

**VERIFIED FACT:** Workspace separation is not enforced for messages. `workspace_id` is nullable (`models.py:73`), omitted in most writes, and no message query filters on it.

---

## 7. Contact forms and notification dispatch

**VERIFIED FACT:** `/contact` (`app.py:1656-1780`) applies honeypot and in-memory rate limiting (10/60s, helpers at `app.py:126-164`), aggregates inquiry fields, inserts a `Message` with `sender_role='visitor'` and category `platform`/`portfolio`, appends a legacy JSON copy to the target portfolio, dispatches user/admin notifications, and logs IP activity.

**VERIFIED FACT:** `/contact/academy` (`app.py:1367-1425`) inserts a `platform` message with no `receiver_id`/`workspace_id`, calls `send_admin_notification` and `send_email` with `ADMIN_EMAIL` fallback `admin@codexx.academy`. Because it lacks `receiver_id='admin'`, it will not match admin unread queries (INFERENCE).

**VERIFIED FACT:** Notification integrations:
- Admin config env vars: `ADMIN_TELEGRAM_BOT_TOKEN`, `ADMIN_TELEGRAM_CHAT_ID`, `ADMIN_SMTP_HOST`, `ADMIN_SMTP_PORT`, `ADMIN_SMTP_EMAIL`, `ADMIN_SMTP_PASSWORD` (`app.py:206-219`). Telegram uses `requests.post` in a thread; SMTP uses STARTTLS in a thread with silent bare `except: pass`.
- User config is stored in `portfolios[username].notifications.telegram/smtp` with `smtp_config.json` fallback (`app.py:304-357`).
- Additional synchronous send helpers at `app.py:907-1009`; async wrappers use daemon threads.
- Login, verification, access, password, and lead/status events also send notifications (`app.py:817-870,2019-2046,3337-3400,3469-3473`).
- Backup event names `backup_created`/`backup_restored` are absent from the event map (`app.py:958-975,1898-1932`) → generic fallback text.

**VERIFIED FACT:** Unused helpers: `save_message()` (`1012-1087`), `send_confirmation_email()` (`1585-1653`), `load_telegram_config()` (`296-301`), `save_smtp_config()` (`360-368`), `TELEGRAM_ENABLED` (`327`, always false).

**INFERENCE:** There are four Telegram and five SMTP paths, no retry/dedup/delivery receipt/audit log, and no queue. Real sends were blocked in discovery.

---

## 8. Uploads and media

**VERIFIED FACT:** No dedicated upload route. Uploads are embedded in:
- `/dashboard/general` photo (`app.py:2534-2540`).
- `/dashboard/projects/add` image (`app.py:2625-2631`).
- `/dashboard/projects/edit/<id>` image (`app.py:2691-2697`).

**VERIFIED FACT:** Rules:
- Allowed extensions `png, jpg, jpeg, gif, webp` (`config.py:40`, `app.py:91`; `allowed_file()` at `app.py:405-408`).
- Max request 16 MB (`config.py:38`, `app.py:89`), 413 handler at `app.py:1453`.
- Upload folder `static/assets/uploads` (`config.py:39`, `app.py:90`), created at import and in `build.sh:10`.
- Filename patterns: `profile_<username>_<timestamp>_<safe>` and `project_<username>_<id>_<timestamp>_<safe>` (`app.py:2538,2629,2695`).
- Stored JSON path: `static/assets/uploads/<filename>`.
- No MIME inspection, re-encoding, per-user subdirectory, or cleanup on replacement/deletion.

**INFERENCE:** Same-second uploads with identical names can overwrite; the 413 redirect-to-same-URL handler can loop.

---

## 9. Backups, scheduler, and operations

**VERIFIED FACT:** `create_backup()` copies `data.json` to `backups/backup_<timestamp>.json`, appends metadata to `backups/backups.json`, and prunes to 20 (`app.py:507-590`). Restore copies a chosen backup over `data.json` after making a `recovery_<timestamp>.json` copy (`app.py:1913-1933`). DB, uploads, IP log, and config are excluded.

**VERIFIED FACT:** Scheduler starts at import (`app.py:120-122`); jobs are added at `app.py:608-622`: hourly backup and hourly no-op `reset_demo_data()` (`app.py:603-605`). No jobstore/lock.

**INFERENCE:** With 4 Gunicorn workers, hourly backups can run four times concurrently; one-second timestamp filenames can collide.

**VERIFIED FACT:** `Dashboard` context processor calls `load_data()` on every request for social and theme (`app.py:46-64,55-85`), adding repeated JSON reads to every response.

---

## 10. Route/template/endpoint mismatches

**VERIFIED FACT:**
1. `app.py:730` calls missing `login` endpoint → `/register` always 500.
2. `templates/dashboard/chat.html:38` calls missing `dashboard_clear_chat`; template not rendered because chat redirects.
3. `templates/dashboard/subscription.html:408,425` calls missing `payment`; template unreferenced.
4. `disable_in_demo` lists nonexistent endpoints `dashboard_mark_read` (`app.py:684`) and `export_data` (`app.py:698`).
5. Sitemap emits `/project/<id>` (`app.py:1820`) and robots allows `/project/` (`app.py:1855`), but real route is `/portfolio/<username>/project/<int:project_id>` (`app.py:1783`).
6. `/documentation` reads a missing path (`app.py:2230-2235`) → 404.
7. DB UUID vs JSON integer IDs cause likely silent lookup failures (`app.py:837,2917`).
8. `data.json` portfolios `sarah_stratege` and `marcus_builds` have no matching users; landing links them but `user_portfolio` 404s (`app.py:481-483`).
9. Admin-facing portfolio links hit intentional admin redirect (`app.py:493-496`).

**VERIFIED FACT:** All `render_template(...)` targets in `app.py` exist. Unrendered/dead templates include `chat.html`, `subscription.html`, `user_profile.html`, and `400.html`. Error pages `403.html`/`503.html` extend missing `templates/base.html` (presentation inventory).

**UNKNOWN:** Whether external links target broken endpoints (`/register`, `/documentation`, `/project/<id>`, dead templates).

---

## 11. Configuration and deployment

**VERIFIED FACT:** `config.py`:
- Secret fallback placeholder (`config.py:8`); 7-day session (`config.py:9`); insecure cookie flag false (`config.py:10`).
- DB URL precedence with PostgreSQL normalization and SQLite fallback (`config.py:15-29`).
- Pool options (`config.py:30-34`); upload limits/extensions (`config.py:37-40`).
- Admin env vars (`config.py:45-47`).
- Config classes and `get_config()` defaulting to development (`config.py:50-80`); testing uses in-memory SQLite (`config.py:66`).
- `app.py:89-96` reassigns several config values after `from_object`, overriding config.py.

**VERIFIED FACT:** `render.yaml:1-17` specifies Gunicorn 4 workers, Python 3.11.0, generated session secret, `DATABASE_URL sync: false`, admin username `admin`, generated admin password, and no notification env vars or `FLASK_ENV`. `Procfile:1` is `web: gunicorn app:app`. `build.sh` upgrades pip, installs requirements, and creates upload directory.

**UNKNOWN:** Which start command the platform actually uses, whether build.sh executable bit is retained, and actual deployed env values.

---

## 12. Dead code and duplication

**VERIFIED FACT:** Unused ORM models: `Project`, `Skill`, `Client`, `VisitorLog`. Unused helpers and constants listed in §7. Duplicate config in `config.py` and `app.py:89-96`. Four Telegram and five SMTP paths. Message filtering repeated across multiple routes. Duplicate/unpinned dependency blocks in `requirements.txt:1-53`. Unreachable code at `app.py:1360-1364,3106-3118`. No-op hourly demo reset.

**INFERENCE:** Dead code should be retained until external deep links are ruled out (`AUDIT/FINAL_ASSESSMENT.md:229`), but must not be treated as live capability.

---

## 13. Reconstruction conclusions

**VERIFIED FACT:** The implemented product is a JSON-first portfolio/content application with a DB-backed message table, inline authorization, inline notification calls, and direct template rendering. Its most complete features are portfolio CRUD, public rendering, themes, admin user management, basic backups, and the member→admin thread core.

**VERIFIED FACT:** The weakest areas are identity consistency, communication policy compliance, transaction boundaries, notification reliability, security defaults, and operational concurrency.

**INFERENCE:** The source confirms the prior audit's maturity verdict: an early-stage prototype operating as a production-like service. The correct next step is evidence-based stabilization, not a rewrite.

**UNKNOWN:** Production configuration/DB state, external deep links, and owner decisions on archive semantics/admin identity/product vocabulary remain unresolved.
