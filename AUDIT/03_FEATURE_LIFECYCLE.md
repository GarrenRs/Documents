# 03 — Feature Lifecycle Reconstruction

Generic chain used throughout:

`User action → Frontend → Route → Validation → Business logic → Persistence → Response → Notification / background work`

All references are to `app.py` unless another file is named. "MISSING" means no source implementation exists.

---

## A. Identity and access

### A.1 Registration — **disabled and broken**

```
Register link/POST → /register (app.py:724-730)
  → flash warning → redirect(url_for('login'))   ← endpoint does not exist
  → Flask BuildError → 500 handler (app.py:1441-1444)
```

- `register()` is the only handler for `/register`; no account self-service exists.
- `login` is not a defined endpoint (AST scan); the real endpoint is `dashboard_login`.
- **Status:** INCOMPLETE / BROKEN. Accounts can only be created by an admin via `/dashboard/users/add`.

### A.2 Login

```
templates/dashboard/login.html form
 → POST /dashboard/login (app.py:2002-2052)
 → get_client_ip() :135  (trusts X-Forwarded-For)
 → compare ADMIN_CREDENTIALS (:113, env-derived :100-110)
    OR iterate data.json users[] (:2026-2047) with check_password_hash
 → session[admin_logged_in, user_id?, username, is_admin, is_demo_mode]
 → log_ip_activity('admin_login'|'user_login'|'failed_login')
 → send_event_notification_async('login_attempt', ...)  ← per-user Telegram credentials
 → redirect '/' (landing.html)
```

- No rate limiting on this route (only `/contact` is limited).
- No DB `User` lookup; `is_active` (`models.py:38`) is ignored.
- `DEMO_USER_CREDENTIALS` (`:197-202`) is defined but never checked — the advertised demo login does not exist in code.
- If `ADMIN_USERNAME`/`ADMIN_PASSWORD` are unset, admin auth hash is `None` and admin login cannot succeed (`:104-106`).

**Status:** PARTIAL / VERIFIED.

### A.3 Session, logout, roles, demo mode

- `login_required` (`:625-635`): checks `'admin_logged_in' in session` only.
- `admin_required` (`:638-648`): checks `session['is_admin']` only.
- `disable_in_demo` (`:651-720`): refreshes `is_admin`/`is_demo_mode` from JSON on each request, then applies endpoint allow/block lists. Note that the lists name non-existent endpoints (`dashboard_mark_read`, `export_data`) at `:684,698`.
- Logout (`:2159-2165`): `session.clear()` → redirect to login. No server-side revocation (signed cookies remain valid until expiry if copied).
- Session lifetime: 7 days (`config.py:9`), secure flag forced false (`:93`).

**Status:** WORKING but WEAK.

### A.4 Admin user management

| Action | Route | Lifecycle | Status |
| --- | --- | --- | --- |
| Create | `/dashboard/users/add` `:2059-2156` | Form → required-field check → duplicate username check in JSON → append user with integer ID + hash → initialize empty portfolio → `save_data()` → best-effort DB sync (find/create first `Workspace`, create/update `User`) → redirect | WORKING with split-brain risk (DB sync failure is only a flash warning) |
| List / view | `:737-775` | JSON `users[]` → template; stats computed from JSON portfolio | WORKING |
| Toggle verification | `:788-846` | Criteria: non-demo + ≥3 JSON projects → set `is_verified` in JSON → `send_user_notification()` → also update DB `User.is_verified` | WORKING for JSON+DB sync of this one flag; note current data has no `is_verified` keys |
| Toggle demo | `:853-874` | Flip `is_demo` in JSON → notify user → save JSON. **No DB sync** | PARTIAL |
| Delete | `:877-904` | Remove user + portfolio from JSON only. **No DB `User`, `Message`, or workspace cleanup** | PARTIAL / unsafe |
| Change password | `:3443-3505` | Validate length/match → verify current against env admin or JSON hash → write new hash to JSON → `session.clear()`. **DB hash not updated** | PARTIAL |

**Account deletion behavior:** deleting a JSON user does not remove their DB rows, DB messages keyed by their user ID, uploaded files, IP log entries, or backups. Orphan records are retained indefinitely.

---

## B. Workspace and portfolio

### B.1 Workspace creation and configuration

- A `Workspace` row is created only lazily, as `Workspace.query.first()` fallback inside admin user creation (`:2130-2134`), named `Default` / slug `default`.
- There is no workspace creation route, no workspace settings route, and no workspace selection in the UI.
- `models.User.workspace_id` is set for newly synced DB users (`:2147`), but almost all reads/writes are scoped by `username` in `data.json`, not by `workspace_id`.

**Status:** NOMINAL ONLY. Multi-tenancy is implemented as per-username JSON keys, not as enforced DB workspace boundaries.

### B.2 Projects

```
Add: dashboard/add_project.html form (multipart)
 → POST /dashboard/projects/add (:2612-2660)
 → load_data(session.username)
 → integer ID = max(existing)+1
 → optional image: allowed_file() (:405) + secure_filename + timestamp prefix → static/assets/uploads/
 → truncate title 200, short_description 500, technologies 50 each
 → append to JSON projects[] → save_data(username) → redirect
Edit: :2663-2708 (same rules; new file written, old file left on disk)
Delete: :2711-2723 (removes JSON entry; does NOT delete image file)
List: :2602-2609 → dashboard/projects.html
Public: /portfolio/<username> :473-504 and /portfolio/<username>/project/<int:id> :1783-1800
```

- `Project` DB model is never used. No notification on project create/update despite `send_telegram_event_notification()` having `new_project`/`project_updated` templates (`:963-970`) that are never invoked.
- **Status:** WORKING (JSON only), with media lifecycle gaps.

### B.3 Skills and clients

- Skills: `:2569-2599` replaces the whole `skills[]` array from `skill_name[]`/`skill_level[]`; out-of-range/non-numeric levels are coerced to `0`; no length limit on name besides caller-supplied template behavior. DB `Skill` unused.
- Clients: CRUD at `:3259-3437`, JSON only. Add/send lead notification via `send_telegram_notification()` (`:3337-3344`); status change notification (`:3386-3400`). Delete is GET (`:3425`) and performs no notification. DB `Client` unused.
- `dashboard_convert_message_to_client()` `:3169-3232` creates a client from a message (GET request), generating a new integer client ID.

**Status:** WORKING (JSON only); destructive GET and no media/DB cleanup.

### B.4 Public portfolio rendering

```
GET /portfolio/<username> :473
 → load_data(username) → default template if no portfolio key
 → look up user in data.json users[]
 → 404 if user absent and username != 'admin'  ← orphan portfolios 404
 → inject is_verified from JSON user record
 → if role admin or username == 'admin' → redirect /landing
 → track_visitor(username) :1157-1203 → JSON write on every unique daily IP
 → render index.html with user theme
```

- `/catalog` `:1543-1582` exposes only `is_verified` users to anonymous visitors; users are fetched from JSON. Current `data.json` users have no `is_verified` key, so the public catalog would be empty (INFERENCE from data + code).
- Landing page iterates all portfolios including the two orphan keys; those cards link to a 404 portfolio URL.
- `sitemap.xml` references global `projects` and `/project/<id>`, not per-user portfolio URLs.

**Status:** PARTIAL.

### B.5 Uploaded media lifecycle

- Accepted: `png/jpg/jpeg/gif/webp` via filename extension only (`:405-408`, config `:40`, `:91`).
- Size cap: 16 MB (`config.py:38`, `app.py:89`), 413 handler redirects with flash (`app.py:1453-1457`).
- Naming: `profile_<username>_<ts>_<securename>` (`:2538`) / `project_<username>_<id>_<ts>_<securename>` (`:2629,2695`).
- Replacement writes a new file; old files are never deleted. Deleting a project never deletes its image. No upload listing, quota, or cleanup job.

**Status:** PARTIAL.

---

## C. Internal communication — **priority subsystem**

### C.1 Component map

| UI artifact | Route / function | Persistence | Status |
| --- | --- | --- | --- |
| `dashboard/base.html` bell + dropdown (`:133-155`, JS `:233-309`) | `get_unread_messages_count()` `:1090-1115` (server badge), `get_latest_notifications()` `:1117-1154` (30 s poll) | DB reads | PARTIAL / inconsistent |
| `dashboard/internal_messages.html` | `dashboard_internal_messages()` `:2862-2906` | DB only | WORKING |
| `dashboard/internal_compose.html` | `dashboard_internal_compose()` `:2913-2919` | DB `User.query.get()` for display only | WORKING for member→admin; admin has no UI path |
| Compose submit | `dashboard_internal_send()` `:2925-2992` | DB `messages` | WORKING with validation gaps |
| `dashboard/internal_view.html` | `dashboard_internal_view()` `:2998-3035` | DB parent + replies | WORKING with UI/read-state defects |
| Reply form inside `internal_view.html:63-67` | `dashboard_reply_message()` `:1272-1364` | DB first, JSON fallback | WORKING with authorization/notification gaps |
| Archive link inside `internal_view.html:75-79` | `dashboard_delete_message()` `:3124-3163` | DB delete + JSON delete | DESTRUCTIVE, not archival |
| `dashboard/chat.html`, `chat_list.html` | `dashboard_chat()` `:1250-1266` | none | DEPRECATED, redirects |
| `read_message` (per `ux_overhaul_plan.md:10`) | **MISSING** | — | DOCUMENTED ONLY / NOT IMPLEMENTED |

### C.2 Recipient discovery

1. Member: `internal_messages.html:17` offers only "Contact Admin" → `receiver_id='admin'` hidden field (`internal_compose.html:18`).
2. Admin: `base.html:57-60` links to internal messages, but `internal_messages.html:16-20` hides the compose button for admins. The alternative user list is `dashboard/chat_list.html` reached via `/dashboard/chat`, which redirects to `/dashboard/messages` (`:1265-1266`).
3. `dashboard_view_user.html` and `user_profile.html` link to `dashboard_internal_compose(receiver_id=target_user.id)`; however `dashboard_view_user()` renders `view_user.html`, which does **not** contain that link. `user_profile.html` is unreferenced by any route.

**Conclusion:** member→admin composition is reachable; admin→member and member→member composition via the UI is effectively unreachable, although the backend accepts arbitrary `receiver_id`. VERIFIED from templates + routes.

### C.3 Send / persistence lifecycle

```
Compose form POST /dashboard/messages/internal/send (:2922)
 → user_id = str(session['user_id']), receiver_id = raw form field (:2927-2932)
 → validate only message non-empty (:2934-2936); truncate to 5000 chars (:2954, :2976)
 → existing_thread = first internal parent message between the two IDs (:2941-2946)
    ├─ found  → insert reply with parent_id = thread.id, sender_id, receiver_id,
    │           sender_role, category='internal'; bump thread.created_at;
    │           set thread.is_read = False (:2950-2969)
    └─ none   → insert new parent message, category='internal' (:2972-2987)
 → db.session.commit() → redirect to thread or list
 → NO internal notification is sent to the recipient
```

**Gaps (VERIFIED):**
- `receiver_id` is not validated: no existence check, no `User.query.get()` in the POST route, no self-send prevention, no workspace/tenant check.
- `category` is hard-coded internal on send; `sender_role` is derived from session only.
- `workspace_id` is left `NULL` (model default) for internal messages (`:2950-2983`).
- Notification helpers are never called from this path; the recipient only discovers the message via the 30 s badge poll.
- A thread is uniquely identified by the *first* parent between the pair; once replies exist, `get_unread_messages_count()` counts them individually for members but ignores replies for admins (see C.5).

### C.4 Conversation rendering — `internal_view.html`

```
GET /dashboard/messages/internal/view/<message_id> (:2998)
 → Message.query.get(message_id)
 → access check: admin OR sender OR receiver (:3009-3012)
 → mark PARENT is_read=True if receiver or admin viewing platform/internal (:3014-3018)
 → replies = Message.query.filter_by(parent_id=message_id) ordered asc (:3021-3029)
 → render internal_view.html(message, replies)
```

Verified defects:
- `internal_view.html:36` reads `message.date`; the `Message` model has `created_at`, not `date` (`models.py:84`) → blank timestamp in the initial bubble.
- Replies are rendered with `sender_role` alignment; parent is always labelled "Member" (`:31-39`) even when it was sent by an admin.
- Only the parent is marked read; unread replies remain `is_read=False`.
- "Archive Thread" (`:75-79`) calls the hard-delete route, not an archival state change; replies become orphans because `parent_id` is a plain string with no FK/cascade.
- No pagination; all replies returned.

### C.5 Read/unread state and counters

| Consumer | Query | Behavior |
| --- | --- | --- |
| `get_unread_messages_count()` admin branch `:1096-1104` | `is_read=False`, `parent_id=None`, `category in ('platform','internal')`, `receiver_id=='admin'` | Counts only top-level messages addressed to admin; ignores replies and messages admin sent |
| `get_unread_messages_count()` member branch `:1105-1111` | `is_read=False`, `receiver_id==user_id` | Counts **every unread reply**, not just threads |
| `get_latest_notifications()` admin `:1124-1129` | Same filters but **no `parent_id=None`** | Can return replies; count differs from badge |
| `get_latest_notifications()` member `:1130-1134` | Unread by receiver, limit 5 | Matches member counter logic |
| `dashboard/index.html:110-111` | `stats.unread_messages` from JSON `messages[]` (`:2201-2205`) | Completely separate from DB counter; always 0 for current data |
| `base.html:136-141` + JS `:245-267` | Server count initially, then overwritten by `data.length` from poll | Badge flips between two different definitions |

**Verified consequence:** after a member opens a thread, the parent is marked read but its replies are not; the member's counter stays positive. For admin, replies are excluded from the counter but included in the dropdown list. The documented `read_message` route that would reconcile this does not exist.

### C.6 Notification indicators

- Bell badge is server-rendered (`base.html:136-141`) and then replaced by JS from `/dashboard/notifications/latest` (`:237-267`).
- Dropdown items link to `/dashboard/messages/internal/view/<thread_id>` for `category == 'internal'`, otherwise `/dashboard/messages/view/<id>` (`base.html:279-281`). This is the one place where reply→thread mapping is handled (`get_latest_notifications():1140-1146`).
- JSON response fields: `id`, `thread_id`, `name`, truncated `message` (50 chars), `category`, `time` (`app.py:1143-1150`).
- Route has **no** `login_required`; it derives identity from session and returns `[]` when absent (`:1121-1136`). No data leaks in the no-session case, but it is an unauthenticated endpoint that touches DB queries.
- Failure path: any exception (including `created_at is None` on legacy rows) returns `[]` (`:1152-1154`), silently clearing the badge.

### C.7 Reply lifecycle

```
internal_view.html form (category=internal hidden) 
 → POST /dashboard/messages/reply/<message_id> (:1269)
 → content non-empty check (:1278-1285)
 → Message.query.get(message_id)
    ├─ found: receiver = sender_id if sender != current else receiver_id (:1292)
    │         insert reply (parent_id=message_id, is_internal=True,
    │         sender_role, receiver_id) → commit (:1294-1308)
    └─ not found: search JSON copies for current user and 'admin' (:1315-1349)
 → redirect back to internal_view or view_message
```

Verified defects:
- **No participant/ownership check** on `dashboard_reply_message`; a logged-in user who knows a message UUID can inject a reply into any DB thread.
- No notification to the other party.
- Reply content has no length cap in this path (contrast `dashboard_internal_send` at 5000).
- Legacy JSON branch creates a reply with `sender_id` but no `receiver_id`, and does not set `is_read` on the parent.
- Unreachable duplicate code at `:1360-1364`.
- HTML injection risk: message bodies are rendered by Jinja autoescaping, but Telegram notifications use HTML parse mode with unsanitized content (see `05_INTEGRATIONS_AND_OPERATIONS.md`).

### C.8 Deletion / archival

```
internal_view "Archive Thread" (GET) → /dashboard/messages/delete/<id> (:3124)
 → DB: delete row only if admin OR receiver_id == session.user_id (:3131-3137)
 → JSON: always remove matching id from current user's portfolio (:3143-3153)
 → flash success in both cases → redirect /dashboard/messages
```

- Sender cannot delete their own sent DB message.
- Deleting a parent leaves replies orphaned (no FK/cascade).
- Deleting a reply directly leaves the parent intact.
- GET-based state change; no CSRF protection.
- "Archive" label is misleading — hard delete.

### C.9 Failure handling and edge cases (internal communication)

| Case | Current behavior | Status |
| --- | --- | --- |
| Unknown `receiver_id` | Accepted and persisted; later rendering resolves display name to original `name` value | VERIFIED gap |
| Self-message | Not prevented; thread query matches both directions | VERIFIED gap |
| Non-existent `message_id` in view | Flash + redirect to list | WORKING |
| Unauthorized view | Flash "Access denied" + redirect | WORKING for view only |
| Unauthorized reply | Accepted | VERIFIED gap |
| DB exception on send/view | rollback + flash + redirect | WORKING |
| `created_at` missing on legacy row | `.strftime()` raises; whole notification list becomes `[]` | VERIFIED risk |
| Reply to message converted from contact | `category` form field controls routing; default `portfolio`; `is_internal=True` forced | VERIFIED inconsistency |
| Admin wants to initiate thread | No reachable UI | VERIFIED gap |

### C.10 Frontend → backend completeness matrix

| Interaction | Backend | Verdict |
| --- | --- | --- |
| Open inbox / internal list | `dashboard_internal_messages` | OK |
| Open thread (`internal_view.html`) | `dashboard_internal_view` | OK, UI date defect |
| Reply in thread | `dashboard_reply_message` | OK, security/notification gaps |
| Compose (member→admin) | `dashboard_internal_compose` + `dashboard_internal_send` | OK |
| Compose (admin→member / member→member via user profile) | `dashboard_internal_send` exists, but no reachable UI (`user_profile.html` unreferenced; admin compose hidden) | INCOMPLETE |
| Bell badge initial render | `get_unread_messages_count` | Inconsistent definition |
| Bell dropdown 30 s poll | `get_latest_notifications` | OK, different definition |
| Mark single message read (`read_message`) | **MISSING** | NOT IMPLEMENTED |
| Archive thread | `dashboard_delete_message` | Mislabeled hard delete |
| `/dashboard/chat` UI | Redirect only; `chat.html` also references missing `dashboard_clear_chat` | DEPRECATED / broken if revived |
| Notification on new internal message/reply | **MISSING** | NOT IMPLEMENTED |

**Overall real state of internal communication:** the *core* two-party DB thread (compose → persist → list → view → reply) works for member→admin. Surrounding guarantees — read-state propagation, counter consistency, delivery notifications, recipient validation, authorization on reply/delete, and admin-initiated conversations — are incomplete. The documented `read_message` endpoint does not exist.

---

## D. Notifications and external integrations

### D.1 Trigger matrix

| Event | Code path | Channels | Recipient | Status |
| --- | --- | --- | --- | --- |
| Platform inquiry via `/contact` (`portfolio_owner='admin'`) | `:1688-1770` | DB Message + admin Telegram + admin SMTP + optional global SMTP confirmation | Admin | WORKING if env configured |
| Portfolio inquiry via `/contact` | `:1697-1770` | DB Message + JSON legacy copy + user Telegram/SMTP | Portfolio owner | WORKING if user configured |
| `/contact/academy` | `:1368-1425` | DB Message + `send_admin_notification()` + separate `send_email()` with global config | Admin | PARTIAL (duplicate email path; message has no `receiver_id`) |
| User created / verification toggled / access changed | `:818-832`, `:866-870` | User Telegram/SMTP | Target user | WORKING if configured |
| Change password | `:3470-3473` | Admin Telegram/SMTP | Admin | WORKING if configured |
| Login attempt | `:2019-2022,2043-2046` | User-scoped Telegram event | Logging-in user | WORKING if configured |
| New lead / client status change | `:3337-3344`, `:3386-3400` | User Telegram (synchronous) | Current user | WORKING if configured |
| Project add/update | — | Event templates exist at `:963-970` but are never called | — | NOT WIRED |
| New internal message / reply | — | — | — | NOT IMPLEMENTED |
| Backup created/restored | `:1898-1901`, `:1930-1932` | Telegram event (async) | Current user | WORKING if configured |
| Visitor arrived | `:1178` comment "notification disabled" | — | — | DISABLED BY DESIGN |

### D.2 Delivery semantics

- No retry queue, no delivery receipts persisted, no deduplication key. Repeated form submissions produce repeated messages.
- Admin Telegram/SMTP use detached threads with unobserved results (`:236`, `:252-260`); inner SMTP failures are swallowed by bare `except: pass`.
- User Telegram wrappers `send_telegram_notification_async()` / `send_event_notification_async()` create daemon threads (`:994-1009`); results are discarded.
- `send_telegram_notification()` itself is synchronous with 5 s timeout (`:944`) and is called directly from client CRUD routes — those requests block up to 5 s.
- Configuration tests (`/dashboard/telegram-test`, `/dashboard/email-test`) send real messages. This audit did not invoke them.
- Per-user secrets are stored plaintext in `data.json` (`:2377-2381`, `:2421-2427`) and a partially obfuscated token is passed to `settings.html` (`:2305-2309`, `templates/dashboard/settings.html`).

---

## E. Database and data lifecycle (summary; full detail in `04_`)

| Feature | Creation | Update | Deletion | Persistence |
| --- | --- | --- | --- | --- |
| Message (contact) | DB + JSON (`:1727-1754`) | Read flag in DB or JSON separately | Both stores (`:3124-3163`) | DB authoritative for counters; JSON for legacy list |
| Message (internal) | DB only (`:2950-2985`) | Parent read flag, reply insert | DB row only; replies orphan | DB |
| Project | JSON only | JSON replace fields | JSON entry only | `data.json` |
| Skill | JSON array replace | Same | Same | `data.json` |
| Client | JSON only | JSON + status timestamp + Telegram notice | JSON entry only | `data.json` |
| User | JSON + best-effort DB | JSON; one flag synced to DB; password not synced | JSON only | Split |
| Workspace | Implicit first workspace | None | None | DB |
| Visitor stats | JSON | JSON append/dedup per day | Never | `data.json`; `VisitorLog` model unused |
| Backup | Copy of `data.json` | Metadata append | File + metadata entry | Local FS |

---

## F. Background operations

1. Import triggers scheduler start before any route is registered (`:119-122`).
2. `scheduled_backup` runs hourly inside `app.app_context()` and copies `data.json` (`:593-600`, `:507-538`).
3. `reset_demo_data` is scheduled hourly but is an empty function (`:603-605`, `:616-622`).
4. Retention keeps 20 most recent backups (`:575-590`).
5. On Gunicorn with 4 workers (`render.yaml:6`), each worker imports `app.py` and starts its own scheduler → **4 independent hourly jobs** (INFERENCE from import-time side effects + worker count; no runtime test performed).
6. No shutdown beyond `atexit.register(scheduler.shutdown())`; SIGKILL/restarts leave no resume state. Job failures are logged only.

---

## G. Deployment and runtime lifecycle

- Local: `python app.py` binds `0.0.0.0:5000` with debug enabled (`:3568-3570`).
- Render: `build.sh` installs deps; Gunicorn 4 workers, 120 s timeout, `--reuse-port`; env vars from `render.yaml`.
- Uploads/backups/IP log are **filesystem-local**, so they are lost or non-shared on ephemeral/horizontal hosting.
- Error handlers exist for 403/404/500/503/413; 400 template is unused.
- `add_security_headers()` sets permissive CSP (`default-src *`, unsafe-inline/eval, `frame-ancestors *`), `nosniff`, and HSTS; no X-Frame-Options, no Referrer-Policy.
- Rate limiting applies only to `/contact`, uses an in-process dict keyed by a client-supplied `X-Forwarded-For` value, and is not shared across workers.
- No CSRF protection on any POST route; several state-changing routes accept GET.

---

## H. Cross-feature lifecycle gaps

| Gap | Evidence | Impact |
| --- | --- | --- |
| `read_message` route missing | `ux_overhaul_plan.md:10`; no route in `app.py` | Notification mark-read cannot be completed |
| `dashboard_clear_chat` missing | `chat.html:38` | Deprecated chat UI cannot be revived without backend work |
| `payment` missing | `subscription.html:408,425` | Upgrade CTAs are dead |
| `/register` → `url_for('login')` missing | `app.py:730` | 500 on registration attempt |
| `/documentation` file absent | `app.py:2229-2235` | Always 404 |
| Sitemap URLs invalid | `app.py:1817-1828` | Search-engine crawl path does not exist |
| Orphan portfolios | `data.json`; `user_portfolio():481-483` | Landing cards lead to 404 |
| Default template data has no `is_verified` key | `data.json` users | Public catalog empty until admin toggles verification |

---

**Next document:** `04_DATABASE_AND_DATA_LIFECYCLE.md` — schema, constraints, persistence, backup/restore, and deletion semantics in detail.
