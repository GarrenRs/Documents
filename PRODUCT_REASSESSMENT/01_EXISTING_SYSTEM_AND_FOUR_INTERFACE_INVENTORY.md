# 01 — Existing system and four-interface inventory

**Assessment date:** 2026-11-20.
**Mode:** Read-only product reassessment. No source, template, CSS, JS, database, schema, data, dependency, authentication, configuration, billing, deployment, or external-send change was made.
**Runtime used for observation:** isolated Flask production-mode copy bound to `127.0.0.1:5002`, synthetic accounts only, outbound HTTP/SMTP blocked, notification helpers no-oped, APScheduler disabled. No production customer data was used.
**Companion evidence:** `evidence/results/live_results.json`, `live_digest.md`, `cdp_results.json`, `recapture_results.json`, `confirm_results.json`, `screenshot_ocr.md`.

---

## Evidence conventions

| Label | Meaning |
| --- | --- |
| `VERIFIED FACT` | Directly observed in source, templates, data, or controlled runtime/browser evidence. |
| `OWNER-PROVIDED CONTEXT` | Supplied by the product owner; not independently verified as an implementation fact. |
| `DOCUMENTED INTENT` | Explicitly stated in existing documentation or product-facing copy. |
| `INFERENCE` | Reasoned interpretation supported by evidence. |
| `STRATEGIC PROPOSAL` | Possible future direction only; not an existing capability. |
| `UNKNOWN` | Insufficient evidence. |

Where evidence disagrees, the disagreement is recorded rather than forced into a single conclusion.

---

## 1. Owner vision versus verified current implementation

### 1.1 Owner-provided vision

`OWNER-PROVIDED CONTEXT:` Codexx Academy is intended to become a professional digital work environment for Algerian ANAE self-employed digital professionals. It comprises four interfaces — public Academy landing page, Administration Dashboard, Member Dashboard/Private Workspace, and Public Professional Wallet — and should connect to external platforms. Arabic/English readiness and future QR identity cards are part of the longer-term direction.

`OWNER-PROVIDED CONTEXT:` The target user is an Algerian auto-entrepreneur in digital/IT activity, not a generic freelancer and not every holder of a digital skill.

`STRATEGIC PROPOSAL:` Keep the four-interface structure as the product map, but treat the current implementation as an early proof-of-work portfolio/wallet substrate rather than a finished Academy environment.

### 1.2 Verified current implementation baseline

`VERIFIED FACT:` The current product is a single Flask application centred on proof-of-work portfolio presentation and private workspace management.

| Item | Observed value | Label |
| --- | --- | --- |
| Main application file | `app.py`, 3,570 lines, 131,660 bytes | `VERIFIED FACT` |
| Route registrations | 72 `@app.route` declarations | `VERIFIED FACT` |
| Application structure | No Blueprints, application factory, service layer, repository layer, test suite, or migrations | `VERIFIED FACT` |
| Persistence | Dual `data.json` + SQL store; SQL holds messages, JSON holds most portfolio/user concepts | `VERIFIED FACT` |
| Product vocabulary | No implemented financial-wallet concept; “wallet” is not a code/data entity | `VERIFIED FACT` |
| “Silver” | CSS theme name only, not a plan or entitlement | `VERIFIED FACT` |
| “Premium” | Style/entitlement-like language in templates/docs, not enforced commercial behaviour | `VERIFIED FACT` |
| Languages | No `dir="rtl"`, no `lang="ar"`, and no Arabic UI strings in application source/templates | `VERIFIED FACT` |
| Academy operations | Public informational pages and an access-standards page exist; no course, lesson, announcement, broadcast, or academy-content controls were found in the admin UI | `VERIFIED FACT` |
| External platforms | Telegram and SMTP helper code exists; delivery was not proven in the isolated runtime | `VERIFIED FACT` for code; `UNKNOWN` for real delivery |
| Registration | `/register` returns HTTP 500 in the fresh isolated runtime | `VERIFIED FACT` |

`INFERENCE:` The current application is product-compatible with parts of the owner vision — public proof, private workspace, admin governance — but does not yet implement the Academy, ANAE, bilingual/RTL, QR-identity, or reliable integration layers as product capabilities.

---

## 2. Coverage accounting

### 2.1 Definitions

- **Route registration:** one `@app.route` decorator in `app.py`.
- **HTML page route:** a GET-capable route pattern that renders a user-visible page. Shared page patterns are counted once globally but once per interface where they serve distinct roles.
- **Utility GET route:** a GET-capable route returning JSON, XML, text, a file, redirect, or action result rather than a distinct page.
- **Functionally tested:** a case executed by the CDP harness in the isolated runtime.
- **Workflow completed:** an objective-driven sequence of cases with a recorded outcome; a completed workflow may include a failed or negative result as its finding.
- **Failed/unverified case:** a distinct observed defect, blocked state, or claim that cannot be proven with available evidence.

### 2.2 Exact totals

| Coverage measure | Exact count | Notes |
| --- | ---: | --- |
| Route registrations discovered | 72 | AST-verified from `app.py`. |
| GET-capable route patterns | 56 | Includes pages, JSON, files, redirects, and GET actions. |
| POST-only route patterns | 16 | Mostly form writes, admin actions, and integration tests. |
| HTML page route assignments across four interfaces | 48 | Interface view; shared patterns counted per interface role. |
| Unique HTML page route patterns | 45 | After de-duplicating `/dashboard`, `/dashboard/settings`, `/cv-preview`. |
| Shared HTML page patterns counted in two interfaces | 3 | `/dashboard`, `/dashboard/settings`, `/cv-preview`. |
| Utility GET routes excluded from page count | 11 | Listed in §2.3. |
| Live CDP cases executed | 35 | 35 completed, 0 harness failures. |
| Grouped workflows/probes completed | 23 | Listed in `03_END_TO_END_USER_AND_ADMIN_WORKFLOWS.md`. |
| Distinct failed/unverified cases recorded | 14 | Listed in §7 and carried through the package. |
| Screenshots captured and OCR/metadata-inspected | 67 | 38 initial + 13 recapture + 16 confirmed recapture. |

### 2.3 Utility GET routes excluded from HTML page count

`VERIFIED FACT:` These 11 GET-capable routes are real but are not distinct HTML pages:

1. `/dashboard/notifications/latest` — JSON poll endpoint.
2. `/sitemap.xml` — XML.
3. `/robots.txt` — text.
4. `/favicon.ico` — image file.
5. `/backup/download/<filename>` — file download.
6. `/api/backups` — JSON.
7. `/dashboard/logout` — redirect/action.
8. `/dashboard/messages/delete/<message_id>` — GET action.
9. `/dashboard/messages/convert/<message_id>` — GET action.
10. `/dashboard/clients/delete/<int:client_id>` — GET action.
11. `/download-cv` — generated file.

---

## 3. Interface 1 — Public Academy landing page

### 3.1 Purpose observed

`DOCUMENTED INTENT:` The landing page presents Codexx Academy as a curated proof-of-work ecosystem: “Where Real Work Is Shown, Not Sold.” It explicitly states that it is not a freelance marketplace, bidding platform, or social network.

`VERIFIED FACT:` Live visible sections include hero copy, “What It Is”, “What It Is NOT”, “Why It Exists”, verified portfolio gallery messaging, verification explanation, portfolio types, and an Academy contact form.

### 3.2 Discovered HTML page routes — 13

| Route | Observed role | Evidence |
| --- | --- | --- |
| `/` | Landing page; also exposes portfolio cards and Academy contact form | `VERIFIED FACT` |
| `/landing` | Alternate landing route | `VERIFIED FACT` |
| `/about` | “About Academy” / philosophy page | `VERIFIED FACT` |
| `/verification` | Professional verification standard | `VERIFIED FACT` |
| `/standards` | Elite standards | `VERIFIED FACT` |
| `/mastery` | Mastery guide | `VERIFIED FACT` |
| `/security-audit` | Security/audit claim page | `VERIFIED FACT` |
| `/privacy` | Privacy policy | `VERIFIED FACT` |
| `/terms` | Terms of service | `VERIFIED FACT` |
| `/catalog` | Portfolios directory; currently placeholder copy | `VERIFIED FACT` |
| `/documentation` | Route exists but returns HTTP 404 in fresh runtime | `VERIFIED FACT` |
| `/guides/telegram-bot-token` | Telegram token guide | `VERIFIED FACT` |
| `/guides/telegram-chat-id` | Telegram chat-ID guide | `VERIFIED FACT` |

`VERIFIED FACT:` `/contact/academy` is a POST-only form action, not a GET page. Direct GET returned HTTP 405 in the fresh runtime.

### 3.3 Functionality observed

| Capability | Status | Label |
| --- | --- | --- |
| Public landing and informational page rendering | Working for all 7 informational pages probed | `VERIFIED FACT` |
| Landing link/CTA inventory | Login, directory anchor, verification, about, mastery, standards, security, privacy, terms, contact form | `VERIFIED FACT` |
| Academy contact form presence | Form found on landing | `VERIFIED FACT` |
| Academy contact form direct GET | HTTP 405; POST form path exists | `VERIFIED FACT` |
| Catalog | Renders “directory is currently being prepared” rather than a populated directory | `VERIFIED FACT` |
| Documentation link target | `/documentation` returns 404 | `VERIFIED FACT` |
| SEO utility routes | `/sitemap.xml` and `/robots.txt` return 200 | `VERIFIED FACT` |

`UNKNOWN:` Whether the Academy contact form produces a real external message. The isolated runtime blocked outbound delivery and no provider acceptance or receipt was observed.

---

## 4. Interface 2 — Administration Dashboard

### 4.1 Purpose observed

`DOCUMENTED INTENT:` The admin interface provides platform governance: user directory, access standards, settings, backups, channels, and inbox.

`VERIFIED FACT:` Admin dashboard cards show Total Users, Active Portfolios, System Messages, Total Traffic, Manage Users, System Security, Platform View, and Terminate Session.

### 4.2 Discovered HTML page routes — 10

| Route | Observed role | Evidence |
| --- | --- | --- |
| `/register` | Disabled registration path; currently HTTP 500 | `VERIFIED FACT` |
| `/dashboard/login` | Shared authentication entry | `VERIFIED FACT` |
| `/dashboard` | Role-dependent dashboard; admin variant shows governance cards | `VERIFIED FACT` |
| `/dashboard/users` | User directory | `VERIFIED FACT` |
| `/dashboard/user/<int:user_id>` | User detail and verification controls | `VERIFIED FACT` |
| `/dashboard/access-instructions` | Access & verification standards | `VERIFIED FACT` |
| `/dashboard/backups` | Backup view | `VERIFIED FACT` |
| `/dashboard/chat` | Legacy chat list; redirects to consolidated messages | `VERIFIED FACT` |
| `/dashboard/chat/<user_id>` | Legacy chat target; redirects to consolidated messages | `VERIFIED FACT` |
| `/dashboard/settings` | Settings shell with themes/notifications/backups; shared with member view | `VERIFIED FACT` |

### 4.3 Admin action endpoints observed

`VERIFIED FACT:` Admin-only or admin-relevant POST/action routes include user verification toggle, demo toggle, user deletion, user provisioning, backup create/restore/delete, notification settings, SMTP settings, Telegram settings, email test, and Telegram test.

`VERIFIED FACT:` Admin UI search found no controls containing: `announcement`, `announce`, `course`, `lesson`, `academy content`, or `broadcast`.

`VERIFIED FACT:` Direct GET of `/dashboard/telegram` and `/dashboard/smtp` returns HTTP 405 because they are POST-only. This does not prove the settings UI is absent; the settings page contains notification sections, but the fresh runtime did not attempt real configuration writes.

`INFERENCE:` The admin dashboard is an operator console for the existing portfolio platform, not an Academy content-management interface.

---

## 5. Interface 3 — Member Dashboard / Private Workspace

### 5.1 Purpose observed

`DOCUMENTED INTENT:` The member workspace is described as a secure private execution environment for identity, proposition, competencies, gallery, contact, CRM, inbox, internal messages, channels, and settings.

`VERIFIED FACT:` Member dashboard cards show Total Active Projects, Core Competencies, Inbound Requests, Visitor Reach, Public Visibility, and quick actions.

### 5.2 Discovered HTML page routes — 22

| Route | Observed role |
| --- | --- |
| `/dashboard` | Shared dashboard; member variant |
| `/dashboard/general` | Identity and vision |
| `/dashboard/about` | Proposition/about |
| `/dashboard/skills` | Core competencies |
| `/dashboard/projects` | Portfolio gallery |
| `/dashboard/projects/add` | Add project |
| `/dashboard/projects/edit/<int:project_id>` | Edit project |
| `/dashboard/contact` | Contact information |
| `/dashboard/social` | Social links / channels |
| `/dashboard/messages` | Inbound message list |
| `/dashboard/messages/internal` | Internal message list |
| `/dashboard/messages/internal/compose` | Internal compose |
| `/dashboard/messages/internal/compose/<receiver_id>` | Internal compose with recipient |
| `/dashboard/messages/internal/view/<message_id>` | Internal thread |
| `/dashboard/messages/view/<message_id>` | Portfolio inquiry thread |
| `/dashboard/clients` | Client/CRM list |
| `/dashboard/clients/add` | Add client |
| `/dashboard/clients/edit/<int:client_id>` | Edit client |
| `/dashboard/clients/view/<int:client_id>` | View client |
| `/dashboard/change-password` | Password change |
| `/dashboard/settings` | Shared settings page |
| `/cv-preview` | CV preview; shared with public interface |

### 5.3 Behaviours observed

| Workflow | Observed result | Label |
| --- | --- | --- |
| Member login | Dashboard reached; role-specific navigation shown | `VERIFIED FACT` |
| Invalid login | “Invalid credentials. Please try again.” | `VERIFIED FACT` |
| Profile/skills edit | JSON store changed; public profile reflected edits | `VERIFIED FACT` |
| Project create | Project appeared in private list and public profile | `VERIFIED FACT` |
| Theme selection | `silver-grey` persisted in JSON and appeared in settings | `VERIFIED FACT` |
| Internal message compose/reply/admin reply | Thread created and replies persisted in SQL | `VERIFIED FACT` |
| Non-participant thread access | “Access denied.” | `VERIFIED FACT` |
| Archive thread | Flash said deleted; root remained and one reply was orphaned | `VERIFIED FACT` |
| Demo-mode project write | Allowed; warning shown that full access requires more setup | `VERIFIED FACT` |
| Logout | Session cleared; protected dashboard returned login page | `VERIFIED FACT` |

`INFERENCE:` The workspace has usable content-editing and messaging primitives, but its archive semantics, demo-mode entitlements, and CRM language are not aligned with a professional Academy environment without product-level decisions.

---

## 6. Interface 4 — Public Professional Wallet

### 6.1 Purpose observed

`DOCUMENTED INTENT:` The public wallet presents a member’s professional identity, case studies, skills, contact route, credential link, and inquiry form.

`VERIFIED FACT:` Public profiles render identity, professional path, competencies, case studies, and an inquiry CTA. Direct profile and project links work for synthetic users.

### 6.2 Discovered HTML page routes — 3

| Route | Observed role |
| --- | --- |
| `/portfolio/<username>` | Public professional profile/wallet |
| `/portfolio/<username>/project/<int:project_id>` | Public case-study detail |
| `/cv-preview` | Shared CV preview page |

`VERIFIED FACT:` `/contact` is a POST-only inquiry action; `/download-cv` is a file utility.

### 6.3 Public states observed

| State | Result | Label |
| --- | --- | --- |
| `alice_member`, `bob_member`, `carol_demo` profiles | HTTP 200 with synthetic content | `VERIFIED FACT` |
| `/portfolio/admin` | HTTP 200 but renders landing-style content | `VERIFIED FACT` |
| `/portfolio/nonexistent_user` | HTTP 404 | `VERIFIED FACT` |
| Project detail direct link | HTTP 200 with case-study content; page JS error also observed | `VERIFIED FACT` |
| SEO metadata | `description`, `robots`, `ogTitle`, `ogUrl`, `canonical` all null; `htmlLang="en"`, `dir=""` | `VERIFIED FACT` |
| Mobile wallet | Horizontal overflow: `scrollW=446`, `clientW=390` | `VERIFIED FACT` |

`INFERENCE:` The public wallet is a profile/case-study surface, not a financial wallet and not yet a QR-backed professional identity surface.

---

## 7. Failed or unverified cases carried through the package

| # | Case | Status | Label |
| ---: | --- | --- | --- |
| 1 | `/register` returns HTTP 500 | Failed runtime path | `VERIFIED FACT` |
| 2 | `/documentation` returns HTTP 404 | Broken target | `VERIFIED FACT` |
| 3 | `/contact/academy` direct GET returns HTTP 405 | Expected POST-only, unusable as direct page | `VERIFIED FACT` |
| 4 | `/dashboard/telegram` direct GET returns HTTP 405 | POST-only; no direct page | `VERIFIED FACT` |
| 5 | `/dashboard/smtp` direct GET returns HTTP 405 | POST-only; no direct page | `VERIFIED FACT` |
| 6 | Project detail page throws `TypeError: Cannot read properties of null (reading 'addEventListener')` at `static/js/script.js:25:17` | Runtime page error | `VERIFIED FACT` |
| 7 | Mobile public wallet has horizontal overflow (`446 > 390`) | Responsive defect | `VERIFIED FACT` |
| 8 | Mobile landing has slight overflow (`402 > 390`) in confirmed capture | Responsive defect | `VERIFIED FACT` |
| 9 | Archive action hard-deletes thread and orphans reply despite “deleted successfully” wording | Semantic defect | `VERIFIED FACT` |
| 10 | Unauthenticated `/dashboard/notifications/latest` returns HTTP 200 `[]` | Access semantics concern | `VERIFIED FACT` |
| 11 | Public wallet SEO metadata null and no Arabic/RTL declaration | Product-readiness gap | `VERIFIED FACT` |
| 12 | No admin announcement/course/lesson/academy-content/broadcast controls found | Academy capability gap | `VERIFIED FACT` |
| 13 | Telegram/SMTP provider acceptance and recipient receipt | Not proven; outbound blocked | `UNKNOWN` |
| 14 | Owner-reported real operational delivery | Not independently verified | `OWNER-PROVIDED CONTEXT` |

---

## 8. Route inventory appendix

`get` means GET-capable; `post` means POST-only. `PA` = public Academy, `PW` = public wallet, `AD` = admin, `MW` = member workspace, `UTIL` = utility/action endpoint.

| Line | Route | Methods | Primary interface |
| ---: | --- | --- | --- |
| 474 | `/portfolio/<username>` | get | PW |
| 725 | `/register` | get,post | AD |
| 737 | `/dashboard/users` | get | AD |
| 748 | `/dashboard/user/<int:user_id>` | get | AD |
| 779 | `/dashboard/access-instructions` | get | AD |
| 788 | `/dashboard/users/toggle-verification/<user_id>` | post | AD |
| 853 | `/dashboard/user/<int:user_id>/toggle-demo` | post | AD |
| 881 | `/dashboard/user/<int:user_id>/delete` | post | AD |
| 1118 | `/dashboard/notifications/latest` | get | UTIL |
| 1250 | `/dashboard/chat` | get,post | AD |
| 1250 | `/dashboard/chat/<user_id>` | get,post | AD |
| 1272 | `/dashboard/messages/reply/<message_id>` | post | MW |
| 1368 | `/contact/academy` | post | PA |
| 1462 | `/` | get | PA |
| 1495 | `/landing` | get | PA |
| 1501 | `/verification` | get | PA |
| 1507 | `/privacy` | get | PA |
| 1513 | `/terms` | get | PA |
| 1519 | `/about` | get | PA |
| 1525 | `/mastery` | get | PA |
| 1531 | `/standards` | get | PA |
| 1537 | `/security-audit` | get | PA |
| 1543 | `/catalog` | get | PA |
| 1657 | `/contact` | post | PW |
| 1784 | `/portfolio/<username>/project/<int:project_id>` | get | PW |
| 1804 | `/sitemap.xml` | get | UTIL |
| 1851 | `/robots.txt` | get | UTIL |
| 1875 | `/favicon.ico` | get | UTIL |
| 1883 | `/dashboard/backups` | get | AD |
| 1890 | `/backup/create` | post | AD |
| 1913 | `/backup/restore/<filename>` | post | AD |
| 1942 | `/backup/download/<filename>` | get | UTIL |
| 1964 | `/backup/delete/<filename>` | post | AD |
| 1991 | `/api/backups` | get | UTIL |
| 2003 | `/dashboard/login` | get,post | AD |
| 2059 | `/dashboard/users/add` | post | AD |
| 2161 | `/dashboard/logout` | get | UTIL |
| 2170 | `/dashboard` | get | AD/MW |
| 2215 | `/guides/telegram-bot-token` | get | PA |
| 2221 | `/guides/telegram-chat-id` | get | PA |
| 2227 | `/documentation` | get | PA |
| 2241 | `/dashboard/settings` | get,post | AD/MW |
| 2334 | `/dashboard/telegram` | post | AD |
| 2403 | `/dashboard/smtp` | post | AD |
| 2442 | `/dashboard/email-test` | post | AD |
| 2487 | `/dashboard/telegram-test` | post | AD |
| 2524 | `/dashboard/general` | get,post | MW |
| 2552 | `/dashboard/about` | get,post | MW |
| 2569 | `/dashboard/skills` | get,post | MW |
| 2605 | `/dashboard/projects` | get | MW |
| 2615 | `/dashboard/projects/add` | get,post | MW |
| 2667 | `/dashboard/projects/edit/<int:project_id>` | get,post | MW |
| 2714 | `/dashboard/projects/delete/<int:project_id>` | post | MW |
| 2729 | `/dashboard/contact` | get,post | MW |
| 2752 | `/dashboard/social` | get,post | MW |
| 2780 | `/dashboard/messages` | get | MW |
| 2862 | `/dashboard/messages/internal` | get | MW |
| 2913 | `/dashboard/messages/internal/compose` | get | MW |
| 2913 | `/dashboard/messages/internal/compose/<receiver_id>` | get | MW |
| 2925 | `/dashboard/messages/internal/send` | post | MW |
| 2998 | `/dashboard/messages/internal/view/<message_id>` | get | MW |
| 3041 | `/dashboard/messages/view/<message_id>` | get | MW |
| 3124 | `/dashboard/messages/delete/<message_id>` | get | UTIL |
| 3169 | `/dashboard/messages/convert/<message_id>` | get | UTIL |
| 3238 | `/dashboard/clients` | get | MW |
| 3259 | `/dashboard/clients/add` | get,post | MW |
| 3355 | `/dashboard/clients/edit/<int:client_id>` | get,post | MW |
| 3411 | `/dashboard/clients/view/<int:client_id>` | get | MW |
| 3428 | `/dashboard/clients/delete/<int:client_id>` | get | UTIL |
| 3443 | `/dashboard/change-password` | get,post | MW |
| 3510 | `/cv-preview` | get | MW/PW |
| 3519 | `/download-cv` | get | UTIL |

**Status:** Inventory complete for the four-interface reassessment. No implementation performed.
