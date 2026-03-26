import { Lock, TrendingUp, Package, AlertTriangle, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useEffect, useState } from 'react';
import api from '../api/axios';

const COLORS = ['#C89B5A', '#D4A574', '#E0B88E', '#ECCAA8'];

export function AnalyticsPage() {
  const { plan } = useApp();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<null | {
    totalProducts: number;
    totalStock: number;
    lowStockCount: number;
    lowStockProducts: Array<{ name: string; category: string; stock: number }>;
    inventoryValue: number;
    categories: Array<{ category: string; count: number; stock: number }>;
  }>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await api.get('/analytics');
        if (!cancelled) setAnalytics(res.data);
      } catch (e: any) {
        if (cancelled) return;
        const status = e?.response?.status;
        if (status === 402) setErr('Your subscription is expired. Upgrade to continue.');
        else if (status === 403) setErr('Analytics is a Pro feature. Upgrade to Pro.');
        else setErr('Failed to load analytics.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (plan === 'free') {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1F2937]">Analytics Dashboard</h1>
          <p className="text-[#6B7280] mt-1">Track inventory insights and performance</p>
        </div>

        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center bg-white rounded-2xl p-12 shadow-md max-w-md">
            <Lock className="w-16 h-16 text-[#C89B5A] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#1F2937] mb-3">🔒 Analytics is a Pro Feature</h2>
            <p className="text-[#6B7280] mb-6">Upgrade to unlock powerful insights.</p>
            <Link
              to="/admin/subscriptions"
              className="block px-8 py-3 bg-[#C89B5A] text-white rounded-xl hover:bg-[#B88A4A] transition-colors"
            >
              Upgrade to Pro 🚀
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1F2937]">Analytics Dashboard</h1>
        <p className="text-[#6B7280] mt-1">Track inventory insights and performance</p>
      </div>

      {loading && (
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6 text-[#6B7280]">Loading analytics...</div>
      )}
      {err && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 shadow-md mb-6 text-[#1F2937]">
          {err}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280]">Total Products</p>
              <p className="text-2xl font-bold text-[#1F2937] mt-1">{analytics?.totalProducts ?? 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280]">Total Stock</p>
              <p className="text-2xl font-bold text-[#1F2937] mt-1">{analytics?.totalStock ?? 0} units</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280]">Low Stock Items</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{analytics?.lowStockCount ?? 0} ⚠️</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280]">Inventory Value</p>
              <p className="text-2xl font-bold text-[#1F2937] mt-1">₹{analytics?.inventoryValue?.toLocaleString('en-IN') ?? '0'}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-[#1F2937] mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={(analytics?.categories ?? []).map((c) => ({ name: c.category, value: c.count }))}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {(analytics?.categories ?? []).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Categories (Bar) */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-[#1F2937] mb-4">Stock by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={(analytics?.categories ?? []).map((c) => ({
                name: c.category,
                stock: c.stock,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="stock" fill="#C89B5A" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low Stock Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-[#1F2937] mb-4">Low Stock Alerts</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 text-sm font-semibold text-[#1F2937]">Product</th>
                  <th className="text-left py-3 text-sm font-semibold text-[#1F2937]">Category</th>
                  <th className="text-left py-3 text-sm font-semibold text-[#1F2937]">Stock</th>
                  <th className="text-left py-3 text-sm font-semibold text-[#1F2937]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(analytics?.lowStockProducts ?? []).map((product, idx) => (
                  <tr key={idx} className="bg-[#FEF3C7]">
                    <td className="py-3 text-[#1F2937]">{product.name}</td>
                    <td className="py-3 text-[#6B7280]">{product.category}</td>
                    <td className="py-3 text-[#1F2937]">{product.stock}</td>
                    <td className="py-3 text-yellow-600">⚠️ Low</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
