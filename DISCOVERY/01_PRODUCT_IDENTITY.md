# 01 — Product Identity

**Discovery date:** 2026-11-19
**Workspace:** `D:\Codexx-Academy-F-VV-main`
**Scope:** Reconstruct what Codexx Academy actually is from source, data, interfaces, runtime design, documentation, and owner context. This document does **not** propose changes.

> **Precedence rule:** The owner's wallet/Silver/premium/freelancer context is recorded as OWNER-PROVIDED CONTEXT. It is not converted into a verified implementation fact. Where source and documentation disagree, both are recorded.

---

## Evidence conventions

| Label | Use in this document |
| --- | --- |
| VERIFIED FACT | Directly observed in source, template, data, or controlled runtime evidence, with a file/line reference. |
| DOCUMENTED INTENT | Explicitly stated in existing prose documentation or product-facing copy; not proof of implementation. |
| OWNER-PROVIDED CONTEXT | Supplied by the product owner in the discovery brief. |
| INFERENCE | Reasoned interpretation supported by cited evidence. |
| STRATEGIC PROPOSAL | Possible future direction only; not an existing capability. |
| UNKNOWN | Insufficient evidence in the supplied snapshot. |

---

## 1. Executive identity statement

**VERIFIED FACT:** Codexx Academy is a **single-module Flask web application** that implements a **proof-of-work professional portfolio platform** with private per-member portfolio editing, public portfolio presentation, project detail pages, a verified-member directory, an inquiry/contact subsystem, private CRM-style client records, admin user management, six selectable CSS color themes, dual persistence (`data.json` plus SQLAlchemy), and member↔administration internal messaging. Evidence: `app.py:24` (Flask app created directly), `app.py:3570` (single module ends), `models.py:20-91` (seven SQLAlchemy models), `templates/index.html:76-444` (public profile sections), `app.py:2238-2328` (theme selection), `app.py:2862-2992` (internal messaging), `AUDIT/FINAL_ASSESSMENT.md:52-66` (prior independent classification).

**VERIFIED FACT:** The product is explicitly positioned in its own public copy as **not** a marketplace, freelance marketplace, bidding platform, social network, or paid-exposure service. Evidence: `templates/landing.html:319-324` ("Not a freelance marketplace", "Not bidding platform", "Not a social network"), `templates/pages/about.html:25` ("not a marketplace, nor is it a social network"), `templates/pages/terms.html:31` ("not a marketplace ... do not sell rankings or paid exposure").

**VERIFIED FACT:** The term **"wallet" has zero occurrences** in the entire supplied repository, including source, templates, static assets, data, and all documentation. Therefore there is no implemented financial/digital wallet, wallet data model, wallet UI, wallet route, or wallet terminology. Classified as an absence-based VERIFIED FACT from exhaustive search; also reported by the documentation-vision research stream and the presentation inventory.

**INFERENCE:** The strongest evidence-supported identity is a **verified professional presentation and direct-contact system**: members build a public proof-of-work portfolio; verified portfolios are surfaced through a landing gallery and people directory; project owners/clients can inspect work and submit structured inquiries; members track clients privately; administration vets users and communicates with members. This is supported by `templates/landing.html:296-299,431,499`, `templates/catalog.html:6-8,91-161`, `templates/index.html:284-444`, `app.py:1542-1582`, `app.py:1656-1780`, and `app.py:3235-3438`.

**UNKNOWN:** Whether a wallet concept, paid Silver tier, premium template product, or "ahead of its time" positioning existed outside this repository. No supporting string or artifact was found in the supplied snapshot.

---

## 2. Original vision versus verified implementation

### 2.1 Documented / product-facing original vision

**DOCUMENTED INTENT:** `README.md:1-9` defines Codexx Academy as an "Elite Proof-of-Work Ecosystem" and a "premium professional portfolio platform designed for high-caliber professionals" with "Proof over Promise", "Closed Filtering", "Unmediated Transparency", and "Build in Silence, Show in Public".

**DOCUMENTED INTENT:** `replit.md:5-7` describes a "premium professional portfolio platform", a "Proof-of-Work" philosophy, multi-tenant workspaces, portfolio showcase, client management, internal messaging, Admin/Demo/User roles, dual-channel notifications, and a themeable frontend.

**VERIFIED FACT:** The public-facing copy repeats the same philosophy in live templates:
- `templates/landing.html:296-299` — "Where Real Work Is Shown, Not Sold"; "verified builders, service providers, and project owners present real portfolios backed by actual work".
- `templates/pages/about.html:25-26` — "not a marketplace, nor is it a social network"; "Build Privately, Show Publicly, Connect Directly".
- `templates/pages/terms.html:21,31,41` — "Private Execution, Public Trust"; no rankings or paid exposure; members responsible for their own client interactions.
- `templates/catalog.html:6-8,94,138` — "Professional Directory | Codexx Academy Verified Talent"; project owners; academy member badges.

**INFERENCE:** The documented/product-facing vision is internally consistent around **verification, proof of work, private execution, public presentation, and direct professional contact**. It is not internally consistent around enterprise multi-tenancy, security completeness, or monetization; see §5.

### 2.2 What is actually implemented

| Capability | Classification | Evidence |
| --- | --- | --- |
| Public single-page portfolio with hero, about, skills, projects, contact, social links, photo, verified badge | VERIFIED FACT | `templates/index.html:76-113,120-162,169-200,207-267,284-444,459-469` |
| Project detail pages with content, metadata, related projects | VERIFIED FACT | `templates/project_detail.html:97-188`; route at `app.py:1783-1800` |
| Private per-user portfolio editing: general, about, skills, projects, clients, social, contact, theme | VERIFIED FACT | `app.py:2524-2774,3235-3438`; `templates/dashboard/general.html:14` |
| Six CSS-variable color themes selected per user and stored in JSON settings | VERIFIED FACT | `app.py:2238-2328`; `static/themes/*.css`; `templates/dashboard/settings.html:44-89,330-366,600-662` |
| Landing gallery and verified-only people directory | VERIFIED FACT | `app.py:1461-1491,1542-1582`; `templates/landing.html:356-385`; `templates/catalog.html:91-161` |
| Contact form writing to DB and JSON, with Telegram/SMTP dispatch attempts | VERIFIED FACT | `app.py:1656-1780`; prior audit `AUDIT/FINAL_ASSESSMENT.md:135,139` |
| Private CRM-style client records with price, deadline, status | VERIFIED FACT | `templates/dashboard/clients.html:6-14,17-61`; `templates/dashboard/add_client.html:59-77`; `app.py:3235-3438` |
| Admin user list/add/verify and role flags | VERIFIED FACT | `app.py:737-846,2059-2156` |
| Member→administration internal message threads, replies, and polling notifications | VERIFIED FACT with major caveats | `app.py:2862-3035,1272-1359,1090-1154`; caveats at `AUDIT/08_COMMUNICATION_BUSINESS_RULES.md:60-170` |
| PDF CV preview/download | VERIFIED FACT with deployment uncertainty | `app.py:3508-3548`; native WeasyPrint dependency success UNKNOWN per `AUDIT/FINAL_ASSESSMENT.md:102,230` |
| Registration | BROKEN / VERIFIED FACT | `app.py:725-730` calls missing `url_for('login')`; confirmed in `AUDIT/FINAL_ASSESSMENT.md:16-18` |
| `/documentation` help route | BROKEN / VERIFIED FACT | target file absent; `AUDIT/FINAL_ASSESSMENT.md:20,150` |
| Financial wallet, balance, ledger, payout, checkout, invoice | VERIFIED ABSENCE | exhaustive repository search; no route/model/template/asset found |
| Admin-initiated internal conversation through a working UI | VERIFIED ABSENCE in current implementation | compose hidden for admins at `templates/dashboard/internal_messages.html:16-20`; unreferenced `user_profile.html`; `AUDIT/08:120-122,174-179` |

---

## 3. Owner-provided context reconciliation

| Owner-provided concept | Classification | Repository evidence | Discovery conclusion |
| --- | --- | --- | --- |
| Advanced digital wallet | OWNER-PROVIDED CONTEXT | Zero "wallet" occurrences; no balance, ledger, payout, or payment model/route/template. | Not present. Could only be a STRATEGIC PROPOSAL or external historical idea; no repository evidence. |
| Distinctive premium wallet templates, including Silver-style templates | OWNER-PROVIDED CONTEXT | `static/themes/silver-grey.css:1-37`; `app.py:2253,2293-2297`; `templates/dashboard/settings.html:358-366,637-643`. "Premium" appears as marketing/CSS wording, e.g. `static/themes/luxury-gold.css:2`, `static/css/style.css:234-252`, `templates/index.html:13,472`. | Silver is a **color theme**, not a product tier. Premium is an adjective/CSS prefix, not a paid plan. Six themes exist; no premium template tier exists. |
| Professional identity and presentation | OWNER-PROVIDED CONTEXT + VERIFIED FACT | `templates/dashboard/general.html:14,91`; `templates/catalog.html:94`; `templates/pages/mastery.html:35`; `templates/index.html:76-267`. | Strongly supported. This is the most direct overlap between owner context and implementation. |
| Freelancers, project owners, businesses, digital service providers | OWNER-PROVIDED CONTEXT | "project owners" appears at `templates/landing.html:298,431,499` and `templates/catalog.html:7`; "service providers" at `landing.html:298`; "digital service" has zero occurrences; "freelancer" noun has zero occurrences; "Not a freelance marketplace" at `landing.html:321`. | Partially supported only for builders/service providers/project owners language. "Freelancer", "business user", and "digital service provider" are not implemented identities. |
| Interaction and potential business relationships between groups | OWNER-PROVIDED CONTEXT | Structured inquiry form at `templates/index.html:306-411`; private client CRM at `templates/dashboard/clients.html`; member↔admin messaging at `app.py:2862-2992`. Direct member-to-member messaging is forbidden by approved policy at `AUDIT/08:24-40`. | Supported as inquiry/CRM and admin-mediated communication only. Not a general business relationship network. |
| Platform ahead of its time | OWNER-PROVIDED CONTEXT | "ahead of its time" has zero occurrences; no dated product roadmap beyond 2026 copyright/subscription mockup text. | UNKNOWN; cannot be verified from this snapshot. |

---

## 4. What "Wallet" means in this system

**VERIFIED FACT:** The word "wallet" is absent from the repository. The closest user-facing object is a per-user portfolio stored under `data.json → portfolios[username]` and rendered by `templates/index.html`. Evidence: `app.py:411-468` (`load_data`/`save_data` per-user branch), `app.py:473-504` (public portfolio route), `templates/index.html:2,36,76-444`.

**VERIFIED FACT:** The portfolio contains presentational and proof data — name, title, description, about, photo, skills, projects, contact, social, settings/theme, visitor stats — not financial data. Evidence: `templates/index.html:76-113,120-162,169-200,207-267,284-444,459-469`; synthetic structure mirrored in `C:\Users\infor\AppData\Local\Temp\opencode\discovery-workspace\make_synthetic_data.py` (isolated tooling only).

**VERIFIED FACT:** The six themes are `luxury-gold`, `modern-dark`, `clean-light`, `terracotta-red`, `vibrant-green`, and `silver-grey`, implemented as CSS custom-property files and selectable in dashboard settings. Evidence: `app.py:2251-2257,2267-2297`; `static/themes/*.css`; `templates/dashboard/settings.html:330-366`.

**INFERENCE:** The owner's "wallet" language may describe an intended product metaphor that was never implemented in this repository, or a later reinterpretation of the portfolio presentation surface. Both are plausible but unverified. This must remain OWNER-PROVIDED CONTEXT until the owner supplies an external specification or approves a future strategy.

---

## 5. Contradictions and positioning tensions

### 5.1 Documentation overstates architecture and security

**VERIFIED FACT / DOCUMENTED INTENT contradiction:** `replit.md:20-25` claims a PostgreSQL-primary, workspace-scoped multi-tenant architecture with JSONB columns and content scoped to workspaces. The prior audit found that only `User`, `Workspace`, and `Message` are used in the live data path and that `data.json` is the de facto primary store: `AUDIT/FINAL_ASSESSMENT.md:57-59,66`; `AUDIT/08:83` (internal messages have NULL `workspace_id`).

**VERIFIED FACT / DOCUMENTED INTENT contradiction:** `replit.md:45-51` claims CSP, X-Frame-Options, HSTS, X-Content-Type-Options, input sanitization, rate limiting, and CSRF protection. Prior audit found no CSRF tokens, permissive CSP, absent X-Frame-Options, and duplicate/unsupported headers: `AUDIT/FINAL_ASSESSMENT.md:22-24,43-46,66`. Current source also sets `SESSION_COOKIE_SECURE = False` at `config.py:10` and `app.py:93`.

**VERIFIED FACT:** `audit_plan.md:30-38` marks security fixes as completed ("تم"), but `AUDIT/FINAL_ASSESSMENT.md:158` records these as unsupported by code. The documentation is therefore not a reliable completion record.

### 5.2 Monetization tension

**VERIFIED FACT:** `templates/dashboard/subscription.html:377-426` contains Free/$0, Professional/$9.99, and Business/$24.99 plan cards, and `templates/dashboard/subscription.html:408,425` calls `url_for('payment', ...)`. No `payment` endpoint exists and no route renders this template (`AUDIT/FINAL_ASSESSMENT.md:17,154`; presentation inventory). This is a dead or abandoned mockup.

**DOCUMENTED INTENT contradiction:** Paid exposure conflicts with `templates/pages/about.html:55` ("No fees on your work") and `templates/pages/terms.html:31` ("We do not sell rankings or paid exposure"). No live paid tier exists.

**INFERENCE:** The subscription mockup is a later overlay, not part of the verified original identity. It should be preserved as historical evidence but not treated as current product behavior.

### 5.3 Premium/Silver tension

**VERIFIED FACT:** "Premium" is used as aesthetic/positioning language (`README.md:3`, `replit.md:5`, `static/themes/luxury-gold.css:2`, `static/css/style.css:234-252`) and "Silver" is one of six color themes (`static/themes/silver-grey.css`). No paid tier or premium template is implemented.

**INFERENCE:** There is a positioning tension between "premium" presentation language and the anti-paid-exposure philosophy, but not a functional contradiction because no payment feature is live.

---

## 6. Strongest verified capabilities

1. **Public proof-of-work portfolio presentation** — single-page profile, project detail pages, skills, contact form, social links, photo, verified badge (`templates/index.html`, `templates/project_detail.html`).
2. **Per-user private portfolio editing** — general/about/skills/projects/clients/social/contact/theme JSON CRUD (`app.py:2524-2774,3235-3438`).
3. **Six-theme presentation system** — durable per-user theme selection with CSS custom properties (`app.py:2238-2328`; `static/themes/*.css`).
4. **Verified-member discovery** — landing gallery and people directory with verification filtering (`app.py:1461-1491,1542-1582`; `templates/landing.html:356-385`; `templates/catalog.html:91-161`).
5. **Structured inquiry-to-CRM path** — public inquiry form, DB/JSON persistence, external notification attempts, private client records (`app.py:1656-1780,3235-3438`; `templates/dashboard/clients.html`).
6. **Member↔administration internal messaging core** — DB-backed root/reply thread create/list/view/reply (`app.py:2862-3035,1272-1359`), with important correctness gaps recorded in `AUDIT/08`.

---

## 7. What this product is not, based on evidence

| Claim | Classification | Evidence |
| --- | --- | --- |
| A financial/digital wallet | VERIFIED ABSENCE | zero "wallet" occurrences; no balance/ledger/payout/payment model or route |
| A marketplace or freelance marketplace | VERIFIED ABSENCE / explicit denial | `templates/landing.html:319-324`; `templates/pages/about.html:25`; `templates/pages/terms.html:31` |
| A social network | VERIFIED ABSENCE / explicit denial | same as above; member-to-member messaging forbidden by approved policy at `AUDIT/08:36-40` |
| A paid-template or premium-subscription product | VERIFIED ABSENCE | dead `subscription.html`; no `payment` route; no paid tier in data |
| A finished multi-tenant enterprise platform | VERIFIED FACT / DOCUMENTED INTENT contradiction | monolith, JSON primary store, nominal workspace use; `AUDIT/FINAL_ASSESSMENT.md:39-48,52-66` |
| A conventional online academy with courses | VERIFIED ABSENCE in implementation | "Academy" is branding/verification language; no course, enrollment, lesson, progress, or certificate model found in `models.py:20-91` or `app.py` route set |

---

## 8. Confidence and unknowns

**Confidence:** HIGH for the identity conclusion. Source, templates, stored data, documentation, and prior audit all converge on a proof-of-work portfolio and professional presentation system with admin/member workflows.

**UNKNOWN / requires owner decision or external evidence:**
1. Whether a wallet concept existed outside this repository.
2. Whether "Silver" was ever intended as a paid product tier rather than a theme.
3. Whether "premium" should become a commercial tier or remain presentation language.
4. Whether freelancer/business/digital-service roles should become first-class identities; current code does not implement them.
5. Whether the dead subscription mockup reflects an abandoned monetization direction.
6. Whether deployed configuration differs materially from the local snapshot.

---

## 9. Product-owner decisions required

- Confirm whether the wallet concept is external historical context, a future STRATEGIC PROPOSAL, or a requirement that was never implemented here.
- Confirm whether Silver/Premium should remain themes/style language or become a future product dimension.
- Confirm target role vocabulary: current code supports member/admin/demo and public visitors; "project owner" appears in copy but is not a role.
- Confirm whether direct professional contact should remain inquiry→CRM/admin-mediated, or become a broader ecosystem capability.
- Confirm whether the dead subscription mockup is historical only or should inform future monetization strategy.

**No implementation or remediation is authorized by this document.**
