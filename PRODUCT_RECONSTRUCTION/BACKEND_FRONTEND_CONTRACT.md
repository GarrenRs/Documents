# Codexx Wallet — Backend/Frontend Contract

This document defines the internal contract for the chosen architecture: a server-rendered Flask modular monolith. It is a decision document only; no implementation is performed.

## 1. Contract premise (DECISION)

There is **no separate frontend deployment** and **no public REST API in v1**.

| Term | Meaning in v1 | Explicitly not in v1 |
|---|---|---|
| “Frontend” | Jinja templates, six theme CSS files, progressive-enhancement JavaScript/HTMX served by the Flask app | SPA build, React bundle, separate static deployment |
| “Backend” | Flask Blueprints/modules, service and policy layer, repository layer, one DB, one worker | Public API product, third-party integration surface |
| Contract | Internal module interfaces plus a small set of session-authenticated, CSRF-protected JSON endpoints for progressive enhancement | Public documented REST API, OAuth/token API |
| Public wallet | Server-rendered presentation of published wallets | Marketplace, directory, social feed |
| Private workspace | Server-rendered form/table CRUD for the wallet owner | Collaborative realtime editor |

The only non-session JSON ingress is the billing webhook, which is authenticated by provider signature and is part of the billing boundary module, not a public API.

## 2. EVIDENCE — why an explicit contract is needed

| Observed fact | Source |
|---|---|
| 72 routes live in one 3,570-line `app.py`; no Blueprints, factory, services, repositories, or tests. | `[AUDIT/02 §3]`, `app.py:1-3570` |
| No CSRF protection and several GET mutations exist. | `[AUDIT/07 §2]`, `app.py:625-648` |
| Inquiry writes are dual-written to `data.json` and SQL without a transaction. | `[AUDIT/04 §1]`, `[DISCOVERY/05 §4.1]` |
| Notification delivery has four Telegram and five SMTP paths, no retry/dedup/audit. | `[AUDIT/05 §2, §3]` |
| Messaging has four conflicting unread definitions and an unauthenticated poll. | `[AUDIT/08 §2]`, `[DISCOVERY/05 §4.2]` |
| Templates are mixed Bootstrap with zero Arabic/RTL and several broken references. | `[AUDIT/02 §6.1]`, `[DISCOVERY/08 §1]` |

## 3. Layer contract (DECISION)

| Layer | Owns | May call | Must not call | Notes |
|---|---|---|---|---|
| Route / Blueprint | Request parsing, session access, CSRF validation, authorization invocation, PRG redirect, template rendering | Service interfaces | Repositories, raw DB, other modules’ tables | No business rules in routes |
| Service / policy | Tenant authorization, entitlement checks, publication rules, orchestration, audit emission | Repositories, adapters, other service interfaces | HTTP response objects, templates, session objects directly | Receives an explicit `Principal` |
| Repository / unit-of-work | SQL, transaction scope, tenant-scoped queries | Database only | Templates, external providers, session state | Requires `wallet_id` for owned rows |
| Domain record | Invariants of a single entity | Nothing | I/O | No framework dependency required |
| Adapter | Media storage, outbox drain, notification provider, backup storage, billing provider | External systems via service permission | Business policy decisions | Secrets supplied from env/vault |
| Template / static | Presentation, accessibility, RTL layout, escaped output | Route-provided view models | DB, secrets, authorization decisions | No raw wallet IDs or private data exposure |

## 4. Internal module boundaries and interfaces (DECISION)

Interface names below are contractual names, not implementation code.

| Module | Interface offered to other modules | Data owned | Key invariants |
|---|---|---|---|
| Auth / account | `principal_for(session)`, `verify_credentials(...)`, `provision_account(...)`, `record_auth_event(...)` | `Account`, `AuthEvent`, session metadata | Werkzeug-compatible hashes; secure cookies; rate limits; no legacy `/register`; no verification inferred from project count |
| Wallet / tenant | `current_wallet(principal)`, `assert_wallet_ownership(principal, wallet_id)`, `create_wallet(account)` | `Wallet`, owner link | One wallet per account in v1; `wallet_id` comes from session; client-supplied wallet IDs are rejected |
| Profile / content | `get_published_profile(slug)`, `get_owned_profile(principal)`, `upsert_project(...)`, `list_skills(...)` | `WalletProfile`, `Project`, `Skill` | Public reads only from published wallets; no per-field ACL; public UX and URL shape preserved |
| Media | `store(...)`, `finalize_upload(...)`, `authorize_media(...)`, `delete_media(...)` | `MediaAsset` metadata and storage keys | Private outside webroot; public prefix only for published wallets; content-type and size validation; randomized names |
| Visibility / publication | `can_view(principal, wallet)`, `publish(...)`, `unpublish(...)`, `apply_entitlement_state(...)` | Publication transitions and `published_at` on `Wallet` | Wallet-level published/unpublished only; expiration forces read-only and unpublished |
| Inquiry | `submit_inquiry(...)`, `list_for_owner(principal)`, `mark_reviewed(...)` | `Inquiry` | Taxonomy preserved; one-way visitor-to-owner; rate-limited; no replies, threads, or member policy |
| Announcements | `create_announcement(admin, wallet, ...)`, `list_for_owner(principal)`, `mark_read(...)` | `Announcement`, `AnnouncementRead` | Append-only; one-way Administration-to-owner; no reply/thread; idempotent read receipt |
| Notifications / outbox | `enqueue(event)`, `drain(worker)`, `mark_delivered(...)`, `mark_failed(...)` | Outbox records and delivery attempts | Single sender, dedupe key, retry with backoff, audit, no secrets in payload |
| Billing / entitlements | `start_checkout(...)`, `handle_webhook(...)`, `entitlements_for(wallet)`, `assert_entitlement(...)` | `Plan`, `Subscription`, `EntitlementGrant`, billing pointer updates on `Wallet` | Checkout redirect plus webhook only; idempotent events; no financial wallet logic |
| Admin | `list_wallets(...)`, `override_publication(...)`, `create_announcement(...)`, `request_backup(...)`, `view_audit(...)` | Admin workflow coordination | Writes go through owning modules; every admin action is audited with target `wallet_id` |
| Audit / backup | `record(...)`, `create_snapshot_request(...)`, `list_snapshots(...)`, `verify_restore(...)` | `AuditLog`, `BackupSnapshot` | Append-only audit; encrypted off-instance backups; restricted access; tested restore |

A one-time importer is a migration tool, not a runtime module. `data.json` is an import source only and is retired after import.

## 5. Server-rendered route contract (DECISION)

Endpoint names use `<module>.<action>`. Existing public URL shape is preserved; new private routes are namespaced. All mutations are POST. Every successful mutation follows POST/Redirect/GET with a 303 redirect to a GET route.

| Route family | Endpoint name pattern | Methods | CSRF | Authorization check per route | Success behavior | Failure behavior |
|---|---|---|---|---|---|---|
| Public presentation | `public.profile`, `public.project_detail` | GET only | Not applicable | `can_view(visitor, wallet)` requires `published=true`; no session required | Render HTML with escaped view model | 404 for unknown or unpublished wallet; no existence leak |
| Public media | `media.public` | GET only | Not applicable | Published wallet plus public `MediaAsset.visibility` | Serve public-prefix media | 404 for unpublished/private/missing asset |
| Private media | `media.private` | GET only | Not applicable | Session plus `assert_wallet_ownership(principal, asset.wallet_id)` | Serve via authorized route | 401/403/404 generic response |
| Inquiry submission | `public.inquiry.create` | POST | Required for anonymous form | Rate limit plus validation; no session required | PRG to neutral confirmation page | 422 re-render with safe errors; 429 with retry guidance |
| Auth | `auth.login`, `auth.logout`, `auth.account.create` | POST | Required | Rate limit on login and account creation | PRG to workspace or login | Generic 401/422; no account enumeration |
| Owner workspace reads | `workspace.dashboard`, `workspace.profile.edit`, `workspace.projects.list`, `workspace.inquiries.list`, `workspace.announcements.list` | GET only | Not applicable | Session plus `current_wallet(principal)` and ownership of wallet | Render SSR HTML | 401 redirect to login; 403/404 generic |
| Owner workspace mutations | `workspace.profile.update`, `workspace.project.create/update/delete`, `workspace.media.upload/delete`, `workspace.inquiry.review` | POST | Required | Session plus `assert_wallet_ownership` for target row | PRG to relevant GET view | 403 for cross-wallet target; 422 validation; no GET mutation |
| Announcement read receipt | `workspace.announcements.mark_read` | POST | Required | Session plus ownership of the `AnnouncementRead` target | PRG when used without JS | 403 generic; idempotent on repeat |
| Billing start / return | `billing.checkout.start`, `billing.checkout.return` | POST for start, GET for return | Required on start; not applicable on return | Session plus wallet ownership on start | 303 redirect to provider; GET renders status only | 403 generic; no mutation on return |
| Billing webhook | `billing.webhook` | POST | Not applicable; provider signature instead | Signature, timestamp tolerance, event id idempotency | 2xx acknowledgement, no HTML | 400 invalid signature; 2xx for duplicate event |
| Admin | `admin.wallets.list`, `admin.announcements.create`, `admin.audit.list`, `admin.backups.create` | GET for lists, POST for mutations | Required on mutations | Admin role plus target `wallet_id` | PRG to audited GET view | 403 generic; audit every attempt where safe |
| Health | `ops.health` | GET only | Not applicable | Internal network or authenticated monitoring | Minimal status text | No application data exposed |

No route may mutate state on GET. A GET to a mutation endpoint returns 405.

## 6. Small JSON endpoint catalogue for progressive enhancement (DECISION)

These endpoints are internal, session-authenticated, CSRF-protected, and not documented as a public API. Billing webhook is the separate machine-authenticated boundary described above.

| Endpoint | Method / path | Auth | CSRF | Request shape | Response shape | Rate limit and notes |
|---|---|---|---|---|---|---|
| Notification / announcement read receipt | `POST /internal/json/notifications/read` | Owner session; verifies the receipt belongs to the session wallet | Required | `announcement_id` UUID; exactly one target; no `wallet_id`, no reply body, no thread field | `ok` boolean; `announcement_id`; `read_at` timestamp or null | 60 per minute per wallet; idempotent; repeat returns existing `read_at`; no reply/thread created |
| Live design preview | `POST /internal/json/design/preview` | Owner session; target wallet resolved from session | Required | `theme_key` from the six allowed themes; `accent_color` validated token; `layout_variant`; no arbitrary HTML or JS | `ok` boolean; escaped `preview_html` or constrained `preview_css`; `warnings` array | 20 per minute per wallet; no persisted DB write; final save uses the normal POST route |
| Upload status | `POST /internal/json/media/status` | Owner session; verifies `asset_id` belongs to session wallet | Required | `asset_id` UUID; no `wallet_id` | `ok` boolean; `asset_id`; `status` one of pending, ready, failed; `public_url` or null; `error_code` or null | 120 per minute per wallet; read-only and idempotent; polling only |

All JSON responses use the error contract in section 10. No JSON endpoint returns another wallet’s data or accepts a client-supplied `wallet_id`.

## 7. Data ownership rules per module (DECISION)

| Entity or field group | Owning module | Other modules may read through interface | Mutation rule |
|---|---|---|---|
| `Account`, `AuthEvent`, session metadata | Auth / account | Admin reads via `view_audit`; services receive `Principal` | Only auth/account writes credentials and session state |
| `Wallet`, owner link | Wallet / tenant | All modules via `current_wallet` | Only wallet/tenant creates wallets; billing may update the plan pointer in the same transaction as a webhook |
| Publication state and `published_at` | Visibility / publication | Public routes via `can_view`; admin via audited override | Only publication service changes published/unpublished state |
| `WalletProfile`, `Project`, `Skill` | Profile / content | Public routes for published wallets; owner routes for owned wallets | Only profile/content writes these rows |
| `MediaAsset` and storage keys | Media | Profile/content for avatar; public/private media routes | Only media module finalizes, deletes, and signs/authorizes delivery |
| `Inquiry` | Inquiry | Owner workspace lists; export via entitlement policy | Only inquiry module writes state/review metadata |
| `Announcement`, `AnnouncementRead` | Announcements | Owner workspace lists; notification outbox references IDs | Only announcements module appends records and records read receipts |
| Outbox and delivery attempts | Notifications / outbox | Services enqueue only | Only worker drains and updates delivery state |
| `Plan`, `Subscription`, `EntitlementGrant` | Billing / entitlements | Policy service via `entitlements_for` | Only billing writes from verified provider events or audited manual grants |
| `AuditLog`, `BackupSnapshot` | Audit / backup | Admin via audited views | Append-only audit; only worker changes backup status |
| `data.json` importer | Migration tool only | Nobody at runtime | One-time import; retired after successful verification |

No module writes another module’s tables. Cross-module operations call the owning interface. All repository queries for owned rows include `wallet_id` derived from the session.

## 8. Public versus private surface contract (DECISION)

| Surface | Audience | Authentication | Data visible | Writes allowed | Caching / indexing |
|---|---|---|---|---|---|
| Public wallet | Visitors and search engines | None | Published wallet profile, projects, skills, public media | Inquiry submission only, with CSRF and rate limit | Cacheable; indexable; no private data |
| Private workspace | Verified wallet owner | Session cookie | All rows owned by the session wallet, including inquiries and announcements | Profile/content, media, inquiry review, announcement read receipts | Noindex; no public cache |
| Admin | Internal administrators | Session plus admin role | Wallet list, audit log, backup snapshots; private content only by audited exception | Publication override, announcements, backup requests | Noindex; fully audited |
| Internal JSON | Browser JS/HTMX within the app | Session cookie | Only session-wallet data | Read receipts, preview tokens, status reads | Noindex; short/no cache |
| Billing boundary | Wallet owner and payment provider | Session for checkout; signature for webhook | Plan/term references and subscription state | Checkout redirect and webhook state application only | Noindex; webhook never cached |
| Backups | Authorized admin/owner workflow | Session plus policy check | Encrypted snapshot metadata and controlled download | Request, list, verify restore | No public access |

Public wallet is presentation. Private workspace is the real value. There is no public catalog/directory in v1 and no admin-initiated member messaging.

## 9. Billing boundary contract (DECISION)

| Flow / event | Direction | Authentication | Inputs | Outputs | State effect | Constraints |
|---|---|---|---|---|---|---|
| Checkout start | Browser → billing boundary | Session, CSRF, wallet ownership | Plan code; term monthly, yearly, or lifetime | 303 redirect to provider | No entitlement before verified webhook | No prices in reconstruction docs; no financial ledger |
| Checkout return | Provider → browser → app | Session for display | Provider reference | SSR status page | No state mutation | Safe to refresh; no duplicate grant |
| `checkout.completed` | Provider → webhook | Provider signature, timestamp tolerance | Event id, subscription ref, wallet ref, plan code, term | 2xx acknowledgement | Create/update `Subscription`; grant entitlements; audit | Idempotent on event id |
| `subscription.renewed` | Provider → webhook | Provider signature | Event id, subscription ref, period dates | 2xx acknowledgement | Extend active state; recompute grants | Idempotent; no manual date trust from browser |
| `subscription.updated` | Provider → webhook | Provider signature | Event id, plan code, term, subscription ref | 2xx acknowledgement | Upgrade/downgrade entitlements in one transaction | Downgrade never deletes wallet data |
| `payment.failed` | Provider → webhook | Provider signature | Event id, subscription ref | 2xx acknowledgement | Move to grace; auto-unpublish; retain data and export | Grace policy, not immediate destructive action |
| `subscription.canceled` | Provider → webhook | Provider signature | Event id, subscription ref | 2xx acknowledgement | Move to canceled/expired per policy | Read-only and unpublished after grace end |
| Entitlement check | Service → policy | Internal call | `Principal` or wallet, capability name | Allow/deny decision | No direct write | Every sensitive operation calls policy explicitly |

Expiration results in read-only, unpublished, retained data with export and a grace period. There is no wallet balance, transfer, payout, stored value, or internal payment ledger.

## 10. Error and status contract (DECISION)

| Condition | HTML behavior | JSON / webhook behavior | Notes |
|---|---|---|---|
| Successful GET | 200 rendered page | 200 where applicable | No mutation |
| Successful mutation | 303 redirect to GET | 200 with `ok=true` | PRG for HTML |
| Malformed request | 400 generic page | 400 with error code | No stack trace |
| Validation failure | 422 re-render with safe field errors | 422 with field-level safe messages | Escaped output |
| Authentication required | 401 redirect to login for HTML | 401 `unauthenticated` | No account existence leak |
| Ownership or entitlement failure | 403 generic page | 403 `forbidden` | Checked on every sensitive operation |
| Unknown or unpublished wallet | 404 generic page | 404 `not_found` | Avoid existence disclosure |
| State conflict | 409 generic page | 409 `conflict` | Example: publish during expired state |
| Rate limit | 429 page with generic guidance | 429 `rate_limited` plus `Retry-After` | Auth and inquiry are rate-limited |
| Webhook duplicate | Not applicable | 2xx acknowledgement | Idempotent; no duplicate grant |
| Webhook invalid signature | Not applicable | 400 `invalid_signature` | No state change |
| Server error | 500 generic page with correlation ID display | 500 `internal_error` with correlation ID | Logged with safe metadata only |
| GET sent to mutation route | 405 | 405 `method_not_allowed` | No GET mutations |

JSON error fields are: `ok` set to false, `error` as a stable code, `message` as a safe non-sensitive string, `correlation_id`, and optional `retry_after`. No raw exception, secret, SQL, or other-wallet identifier is returned.

Status: DECISION — awaiting product-owner approval. No implementation performed.
