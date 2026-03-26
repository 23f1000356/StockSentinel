Design a modern SaaS **Activity Logs Page** for an Inventory Management System that tracks all user and system actions such as product creation, stock updates, and warehouse additions.

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

* Clean, minimal SaaS UI
* Rounded corners (rounded-xl / 2xl)
* Soft shadows (shadow-md)
* Spacious layout (16–24px padding)
* Use icons for actions (✔ ⚠️ 🏢)

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
* Export
* Alerts
* Activity Logs (active)
* Users
* Subscription
* Logout

---

🔝 2. TOP NAVBAR

* Background: #F5F1EB
* Left: Search bar
* Right: Notifications + Profile avatar

---

📜 3. PAGE HEADER

* Title: "Activity Logs"
* Subtitle: "Track all system actions and user activity"

---

📊 4. SUMMARY CARDS (OPTIONAL BUT RECOMMENDED)

Display 3–4 cards:

* Total Actions → 120
* Today’s Activity → 25
* Product Actions → 80
* Warehouse Actions → 15

Style:

* White cards
* Rounded corners
* Soft shadows

---

🔍 5. FILTERS & SEARCH BAR

Include:

* Search input:
  "🔍 Search activity..."

* Filters:

  * Action Type (dropdown)

    * Product Created
    * Stock Updated
    * Warehouse Added

  * User (dropdown)

    * Admin
    * Staff

  * Date Range (dropdown or picker)

    * Today
    * Last 7 days
    * Custom

Layout:

* Horizontal row
* Clean spacing

---

📋 6. ACTIVITY TIMELINE (MAIN SECTION)

Use a vertical **timeline layout (preferred over table)**.

---

🕒 GROUP BY DATE:

Sections:

* Today
* Yesterday
* Last Week

---

📌 ACTIVITY CARD DESIGN:

Each activity item should be a card:

---

✔ Product Created
"iPhone added to inventory"

👤 Admin
⏱ 2 minutes ago

---

---

⚠️ STOCK UPDATED:

---

⚠️ Stock Updated
"Shoes stock updated: 10 → 5"

👤 Staff
⏱ 10 minutes ago

---

---

🏢 WAREHOUSE ADDED:

---

🏢 Warehouse Added
"New warehouse 'Mumbai Hub' created"

👤 Admin
⏱ 1 hour ago

---

---

🎨 VISUAL STYLE:

* Cards: white (#FFFFFF)
* Border radius: rounded-xl
* Shadow: soft shadow-md
* Left icon colored based on type:

  * Green → Product Created
  * Yellow → Stock Updated
  * Blue → Warehouse Added

---

🔎 7. SEARCH BEHAVIOR

Allow searching by:

* Product name
* User name
* Action type

---

📄 8. PAGINATION / LOAD MORE

Bottom of page:

[ Load More ]

OR

Pagination:
< Prev   1   2   3   Next >

---

🔐 9. ROLE-BASED VIEW (OPTIONAL)

* Admin → sees all logs
* Staff → sees only own actions

---

🔕 10. EMPTY STATE

If no logs:

"📭 No activity yet"
"All actions will appear here"

---

🚦 11. UI STATES

NORMAL:

* Logs displayed

HIGH ACTIVITY:

* Scrollable timeline

EMPTY:

* No logs

---

🎨 12. DESIGN NOTES

* Maintain consistent spacing (16–24px)
* Use icons for clarity
* Keep UI minimal and readable
* Ensure timeline is visually clean
* Add hover effects on cards

---

🎯 GOAL:

The UI should clearly demonstrate:

* Audit logging system
* User activity tracking
* Action transparency
* Enterprise-level SaaS design
