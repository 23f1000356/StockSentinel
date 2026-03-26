Design a modern SaaS **Warehouse Management Page** for an Inventory Management System with feature gating and product categorization.

---

🎨 THEME & STYLE:

Use a premium SaaS theme:

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
* Use icons for clarity (warehouse, lock, location, stock)

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
* Warehouses (active)
* Analytics
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

🏢 3. PAGE HEADER

* Title: "Warehouses"
* Subtitle: "Manage your storage locations"

Right side:

* "+ Add Warehouse" button (gold)

Behavior:

* Disabled if Free plan already has 1 warehouse

---

🚫 4. FEATURE GATING BANNER

FREE PLAN STATE:

* Banner with light warning background (#FEF3C7)

* Message:
  "Multi-Warehouse is a Pro Feature"
  "Free plan allows only 1 warehouse"

* CTA button:
  "Upgrade to Pro 🚀" (gold)

---

PRO PLAN STATE:

* Green banner (#ECFDF5)
* Message:
  "You can create multiple warehouses"

---

🏢 5. WAREHOUSE CARDS GRID

Display warehouses as cards (grid layout).

Each card includes:

* 🏢 Warehouse Name
* 📍 Location
* 📦 Total Products
* 📊 Total Stock
* 🏷️ Categories (IMPORTANT)

CATEGORY DISPLAY:

* Show top 2–3 categories as tags:
  Example:
  [Electronics] [Clothing] [Accessories]

* If more:
  "+2 more"

---

CARD ACTIONS:

* View
* Edit

---

📦 6. WAREHOUSE DETAILS VIEW (ON CLICK)

Show a detailed panel or page:

---

🏢 Warehouse: Main Warehouse
📍 Location: Mumbai

---

Products Table:

| Product | Category    | Stock |
| ------- | ----------- | ----- |
| iPhone  | Electronics | 10    |
| Shoes   | Clothing    | 5 ⚠️  |

---

CATEGORY INTEGRATION:

* Each product must have a category
* Enable filtering by category

---

🔒 7. LOCKED CARD (FREE PLAN UX)

If 1 warehouse already exists:

Show an additional locked card:

---

🔒 Add New Warehouse

Upgrade to Pro to unlock multiple warehouses

## [ Upgrade 🚀 ]

* Slightly dimmed card
* Lock icon
* No interaction except upgrade

---

➕ 8. ADD WAREHOUSE MODAL

Fields:

* Warehouse Name
* Location

Buttons:

* Cancel
* Create Warehouse

VALIDATION (Free Plan):

If already 1 warehouse:

* Show error:
  "Free plan allows only 1 warehouse"
* Show upgrade button

---

📊 9. OPTIONAL STATS SECTION

Show above grid:

* Total Warehouses
* Total Stock
* Total Categories

---

🎯 10. ACTION BUTTONS

* Add Warehouse (gold)
* Upgrade Plan 🚀

---

🚦 11. UI STATES

FREE PLAN:

* Only 1 warehouse allowed
* Add button disabled
* Locked card visible

PRO PLAN:

* Unlimited warehouses
* Full access

EXPIRED:

* Disable all actions
* Show banner:
  "Subscription expired ❌"

---

🎨 12. DESIGN NOTES

* Cards → white background + shadow-md

* Category tags → light gold background (#F3E8D9)

* Hover effects on cards

* Icons:

  * 🏢 warehouse
  * 🔒 locked
  * 📍 location
  * 📦 stock

* Maintain spacing (16–24px padding)

* Use grid layout for responsiveness

---

🎯 GOAL:

The UI should clearly demonstrate:

* Feature gating (multi-warehouse restriction)
* Upgrade flow
* Category-based product organization
* Clean SaaS UX
