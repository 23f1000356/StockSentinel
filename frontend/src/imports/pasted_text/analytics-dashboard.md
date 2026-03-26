Design a modern SaaS **Analytics Dashboard** for an Inventory Management System with feature gating and data visualization.

---

🎨 THEME & STYLE:

Use a premium SaaS design system:

* Primary (accent): #C89B5A (gold)
* Background: #F5F1EB (soft beige)
* Sidebar: #1E1E1E (dark)
* Cards: #FFFFFF
* Text primary: #1F2937
* Text secondary: #6B7280

Design style:

* Clean, modern dashboard UI
* Rounded corners (rounded-xl / 2xl)
* Soft shadows
* Spacious layout
* Use subtle icons and charts
* Minimal but professional (Stripe-like dashboard)

---

🧩 LAYOUT STRUCTURE:

* Left Sidebar (dark)
* Top Navbar
* Main Content Area

---

📌 1. LEFT SIDEBAR

* Background: #1E1E1E
* White text
* Active item highlighted in gold (#C89B5A)

Menu:

* Dashboard
* Products
* Warehouses
* Analytics (active)
* Import
* Export
* Alerts
* Activity Logs
* Users
* Subscription
* Logout

---

🔝 2. TOP NAVBAR

* Background: #F5F1EB
* Left: Search bar
* Right: Notifications + Profile avatar

---

📈 3. PAGE HEADER

* Title: "Analytics Dashboard"
* Subtitle: "Track inventory insights and performance"

---

🚫 4. FEATURE GATING (FREE PLAN VIEW)

If user is on Free plan:

* Show centered card with lock icon
* Background slightly blurred behind

Content:

🔒 "Analytics is a Pro Feature"

List:

* ✔ Stock distribution insights
* ✔ Low stock tracking
* ✔ Category analytics

CTA:

* "Upgrade to Pro 🚀" (gold button)

---

⭐ 5. PRO PLAN VIEW (FULL ANALYTICS DASHBOARD)

---

📊 6. SUMMARY CARDS (TOP ROW)

Display 4 cards:

1. Total Products

   * Value: 24

2. Total Stock

   * Value: 320 units

3. Low Stock Items

   * Value: 5 ⚠️ (yellow/red)

4. Inventory Value

   * Value: ₹2,50,000

Style:

* White cards
* Soft shadow
* Rounded corners

---

📈 7. CHARTS SECTION (GRID LAYOUT)

Use a 2x2 grid layout:

---

A. Stock Distribution (Pie Chart)

* Based on warehouses
* Example:
  Warehouse A → 40%
  Warehouse B → 35%
  Warehouse C → 25%

---

B. Category Distribution (Donut Chart)

* Categories:
  Electronics → 50%
  Clothing → 30%
  Accessories → 20%

---

C. Stock Trend (Line Chart)

* Show stock changes over time (last 7 days)

---

D. Top Products (Bar Chart)

* Top products by stock or value

---

CHART COLORS:

* Primary: #C89B5A
* Secondary: soft beige/brown shades
* Alerts: red/yellow for low stock

---

⚠️ 8. LOW STOCK INSIGHTS TABLE

Show table:

| Product | Category | Stock | Status |
| ------- | -------- | ----- | ------ |
| Shoes   | Clothing | 3     | ⚠️ Low |
| Bag     | Fashion  | 2     | ⚠️ Low |

Design:

* Highlight rows with low stock (light yellow #FEF3C7)
* Use warning icon ⚠️

---

🧠 9. SMART INSIGHTS PANEL

Create a card with insights:

📊 Insights:

* "Electronics category has highest stock"
* "5 products need restocking"
* "Warehouse A holds most inventory"

---

📦 10. CATEGORY ANALYTICS SECTION

Show breakdown:

* Electronics → 120 units
* Clothing → 80 units
* Accessories → 60 units

Display as:

* Bar chart OR list with progress bars

---

🎯 11. ACTION BUTTONS

Top-right or below header:

* Export Report (gold)
* Refresh Data

FEATURE GATING:

* Export → disabled for Free plan
* Tooltip: "Upgrade to Pro"

---

🚦 12. UI STATES

FREE PLAN:

* Show locked overlay
* Disable charts

PRO PLAN:

* Full dashboard visible

EXPIRED PLAN:

* Show red banner:
  "Subscription expired ❌"
* Disable all analytics

---

🎨 13. DESIGN NOTES

* Use consistent spacing (16–24px)
* Maintain grid alignment
* Cards → white background + shadow-md
* Charts should be clean and readable
* Use icons for clarity (📈 📊 ⚠️ 🔒)

---

🎯 GOAL:

The UI should clearly demonstrate:

* Feature gating (analytics restricted vs unlocked)
* Data-driven insights
* Category-based inventory analytics
* Professional SaaS dashboard experience
