# 11 — AI Opportunity Assessment

**Discovery date:** 2026-11-19
**Scope:** Evaluate where AI could add value without distorting the reconstructed product. No AI feature was implemented, configured, or connected to live data.

---

## Evidence conventions

| Label | Meaning |
| --- | --- |
| VERIFIED FACT | Directly observed in source/templates/data or controlled runtime evidence. |
| DOCUMENTED INTENT | Stated in docs or product-facing copy. |
| OWNER-PROVIDED CONTEXT | Supplied by the product owner. |
| INFERENCE | Reasoned interpretation supported by evidence. |
| STRATEGIC PROPOSAL | Possible future direction only; not an existing capability. |
| UNKNOWN | Insufficient evidence. |

---

## 1. Assessment principles

**VERIFIED FACT:** The product's core value is proof-of-work presentation, verification, controlled privacy, direct inquiry, and anti-marketplace positioning (`README.md:5-9`; `templates/landing.html:296-324`; `templates/pages/about.html:25,55`; `templates/pages/terms.html:21,31,41`).

**INFERENCE:** AI must strengthen authentic presentation and reduce administrative friction. It must not fabricate proof, replace human verification, create paid exposure, or turn the platform into a social/marketplace/financial product.

**VERIFIED FACT:** Current data is split between `data.json` and SQLAlchemy with no transaction boundary (`app.py:411-468`; `AUDIT/FINAL_ASSESSMENT.md:44,57-59`). Any AI integration must avoid adding another unsynchronized store.

**VERIFIED FACT:** Notification credentials and local files are sensitive; external sends are not safe for discovery and were blocked in the isolated runtime (`AUDIT/FINAL_ASSESSMENT.md:245`; `AUDIT/05_INTEGRATIONS_AND_OPERATIONS.md`).

---

## 2. Opportunity matrix

Complexity scale: LOW / MEDIUM / HIGH. Data sensitivity: LOW / MEDIUM / HIGH.

| # | Opportunity (STRATEGIC PROPOSAL) | User problem | Expected value | Required data | Complexity | Privacy | Cost / dependencies | Classification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A1 | Professional profile drafting assistant | Members struggle to describe their work clearly; current fields are plain text with no guidance (`templates/dashboard/general.html`, `templates/index.html:120-162`). | Better first drafts for name/title/about/description while preserving user control. | Existing general/about text, skills, project titles/descriptions; no DB changes required for suggestions. | LOW-MEDIUM | MEDIUM — portfolio text may be public after save. | LLM API cost; optional feature flag; no external send. | Optional core assistant |
| A2 | Project evidence structuring | Project content is free-form (`app.py:2615-2699`, `templates/project_detail.html:121`). | Convert raw notes into problem/approach/result/technologies structure; improve proof clarity without inventing facts. | Project title, short description, content, technologies. | MEDIUM | MEDIUM | LLM cost; prompt must forbid fabrication; user review required. | Optional |
| A3 | Skills and service phrasing helper | Skills are simple name/level pairs; services are not first-class objects (`app.py:2569-2600`, `templates/index.html:335-342`). | Help members express capabilities in consistent professional language; does not create a service catalog. | Skill names/levels, about text, project list. | LOW | MEDIUM | LLM cost; template-only suggestions. | Optional |
| A4 | Inquiry summarization and triage for members | Public inquiries are DB+JSON messages with categories and notification attempts (`app.py:1656-1780`). | Summarize long inquiries, suggest client status/priority, draft reply text. | Inquiry message, contact fields, existing client records. | MEDIUM | HIGH — contains personal/contact data and business context. | LLM cost; must not auto-send; redaction policy required. | Optional, privacy-gated |
| A5 | Admin moderation/verification aid | Verification currently relies on admin workflow and flags (`app.py:737-846,2059-2156`); no verification evidence model exists. | Help reviewers check portfolio completeness, inconsistent claims, missing fields, and duplicate profiles. | Portfolio JSON fields, user metadata, public URLs. | MEDIUM-HIGH | HIGH — trust decisions; potential bias. | LLM cost; human decision mandatory; audit log required. | Optional with strict controls |
| A6 | Discovery/matching suggestions | Landing/catalog discovery is limited and verification-gated (`app.py:1461-1582`). | Suggest relevant profiles to project owners based on skills/projects/inquiry topics. Could be keyword-first before semantic AI. | Skills, projects, inquiry text, verification status. | HIGH | HIGH — profiling and fairness concerns; may drift toward marketplace/matching. | Vector/index infra or LLM; ranking policy; bias testing. | Excluded from initial scope; STRATEGIC PROPOSAL only |
| A7 | CV/PDF enhancement | PDF CV generation exists but native WeasyPrint deployment success is UNKNOWN (`app.py:3508-3548`). | Improve wording/ordering of generated CV; detect missing sections. | Portfolio data and CV template. | LOW-MEDIUM | MEDIUM | LLM cost; validate output; avoid invented credentials. | Optional after CV reliability confirmed |
| A8 | Translation/localization of public profile | Templates are English; owner context may imply broader professional use. | Let members preview translated versions of their own portfolio text. | Portfolio text, chosen target language. | MEDIUM | MEDIUM | LLM or translation API; preserve original as source of truth. | Optional, low priority |
| A9 | Administrative workflow assistant | Admin handles users, messages, backups, and notifications across many routes (`app.py:737-846,1883-1998,2780-3232`). | Natural-language internal commands for safe, reversible admin tasks. | Admin session context, route metadata, audit logs. | HIGH | HIGH — privileged actions. | Strong auth, confirmations, action allowlist, audit logging. | Excluded initially |
| A10 | Anomaly/abuse detection for inquiries and logins | Rate limiting/IP logging are documented but inconsistent; security gaps exist (`AUDIT/FINAL_ASSESSMENT.md:22-24,245`). | Flag suspicious patterns for human review. | IP log metadata, request metadata, message rates. | MEDIUM-HIGH | HIGH | Data retention rules; no automated blocking without review. | Optional after security baseline |

---

## 3. Recommended classification by product fit

### 3.1 Suitable as optional, user-controlled assistance

- **A1 Profile drafting**
- **A2 Project structuring**
- **A3 Skills/service phrasing**
- **A7 CV enhancement**

**INFERENCE:** These align with professional presentation and proof clarity. They operate on content the user already owns and can review before saving. They should be opt-in, never automatic, and must not alter persisted data without explicit user action.

### 3.2 Suitable only with privacy and human-review controls

- **A4 Inquiry triage**
- **A5 Verification aid**
- **A10 Abuse detection**

**INFERENCE:** These touch personal data or trust decisions. They require consent/notice, data minimization, human approval, audit trails, and a clear retention policy.

### 3.3 Excluded from initial scope

- **A6 Discovery/matching**
- **A9 Administrative workflow automation with side effects**

**INFERENCE:** A6 risks changing the product into a marketplace/matching engine that current copy explicitly rejects. A9 touches privileged operations and would amplify existing authorization weaknesses.

---

## 4. Data requirements and constraints

**VERIFIED FACT:** Available portfolio fields are name, title, description, about, photo, skills, projects, contact, social, settings/theme, visitors, and notification-related config in JSON (`app.py:411-468`; template sections in `templates/index.html`).

**VERIFIED FACT:** DB `Message` contains sender/receiver identity strings, category, content, timestamps, read/internal flags, and denormalized name/email (`models.py:70-84`).

**VERIFIED FACT:** No campaign, consent, provenance, embedding, model-output, or AI audit fields exist.

**INFERENCE:** AI features should not introduce a third persistent store without a deliberate architecture decision. Suggestions could be transient in the browser/session until the user explicitly saves the resulting text through existing routes.

**UNKNOWN:** Whether the owner wants any external AI provider, local model, budget range, or data-residency requirement.

---

## 5. Privacy, safety, and trust constraints

1. **No fabrication of proof** — AI must not invent projects, skills, credentials, client results, verification, or testimonials. This follows from the "Proof over Promise" philosophy (`README.md:6`; `templates/landing.html:296`).
2. **No auto-publish** — generated text must be reviewed and explicitly saved by the member through existing forms.
3. **No auto-send notifications or messages** — external sends are already risky and were blocked in discovery; AI must not trigger them.
4. **No member-to-member matching or messaging by default** — approved policy restricts communication to Members and Administration (`AUDIT/08:24-40`).
5. **No paid exposure/ranking** — conflicts with `templates/pages/about.html:55` and `templates/pages/terms.html:31`.
6. **Human verification remains authoritative** — AI may assist reviewers but cannot decide verified status.
7. **Data minimization** — send only the fields needed for the suggestion; avoid secrets, notification credentials, full IP logs, and unrelated user data.
8. **Auditability** — if AI assists admin review, record model, prompt version, input scope, output, and human decision in a durable log (future requirement only).
9. **No production data in discovery** — any future testing must use synthetic data and stubbed providers.

---

## 6. Integration complexity notes

**VERIFIED FACT:** The app has no service layer, no dependency injection, no test suite, no migrations, and no background-task queue (`AUDIT/FINAL_ASSESSMENT.md:43,57-59,104`). This increases the cost of integrating any external AI provider cleanly.

**INFERENCE:** The least invasive AI integration pattern would be:
1. no new DB models for the first phase;
2. optional UI action on existing forms;
3. transient suggestion returned to the browser;
4. user reviews/edits;
5. existing save route persists only the accepted text.

**STRATEGIC PROPOSAL:** A later phase could introduce a provider abstraction and audit log, but only after data ownership and authoritative-store decisions are settled.

---

## 7. Cost and operational dependencies

| Dependency | Classification | Note |
| --- | --- | --- |
| LLM/API provider | STRATEGIC PROPOSAL | UNKNOWN owner preference; cost, latency, data residency, and terms must be evaluated. |
| Prompt/version registry | STRATEGIC PROPOSAL | Needed for reproducibility if AI assists verification/admin workflows. |
| Output moderation | STRATEGIC PROPOSAL | Needed to prevent fabricated proof, offensive text, or prompt-injection effects from user content. |
| Rate limiting per user | STRATEGIC PROPOSAL | Must prevent abuse and runaway cost. |
| Synthetic test fixtures | STRATEGIC PROPOSAL | Already demonstrated as a safe testing pattern in `DISCOVERY/04_LIVE_TESTING_INFRASTRUCTURE.md`. |
| Provider outage fallback | STRATEGIC PROPOSAL | Existing form submission must work without AI. |

---

## 8. Phased opportunity view (not an implementation plan)

### Phase AI-0 — Foundations (before any AI)
- Stabilize repository baseline, tests, configuration, and synthetic-data harness.
- Decide data ownership/authoritative store.
- Define privacy policy for any external processing.

### Phase AI-1 — Low-risk content assistance
- A1 profile drafting, A2 project structuring, A3 skills phrasing.
- Opt-in only, transient suggestions, no auto-save.

### Phase AI-2 — Controlled operational assistance
- A4 inquiry triage, A7 CV enhancement.
- Stubbed providers in tests; no auto-send; user/admin confirmation.

### Phase AI-3 — Trust and safety assistance
- A5 verification aid, A10 abuse detection.
- Human review mandatory; audit log; bias and false-positive evaluation.

### Later / not recommended without owner decision
- A6 matching/discovery, A9 privileged admin automation.
- Any wallet/payment/financial AI feature.

**All phases are STRATEGIC PROPOSALS only and require explicit product-owner approval.**

---

## 9. Final assessment

**INFERENCE:** AI can add genuine value most safely as a **content-quality assistant for professional presentation**, because that aligns with the verified proof-of-work identity and does not require new business roles or financial concepts.

**INFERENCE:** AI becomes risky when it moves into ranking, matching, verification decisions, messaging, or payments. Those areas either conflict with the reconstructed identity or amplify verified technical and governance weaknesses.

**UNKNOWN:** Owner appetite for AI, budget, provider choice, and acceptable data-processing terms.

**No AI feature was implemented.** This document is an opportunity assessment only.
