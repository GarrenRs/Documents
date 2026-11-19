# 06 — Digital Wallet Model

**Discovery date:** 2026-11-19
**Question:** What does "Wallet" mean in this system, and what is the actual data/presentation model behind it?

---

## Evidence conventions

| Label | Meaning |
| --- | --- |
| VERIFIED FACT | Directly observed in source/templates/data or controlled runtime evidence. |
| DOCUMENTED INTENT | Stated in docs or product-facing copy. |
| OWNER-PROVIDED CONTEXT | Supplied by the product owner. |
| INFERENCE | Reasoned interpretation supported by evidence. |
| STRATEGIC PROPOSAL | Possible future direction only. |
| UNKNOWN | Insufficient evidence. |

---

## 1. Term resolution

**VERIFIED ABSENCE:** The repository contains zero occurrences of "wallet" in any case, across source, templates, static assets, data, and documentation. There is no wallet route, model, template, menu item, config key, CSS class, or stored field.

**OWNER-PROVIDED CONTEXT:** The product owner described an advanced digital wallet concept, premium wallet templates, and Silver-style templates.

**INFERENCE:** The owner's "wallet" may be an external/historical product metaphor, a future concept, or a reinterpretation of the portfolio presentation surface. None of these possibilities is verifiable from the supplied repository.

**VERIFIED FACT:** The closest implemented object is the **per-user professional portfolio** stored in `data.json` and rendered at `/portfolio/<username>`. Evidence: `app.py:411-468` (`load_data`/`save_data`), `app.py:473-504` (public route), `templates/index.html:2,36,76-444`.

---

## 2. Actual object model: the proof-of-work portfolio

### 2.1 Persistence layer

**VERIFIED FACT:** Portfolio data is JSON-first. `load_data(username=...)` reads `data.json`; when a username is supplied it returns `data['portfolios'][username]` (or an empty structure if absent), and `save_data(data, username=...)` writes back into that per-user key. Evidence: `app.py:411-468`.

**VERIFIED FACT:** The production snapshot `data.json` contains top-level portfolio keys including `sarah_stratege`, `marcus_builds`, `admin`, `Codexx`, and `Raeson`. The prior audit records 5 portfolios, 3 users, orphan portfolios, and no `is_verified` flags: `AUDIT/FINAL_ASSESSMENT.md:21`.

**VERIFIED FACT:** SQLAlchemy defines `Project`, `Skill`, `Client`, and `VisitorLog` models but they are not used in the live portfolio data path; only `User`, `Workspace`, and `Message` are used. Evidence: `models.py:20-91`; `AUDIT/FINAL_ASSESSMENT.md:57-59`.

**INFERENCE:** The "wallet" data layer, if the word is used loosely, is the JSON portfolio record — not a DB entity. It is a presentation/content document, not a financial account.

### 2.2 Portfolio content structure

**VERIFIED FACT:** The public portfolio template consumes these sections:
- Hero: name, title, description, photo, verified badge, CTAs — `templates/index.html:76-113`.
- About / Professional Path: about text and metadata rows — `templates/index.html:120-162`.
- Skills / Core Competencies: skill name and level progress bars — `templates/index.html:169-200`.
- Projects / Case Studies & Evidence: project cards, technologies, demo/GitHub links, project detail links — `templates/index.html:207-267`.
- Contact / Initiate Cooperation: structured inquiry form plus email/phone/location — `templates/index.html:284-444`.
- Social footer: LinkedIn, GitHub, Twitter/X, Instagram, Facebook, YouTube — `templates/index.html:459-469`.
- Theme attribute and stylesheet: `templates/index.html:2,32,36`.

**VERIFIED FACT:** Clients are **not** publicly rendered in `templates/index.html`; client records exist only in the private dashboard (`templates/dashboard/clients.html:6-14,64-126`).

**VERIFIED FACT:** There is no balance, transaction, ledger, payout, invoice, checkout, bank, card, token, or wallet address field in any template or model.

### 2.3 Presentation layer

**VERIFIED FACT:** The public profile is a single Jinja template, `templates/index.html`, with a separate `templates/project_detail.html` for project pages. There is no alternative wallet layout or multiple page-layout system.

**VERIFIED FACT:** Six themes exist:
`luxury-gold`, `modern-dark`, `clean-light`, `terracotta-red`, `vibrant-green`, `silver-grey`.
Evidence: `app.py:2251-2257,2267-2297`; `static/themes/*.css`; `templates/dashboard/settings.html:330-366`.

**VERIFIED FACT:** Themes are CSS custom-property files keyed on `html[data-portfolio-theme="..."]`, plus dark-mode overrides. Evidence: `static/themes/silver-grey.css:1-37`, `static/themes/luxury-gold.css:1-37`.

**VERIFIED FACT:** Theme selection is saved to `data['settings']['theme']` via `dashboard_settings()` and validated against the six allowed IDs. Evidence: `app.py:2238-2328`.

**VERIFIED FACT:** A separate client-side light/dark toggle writes `localStorage['theme']` and sets `data-theme`, independent of the six server-side `data-portfolio-theme` values. Evidence: `static/js/script.js:14-40`; `templates/dashboard/base.html:3`.

**INFERENCE:** The system has **one layout with six color themes**, not multiple distinct presentation templates. The dark-mode toggle interacts with theme CSS variables but is a separate browser-local preference.

---

## 3. Capability checklist from the discovery brief

| Capability | Classification | Evidence / finding |
| --- | --- | --- |
| Professional identity | VERIFIED FACT | Name/title/about/photo/verified badge at `templates/index.html:76-162`; "Define Your Professional Identity" at `templates/dashboard/general.html:14`. |
| Work samples and projects | VERIFIED FACT | Skills/projects sections at `templates/index.html:169-267`; project detail at `templates/project_detail.html:97-188`. |
| Skills and achievements | PARTIAL — VERIFIED FACT | Skills with levels are implemented (`index.html:169-200`, `app.py:2569-2600`). No dedicated achievements/credentials model exists in `models.py:20-91`; "badges" are mentioned in docs but not implemented in a visible portfolio section. |
| Services and professional offerings | VERIFIED ABSENCE as catalog | `/catalog` is a people directory, not a service catalog (`app.py:1542-1582`, `templates/catalog.html:91-161`). The contact form includes "Looking for a service" as an inquiry type (`templates/index.html:335-342`), but there is no service listing, price, booking, or checkout. |
| Contact and communication | VERIFIED FACT | Public inquiry form `templates/index.html:306-411`; processing at `app.py:1656-1780`; internal member↔admin messaging at `app.py:2862-3035`. Member-to-member messaging is forbidden by approved policy (`AUDIT/08:36-40`). |
| Public/private presentation | VERIFIED FACT | Public portfolio routes and private dashboard split (`app.py:473-504`, `app.py:1461-1582`; `templates/dashboard/base.html:41-102`). Dashboard pages are `noindex, nofollow` (`dashboard/base.html:7`). |
| Customizable layouts | VERIFIED ABSENCE | Only color themes and a light/dark variable toggle exist; no layout selector. |
| Multiple templates | PARTIAL — VERIFIED FACT | Six CSS color themes, one main public layout. No multiple wallet templates. |
| Premium or special templates | VERIFIED ABSENCE | "Premium" is aesthetic/CSS language; dead paid plans are in unreferenced `subscription.html`. Silver is a color theme. |
| Separate data and presentation layers | PARTIAL — VERIFIED FACT | Content is JSON; presentation is Jinja + CSS themes. However routes read/write JSON directly with no service layer or atomic persistence (`app.py:411-468`). |
| Sharing and discovery | PARTIAL — VERIFIED FACT | Landing gallery, verified directory, portfolio URLs, CV preview exist (`app.py:1461-1491,1542-1582,473-504,3508-3548`). No share button/copy-link; sitemap emits invalid `/project/<id>` paths and does not enumerate portfolios (`app.py:1803-1847`). |

---

## 4. What the "wallet" actually is

**INFERENCE:** The implemented object is best described as a **three-layer professional presentation system**:

1. **Identity and proof layer** — JSON portfolio with name, title, about, skills, projects, contact, social, photo, verification flag injection (`app.py:473-504`).
2. **Presentation layer** — one public portfolio layout plus project detail, six CSS color themes, separate light/dark toggle (`templates/index.html`, `templates/project_detail.html`, `static/themes/*.css`).
3. **Interaction layer** — public inquiry form, DB/JSON message persistence, external notification attempts, private CRM client records, member↔admin internal messaging (`app.py:1656-1780,3235-3438,2862-2992`).

**INFERENCE:** It is simultaneously an **individual profile**, a **structured professional workspace**, a **presentation product**, and a **business interaction entry point** — but only in a lightweight, JSON-backed prototype form. It is not a financial wallet and not a marketplace.

---

## 5. Verified limitations

1. **No financial semantics** — no balance, ledger, transfer, payout, currency, invoice, payment gateway, or wallet address.
2. **No layout product** — one public layout and six color themes; no premium template family.
3. **No service catalog** — "service provider" is marketing language; no purchasable service object.
4. **No real discovery optimization** — catalog is empty unless `is_verified` is set; sitemap paths are invalid; no share affordance.
5. **No data/service separation** — routes mutate JSON directly; no atomic writes, transactions, or service layer (`app.py:411-468`).
6. **No durable notification/notification history** — bell is a live query plus 30-second poll; no notification table (`AUDIT/08:137-151`).
7. **Public CV bug risk** — `/cv-preview` reads `session.get('username', 'admin')`, so anonymous visitors may receive the admin portfolio's CV rather than the viewed profile owner's (`app.py:3512-3514`; presentation inventory).
8. **Verification gating may hide all profiles** — catalog filters non-verified portfolios unless admin is logged in (`app.py:1562-1564`); snapshot users lack `is_verified` (`AUDIT/FINAL_ASSESSMENT.md:21`).

---

## 6. Owner context vs evidence

| Owner context | Evidence status |
| --- | --- |
| Advanced digital wallet | OWNER-PROVIDED CONTEXT only; no repository evidence. |
| Premium wallet templates | OWNER-PROVIDED CONTEXT only; no premium tier or distinct template family. |
| Silver-style templates | OWNER-PROVIDED CONTEXT partially maps to the `silver-grey` CSS color theme. |
| Professional identity/presentation | VERIFIED FACT and strongly implemented relative to other owner concepts. |
| Freelancers/project owners/businesses | OWNER-PROVIDED CONTEXT; repository supports generic members and project-owner copy only. |

---

## 7. Decisions required from the product owner

- Does "wallet" refer to a future financial product, a presentation metaphor, or an external historical design not present in this repository?
- Should the six color themes be treated as the original "template" system, or were distinct layouts intended?
- Should Silver/Premium become a commercial tier, or remain style/theme language?
- Should services become first-class offerings, or remain inquiry topics within the current portfolio?
- Should discovery be expanded beyond the current landing gallery and verified directory?

**No implementation, redesign, or monetization change is authorized by this document.**
