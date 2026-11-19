# 08 — Communication Business Rules Addendum

**Date:** 2026-11-19
**Scope:** Internal communication subsystem only. Documentation-only deliverable; no application source, template, schema, data, dependency, or integration was modified.
**Companion documents:** `03_FEATURE_LIFECYCLE.md` §C, `04_DATABASE_AND_DATA_LIFECYCLE.md`, `05_INTEGRATIONS_AND_OPERATIONS.md` §3, `06_TECHNICAL_DEBT.md`, `07_RECOMMENDED_ACTION_PLAN.md` Phase 1, `FINAL_ASSESSMENT.md` Q4.

> **Precedence:** The approved business policy in Section 1 is mandatory and overrides any assumption inferred from the legacy implementation. Where the legacy code and the policy conflict, the code is evidence of *current behavior*, not of *desired behavior*. Behaviors not specified by the product owner are recorded as unresolved in Section 5 and must not be chosen during implementation.

## Evidence conventions

| Label | Meaning |
| --- | --- |
| VERIFIED | Directly observed in source/config/data during this audit. |
| INFERENCE | Strongly implied by source but not exercised at runtime. |
| UNKNOWN | Cannot be established from the supplied snapshot. |
| DOCUMENTED ONLY | Present in prose documentation, not confirmed in implementation. |

---

## 1. Approved business policy (mandatory)

### 1.1 Participants

Communication is restricted to exactly two parties:

- **Members**
- **Administration**

### 1.2 Supported flows

1. A **member can initiate** a conversation with administration.
2. An **administrator can initiate** a conversation with any member.
3. **Administrators can reply** to member-initiated conversations.
4. **Members can reply** to administration-initiated conversations.

### 1.3 Forbidden flows

- Direct **member-to-member** conversations are not allowed.
- Do **not** introduce member discovery or recipient selection that enables members to contact other members.
- Do **not** interpret this system as a general-purpose social messaging platform.

### 1.4 Conversation lifecycle — archiving

Deleting a conversation means **ARCHIVING** it, never permanently deleting it.

Mandatory rules:

- Preserve the conversation record.
- Preserve all associated messages and replies.
- Preserve sender and recipient relationships.
- Preserve message timestamps and historical records.
- Archiving must not physically delete conversation or message records.
- Archived conversations must not appear as active conversations in the normal inbox, unless existing product behavior explicitly requires otherwise.
- **Permanent deletion must not be introduced as part of Phase 1.**

---

## 2. Technical investigation — current implementation

No runtime test was performed (importing `app.py` is state-changing: `db.create_all()` at `app.py:36-43`, directory creation at `app.py:115-132`, scheduler start at `app.py:119-122`). All findings are static-source evidenced.

### 2.1 Conversation IDs vs. message relationships

**VERIFIED — there is no conversation entity and no explicit conversation ID.**

- `models.py` defines seven models; there is no `Conversation` or `Thread` model (`models.py:20-91`).
- A conversation is represented by a root `Message` row (`parent_id == None`) plus reply rows whose `parent_id` is the root's UUID string (`models.py:81`, `app.py:2872`, `app.py:3021`).
- The root is chosen implicitly as the *first* internal parent message between the two parties: `dashboard_internal_send()` queries `Message.query.filter(category='internal', parent_id=None, (sender=A,receiver=B)|(sender=B,receiver=A)).first()` (`app.py:2941-2946`). Subsequent sends become replies to that first row (`app.py:2948-2969`).
- The "thread ID" used in notification links is `msg.parent_id or msg.id` (`app.py:1140-1145`), i.e. the root message UUID.
- `parent_id` is a plain `String(36)` with **no FK, no cascade, no constraint** (`models.py:81`). Deleting a root orphans its replies.

**Consequence for policy:** "Preserve the conversation record" currently means preserving the root `Message` row and every reply row that references it; there is no separate record to preserve.

### 2.2 Sender and recipient identity storage

**VERIFIED — identities are stored as unconstrained strings plus denormalized labels.**

- `Message.sender_id` and `Message.receiver_id` are `String(36)` columns with **no FK** (`models.py:79-80`). `sender_role` is `String(20)` default `'visitor'` (`models.py:82`).
- Denormalized `name` and `email` columns are also stored on each message (`models.py:74-75`; populated at `app.py:2952-2953,2974-2975,1297-1298`).
- Administration is represented by the **literal string `'admin'`** as `receiver_id` (`app.py:1103,1128,2891`), with `name='Admin'` and `email='admin@codexx.academy'` for admin-authored messages (`app.py:2952-2953,2974-2975`).
- Member identity in messages is `str(session['user_id'])` (`app.py:2927,301,1274`), which is a **JSON integer** assigned at user creation (`app.py:2082`). DB `User.id` is a **UUID string** (`models.py:32`). These are different identifier spaces.
- **Administrator identity inconsistency (VERIFIED):** the env-admin login branch sets `is_admin=True` and `username` but **does not set `session['user_id']`** (`app.py:2011-2017`). Therefore `str(session.get('user_id'))` in `dashboard_internal_send()` evaluates to the string `'None'` for env-admin-authored messages (`app.py:2927,2956,2978`). A JSON user with `role='admin'` does receive an integer `user_id` (`app.py:2031-2034`). Admin-authored messages can therefore carry `sender_id='None'`, an integer, or never a DB UUID.
- Internal sends set `workspace_id` to its NULL default (`app.py:2950-2962,2972-2983`), so messages are not scoped to a workspace.

### 2.3 How member-initiated and admin-initiated conversations are distinguished

**VERIFIED — there is no explicit direction or initiator field.**

- Both directions use `category='internal'` and `is_internal=True` (`app.py:2955,2960,2981,1300,1304`).
- The only discriminators are the **values** of `sender_role` (`'admin'` vs `'member'`), `sender_id`, and `receiver_id` (`app.py:2956-2958,2978-2980`).
- `dashboard_internal_view()` labels the parent bubble "Member" unconditionally (`internal_view.html:31-32`), so an admin-initiated parent is mislabelled.
- No code writes an initiator flag, no query filters on one, and no schema column exists for one.

### 2.4 Can multiple administrators participate in one conversation?

**VERIFIED that no structural support or constraint exists; INFERENCE beyond that; product intent UNKNOWN.**

- There is no participants table, no admin ID column, and no per-admin read state. A conversation has exactly one `sender_id` and one `receiver_id` per message (`models.py:79-80`).
- Authorization uses a single boolean `session['is_admin']` (`app.py:638-648,2014,2034`), not an admin identity.
- Multiple admin *accounts* are possible: `dashboard_add_user()` accepts `role` from the form (`app.py:2064`) and stores it in JSON and DB (`app.py:2086,2141,2146`); login derives `is_admin` from `user.get('role') == 'admin'` (`app.py:2034`).
- Any admin can view any DB message (`app.py:3010,3049-3068`) and convert any DB message to a client (`app.py:3177-3186`) without participant checks.
- Because admin-authored messages may carry `sender_id='None'`, the system cannot reliably attribute a message to a specific administrator.
- **UNKNOWN:** whether the product intends one administration identity or multiple distinguishable administrator accounts. This must be clarified before adding any admin-side recipient or participant logic.

### 2.5 Archive state

**VERIFIED — no archive state exists in any store.**

- `Message` has no `is_archived`, `archived_at`, `deleted_at`, or status column (`models.py:70-84`).
- JSON legacy messages have only `read`, `date`, `category`, `id`, `name`, `email`, `message` (`app.py:1745-1752,1334-1344`) — no archive field.
- The word "Archive" appears only as UI wording: `internal_view.html:75-79` ("Archive Thread"), `messages.html:200` ("Archive/Delete this message?"), and `projects.html:69` (unrelated). No route, schema field, or helper implements archiving.
- The link at `internal_view.html:75-79` calls `dashboard_delete_message()` (`app.py:3121-3163`), which executes `db.session.delete(db_msg)` and `db.session.commit()` (`app.py:3135-3136`) and removes the message from the current user's JSON copy (`app.py:3144-3152`). This is a **hard delete mislabelled as archival**.
- **Global vs per-user:** not applicable because no archive state exists. The *deletion* behavior is mixed: the DB row is removed globally (`app.py:3135-3136`), while the JSON copy is removed only from the current user's portfolio (`app.py:3144-3152`). Other users' JSON copies and all replies survive as orphans.
- **Restoration:** **VERIFIED** — no restore-archive route, helper, or field exists anywhere. A hard-deleted row cannot be recovered from the application.
- **Unread on archived items:** not applicable; hard delete removes the row entirely.

**Conflict with approved policy:** TD-08 in `06_TECHNICAL_DEBT.md` currently proposes "add `archived_at`/`is_archived` **or** delete whole thread in one transaction". The second option is now **rejected** by the approved policy. Phase 1 was amended accordingly (see `07_RECOMMENDED_ACTION_PLAN.md` item 1.8).

### 2.6 Unread state calculation

**VERIFIED — four different definitions coexist.**

| Consumer | Query / source | Evidence |
| --- | --- | --- |
| Admin badge — `get_unread_messages_count()` | `is_read=False`, `parent_id=None`, `category in ('platform','internal')`, `receiver_id=='admin'` | `app.py:1096-1104` |
| Member badge — `get_unread_messages_count()` | `receiver_id==str(user_id)`, `is_read=False` — **counts every unread reply**, not just threads | `app.py:1105-1111` |
| Admin dropdown — `get_latest_notifications()` | Same as admin badge but **no `parent_id=None` filter** → includes replies; limit 5 | `app.py:1124-1129` |
| Member dropdown — `get_latest_notifications()` | `receiver_id==str(user_id)`, `is_read=False`, limit 5 | `app.py:1130-1134` |
| Dashboard overview | `stats.unread_messages` derived from JSON `messages[]` via `read` flag — entirely separate from DB | `app.py:2201-2205` |
| Client-side badge | Server value is overwritten by `data.length` from the poll | `base.html:136-141,245-267` |

- Opening `internal_view.html` marks **only the parent** read (`app.py:3014-3018`); replies are read-only dicts in the template and are never marked (`app.py:3021-3029`).
- `dashboard_view_message()` sets the DB `is_read` flag on GET for admins (`app.py:3053-3055`) and for members whose `receiver_id` matches (`app.py:3079-3093`), and writes JSON `read=True` on GET (`app.py:3100-3102`). These mutations are GET state changes.
- The documented `read_message` endpoint (`ux_overhaul_plan.md:10`) does **not** exist (AST scan of 72 routes; see `01` §7).
- **Consequence:** counters disagree, and a member's unread count can remain positive after reading a thread because replies stay unread.

### 2.7 Notification triggering

**VERIFIED — no notification table; notifications are live queries plus external sends.**

- Bell badge/dropdown are live DB queries (`app.py:1090-1154`) polled every 30 s (`base.html:307`). There is no notification history or persistence.
- **Internal message and reply sends do not call any notification helper** (`app.py:2925-2992,1272-1359`). Recipients only discover them via polling.
- External notification paths and their triggers (`05` §1–2, `03` D.1):
  - Platform inquiry via `/contact`: admin Telegram + admin SMTP + optional confirmation (`app.py:1688-1770`).
  - Portfolio inquiry: DB + JSON write, user Telegram/SMTP (`app.py:1697-1770`).
  - `/contact/academy`: admin notification plus separate global-config email (`app.py:1368-1425`).
  - User created / verification / access change / password change / login: user- or admin-scoped events (`app.py:818-832,866-870,3470-3473,2019-2046`).
  - New lead and client status change: synchronous user Telegram (`app.py:3337-3344,3386-3400`).
  - Backup created/restored (`app.py:1898-1932`).
  - Project add/update: templates exist but are never invoked (`app.py:963-970`). Visitor arrival is explicitly disabled (`app.py:1178`).
- Payload exposure risk: `get_latest_notifications()` returns sender `name`, a **50-character excerpt of message content**, `category`, and time (`app.py:1143-1150`), rendered into the DOM with `innerHTML` (`base.html:288-299`). The route has **no authentication decorator**; it currently returns `[]` when no session identity is present (`app.py:1120-1136`), so no anonymous disclosure is VERIFIED, but authorization is ad hoc session-derived filtering rather than a server-side boundary. Admin filtering does not restrict by conversation participant beyond the literal `'admin'` receiver (`app.py:1124-1129`).
- All external sends are unobserved: no retry, dedup, delivery receipt, or audit log (`05` §1.2, §2.3). Test endpoints send real messages (`app.py:2439-2518`) and were not invoked.

### 2.8 Ownership checks on every relevant route

**VERIFIED — checks are inconsistent; hidden UI controls are the only "boundary" in several places.**

| Route | Function / lines | Current server-side check | Verdict |
| --- | --- | --- | --- |
| `GET /dashboard/messages` | `dashboard_messages()` `app.py:2780-2856` | Members filtered by `receiver_id`/`sender_id` or own JSON; admin sees platform/internal | PARTIAL — filtering present; no workspace filter |
| `GET /dashboard/messages/internal` | `dashboard_internal_messages()` `app.py:2862-2906` | Non-admin filtered to sender or receiver (`app.py:2875-2876`) | PRESENT for listing |
| `GET /dashboard/messages/internal/compose[/<receiver_id>]` | `dashboard_internal_compose()` `app.py:2913-2919` | None. Any `receiver_id` is resolved via `User.query.get()` and rendered; no role check, no member→member block | **ABSENT** |
| `POST /dashboard/messages/internal/send` | `dashboard_internal_send()` `app.py:2925-2992` | None. Raw `receiver_id` from hidden form (`app.py:2931`); no existence, role, self-send, or member→member validation | **ABSENT** |
| `GET /dashboard/messages/internal/view/<id>` | `dashboard_internal_view()` `app.py:2998-3035` | Admin OR sender OR receiver (`app.py:3009-3012`) | PRESENT — but admin bypass is unconditional |
| `GET /dashboard/messages/view/<id>` | `dashboard_view_message()` `app.py:3041-3118` | Admin may view any DB message; member DB messages require `receiver_id == user_id` (`app.py:3079`); JSON scoped to own portfolio | PARTIAL — sender-only messages not viewable; GET mutates read state |
| `POST /dashboard/messages/reply/<id>` | `dashboard_reply_message()` `app.py:1272-1359` | **None** — any logged-in user with a UUID can inject a reply (`app.py:1289-1308`) | **ABSENT** |
| `GET /dashboard/messages/delete/<id>` | `dashboard_delete_message()` `app.py:3121-3163` | Admin OR receiver for DB (`app.py:3134`); sender cannot delete; JSON scoped to current user | PARTIAL — mislabelled hard delete; GET state change |
| `GET /dashboard/messages/convert/<id>` | `dashboard_convert_message_to_client()` `app.py:3166-3232` | Admin any DB message; member only own JSON (`app.py:3177-3194`) | PARTIAL — GET state change; no conversation ownership check |
| `GET /dashboard/notifications/latest` | `get_latest_notifications()` `app.py:1117-1154` | No auth decorator; session-derived ad hoc filters; content excerpt in payload | **ABSENT as a boundary** |
| `GET /dashboard/chat[/<user_id>]` | `dashboard_chat()` `app.py:1246-1266` | Admin list rendered at `app.py:1260`; selection and all member access redirect at `app.py:1266` | DEPRECATED — do not use as a security or UI boundary |

**Hidden-UI evidence (not a security boundary):**

- `internal_messages.html:16-20` hides the compose button from admins, but no backend check prevents an admin from posting, and no backend check prevents a member from posting to another member.
- `internal_compose.html:18` uses a hidden `receiver_id` field (`'admin'` by default); it is client-controlled and must be validated server-side.
- `internal_messages.html:17` hard-codes `receiver_id='admin'`.
- `chat_list.html:22` lists DB users for admins, but `dashboard_chat()` redirects the selected user URL (`app.py:1266`). **Precision note:** contrary to the earlier summary that `/dashboard/chat` "only redirects", it *does* render `chat_list.html` for an admin without `user_id` (`app.py:1257-1260`); the compose path still does not work because the user link redirects.
- `user_profile.html:18,42` contains compose links with `receiver_id=target_user.id`, but no route renders that template (source scan found no `render_template('dashboard/user_profile.html')`). `view_user.html` has no compose link.
- `chat.html:38` calls the non-existent `dashboard_clear_chat` endpoint; `chat.html:84` also uses a hidden `receiver_id`.

---

## 3. Authorization boundaries for Phase 1

These boundaries must hold server-side, independent of what the UI displays.

### 3.1 Required rules

1. Members may access **only** conversations in which they are authorized participants.
2. Members must never access another member's conversations — view, reply, archive, or conversion must all be checked by ID.
3. Members must not be able to create a message addressed directly to another member.
4. Administrators may initiate conversations with any member.
5. Administrator access must follow explicit role and authorization checks (`session['is_admin']` alone is insufficient if it can be stale — see `app.py:656-668` and `06` TD-37).
6. Hidden UI controls, hidden form fields, and URL parameters are **never** security boundaries.

### 3.2 Routes requiring authorization checks

| Route | Required check |
| --- | --- |
| `POST /dashboard/messages/internal/send` | Resolve `receiver_id` server-side; if sender is a member, receiver **must** be the administration identity; reject member→member and self-send; reject unknown IDs. |
| `GET /dashboard/messages/internal/compose[/<receiver_id>]` | Apply the same receiver validation as send; do not expose a member picker to members. |
| `GET /dashboard/messages/internal/view/<id>` | Require sender, receiver, or authorized admin; verify from current server-side identity, not denormalized name fields. |
| `POST /dashboard/messages/reply/<id>` | Require participation in the root conversation; derive the other party from the root, never from a client field. |
| `GET /dashboard/messages/delete/<id>` | Replace with POST + CSRF; require participation or authorized admin; archive, never delete. |
| `GET /dashboard/messages/convert/<id>` | Convert to POST + CSRF; require participation or authorized admin. |
| `GET /dashboard/messages/view/<id>` | Require participation; admin override must be explicit and role-checked. |
| `GET /dashboard/notifications/latest` | Require authentication and return only the caller's authorized data; do not include content excerpts for unauthorized principals. |
| `get_unread_messages_count()` (helper) | Use the same canonical, participant-scoped query as the notification endpoint. |
| `GET /dashboard/chat[/<user_id>]` | Remove from the authorization surface or make it an explicit admin-only member picker that links to a working authorized compose path. Do not rely on its current redirect as a boundary. |

**Identity prerequisite:** before enforcing these checks, the project must decide a single administration identity representation. Today it is a literal `'admin'` string, an unrecorded `'None'` for env-admin sends, and an integer for JSON admin accounts (Section 2.2). Authorization logic built on the current values would be fragile and could lock out admin-initiated threads.

---

## 4. Archive requirements (approved)

The following are mandatory and **not** open for substitution:

- No physical deletion of conversation or message records in Phase 1.
- Complete history preserved: root message, every reply, sender/receiver relationships, and all timestamps.
- Archived conversations excluded from the active inbox, unless existing product behavior explicitly requires otherwise.
- A durable archive state must exist in a persistent store; a UI label alone is not archiving.
- The existing "Archive" link must be rewired to the archive action, with POST + CSRF (the current link is a destructive GET).
- No restore behavior may be assumed or silently implemented (Section 5).

**Implementation dependency (risk):** adding a durable archive state implies a schema or persistent-state change (e.g. an `is_archived`/`archived_at` field on `Message`, or a separate archive association). The current Phase 1 constraint "without changing data model" (`07_RECOMMENDED_ACTION_PLAN.md` Phase 1 goal) therefore conflicts with the archive requirement. This must be resolved by product-owner decision before implementation: either (a) permit a minimal, reviewed state addition in Phase 1 with a baseline migration pulled forward, or (b) explicitly defer the archive mechanism and block Phase 1 acceptance on criterion 8. **Do not silently choose either path.** Note that Alembic is installed but unused and no migration directory exists (`04` §3), so option (a) has real setup cost.

---

## 5. Unresolved archive semantics — alternatives and consequences

These details are **not approved**. They must be decided by the product owner before implementation; no option below has been selected in this document.

### 5.1 Global vs per-participant hiding

| Alternative | Consequence |
| --- | --- |
| Archive hides the conversation for **both** participants | Simplest data model (single flag on the root/thread). Either participant archiving removes the thread from both inboxes. Risk: one party can unilaterally remove an active conversation from the other's inbox; may conflict with "both participants can exchange replies" if a new message arrives. |
| Archive hides the conversation **only for the participant who archived it** | Requires per-participant archive state (e.g. one record per `message_id` + `participant_id`). Preserves the other party's active inbox. More complex mapping, especially because admin identity is currently ambiguous (Section 2.2). Legacy JSON copies are already per-user, so a per-user flag would align with that pattern but not with the single DB row. |

### 5.2 May an administrator archive a member-initiated conversation?

| Alternative | Consequence |
| --- | --- |
| Yes | Administration can clear its inbox, but could hide a member's active conversation if hiding is global; needs a rule for member notification/visibility. |
| No | Admin inbox cannot be cleared of member-initiated threads; may be operationally unacceptable. |
| Yes, but per-participant only | Admin hides it from their own view without affecting the member; requires the per-participant model in 5.1. |

### 5.3 Can archived conversations be restored?

| Alternative | Consequence |
| --- | --- |
| Yes | Requires a restore route and a durable archive flag; restore must be authorized and idempotent. Must define what happens to read state and ordering on restore. |
| No | Archive is terminal from the user's perspective, but records remain preserved for audit/history; satisfies "no physical deletion" and avoids restore authorization complexity. |

### 5.4 Does a new message reactivate an archived conversation?

| Alternative | Consequence |
| --- | --- |
| Yes (auto-reactivate) | Matches natural messaging expectations and prevents replies from disappearing into an archived thread. Requires clearing archive state on new message and notifying the other party. Risk: a party who archived to stop contact can be pulled back into an active thread. |
| No | Archived thread stays hidden; a new reply could be effectively invisible unless the notification dropdown still surfaces it. Requires an explicit rule for where such replies appear. |

**Status of all four questions: UNKNOWN / awaiting product-owner approval. No implementation choice is authorized.**

---

## 6. Phase 1 acceptance criteria (mandatory verification)

Every communication-related Phase 1 item is unacceptable unless **all** of the following are demonstrated in an isolated copy with stubbed notification transports. Each row states the verification method required.

| # | Criterion | Verification method | Status |
| --- | --- | --- | --- |
| 1 | Members can initiate conversations with administration. | As a member, submit a valid internal send to the approved administration identity; assert a persisted root `Message` with `category='internal'`, correct `sender_role`, `receiver_id`, and timestamp; assert redirect to the thread. | Not implemented |
| 2 | Administrators can initiate conversations with any member. | As an admin (test both env-admin and JSON-admin variants), use a server-side member picker to start a thread with a chosen member; assert the persisted row uses that member's validated ID and a non-`'None'` admin sender identity; assert the member can see and reply to it. | Not implemented |
| 3 | Member-to-member communication is blocked at the backend. | Member POST with another member's ID is rejected (no row persisted, explicit error); member GET of a member-targeted compose URL is rejected; direct DB/route fuzzing over IDs shows a single server-side rule. Success criterion is backend rejection, not a hidden button. | Not implemented |
| 4 | Both participants can exchange replies according to authorization rules. | Member replies to an admin-initiated thread and admin replies to a member-initiated thread both persist with correct `parent_id` and derived `receiver_id`; an outsider's reply to either is rejected. | Not implemented |
| 5 | Message ownership and conversation access are verified server-side. | Execute the route matrix in Section 3.2 with member A, member B, and admin credentials; member A cannot view, reply, archive, or convert member B's threads by forged ID; admin access is role-checked. Remove reliance on hidden fields. | Not implemented |
| 6 | Read/unread state is consistent with the actual message lifecycle. | Seed a thread with replies; assert badge, poll list, thread view, and overview use one canonical definition; opening the thread marks the approved set of messages read; an authorized read-state endpoint exists and updates exactly that set. | Not implemented |
| 7 | Notifications do not expose message content or recipient information to unauthorized users. | With stubbed Telegram/SMTP, assert `/dashboard/notifications/latest` enforces authentication and returns only the caller's authorized conversations; assert payload fields are minimal; assert no cross-user recipient identity or content appears in any user's payload or external message. No live sends. | Not implemented |
| 8 | Archiving preserves the complete conversation history. | Archive a thread containing at least two replies; assert root and replies still exist with sender/receiver IDs and timestamps intact; assert the thread is hidden from the active inbox per the approved semantics in Section 5; assert no `DELETE` on message rows occurs. | Blocked — semantics in Section 5 unapproved |
| 9 | No permanent deletion is introduced. | Source scan shows no message-route `db.session.delete`/hard-delete path; archive action is POST + CSRF; row counts are unchanged after archive; no new deletion endpoint exists. | Not implemented |
| 10 | Existing unrelated portfolio and workspace functionality remains unaffected. | Regression pass over portfolio CRUD, public pages, login/logout, user admin, and backups in the isolated copy; non-communication templates and routes produce identical output to the pre-change baseline. | Not implemented |

---

## 7. Relevant source references

| Topic | References |
| --- | --- |
| No conversation model; `parent_id` threading | `models.py:70-84`; `app.py:2941-2946`, `2872`, `3021`, `1140-1145` |
| Identity fields and absence of FKs | `models.py:32,79-82`; `app.py:2927,2956,2978,2082` |
| Admin identity inconsistency | `app.py:2011-2017,2031-2034,2952-2953,2974-2975,1103,1128` |
| Multiple admin accounts possible | `app.py:2064,2086,2141,2146,2034` |
| No direction field | `app.py:2955,2960,2981,1300,1304`; `internal_view.html:31-32` |
| No archive state; hard delete | `models.py:70-84`; `app.py:3121-3163`; `internal_view.html:75-79`; `messages.html:200` |
| Unread definitions | `app.py:1090-1154,2201-2205`; `base.html:136-141,245-267`; `app.py:3014-3029` |
| Missing read-state endpoint | `ux_overhaul_plan.md:10`; no route in `app.py` (72-route AST scan) |
| Notifications and content exposure | `app.py:1117-1154,1143-1150,1688-1770,2925-2992,1272-1359`; `base.html:288-307` |
| Ownership checks | `app.py:2780-2856,2862-2992,2998-3118,3121-3232,1117-1154,1246-1266` |
| Hidden UI / dead compose paths | `internal_messages.html:16-20`; `internal_compose.html:18`; `chat_list.html:22`; `chat.html:38,84`; `user_profile.html:18,42`; `app.py:1260,1266` |
| Existing debt entries | `06_TECHNICAL_DEBT.md`: TD-02, TD-03, TD-04, TD-05, TD-06, TD-07, TD-08, TD-09, TD-10, TD-16, TD-18, TD-20, TD-33, TD-37 |

---

## 8. Risks and implementation dependencies

| ID | Risk / dependency | Evidence | Required resolution |
| --- | --- | --- | --- |
| C-01 | Approved archive policy conflicts with the current Phase 1 "no data model change" constraint and with TD-08's delete option. | `07` Phase 1 goal; `06` TD-08 | Product-owner decision on archive state location; Phase 1 item 1.8 amended to forbid deletion. |
| C-02 | Four archive-semantics questions are unapproved; implementing any of them now would exceed authority. | Section 5 | Written product-owner decision before implementation. |
| C-03 | Administration identity is ambiguous (`'admin'`, `'None'`, integer IDs), so authorization rules could lock out valid admin actions. | `app.py:2011-2017,2031-2034,2927,2956,2978` | Define one canonical admin identity before enforcing participant checks. |
| C-04 | A single canonical unread query does not exist; changing it changes user-visible numbers. | `app.py:1090-1154,2201-2205`; `base.html:245-267` | Settle semantics in Phase 1 item 1.3 before mark-read wiring (1.4). |
| C-05 | Backend recipient validation must precede notification wiring, or notifications may target arbitrary IDs. | `app.py:2931`; `07` dependency 1.6→1.9 | Preserve dependency order in the amended plan. |
| C-06 | Multiple admin accounts are possible but indistinguishable in message records. | `app.py:2064,2034,2952-2953` | Product decision on single vs multiple admin identities (Section 2.4). |
| C-07 | Without an external notification service, adding internal-message notifications multiplies the existing four Telegram/five SMTP paths. | `05` §1–2; `06` TD-41 | Stub transports in tests; consolidate later, not in Phase 1. |
| C-08 | `get_latest_notifications()` returns content excerpts and lacks an auth decorator; fixing it changes the frontend polling contract. **Overlap note:** Phase 1 item 1.12 now covers authentication/payload minimisation for this endpoint; Phase 2 item 2.2 should be treated as satisfied if 1.12 lands first, not repeated. Phase 2 item 2.3 extends ownership checks to backup download, outside this addendum's scope. | `app.py:1117-1154`; `base.html:237-309`; `07` items 1.12, 2.2, 2.3 | Update endpoint and JS together in one commit; test with stubbed data; do not modify Phase 2 text as part of this addendum. |
| C-09 | Deprecated chat paths could be mistaken for the admin compose solution. | `app.py:1246-1266`; `chat.html:38,84`; `chat_list.html:22` | Use only the consolidated internal-messages path; do not revive chat templates. |
| C-10 | Archived state added to JSON only would reintroduce dual-store divergence. | `04` §1; `app.py:3129-3153` | Choose one authoritative store for archive state; avoid ad hoc JSON-only flags. |

---

## 9. Consistency statement and closure

- This addendum **does not change** any finding in `01`–`06` or `FINAL_ASSESSMENT.md`. It refines the communication scope in `07` Phase 1 to reflect the approved policy.
- Where the legacy behavior was described imprecisely earlier, this document records the correction: `/dashboard/chat` renders an admin user list before redirecting on selection (`app.py:1257-1260` vs `1266`), and the sitemap defect is latent because global `projects[]` is empty (`FINAL_ASSESSMENT.md` §0.2).
- The approved business policy takes precedence over every legacy inference. In particular, the TD-08 "delete whole thread" alternative is rejected, and no permanent deletion is authorized in Phase 1.
- **No implementation has been performed.** Do not start Phase 1, modify source, change schema, trigger notifications, or start the scheduler until the product owner explicitly approves both the Phase 1 amendment and the unresolved archive semantics in Section 5.
