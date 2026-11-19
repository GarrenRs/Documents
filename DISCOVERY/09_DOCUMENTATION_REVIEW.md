# 09 — Documentation Review

**Discovery date:** 2026-11-19
**Scope:** All existing project documentation, including the prior `AUDIT/` package, reconciled against source/template evidence and owner context. No historical document was deleted or rewritten; this is a new review package under `DISCOVERY/`.

---

## Evidence conventions

| Label | Meaning |
| --- | --- |
| VERIFIED FACT | Directly observed in a named file/line or confirmed by exhaustive search. |
| DOCUMENTED INTENT | Stated in prose docs or product-facing copy; not proof of implementation. |
| OWNER-PROVIDED CONTEXT | Supplied by the product owner. |
| INFERENCE | Reasoned interpretation supported by evidence. |
| STRATEGIC PROPOSAL | Possible future direction only. |
| UNKNOWN | Insufficient evidence. |

"Prior audit" below means claims recorded in `AUDIT/*.md` on 2026-11-19. Those claims are cited as source-evidenced prior findings; runtime behavior is separately tracked in `DISCOVERY/05_VISUAL_AND_RUNTIME_DISCOVERY.md`.

---

## 1. Documentation inventory

**VERIFIED FACT:** 15 Markdown files existed before this discovery package:
- `README.md`
- `replit.md`
- `audit_plan.md`
- `ux_overhaul_plan.md`
- `maintenance_strategy.md`
- `templates_analysis.md`
- `AUDIT/01_SYSTEM_BASELINE.md`
- `AUDIT/02_ARCHITECTURE_MAP.md`
- `AUDIT/03_FEATURE_LIFECYCLE.md`
- `AUDIT/04_DATABASE_AND_DATA_LIFECYCLE.md`
- `AUDIT/05_INTEGRATIONS_AND_OPERATIONS.md`
- `AUDIT/06_TECHNICAL_DEBT.md`
- `AUDIT/07_RECOMMENDED_ACTION_PLAN.md`
- `AUDIT/08_COMMUNICATION_BUSINESS_RULES.md`
- `AUDIT/FINAL_ASSESSMENT.md`

**VERIFIED FACT:** This discovery added 13 required documents under `DISCOVERY/`, plus supporting evidence logs and `DISCOVERY/testing/README.md`.

**VERIFIED FACT:** Two `.txt` files exist: `requirements.txt` and `static/robots.txt`.

**VERIFIED FACT:** `AUDIT.zip` contains the earlier eight AUDIT documents but not `AUDIT/08_COMMUNICATION_BUSINESS_RULES.md`. It is a compressed historical snapshot, not a current source of truth.

**VERIFIED FACT:** No `.git` directory and no Git CLI are available; repository identity, branch, commit, remote, and working-tree state are UNKNOWN.

---

## 2. Accuracy and current-value matrix

| Document | Classification | Current value | Main issue |
| --- | --- | --- | --- |
| `README.md` | DOCUMENTED INTENT, partly VERIFIED FACT | Still useful as original positioning summary | Claims "PostgreSQL" primary and "Legacy support" for `data.json`; inverse is closer to observed behavior. Claims security separation not implemented as described. |
| `replit.md` | DOCUMENTED INTENT, substantially unsupported | Best source of stated architecture intent | Overstates multi-tenancy, CSRF, security headers, workspace scoping, and "completed" architecture. |
| `audit_plan.md` | DOCUMENTED INTENT / stale status record | Historical plan | `audit_plan.md:30-38` marks fixes "تم" (done) although source lacks them. |
| `ux_overhaul_plan.md` | DOCUMENTED INTENT / stale plan | Historical UX proposals | `ux_overhaul_plan.md:10` asks to add `read_message`; route still absent. |
| `maintenance_strategy.md` | DOCUMENTED INTENT | General maintenance philosophy | Does not establish an executable test, migration, or release baseline. |
| `templates_analysis.md` | DOCUMENTED INTENT | Historical Arabic UX/template analysis | Describes hierarchy/UX gaps; predates or omits later verified breakages. |
| `AUDIT/01`–`AUDIT/07`, `AUDIT/FINAL_ASSESSMENT.md` | VERIFIED FACT where source-evidenced; DOCUMENTED INTENT for recommendations | Highest-value existing technical record | Read-only static audit; no runtime test was performed. Some claims need runtime correlation. |
| `AUDIT/08_COMMUNICATION_BUSINESS_RULES.md` | DOCUMENTED INTENT (approved policy) + VERIFIED FACT (source findings) | Mandatory communication policy and unresolved-decision register | Four archive semantics remain explicitly unapproved; no implementation choice is authorized. |
| `DISCOVERY/*` | Current discovery package | Intended current source of truth for this phase | Must be read together with `evidence/` artifacts; not a remediation authorization. |

---

## 3. Accurate and still-current documentation

**VERIFIED FACT:** The original product philosophy is consistently documented:
- `README.md:3-9` — premium professional portfolio, proof over promise, closed filtering, unmediated transparency, build in silence/show in public.
- `replit.md:5-7` — same Proof-of-Work philosophy; portfolio, clients, internal messaging; Admin/Demo/User roles.
- `templates/landing.html:296-324,499` — real work shown not sold; verified builders/service providers/project owners; explicitly not a marketplace/bidding platform/social network.
- `templates/pages/about.html:25-26,55` — not a marketplace/social network; build privately, show publicly, connect directly; no fees on your work.
- `templates/pages/terms.html:21,31,41` — private execution/public trust; no paid exposure; members responsible for client interactions.

**VERIFIED FACT:** The technical baseline in the prior audit remains consistent with the supplied source snapshot:
- `AUDIT/FINAL_ASSESSMENT.md:16-30` re-verified 72 routes, absent `login`/`read_message`/`dashboard_clear_chat`/`payment` endpoints, broken `/register`, missing documentation target, and other defects.
- `AUDIT/FINAL_ASSESSMENT.md:162-177` records the preserve list for behaviorally stable functionality.
- `AUDIT/08:20-54` records the approved communication rules: Members and Administration only; member↔admin flows; no member-to-member; archive instead of permanent deletion.

**INFERENCE:** The AUDIT package is the most trustworthy existing technical documentation because it explicitly separates source-verified findings from documentation claims and because it was independently re-checked before closure.

---

## 4. Outdated or unsupported documentation claims

### 4.1 Architecture and data

| Documentation claim | Contradicting evidence | Classification |
| --- | --- | --- |
| `README.md:13`: "Database: PostgreSQL"; `replit.md:21,25`: PostgreSQL primary with SQLite fallback; `replit.md:22-24`: all content workspace-scoped and JSONB columns used. | `data.json` is the de facto primary store; only `User`, `Workspace`, `Message` are used in the live data path; internal messages have NULL `workspace_id`; four models are unused. Evidence: `AUDIT/FINAL_ASSESSMENT.md:57-59,66`; `AUDIT/08:83`. | VERIFIED FACT (prior source evidence) vs DOCUMENTED INTENT |
| `replit.md:16`: "monolithic architecture with all routes defined in app.py" | This part is accurate: `app.py:24` creates the app directly and the module ends at line 3570. | VERIFIED FACT |
| `README.md:23`: `data.json` labelled "Legacy support" | It is the primary operational store for users, portfolios, settings, credentials, and visitor state. Evidence: `AUDIT/FINAL_ASSESSMENT.md:57-59`. | VERIFIED FACT contradiction |

### 4.2 Security and completeness

| Documentation claim | Contradicting evidence | Classification |
| --- | --- | --- |
| `replit.md:45-51`: CSP, X-Frame-Options, HSTS, X-Content-Type-Options, input sanitization, rate limiting, "CSRF Protection" | Prior audit found no CSRF tokens, permissive CSP, absent X-Frame-Options, and unsupported completion claims: `AUDIT/FINAL_ASSESSMENT.md:22-24,43-46,66`. `config.py:10` sets `SESSION_COOKIE_SECURE=False`. | VERIFIED FACT contradiction |
| `audit_plan.md:30-38`: all fixes marked done | Source lacks the claimed fixes; `AUDIT/FINAL_ASSESSMENT.md:158`. | VERIFIED FACT contradiction |
| `replit.md:39`: "7-day session lifetime with secure cookie settings" | Lifetime is configured at `config.py:9`, but `SESSION_COOKIE_SECURE=False` at `config.py:10`; production secret has a hard-coded fallback at `config.py:8`. | VERIFIED FACT with DOCUMENTED INTENT tension |
| `ux_overhaul_plan.md:10`: "Add `read_message` route in `app.py`" | No such endpoint exists. `AUDIT/FINAL_ASSESSMENT.md:17,116,134`. | VERIFIED ABSENCE |
| `templates_analysis.md:28,41`: notification counter/chat liveness concerns | Prior audit found inconsistent counter logic and deprecated chat: `AUDIT/FINAL_ASSESSMENT.md:117-123,154`. | VERIFIED FACT (prior source evidence) |

### 4.3 Product/monetization

| Documentation/artifact claim | Contradicting evidence | Classification |
| --- | --- | --- |
| `templates/dashboard/subscription.html:377-426`: paid plans Free/$0, Professional/$9.99, Business/$24.99 | No `payment` endpoint; no route renders the template; `AUDIT/FINAL_ASSESSMENT.md:17,154`. | VERIFIED ABSENCE / dead code |
| Paid plans | `templates/pages/about.html:55` "No fees on your work"; `templates/pages/terms.html:31` no paid exposure. | DOCUMENTED INTENT contradiction |
| `README.md:3`, `replit.md:5` "premium" | No premium tier; "premium" is aesthetic/CSS language (`static/themes/luxury-gold.css:2`, `static/css/style.css:234-252`) and the only "Silver" is a CSS theme (`static/themes/silver-grey.css`). | VERIFIED FACT |

---

## 5. Repeated, fragmented, or conflicting documentation

**VERIFIED FACT:** Product identity is repeated across `README.md`, `replit.md`, `templates/landing.html`, `templates/pages/about.html`, and `templates/pages/terms.html`. The repetition is mostly consistent around proof-of-work and anti-marketplace positioning.

**VERIFIED FACT:** Technical status is fragmented and contradictory:
- `README.md` and `replit.md` describe an intended production architecture.
- `audit_plan.md` and `ux_overhaul_plan.md` describe planned/completed work.
- `AUDIT/` records source-verified defects and a phased remediation plan.
- `AUDIT/08` adds a mandatory business policy that overrides legacy code inference.
- `DISCOVERY/` now adds runtime/live-browser evidence and strategy reconstruction.

**INFERENCE:** The correct reconciliation order is: owner-approved policy > source/runtime evidence > prior audit source findings > product-facing copy > aspirational docs. This order is an evidence-handling rule for discovery, not a product decision.

---

## 6. Historical information that must be preserved

**VERIFIED FACT / DOCUMENTED INTENT:** The following should be preserved as historical evidence and not silently rewritten or deleted:
1. Original proof-of-work philosophy — `README.md:5-9`, `replit.md:5`.
2. Explicit anti-marketplace/anti-social-network positioning — `templates/landing.html:319-324`, `templates/pages/about.html:25`, `templates/pages/terms.html:31`.
3. Six-theme system, including Silver Grey — `app.py:2251-2257,2267-2297`, `static/themes/*.css`, `templates/dashboard/settings.html:330-366`.
4. Existing URLs, flash strings, template hierarchy, and UI behavior — preserve list in `AUDIT/FINAL_ASSESSMENT.md:162-177`.
5. Approved communication policy — `AUDIT/08:20-54`.
6. Unresolved archive semantics — `AUDIT/08:230-263`.
7. Dead subscription mockup as evidence of a possible later monetization overlay — `templates/dashboard/subscription.html:377-477`.
8. All prior AUDIT files, including claims later proven unsupported; they document what was previously believed.

---

## 7. Unsupported "wallet/Silver/premium" documentation claims

**VERIFIED FACT:** No documentation file contains "wallet"; exhaustive case-insensitive search returned zero matches.

**VERIFIED FACT:** "Silver" occurrences are exclusively the `silver-grey` theme:
- `app.py:2253,2293-2297`
- `static/themes/silver-grey.css:1-37`
- `templates/dashboard/settings.html:363-364,637-638`

**VERIFIED FACT:** "Premium" occurrences are aesthetic or planning language:
- `README.md:3`, `replit.md:5` (positioning)
- `static/themes/luxury-gold.css:2`, `static/css/style.css:234-252`, `templates/index.html:13,472`, `templates/dashboard/settings.html:319,389,607` (style/copy)
- `ux_overhaul_plan.md:4` (CSS-class plan)

**OWNER-PROVIDED CONTEXT:** The owner described wallet templates, Silver-style templates, and premium presentation. This is recorded but not supported by repository evidence.

**UNKNOWN:** Whether an external design document, discarded prototype, or oral history contained those concepts.

---

## 8. Documentation cleanup observations (no changes made)

**STRATEGIC PROPOSAL — not performed:** Future documentation work should:
1. Keep `README.md`/`replit.md` as historical intent documents or clearly mark aspirational statements.
2. Add a current technical truth document that points to this discovery package and the AUDIT package.
3. Reconcile `audit_plan.md` status labels with actual source state only after fixes are implemented.
4. Preserve `AUDIT/08` policy and its unresolved questions verbatim until the owner decides archive semantics.
5. Avoid deleting unreferenced templates until external deep links are ruled out, per `AUDIT/FINAL_ASSESSMENT.md:229` and `AUDIT/06_TECHNICAL_DEBT.md:121`.
6. Record dependency installation failures and runtime limitations from `DISCOVERY/03_ENVIRONMENT_AND_RUNTIME.md`.

---

## 9. Reconciliation with runtime evidence

This document intentionally distinguishes static/documented claims from behavior. Runtime and live-browser findings are recorded separately in:
- `DISCOVERY/03_ENVIRONMENT_AND_RUNTIME.md` — install, launch, isolation, logs.
- `DISCOVERY/04_LIVE_TESTING_INFRASTRUCTURE.md` — Playwright setup and harness.
- `DISCOVERY/05_VISUAL_AND_RUNTIME_DISCOVERY.md` — observed UI, console, network, and persistence effects.

Where runtime evidence disagrees with documentation, `05_VISUAL_AND_RUNTIME_DISCOVERY.md` is the controlling observation for this discovery package; no source or documentation was changed to force agreement.

---

## 10. Summary verdict

**VERIFIED FACT:** Existing documentation is valuable but layered: product philosophy is broadly accurate, technical architecture/security claims are substantially overstated, and completion-status documents are stale.

**INFERENCE:** The AUDIT package plus this DISCOVERY package form the most reliable current evidence base. Historical documents should be retained, labelled by intent, and not silently rewritten.

**UNKNOWN:** Deployment-time environment, production database state, external deep links, and any external wallet/Silver specification remain unresolved.
