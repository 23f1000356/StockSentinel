Design a modern SaaS **Subscription & Billing Page** for an Inventory Management System (Admin-only).

---

🎨 THEME & STYLE:

* Primary (accent): #C89B5A (gold)
* Background: #F5F1EB (soft beige)
* Sidebar: #1E1E1E (dark)
* Cards: #FFFFFF
* Text primary: #1F2937
* Text secondary: #6B7280

Style:

* Clean, minimal SaaS UI
* Rounded corners (rounded-xl / 2xl)
* Soft shadows (shadow-md)
* Spacious padding (16–24px)
* Subtle icons (💳 ⚙️ 🚀 ⚠️)

---

🧩 LAYOUT:

* Left Sidebar (dark)
* Top Navbar
* Main Content

Sections:

1. Page Header
2. Current Plan Card
3. Plan Comparison Table
4. Usage & Impact (for downgrade)
5. Actions (Upgrade/Downgrade)
6. Subscription History (optional)

---

📌 1) PAGE HEADER

* Title: "Subscription & Billing"
* Subtitle: "Manage your plan and billing details"

---

💳 2) CURRENT PLAN CARD (PRIMARY FOCUS)

Card (white, shadow, rounded):

Content:

* Plan: Free / Pro
* Status: ACTIVE ✅ or EXPIRED ❌
* Products Limit: 10 (Free) / Unlimited (Pro)
* Features: Limited / All enabled

CTA:

* Free → [ Upgrade to Pro 🚀 ] (gold button)
* Pro → [ Downgrade to Free ] (secondary)

EXPIRED STATE:

* Red alert inside card:
  "Subscription expired ❌"
* CTA: [ Renew Plan 🚀 ]

---

📊 3) PLAN COMPARISON TABLE

Table with columns: Feature | Free | Pro

Rows:

* Products Limit → 10 | Unlimited
* Analytics → ❌ | ✔
* Multi-Warehouse → ❌ | ✔
* Bulk Import → ❌ | ✔
* Export Reports → ❌ | ✔

Design:

* Highlight current plan column
* Highlight Pro column with gold border
* Use ✔ (green) and ❌ (red)

---

📈 4) USAGE & DOWNGRADE IMPACT (IMPORTANT)

Card:

* Title: "Current Usage"
* Example:
  "Products: 25 / Unlimited (Pro)"

If user selects downgrade:

* Show warning box (light yellow #FEF3C7):

"You currently have 25 products.
Free plan allows only 10.
You won’t be able to add new products after downgrade."

---

🎯 5) ACTIONS (WITH MODALS)

Buttons:

* Upgrade to Pro 🚀 (primary gold)
* Downgrade to Free (secondary)

Upgrade Modal:

* "Upgrade to Pro?"
* [ Cancel ] [ Confirm Upgrade ]

Downgrade Modal:

* Warning message (as above)
* [ Cancel ] [ Confirm Downgrade ]

---

📜 6) SUBSCRIPTION HISTORY (OPTIONAL)

Table:

| Date     | Plan | Status |
| -------- | ---- | ------ |
| Jan 2025 | Free | Active |
| Feb 2025 | Pro  | Active |

---

🚦 7) UI STATES

FREE:

* Show Upgrade CTA

PRO:

* Show Downgrade option

EXPIRED:

* Disable features
* Show renew CTA

---

🎨 DESIGN NOTES

* Buttons:

  * Primary: gold (#C89B5A)
  * Secondary: #EFEAE4
* Alerts:

  * Warning: #FEF3C7
  * Error: #FEE2E2
* Maintain clear spacing and hierarchy

---

🎯 GOAL:

The UI should clearly demonstrate:

* Plan upgrade flow
* Soft downgrade behavior
* Feature comparison
* Subscription lifecycle visibility
