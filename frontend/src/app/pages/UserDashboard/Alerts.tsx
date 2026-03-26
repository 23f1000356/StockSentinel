import { AlertTriangle, Package, Clock, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useState, useEffect } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useApp } from '../../context/AppContext';
import { Link } from 'react-router';

export function Alerts() {
  const { alerts, products, updateProductStock, fetchAlerts } = useStore();
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [newStock, setNewStock] = useState('');
  const { plan } = useApp();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const getProduct = (productId: string) => products.find((p) => (p as any)._id === productId);

  const handleUpdateStock = () => {
    if (selectedAlert) {
      const alert = alerts.find((a) => a.id === selectedAlert);
      if (alert) {
        // Backend uses _id, so we must be sure to pass the right ID.
        updateProductStock(alert.productId, Number(newStock));
        setSelectedAlert(null);
        setNewStock('');
        setTimeout(() => fetchAlerts(), 500); // Refresh alerts after update.
      }
    }
  };

  return (
    <div className="space-y-6 page-animate-right">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl text-gray-800 mb-1">Alerts</h1>
        <p className="text-gray-600">Monitor low stock products</p>
      </div>

      {/* Alert Summary */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
            <AlertTriangle className="text-yellow-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Alerts</p>
            <p className="text-2xl text-gray-800 flex items-center gap-2">
              {alerts.length} <AlertTriangle size={18} className="text-yellow-500" />
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          className="px-4 py-2 rounded-lg text-white"
          style={{ backgroundColor: '#C89B5A' }}
        >
          All Alerts
        </button>
        <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">
          Low Stock
        </button>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-xl text-gray-800 mb-2">No alerts</p>
          <p className="text-gray-500">All products are well stocked</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const product = getProduct(alert.productId);
            if (!product) return null;

            return (
              <div
                key={alert.id}
                className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-400"
                style={{ backgroundColor: '#FEF3C7' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="text-yellow-600" size={20} />
                      <h3 className="text-lg text-gray-800">Low Stock Alert</h3>
                    </div>

                    <div className="space-y-1 mb-3">
                      <p className="text-sm">
                        <span className="text-gray-600">Product:</span>{' '}
                        <span className="text-gray-800 font-medium">{product.name}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-600">Category:</span>{' '}
                        <span className="text-gray-800">{product.category}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-600">Stock:</span>{' '}
                        <span className="text-gray-800 font-medium">{product.stock} units</span>
                      </p>
                    </div>

                    <p className="text-sm text-yellow-700 mb-3">{alert.message}</p>

                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} />
                      {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedAlert(alert.id);
                        setNewStock(product.stock.toString());
                      }}
                      className="px-4 py-2 rounded-lg text-white text-sm hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: '#C89B5A' }}
                    >
                      Update Stock
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Update Stock Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl text-gray-800">Update Stock</h2>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {(() => {
              const alert = alerts.find((a) => a.id === selectedAlert);
              const product = alert ? getProduct(alert.productId) : null;
              return product ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Product</p>
                    <p className="text-gray-800 font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600 mt-2">Current Stock</p>
                    <p className="text-2xl text-gray-800">{product.stock} units</p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">New Stock Value</label>
                    <input
                      type="number"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
                      min="0"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setSelectedAlert(null)}
                      className="flex-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateStock}
                      className="flex-1 px-4 py-2 rounded-lg text-white"
                      style={{ backgroundColor: '#C89B5A' }}
                    >
                      Update
                    </button>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

function LockState() {
  // Minimal inline icon to avoid importing extra lucide components.
  return <div className="w-16 h-16 rounded-full bg-[#C89B5A]/10 text-[#C89B5A] mx-auto mb-4 flex items-center justify-center text-3xl">LOCK</div>;
}
