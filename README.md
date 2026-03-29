# 🚀 StockSentinel: Enterprise-Grade Multi-Tenant SaaS Inventory Management

## 📌 Problem Statement
Managing inventory across multiple organizations requires strict data isolation, scalable feature management, and reliable usage enforcement. Organizations often need different service tiers (Free vs. Pro) to control costs while accessing advanced features like low-stock alerts, bulk imports, and analytics. Without a centralized entitlement system, enforcing these limits at the API level becomes messy and insecure.

## 💡 Solution Approach
**StockSentinel** is a robust Multi-Tenant SaaS platform built with a **Node.js/Express** backend and a **React/Vite** frontend. It uses a **Database-Driven Entitlement Engine** to control access at the middleware level. By decoupling subscription logic from business routes, the system ensures that every API call is validated against the tenant's active plan, usage counts, and feature permissions in real-time.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite (TypeScript)
- **Styling**: Tailwind CSS & Framer Motion (Animations)
- **Components**: Radix UI & Shadcn/UI primitives
- **Icons**: Lucide React
- **Analytics**: Recharts for data visualization
- **State Management**: React Context API & Axios for API interaction

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Task Queue**: BullMQ & Redis for high-reliability background processing
- **Authentication**: JWT with Role-Based Access Control (RBAC)
- **Notifications**: Nodemailer with professional HTML templates

---

## 🧩 Core Features

### 🏢 Multi-Tenant Architecture
- **Data Isolation**: Strict isolation via `organizationId` indexing across all collections.
- **RBAC**: Hierarchical user roles (ADMIN, STAFF) within each organization.
- **Organization Management**: Seamless onboarding for new tenants.

### 💳 Powerful Entitlement Engine
- **Centralized Middleware**: Validates subscription status (ACTIVE/EXPIRED) before any operation.
- **Dynamic Feature Flags**: Enables/disables modules (Bulk Import, Export, Multi-Warehouse) based on the plan.
- **Usage Limits**: Enforces atomic limits on products and warehouses.
- **Graceful Handling**: Returns specialized `402 Payment Required` or `403 Forbidden` statuses.

### 🛡️ Platform Administration Portal
- **Tenant Overview**: Track all active organizations, their usage, and subscription status.
- **Subscription Lifecycle**: Manage PRO upgrade requests with an approval/rejection workflow.
- **Global Plans**: Configure and update plan features and pricing in real-time.
- **Platform Analytics**: Monitor MRR (Monthly Recurring Revenue), Churn Rate, and growth trends.

### 📊 Real-time Monitoring & Analytics
- **Inventory Metrics**: Visual breakdown of stock levels, categories, and warehouse distribution.
- **Activity Audit Logs**: Full traceability of all critical actions across the entire platform.
- **Revenue Tracking**: Historical revenue charts and new user acquisition series.

### 📤 Advanced Data Operations (Pro)
- **Bulk Upload**: Seamlessly import thousands of products using **CSV**. Features intelligent file parsing with support for previewing **JSON, PDF, DOCX, and TXT** files.
- **Export Reports**: Download comprehensive inventory summaries in **high-quality CSV or PDF** formats, complete with category and warehouse filters.

### 🔔 System-Wide Alerts & Notifications
- **Dedicated Alerts Center**: Centralized hub to monitor **Low-Stock**, **Critical Failures**, and **Subscription Status**.
- **Contextual Actions**: Perform immediate restocks or view affected products directly from the alert cards.
- **Dynamic Thresholds**: Customizable low-stock levels per product to trigger automated alerts.

### 📱 Responsive & Modern UI/UX
- **Mobile Optimized**: Fully responsive dashboards ensuring a seamless experience across mobile, tablet, and desktop.
- **Micro-Animations**: Uses Framer Motion for smooth transitions and interactive elements.
- **Modern Design**: Clean, premium aesthetics with glassmorphism effects and customized Tailwind components.

### 🚨 Low-Stock Automation
- **Background Workers**: Uses **Redis + BullMQ** to trigger email reminders asynchronously.
- **Professional Templates**: Beautiful HTML emails including Warehouse location and restock instructions.

---

## 🏗️ System Architecture

### 🛡️ Entitlement Decision Flow
```text
Client Request (POST /api/products)
   ↓
Auth Middleware (Verify JWT & Identify Tenant)
   ↓
Entitlement Middleware (Check active Subscription & Plan Features)
   ↓
Usage Middleware (Verify current count vs. Plan Limit)
   ↓
Business Logic (Atomic DB Update & Transaction)
   ↓
Background Worker (Trigger Low Stock Email if Threshold hit)
```

### 🗄️ Database Design

#### 1. Plan-Feature Mapping (`Plan` Schema)
Stores the blueprint for tiers (FREE, PRO, etc.), including `productLimit` and `warehouseLimit`.

#### 2. Subscription History (`Subscription` Schema)
Tracks the lifecycle of a tenant's access (ACTIVE, EXPIRED) with start/end dates.

#### 3. Usage Tracking (`Usage` Schema)
Atomic counter for resources (productsCount, warehousesCount) to prevent race conditions.

#### 4. Indexing Strategy
- **`organizationId`**: Compound index on all data collections for high-speed tenant isolation.
- **`isDeleted`**: Filtered indexes for soft-deleted records.
- **`stock`**: Indexed for rapid low-stock scanning.

---

## ⚠️ Race Condition Prevention
To support plan upgrades and downgrades conceptually, we use **Conditional Atomic Increments**. We never check the count and then increment in two steps. Instead, we perform the increment **only if** the updated value stays within the limit in a single atomic database call:
```javascript
Usage.findOneAndUpdate(
  { organizationId, productsCount: { $lte: limit - 1 } }, 
  { $inc: { productsCount: 1 } }
);
```

---

## 🧪 Setup & Installation

### 1. Prerequisites
- **Node.js** v18+ 
- **MongoDB Atlas** or local instance.
- **Redis Server** (required for background jobs).

### 2. Backend Setup
```bash
cd backend
npm install
# Create .env with MONGODB_URI, JWT_SECRET, REDIS_HOST, and SMTP credentials
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Running Workers
The worker is integrated into the backend; simply ensure **Redis** is running (`redis-server`).

---

## 🔄 Plan Upgrade Strategy
1. **Upgrade**: Immediate access to new features and higher product limits upon admin approval.
2. **Downgrade**: Existing data is preserved, but new creations are blocked until usage falls below the new lower limit.
