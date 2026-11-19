# 04 — Notifications and integration verification

**Assessment date:** 2026-11-20.
**Mode:** Read-only lifecycle trace. No notification credential, provider setting, external message, application source, template, database, schema, or configuration was changed.
**Runtime safety:** isolated Flask production-mode copy bound to `127.0.0.1:5002`; outbound HTTP and SMTP blocked; Telegram/SMTP notification helpers no-oped; APScheduler disabled; notification environment variables removed; synthetic accounts only.
**Evidence:** `app.py`, `templates/dashboard/base.html`, `evidence/results/live_digest.md`, `live_results.json`, `recapture_results.json`, `confirm_results.json`.

---

## Evidence conventions

| Label | Meaning |
| --- | --- |
| `VERIFIED FACT` | Directly observed in source, templates, data, or controlled runtime/browser evidence. |
| `OWNER-PROVIDED CONTEXT` | Supplied by the product owner or a provider’s own marketing; not proof of authorisation or delivery. |
| `DOCUMENTED INTENT` | Explicitly stated in code comments, product copy, or official guidance. |
| `INFERENCE` | Reasoned interpretation supported by evidence. |
| `STRATEGIC PROPOSAL` | Possible future direction only; not an existing capability. |
| `UNKNOWN` | Insufficient evidence. |

---

## 1. Delivery-state distinction

This document deliberately separates four different claims:

| State | What it means | Evidence required |
| --- | --- | --- |
| Code exists | A helper/route references a provider or notification path. | Source inspection. |
| Delivery attempted | The application reaches a call site that would send. | Source call site plus controlled runtime trace. |
| Provider accepted | Telegram/SMTP or another provider returned success. | Provider response or equivalent provider-side record. |
| Recipient received | A human or mailbox actually received the message. | Recipient confirmation or mailbox evidence. |

`VERIFIED FACT:` This reassessment established **code exists** and, for selected test endpoints, **delivery attempted under a blocked/no-op harness**. It did **not** establish provider acceptance or recipient receipt.

`OWNER-PROVIDED CONTEXT:` The owner reports operational Telegram/email use in the real deployment. This is not independently verified here.

`UNKNOWN:` Provider acceptance and recipient receipt for any real notification.

---

## 2. Integration inventory

| Integration / channel | Source evidence | Current-state finding | Label |
| --- | --- | --- | --- |
| In-app notification bell | `templates/dashboard/base.html:233-309`; `/dashboard/notifications/latest` | Live badge/poll observed; not real-time push. | `VERIFIED FACT` |
| Telegram admin | `app.py:205-262`, `send_admin_notification()` | Env-based config; detached `requests.post`; response discarded. | `VERIFIED FACT` |
| Telegram user | `app.py:264-293`, `get_telegram_credentials()`, async wrappers at `994-1009` | Per-user JSON config; detached `requests.post`; response discarded. | `VERIFIED FACT` |
| SMTP admin/user | `app.py:241-262`, `264-293`, `371-402` | Multiple paths; response swallowed; no delivery record. | `VERIFIED FACT` |
| Academy contact notifications | `app.py:1367-1425` | Calls Telegram admin helper and `send_email`; no proof of delivery. | `VERIFIED FACT` |
| Portfolio inquiry notifications | `app.py:1657-1780` | Dual write; calls user/admin notification helpers. | `VERIFIED FACT` |
| Login-event Telegram | `app.py:2019-2022`, `2043-2046` | Async event notification on successful login. | `VERIFIED FACT` |
| Backup-event Telegram | `app.py:1898`, `1930` | Async event notifications for backup restore events. | `VERIFIED FACT` |
| User-management notifications | `app.py:818`, `828`, `866` | User notification calls in admin user paths. | `VERIFIED FACT` |
| Settings/test endpoints | `app.py:2331-2518` | Telegram/SMTP configuration and test POST endpoints; live sends possible in an unblocked deployment. | `VERIFIED FACT` |
| External CDNs | Templates/static references | Fonts/JS assets may load externally; not exercised as a product integration. | `VERIFIED FACT` for presence; `UNKNOWN` for production behaviour. |
| ANAE / QR identity | Full source and UI search | No ANAE status API, QR identity card, or scanning flow found. | `VERIFIED FACT` |
| Academy content platforms | Admin UI search `RA-05` | No announcement/course/lesson/broadcast/academy-content controls found. | `VERIFIED FACT` |
| Payment / FX / financial wallet | Source and route inventory | No financial wallet, ledger, payout, invoice, or FX integration found. | `VERIFIED FACT` |

---

## 3. In-app notification lifecycle

### 3.1 Code path

`VERIFIED FACT:` `app.py:1090-1154` computes unread counts and a latest-notification list from SQL `Message` rows.

`VERIFIED FACT:` `templates/dashboard/base.html:236-309` fetches `/dashboard/notifications/latest`, updates the badge, builds dropdown links, animates the bell when the count increases, and falls back to `No new messages`.

`VERIFIED FACT:` `base.html:306-309` polls every 30,000 ms and calls once on load. The code comment says `Real-time Notification System`, but the mechanism is polling.

`VERIFIED FACT:` No queue, outbox, retry, deduplication, delivery record, or delivery-status field was found for in-app notifications.

### 3.2 Runtime evidence

| Evidence | Result | Label |
| --- | --- | --- |
| `NOT-01` | Dashboard badge showed `2` after poll. | `VERIFIED FACT` |
| `RA-10` | Unauthenticated GET `/dashboard/notifications/latest` returned HTTP 200 `[]`. | `VERIFIED FACT` |
| Source | Poll endpoint silently returns `[]` on exception. | `VERIFIED FACT` |

`INFERENCE:` The in-app channel is an unread-message view, not a guaranteed event-delivery system. The unauthenticated 200 response is an access-semantics concern even though the isolated response was empty.

`UNKNOWN:` Whether a production unauthenticated request can enumerate or infer message data under other states.

---

## 4. Telegram lifecycle

### 4.1 Configuration sources

`VERIFIED FACT:` Admin Telegram credentials come only from `ADMIN_TELEGRAM_BOT_TOKEN` and `ADMIN_TELEGRAM_CHAT_ID` (`app.py:205-219`, `296-301`).

`VERIFIED FACT:` User Telegram credentials are read from per-user JSON via `get_telegram_credentials(username=...)` and are saved through `/dashboard/telegram` (`app.py:2331-2397`).

`VERIFIED FACT:` The settings page obfuscates the displayed token but source stores the submitted token in JSON. This assessment did not enter or expose any real credential.

### 4.2 Send paths and observed states

`VERIFIED FACT:` Send paths include:
- `send_admin_notification()` at `app.py:225-238`, using `requests.post(..., timeout=10)` in a daemon-like thread;
- `send_user_notification()` at `app.py:266-280`, using `requests.post(..., timeout=10)` in a thread;
- `send_telegram_event_notification()` at `app.py:951-991`, using `requests.post(..., timeout=5)` and returning a boolean;
- async wrappers at `app.py:994-1009`;
- settings test calls at `app.py:2346-2364` and `2497-2515`.

`VERIFIED FACT:` Most call sites discard the provider response. There is no persisted delivery record, retry, deduplication key, or audit trail.

`VERIFIED FACT:` `RA-11` invoked notification test endpoints under the isolated harness. Both email and Telegram POST endpoints returned HTTP 200, but outbound was blocked and helpers were no-oped.

`VERIFIED FACT:` No external Telegram message was sent by this reassessment.

`OWNER-PROVIDED CONTEXT:` Telegram is reported to work operationally in the real deployment.

`UNKNOWN:` Whether any real Telegram message was accepted by Telegram or received by a chat participant.

---

## 5. SMTP lifecycle

### 5.1 Configuration and paths

`VERIFIED FACT:` Admin SMTP configuration comes from `ADMIN_SMTP_HOST`, `ADMIN_SMTP_PORT`, `ADMIN_SMTP_EMAIL`, `ADMIN_SMTP_PASSWORD`, and optional `ADMIN_RECIPIENT_EMAIL` (`app.py:213-218`, `247`).

`VERIFIED FACT:` User SMTP configuration is saved in per-user JSON through `/dashboard/smtp` (`app.py:2400-2436`).

`VERIFIED FACT:` SMTP paths include `send_admin_notification()` (`app.py:240-262`), `send_user_notification()` / `send_email()` (`app.py:282-293`, `371-402`), Academy contact inline email (`app.py:1411-1416`), a confirmation helper (`app.py:1585-1653`), and test endpoints (`app.py:2439-2481`).

`VERIFIED FACT:` Failure handling is inconsistent: one inner SMTP send uses a bare `except: pass`; several paths log only; return values are often discarded.

`VERIFIED FACT:` No queued retry, deduplication, delivery receipt, bounce handling, or delivery-status record was found.

### 5.2 Runtime evidence

`VERIFIED FACT:` `RA-11` email test endpoint returned HTTP 200 under blocked/no-op conditions. No SMTP connection or external email occurred.

`VERIFIED FACT:` Direct GET of `/dashboard/smtp` returned HTTP 405 in `RA-04`; it is a POST-only action endpoint, not a standalone page.

`OWNER-PROVIDED CONTEXT:` Email is reported to work operationally in the real deployment.

`UNKNOWN:` Provider acceptance, mailbox delivery, spam placement, and recipient receipt.

---

## 6. Notification triggers by business event

| Business event | Persistence | In-app effect | Telegram/SMTP source path | Delivery proven here? |
| --- | --- | --- | --- | --- |
| Public portfolio inquiry | SQL `Message` row; JSON legacy copy in source path | Badge/poll can show unread count | `send_user_notification()` + `send_admin_notification()` | `UNKNOWN` |
| Academy inquiry | SQL `Message` row | Platform category may appear in admin/poll | `send_admin_notification()` + `send_email()` | `UNKNOWN` |
| Internal member → admin thread | SQL `Message` row | Badge/poll can show unread count | No notification helper call found in internal send path | No |
| Internal reply | SQL `Message` row | Badge/poll can show unread count | No notification helper call found in reply path | No |
| Successful login | No product message row | None | Async Telegram event notification | `UNKNOWN` |
| Backup restore event | Backup metadata/action | None | Async Telegram event notification | `UNKNOWN` |
| User provisioning/deletion | JSON/best-effort SQL | None directly | User notification calls in source | `UNKNOWN` |
| Settings test action | No message row | Flash/JSON response | Direct provider call in production | No; harness blocked/no-oped |

`INFERENCE:` Persistence and notification are coupled only by call sites; there is no durable outbox that would let the application prove that a business event produced a delivered message.

---

## 7. Connected-platform boundaries in the owner vision

`OWNER-PROVIDED CONTEXT:` The intended product should connect to external platforms as part of a professional digital work environment.

`VERIFIED FACT:` Current source-level external connections are Telegram, SMTP, CDN assets, and PDF-generation dependencies. No platform-specific connector framework, webhook registry, OAuth flow, provider-agnostic adapter, credential vault, or connection-status audit was found.

`VERIFIED FACT:` No ANAE directory connector is implemented. The official ANAE directory returned HTTP 503 during research on 2026-11-20; that research finding is separate from product implementation.

`UNKNOWN:` Which external platforms the owner intends, what credentials they require, and whether their use is compatible with Algerian regulatory constraints.

`STRATEGIC PROPOSAL:` Any future connector should be provider-agnostic, use secrets outside application data, record connection and delivery states, and never be assumed compliant merely because a provider markets it.

---

## 8. RedotPay / Grey and regulatory boundary

`VERIFIED FACT:` No official Algerian approval, agrément, or PSP-list evidence was located for RedotPay or Grey during the official-source research on 2026-11-20.

`OWNER-PROVIDED CONTEXT / UNVERIFIED PROVIDER MARKETING:` Grey publicly markets multi-currency accounts and virtual cards. This is not evidence of Algerian authorisation, bank partnership, or compliance.

`UNKNOWN:` Product-specific legal application of Loi 25-10 Art. 6 bis to any crypto-linked provider or backend.

`STRATEGIC PROPOSAL:` Do not represent RedotPay or Grey as licensed in Algeria, bank-approved, partnered with an Algerian bank, or as satisfying export-proceeds repatriation. See `06_FOREIGN_CURRENCY_AND_REGULATORY_FACT_CHECK.md`.

---

## 9. Verification conclusion

| Claim | Status | Evidence label |
| --- | --- | --- |
| Notification code exists for Telegram and SMTP | Established | `VERIFIED FACT` |
| In-app poll updates a badge | Established | `VERIFIED FACT` |
| Some business events call notification helpers | Established | `VERIFIED FACT` |
| Test endpoints can attempt provider calls | Established in source; executed only under blocked/no-op harness | `VERIFIED FACT` |
| Provider accepted any message in this reassessment | Not established; no external send occurred | `UNKNOWN` |
| Recipient received any message in this reassessment | Not established | `UNKNOWN` |
| Owner reports operational Telegram/email | Reported, not independently verified | `OWNER-PROVIDED CONTEXT` |
| Durable queue/outbox/retry/dedupe/delivery audit exists | Not found | `VERIFIED FACT` |
| External-platform connector framework exists | Not found | `VERIFIED FACT` |

**Status:** Notification and integration lifecycle trace complete. No real external message was sent; no credential was exposed; no setting was changed; no implementation performed.
