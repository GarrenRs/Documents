# 12 — Master Product Roadmap

**Discovery date:** 2026-11-19
**Status:** Evidence-based roadmap for product-owner review only. No work in this roadmap is authorized to start until explicitly approved.

---

## Evidence conventions

| Label | Meaning |
| --- | --- |
| VERIFIED FACT | Directly observed in source/templates/data/runtime evidence. |
| DOCUMENTED INTENT | Stated in docs or approved policy. |
| OWNER-PROVIDED CONTEXT | Supplied by the product owner. |
| INFERENCE | Reasoned interpretation supported by evidence. |
| STRATEGIC PROPOSAL | Possible future direction only. |
| UNKNOWN | Insufficient evidence. |

---

## 1. Roadmap principles

1. **No rewrite recommendation.** Prior audit explicitly recommends preservation plus phased remediation (`AUDIT/FINAL_ASSESSMENT.md:194-205`).
2. **Approved policy overrides legacy behavior.** Communication rules in `AUDIT/08:20-54` are mandatory.
3. **Unapproved semantics remain unresolved.** Four archive questions are UNKNOWN and block archive implementation (`AUDIT/08:230-263`).
4. **Evidence before expansion.** Product/commercial expansion should wait for a reliable baseline, correct core loop, and owner decisions.
5. **Safety first.** No real notifications, payments, production deployment, or source/schema changes were made during discovery.

---

## 2. Current position

**VERIFIED FACT:** The repository is a 3,570-line Flask monolith with 72 routes, 42 templates, JSON-first persistence, partial SQLAlchemy use, no Git metadata, no tests, no CI, no migrations, and no lockfiles (`AUDIT/FINAL_ASSESSMENT.md:16-23,43`; current baseline).

**VERIFIED FACT:** Core public/dashboard flows exist, but active breakage includes `/register`, `/documentation`, missing endpoints, inconsistent internal messaging, and unsupported security claims (`AUDIT/FINAL_ASSESSMENT.md:148-158`).

**VERIFIED FACT:** The product identity is proof-of-work professional portfolio presentation plus inquiry/CRM/admin workflows, not a wallet, marketplace, social network, or paid-tier product (`DISCOVERY/01_PRODUCT_IDENTITY.md`).

**UNKNOWN:** Production deployment state, database contents, environment values, external deep links, and owner decisions on wallet/Silver/premium/roles.

---

## 3. Gate 0 — Product-owner decisions before implementation

**Status: REQUIRED BEFORE ANY NEXT PHASE.**

| # | Decision required | Classification | Why it blocks work |
| --- | --- | --- | --- |
| D1 | Approve Phase 0/1 scope and authority to modify source in a future phase | DOCUMENTED INTENT / approval needed | Current mission explicitly forbids implementation. |
| D2 | Choose archive semantics: per-participant vs shared, admin archiving, restoration, reactivation | UNKNOWN | `AUDIT/08:230-263`; no choice authorized. |
| D3 | Decide admin identity model: single Administration identity vs distinguishable admin accounts | UNKNOWN | `AUDIT/08:74-103,305-318`; affects authorization. |
| D4 | Confirm wallet/Silver/premium interpretation | OWNER-PROVIDED CONTEXT vs VERIFIED ABSENCE | Determines whether any future product expansion is in scope. |
| D5 | Confirm target roles (member/admin/demo vs freelancer/business/org) | OWNER-PROVIDED CONTEXT vs VERIFIED FACT | Determines roadmap expansion. |
| D6 | Confirm anti-paid-exposure promise remains binding | DOCUMENTED INTENT | Affects monetization and dead subscription decisions. |
| D7 | Confirm deployment/storage expectations | UNKNOWN | Affects backups, persistence, scheduling, and data authority. |

---

## 4. Phase 0 — Baseline and safety (required first)

**Classification:** STRATEGIC PROPOSAL / required foundation. Prior audit also identifies this as the single next step (`AUDIT/FINAL_ASSESSMENT.md:255-259`).

| Item | Action | Evidence / rationale | Acceptance |
| --- | --- | --- | --- |
| 0.1 | Establish real version control baseline: initialize or locate repository, commit unchanged tree, record remote/branch/commit | No `.git` or Git CLI; UNKNOWN identity | Attributable baseline exists before changes. |
| 0.2 | Snapshot mutable state: `data.json`, `security/ip_log.json`, uploads, DB/backups if any | Local-file state is primary (`AUDIT/FINAL_ASSESSMENT.md:57-62`) | Snapshot stored outside app source. |
| 0.3 | Inventory env var **names** and production deployment facts | Deployed values UNKNOWN (`AUDIT/FINAL_ASSESSMENT.md:227`) | No secrets copied into docs. |
| 0.4 | Formalize isolated test harness and synthetic fixtures | Discovery harness created outside source | Tests never touch production or real transports. |
| 0.5 | Record dependency install/runtime baseline | `DISCOVERY/03_ENVIRONMENT_AND_RUNTIME.md` | Reproducible install record with failures documented. |

**Discovery status:** 0.4 and 0.5 are addressed in `DISCOVERY/` for this mission; 0.1–0.3 remain UNKNOWN / not performed.

---

## 5. Phase 1 — Active breakage and communication correctness

**Classification:** STRATEGIC PROPOSAL; highest-priority required fixes after Gate 0. Preserve unrelated behavior (`AUDIT/FINAL_ASSESSMENT.md:199`).

| Priority | Item | Required outcome | Evidence |
| --- | --- | --- | --- |
| 1.1 | Fix registration redirect | `/register` no longer 500s | `app.py:725-730`; `AUDIT/FINAL_ASSESSMENT.md:18` |
| 1.2 | Fix internal thread date rendering | Parent timestamp visible | `internal_view.html:36`; `AUDIT/FINAL_ASSESSMENT.md:19,123` |
| 1.3 | Define one canonical unread semantics | Badge, dropdown, overview agree | `AUDIT/08:119-135` |
| 1.4 | Add authorized read-state endpoint | Mark-read is explicit and consistent; no undocumented endpoint | `ux_overhaul_plan.md:10`; `AUDIT/08:116,134` |
| 1.5 | Validate `receiver_id`, reject self-send and member→member | Backend rejection, not hidden UI | `app.py:2931`; `AUDIT/08:162-176,200` |
| 1.6 | Add participant checks to reply/view/delete/convert | Members access only own threads; explicit admin role check | `AUDIT/08:154-170,196-209` |
| 1.7 | Provide admin-initiated conversation path | Admin can start with any member | `AUDIT/08:31-34,120-122` |
| 1.8 | Implement approved archive model | No physical deletion; complete history preserved | `AUDIT/08:42-54,215-226` — **blocked by D2** |
| 1.9 | Dispatch internal message/reply notifications safely | Stubbed transports in tests; no real sends | `AUDIT/08:137-151` |
| 1.10 | Authenticate/minimize notifications endpoint | No unauthorized content/recipient exposure | `AUDIT/08:151,169,316` |

**Dependency:** D2 and D3 must be resolved before 1.8 and before participant authorization is finalized. Canonical unread semantics (1.3) must precede read-state implementation (1.4). Receiver validation (1.5) must precede notification wiring (1.9).

---

## 6. Phase 2 — Security hardening without architecture change

**Classification:** STRATEGIC PROPOSAL; required before broader exposure.

| Item | Action | Evidence |
| --- | --- | --- |
| 2.1 | Add CSRF protection and convert state-changing GETs to POST | `AUDIT/FINAL_ASSESSMENT.md:24,187`; `AUDIT/08:133,167-168` |
| 2.2 | Require authentication and authorization on notification API | `AUDIT/08:151,169` |
| 2.3 | Centralize ownership checks | `AUDIT/08:154-170` |
| 2.4 | Configure secure cookies and require production secret | `config.py:8,10`; `AUDIT/FINAL_ASSESSMENT.md:187` |
| 2.5a | Externalize/nonce inline JS before tightening CSP | `AUDIT/FINAL_ASSESSMENT.md:156,205` |
| 2.5b | Tighten CSP only after 2.5a | same |
| 2.6 | Escape Telegram HTML payloads; fix `innerHTML` sinks | `AUDIT/FINAL_ASSESSMENT.md:187` |
| 2.7 | Trusted-proxy parsing and login rate limits | `AUDIT/FINAL_ASSESSMENT.md:187` |
| 2.8 | Guard backup download beyond login | `AUDIT/FINAL_ASSESSMENT.md:98,188`; `AUDIT/08:316` |

**Constraint:** Do not tighten CSP before inline scripts are handled; do not switch auth to DB before password hashes are reconciled.

---

## 7. Phase 3 — Data integrity and secrets

**Classification:** STRATEGIC PROPOSAL; highest-risk required work.

| Item | Action | Evidence |
| --- | --- | --- |
| 3.1 | Atomic JSON writes with locking/versioning | `app.py:449-468`; `AUDIT/FINAL_ASSESSMENT.md:188` |
| 3.2 | Decide authoritative store for users/portfolios/messages | `AUDIT/FINAL_ASSESSMENT.md:44,57-59` |
| 3.3 | Reconcile JSON integer IDs, DB UUIDs, and admin identity | `AUDIT/08:74-103` |
| 3.4 | Clean deletion side effects: DB rows, JSON copies, uploads | `AUDIT/FINAL_ASSESSMENT.md:133,188` |
| 3.5 | Extract secrets from `data.json` and rotate them | `AUDIT/FINAL_ASSESSMENT.md:152,188,245` |
| 3.6 | Add FKs/indexes for thread fields after identity decision | `models.py:79-81`; `AUDIT/08:70` |
| 3.7 | Introduce Alembic migrations/baseline before schema changes | no migrations; `AUDIT/FINAL_ASSESSMENT.md:20,188` |
| 3.8 | Full backup set including DB/uploads/logs; restore drill | `AUDIT/FINAL_ASSESSMENT.md:98,141,188` |

**Constraint:** Alembic dependency must remain until migrations exist; migration baseline must precede FK/schema changes.

---

## 8. Phase 4 — Operational reliability

**Classification:** STRATEGIC PROPOSAL; required for dependable hosting.

| Item | Action | Evidence |
| --- | --- | --- |
| 4.1 | Explicit production config; no debug default | `config.py:50-80`; `render.yaml` omits `FLASK_ENV` |
| 4.2 | Single/locked scheduler or external cron | `app.py:119-122`; `render.yaml:6`; `AUDIT/FINAL_ASSESSMENT.md:74,189` |
| 4.3 | Notification timeouts, retry, dedup, delivery log | `AUDIT/FINAL_ASSESSMENT.md:139,154,189` |
| 4.4 | Clean dependency manifest: remove duplicates/unpinned duplicates | `requirements.txt:1-53`; `AUDIT/FINAL_ASSESSMENT.md:152,189` |
| 4.5 | Structured logging and alerting | `AUDIT/FINAL_ASSESSMENT.md:189` |
| 4.6 | Verify WeasyPrint native dependencies or document limitation | `AUDIT/FINAL_ASSESSMENT.md:102,230` |
| 4.7 | Persistent storage for uploads/backups if hosted | `render.yaml` has no disk; `AUDIT/FINAL_ASSESSMENT.md:231` |

---

## 9. Phase 5 — Cleanup and consolidation (last)

**Classification:** STRATEGIC PROPOSAL; do not start before Phases 1–4.

| Item | Action | Evidence |
| --- | --- | --- |
| 5.1 | Remove dead routes/templates only after external deep-link check | `AUDIT/FINAL_ASSESSMENT.md:229` |
| 5.2 | Consolidate duplicate notification helpers/config/message filters | `AUDIT/FINAL_ASSESSMENT.md:152-154` |
| 5.3 | Fix/remove broken SEO/help routes and sitemap paths | `app.py:1803-1847`; `AUDIT/FINAL_ASSESSMENT.md:29,150` |
| 5.4 | Correct documentation status claims | `AUDIT/FINAL_ASSESSMENT.md:158` |
| 5.5 | Incremental Blueprint/service extraction without rewriting logic | `AUDIT/FINAL_ASSESSMENT.md:43,190,203` |

---

## 10. Phase 6 — Optional product expansion

**Classification:** STRATEGIC PROPOSAL; all items require separate owner approval and depend on Gates 0/Phase 1–4.

| Expansion | Fit | Dependency |
| --- | --- | --- |
| Additional themes / premium presentation | Medium; aligns with professional identity but not current paid tier | D4/D6; preserve six-theme behavior |
| Service catalog / offerings | Low-medium; requires new data model and must respect anti-marketplace copy | D5/D6 |
| Organization/team accounts | Unknown; no current model | D5 |
| Client portal | Medium; would extend inquiry loop | Phase 1/2 security; new role model |
| AI content assistance | Medium-high if optional/user-controlled | `DISCOVERY/11_AI_OPPORTUNITY_ASSESSMENT.md` |
| Discovery/matching | Low fit currently; risks marketplace drift | D5/D6; bias/privacy controls |
| Wallet/payments | UNKNOWN; new product, not reconstruction | D4; separate discovery required |

---

## 11. Priority summary

**Required fix sequence (STRATEGIC PROPOSAL):**
`Gate 0 owner decisions → Phase 0 baseline → Phase 1 breakage/communication → Phase 2 security → Phase 3 data/secrets → Phase 4 operations → Phase 5 cleanup`

**Optional expansion sequence (STRATEGIC PROPOSAL):**
`stable core → theme/presentation enhancements → AI content assistance → client portal/services → organizations/matching → any wallet/payment concept`

**Do not violate:**
- Archive semantics before archive implementation.
- Identity semantics before authorization/DB changes.
- Canonical unread before read-state.
- Receiver validation before internal notifications.
- Inline-JS work before CSP tightening.
- Alembic baseline before schema changes.

---

## 12. Roadmap status at end of discovery

**VERIFIED FACT:** Discovery has produced evidence, an isolated runtime plan/harness, and documentation. It has **not** modified application source, templates, JS/CSS, schema, DB, production data, dependencies, deployments, or Git state.

**INFERENCE:** The product is ready for product-owner review and explicit approval of the next phase, not automatic remediation.

**Final roadmap verdict:** Stabilize and policy-align the existing proof-of-work portfolio product first. Treat wallet, premium, freelancer/business, marketplace, and AI expansion as STRATEGIC PROPOSALS until the owner approves their definition and sequencing.
