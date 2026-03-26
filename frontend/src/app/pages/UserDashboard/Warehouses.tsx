import { Warehouse as WarehouseIcon, Package, MapPin, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export function Warehouses() {
  const { products } = useStore();
  const { plan, planStatus } = useApp();
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);

  const warehouses = [
    {
      id: '1',
      name: 'Main Warehouse',
      location: 'Mumbai',
      // User-facing warehouse view is tenant-scoped. We only persist products at the tenant level
      // in this demo, so "Main" contains all products.
      products: products,
    },
  ];

  // Pro plan additional warehouses
  if (plan === 'pro' && planStatus === 'active') {
    warehouses.push(
      {
        id: '2',
        name: 'Secondary Warehouse',
        location: 'Delhi',
        products: [],
      },
      {
        id: '3',
        name: 'South Warehouse',
        location: 'Bangalore',
        products: [],
      }
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl text-gray-800 mb-1">Warehouses</h1>
        <p className="text-gray-600">View stock across storage locations</p>
      </div>

      {/* Plan Banner */}
      {plan === 'free' ? (
        <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">
          <p className="text-gray-700">
            You are on <span className="font-medium">Free Plan</span> — only 1 warehouse is available
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-lg border border-green-200" style={{ backgroundColor: '#ECFDF5' }}>
          <p className="text-gray-700">
            <span className="font-medium">Multiple warehouses enabled</span> — view all locations
          </p>
        </div>
      )}

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((warehouse) => {
          const lowStockItems = warehouse.products.filter((p) => p.stock < p.lowStockThreshold);
          const totalStock = warehouse.products.reduce((sum, p) => sum + p.stock, 0);
          const categories = [...new Set(warehouse.products.map((p) => p.category))];

          return (
            <div key={warehouse.id} className="bg-white rounded-xl shadow-md p-6">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <WarehouseIcon className="text-blue-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg text-gray-800">{warehouse.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <MapPin size={14} />
                    {warehouse.location}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Package size={16} className="text-gray-500" />
                  <span className="text-gray-600">Products:</span>
                  <span className="text-gray-800 font-medium">{warehouse.products.length}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Total Stock:</span>
                  <span className="text-gray-800 font-medium">{totalStock} units</span>
                </div>
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Categories:</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-3 py-1 rounded-lg text-xs"
                        style={{ backgroundColor: '#F3E8D9', color: '#1F2937' }}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Low Stock Alert */}
              {lowStockItems.length > 0 && (
                <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#FEF3C7' }}>
                  <p className="text-sm text-yellow-700 flex items-center gap-1">
                    <AlertTriangle size={14} />
                    {lowStockItems.length} low stock items
                  </p>
                </div>
              )}

              {/* Action */}
              <button
                onClick={() => setSelectedWarehouse(warehouse.id)}
                className="w-full py-2 rounded-lg text-sm text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#C89B5A' }}
              >
                View Details
              </button>
            </div>
          );
        })}
      </div>

      {/* Warehouse Details Modal */}
      {selectedWarehouse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl text-gray-800">
                  {warehouses.find((w) => w.id === selectedWarehouse)?.name}
                </h2>
                <p className="text-gray-600 flex items-center gap-1 mt-1">
                  <MapPin size={14} />
                  {warehouses.find((w) => w.id === selectedWarehouse)?.location}
                </p>
              </div>
              <button
                onClick={() => setSelectedWarehouse(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm text-gray-600">Product</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">Category</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses
                    .find((w) => w.id === selectedWarehouse)
                    ?.products.map((product) => (
                      <tr
                        key={product.id}
                        className={`border-b border-gray-100 ${
                          product.stock < product.lowStockThreshold ? 'bg-[#FEF3C7]' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-sm text-gray-800">{product.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{product.category}</td>
                        <td className="py-3 px-4 text-sm">
                          <span
                            className={`flex items-center gap-1 ${
                              product.stock < product.lowStockThreshold
                                ? 'text-yellow-700'
                                : 'text-gray-800'
                            }`}
                          >
                            {product.stock} units
                            {product.stock < product.lowStockThreshold && (
                              <AlertTriangle size={14} />
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {warehouses.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-2xl mb-2">🏢</p>
          <p className="text-gray-800 mb-1">No warehouses available</p>
          <p className="text-sm text-gray-500">Contact admin for access</p>
        </div>
      )}
    </div>
  );
}
