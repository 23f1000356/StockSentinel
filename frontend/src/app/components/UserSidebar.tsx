import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Bell,
  RefreshCw,
  CreditCard,
  Upload,
  Download,
  LogOut,
} from 'lucide-react';
import { useStore } from '../store/useStore';

const menuItems = [
  { path: '/user', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/user/products', icon: Package, label: 'Products' },
  { path: '/user/stock', icon: RefreshCw, label: 'Stock Management' },
  { path: '/user/warehouses', icon: Warehouse, label: 'Warehouses' },
  { path: '/user/alerts', icon: Bell, label: 'Alerts' },
  { path: '/user/subscription', icon: CreditCard, label: 'Subscription' },
  { path: '/user/bulk-upload', icon: Upload, label: 'Bulk Upload' },
  { path: '/user/export', icon: Download, label: 'Export' },
];

export function UserSidebar() {
  const location = useLocation();
  const { logout } = useStore();

  return (
    <aside className="w-64 bg-[#1E1E1E] text-white flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#C89B5A]">StockSentinel</h1>
        <p className="text-sm text-gray-400 mt-1">User Dashboard</p>
      </div>

      <nav className="flex-1 px-3">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-colors ${
                isActive
                  ? 'bg-[#C89B5A] text-white'
                  : 'text-gray-300 hover:bg-[#2A2A2A]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-[#2A2A2A] w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
