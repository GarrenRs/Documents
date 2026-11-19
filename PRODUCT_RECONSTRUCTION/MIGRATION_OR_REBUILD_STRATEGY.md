# Migration or Rebuild Strategy — Codexx Wallet

**Document class:** Decision-quality product assessment (migration strategy).
**Strategy:** Controlled reconstruction of the core in parallel — not a feature-by-feature port, not a greenfield rewrite.
**Scope:** Migration planning only. No source, schema, data, config, or deployment was changed for this assessment.

---

## 0. Evidence vs decision

| Label | Meaning |
| --- | --- |
| EVIDENCE | Directly observed in current source, data and prior audits/discovery. |
| DECISION | Canonical migration strategy; not yet executed. |

**EVIDENCE — why a plain in-place port is unsafe.**
- `app.py` is 3,570 lines with 72 routes, no Blueprints, no factory, no services, no tests, no migrations and no CI; importing it is state-changing (creates dirs, calls `db.create_all()`, starts schedulers) `[AUDIT/01 §3]`, `[AUDIT/02 §1]`; `app.py:24,36-43,119-122`.
- Two stores hold the same concepts with no transaction boundary: `data.json` is authoritative for most concepts; SQL holds messages; no cross-store transaction `[AUDIT/04 §1, §5]`; `[DISCOVERY/02 §4]`.
- `models.py` has 7 models with no relationships, a nullable `Message.workspace_id`, and unconstrained string IDs `[AUDIT/04 §2]`.
- Snapshot data: `data.json` 11,301 B with 3 users (all `role=user`, integer IDs, no `is_verified`), 5 portfolios of which 2 are orphaned, 2 legacy messages under one portfolio, plaintext notification credentials, global `projects=0`; `security/ip_log.json` 34,507 B / 127 entries `[AUDIT/01 §6]`; `[AUDIT/04 §5]`.
- Live CDP testing passed 23/23 with 0 console errors, 0 failed requests, 27 screenshots; theme switch persisted and inquiry dual-write occurred; notification delivery remained unproven; demo writes were allowed `[DISCOVERY/05 §5, §9]`; `[DISCOVERY/04 §6]`.

**DECISION.** Reconstruct the core as a modular monolith in parallel, then convert data once under validation, verify per wallet, cut over, and decommission the legacy paths. The old application is **frozen read-only** for the entire migration. All work occurs on **isolated copies**. Never migrate against the only copy.

---

## 1. Governing controls (apply to every phase)

**DECISION — non-negotiable safety controls.**

1. **Freeze the legacy app read-only.** No new features, no schema changes, no live notification/payment sends on the old system. It exists only as a reference and comparison baseline.
2. **Isolated copies only.** Build, conversion tests and restore drills run on copies with their own datastores and synthetic/externalized credentials.
3. **Checksummed baseline.** Record SHA-256 checksums and sizes for `data.json`, the SQL datastore, `static/assets/uploads/`, and `security/ip_log.json` before any conversion `[AUDIT/07:18]`; `[AUDIT/04 §7]`.
4. **Restore drill before trust.** Every backup/restore path is proven by an actual restore to a separate location before it is relied upon.
5. **No conversion against production.** The one-time import runs against a prepared target copy; the production-equivalent source stays frozen.
6. **Every phase has entry/exit criteria** (below). A failed exit criterion halts the phase; no phase is skipped.
7. **Secrets never travel in docs or logs.** Notification credentials in `data.json` are **not imported**; credentials live in the vault `[AUDIT/04 §5]`; `[DISCOVERY/03 §5]`.

---

## 2. Phase 0 — Freeze, snapshot, baseline

**Goal:** Make the current state immutable, reproducible and verifiable so every later step is attributable and reversible.

**Entry criteria:** Migration approved; owner has named the target environment and owner of the freeze.

**Actions:**
- Freeze the legacy application: read-only, no deployments, no scheduled job that mutates state (the import-time schedulers must be stopped in the frozen copy) `[AUDIT/05 §4]`; `app.py:119-122`.
- Record checksums + sizes for `data.json`, SQL datastore, uploads, IP log; store outside the app tree `[AUDIT/07:18]`.
- Verify the published-documentation clone is complete and matches the frozen tree (docs currently assert unimplemented fixes) `[AUDIT/01 §7]`; `[AUDIT/FINAL_ASSESSMENT.md:158]`.
- Create at least two isolated copies: a **build copy** and a **verification copy**.
- Define the target schema (single datastore, entities and `wallet_id` scoping per the canonical data decision) and record the mapping (§5).
- Inventory environment variable **names** only; no values copied into docs `[AUDIT/07:20]`.

**Exit criteria:**
- Checksums recorded and independently recomputed; frozen copy confirmed unchanged.
- Build and verification copies exist and start from the checksummed baseline.
- Target schema and conversion mapping reviewed and approved.
- A restore from the baseline snapshot to a scratch location succeeded (restore drill #1).

**Rollback trigger:** Baseline checksum mismatch or failed restore → stop; do not proceed.

---

## 3. Phase 1 — Build the new core in parallel

**Goal:** Produce a working reconstructed core on an isolated copy while the legacy app stays frozen.

**Entry criteria:** Phase 0 exit criteria met; target schema approved.

**Actions / components to build:**
- Flask application factory + Blueprints; service and repository layers `[AUDIT/02 §8]`.
- Single datastore with Alembic migrations: PostgreSQL in production, SQLite for development.
- Auth + authorization service enforcing session wallet ownership; **no client-supplied wallet ID trusted**; every owned row carries an indexed `wallet_id` UUID FK (`NOT NULL`).
- Public wallet (`/w/<slug>`) reading only `published` wallets; preserved public profile/project UX and six theme CSS files; Jinja SSR with minimal vanilla JS/HTMX and **no build step / no SPA**.
- Private workspace CRUD; inquiry form + taxonomy; one-way Administration → owner announcements with append-only records and per-recipient read receipts (no replies/threads).
- Entitlement boundary: `Plan / Subscription / Entitlement` + policy service; billing only at a boundary module (checkout redirect + webhook), no in-app financial wallet.
- Security baseline from the start: CSRF, no GET mutations, secure cookies + env secret with startup validation, no debug in prod, strict CSP, server-side authorization, `wallet_id` scoping, secrets in vault, audit log, private media outside webroot served via authorized route.
- Arabic/RTL support as a v1 requirement (content ownership is an owner decision).
- Outbox for delivery; privacy-respecting aggregate analytics only.

**Exit criteria:**
- New core runs on isolated copy with migrations from empty → current schema.
- Public wallet, workspace, inquiry and announcement flows pass automated tests on synthetic data.
- Authorization tests prove cross-wallet access is denied for every owned entity.
- No import-time state-changing side effects (contrast `app.py:24,36-43,119-122`).

**Rollback trigger:** Tenant-isolation test failure or unmigratable schema decision → stop and redesign the affected boundary before continuing.

---

## 4. Phase 2 — One-time validated conversion / import

**Goal:** Convert legacy data exactly once, with a full anomaly report and no silent loss.

**Entry criteria:** Phase 1 exit criteria met; conversion mapping signed off; source still frozen at Phase 0 checksums.

**Actions:**
- Run the conversion on an isolated target copy using the mapping in §5, in a single transaction per wallet where possible.
- Produce an **anomaly report**: orphans, malformed IDs, missing references, duplicate rows, plaintext credentials, unreadable media, conflicting flags.
- Validate referential integrity, `wallet_id` population, uniqueness of slugs, hash compatibility for user passwords (Werkzeug hashing preserved) `[AUDIT/FINAL_ASSESSMENT.md:165]`; `app.py:2029`.
- Quarantine anything unmappable rather than dropping it.
- Do **not** import notification credentials, raw IP analytics, legacy internal messages as messages, or orphan portfolios as live wallets (§7).
- Re-run the conversion from the frozen baseline to prove determinism; compare outputs.

**Exit criteria:**
- Counts reconcile per entity against a documented expectation (e.g. 3 users → 3 Accounts + 3 Wallets; 5 portfolios → 3 live + 2 quarantined; 2 legacy messages → 2 Inquiries) `[AUDIT/01 §6]`.
- Anomaly report reviewed and every anomaly assigned (mapped, quarantined, or intentionally dropped with reason).
- Second deterministic conversion matches the first.
- Restore drill #2 succeeds from the converted target copy.

**Rollback trigger:** Unreconcilable count mismatch, silent data loss, or failed restore → discard the converted copy, re-run from baseline; the frozen source is untouched.

---

## 5. Data conversion mapping and validation

**DECISION — single datastore; `data.json` is a one-time import source only, then retired.**

| Source | Target | Validation rule |
| --- | --- | --- |
| `data.json` `users[]` (integer IDs, role=user) | `Account` + `Wallet` (tenant aggregate: slug, status, `published`, design set, plan ref) | One wallet per user; UUID keys assigned; integer legacy ID retained as a mapping field; `wallet_id` populated on all owned rows. |
| `data.json` portfolios | `WalletProfile` + `Project` + `Skill` + `MediaAsset` | Content mapped per live portfolio; global `projects=0` means no global project rows to import; media paths verified and moved outside webroot. |
| Orphan portfolios (`sarah_stratege`, `marcus_builds`) | Quarantine area, **not** live wallets | Flagged in anomaly report; owner disposition required; not published `[AUDIT/FINAL_ASSESSMENT.md:21]`; `[AUDIT/04 §5]`. |
| SQL `Message` rows (2 legacy messages) | `Inquiry` | Reclassified as inquiries, not internal messages; taxonomy applied; `wallet_id` set from owning portfolio. |
| Notification credentials (plaintext in JSON) | **NOT imported** | Secrets excluded; rotate in vault; no values in docs/logs `[AUDIT/04 §5]`. |
| `security/ip_log.json` (127 entries) | **NOT imported** | Raw IP analytics out of scope; privacy analytics only going forward. |
| Legacy internal messaging / threads | **NOT imported as messaging** | Replaced by Announcements + AnnouncementRead; if any content must be retained, it is handled as a reviewed data decision, not a feature port. |
| Design / theme selection | Wallet design set + preserved 6 theme CSS files | Theme value mapped; themes reused as-is. |
| Password hashes (Werkzeug) | `Account` credential | Preserve hash format; verify a known credential after import `[AUDIT/FINAL_ASSESSMENT.md:101]`. |

**DECISION — `wallet_id` integrity.** Every owned table receives a UUID FK to `Wallet`, `NOT NULL`, indexed. Authorization service resolves ownership from the session and the row's `wallet_id`; client-supplied wallet IDs are never trusted. Public routes read only wallets where `published = true`.

---

## 6. Phase 3 — Parallel verification and URL parity

**Goal:** Prove the new core is behaviorally equivalent where it should be, and explicitly different where mandated.

**Entry criteria:** Phase 2 exit criteria met; verification copy prepared from the converted dataset.

**Actions:**
- **Per-wallet verification:** for each imported wallet, compare public rendering (content, theme, profile, projects, skills, media), inquiry form behavior, and workspace CRUD against the frozen legacy app using the 27-screenshot baseline and 23/23 live cases `[DISCOVERY/05 §2, §8]`.
- **URL parity and redirects:** legacy `/portfolio/<user>` → new `/w/<slug>` via permanent redirects; preserve overall URL shape elsewhere (e.g. project detail under the wallet) `[AUDIT/02 §3]`, `[DISCOVERY/02 §2]`.
- **Difference register:** record intentional divergences (announcements instead of messaging; no demo/inquiry dual-write; no raw IP logging; analytics policy). These are expected, not failures.
- **Security verification:** CSRF enforced; no GET mutations; cross-wallet access denied; CSP strict; private media requires authorized route; backup download restricted beyond "any logged-in user" `[AUDIT/FINAL_ASSESSMENT.md:98,187]`.
- **Load/restore verification:** single background worker; one web pool; restore drill #3 from the verification copy.

**Exit criteria:**
- Every per-wallet comparison passes or has an approved difference-register entry.
- All legacy public URLs redirect correctly; no broken deep links for the public profile/project UX.
- Authorization and security checks pass with 0 cross-wallet leaks.
- Owner signs off on the difference register.

**Rollback trigger:** Any unexplained public-content mismatch, broken primary URL, or cross-wallet authorization failure → halt cutover.

---

## 7. Phase 4 — Cutover and decommission

**Goal:** Switch to the reconstructed core, then remove legacy paths.

**Entry criteria:** Phase 3 exit criteria met; cutover checklist (§7.1) signed off; freeze checksums still valid.

### 7.1 Cutover checklist

- [ ] Final snapshot of frozen source with checksums (repeat of Phase 0).
- [ ] Redundant encrypted **off-instance** backup created and restore drill #4 passed.
- [ ] DNS/traffic switch to one web pool + one background worker.
- [ ] Redirects live (`/portfolio/<user>` → `/w/<slug>`).
- [ ] Monitoring, audit log and alerting active.
- [ ] Secrets confirmed in vault; env secret and startup validation enabled; debug off in prod.
- [ ] Rollback plan rehearsed: traffic can be returned to frozen legacy app, which remains intact read-only until sign-off.
- [ ] Owner final approval to cut over.

### 7.2 Decommission list (after a stable observation window)

- [ ] Legacy JSON read/write paths retired; `data.json` fully retired as a live store.
- [ ] Internal member-to-member messaging removed: threads/inbox/compose/reply/read-state/unread-poll, deprecated chat, false "archive" delete, member↔member policy `[DISCOVERY/08 §4]`; `[AUDIT/08 §1]`.
- [ ] Demo mode, broken `/register`, dead subscription mockup (`subscription.html`), orphan portfolios, verification-by-3-projects, public catalog/directory in v1 removed or disabled.
- [ ] General CRM/pipelining, raw IP analytics, duplicate notification senders removed.
- [ ] GET mutations eliminated; WeasyPrint PDF out of v1; obsolete Telegram/SMTP guides removed.
- [ ] Duplicate/unpinned `requirements.txt` blocks and unused dependencies cleaned `[AUDIT/FINAL_ASSESSMENT.md:152]`.
- [ ] Legacy import-time schedulers and local-FS-only state removed.

### 7.3 Deliberately NOT migrated

- Financial wallet logic (none exists and none is in scope).
- Notification credentials (plaintext; rotate instead).
- Raw IP log (privacy analytics only).
- Legacy internal messages as a messaging feature (replaced by Announcements).
- Orphan portfolios as live wallets (quarantined).
- The `$0 / $9.99 / $24.99` mockup pricing and `payment` endpoint reference (`templates/dashboard/subscription.html:377-426`, `[DISCOVERY/01 line 112]`).
- Per-worker schedulers, permissive CSP `default-src *` / `frame-ancestors *`, and `X-Frame-Options` absence `[AUDIT/FINAL_ASSESSMENT.md:24,249]`.

**Exit criteria:** New core is the sole serving system; legacy paths disabled; observation window passed with no rollback trigger; decommission signed off.

**Rollback trigger after cutover:** Data-integrity failure, unresolved cross-wallet leak, or unrecoverable availability failure → return traffic to frozen legacy app using the rehearsed rollback and re-enter Phase 3.

---

## 8. Retain / refactor / replace / remove — master table

**DECISION.** Coverage of all major subsystems.

| Subsystem | Disposition | Rationale / target |
| --- | --- | --- |
| Public profile + project UX | **Retain** (behavior) | Preserve rendered public experience; move onto SSR core. |
| Six theme CSS files | **Retain** | Tiny, working, part of presentation value. |
| Inquiry taxonomy + contact form | **Retain / refactor** | Keep taxonomy and UX; remove dual-write; one authoritative store + outbox. |
| Werkzeug password hashing | **Retain** | Preserve hashes on import; verify post-import `[AUDIT/FINAL_ASSESSMENT.md:101]`. |
| Jinja template hierarchy + URL shape | **Retain / refactor** | Preserve hierarchy and URL conventions; add `/w/<slug>` with legacy redirects. |
| Backup concept | **Retain / refactor** | Multi-store encrypted off-instance backups + restore drill; restrict download. |
| `app.py` 3,570-line module / 72 routes | **Replace** | Flask factory + Blueprints + services/repositories. |
| `data.json` as live store | **Replace then retire** | One-time import source only → single datastore. |
| Dual persistence / no transaction | **Replace** | Single DB; transactions span wallet writes; outbox for delivery. |
| `models.py` 7 models, no relationships | **Replace** | New entity set with `wallet_id` FKs and indexes. |
| Session-only auth + decorators | **Replace** | Auth/authz service with wallet ownership; secure cookies; env secret; startup validation. |
| CSRF / GET mutations / CSP | **Replace** | CSRF, POST-only mutations, strict CSP, trusted-proxy handling. |
| Internal member-to-member messaging (threads/inbox/compose/reply/read-state/unread-poll) | **Remove** | Superseded by one-way announcements + read receipts. |
| Deprecated chat / `chat.html` | **Remove** | Dead module referencing missing endpoint `[AUDIT/FINAL_ASSESSMENT.md:122]`. |
| False "archive" delete | **Remove** | Was a hard delete with no archive state `[AUDIT/FINAL_ASSESSMENT.md:121]`. |
| Demo mode | **Remove** | Allowed demo writes; no product value `[DISCOVERY/05 §7]`. |
| Broken `/register` (`url_for('login')`) | **Remove / rebuild** | Replaced by provisioned account+wallet flow `app.py:730`. |
| Dead `subscription.html` mockup + `$0/$9.99/$24.99` | **Remove** | No endpoint; prices rejected (`templates/dashboard/subscription.html:377-426`, `[DISCOVERY/01 line 112]`). |
| Orphan portfolios (2) | **Quarantine** | Owner disposition; not live wallets. |
| Verification-by-3-projects | **Remove** | No evidence it is a valid gate `[AUDIT/FINAL_ASSESSMENT.md:21]`. |
| Public catalog / directory in v1 | **Remove** | Not in v1 scope. |
| General CRM / pipelining | **Remove** | Non-target product category. |
| Raw IP analytics / `ip_log.json` | **Remove** | Privacy analytics only. |
| Duplicate notification senders (4 Telegram + 5 SMTP) | **Remove / consolidate** | Single delivery path via outbox `[AUDIT/FINAL_ASSESSMENT.md:139-140]`. |
| Notification plaintext credentials | **Remove** | Vault; rotate; never imported. |
| Import-time schedulers / no-op demo reset | **Remove** | Single background worker; no import side effects `app.py:119-122`. |
| WeasyPrint PDF in v1 | **Defer / remove from v1** | Native deps undeclared; not v1 scope `[AUDIT/FINAL_ASSESSMENT.md:102]` |
| Obsolete Telegram/SMTP guides | **Remove** | Replace with boundary/provider docs. |
| Duplicate/unpinned dependencies | **Remove** | Single pinned manifest `[AUDIT/FINAL_ASSESSMENT.md:152]`. |
| Permissive CSP / GET mutations | **Remove** | Security baseline (Phase 1). |
| Arabic/RTL | **Add (new)** | v1 requirement; absent from source (0 of 49 templates) `[DISCOVERY/12 §2]`. |
| Entitlement boundary / billing provider | **Add (new)** | `Plan / Subscription / Entitlement` + policy; boundary module only. |
| Announcements + read receipts | **Add (new)** | Replacement for internal messaging. |
| Audit log / AuthEvent / BackupSnapshot | **Add (new)** | Security and lifecycle evidence. |

---

## 9. Risk register

| # | Risk | Likelihood / impact | Mitigation |
| --- | --- | --- | --- |
| R1 | Migrating against the only copy | Low / Critical | Freeze read-only; isolated build + verification copies; checksums; never migrate source of truth. |
| R2 | Silent data loss in JSON→DB conversion | Medium / Critical | Deterministic double conversion, count reconciliation, anomaly report, quarantine, owner sign-off. |
| R3 | Cross-wallet data leak | Medium / Critical | `wallet_id` NOT NULL indexed FK on every owned row; authorization service; negative tests; stop condition. |
| R4 | Broken public URLs / lost SEO | Medium / High | URL parity; `/portfolio/<user>` → `/w/<slug>` redirects; per-wallet rendering comparison against 27 screenshots. |
| R5 | Orphan/portfolio ambiguity | High / Medium | Quarantine; anomaly report; owner disposition; never auto-publish. |
| R6 | Credential leakage from plaintext JSON | High / High | Do not import secrets; vault; rotate; no values in docs/logs. |
| R7 | Restore path that cannot restore | Medium / Critical | Restore drills at Phases 0, 2, 3, 4; off-instance encrypted backup. |
| R8 | Scope creep / feature-by-feature port | Medium / High | Explicit remove list; difference register; owner sign-off; no messaging port. |
| R9 | Commercial logic leaking into core | Medium / High | Entitlement boundary + policy service; billing at boundary only. |
| R10 | Arabic/RTL content unowned | Medium / Medium | Owner decision required; treat as content scope, not code invention. |
| R11 | Cutover without rollback | Low / Critical | Rehearsed rollback; frozen legacy retained until sign-off; explicit rollback triggers. |
| R12 | Reusing rejected prices/dead mockup | Medium / Medium | Decommission `subscription.html`; no prices in new config; commercial doc forbids reuse. |

---

## 10. Sequencing summary

```
Phase 0 (freeze/snapshot/schema)
   ↓
Phase 1 (parallel core build: auth/authz, DB+migrations, public wallet,
         workspace, inquiry, announcements, entitlement boundary)
   ↓
Phase 2 (one-time validated conversion + anomaly report + restore drill)
   ↓
Phase 3 (per-wallet parallel verification, URL parity, security verification)
   ↓
Phase 4 (cutover → observation window → decommission → retire data.json)
```

**Dependencies that must not be violated:** freeze before build; schema before conversion; conversion before verification; verification before cutover; restore drills throughout; frozen legacy intact until final sign-off.

**Stop condition:** No implementation, conversion, or cutover occurs until the product owner approves this strategy and the open owner decisions (see Final Recommendation §9) are resolved.

Status: DECISION — awaiting product-owner approval. No implementation performed.
