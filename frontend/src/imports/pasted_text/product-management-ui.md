Design a modern SaaS **Product Management Page** for an Inventory Management System using a premium UI style.

---

🎨 THEME & STYLE:

Use a warm premium SaaS theme:

* Primary (accent): #C89B5A (gold)
* Background: #F5F1EB (soft beige)
* Sidebar: #1E1E1E (dark)
* Cards: #FFFFFF
* Text primary: #1F2937
* Text secondary: #6B7280

Design style:

* Clean, minimal, modern SaaS UI
* Rounded corners (rounded-xl or 2xl)
* Soft shadows
* Spacious layout
* Use icons for clarity

---

🧩 LAYOUT STRUCTURE:

* Left Sidebar (dark)
* Top Navbar
* Main Content Area

---

📌 1. LEFT SIDEBAR

* Dark background (#1E1E1E)
* White text
* Active item highlighted with gold (#C89B5A)

Menu:

* Dashboard
* Products (active)
* Warehouses
* Analytics
* Import
* Export
* Alerts
* Activity Logs
* Users
* Subscription
* Logout (bottom)

---

🔝 2. TOP NAVBAR

* Light background (#F5F1EB)
* Left: Search bar
* Right: Notification icon + Profile avatar

---

📦 3. PAGE HEADER

* Title: "Products"
* Subtitle: "Manage your inventory products"

Right side:

* Primary button: "+ Add Product" (gold)

---

📊 4. USAGE BANNER (VERY IMPORTANT)

Create a highlighted card showing usage:

STATE 1 (Normal):

* "Products Usage: 7 / 10"
* Green progress bar
* Text: "You can add 3 more products"

STATE 2 (Warning >80%):

* Yellow progress bar
* Text: "Only 1 product remaining ⚠️"

STATE 3 (Limit Reached):

* Red progress bar
* Text:
  "Limit Reached ❌"
  "Upgrade to Pro to add more products 🚀"
* Disable Add Product button

---

🎯 5. FILTER + ACTION BAR

Include:

* Search input (🔍 Search products...)
* Dropdown filters:

  * Category
  * Stock level
  * Warehouse

Right side buttons:

* Bulk Import
* Export
* Add Product

FEATURE GATING:

* Bulk Import → disabled in Free plan
* Export → disabled in Free plan
* Show tooltip: "Upgrade to Pro to use this feature"

---

📋 6. PRODUCTS TABLE

Modern table or card grid layout.

Columns:

* Product Name
* Category
* Stock
* Warehouse
* Price
* Status
* Actions

---

📦 ROW DESIGN:

Example row:

* iPhone 14 | Mobile | 25 units | Main | ₹80K | Active ✅ | Edit Delete
* Shoes | Fashion | 5 units | Main | ₹2K | Low ⚠️ | Edit Delete

---

📊 STOCK STATES:

* Normal: plain text
* Low stock:

  * Highlight row (light yellow background)
  * Show ⚠️ icon
* Out of stock:

  * Red text + ❌

---

⚙️ 7. ACTIONS COLUMN

Buttons:

* Edit
* Delete

DELETE BEHAVIOR:

* Soft delete (do not remove permanently)
* Optionally include:

  * Tabs: All / Active / Archived

---

➕ 8. ADD PRODUCT MODAL

Modal with fields:

* Product Name
* Category
* Price
* Stock
* Warehouse

Buttons:

* Cancel
* Create Product

LIMIT STATE:
If limit reached:

* Show error:
  "You’ve reached your limit (10/10)"
* Show "Upgrade Plan 🚀" button

---

📈 9. INLINE STOCK MANAGEMENT

Allow updating stock inside table:

Example:

* Stock: [ - ] 25 [ + ]

---

🔔 10. LOW STOCK VISUAL

* Highlight row
* Yellow background (#FEF3C7)
* Warning icon ⚠️

---

📄 11. EMPTY STATE

If no products:

* Show message:
  "No products found"
* Button:
  "+ Add your first product"

---

📌 12. PAGINATION

Bottom of table:

* Previous / Next
* Page numbers

---

🚦 13. UI STATES (IMPORTANT)

NORMAL:

* All actions enabled

WARNING:

* Usage > 80%
* Yellow indicators

LIMIT REACHED:

* Disable Add Product
* Show upgrade CTA

EXPIRED:

* Show banner:
  "Subscription Expired ❌"
* Disable all actions

---

🎯 14. ACTION BUTTONS STYLE

Primary:

* Gold (#C89B5A)
* White text

Secondary:

* Light beige (#EFEAE4)
* Dark text

Disabled:

* Gray with reduced opacity

---

🧠 DESIGN NOTES:

* Use consistent spacing (16–24px)
* Maintain clean grid alignment
* Use icons for actions
* Keep UI professional and uncluttered
* Focus on clarity and usability over complexity

---

GOAL:

The UI should clearly demonstrate:

* Usage limit enforcement
* Feature gating
* Subscription-based restrictions
* Real SaaS product experience
