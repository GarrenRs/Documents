# Commercial Packaging — Codexx Wallet

**Document class:** Decision-quality product assessment (commercial model).
**Status of content:** DECISION PROPOSAL — commercial structure only; no prices and no market claims are asserted.
**Scope:** Defines what is sold, to whom, under which entitlements and lifecycle rules. Implementation is out of scope for this assessment.

---

## 0. Evidence vs decision

| Label | Meaning |
| --- | --- |
| EVIDENCE | Directly observed in the current source/data/docs. |
| DECISION | Canonical decision for the reconstructed product; not yet implemented. |
| OWNER INPUT | A value the product owner must supply; deliberately left unanswered here. |

**EVIDENCE — the code has no commercial model today.**
- There is no wallet concept, no plan/subscription/entitlement entity, and no billing boundary in the current system. `models.py` declares 7 models, none commercial.
- "Silver" exists only as a CSS theme; "premium" appears only as design/entitlement-style language in docs, not as enforced behavior `[DISCOVERY/09 §7]`.
- The only pricing artifact is an orphan, unreachable `subscription.html` with hardcoded `$0 / $9.99 / $24.99` and a `url_for('payment')` call to a non-existent endpoint. Those numbers conflict with product copy and **must not be reused** (`templates/dashboard/subscription.html:377-426`, `[DISCOVERY/01 line 112]`, `[DISCOVERY/09 §4]`).
- The current product identity is proof-of-work portfolio presentation plus inquiry workflows, not a paid-tier product `[DISCOVERY/01 §1, §7]`, `[DISCOVERY/10 §8]`.

**DECISION — Codexx Wallet becomes a paid, customer-owned professional digital wallet and private workspace.** Commercial value is sold through entitlements, not through access crippling. Business wallets are defined now but deferred.

---

## 1. No invented prices / no market claims

**DECISION (binding).** This document defines packaging, value and value boundaries only.

- **No prices are invented.** No monthly/yearly/lifetime amount, tier price, discount, or currency is stated or implied.
- **No market statistics are invented.** No figures about competitor pricing, willingness to pay, market size, conversion, or "industry standard" are asserted.
- The hardcoded figures in the orphan `subscription.html` are explicitly rejected as an input to pricing (`templates/dashboard/subscription.html:377-426`, `[DISCOVERY/01 line 112]`).
- **Price is an OWNER INPUT** to be decided after the owner gathers evidence (see §10).

---

## 2. What the customer actually buys (value proposition)

**DECISION.** The customer pays for **ownership, control, presentation quality, utility, reliability and support** — never for "paid exposure" and never for access to a marketplace, social graph, generic CRM/LMS, or financial wallet.

| Value pillar | What the customer receives | Why it is worth paying for |
| --- | --- | --- |
| **Ownership** | A customer-owned wallet: their data, their slug, their public presentation, their export. | The asset belongs to the customer, not the platform; it persists across plan changes and is exportable. |
| **Control** | Publishing controls, design selection, private workspace, one-way official announcements with read receipts. | The owner decides what is public, what is private, and when. |
| **Presentation quality** | Curated design sets, polished public wallet pages, media handling. | A professional public face that is credible to the people the customer wants to reach. |
| **Utility** | Inquiry form with a defined taxonomy, daily private workspace, reliable CRUD, basic analytics (higher tiers). | The wallet does useful work beyond being a brochure. |
| **Reliability** | Backups, correct authorization, durable one datastore, restore capability. | The customer trusts the system with their professional record. |
| **Support** | Baseline support at every tier; priority support at Professional. | Problems are handled at a predictable level. |

**DECISION — public vs private split.** The **public wallet is the presentation layer**; the **private workspace is the real value**. Monetization tracks the quality and capability of both, not visibility or reach.

**EVIDENCE supporting the split.** Public portfolio rendering and per-user content CRUD are the strongest verified capabilities `[AUDIT/FINAL_ASSESSMENT.md:87-104]`, `[DISCOVERY/10 §5-6]`; the current data shows users, portfolios and inquiries but no commercial layer `[AUDIT/01 §6]`.

---

## 3. Initial customer and deferred expansion

**DECISION.** Start with **one customer type: the individual professional** (single-owner wallet, e.g. freelancer, consultant, specialist, creator). The whole v1 package is designed around one owner, one wallet, one public presentation, one private workspace.

**DECISION — business wallets are DEFERRED.** Define Business in this document for coherence, but do not build it in v1. It is a set of named expansion gates (§9), not a v1 deliverable.

**Non-targets (explicit).** No financial wallet, no marketplace, no social network, no general CRM, no LMS, no paid exposure, no member-to-member messaging product `[DISCOVERY/01 §7]`, `[DISCOVERY/12 §2]`.

---

## 4. Ownership vs entitlement (critical distinction)

**DECISION.**

- **The customer owns the wallet**: its data, content, media, inquiry history, published pages and export. Ownership persists regardless of plan state.
- **A subscription grants entitlements only**: which design sets can be applied, whether a custom domain is available, media/storage allowance, publishing controls, analytics, support level, and (future) additional wallets/seats.
- Subscription lapse **never transfers or deletes customer data**. It changes what the customer can *do*, not what they *own*.
- Entitlements are enforced through a dedicated policy service backed by `Plan / Subscription / Entitlement`, kept **separate from core business logic** so that commercial rules never leak into wallet, inquiry, or publishing code.

**EVIDENCE rationale.** The current system has no such separation and mixes authorization, design language and content handling ad hoc `[AUDIT/02 §4]`, `[AUDIT/06 §5]`. Introducing the boundary now prevents the commercial layer from being entangled with the core.

---

## 5. Tiers and value proposition

**DECISION — three tiers; only the first two are built in v1.**

### 5.1 Base / Starter (v1, default individual tier)

**Value proposition:** "Own a professional wallet and private workspace, publish it well, and receive inquiries reliably."

- One customer-owned wallet with a stable public address (`/w/<slug>`).
- Standard design sets and a clean, maintainable public presentation.
- Public wallet + inquiry form with the defined inquiry taxonomy.
- Private workspace for day-to-day content and inquiry handling.
- Announcements inbox (Administration → owner, one-way, with per-recipient read receipts; no replies/threads).
- Backups and baseline support.
- Arabic/RTL is a v1 product requirement across tiers `[DISCOVERY/12 §2]` (content ownership is an OWNER INPUT — see §11 of the Final Recommendation).

### 5.2 Professional (v1, individual upgrade tier)

**Value proposition:** "Same owned wallet, with greater design freedom, a branded address, more capacity, finer publishing control, insight and faster help."

- Everything in Base / Starter.
- Expanded and premium design sets.
- Custom domain support (policy is an OWNER INPUT).
- Higher media/storage allowance sized to real cost.
- Advanced publishing controls.
- Basic analytics (privacy-respecting, aggregate; no raw IP profiles).
- Priority support.

### 5.3 Business (DEFINED ONLY — DEFERRED, not built in v1)

**Value proposition (future):** "Multiple owned wallets under one organization with team access, shared branding and consolidated billing."

- Multiple wallets.
- Team seats and roles.
- Organization-level branding.
- Consolidated billing.
- **Status:** definition only; no v1 build. Activation depends on the gates in §9.

---

## 6. Entitlement matrix (no prices)

**DECISION.** `✓` = included, `—` = not included, `D` = defined but deferred (not built in v1).

| Capability / entitlement | Base / Starter | Professional | Business (deferred) |
| --- | --- | --- | --- |
| Customer-owned wallets | 1 | 1 | Multiple (D) |
| Public wallet presentation (`/w/<slug>`) | ✓ | ✓ | ✓ (D) |
| Standard design sets | ✓ | ✓ | ✓ (D) |
| Expanded / premium design sets | — | ✓ | ✓ (D) |
| Custom domain | — | ✓ (policy OWNER INPUT) | ✓ (D) |
| Inquiry form + inquiry taxonomy | ✓ | ✓ | ✓ (D) |
| Private workspace | ✓ | ✓ | ✓ (D) |
| One-way announcements inbox + read receipts | ✓ | ✓ | ✓ (D) |
| Internal member-to-member messaging / threads | — | — | — (removed entirely) |
| Media / storage allowance | Baseline, cost-based | Higher, cost-based | Higher, cost-based (D) |
| Publishing controls | Basic | Advanced | Advanced (D) |
| Basic analytics (privacy-respecting aggregate) | — | ✓ | ✓ (D) |
| Backups + export | ✓ | ✓ | ✓ (D) |
| Support level | Baseline | Priority | Priority (D) |
| Team seats / roles | — | — | ✓ (D) |
| Organization branding | — | — | ✓ (D) |
| Consolidated billing | — | — | ✓ (D) |
| Financial wallet / payments inside product | — | — | — (out of scope) |
| Marketplace / social / public directory | — | — | — (out of scope) |

**DECISION — limits reflect real cost.** Any numeric limit (storage, media, seats, design assets) is set from actual cost drivers — storage, support load, licensed/produced design assets — and disclosed upfront. Limits are **not** artificial feature-crippling used to force upgrades. If a limit cannot be justified by cost, it is not imposed.

---

## 7. Billing cadence (payment terms, not prices)

**DECISION.** Three cadence options are offered as **payment terms for the same entitlements**. Cadence does not change what is owned.

| Cadence | Nature | Trade-off (decision, not a price) |
| --- | --- | --- |
| **Monthly** | Recurring, short commitment | Lowest commitment and easiest to start; highest billing/operational overhead; entitlements track current subscription state. |
| **Yearly** | Recurring, longer commitment | Predictable revenue and fewer billing events; requires a clear renewal/notice policy; commitment is the customer's trade-off. |
| **Lifetime** | One-time payment buying a **non-expiring entitlement**, not perpetual service | Simplest for the customer; must carry explicit support and upgrade terms so the recurring cost of hosting/support is not left undefined. Terms are an OWNER INPUT. |

**DECISION — lifetime guardrails.**
- Lifetime = non-expiring entitlement to the tier's features, with **explicitly stated** support duration and upgrade/update terms.
- Lifetime never implies perpetual hosting at undefined cost, and never implies ownership of the platform.
- Concrete lifetime support/upgrade terms are an **OWNER INPUT**; they are not invented here.

**DECISION — billing boundary.** Payment is handled at a single boundary module: checkout redirect + webhook from a payment provider. **No in-app financial wallet logic.** The provider is an OWNER INPUT.

---

## 8. Lifecycle rules

**DECISION.** All lifecycle transitions preserve customer data.

| Event | Rule |
| --- | --- |
| **Purchase** | Account + wallet are provisioned; the chosen tier's entitlements become active; no data is created from payment beyond the subscription record. |
| **Upgrade** | Effective immediately; new entitlements unlock at once; no data loss; no re-onboarding. |
| **Downgrade** | Entitlements that are no longer included are **disabled** (e.g. premium designs, custom domain, analytics); **data is retained, not deleted**; content created under higher entitlements remains present and exportable. |
| **Renewal** | Recurring terms renew per cadence; renewal is a billing event, not a data event; notice/failure handling is an operational policy. |
| **Expiration** | On lapse: **grace period → read-only mode → unpublished public wallet**; data is retained and export remains available throughout. |
| **Grace period** | Defined window after lapse during which the workspace remains usable enough to export or renew; exact duration is an OWNER INPUT. |
| **Export** | Available at all times, including read-only/expired states; the customer can always leave with their data. |
| **Cancellation** | Stops future billing; entitlements run to the end of the paid term unless the owner elects immediate suspension; data retained and exportable. Cancellation never triggers deletion. |
| **Refunds** | **Policy area, not a decision made here.** The owner must set refund terms (eligibility, window, method) consistent with the chosen payment provider. No refund figure or rule is asserted in this document. |

**DECISION — no data hostage.** No lifecycle state — downgrade, expiration, cancellation — may destroy or withhold customer data or export. This is the commercial expression of customer ownership (§4).

---

## 9. Future expansion gates (named, not built)

**DECISION.** Business wallets activate only when all named gates are satisfied. These are gates, not commitments.

| Gate | Condition before Business is built |
| --- | --- |
| G1 — Individual traction | Evidence that individual professionals buy, retain and use the wallet (owner to gather evidence, §10). |
| G2 — Stable core | Wallet core, single datastore, auth/authz and entitlement boundary proven reliable in production. |
| G3 — Isolation proven | Strict `wallet_id` scoping and tenant isolation verified for the individual model before multi-wallet accounts are added. |
| G4 — Commercial ops | Billing provider, cadence, lifetime terms and refund policy settled and operating. |
| G5 — Team model defined | Seat/role model and "who can edit whose content" authorization designed and approved, including the rule that administrators are operational and never edit customer content without consent. |
| G6 — Branding/domain policy | Organization branding and custom-domain policy decided and technically supported. |

**Non-expansion defaults.** Public directory/catalog, member-to-member messaging, general CRM/pipelining, raw IP analytics and financial-wallet features are **not** expansion gates — they are out of scope under the current mandate.

---

## 10. Evidence the owner must gather before pricing

**DECISION.** Because no prices or market claims are asserted, the owner must supply the input for pricing:

1. **Willingness to pay** from the target individual professional segment (interviews, surveys, or paid pilot signal).
2. **Competitive price points** for comparable professional portfolio/wallet offerings, gathered and dated by the owner — not inferred here.
3. **Cost floor** per tier: hosting/storage, backup/restore, support load, and design-asset production or licensing cost.
4. **Cadence preference** in the target segment (monthly vs yearly vs one-time/lifetime).
5. **Perceived value anchors**: which features (design quality, custom domain, analytics, support) buyers actually value.
6. **Refund/expectation norms** for the chosen provider and region.
7. **Conversion and retention signals** from any pilot before committing to lifetime terms.

Pricing is set only after 1–7 exist. Until then, tier structure and entitlements (§§5–6) are the deliverable.

---

## 11. Summary of binding commercial decisions

- Paid, customer-owned professional wallet + private workspace; not financial, not marketplace/social/CRM/LMS, not paid exposure.
- Three tiers; Base/Starter and Professional built in v1; Business defined but deferred behind gates.
- Entitlements via `Plan / Subscription / Entitlement` + policy service, separate from core logic.
- Ownership is permanent; subscription grants entitlements only; no data loss on any plan transition.
- Monthly / yearly / lifetime as payment terms; lifetime has explicit support/upgrade terms (OWNER INPUT).
- Cost-based, upfront-disclosed limits; no artificial crippling.
- Single individual customer type in v1.
- No prices, no market statistics, no reuse of orphan `subscription.html` figures.

Status: DECISION — awaiting product-owner approval. No implementation performed.
