import { Package, AlertTriangle, DollarSign, TrendingUp, CreditCard, Landmark, BarChart3, Warehouse, Users, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router';

export function DashboardPage() {
  const { plan, productsCount, planStatus } = useApp();

  const stats = [
    { label: 'Total Products', value: '24', icon: Package, color: 'bg-blue-500' },
    { label: 'Total Stock', value: '320', icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Low Stock Items', value: '5', icon: AlertTriangle, color: 'bg-yellow-500' },
    { label: 'Inventory Value', value: '₹2,50,000', icon: DollarSign, color: 'bg-purple-500' },
  ];

  const recentActivity = [
    { action: 'Product Added', item: 'iPhone 14', time: '2 mins ago', user: 'Admin' },
    { action: 'Stock Updated', item: 'Shoes', time: '10 mins ago', user: 'Staff' },
    { action: 'Warehouse Created', item: 'Mumbai Hub', time: '1 hour ago', user: 'Admin' },
    { action: 'Product Deleted', item: 'Old Model', time: '2 hours ago', user: 'Admin' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1F2937]">Dashboard</h1>
        <p className="text-[#6B7280] mt-1">Welcome to your inventory management system</p>
      </div>

      {/* Plan Status Banner */}
      {planStatus === 'expired' && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-red-900">Subscription Expired ❌</p>
              <p className="text-sm text-red-700 mt-1">Your access is restricted. Renew to continue.</p>
            </div>
            <Link
              to="/admin/subscriptions"
              className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              Renew Now
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6B7280]">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#1F2937] mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Plan Card */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-[#1F2937] mb-4">Current Plan</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#6B7280]">Plan</span>
              <span className="font-semibold text-[#C89B5A] capitalize">{plan}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#6B7280]">Status</span>
              <span className={`font-semibold ${planStatus === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                {planStatus === 'active' ? '✅ Active' : '❌ Expired'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#6B7280]">Products</span>
              <span className="font-semibold">{productsCount} / {plan === 'free' ? '10' : 'Unlimited'}</span>
            </div>
            <Link
              to="/admin/subscriptions"
              className="block w-full text-center px-6 py-3 bg-[#C89B5A] text-white rounded-xl hover:bg-[#B88A4A] transition-colors mt-4"
            >
              {plan === 'free' ? 'Upgrade to Pro 🚀' : 'Manage Subscription'}
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-[#1F2937] mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                <div className="w-2 h-2 bg-[#C89B5A] rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-semibold text-[#1F2937]">{activity.action}</p>
                  <p className="text-sm text-[#6B7280]">{activity.item}</p>
                  <div className="flex gap-2 text-xs text-[#6B7280] mt-1">
                    <span>{activity.user}</span>
                    <span>•</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/admin/logs"
            className="block text-center text-[#C89B5A] hover:underline mt-4"
          >
            View All Activity
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/subscriptions" className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <CreditCard className="w-8 h-8 text-[#C89B5A] mb-3" />
          <h3 className="font-semibold text-[#1F2937]">Subscriptions</h3>
          <p className="text-sm text-[#6B7280] mt-1">Approve plan changes</p>
        </Link>

        <Link to="/admin/tenants" className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <Landmark className="w-8 h-8 text-[#C89B5A] mb-3" />
          <h3 className="font-semibold text-[#1F2937]">Tenants</h3>
          <p className="text-sm text-[#6B7280] mt-1">View customers</p>
        </Link>

        <Link to="/admin/analytics" className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <BarChart3 className="w-8 h-8 text-[#C89B5A] mb-3" />
          <h3 className="font-semibold text-[#1F2937]">Analytics</h3>
          <p className="text-sm text-[#6B7280] mt-1">Inventory insights</p>
        </Link>
      </div>
    </div>
  );
}
