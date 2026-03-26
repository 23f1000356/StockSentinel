Design a modern SaaS **Bulk Import (CSV Upload) Page** for an Inventory Management System with feature gating and data validation.

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
* Use icons for clarity (📂 upload, ⚠️ warning, ❌ error, ✔ success)

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
* Import (active)
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

📂 3. PAGE HEADER

* Title: "Bulk Import Products"
* Subtitle: "Upload CSV files to add products in bulk"

---

🚫 4. FEATURE GATING (FREE PLAN VIEW)

If user is on Free plan:

* Show centered card or banner with lock icon
* Slight blur overlay on upload section

Content:

🔒 "Bulk Import is a Pro Feature"

Benefits:

* Faster product creation
* Bulk updates
* Category-based import

CTA:

* "Upgrade to Pro 🚀" (gold button)

Disable:

* Upload box
* Import button

---

⭐ 5. PRO PLAN VIEW (FULL FEATURE)

---

📤 6. FILE UPLOAD SECTION (CORE UI)

Create a drag-and-drop upload box:

* Dashed border
* White background
* Rounded corners

Content:

📂 "Drag & Drop CSV File Here"

or

[ Browse File ]

Text:

* "Supported format: .csv"
* "Max file size: 5MB"

Hover state:

* Light gold highlight (#F3E8D9)

---

📄 7. SAMPLE CSV TEMPLATE DOWNLOAD

* Small card or link:

"Download Sample CSV Template"

Button:
[ Download Sample File ]

---

📊 8. FILE PREVIEW TABLE

After upload, show preview:

Table:

| Name   | Category    | Price | Stock |
| ------ | ----------- | ----- | ----- |
| iPhone | Electronics | 80000 | 10    |
| Shoes  | Clothing    | 2000  | 5     |

Design:

* Clean table with borders
* Show first 5–10 rows only

---

🏷️ 9. CATEGORY MAPPING SECTION (IMPORTANT)

Show mapping UI:

"Map CSV Fields"

* Product Name → Name
* Category → Category
* Price → Price
* Stock → Quantity

Use dropdown selectors for mapping

---

⚠️ 10. VALIDATION ERRORS

If errors found:

Show alert box (light red #FEE2E2):

❌ Errors Found:

* Row 3: Missing product name
* Row 5: Invalid price format

Highlight invalid rows in table

---

🎯 11. IMPORT ACTIONS

Buttons:

* Cancel (secondary)
* Import Products (primary gold)

Success state:

✔ "10 products imported successfully"

---

⏳ 12. LOADING STATE

Show progress bar:

"Importing products..."

[████████░░] 80%

---

📜 13. IMPORT HISTORY (OPTIONAL)

Show table:

| File Name    | Status  | Records | Date      |
| ------------ | ------- | ------- | --------- |
| products.csv | Success | 10      | Today     |
| bulk.csv     | Failed  | 5       | Yesterday |

---

❌ 14. FAILED IMPORT STATE

Show error:

"Import Failed ❌"

"Some rows could not be processed"

Button:
[ Download Error Report ]

---

🚦 15. UI STATES

FREE PLAN:

* Upload disabled
* Show upgrade CTA
* Blur or dim upload area

PRO PLAN:

* Full functionality enabled

EXPIRED PLAN:

* Disable import
* Show:
  "Subscription expired ❌"

---

🎨 16. DESIGN NOTES

* Cards → white + shadow-md

* Upload box → dashed border + hover effect

* Buttons:

  * Primary → gold (#C89B5A)
  * Secondary → light beige (#EFEAE4)

* Alerts:

  * Warning → #FEF3C7
  * Error → #FEE2E2

* Maintain spacing (16–24px padding)

* Use grid alignment

* Keep UI clean and uncluttered

---

🎯 GOAL:

The UI should clearly demonstrate:

* Feature gating (bulk import locked vs unlocked)
* CSV upload workflow
* Data validation and error handling
* Category-based product import
* Professional SaaS user experience
