# 07 — Ecosystem and User Journeys

**Discovery date:** 2026-11-19
**Scope:** Reconstruct roles, relationships, and workflows that the existing system actually supports. Unsupported steps are recorded as gaps, not invented.

---

## Evidence conventions

| Label | Meaning |
| --- | --- |
| VERIFIED FACT | Directly observed in source/templates/data or controlled runtime evidence. |
| DOCUMENTED INTENT | Stated in docs or product-facing copy. |
| OWNER-PROVIDED CONTEXT | Supplied by the product owner. |
| INFERENCE | Reasoned interpretation supported by evidence. |
| STRATEGIC PROPOSAL | Possible future direction only. |
| UNKNOWN | Insufficient evidence. |

---

## 1. Role inventory

| Role / actor | Classification | Evidence | Reality |
| --- | --- | --- | --- |
| Public visitor | VERIFIED FACT | Public routes at `app.py:1461-1582,473-504,1783-1800`; landing contact form at `templates/landing.html:447-487` | Can browse landing, public portfolios/project pages, and submit academy contact; cannot access dashboard. |
| Member / Regular User | VERIFIED FACT | JSON users and `role='user'` at `app.py:2003-2052`; dashboard nav at `templates/dashboard/base.html:61-102` | Can edit own portfolio, clients, messages, settings; cannot use admin routes. |
| Verified Professional | PARTIAL — VERIFIED FACT | Verification flag used in landing/catalog filtering (`templates/landing.html:356`, `app.py:1562-1564`); badge text at `templates/index.html:81-84,104-108` | Presentation status, not a separate role. Snapshot users lack `is_verified` (`AUDIT/FINAL_ASSESSMENT.md:21`), so directory may be empty. |
| Administration | VERIFIED FACT | Env admin login branch at `app.py:2011-2017`; admin decorators at `app.py:638-648`; admin nav at `templates/dashboard/base.html:41-60` | Full admin dashboard, user management, message oversight; identity is inconsistent (`'admin'`, `'None'`, integer IDs) per `AUDIT/08:74-103`. |
| Demo User | VERIFIED FACT with defects | Session flag `is_demo_mode` at `app.py:657-666`; `disable_in_demo` at `app.py:690-716`; demo card in `templates/dashboard/settings.html:82-84` | Restricted JSON user; restrictions are route-specific and partly brittle. |
| Project Owner / Client | DOCUMENTED INTENT / copy-level role | `templates/landing.html:298,431,499`; `templates/catalog.html:7`; inquiry "Looking for a service" at `templates/index.html:337` | No separate account type, no client-side dashboard, no matching/booking system. Exists as target audience in copy and as private CRM records for members. |
| Business / Organization | VERIFIED ABSENCE as role | No organization model in `models.py:20-91`; no org route in `app.py`; paid Business plan only in dead `templates/dashboard/subscription.html:411-425` | OWNER-PROVIDED CONTEXT only; not implemented. |
| Freelancer | VERIFIED ABSENCE as noun | zero "freelancer" occurrences; "Not a freelance marketplace" at `templates/landing.html:321` | Not an implemented identity. |

---

## 2. Relationship map

**VERIFIED FACT:** The implemented relationships are:

```text
Public visitor
  -> landing / public portfolio / project detail
  -> public inquiry form
       -> DB Message + JSON copy + notification attempts

Member (portfolio owner)
  -> private dashboard
       -> own portfolio content (general/about/skills/projects/clients/social/contact/theme)
       -> internal messages to administration
       -> private client/CRM records
       -> backups and settings

Administration
  -> admin dashboard
       -> user list/add/verify/delete
       -> message oversight and conversion to client
       -> backups
       -> intended two-way internal communication with members

Member  x  Member
  -> direct conversations forbidden by approved policy (AUDIT/08:36-40)
  -> no implemented relationship graph, follow, friend, or member-to-member messenger
```

**INFERENCE:** The ecosystem is hub-and-spoke around Administration and individual portfolios, not a peer-to-peer network. Public visitors interact with profiles through inquiries; members interact with Administration through internal threads; Administration brokers oversight and verification.

---

## 3. Individual / Freelancer journey

### 3.1 Account creation

| Step | Classification | Evidence / status |
| --- | --- | --- |
| Reach registration page | BROKEN — VERIFIED FACT | `/register` route exists at `app.py:725` but calls `url_for('login')` at `app.py:730`; no `login` endpoint exists (`AUDIT/FINAL_ASSESSMENT.md:17-18`). |
| Submit registration | BLOCKED | Cannot complete because endpoint construction fails. |
| Admin-created account | VERIFIED FACT | `dashboard_add_user()` at `app.py:2059-2156` writes JSON user and best-effort DB row; admin can add users. |
| Login | VERIFIED FACT | Env admin and JSON-user login at `app.py:2003-2052`; Werkzeug hashes at `app.py:2029`. |
| Logout | VERIFIED FACT | `app.py:2161-2165` clears session. |

**INFERENCE:** In the current snapshot, account creation is practically administration-driven; self-registration is not a reliable journey.

### 3.2 Profile setup and wallet/portfolio creation

**VERIFIED FACT:** A logged-in member edits profile content through dedicated dashboard routes:
- General: `app.py:2524-2546`
- About: `app.py:2549-2566` (prior audit references)
- Skills: `app.py:2569-2600`
- Projects add/edit/delete: `app.py:2615-2699`
- Clients: `app.py:3235-3438`
- Social: `app.py:2749-2774`
- Contact: `app.py:2729-2746`
- Theme: `app.py:2238-2328`

**VERIFIED FACT:** Edits are JSON-only writes to `data.json → portfolios[username]`; there is no DB transaction and no publish/unpublish workflow (`app.py:411-468`).

**VERIFIED FACT:** Public rendering is immediate at `/portfolio/<username>` (`app.py:473-504`).

**GAP:** No explicit "create wallet" step exists; a portfolio record is created by JSON seed/admin data or by first edit, depending on load behavior (`app.py:411-446`).

### 3.3 Presenting work and services

**VERIFIED FACT:** Work is presented through skills and projects (`templates/index.html:169-267`). Project detail pages exist (`templates/project_detail.html:97-188`).

**VERIFIED ABSENCE:** Services are not first-class objects; the public form has an inquiry type only (`templates/index.html:335-342`). There is no service catalog, pricing, availability, booking, or checkout.

### 3.4 Managing incoming interactions

**VERIFIED FACT:** Members can receive public inquiries persisted to DB and JSON (`app.py:1656-1780`), view messages (`app.py:2780-2856`), convert messages/clients (`app.py:3166-3232`), and manage client records (`app.py:3235-3438`).

**VERIFIED FACT:** Members can communicate with Administration through internal threads (`app.py:2862-2992`). Member-to-member communication is forbidden by approved policy (`AUDIT/08:36-40`).

**GAP:** Internal message and reply delivery notifications are not dispatched; recipients rely on 30-second polling (`AUDIT/08:137-151`).

---

## 4. Project Owner / Client journey

| Step | Classification | Evidence / status |
| --- | --- | --- |
| Discover professionals | PARTIAL — VERIFIED FACT | Landing gallery (`templates/landing.html:356-385`) and directory (`app.py:1542-1582`) exist, but gallery/directory depend on `is_verified`; snapshot has no verified flags (`AUDIT/FINAL_ASSESSMENT.md:21`). |
| Evaluate information | VERIFIED FACT | Public portfolio shows about, skills, projects, contact, social, verified badge; project detail pages add evidence metadata (`templates/index.html:76-267`, `templates/project_detail.html:97-188`). |
| Contact a member | VERIFIED FACT | Portfolio inquiry form writes DB/JSON and attempts notifications (`app.py:1656-1780`). No authentication required. |
| Follow interaction lifecycle | PARTIAL — VERIFIED FACT | Member has CRM client records and message views; public visitor/client has no account, status page, or reply thread visible on the public site. No client-side dashboard. |
| Pay/hire/book online | VERIFIED ABSENCE | No checkout, service product, invoice, contract, or payment route. |

**INFERENCE:** The project-owner journey is a one-way inquiry into a private member workflow, not a full client portal.

---

## 5. Business / Organization journey

**VERIFIED ABSENCE:** No organization model, organization dashboard, team membership, org-owned portfolio, billing account, or business workflow exists in `models.py:20-91` or the `app.py` route set.

**OWNER-PROVIDED CONTEXT:** Businesses and digital service providers were part of the owner's described vision.

**DOCUMENTED INTENT:** `templates/landing.html:298,499` mentions "service providers" and "project owners"; `templates/pages/terms.html:41` mentions "professional services".

**INFERENCE:** Business/organization participation is a STRATEGIC PROPOSAL, not a current capability.

---

## 6. Administration journey

### 6.1 Member management

**VERIFIED FACT:** Admin can list users, add users, verify/unverify, change access, delete users, and view user-related info through routes at `app.py:737-904,2059-2156,3443-3505`.

**VERIFIED FACT:** Admin verification criteria are enforced in the add-user path per prior audit (`AUDIT/FINAL_ASSESSMENT.md:93,106`), but DB sync is best-effort and can warn without failing.

### 6.2 Content oversight

**VERIFIED FACT:** Admin can view messages, convert messages to clients, inspect backups, and access the dashboard (`app.py:2780-3232,1883-1998`).

**GAP:** There is no evidence of admin wallet/content moderation for public portfolio sections beyond user verification and generic CRUD access.

### 6.3 Communication

**VERIFIED FACT:** Admin can view member/internal messages and reply via legacy routes (`app.py:2998-3035,1272-1359`).

**VERIFIED ABSENCE:** Admin cannot initiate a conversation through a working UI: compose button hidden (`templates/dashboard/internal_messages.html:16-20`), `user_profile.html` unreferenced, `/dashboard/chat` selection redirects, `chat.html` calls missing `dashboard_clear_chat` (`AUDIT/08:120-122,174-179`).

**DOCUMENTED INTENT / MANDATORY POLICY:** Admin must be able to initiate a conversation with any member (`AUDIT/08:31-34`). This is a required future rule, not current behavior.

### 6.4 Notifications and configuration

**VERIFIED FACT:** Notification helpers support Telegram and SMTP with multiple config sources (`app.py:206-402,907-1009,2334-2397,2487-2518`); settings routes can perform live sends. External sends are not safe for discovery and are blocked in the isolated runtime.

**VERIFIED FACT:** Bell notifications are live DB queries plus a 30-second client poll, with no notification table (`AUDIT/08:137-151`).

---

## 7. Communication policy comparison

**DOCUMENTED INTENT — approved and mandatory:**
- Only Members and Administration participate (`AUDIT/08:22-28`).
- Member can initiate with Administration; Administration can initiate with any member (`AUDIT/08:29-35`).
- Members cannot communicate directly with other members (`AUDIT/08:36-40`).
- Deleting means archiving with full history preserved; no permanent deletion in Phase 1 (`AUDIT/08:42-54`).

**VERIFIED FACT — current implementation:**
- Member→admin internal send works at the route level (`app.py:2925-2992`).
- `receiver_id` is accepted raw from a hidden field; no member-to-member backend block exists (`app.py:2931`; `AUDIT/08:162-176`).
- Admin initiation has no working UI (`AUDIT/08:120-122`).
- "Archive" is a hard delete of the DB row (`app.py:3121-3163`; `AUDIT/08:105-117`).
- Reply route lacks participant checks (`app.py:1272-1359`; `AUDIT/08:166`).

**UNKNOWN / owner decisions required:** per-participant vs shared archiving, whether admins may archive member-initiated threads, restoration, and reactivation after a new message (`AUDIT/08:230-263`). Do not choose these rules.

---

## 8. Unsupported or missing steps by journey

| Journey | Unsupported step | Classification |
| --- | --- | --- |
| Individual | Self-registration | BROKEN (source-verified) |
| Individual | Explicit wallet creation | VERIFIED ABSENCE |
| Individual | Publish/unpublish control | VERIFIED ABSENCE |
| Individual | Service catalog / pricing / booking | VERIFIED ABSENCE |
| Client | Client account/portal | VERIFIED ABSENCE |
| Client | Direct reply thread visible publicly | VERIFIED ABSENCE |
| Business | Organization account/team | VERIFIED ABSENCE |
| Admin | Admin-initiated conversation UI | VERIFIED ABSENCE vs mandatory DOCUMENTED INTENT |
| All | Archiving with immutable history | VERIFIED ABSENCE vs approved policy |
| All | Member-to-member messaging | FORBIDDEN by approved policy; no supported workflow |

---

## 9. Key dependencies between roles and modules

1. **Public profile rendering depends on JSON portfolio data and verification flags** — `app.py:473-504`, `app.py:1562-1564`.
2. **Inquiry handling depends on DB + JSON dual write and notification credentials** — `app.py:1656-1780`.
3. **Client CRM depends on member-owned JSON records** — `app.py:3235-3438`.
4. **Admin user management feeds both JSON login and DB `User` rows** — `app.py:2059-2156`.
5. **Internal messaging depends on DB `Message` rows with root/reply `parent_id`** — `models.py:70-84`, `app.py:2925-2992`.
6. **Notification badges depend on live DB queries and client polling, not persisted notification state** — `app.py:1090-1154`, `templates/dashboard/base.html:233-309`.

---

## 10. Summary assessment

**VERIFIED FACT:** The supported ecosystem is narrow: public visitors view portfolios and submit inquiries; members manage their own portfolio/CRM and contact Administration; Administration manages users and oversees messages.

**INFERENCE:** The owner's broader freelancer/project-owner/business ecosystem is a plausible STRATEGIC PROPOSAL but is not implemented. The product's strongest verified interaction loop is **portfolio → inquiry → member CRM/private handling**, with **member↔admin internal messaging** as a separate administrative channel.

**No journey expansion or implementation is authorized by this document.**
