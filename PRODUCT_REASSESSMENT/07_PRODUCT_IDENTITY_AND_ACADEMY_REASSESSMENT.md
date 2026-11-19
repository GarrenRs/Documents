# 07 — Product identity and Academy reassessment

**Assessment date:** 2026-11-20.
**Mode:** Read-only product reassessment. No source, content, configuration, data, schema, or deployment change was made.
**Purpose:** Reconcile the owner-clarified Academy/ANAE vision with the current implementation and with prior `AUDIT/`, `DISCOVERY/`, and `PRODUCT_RECONSTRUCTION/` conclusions.

---

## Evidence conventions

| Label | Meaning |
| --- | --- |
| `VERIFIED FACT` | Directly observed in source, templates, data, documentation, or controlled runtime/browser evidence. |
| `OWNER-PROVIDED CONTEXT` | Supplied by the product owner; not independently verified as an implementation fact. |
| `DOCUMENTED INTENT` | Explicitly stated in existing documentation or product-facing copy. |
| `INFERENCE` | Reasoned interpretation supported by evidence. |
| `STRATEGIC PROPOSAL` | Possible future direction only; not an existing capability. |
| `UNKNOWN` | Insufficient evidence. |

---

## 1. Owner vision is the current product brief

`OWNER-PROVIDED CONTEXT:` Codexx Academy is intended to be a **professional digital work environment for Algerian ANAE self-employed digital professionals**. It comprises four interfaces:

1. Public Academy landing page.
2. Administration Dashboard.
3. Member Dashboard / Private Workspace.
4. Public Professional Wallet.

`OWNER-PROVIDED CONTEXT:` The environment should connect to external platforms, support Arabic/English readiness, and include future QR identity cards.

`OWNER-PROVIDED CONTEXT:` This vision supersedes the narrower prior framing centred on a paid customer-owned digital wallet.

`STRATEGIC PROPOSAL:` Use the four-interface model as the stable product map. Reinterpret “wallet” as **professional identity/portfolio presentation**, never as a financial wallet.

---

## 2. What the current product actually is

`VERIFIED FACT:` The current product is a single-module Flask proof-of-work portfolio application with:
- public landing/informational pages;
- public professional profiles and project-detail pages;
- private per-member editing of identity, proposition, skills, projects, social links, contact information, clients, and theme;
- structured public inquiries;
- member↔administration internal messaging;
- admin user management, settings, backups, and standards pages;
- Telegram/SMTP notification code;
- six CSS themes;
- no wallet, ledger, payout, FX, or payment concept.

`VERIFIED FACT:` Public copy states the product is not a freelance marketplace, bidding platform, or social network. About-page copy describes `Private Execution, Public Trust` and `Build Privately, Show Publicly, Connect Directly`.

`VERIFIED FACT:` The strongest verified end-to-end loop is `private profile/project edit → public profile reflection → structured inquiry → admin/member inbox`.

`INFERENCE:` The current implementation is a **proof-of-work professional presentation and inquiry system with a prototype workspace**. It is not yet the owner’s Academy/ANAE environment, but it contains reusable primitives for it.

---

## 3. What the current product is not

`VERIFIED FACT:` Each negative finding below is evidence-backed:

| Misclassification | Why it is not supported |
| --- | --- |
| Generic portfolio builder only | The product also has admin governance, private workspace, inquiry taxonomy, messaging, themes, backups, and notification paths. |
| Generic CRM | Client records exist, but the product’s defining public/private proof-of-work loop, verification language, and inquiry model are not a sales CRM; prior reconstruction also rejected general CRM/pipelining. |
| Generic course platform / LMS | No course, lesson, enrollment, progress, certificate, or academy-content administration was found. |
| Automation tool | Telegram/SMTP helpers exist, but there is no workflow builder, queue, retry, or connector framework. |
| Marketplace / bidding platform | Explicit product copy rejects this, and no catalog service/bidding model exists. |
| Social network | Explicit product copy rejects this; internal messaging is limited synthetic-member/admin threading, not a social graph. |
| Financial wallet | No balance, ledger, payout, invoice, payment address, or FX concept exists. |
| ANAE-verified platform | No ANAE status, activity-code, QR, directory, or endorsement integration exists. |
| Arabic/RTL-ready product | No `lang="ar"`, `dir="rtl"`, or Arabic UI strings found in application source/templates. |

`DOCUMENTED INTENT:` “Academy” currently functions mainly as a trust/standards brand and informational content layer, not as an operating Academy.

---

## 4. Academy reassessment

### 4.1 Verified Academy surface

`VERIFIED FACT:` Public informational routes render: `/about`, `/verification`, `/standards`, `/mastery`, `/security-audit`, `/privacy`, `/terms`, plus guides for Telegram token/chat ID.

`VERIFIED FACT:` `/` contains a `Contact the Academy` form with action `/contact/academy` (POST-only).

`VERIFIED FACT:` `/dashboard/access-instructions` shows `Academy Standards & Terms`, full-access criteria, demo-mode default, and PoW badge review language.

`VERIFIED FACT:` Admin UI search found no controls for `announcement`, `announce`, `course`, `lesson`, `academy content`, or `broadcast`.

`VERIFIED FACT:` No course/enrollment/lesson/progress/certificate model was found in source, templates, or live UI.

`INFERENCE:` Academy is currently a **positioning and standards layer**. There is no evidence of an Academy operating model.

### 4.2 What Academy could mean without becoming a generic LMS

`STRATEGIC PROPOSAL:` Keep Academy distinct from a conventional LMS. In this product, Academy should mean enablement around professional digital work: standards, evidence quality, profile/project guidance, verification expectations, and governed communication.

`STRATEGIC PROPOSAL:` Possible Academy scope, pending owner decision:
1. public standards and guidance;
2. member-facing enablement resources;
3. admin-published announcements;
4. review rubric for professional evidence;
5. bilingual terminology and Arabic/RTL review;
6. optional external-platform guidance;
7. regulatory-link library using official sources only.

`UNKNOWN:` Whether the owner intends actual courses, lessons, enrollment, progress tracking, or certificates. Do not assume an LMS requirement.

---

## 5. Four-interface identity fit

| Interface | Verified current role | Fit with owner vision | Principal gaps |
| --- | --- | --- | --- |
| Public Academy landing page | Positioning, standards, information pages, contact form, portfolio gallery messaging. | Good conceptual fit; weakest operational depth. | Catalog placeholder, broken documentation link, no Academy content operations, no ANAE vocabulary, no Arabic/RTL. |
| Administration Dashboard | User directory, verification/demo toggles, settings, backups, inbox, access standards. | Partial fit as governance console. | No Academy publishing, no ANAE evidence review, no QR-card administration, no announcement/broadcast controls, backup access concerns from prior audit. |
| Member Dashboard / Private Workspace | Identity, proposition, skills, projects, contact, social, clients, messages, settings, themes. | Strong fit as private execution surface. | General CRM language, unsafe internal messaging model, no ANAE self-declaration/evidence states, no learning/enablement workspace, no Arabic/RTL. |
| Public Professional Wallet | Public identity, skills, case studies, inquiry CTA, CV preview. | Strong conceptual fit if interpreted as professional identity wallet. | Null SEO metadata, project-detail JS error, mobile overflow, no QR identity card, no ANAE proof display, no bilingual/RTL. |

`INFERENCE:` The four-interface structure should be retained. The product work is to deepen and govern each interface, not collapse them into one another.

---

## 6. Reconciliation with prior work

### 6.1 AUDIT package

`VERIFIED FACT:` `AUDIT/` (2026-11-19) established source-level baseline facts: 3,570-line `app.py`, 72 routes, no Blueprints/factory/services/tests/migrations, dual JSON+SQL persistence, no CSRF, permissive CSP, insecure cookie/debug defaults, duplicated notification senders, messaging policy gaps, and broken routes.

`VERIFIED FACT:` These findings remain broadly valid for the current snapshot; the fresh reassessment re-confirmed key items including `/register` 500, `/documentation` 404, dual-write inquiry behaviour, theme persistence, demo writes, notification delivery not proven, and archive misbehaviour.

`INFERENCE:` AUDIT remains valid as technical evidence, but its recommendation to preserve-and-patch was written for a free proof-of-work portfolio, not the current ANAE/Academy mandate.

### 6.2 DISCOVERY package

`VERIFIED FACT:` `DISCOVERY/` (2026-11-19) correctly identified the product as a proof-of-work portfolio system, rejected unsupported wallet/Silver/premium feature claims, and produced isolated live evidence: 23/23 cases, 27 screenshots, inquiry dual write, theme persistence, demo writes, false archive success, and no external delivery proof.

`VERIFIED FACT:` The current reassessment expands that live baseline to 35 cases and 67 screenshots with stricter post-preloader captures.

`INFERENCE:` DISCOVERY’s product-identity findings remain valid. Its “do not rewrite” recommendation was conditional on the old mandate; the new vision requires reconsideration of product scope rather than automatic rejection of its technical caution.

### 6.3 PRODUCT_RECONSTRUCTION package

`VERIFIED FACT:` `PRODUCT_RECONSTRUCTION/` adopted **Option A′: server-rendered Flask modular monolith**, single relational database, Alembic, no React SPA, no public REST API in v1, one web pool plus one worker, CSRF, tenant-safe authorization, entitlement boundary, and removal of unsafe messaging/demo/dead paths.

`VERIFIED FACT:` That decision was justified by a then-current paid, customer-owned product mandate and explicitly required owner approval; it was not implemented.

`INFERENCE:` The **technical substrate** of Option A′ remains a strong fit for the new vision: SSR public content, form/table workspace operations, one deployment, one database, and no need for React/microservices.

`INFERENCE:` The **product definition** of Option A′ is incomplete or superseded where it defines Codexx only as a paid customer-owned professional wallet with Base/Starter/Professional packaging. The owner’s new brief adds ANAE targeting, Academy/enablement, Arabic/English readiness, future QR identity cards, and external platform connections.

`STRATEGIC PROPOSAL:` Reaffirm Option A′ as a technical direction **subject to re-scoping** around the four-interface ANAE environment. Reopen product-scope, content, locale, verification, QR, connector, and communication decisions rather than blindly reusing the prior remove/preserve list.

| Prior conclusion | Current status | Reason |
| --- | --- | --- |
| Source baseline and technical debt | Valid | Re-confirmed by fresh source/runtime evidence. |
| Live portfolio/inquiry/messaging behaviour | Valid | Re-confirmed and expanded. |
| No wallet/premium implementation | Valid | Still no financial wallet; “Silver” is a theme. |
| Preserve-and-patch recommendation | Historically valid, incomplete now | Written for old mandate; new scope changes the decision context. |
| Option A′ SSR Flask monolith substrate | Conditionally valid | Still simplest architecture; must be product-re-scoped. |
| Paid customer-owned wallet as sole product definition | Superseded / requires owner confirmation | Owner now defines an ANAE professional work environment. |
| Remove all internal messaging, replace with one-way announcements | Open decision | Existing threads are defective; owner has not defined the target communication model under the new vision. |
| Arabic/RTL as v1 requirement | Reaffirmed as needed | Owner vision explicitly includes it; source has zero support. |
| No financial wallet | Reaffirmed | Regulatory and source evidence support this boundary. |

---

## 7. Product identity statement for owner approval

`STRATEGIC PROPOSAL:` Adopt the following working definition:

> Codexx Academy is a professional digital work environment for Algerian ANAE self-employed digital professionals. It combines a public Academy trust layer, governed administration, a private professional workspace, and a public professional identity/portfolio wallet. Its value is verified proof of work, structured inquiry, professional enablement, bilingual readiness, and governed connections to external platforms. It is not a financial wallet, marketplace, bidding platform, social network, generic CRM, LMS, or automation tool.

`VERIFIED FACT:` This statement is a proposal. It is not an existing implementation fact.

---

## 8. Decisions required before any next phase

1. Approve or amend the working identity statement above.
2. Confirm whether Academy means standards/enablement only or includes courses/lessons/progress/certificates.
3. Confirm the ANAE verification policy and evidence standard.
4. Confirm whether QR identity cards are near-term scope or future discovery.
5. Confirm Arabic/English content ownership and RTL review responsibility.
6. Confirm the external platforms to be connected and their compliance review.
7. Decide the target communication model: governed announcements, inquiry-only, or a strictly scoped professional channel.
8. Reaffirm or revise the Option A′ technical substrate under the new product definition.
9. Confirm that no financial wallet, payout, FX, or crypto features are in scope.
10. Approve any future phase explicitly; this document does not authorize implementation.

**Status:** Product identity and Academy reassessment complete for owner review. No implementation performed; no prior history overwritten; no push requested.
