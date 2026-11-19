# CUSTOMER JOURNEY — Codexx Wallet (lifecycle, visibility and edge cases)

**Document class:** Product-definition decision record (not a technical specification).
**Companions:** PRODUCT_VISION.md (identity/boundaries), PRODUCT_SCOPE.md (in/out dispositions).
**Reading rule:** **EVIDENCE** = verified current state. **DECISION** = proposed journey. Actors: **Owner** (wallet owner/customer), **Visitor** (public-wallet reader), **Admin** (operator), **Provider** (external payment provider).

---

## 1. Owner lifecycle — purchase to daily use

**DECISION.** Stages: Discover → choose plan → purchase → account + wallet provisioned → onboarding → public wallet live → inquiries arrive → daily workspace management → notifications/read receipts → renewal/upgrade → expiration/grace/export.

### 1.1 Stage table

| # | Stage | Actor actions | System responses | Data created | Control / visibility | Failure / edge case |
|---|---|---|---|---|---|---|
| 1 | Discover | Visitor/owner sees a public wallet via direct link (or marketing page) | Serve read-only SSR public wallet; no catalog listing in v1 | None (read path) | Public wallet visible; owner identity as published | Wallet unpublished → public 404/soft "not published" [PRODUCT_SCOPE §5] |
| 2 | Choose plan | Owner reviews Starter/Base, Professional, Business entitlements and terms (monthly/yearly/lifetime) | Present entitlement-based tier comparison; **no prices invented by system** | None | Plan terms visible | Owner cannot decide → no account; no pressure mechanism |
| 3 | Purchase | Owner pays via **external provider** | Redirect to provider; on success receive webhook/confirmation; verify and record entitlement | Plan, Subscription, Entitlement, payment reference | Entitlement pending until confirmed | **Payment failure / webhook loss** → no provisioning; retry/reconcile path; no orphan account |
| 4 | Provisioned | Owner returns from provider | Create account (hashed password), wallet record scoped to `wallet_id`, empty workspace; grant entitlements | User, Wallet (tenant), initial settings | Owner has full control of own wallet; private workspace accessible | Duplicate confirmation → idempotent provisioning; no second wallet |
| 5 | Onboarding | Owner sets identity, chooses design/theme, adds projects, sets publish state | Validate input; apply theme; persist content; warn on incomplete profile | Profile content, theme selection, projects | Draft/unpublished by default; owner-only visibility | **Abandoned onboarding** → account + draft wallet persist; resumable; no auto-publish; reminder via announcement/notification |
| 6 | Public wallet live | Owner publishes | Public wallet becomes reachable at per-wallet URL shape; SSR, SEO-friendly; direct link only | Published flag | Owner controls publish/unpublish at any time | Publish blocked if entitlement lapsed → require renewal; publish with incomplete content allowed if owner chooses |
| 7 | Inquiries arrive | Visitor submits inquiry (name / email / type / message) | Honeypot + rate-limit checks; store inquiry; notify owner; no auto-reply that invents commitments | Inquiry record (typed) | Owner sees inquiries in workspace inbox; visitor sees confirmation only | Spam/honeypot hit → reject silently; rate-limit exceeded → throttle; **notification fails** → queue/retry, inquiry still stored |
| 8 | Daily workspace management | Owner edits content, manages inquiries, reads announcements, changes settings | All mutations POST + CSRF; server-side authz + `wallet_id` scoping; audit log entries | Content versions, inquiry status, settings changes, audit events | Full owner control; no cross-wallet access; no admin content editing by default | Concurrent edits → last-write-wins with audit; unauthorized cross-wallet ID → denied, logged |
| 9 | Notifications / receipts | Owner opens announcement in workspace | Mark announcement read with per-recipient receipt; no reply/thread created | Read receipt | Owner sees one-way Administration announcements only | Receipt write fails → retry; owner never replies (no reply path exists) |
| 10 | Renew / upgrade | Owner renews or changes tier | Provider flow; on success extend/replace entitlement per policy service | Subscription update, Entitlement change | Entitlement reflects current paid scope immediately on confirmation | **Payment failure** → existing entitlement unchanged until grace; no silent downgrade of data |
| 11 | Expiration / grace / export | Owner does nothing or requests export | On expiry: wallet becomes **read-only/unpublished**, data **retained**, grace period runs; export available throughout | Grace state, export artifact/request, audit event | Owner can still read/export; cannot publish or mutate during read-only | **Expired subscription** → no data deletion; after grace, retained but inaccessible publicly; export remains available |

### 1.2 Entitlement-driven control states

**DECISION.**

| State | Public wallet | Workspace mutations | Data | Export |
|---|---|---|---|---|
| Active, published | Visible via direct link | Allowed within entitlement | Retained | Available |
| Active, unpublished | Not visible | Allowed | Retained | Available |
| Expired (grace) | Read-only/unpublished | Blocked (read-only) | Retained | Available |
| Expired (post-grace) | Unpublished | Read-only or access-limited per policy | Retained (not deleted) | Available |
| Suspended (abuse) | Unpublished | Restricted | Retained | Available per policy |
| Owner-initiated export/close | As chosen before close | As chosen | Export produced; close only after confirmed export | Primary action |

**EVIDENCE.** Today there is no entitlement model, no publish gate, no lifecycle state and no export path; accounts lack verification flags and authoritative data is split across `data.json` and SQL [AUDIT/01 §6][DISCOVERY/06 §5, §7]. All states above are new.

---

## 2. Public-wallet visitor journey (separate)

**DECISION.** A visitor is an anonymous reader arriving by **direct link** in v1 — no catalog, no directory, no discovery listing [PRODUCT_SCOPE §5].

| Step | Visitor action | System response | Data created | Control / visibility | Failure / edge case |
|---|---|---|---|---|---|
| 1 | Opens per-wallet direct URL | SSR public wallet; SEO-friendly; theme applied | None | Public presentation only | Unpublished/unknown wallet → 404/soft "not published"; error templates must resolve correctly (current 403/503 extend a missing base [AUDIT/03 §4]) |
| 2 | Browses profile and project detail | Read-only render; no mutation endpoints exposed | None | Owner-controlled content as published | Broken sitemap links currently emit nonexistent `/project/<id>` [DISCOVERY/05 §4.6] — removed in v1 |
| 3 | Reads in English or Arabic | Language/RTL layout applied | None | Bilingual presentation | Missing translation → English baseline fallback; RTL layout must not break layout [DISCOVERY/05 §3] |
| 4 | Submits inquiry | Validate taxonomy; honeypot + rate-limit; store; confirm to visitor; notify owner | Inquiry record | Visitor sees confirmation only — no inbox, no thread, no reply path | Honeypot/rate-limit rejection; notification failure does not lose inquiry |
| 5 | Leaves | No account created; no tracking by raw IP | None | Privacy-preserving analytics only | Visitor cannot become a member through the wallet; purchase is a separate owner act |

**DECISION.** Visitors never encounter: internal messaging, threads, sign-up-by-inquiry, catalog browsing, bidding or CRM conversion.

---

## 3. Admin-operator journey (separate)

**DECISION.** Administration is **operational only**: support, announcements, abuse handling and backups. **Admin does not edit customer wallet content by default.** Any exception requires **explicit owner consent** and an audit-log entry [PRODUCT_VISION §6][PRODUCT_SCOPE §6].

**EVIDENCE.** Current admin can download backups as any logged-in user, initiate member conversations, and has demo-mode write capability; none of that is an editorial mandate, and all of it is removed or redefined [AUDIT/05 §5][DISCOVERY/05 §4.3, §4.5].

| # | Operator task | Admin action | System response | Data created | Control / visibility | Failure / edge case |
|---|---|---|---|---|---|---|
| 1 | Support | Respond to owner support request via out-of-band/operational channel | Log support action; no wallet content change | Support/audit record | Owner's content untouched | Admin cannot silently change published content |
| 2 | Announcements | Create one-way announcement targeted to owners/all | Append-only record; notify; expose read receipts | Announcement record + per-recipient receipts | Owners see one-way record; no reply/thread | Send failure → retry/dedup; no duplicate announcement |
| 3 | Read receipts | View who has/has not read | Aggregate receipts; no per-member conversation state | Receipt read view | Visibility limited to operational need | Receipt missing → show "not recorded", not "unread conversation" |
| 4 | Abuse / suspension | Investigate and apply suspension | Unpublish wallet; restrict mutations; retain data | Suspension state + audit event | Owner notified where allowed | Wrongful suspension → documented reinstatement path |
| 5 | Backups | Trigger/verify encrypted off-instance backup and restore test | Encrypted backup; restore verification result | Backup + restore-test record | Backup not downloadable by ordinary users | Restore test fails → incident, not silent success |
| 6 | Entitlement ops | Adjust subscription on provider-validated grounds | Policy service updates entitlement; audit | Subscription/entitlement change | Reflects real commercial state | Manual adjustment requires reason + audit |
| 7 | Consent-based content assistance | Request explicit owner consent before any content action | Consent recorded; action scoped and logged | Consent + audit record | Only with consent; default is **no access** | Consent absent/withdrawn → no action |

**DECISION.** Announcements **supersede** `AUDIT/08` archive rules: no conversations exist to archive, so announcements are retained records, not archived threads [PRODUCT_SCOPE §3].

---

## 4. Cross-cutting failure and edge-case register

**DECISION.** These cases must have an explicit product-level outcome; none may fail silently or mutate state on a GET request.

| Case | Required outcome |
|---|---|
| Payment failure | No account/wallet provisioned; no entitlement granted; retry/reconcile via provider; prior entitlement unchanged on renewal failure |
| Duplicate purchase confirmation | Idempotent — one wallet, one entitlement per confirmed event |
| Abandoned onboarding | Draft account persists; resumable; never auto-published; reminder only |
| Unpublished wallet | Direct link returns 404/soft "not published"; no data leak |
| Expired subscription | Read-only/unpublished; data retained; export available; grace period before further restriction |
| Suspension | Unpublished and restricted; data retained; audit + reinstatement path |
| Data export | Available in all retained states; produced on request; closing follows confirmed export |
| Notification failure | Inquiry/announcement still stored; queued retry/dedup; audit entry; no "delivered" claim without proof |
| Concurrent edits | Server-side arbitration; audit log; no lost updates without trace |
| Cross-wallet access attempt | Denied by server-side authz + `wallet_id` scoping; logged; no data returned |
| CSRF / GET mutation attempt | Rejected; all mutations POST with CSRF token [AUDIT/06 §2] |
| Arabic/RTL rendering gap | English baseline fallback; layout must remain usable in RTL |

---

Status: DECISION — awaiting product-owner approval. No implementation performed.
