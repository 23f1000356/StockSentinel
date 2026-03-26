# 🚀 StockSentinel: Multi-Tenant SaaS with Subscription & Entitlement

## 📌 Problem Statement
Managing inventory across multiple organizations requires strict data isolation, scalable feature management, and reliable usage enforcement. Organizations often need different service tiers (Free vs. Pro) to control costs while accessing advanced features like low-stock alerts, bulk imports, and analytics. Without a centralized entitlement system, enforcing these limits at the API level becomes messy and insecure.

## 💡 Solution Approach
**StockSentinel** is a robust Multi-Tenant SaaS platform built with a **Node.js/Express** backend and a **React/Vite** frontend. It uses a **Database-Driven Entitlement Engine** to control access at the middleware level. By decoupling subscription logic from business routes, the system ensures that every API call is validated against the tenant's active plan, usage counts, and feature permissions in real-time.

---

## 🛠️ Tech Stack
- **Frontend**: React.js, Vite, Tailwind CSS, Lucide Icons, Axios.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **Background Jobs**: BullMQ (Redis-based) for high-reliability email tasks.
- **Authentication**: JWT (JSON Web Tokens) with Role-Based Access Control (RBAC).
- **Email**: Nodemailer (integrated with SMTP/Gmail).

---

## 🧩 Core Features

### 🏢 Multi-Tenant Architecture
- Supports multiple independent organizations (tenants).
- Strict data isolation via `organizationId` indexing across all collections.
- Hierarchical users (ADMIN, STAFF) within each organization.

### 💳 Subscription & Entitlement (API-Level)
- **Centralized Middleware**: Validates subscription status (ACTIVE/EXPIRED) before any operation.
- **Feature Flags**: Dynamically enables/disables modules like Bulk Import or Warehouses based on the plan.
- **Unauthorized Handling**: Properly returns `402 Payment Required` or `403 Forbidden`.

### 🚨 Dynamic Low-Stock Email Alerts
- **Background Processing**: Uses **Redis + BullMQ** to trigger email reminders as soon as stock falls below a set threshold.
- **Professional Templates**: Sends drafted HTML emails including Warehouse location and immediate restock instructions.

### 📊 Usage Limit Enforcement
- **Atomic Tracking**: Prevents race conditions during high-concurrency updates using MongoDB atomic increments and conditional checks.
- **Measurable Limits**: Enforces limits on total products and warehouses per organization.

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
Stores the blueprint for tiers.
- `name`: (FREE, PRO, etc.)
- `features`: Array (e.g., `['BULK_IMPORT', 'EXPORT']`)
- `productLimit`: Number
- `warehouseLimit`: Number

#### 2. Subscription History (`Subscription` Schema)
Tracks the lifecycle of a tenant's access.
- `organizationId`: Reference
- `planId`: Reference
- `status`: (ACTIVE, EXPIRED)
- `startDate` / `endDate`: Timestamps

#### 3. Usage Tracking (`Usage` Schema)
Atomic counter for resources.
- `organizationId`: Unique Reference
- `productsCount`: Total active products
- `warehousesCount`: Total active warehouses

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
1. **Upgrade**: Immediate access to new features and higher product limits.
2. **Downgrade**: Existing data is preserved, but new creations are blocked until usage falls below the new lower limit.
