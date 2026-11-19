# 08 — Feature and Lifecycle Map

**Discovery date:** 2026-11-19
**Scope:** Map every major subsystem from purpose → data → UI → backend → persistence → permissions → output, and identify lifecycle gaps, dead paths, and cross-module dependencies.

---

## Evidence conventions

| Label | Meaning |
| --- | --- |
| VERIFIED FACT | Directly observed in source/templates/data or controlled runtime evidence. |
| DOCUMENTED INTENT | Stated in docs or product-facing copy. |
| INFERENCE | Reasoned interpretation supported by evidence. |
| STRATEGIC PROPOSAL | Possible future direction only. |
| UNKNOWN | Insufficient evidence. |

Line references come from source/template inspection and the prior AUDIT package. Runtime observations, where available, are recorded in `05_VISUAL_AND_RUNTIME_DISCOVERY.md`.

---

## 1. Feature lifecycle matrix

| Subsystem | Purpose | Data | UI | Backend | Persistence | Permissions | Output / end state | Classification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Login/logout | Authenticate admin/JSON users | Env admin or JSON `users[]` password hash | `templates/dashboard/login.html` | `app.py:2003-2052,2161-2165` | Session flags only | `login_required`, `admin_required`, `disable_in_demo` (`app.py:625-720`) | Redirect to dashboard; session cleared on logout | VERIFIED FACT working with weak defaults |
| Registration | Self-service account creation | JSON user fields | login page links | `register()` `app.py:725-730` | Would write JSON/DB if reached | None reached | 500 due to missing `login` endpoint | VERIFIED FACT broken |
| User management | Admin creates/verifies/deletes members | JSON user + DB `User`/`Workspace` | `templates/dashboard/users.html` | `app.py:737-904,2059-2156,3443-3505` | Dual best-effort write | Admin only | User appears in JSON; DB sync may warn/fail | VERIFIED FACT with caveats |
| General profile | Edit identity fields | `portfolios[username]` name/title/description/photo | `dashboard/general.html` | `app.py:2524-2546` | JSON + upload file | Login required; per-user via session username | Public hero fields update | VERIFIED FACT |
| About | Edit long-form about | `about` field | `dashboard/about.html` | `app.py:2549-2566` | JSON | Per-user | Public about section updates | VERIFIED FACT |
| Skills | Edit skill name/level pairs | `skills[]` | `dashboard/skills.html` | `app.py:2569-2600` | JSON | Per-user | Public progress bars update | VERIFIED FACT |
| Projects | Add/edit/delete portfolio evidence | `projects[]`, image path, technologies | `dashboard/add_project.html`, `edit_project.html`, `projects.html` | `app.py:2615-2699` | JSON + upload file | Per-user | Public project cards/detail update | VERIFIED FACT; orphaned files on delete |
| Clients/CRM | Track private client records | `clients[]` with price/deadline/status | `dashboard/clients.html`, `add_client.html` | `app.py:3235-3438` | JSON | Per-user | Private client list; not public | VERIFIED FACT |
| Social links | Edit external profile links | `social{}` | `dashboard/social.html` | `app.py:2749-2774` | JSON | Per-user; disabled in demo | Public footer links | VERIFIED FACT; footer renders 6 of 8 editable fields |
| Contact info | Edit public contact fields | `contact{}` | `dashboard/contact.html` | `app.py:2729-2746` | JSON | Per-user | Public contact block | VERIFIED FACT |
| Themes | Select presentation color theme | `settings.theme` | `dashboard/settings.html` | `app.py:2238-2328` | JSON | Per-user; disabled in demo | Six CSS themes applied via `data-portfolio-theme` | VERIFIED FACT |
| Public portfolio | Present professional proof | Per-user JSON portfolio | `index.html`, `project_detail.html` | `app.py:473-504,1783-1800` | JSON read + visitor stats write | Public | Rendered profile/project pages | VERIFIED FACT |
| Landing gallery | Surface verified members | `portfolios[]`, verification flags | `landing.html` | `app.py:1461-1491` | JSON read | Public | Gallery cards; empty loading state | VERIFIED FACT; depends on `is_verified` |
| Catalog | People directory | `portfolios[]`, verification flags | `catalog.html` | `app.py:1542-1582` | JSON read | Public but filters non-verified unless admin | Directory list or empty state | VERIFIED FACT; empty in snapshot |
| Contact inquiry | Convert public interest into private record | DB `Message` + JSON copy | `index.html:306-411` | `app.py:1656-1780` | Dual write, no transaction | Public submit; member/admin view | Stored message + notification attempts | VERIFIED FACT with partial-failure risk |
| Internal messaging | Member↔administration threads | DB `Message` root/reply via `parent_id` | `dashboard/internal_*.html` | `app.py:2862-3035,1272-1359` | DB + some JSON reads | View check present; send/reply/delete checks incomplete | Thread list/view/reply; "archive" hard-deletes | VERIFIED FACT with major gaps |
| Notification bell | Surface unread activity | Live DB queries | `dashboard/base.html:233-309` | `app.py:1090-1154` | No notification table | No auth decorator; ad hoc filters | Badge + dropdown every 30s | VERIFIED FACT with security/consistency gaps |
| Telegram notifications | Notify users/admin externally | Bot token/chat IDs from config/data | Settings tabs | `app.py:206-402,907-1009,2334-2397,2487-2518` | Config data | Route-dependent | Real HTTP sends; blocked in discovery runtime | VERIFIED FACT integration; not exercised live |
| SMTP notifications | Email notifications | SMTP config/credentials | Settings tabs | `app.py:241-262,371-402,1411-1416,1585-1653,2439-2481` | Config data | Route-dependent | Real SMTP sends; blocked in discovery runtime | VERIFIED FACT integration; not exercised live |
| Backup create/list/restore/download | Protect JSON data | `data.json` copy + metadata | `dashboard/settings.html` | `app.py:507-622,1883-1998` | Local files in `backups/` | Login required for download | JSON backup file; restore overwrites JSON | VERIFIED FACT; excludes DB/uploads/logs |
| Scheduler | Hourly backup + no-op demo reset | Local files | None | `app.py:119-122,593-622` | Local FS | Process-level | Starts at import; disabled in isolated runtime | VERIFIED FACT; duplicate under 4 workers is INFERENCE |
| Visitor log | Track profile visits | JSON `visitors{}` | None public | `app.py:167-194,1157-1203` | JSON | Public route side effect | Daily dedup, trimmed at 1000 | VERIFIED FACT |
| PDF CV | Generate/download portfolio CV | JSON portfolio | `cv_preview.html`, public link | `app.py:3508-3548` | In-memory PDF | Public link but uses session username | PDF response | VERIFIED FACT; native WeasyPrint success UNKNOWN |
| Uploads/media | Store profile/project images | Files | File inputs in dashboard forms | `app.py:89-92,405-408,2534-2540,2624-2631` | `static/assets/uploads/` | Per-user form context | Public image URLs | VERIFIED FACT; no cleanup |
| Error pages | Handle 403/404/500/503/413 | N/A | `403.html`, `404.html`, `500.html`, `503.html`, `400.html` | `app.py:1428-1457` | N/A | Public | 404/500 render; 403/503 extend missing `base.html` | VERIFIED FACT with latent defects |
| Sitemap/robots | SEO control | Global projects + route strings | XML/text | `app.py:1803-1871` | JSON read | Public | Invalid `/project/<id>` path; no portfolio URLs | VERIFIED FACT; currently latent because global projects empty |
| Subscription mockup | Unimplemented monetization | Hardcoded plans/payments | `dashboard/subscription.html` | No route; `payment` endpoint absent | None | None | Unreachable | VERIFIED FACT dead code |
| Deprecated chat | Legacy support chat | DB users/messages | `dashboard/chat.html`, `chat_list.html` | `app.py:1246-1266` | DB | Admin list; selection redirects | Nonfunctional compose path | VERIFIED FACT deprecated |
| Documentation page | Help route | Missing target file | none | `app.py` route returns 404 | None | Public | Always 404 | VERIFIED FACT broken |

---

## 2. Lifecycle gaps by object

### 2.1 Account lifecycle

**VERIFIED FACT:** Intended: register → login → use dashboard → logout. Actual: admin-created account → login → logout works; self-registration is broken (`app.py:725-730`). User delete removes JSON user but can orphan DB rows and uploads (`AUDIT/FINAL_ASSESSMENT.md:133`).

**INFERENCE:** There is no soft-deactivate, password reset, email verification, or account recovery workflow in the route set.

### 2.2 Portfolio content lifecycle

**VERIFIED FACT:** Create/edit/update/delete operations write JSON directly. There is no versioning, publish state, approval queue, or rollback beyond basic JSON backup copies (`app.py:411-468,507-622`).

**VERIFIED FACT:** Public rendering reads the latest JSON on each request (`app.py:473-504`), so edits are immediately public if the portfolio is reachable.

**VERIFIED FACT:** Uploaded images are written to public static storage and are not deleted when a project/profile image is replaced or deleted (`app.py:2534-2540,2624-2699`).

### 2.3 Message/contact lifecycle

**VERIFIED FACT:** Public contact inquiry: form → honeypot/rate/required checks → DB insert → JSON legacy copy → Telegram/SMTP dispatch attempts → redirect with flash (`app.py:1656-1780`). No transaction spans DB and JSON writes.

**VERIFIED FACT:** Internal thread: root message with `parent_id=None`, later messages reply to root UUID (`app.py:2941-2969`). There is no Conversation model, no initiator field, no direction field, no durable archive state (`models.py:70-84`; `AUDIT/08:62-117`).

**VERIFIED FACT:** "Archive Thread" deletes the DB root row and removes the JSON copy for the current user; replies are orphaned (`app.py:3121-3163`).

**INFERENCE:** This lifecycle does not satisfy the approved archiving policy (`AUDIT/08:42-54`). No restoration path exists.

### 2.4 Notification lifecycle

**VERIFIED FACT:** Notification bell is a live DB query plus client polling; no persistent notification entity. Internal message sends and replies call no notification helper (`AUDIT/08:137-151`).

**VERIFIED FACT:** External Telegram/SMTP sends have no retry, deduplication, delivery receipt, or audit log (`AUDIT/FINAL_ASSESSMENT.md:139,154`).

**INFERENCE:** Notifications are best-effort and cannot be treated as a reliable communication guarantee.

### 2.5 Backup lifecycle

**VERIFIED FACT:** Hourly scheduler and manual action copy only `data.json` into `backups/` with metadata; retain 20 (`app.py:507-622`). Restore overwrites JSON without validation; download is available to any logged-in user (`app.py:1883-1998`).

**VERIFIED FACT:** DB, uploads, IP log, and config files are not included.

**UNKNOWN:** Whether the hosting platform provides persistent disk; `render.yaml` declares no disk (`render.yaml:1-17`).

---

## 3. Cross-module dependency map

| Dependency | Classification | Consequence |
| --- | --- | --- |
| Public portfolio visibility depends on JSON `is_verified` flags | VERIFIED FACT | Snapshot users lack the flag; directory/gallery can be empty (`AUDIT/FINAL_ASSESSMENT.md:21`, `app.py:1562-1564`). |
| Admin user management feeds JSON login and DB `User` rows | VERIFIED FACT | DB failures only warn; identities diverge (`AUDIT/FINAL_ASSESSMENT.md:133`). |
| Contact inquiry depends on both DB and JSON | VERIFIED FACT | Partial writes can leave inconsistent records (`app.py:1727-1754`). |
| Notifications depend on external credentials in config/data | VERIFIED FACT | Missing/invalid credentials can silently break delivery; discovery blocks them. |
| Internal threads depend on raw `Message.parent_id` strings | VERIFIED FACT | No FK/cascade; deleting root orphans replies (`models.py:81`; `AUDIT/08:70`). |
| Authorization depends on session booleans and JSON re-reads | VERIFIED FACT | Stale privileges and demo restrictions are route-specific (`app.py:625-720`). |
| Public images depend on local static filesystem | VERIFIED FACT | Portability and backup incomplete. |
| PDF CV depends on WeasyPrint native libraries | VERIFIED FACT / UNKNOWN success | Deployment success unknown (`AUDIT/FINAL_ASSESSMENT.md:102,230`). |
| Theme selection depends on JSON settings and CSS attribute | VERIFIED FACT | Works as presentation layer; no layout variants. |

---

## 4. Duplicate, dead, and disconnected functionality

**VERIFIED FACT:** Duplicate functionality:
- Config duplicated between `config.py` and `app.py:88-96`, including double DB-URL normalization (`AUDIT/FINAL_ASSESSMENT.md:152`).
- Four Telegram sender paths and five SMTP paths (`AUDIT/FINAL_ASSESSMENT.md:139,154`).
- Message filtering repeated across at least four functions (`AUDIT/FINAL_ASSESSMENT.md:152`).
- JSON `messages[]` and DB `Message` represent overlapping concepts with divergent read flags and IDs (`AUDIT/08:119-135`).

**VERIFIED FACT:** Dead/disconnected:
- Unused ORM models `Project`, `Skill`, `Client`, `VisitorLog` (`AUDIT/FINAL_ASSESSMENT.md:57-59,154`).
- Unreferenced templates including `subscription.html`, `user_profile.html`, and broken `chat.html` (`AUDIT/06_TECHNICAL_DEBT.md`; `AUDIT/08:174-179`).
- No-op hourly `reset_demo_data()` (`AUDIT/FINAL_ASSESSMENT.md:142,154`).
- Unreachable code at `app.py:1360-1364,3106-3118` (`AUDIT/FINAL_ASSESSMENT.md:154`).
- Missing endpoints referenced by templates/routes: `login`, `read_message`, `dashboard_clear_chat`, `payment` (`AUDIT/FINAL_ASSESSMENT.md:17`).

**INFERENCE:** Dead code should be retained until external deep links are ruled out (`AUDIT/FINAL_ASSESSMENT.md:229`), but must not be mistaken for live capability.

---

## 5. State-transition problems

| Problem | Classification | Evidence |
| --- | --- | --- |
| No publish/unpublish state for portfolios | VERIFIED ABSENCE | JSON CRUD writes directly; public route always renders current data (`app.py:473-504,2524-2774`). |
| No authoritative read/unread definition | VERIFIED FACT | Four different definitions plus client-side overwrite (`AUDIT/08:119-135`). |
| GET requests mutate state | VERIFIED FACT | view/delete/convert routes change read flags or delete rows on GET (`AUDIT/08:133,167-168`). |
| "Delete" means hard delete for DB messages | VERIFIED FACT | `app.py:3135-3136`; contradicts approved archive policy. |
| No archive restoration | VERIFIED FACT | no route/field (`AUDIT/08:114-115`). |
| No transaction across JSON and DB | VERIFIED FACT | contact and delete flows write both (`app.py:1727-1754,3124-3153`). |
| No user ownership abstraction | VERIFIED FACT | each route filters ad hoc (`AUDIT/08:154-179`). |

---

## 6. Preserve-vs-fix view

**VERIFIED FACT — preserve behaviorally:** login/logout, per-user JSON portfolio CRUD, public portfolio rendering, six themes, member→admin thread core, contact dual write plus notification dispatch until a single store exists, verification check, admin directory, basic backups, Werkzeug hashing, ORM SQL, error/flash UX, existing URLs/templates (`AUDIT/FINAL_ASSESSMENT.md:162-177`).

**VERIFIED FACT — must not be treated as final behavior:** member-to-member messaging inferred from code (forbidden by `AUDIT/08:36-40`), hard delete labelled archive (contradicts `AUDIT/08:42-54`), admin inability to initiate threads (contradicts `AUDIT/08:31-34`).

**INFERENCE:** Lifecycle work should first make existing transitions correct and policy-compliant; only then add new states or features.

---

## 7. Summary

**VERIFIED FACT:** The system has a broad feature surface but shallow lifecycle guarantees. Most content features are JSON CRUD + immediate public render. Messaging has a DB thread core but incomplete authorization, read-state, notification, and archive lifecycles. Operational features are local-file based and not deployment-durable.

**INFERENCE:** The highest-value lifecycle repair is communication correctness because it is both broken and governed by an owner-approved policy. The highest-risk structural issue is dual persistence without transactions or an authoritative store.

**No remediation is performed by this document.**
