import { createBrowserRouter, Navigate } from "react-router";
import { DashboardLayout } from "./components/DashboardLayout";
import { UserLayout } from "./components/UserLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Admin Pages
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminAnalyticsPage } from "./pages/AdminAnalyticsPage";
import { BulkImportPage } from "./pages/BulkImportPage";
import { ExportReportsPage } from "./pages/ExportReportsPage";
import { AdminTenantsPage } from "./pages/AdminTenantsPage";
import { AdminPlansPage } from "./pages/AdminPlansPage";
import { AdminPaymentsPage } from "./pages/AdminPaymentsPage";
import { AdminLogsPage } from "./pages/AdminLogsPage";
import { AdminSettingsPage } from "./pages/AdminSettingsPage";
import { AdminSubscriptionsPage } from "./pages/AdminSubscriptionsPage";
import { SubscriptionPage } from "./pages/SubscriptionPage";

// User Pages
import { Dashboard as UserDashboard } from "./pages/UserDashboard/Dashboard";
import { Products as UserProducts } from "./pages/UserDashboard/Products";
import { StockManagement } from "./pages/UserDashboard/StockManagement";
import { WarehousesPage as UserWarehouses } from "./pages/WarehousesPage";
import { Alerts as UserAlerts } from "./pages/UserDashboard/Alerts";
import { WarehouseDetailsPage } from "./pages/WarehouseDetailsPage";

// Auth Pages
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import Landing from "./pages/Landing";

export const router = createBrowserRouter([
  // Public Routes
  { path: "/", Component: Landing },
  { path: "/login", Component: Login },
  { path: "/signup", Component: Signup },

  // Admin Routes
  {
    path: "/admin",
    element: <ProtectedRoute role="ADMIN" allowedEmail="admin@gmail.com" />,
    children: [
      {
        path: "",
        Component: DashboardLayout,
        children: [
          { index: true, Component: AdminDashboardPage },
          { path: "tenants", Component: AdminTenantsPage },
          { path: "subscriptions", Component: AdminSubscriptionsPage },
          { path: "plans", Component: AdminPlansPage },
          { path: "payments", Component: AdminPaymentsPage },
          { path: "analytics", Component: AdminAnalyticsPage },
          { path: "logs", Component: AdminLogsPage },
          { path: "settings", Component: AdminSettingsPage },
        ],
      },
    ],
  },

  // User Routes
  {
    path: "/user",
    element: <ProtectedRoute role="STAFF" />,
    children: [
      {
        path: "",
        Component: UserLayout,
        children: [
          { index: true, Component: UserDashboard },
          { path: "products", Component: UserProducts },
          { path: "stock", Component: StockManagement },
          { path: "warehouses", Component: UserWarehouses },
          { path: "warehouses/:warehouseId", Component: WarehouseDetailsPage },
          { path: "alerts", Component: UserAlerts },
          { path: "subscription", Component: SubscriptionPage },
          { path: "bulk-upload", Component: BulkImportPage },
          { path: "export", Component: ExportReportsPage },
        ],
      },
    ],
  },
  
  // Wildcard redirect
  { path: "*", element: <Navigate to="/" replace /> }
]);
