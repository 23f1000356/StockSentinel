Design a modern SaaS **Export Reports Page** for an Inventory Management System with feature gating and reporting capabilities.

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

* Clean, modern SaaS UI
* Rounded corners (rounded-xl / 2xl)
* Soft shadows
* Spacious layout
* Minimal and professional (Stripe / Shopify style)
* Use icons for clarity (📤 export, 📄 file, ⚠️ warning, 🔒 lock)

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
* Analytics
* Import
* Export (active)
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

📤 3. PAGE HEADER

* Title: "Export Reports"
* Subtitle: "Download inventory data in CSV or PDF format"

---

🚫 4. FEATURE GATING (FREE PLAN VIEW)

If user is on Free plan:

* Show centered card/banner with lock icon
* Slightly dim or blur export sections

Content:

🔒 "Export Reports is a Pro Feature"

Benefits:

* Export product data
* Download CSV or PDF reports
* Analyze inventory offline

CTA:

* "Upgrade to Pro 🚀" (gold button)

Disable:

* Export buttons
* Filters section

---

⭐ 5. PRO PLAN VIEW (FULL FEATURE)

---

📤 6. EXPORT FORMAT SELECTION

Create a card:

Title: "Choose Export Format"

Options:

( ) CSV

* Description: "Best for spreadsheets and analysis"

( ) PDF

* Description: "Formatted report for sharing"

Use radio buttons or selectable cards

Highlight selected option with gold border

---

📊 7. FILTERS SECTION

Create a card with filters:

Filters include:

* Category (dropdown)

* Warehouse (dropdown)

* Stock Level:

  * All
  * Low stock
  * Out of stock

* Date Range:
  [ Start Date ] → [ End Date ]

---

📦 8. EXPORT SUMMARY SECTION

Create a summary card:

Title: "Export Summary"

Display:

* Products to export: 24
* Categories: 3
* Warehouses: 2

Optional preview table:

| Product | Category    | Stock |
| ------- | ----------- | ----- |
| iPhone  | Electronics | 10    |
| Shoes   | Clothing    | 5     |

---

🎯 9. EXPORT ACTIONS

Buttons:

* Export Report (primary gold)
* Cancel (secondary beige)

Behavior:

* On click:
  → Generate file
  → Trigger download

---

⏳ 10. LOADING STATE

Show:

"Generating Report..."

Progress bar:
[████████░░] 80%

---

📄 11. SUCCESS STATE

Show:

✔ "Report Generated Successfully"

Button:
[ Download File ]

---

❌ 12. ERROR STATE

Show:

❌ "Failed to generate report"

Message:
"Please try again"

---

📜 13. EXPORT HISTORY (OPTIONAL)

Create a table:

Title: "Recent Exports"

| File Name   | Format | Date      | Status  |
| ----------- | ------ | --------- | ------- |
| report1.csv | CSV    | Today     | Success |
| report2.pdf | PDF    | Yesterday | Success |

---

🏷️ 14. CATEGORY INTEGRATION

Ensure:

* Export includes product categories
* Filters allow category-based export

---

🚦 15. UI STATES

FREE PLAN:

* Show lock banner
* Disable export features

PRO PLAN:

* Full access

EXPIRED PLAN:

* Show red banner:
  "Subscription expired ❌"
* Disable export

---

🎨 16. DESIGN NOTES

* Cards → white background + shadow-md

* Buttons:

  * Primary → gold (#C89B5A)
  * Secondary → light beige (#EFEAE4)

* Alerts:

  * Warning → #FEF3C7
  * Error → #FEE2E2

* Use consistent spacing (16–24px)

* Maintain clean grid layout

* Use icons for clarity

---

🎯 GOAL:

The UI should clearly demonstrate:

* Feature gating (export locked vs unlocked)
* Reporting functionality
* Filter-based data export
* Professional SaaS user experience
