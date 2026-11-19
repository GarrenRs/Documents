# 03 — End-to-end user and admin workflows

**Assessment date:** 2026-11-20.
**Mode:** Read-only product reassessment. No source, template, CSS, JS, database, schema, data, dependency, authentication, configuration, billing, deployment, or external-send change was made.
**Runtime used for observation:** isolated Flask production-mode copy bound to `127.0.0.1:5002`, synthetic accounts only, outbound HTTP/SMTP blocked, notification helpers no-oped, APScheduler disabled.
**Evidence:** `evidence/results/live_results.json`, `live_digest.md`, `live_summary.md`, `screenshot_ocr.md`.

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

---

## 1. Coverage accounting

| Measure | Exact count | Evidence |
| --- | ---: | --- |
| CDP cases executed | 35 | `live_summary.md`: 35 completed, 0 failed. |
| Grouped workflows/probes completed | 23 | Mapping in §2. |
| Cases with a screenshot | 30 | Screenshot count in `live_summary.md`. |
| Cases with a page error | 6 | `PUB-04`, `AUTH-05`, `RA-03`, `RA-04`, `RA-07`, `RA-08` (`RA-04` has two 405 page errors; 7 page errors total across these cases). |
| Cases with console errors | 0 | All live rows report `[]`. |
| Failed harness cases | 0 | 0 of 35. |
| Distinct failed/unverified findings carried forward | 14 | Listed in `01` §7 and repeated in the final report. |

`VERIFIED FACT:` A “completed workflow” means the objective was executed and recorded. It does **not** mean the outcome was successful. Negative outcomes such as `/register` HTTP 500 and the archive defect are completed probes with failed product behaviour.

---

## 2. Mapping of 35 cases into 23 workflow groups

| # | Workflow / probe group | Case IDs | Completed | Outcome class |
| ---: | --- | --- | --- | --- |
| 1 | Public landing, profile, catalog, and information-page inventory | `PUB-01`, `PUB-02`, `PUB-03`, `RA-01`, `RA-02` | 5 | Working with placeholder catalog |
| 2 | Broken documentation target | `PUB-04` | 1 | Failed |
| 3 | Public inquiry submission and persistence | `PUB-05` | 1 | Working; delivery unproven |
| 4 | Academy contact entry-point probe | `RA-03` | 1 | Form found; delivery unproven |
| 5 | Login page and invalid-login handling | `AUTH-01`, `AUTH-02` | 2 | Working |
| 6 | Member login and role-specific dashboard | `AUTH-03` | 1 | Working |
| 7 | Admin login and role-specific dashboard | `AUTH-04` | 1 | Working |
| 8 | Registration attempt | `AUTH-05` | 1 | Failed |
| 9 | Member-to-admin internal thread creation | `COM-01` | 1 | Working |
| 10 | Member reply in own thread | `COM-02` | 1 | Working |
| 11 | Admin reply to member thread | `COM-03` | 1 | Working |
| 12 | Non-participant thread access | `COM-04` | 1 | Access denied |
| 13 | Archive-link hard-delete behaviour | `COM-05` | 1 | Defective |
| 14 | Notification polling and badge update | `NOT-01` | 1 | Poll observed; delivery unproven |
| 15 | Member identity/about/skills editing | `PF-01` | 1 | Working |
| 16 | Project create/list lifecycle | `PF-02` | 1 | Working |
| 17 | Public profile reflection of private edits | `PF-03` | 1 | Working |
| 18 | Theme selection and persistence | `PF-04` | 1 | Working |
| 19 | Admin user management view | `ADM-01` | 1 | Working |
| 20 | Demo-mode project creation | `ADM-02` | 1 | Write allowed |
| 21 | Logout and session clearing | `AUTH-06` | 1 | Working |
| 22 | Admin operational screens and control search | `RA-04`, `RA-05`, `RA-06` | 3 | Partial; Academy controls absent |
| 23 | Cross-cutting wallet/mobile/notification/SEO probes | `RA-07`, `RA-08`, `RA-09`, `RA-10`, `RA-11`, `RA-12` | 6 | Mixed working/defective/unverified |

`VERIFIED FACT:` The mapping covers all 35 case IDs exactly once across 23 groups.

---

## 3. Public Academy and wallet journeys

### 3.1 Visitor discovery journey

**Objective:** discover Codexx, read its positioning and standards, and open a public professional profile.

| Step | Case | Observed result | Label |
| --- | --- | --- | --- |
| Open landing | `PUB-01`, `RA-01` | HTTP 200; headline `Where Real Work Is Shown, Not Sold`; explicit “not marketplace / not bidding / not social network” copy. | `VERIFIED FACT` |
| Open information pages | `RA-02` | `/about`, `/verification`, `/standards`, `/mastery`, `/privacy`, `/terms`, `/security-audit` all HTTP 200 with expected headings. | `VERIFIED FACT` |
| Open a public profile | `PUB-02` | HTTP 200 for `alice_member`; headings `Professional Path`, `Core Competencies`, `Case Studies & Evidence`, `Initiate Cooperation`. | `VERIFIED FACT` |
| Open catalog | `PUB-03` | HTTP 200 but `Our directory is currently being prepared. Check back soon!` | `VERIFIED FACT` |
| Open documentation | `PUB-04` | HTTP 404; page error recorded. | `VERIFIED FACT` |

`INFERENCE:` The public discovery journey communicates Academy positioning but does not yet provide a populated directory or working documentation target.

### 3.2 Public inquiry journey

**Objective:** submit a structured inquiry to a public professional profile.

`VERIFIED FACT:` `PUB-05` filled name, email, request type `service`, interest area `development`, message, and submitted the form. The flash was `Your message has been delivered.`

`VERIFIED FACT:` Persistence changed from 0 to 1 SQL `messages` row with `category='portfolio'`, `sender_role='visitor'`, `receiver_id='1'`, `parent_id=null`, and `created_at=2026-11-19 23:34:39.056876`. JSON snapshot did not change for this case.

`VERIFIED FACT:` Source calls `send_user_notification(...)` at `app.py:1074` and `send_admin_notification(...)` at `app.py:1085` for the portfolio-message path.

`UNKNOWN:` Provider acceptance and recipient receipt. Outbound was blocked and notification helpers were no-oped.

`INFERENCE:` The wording “has been delivered” is a UI success flash, not a delivery receipt.

### 3.3 Academy contact journey

**Objective:** locate and test the Academy contact form.

`VERIFIED FACT:` Direct GET of `/contact/academy` returned HTTP 405. The landing page contains `<form action="/contact/academy" method="POST" ...>` with name, email, and message fields. `RA-03` did **not** execute a successful POST in the fresh runtime; it found the form and recorded the 405 on direct access.

`VERIFIED FACT:` Source `contact_academy()` at `app.py:1367-1425` commits a `Message` row with `category='platform'`, calls `send_admin_notification("Academy Inquiry", ...)`, calls `send_email(...)` to the admin address, and flashes `Success! Your message has been delivered to the Academy team.`

`UNKNOWN:` Whether a production POST commits and whether any Telegram/SMTP message is accepted or received. No real external send was attempted.

### 3.4 Public wallet states

`VERIFIED FACT:` `RA-07` reached `/portfolio/alice_member`, `/portfolio/bob_member`, and `/portfolio/carol_demo` with HTTP 200, `/portfolio/admin` with HTTP 200 but landing-style content, and `/portfolio/nonexistent_user` with HTTP 404.

`VERIFIED FACT:` `RA-08` opened `/portfolio/alice_member/project/1` with HTTP 200 and visible case-study content, while a page error occurred: `TypeError: Cannot read properties of null (reading 'addEventListener')` at `static/js/script.js:25:17`.

`VERIFIED FACT:` `RA-09` found mobile horizontal overflow on the public wallet (`scrollW=446`, `clientW=390`). Confirm capture `CONF_15` reproduced it.

`UNKNOWN:` Whether the project-detail JS error blocks any specific interaction; content rendered, but interaction was not exhaustively tested.

---

## 4. Member workspace journey

### 4.1 Authentication and dashboard

`VERIFIED FACT:` `AUTH-02` produced `Invalid credentials. Please try again.`

`VERIFIED FACT:` `AUTH-03` logged in as `alice_member`; the dashboard showed member navigation (`Identity`, `Proposition`, `Competencies`, `Gallery`, `Contact Info`, `CRM`, `Inbox`, `Internal messages`, `Channels`) and member metrics (`2` active projects, `2` competencies, `1` inbound request).

`VERIFIED FACT:` The browser title in the member dashboard was `Dashboard - Codexx Admin`. `INFERENCE:` identity-label inconsistency, not proof of an authorization breach.

### 4.2 Profile and project editing

`VERIFIED FACT:` `PF-01` submitted general/about/skills edits. JSON `alice_skills` changed from `["Python", "Research"]` to `["Playwright", "Research"]`.

`VERIFIED FACT:` `PF-02` created `Discovery Project`; JSON `alice_projects` changed from `["Synthetic Project"]` to `["Synthetic Project", "Discovery Project"]`.

`VERIFIED FACT:` `PF-03` confirmed the public profile showed `Alice Discovery`, `Discovery Title`, `Synthetic about updated`, `Playwright 91%`, `Research 70%`, and `Proof: 2 Case Studies`.

`VERIFIED FACT:` `PF-04` selected `silver-grey`; JSON `alice_theme` changed from `luxury-gold` to `silver-grey`.

`INFERENCE:` The private-to-public editing loop is the strongest verified end-to-end capability in the current product. It is `VERIFIED FACT` that this loop uses JSON as the observed store; it is `UNKNOWN` whether a production deployment uses the same state.

### 4.3 Internal communication

`VERIFIED FACT:` `COM-01` created an internal root message with `receiver_id='admin'`; SQL messages increased from 1 to 2.

`VERIFIED FACT:` `COM-02` added a member reply with `parent_id` equal to the root thread ID; SQL messages increased to 3.

`VERIFIED FACT:` `COM-03` added an admin reply with `sender_role='admin'`, `sender_id='None'`, `receiver_id='1'`; SQL messages increased to 4. The member reply was marked read during the admin view.

`VERIFIED FACT:` `COM-04` logged in as `bob_member` and opened the Alice/admin thread; the page body showed `Access denied.`

`VERIFIED FACT:` `COM-05` clicked `Archive Thread`; the flash said `Message deleted successfully`, but evidence recorded `thread still present: true` and `orphaned replies: 1`.

`INFERENCE:` The observed archive control is mislabeled and history-destructive/orphaning, not a compliant archive operation.

### 4.4 Demo mode and session termination

`VERIFIED FACT:` `ADM-02` logged in as `carol_demo`, saw `Training Phase Active`, submitted a project, and received `Project added successfully`. JSON `carol_projects` changed from `["Synthetic Project"]` to `["Synthetic Project", "Demo Allowed Project"]`.

`VERIFIED FACT:` `AUTH-06` logged out; opening `/dashboard` returned the login view with `Please login to access this page.`

---

## 5. Administration journey

`VERIFIED FACT:` `AUTH-04` logged in as `siteadmin`; admin navigation showed `User Directory`, `Channels`, `Inbox`, `Internal messages`, `Global Settings`, `Access Standards`, `Live Site`, `Manage Users`, `System Security`, `Platform View`, and `Terminate Session`.

`VERIFIED FACT:` `ADM-01` opened `/dashboard/users` and saw the three synthetic accounts with `VERIFIED` or `DEMO_MODE` state.

`VERIFIED FACT:` `RA-04` opened `/dashboard/settings` HTTP 200, `/dashboard/telegram` HTTP 405, `/dashboard/smtp` HTTP 405, `/dashboard/backups` HTTP 200, and `/dashboard/access-instructions` HTTP 200.

`VERIFIED FACT:` `RA-05` searched the admin UI for `announcement`, `announce`, `course`, `lesson`, `academy content`, and `broadcast`; every term returned `found: false`.

`INFERENCE:` Administration is currently an operator console for users, settings, backups, messages, and standards. It is not an Academy content-operations console.

`VERIFIED FACT:` `AUTH-05` opened `/register` and received HTTP 500 with the generic error page.

---

## 6. Notification, SEO, and mobile probes

| Probe | Observed result | Label |
| --- | --- | --- |
| `NOT-01` | Dashboard notification badge showed `2` after polling. | `VERIFIED FACT` |
| `RA-10` | Unauthenticated `/dashboard/notifications/latest` returned HTTP 200 `[]`. | `VERIFIED FACT` |
| `RA-11` | Email and Telegram test endpoints returned HTTP 200 while outbound was blocked and helpers were no-oped; no external send occurred. | `VERIFIED FACT` |
| `RA-12` | `/sitemap.xml` and `/robots.txt` returned HTTP 200; sitemap used the isolated origin `http://127.0.0.1:5002/`. | `VERIFIED FACT` |
| `RA-09` | Mobile wallet overflow `446 > 390`. | `VERIFIED FACT` |
| `CONF_14` | Confirmed mobile landing overflow `402 > 390`. | `VERIFIED FACT` |

---

## 7. Journey-level verdicts

| Journey | Completed | Verdict | Alignment with owner vision |
| --- | --- | --- | --- |
| Visitor discovery → profile → inquiry | Yes | Core loop works; catalog/documentation/SEO/mobile need repair. | Partially aligned: proof and direct inquiry are useful; ANAE/Arabic/QR/enablement are absent. |
| Academy contact entry | Partially | Form exists; direct GET is 405; submission/delivery unproven. | Weak alignment: Academy intent exists without operational evidence. |
| Member login → edit → public reflection | Yes | Strongest verified loop. | Aligned with private workspace/public presentation, but not ANAE-specific. |
| Member ↔ admin internal thread | Yes | Core persistence works; archive and policy guarantees fail. | Needs product decision; must not be carried forward as-is. |
| Admin governance | Yes | User/settings/backup/message surfaces work. | Partial; no Academy content or ANAE review surface found. |
| Registration | Attempted | Fails with HTTP 500. | Blocks any future ANAE onboarding until resolved or replaced. |
| Notifications | Probes completed | In-app poll observed; external delivery unproven. | Weak; a connected professional environment needs delivery records and explicit states. |
| Mobile public wallet | Probed | Horizontal overflow confirmed. | Blocks credible sharing/QR-card journey. |

---

## 8. Workflows explicitly not evidenced

`VERIFIED FACT / UNKNOWN:` The following workflows were searched for or assessed and found absent, broken, or unverified:

1. ANAE registration/status verification.
2. Official activity-code selection against the ANAE catalogue.
3. QR identity-card generation, display, or scanning.
4. Academy course/lesson/enrollment/progress/certificate flow.
5. Admin announcement or broadcast creation.
6. Arabic/RTL content and interface flow.
7. External-platform connection beyond source-level Telegram/SMTP code.
8. Provider-accepted or recipient-received external notification.
9. Controlled registration and onboarding.
10. Meaningful archive/restore of communication history.

`STRATEGIC PROPOSAL:` Owner approval is required before any of these become product scope. This reassessment stops at documentation.

**Status:** Workflow synthesis complete for the 35 executed cases and 23 grouped workflows. No implementation performed; no external send occurred; no push requested.
