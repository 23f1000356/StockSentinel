Design a modern SaaS **User Management Page** for an Inventory Management System with Role-Based Access Control (RBAC).

---

🎨 THEME & STYLE:

* Primary (accent): #C89B5A (gold)
* Background: #F5F1EB (soft beige)
* Sidebar: #1E1E1E (dark)
* Cards: #FFFFFF
* Text primary: #1F2937
* Text secondary: #6B7280

Style:

* Clean SaaS UI
* Rounded corners (rounded-xl / 2xl)
* Soft shadows
* Spacious layout
* Use icons (👤 ➕ ⚙️)

---

🧩 LAYOUT:

* Left Sidebar
* Top Navbar
* Main Content

Sections:

1. Page Header
2. Users Summary
3. Add User CTA
4. Users Table
5. Role Management

---

📌 1) PAGE HEADER

* Title: "User Management"
* Subtitle: "Manage team members and roles"

---

📊 2) USERS SUMMARY

Cards or inline stats:

* Total Users: 5
* Admins: 1
* Staff: 4

---

➕ 3) ADD USER BUTTON

Top-right:
[ + Add User ]

---

🧾 ADD USER MODAL

Fields:

* Name
* Email
* Role (Dropdown: Admin / Staff)

Buttons:
[ Cancel ] [ Add User ]

---

📋 4) USERS TABLE (CORE)

Columns:

| Name | Email | Role | Status | Actions |

Example:

| Rahul | [rahul@mail.com](mailto:rahul@mail.com) | Admin | Active | Edit Remove |
| Amit  | [amit@mail.com](mailto:amit@mail.com)  | Staff | Active | Edit Remove |

---

🏷️ ROLE BADGES

* Admin → gold badge (#C89B5A)
* Staff → gray badge

---

🔄 5) ROLE MANAGEMENT

Edit action:

* Click Edit → dropdown:
  Role: [ Admin / Staff ]

---

🔐 ROLE PERMISSIONS (VISUAL GUIDE)

Show small info card:

Admin:

* Full access
* Can upgrade/downgrade plan
* Can manage users

Staff:

* Manage products & stock
* Cannot access billing
* Cannot upgrade plan

---

🚫 6) REMOVE USER

Click Remove → confirm modal:

"Are you sure you want to remove this user?"

[ Cancel ] [ Remove ]

---

📊 7) USER STATUS

* Active ✅
* Inactive ❌

---

🔍 8) OPTIONAL SEARCH

* "Search users..."

---

🚦 9) UI STATES

NORMAL:

* Users visible

EMPTY:
"No users yet"
[ Add your first user ]

---

🎨 DESIGN NOTES

* Cards → white + shadow
* Buttons:

  * Primary → gold
  * Secondary → beige
* Maintain clean spacing
* Use consistent typography

---

🎯 GOAL:

The UI should clearly demonstrate:

* RBAC (Admin vs Staff roles)
* User management system
* Role assignment and permissions
* Clean SaaS team management experience
