# 06 — Technical Debt and Cleanup Assessment

**Severity legend:** Critical = active breakage or high-likelihood data/security incident; High = material correctness, security, or operational risk; Medium = maintainability/reliability drag; Low = cosmetic or low-impact cleanup.

Every item below is source-evidenced. No fix has been applied.

---

## 1. Correctness and completeness

| ID | Sev | Finding & evidence | Actual impact | Recommended action | Dependencies / risks of fixing |
| --- | --- | --- | --- | --- | --- |
| TD-01 | Critical | `/register` redirects via `url_for('login')` but no `login` endpoint exists — `app.py:725-730`; AST route inventory | Every registration attempt raises `BuildError` → 500 | Point to `dashboard_login`, or remove the route and hide any link | Low risk; confirm no external links target `/register` |
| TD-02 | Critical | Documented `read_message` route absent — `ux_overhaul_plan.md:10`; no such route in `app.py` | Notification mark-read workflow cannot be completed; unread state only changes incidentally on thread open | Implement an explicit read-state endpoint with ownership checks, then wire bell items to it | Requires deciding whether read state is per-message or per-thread first (see TD-06) |
| TD-03 | High | Unread definitions conflict: admin count filters `parent_id=None` + `receiver_id=='admin'` (`app.py:1096-1104`) while poll list does not filter parents (`:1124-1129`); member count includes every unread reply (`:1105-1111`); dashboard overview uses JSON `messages[]` (`:2201-2205`) | Badge, dropdown, and overview display three different numbers; JS overwrites server count (`base.html:245-267`) | Define one canonical unread query, reuse in all four call sites, and keep JSON-derived stats clearly separate | Changing semantics may surprise users; add tests in isolated copy first |
| TD-04 | High | Internal message/reply senders never call notification helpers — `dashboard_internal_send():2925-2992`, `dashboard_reply_message():1272-1359` | Recipients only learn about messages via 30 s polling; no Telegram/SMTP delivery | Add notification dispatch after successful commit, with recipient resolution and dedup key | Must fix recipient validation (TD-08) first to avoid notifying arbitrary IDs |
| TD-05 | High | `receiver_id` accepted from hidden form without existence/authorization check — `app.py:2931,2958,2980`; compose display lookup only at `:2917` | Messages can be persisted to nonexistent, self, or cross-workspace IDs; silent loss | Validate against `User` rows (and workspace), reject self-send, return 400/flash | Existing threads with legacy receiver IDs may need migration or compatibility handling |
| TD-06 | High | `dashboard_reply_message()` has no participant check — `app.py:1272-1308` | Any logged-in user knowing a message UUID can inject replies into another thread | Check sender/receiver membership before insert | Ensure admin override is intentional; verify legacy JSON branch too |
| TD-07 | High | `internal_view.html:36` renders `message.date`; `Message` has `created_at` (`models.py:84`) | Initial message timestamp renders blank | Use `message.created_at` (format in template) or expose a computed `date` | Template-only change; verify no other template relies on `date` for DB messages |
| TD-08 | High | "Archive Thread" link calls hard-delete route — `internal_view.html:75-79` → `dashboard_delete_message():3124-3163`; replies have plain `parent_id` with no FK/cascade | Deleting a parent orphans all replies; action is irreversible but labelled archival | Either add `archived_at`/`is_archived` and hide thread, or delete whole thread in one transaction | Decide product semantics; orphan cleanup needed before enabling bulk delete |
| TD-09 | High | Admin cannot initiate internal message via UI: compose hidden for admins (`internal_messages.html:16-20`); alternative `user_profile.html` is unreferenced; `/dashboard/chat` redirects (`app.py:1265-1266`) | One-sided communication; admin can only reply to inbound threads | Add recipient picker for admin backed by `User.query`, or revive a single working thread UI | Must not revive `chat.html` until missing `dashboard_clear_chat` endpoint is resolved |
| TD-10 | Medium | Deprecated chat subsystem: `dashboard_chat()` computes variables then redirects (`:1250-1266`); `chat.html` references nonexistent `dashboard_clear_chat` (`chat.html:38`); `chat_list.html` links into the redirect | Dead UI/route surface; BuildError if template revived | Remove deprecated routes/templates or fully consolidate into internal messages | Ensure no bookmarks/emails reference `/dashboard/chat` |
| TD-11 | Medium | Unreachable duplicate code: `app.py:1360-1364` after `return` at `:1359`; `app.py:3106-3118` after `return` at `:3105`; dead `conf` import block at `:1481-1483` | Confuses maintainers; suggests two competing implementations | Delete unreachable blocks | No behavior change if truly unreachable; verify with coverage in isolated copy |
| TD-12 | Medium | No-op scheduled job: `reset_demo_data()` is `pass` (`app.py:603-605`) but scheduled hourly (`:616-622`) | Wasted scheduler work; misleading job name | Remove job or implement documented reset with explicit guard | Demo reset touches user data — must be opt-in and isolated |
| TD-13 | Medium | `/documentation` always 404 (expected file absent — `app.py:2229-2235`); sitemap emits non-existent `/project/<id>` URLs (`app.py:1817-1828`); `robots.txt` disallows `/static/` while all assets live there (`app.py:1853-1867`) | Broken SEO/help flows | Fix paths or remove routes; align robots with actual asset layout | Low risk, but sitemap changes can affect indexing |
| TD-14 | Medium | Orphan portfolios `sarah_stratege`, `marcus_builds` in `data.json` have no user entries; `user_portfolio():481-483` returns 404 while landing page links to them | Dead portfolio cards; inconsistent public catalog | Reconcile: create users, archive portfolios, or hide orphans in listing routes | Data decision required; do not delete data without owner approval |
| TD-15 | Medium | Public catalog filters on `is_verified` (`app.py:1562-1564`) but current user records have no such key | Anonymous catalog is empty despite populated portfolios | Decide default verification policy and backfill explicitly | Business decision; avoid auto-verifying arbitrary profiles |
| TD-16 | Medium | `get_latest_notifications()` is public and calls `created_at.strftime()` on every row (`:1149`); any NULL/legacy row aborts whole response to `[]` (`:1152-1154`) | Bell silently empties; endpoint is unauthenticated surface | Add `login_required`, guard `created_at`, return stable shape | Frontend must handle new error shape if changed |
| TD-17 | Medium | Unreferenced templates: `public_base.html`, `dashboard/chat.html`, `dashboard/subscription.html`, `dashboard/user_profile.html`, `400.html`; `subscription.html` also calls missing `payment` endpoint (`:408,425`) | Dead UI artifacts with broken links | Remove or explicitly park with a README note | Verify no external deep links |

---

## 2. Data architecture and integrity

| ID | Sev | Finding & evidence | Actual impact | Recommended action | Dependencies / risks of fixing |
| --- | --- | --- | --- | --- | --- |
| TD-18 | Critical | Dual JSON+DB persistence with no transaction: contact writes both (`:1727-1754`), replies branch between stores (`:1287-1349`), deletes touch both (`:3129-3153`) | Partial writes leave permanently divergent read models and duplicate/zero counts | Define one authoritative store per entity; keep the other as explicitly versioned legacy read-only cache | Must be phased; immediate hard switch risks data loss |
| TD-19 | High | No migrations; `db.create_all()` only (`app.py:36-41`); Alembic installed but unused; no `alembic.ini`/migrations | Schema drift undetectable; production DB shape UNKNOWN | Introduce Alembic with a baseline revision generated from the live DB (not from models alone) | Requires a safe DB snapshot; do not autogenerate against production without review |
| TD-20 | High | Message `sender_id`/`receiver_id`/`parent_id` are plain strings with no FK/index (`models.py:79-81`); admin is literal `'admin'`, members are stringified JSON integers, DB user IDs are UUIDs (`:2082` vs `models.py:32`) | Orphan threads, broken participant resolution, unindexed scans | Normalize identity to one ID type; add FKs and indexes in a migration | Needs data mapping for existing rows; high migration risk |
| TD-21 | High | User deletion removes JSON user + portfolio only (`:877-904`); DB `User`, DB messages, uploads, IP logs, backups retained | Orphan records and privacy/erasure gap | Define full deletion checklist and transactional cleanup; add archival option | Legal/retention decision; must not delete backups without approval |
| TD-22 | High | Password change writes JSON hash only (`:3492-3494`); DB hash stale. `toggle_user_demo()` writes JSON only (`:853-874`); only verification flag syncs to DB (`:837-840`) | DB becomes unreliable for identity/state; future DB-based auth would reject valid passwords | Make one store authoritative for credentials/roles; sync or eliminate the mirror | Changing auth source is high-risk; stage with dual-verification first |
| TD-23 | High | Plaintext Telegram/SMTP credentials in `data.json` (`:2377-2381`, `:2421-2427`), partial token shown in settings (`:2305-2309`); IP log plaintext (`:167-194`) | Credential theft via backup download (`/backup/download/<filename>` available to any logged-in user), log exposure | Move secrets to env/vault, redact backups/downloads, restrict backup access | Secret rotation required; existing backups remain exposed until handled |
| TD-24 | High | JSON rewritten wholesale on every mutation with no lock or atomic replace (`:449-470`); `track_visitor()` writes on public GET (`:1201`) | Lost updates under concurrency; possible truncated file on crash | Use SQLite/DB as source of truth, or at minimum atomic temp-file + rename + file lock | Full DB migration is large; atomic write is a safe intermediate step |
| TD-25 | High | Backups copy only `data.json` (`:507-538`); no DB dump, uploads, or IP log; local FS only; restore overwrites without validation (`:1910-1937`) | Backups cannot restore the system; corrupted backup can destroy current JSON | Add full backup set (DB export + uploads manifest + configs), validate restore in isolated copy, store off-instance | Requires storage/credentials decision and restore drill |
| TD-26 | Medium | Four DB models unused (`Project`, `Skill`, `Client`, `VisitorLog`) while JSON arrays are authoritative | Schema suggests capabilities that do not exist; wasted migration surface | Remove models after confirming no external consumer, or implement them deliberately | Dropping tables is irreversible; check for external reporting first |
| TD-27 | Medium | Uploaded files never deleted on replace/delete (`:2534-2540`, `:2624-2631`, `:2691-2697`, `:2711-2723`); no content-type validation | Disk growth; potential hostile file in public static path | Add upload registry table, cleanup on replacement/deletion, MIME sniffing, per-user dirs | Existing orphan files need an inventory pass |
| TD-28 | Medium | JSON mutable defaults (`models.py:40,50`) and naive `datetime.utcnow` throughout | Shared-default hazard on some backends; timezone ambiguity | Use `default=list` callables and timezone-aware UTC | Schema/serialization impact; coordinate with migration |
| TD-29 | Medium | SQLite fallback combined with PostgreSQL pool options (`config.py:29-34`); `JSON_AS_ASCII` set though obsolete (`config.py:43`, `app.py:92`) | Environment-dependent behavior; misleading config | Make dialect-specific engine options; remove obsolete key | Must verify both SQLite and PostgreSQL in isolated copies |

---

## 3. Security

| ID | Sev | Finding & evidence | Actual impact | Recommended action | Dependencies / risks of fixing |
| --- | --- | --- | --- | --- | --- |
| TD-30 | Critical | No CSRF protection anywhere; state-changing GET routes: message delete (`:3124`), client delete (`:3428`), convert-to-client (`:3169`), logout (`:2161`), user-profile JS navigates to POST-only URL (`user_profile.html:112` vs `app.py:877`) | Cross-site state changes; broken delete link | Add Flask-WTF/CSRF tokens, convert state changes to POST, fix template URL | Existing bookmarks using GET links will break; use redirects during transition |
| TD-31 | High | Permissive CSP (`default-src *`, unsafe-inline/eval, `frame-ancestors *`) and `SESSION_COOKIE_SECURE=False` in production (`app.py:3554-3564`, `:93`); no X-Frame-Options despite docs | Security headers provide little protection; cookie sent over HTTP | Tighten CSP after auditing inline scripts; set Secure based on environment; add X-Frame-Options/Referrer-Policy | Inline JS in base/settings/index must be externalized or nonced first |
| TD-32 | High | Hard-coded session secret fallback (`config.py:8`) and generated secret only in `render.yaml`; no validation on startup | Weak/forged sessions if env missing | Fail fast when `SESSION_SECRET` absent outside development | Deployment must provide secret before rollout |
| TD-33 | High | Authorization gaps: reply by ID without participant check (`:1272-1308`); admin can view any DB message (`:3051-3068`); delete allows only admin/receiver, not sender (`:3134`); backup download available to any logged-in user (`:1940-1958`) | Data exposure and unauthorized mutation | Centralize ownership checks (sender/receiver/admin/workspace) in decorators or helpers | Must define admin override rules and legacy ID compatibility |
| TD-34 | Medium | Rate limiting only on `/contact`, keyed by client-controlled `X-Forwarded-For`, in-process dict (`:126-164`); login not limited | Brute force and spam bypass; multi-worker inconsistency | Use trusted proxy configuration + shared store (Redis/DB) and apply to login/contact/telegram/SMTP tests | Requires new infrastructure decision |
| TD-35 | Medium | HTML tags interpolated into Telegram messages with `parse_mode='HTML'` and no escaping (`:921-931`, `:1058-1085`, `:1407`, `:1759`, `:3339-3400`) | Malformed/altered notifications; injection into admin/user chat clients | Escape user content or switch to plain text; validate before send | Notification formatting must be regression-tested; no live sends in test environment |
| TD-36 | Medium | Inline JS uses `innerHTML` with server-provided `msg.name`/`msg.message` (`base.html:288-299`) and backup filenames (`settings.html:737-789`) | Stored XSS if malicious content reaches those fields | Use `textContent`/DOM APIs or sanitize; tighten CSP | Must preserve dropdown behavior |
| TD-37 | Medium | `admin_required` and demo logic rely on session flags refreshed from JSON; DB roles/is_active unused (`app.py:638-668`, `models.py:37-38`) | Stale privileges after server-side role changes; deactivated users retain access | Centralize current-user loading from authoritative store per request | Need to decide authoritative identity store first (TD-22) |
| TD-38 | Low/Medium | `get_client_ip()` trusts `X-Forwarded-For` verbatim, may store comma-separated chains (`:135-138`) | Spoofable audit trail; inconsistent IP records | Parse trusted proxy hops, validate format | Log format change affects existing log analysis |

---

## 4. Notifications and operations

| ID | Sev | Finding & evidence | Actual impact | Recommended action | Dependencies / risks of fixing |
| --- | --- | --- | --- | --- | --- |
| TD-39 | High | Default config is development (`config.py:50-53,77-80`); `render.yaml` does not set `FLASK_ENV`; `app.run(debug=True)` | DEBUG may be active in production → verbose errors and reloader behavior | Set `FLASK_ENV=production` explicitly; fail if DEBUG in production; remove debug from main entry | Verify deployed env before change |
| TD-40 | High | Scheduler started at import (`app.py:119-122`) → duplicate jobs under 4 Gunicorn workers (`render.yaml:6`); `replace_existing` only per-process | Duplicate hourly backups, file/metadata races | Move scheduler to a dedicated process or use a distributed lock/job store; add `max_instances=1` | Requires deployment topology decision |
| TD-41 | Medium | Four distinct Telegram send paths and five SMTP paths with divergent config/formatting (`:206-402`, `:907-1009`, `:1630-1648`) | Inconsistent notifications; fixes must be applied multiple times | Consolidate into one notification service with channel adapters | Preserve existing event templates/formatting during extraction |
| TD-42 | Medium | No delivery receipts, retries, dedup, or audit of notification outcomes; threads discard results (`:236,252-260,278,994-1009`) | Silent failures; duplicate messages | Add delivery log table + retry queue + idempotency key per event | New table/queue; avoid duplicate sends during rollout |
| TD-43 | Medium | SMTP calls without timeout (`:393,1639`) and Telegram client CRUD sends are synchronous (`:3338-3400`) | Request latency/hang on provider outage | Set timeouts and move sends to background workers | Must ensure background worker lifecycle is managed |
| TD-44 | Medium | Admin notification env vars absent from `render.yaml` while code expects them (`app.py:206-219`); `ADMIN_EMAIL` fallback used at `:1413` | Alerts silently disabled in deployed configuration | Document and provision all expected env vars; validate at startup | Secrets provisioning required |
| TD-45 | Medium | Duplicate/unpinned `requirements.txt` (lines 17-53) and unused packages (flask-dance, oauthlib, PyJWT, email-validator, alembic, python-dotenv) | Non-reproducible builds; larger attack surface | Single pinned list; remove unused after import scan | Removing Alembic now would block TD-19; sequence matters |
| TD-46 | Medium | No test suite, no CI config, no lint config in repository | Every change is unverified; audit relies on static reading | Add isolated test harness before remediation (app factory refactor optional but not required to start) | Import-time side effects must be made test-safe first |
| TD-47 | Medium | 413 handler redirects back to `request.url` (`app.py:1453-1457`) | Potential redirect loop for oversized uploads | Render an error page or JSON 413 response | Template 400 exists but is unused; can be reused |
| TD-48 | Low | Documentation asserts completed security fixes (`audit_plan.md:30-38`, `replit.md:45-51`) that are absent | False confidence; misleading future maintainers | Correct documentation after each verified fix | Do not update docs before fixes land |

---

## 5. Monolith/maintainability

| ID | Sev | Finding & evidence | Actual impact | Recommended action | Dependencies / risks of fixing |
| --- | --- | --- | --- | --- | --- |
| TD-49 | Medium | `app.py` contains 72 routes and all cross-cutting concerns in 3,570 lines; no Blueprints/services | High change risk; hard to test or reason about ownership | Incremental extraction by domain (auth, messaging, portfolio, backups) **without rewriting business logic** | Extract one domain at a time behind same endpoints; preserve URL/flash behavior |
| TD-50 | Medium | Repeated message-list filtering/unread logic in at least four functions (`:1090,1118,2780,2862`) | Divergent behavior (TD-03) | Introduce shared query helpers returning a consistent DTO | Must settle canonical semantics first |
| TD-51 | Medium | Configuration duplicated between `config.py` and `app.py:88-96`; DB URL normalized twice (`config.py:26-27`, `app.py:28-32`) | Unknown effective config; drift | Keep `config.py` as single source; remove overrides after verifying each value | Changing cookie/secret settings affects sessions |
| TD-52 | Low | One global JS file with unguarded element access (`static/js/script.js:25,46,81`) aborts on pages lacking those IDs; inline scripts in several templates | Frontend behaviors silently disabled | Guard element lookups; move inline scripts into module files | Must verify each page's behavior after change |
| TD-53 | Low | Inconsistent naming across layers: `is_read` (DB) vs `read` (JSON), `created_at` vs `date`, `user_id` string vs int, "Archive" vs delete, `daily_backup` id vs hourly job | Onboarding errors and wrong assumptions during maintenance | Standardize names in new code; add compatibility shims for old data | Renaming persisted fields requires migration |

---

## 6. Preserve / do-not-touch list

The following behavior is working business logic and should be preserved during any remediation:

1. Login against env admin and JSON users, session flags, logout clearing session (`:2003-2052`, `:2159-2165`).
2. Per-user JSON portfolio isolation for general/about/skills/projects/clients/social/contact/theme (`:2524-2774`, `:3238-3437`).
3. Public portfolio rendering and theme selection (`:473-504`, `:2241-2328`).
4. DB-backed two-party internal thread creation/listing/view/reply for member→admin (`:2862-3035`, `:1272-1359`).
5. Contact form dual write plus notification dispatch (`:1657-1780`).
6. User verification criteria check and admin-only user directory (`:733-846`).
7. Basic backup creation/list/download/restore mechanics for `data.json` (`:507-622`, `:1883-1998`).
8. Werkzeug password hashing and ORM-based SQL (no SQL injection found).
9. Error pages for 403/404/500/503 and the existing flash-message UX.
10. The six theme CSS files and the existing Jinja template hierarchy.

---

## 7. Suggested cleanup sequencing constraints

- Do **not** delete `data.json` legacy readers until DB has been verified to contain equivalent messages and users.
- Do **not** remove Alembic from `requirements.txt` before introducing migrations (TD-19).
- Do **not** tighten CSP before externalizing/noncing inline scripts (TD-31, TD-52).
- Do **not** switch authentication to DB until password hashes are reconciled (TD-22).
- Do **not** enable distributed/locked scheduling until duplicate-job behavior is confirmed in the target environment (TD-40).
- Do **not** delete "unused" templates until external deep links are ruled out (TD-17).

---

**Next document:** `07_RECOMMENDED_ACTION_PLAN.md` — bounded, prioritized, independent remediation phases with acceptance criteria and rollback considerations.
