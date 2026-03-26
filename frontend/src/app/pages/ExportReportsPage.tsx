import { useEffect, useMemo, useState } from 'react';
import { Download, Lock, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router';
import api from '../api/axios';

export function ExportReportsPage() {
  const { plan } = useApp();
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [stockLevelFilter, setStockLevelFilter] = useState<'all' | 'low' | 'out'>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [recentExports, setRecentExports] = useState<any[]>([]);

  const refreshData = async () => {
    const [pRes, aRes] = await Promise.all([api.get('/products'), api.get('/activity')]);
    setProducts(pRes.data ?? []);
    const logs = aRes.data?.logs ?? [];
    setRecentExports(logs.filter((l: any) => l.action === 'EXPORT_GENERATED').slice(0, 10));
  };

  useEffect(() => {
    if (plan === 'free') return;
    refreshData().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan]);

  const filteredProducts = useMemo(() => {
    const cat = String(categoryFilter ?? 'all').toLowerCase();
    const warehouse =
      warehouseFilter === 'main' ? 'Main' : warehouseFilter === 'secondary' ? 'Secondary' : 'all';

    const now = Date.now();
    return (products ?? []).filter((p) => {
      const matchesCategory = cat === 'all' ? true : String(p.category ?? '').toLowerCase() === cat;
      const matchesWarehouse = warehouse === 'all' ? true : String(p.warehouse ?? 'Main') === warehouse;

      const stock = Number(p.stock ?? 0);
      const threshold = Number(p.lowStockThreshold ?? 5);
      const matchesStock =
        stockLevelFilter === 'all'
          ? true
          : stockLevelFilter === 'out'
            ? stock === 0
            : stock > 0 && stock <= threshold;

      const createdAt = p.createdAt ? new Date(p.createdAt) : null;
      const matchesDate =
        dateRangeFilter === 'all' || !createdAt
          ? true
          : dateRangeFilter === 'today'
            ? createdAt.toDateString() === new Date().toDateString()
            : dateRangeFilter === 'week'
              ? createdAt.getTime() >= now - 7 * 24 * 60 * 60 * 1000
              : dateRangeFilter === 'month'
                ? createdAt.getTime() >= now - 30 * 24 * 60 * 60 * 1000
                : true;

      return matchesCategory && matchesWarehouse && matchesStock && matchesDate;
    });
  }, [products, categoryFilter, warehouseFilter, stockLevelFilter, dateRangeFilter]);

  const categoriesCount = useMemo(() => {
    const set = new Set(filteredProducts.map((p) => String(p.category ?? '')));
    set.delete('');
    return set.size;
  }, [filteredProducts]);

  const warehousesCount = useMemo(() => {
    const set = new Set(filteredProducts.map((p) => String(p.warehouse ?? 'Main')));
    return set.size;
  }, [filteredProducts]);

  const handleExport = async () => {
    setError(null);
    setExporting(true);
    try {
      const warehouseParam =
        warehouseFilter === 'main'
          ? 'Main'
          : warehouseFilter === 'secondary'
            ? 'Secondary'
            : 'all';

      const res = await api.get('/export', {
        params: {
          format,
          category: categoryFilter,
          warehouse: warehouseParam,
          stockLevel: stockLevelFilter,
          dateRange: dateRangeFilter,
        },
        responseType: 'blob',
      });

      const mime =
        res.headers?.['content-type'] ??
        (format === 'pdf' ? 'application/pdf' : 'text/csv');
      const blob = new Blob([res.data], { type: mime });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `products-export.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setExported(true);
      await refreshData();
    } catch (e: any) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message;
      if (status === 402 || status === 403) setError(msg || 'Export not available in your plan.');
      else setError(msg || 'Export failed.');
    } finally {
      setExporting(false);
    }
  };

  if (plan === 'free') {
    return (
      <div className="page-animate-right">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1F2937]">Export Reports</h1>
          <p className="text-[#6B7280] mt-1">Download inventory data in CSV or PDF format</p>
        </div>

        {/* Locked State */}
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center bg-white rounded-2xl p-12 shadow-md max-w-md">
            <Lock className="w-16 h-16 text-[#C89B5A] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#1F2937] mb-3">🔒 Export Reports is a Pro Feature</h2>
            <p className="text-[#6B7280] mb-6">Unlock data export with Pro plan:</p>
            
            <div className="text-left mb-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✔</span>
                <span className="text-[#1F2937]">Export product data</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✔</span>
                <span className="text-[#1F2937]">Download CSV or PDF reports</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✔</span>
                <span className="text-[#1F2937]">Analyze inventory offline</span>
              </div>
            </div>

            <Link
              to="/user/subscription"
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
    <div className="page-animate-right">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1F2937]">Export Reports</h1>
        <p className="text-[#6B7280] mt-1">Download inventory data in CSV or PDF format</p>
      </div>

      {/* Export Format Selection */}
      <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
        <h3 className="text-lg font-bold text-[#1F2937] mb-4">Choose Export Format</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setFormat('csv')}
            className={`p-6 rounded-xl border-2 transition-all ${
              format === 'csv'
                ? 'border-[#C89B5A] bg-[#F3E8D9] dark:bg-[#2B2114]'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:bg-[#111111]'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                checked={format === 'csv'}
                onChange={() => setFormat('csv')}
                className="w-4 h-4"
              />
              <div className="text-left">
                <p className="font-semibold text-[#1F2937] dark:text-white">CSV</p>
                <p className="text-sm text-[#6B7280] dark:text-gray-300">Best for spreadsheets and analysis</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setFormat('pdf')}
            className={`p-6 rounded-xl border-2 transition-all ${
              format === 'pdf'
                ? 'border-[#C89B5A] bg-[#F3E8D9] dark:bg-[#2B2114]'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:bg-[#111111]'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                checked={format === 'pdf'}
                onChange={() => setFormat('pdf')}
                className="w-4 h-4"
              />
              <div className="text-left">
                <p className="font-semibold text-[#1F2937] dark:text-white">PDF</p>
                <p className="text-sm text-[#6B7280] dark:text-gray-300">Formatted report for sharing</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
        <h3 className="text-lg font-bold text-[#1F2937] mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-2">Warehouse</label>
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
            >
              <option value="all">All Warehouses</option>
              {Array.from(new Set((products ?? []).map((p) => String(p.warehouse ?? 'Main')))).map((w) => (
                <option key={w.toLowerCase()} value={w.toLowerCase()}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-2">Stock Level</label>
            <select
              value={stockLevelFilter}
              onChange={(e) => setStockLevelFilter(e.target.value as 'all' | 'low' | 'out')}
              className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
            >
              <option value="all">All</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-2">Date Range</label>
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value as 'all' | 'today' | 'week' | 'month')}
              className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Export Summary */}
      <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
        <h3 className="text-lg font-bold text-[#1F2937] mb-4">Export Summary</h3>
        <div className="grid grid-cols-3 gap-6 mb-4">
          <div>
            <p className="text-sm text-[#6B7280]">Products to export</p>
            <p className="text-2xl font-bold text-[#1F2937]">{filteredProducts.length}</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">Categories</p>
            <p className="text-2xl font-bold text-[#1F2937]">{categoriesCount}</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">Warehouses</p>
            <p className="text-2xl font-bold text-[#1F2937]">{warehousesCount}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm text-[#6B7280] mb-2">Preview</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-[#6B7280]">
                      No products match current filters.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.slice(0, 8).map((p) => (
                    <tr key={p._id ?? p.id}>
                      <td className="px-4 py-2">{p.name}</td>
                      <td className="px-4 py-2">{p.category}</td>
                      <td className="px-4 py-2">{p.stock}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {exporting && (
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <p className="text-lg font-semibold text-[#1F2937] mb-4">Generating Report...</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div className="bg-[#C89B5A] h-2 rounded-full animate-pulse" style={{ width: '80%' }}></div>
          </div>
          <p className="text-sm text-[#6B7280]">80% complete</p>
        </div>
      )}

      {/* Success State */}
      {exported && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">✔ Report Generated Successfully</p>
                <p className="text-sm text-green-700">Your report has been downloaded</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-[#1F2937] mb-6">
          {error}
        </div>
      )}

      {/* Actions */}
      {!exporting && !exported && (
        <div className="flex gap-4">
          <button className="flex-1 px-6 py-3 bg-[#EFEAE4] text-[#1F2937] rounded-xl hover:bg-[#E5DFD8] transition-colors">
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="flex-1 px-6 py-3 bg-[#C89B5A] text-white rounded-xl hover:bg-[#B88A4A] transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>
      )}

      {/* Export History */}
      <div className="bg-white rounded-2xl p-6 shadow-md mt-6">
        <h3 className="text-lg font-bold text-[#1F2937] mb-4">Recent Exports</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 text-sm font-semibold text-[#1F2937]">File Name</th>
                <th className="text-left py-3 text-sm font-semibold text-[#1F2937]">Format</th>
                <th className="text-left py-3 text-sm font-semibold text-[#1F2937]">Date</th>
                <th className="text-left py-3 text-sm font-semibold text-[#1F2937]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentExports.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-[#6B7280]">
                    No exports yet.
                  </td>
                </tr>
              ) : (
                recentExports.map((log: any) => (
                  <tr key={log.id}>
                    <td className="py-3">products-export.{String(log.metadata?.format ?? 'csv').toLowerCase()}</td>
                    <td className="py-3">{String(log.metadata?.format ?? 'csv').toUpperCase()}</td>
                    <td className="py-3">{new Date(log.createdAt).toLocaleDateString('en-GB')}</td>
                    <td className="py-3 text-green-600">✔ Success</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
