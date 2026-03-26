import { Package, AlertTriangle, TrendingUp, Plus, RefreshCw, Eye } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router';
import { useEffect, useRef } from 'react';

export function Dashboard() {
  const { products, alerts, activity, fetchActivity } = useStore();
  const navigate = useNavigate();
  const fetchActivityRef = useRef(fetchActivity);

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockItems = products.filter((p) => p.stock < p.lowStockThreshold);

  useEffect(() => {
    // Keep latest function without recreating interval on each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchActivityRef.current = fetchActivity;
  }, [fetchActivity]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (cancelled) return;
      try {
        await fetchActivityRef.current();
      } catch {
        // ignore polling errors
      }
    };

    run();
    const id = window.setInterval(() => run(), 10000);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const timeAgo = (value: string | Date) => {
    const d = value instanceof Date ? value : new Date(value);
    const diffMs = Date.now() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  const toActivityRow = (log: any) => {
    switch (log.action) {
      case 'PRODUCTS_BULK_IMPORTED': {
        const count = log.metadata?.count;
        return { icon: '✔', text: `Bulk import completed (${count ?? 'unknown'} products)` };
      }
      case 'PRODUCT_CREATED':
        return { icon: '✔', text: 'Product created' };
      case 'STOCK_UPDATED':
        return { icon: '⚠', text: 'Stock updated' };
      case 'WAREHOUSE_CREATED':
        return { icon: '🏬', text: 'Warehouse created' };
      case 'PRODUCT_DELETED':
        return { icon: '✖', text: 'Product deleted' };
      default:
        return { icon: '•', text: log.action || 'Activity' };
    }
  };

  return (
    <div className="space-y-6 page-animate-right">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl text-gray-800 mb-1">Dashboard</h1>
        <p className="text-gray-600">Overview of your inventory and stock status</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6">
        {/* Total Products */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Products</p>
              <p className="text-3xl text-gray-800">{products.length}</p>
              <p className="text-gray-500 text-sm mt-1">Products</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        {/* Total Stock */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Stock</p>
              <p className="text-3xl text-gray-800">{totalStock}</p>
              <p className="text-gray-500 text-sm mt-1">Units</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Low Stock Items</p>
              <p className="text-3xl text-gray-800 flex items-center gap-2">
                {lowStockItems.length}
                <AlertTriangle className="text-yellow-500" size={20} />
              </p>
              <p className="text-gray-500 text-sm mt-1">Alerts</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <AlertTriangle className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/user/products')}
            className="px-6 py-3 rounded-lg text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#C89B5A' }}
          >
            <Plus size={18} />
            Add Product
          </button>
          <button
            onClick={() => navigate('/user/stock')}
            className="px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition-colors"
            style={{ backgroundColor: '#EFEAE4', color: '#1F2937' }}
          >
            <RefreshCw size={18} />
            Update Stock
          </button>
          <button
            onClick={() => navigate('/user/products')}
            className="px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition-colors"
            style={{ backgroundColor: '#EFEAE4', color: '#1F2937' }}
          >
            <Eye size={18} />
            View Products
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg text-gray-800 mb-4">Low Stock Alerts</h2>
          {lowStockItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">🎉</p>
              <p className="text-gray-800">No alerts</p>
              <p className="text-sm text-gray-500">All products are well stocked</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockItems.slice(0, 3).map((product) => (
                <div
                  key={product.id}
                  className="p-4 rounded-lg border border-yellow-200"
                  style={{ backgroundColor: '#FEF3C7' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="text-yellow-600" size={18} />
                        <h3 className="text-black">{product.name}</h3>
                      </div>
                      <p className="text-sm text-black">Category: {product.category}</p>
                      <p className="text-sm text-black mt-1">
                        Stock: <span className="font-medium">{product.stock} units</span>
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/user/stock')}
                      className="px-4 py-2 rounded-lg text-sm text-white"
                      style={{ backgroundColor: '#C89B5A' }}
                    >
                      Update Stock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {activity.length === 0 ? (
              <div className="text-sm text-gray-500">No recent activity.</div>
            ) : (
              activity.map((log) => {
                const row = toActivityRow(log);
                return (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-colors">
                    <span className="text-lg">{row.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 dark:text-white">{row.text}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">{timeAgo(log.createdAt)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg text-gray-800 mb-4">Recent Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm text-gray-600">Product</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Category</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Stock</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Price</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 5).map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-800">{product.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{product.category}</td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`inline-flex items-center gap-1 ${
                        product.stock < product.lowStockThreshold ? 'text-yellow-700' : 'text-gray-800'
                      }`}
                    >
                      {product.stock} units
                      {product.stock < product.lowStockThreshold && (
                        <AlertTriangle size={14} className="text-yellow-500" />
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800">₹{product.price.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
