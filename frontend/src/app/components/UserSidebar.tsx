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
  X
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useSidebar } from '../context/SidebarContext';

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
  const { close } = useSidebar();

  return (
    <aside className="w-full h-full bg-[#1E1E1E] text-white flex flex-col overflow-hidden">
      <div className="p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#C89B5E]">StockSentinel</h1>
          <p className="text-sm text-gray-400 mt-1">User Dashboard</p>
        </div>
        <button onClick={close} className="lg:hidden p-2 text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 px-3">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={close}
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
