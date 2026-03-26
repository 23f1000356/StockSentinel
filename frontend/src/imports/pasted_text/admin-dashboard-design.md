1. Overall Theme Style

👉 This UI follows a:

Dark Sidebar + Warm Beige Dashboard + Gold Accent
Design Feel:
Professional SaaS
Soft + premium (not harsh contrast)
Slight luxury vibe (gold tones)
🌈 2. Primary Color Palette (Extracted)
🟡 Primary Accent (Golden)
#C89B5A
#D4A373
#E6B980

👉 Use for:

Buttons (Upgrade 🚀)
Highlights
Cards (top banner)
🟤 Background (Main Dashboard)
#F5F1EB
#EFEAE4
#FAF7F2

👉 Use for:

Main page background
Cards base
⚫ Sidebar (Dark)
#1E1E1E
#121212
#2A2A2A

👉 Use for:

Sidebar
Navbar (optional)
⚪ Cards / Containers
#FFFFFF
#F9F9F9

👉 Clean white cards for contrast

🟢 Success / Active
#4CAF50
#22C55E
🟡 Warning
#F59E0B
#FBBF24
🔴 Error
#EF4444
#DC2626
🧠 3. Text Colors
Primary Text
#1F2937   /* dark gray */
Secondary Text
#6B7280
Light Text
#9CA3AF
🎯 4. UI Component Color Mapping
🧩 Sidebar
bg: #1E1E1E
text: #FFFFFF
active item: #C89B5A
📊 Dashboard Cards
bg: #FFFFFF
title: #1F2937
subtitle: #6B7280
🚀 Buttons
Primary Button
bg: #C89B5A
text: white
hover: #B8874A
Secondary Button
bg: #EFEAE4
text: #1F2937
📈 5. Usage Progress Bar Colors
Normal: #22C55E (green)
Warning: #F59E0B (yellow)
Limit: #EF4444 (red)
🚨 6. Alerts Styling
Warning Alert
bg: #FEF3C7
text: #92400E
Error Alert
bg: #FEE2E2
text: #991B1B
🎨 7. Gradient (Top Banner Style)

From the image, the banner uses a warm gradient:

background: linear-gradient(
  135deg,
  #C89B5A,
  #D4A373,
  #E6B980
);

👉 Use this for:

Welcome banner
Premium sections

Design a modern SaaS Admin Dashboard UI for an Inventory Management System using a clean, premium layout.

STYLE & THEME:

* Use a warm premium color palette:

  * Primary: #C89B5A (golden accent)
  * Background: #F5F1EB (soft beige)
  * Sidebar: #1E1E1E (dark)
  * Cards: #FFFFFF
* Use soft shadows, rounded corners (rounded-xl or 2xl), and spacious padding
* Typography should be clean and modern (Inter or similar)

---

LAYOUT STRUCTURE:

1. LEFT SIDEBAR (dark theme)

* Vertical layout
* Background: #1E1E1E
* Text: white
* Active item highlighted with gold (#C89B5A)

Menu items:

* Dashboard
* Products
* Warehouses
* Analytics
* Import
* Export
* Alerts
* Activity Logs
* Users
* Subscription
* Logout at bottom

---

2. TOP NAVBAR

* Light background (#F5F1EB)
* Left: Search bar
* Right: Notification icon + Admin profile avatar

---

3. DASHBOARD MAIN CONTENT

A. SUMMARY CARDS (top row, 3–4 cards)
Each card:

* White background
* Rounded corners + soft shadow

Cards:

1. Plan Card:

   * Title: Plan
   * Value: Free
   * Button: "Upgrade 🚀" (gold button)

2. Status Card:

   * Title: Status
   * Value: ACTIVE (green) or EXPIRED (red)

3. Usage Card:

   * Title: Products
   * Value: 8 / 10

4. Optional:

   * Total Stock: 245 units

---

B. USAGE PROGRESS SECTION

* Title: Products Usage
* Progress bar:

  * Green (<80%)
  * Yellow (>80%)
  * Red (100%)
* Show:

  * “8 / 10 products used”
  * Warning text: “Only 2 products remaining”
* If limit reached:

  * Show: “Limit Reached ⚠️ Upgrade to continue”

---

C. FEATURE ACCESS PANEL

* White card
* Title: Feature Access

List:

* ✔ Create Product (green)
* ❌ Analytics (red)
* ❌ Multi-Warehouse (red)
* ❌ Bulk Import (red)
* ❌ Export Reports (red)

If Pro:

* Show all features enabled (green)

---

D. ALERTS SECTION

* White card
* Title: Alerts

Items:

* ⚠️ Product limit almost reached
* ⚠️ 3 products low on stock
* ⚠️ Subscription expires in 2 days

States:

* Warning (yellow)
* Error (red if expired)

---

E. QUICK STATS (optional small card)

* Total Products: 8
* Low Stock Items: 3
* Warehouses: 1

---

F. ACTION BUTTONS (important section)

* Buttons:

  * Add Product (primary gold)
  * Upgrade Plan 🚀 (gold)
  * View Analytics (secondary)

Behavior:

* Add Product triggers usage logic
* Upgrade navigates to subscription
* Analytics should appear disabled if not allowed

---

INTERACTION STATES:

1. Normal:

* Everything enabled

2. Warning:

* Usage > 80%
* Show yellow indicators

3. Limit Reached:

* Progress bar full red
* Disable “Add Product”
* Show upgrade CTA

4. Expired:

* Show red banner: “Subscription Expired ❌”
* Disable all actions

---

DESIGN NOTES:

* Use consistent spacing (padding: 16–24px)
* Grid layout for cards
* Icons for visual clarity
* Keep UI minimal, modern, and professional
