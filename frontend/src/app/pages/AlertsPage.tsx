import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router';
import api from '../api/axios';

type AlertType = 'all' | 'low-stock' | 'subscription' | 'critical';

interface Alert {
  id: string;
  type: 'low-stock' | 'subscription' | 'expired' | 'resolved';
  title: string;
  message: string;
  product?: string;
  category?: string;
  stock?: number;
  timestamp: string;
}

export function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<AlertType>('all');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/alerts');
        setAlerts(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load alerts');
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts.filter(alert => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'low-stock') return alert.type === 'low-stock';
    if (activeFilter === 'subscription') return alert.type === 'subscription' || alert.type === 'expired';
    if (activeFilter === 'critical') return alert.type === 'expired';
    return true;
  });

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case 'low-stock':
        return 'bg-[#FEF3C7]';
      case 'subscription':
        return 'bg-yellow-50';
      case 'expired':
        return 'bg-red-50';
      case 'resolved':
        return 'bg-green-50';
      default:
        return 'bg-white';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low-stock':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'subscription':
        return <Clock className="w-6 h-6 text-orange-600" />;
      case 'expired':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case 'resolved':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      default:
        return <Package className="w-6 h-6 text-blue-600" />;
    }
  };

  const lowStockCount = alerts.filter(a => a.type === 'low-stock').length;
  const subscriptionCount = alerts.filter(a => a.type === 'subscription' || a.type === 'expired').length;
  const criticalCount = alerts.filter(a => a.type === 'expired').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1F2937]">Alerts & Notifications</h1>
        <p className="text-[#6B7280] mt-1">Monitor system alerts and important updates</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <p className="text-sm text-[#6B7280]">Total Alerts</p>
          <p className="text-2xl font-bold text-[#1F2937] mt-1">{alerts.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <p className="text-sm text-[#6B7280]">Low Stock Alerts</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{lowStockCount} ⚠️</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <p className="text-sm text-[#6B7280]">Subscription Alerts</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{subscriptionCount} ⏳</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <p className="text-sm text-[#6B7280]">Critical Alerts</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{criticalCount} ❌</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-4 shadow-md mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'low-stock', 'subscription', 'critical'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter as AlertType)}
              className={`px-6 py-2 rounded-xl whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? 'bg-[#C89B5A] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-12 shadow-md text-center">
            <Loader2 className="w-12 h-12 text-[#C89B5A] animate-spin mx-auto mb-4" />
            <p className="text-[#6B7280]">Fetching alerts...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-2xl p-12 shadow-md text-center text-red-600">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
            <p className="font-bold">Error: {error}</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-md text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#1F2937] mb-2">🎉 No alerts</h3>
            <p className="text-[#6B7280]">Everything is running smoothly</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`${getAlertBgColor(alert.type)} border border-opacity-30 rounded-2xl p-6 shadow-sm`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#1F2937] text-lg mb-1">{alert.title}</h3>
                  {alert.product && (
                    <div className="mb-2 space-y-1">
                      <p className="text-sm text-[#1F2937]">
                        <strong>Product:</strong> {alert.product}
                      </p>
                      {alert.category && (
                        <p className="text-sm text-[#1F2937]">
                          <strong>Category:</strong> {alert.category}
                        </p>
                      )}
                      {alert.stock !== undefined && (
                        <p className="text-sm text-[#1F2937]">
                          <strong>Stock:</strong> {alert.stock} units
                        </p>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                  <p className="text-xs text-gray-500">{alert.timestamp}</p>
                </div>
                <div className="flex gap-2">
                  {alert.type === 'low-stock' && (
                    <>
                      <Link
                        to="/products"
                        className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                      >
                        View Product
                      </Link>
                      <button className="px-4 py-2 bg-[#C89B5A] text-white rounded-xl text-sm hover:bg-[#B88A4A] transition-colors">
                        Restock
                      </button>
                    </>
                  )}
                  {(alert.type === 'subscription' || alert.type === 'expired') && (
                    <Link
                      to="/subscription"
                      className="px-4 py-2 bg-[#C89B5A] text-white rounded-xl text-sm hover:bg-[#B88A4A] transition-colors"
                    >
                      {alert.type === 'expired' ? 'Renew Subscription' : 'Upgrade to Pro 🚀'}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
