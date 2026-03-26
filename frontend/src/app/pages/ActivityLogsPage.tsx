import { useState } from 'react';
import { Search, CheckCircle, AlertTriangle, Warehouse as WarehouseIcon, Package } from 'lucide-react';

interface ActivityLog {
  id: number;
  type: 'product-created' | 'stock-updated' | 'warehouse-added' | 'product-deleted';
  action: string;
  description: string;
  user: string;
  timestamp: string;
  category?: string;
}

const activityLogs: ActivityLog[] = [
  {
    id: 1,
    type: 'product-created',
    action: 'Product Created',
    description: 'iPhone 14 added to inventory',
    user: 'Admin',
    timestamp: '2 minutes ago',
    category: 'today',
  },
  {
    id: 2,
    type: 'stock-updated',
    action: 'Stock Updated',
    description: 'Shoes stock updated: 10 → 5',
    user: 'Staff',
    timestamp: '10 minutes ago',
    category: 'today',
  },
  {
    id: 3,
    type: 'warehouse-added',
    action: 'Warehouse Added',
    description: 'New warehouse "Mumbai Hub" created',
    user: 'Admin',
    timestamp: '1 hour ago',
    category: 'today',
  },
  {
    id: 4,
    type: 'product-deleted',
    action: 'Product Deleted',
    description: 'Old Model removed from inventory',
    user: 'Admin',
    timestamp: '2 hours ago',
    category: 'today',
  },
  {
    id: 5,
    type: 'stock-updated',
    action: 'Stock Updated',
    description: 'Laptop stock updated: 15 → 20',
    user: 'Staff',
    timestamp: 'Yesterday',
    category: 'yesterday',
  },
  {
    id: 6,
    type: 'product-created',
    action: 'Product Created',
    description: 'Headphones added to inventory',
    user: 'Admin',
    timestamp: 'Yesterday',
    category: 'yesterday',
  },
];

export function ActivityLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.type === actionFilter;
    const matchesUser = userFilter === 'all' || log.user.toLowerCase() === userFilter.toLowerCase();
    return matchesSearch && matchesAction && matchesUser;
  });

  const groupedLogs = {
    today: filteredLogs.filter(log => log.category === 'today'),
    yesterday: filteredLogs.filter(log => log.category === 'yesterday'),
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'product-created':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
      case 'stock-updated':
        return { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'warehouse-added':
        return { icon: WarehouseIcon, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'product-deleted':
        return { icon: Package, color: 'text-red-600', bg: 'bg-red-100' };
      default:
        return { icon: Package, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const totalActions = activityLogs.length;
  const todayActions = activityLogs.filter(log => log.category === 'today').length;
  const productActions = activityLogs.filter(log => log.type.includes('product')).length;
  const warehouseActions = activityLogs.filter(log => log.type === 'warehouse-added').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1F2937]">Activity Logs</h1>
        <p className="text-[#6B7280] mt-1">Track all system actions and user activity</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <p className="text-sm text-[#6B7280]">Total Actions</p>
          <p className="text-2xl font-bold text-[#1F2937] mt-1">{totalActions}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <p className="text-sm text-[#6B7280]">Today's Activity</p>
          <p className="text-2xl font-bold text-[#1F2937] mt-1">{todayActions}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <p className="text-sm text-[#6B7280]">Product Actions</p>
          <p className="text-2xl font-bold text-[#1F2937] mt-1">{productActions}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <p className="text-sm text-[#6B7280]">Warehouse Actions</p>
          <p className="text-2xl font-bold text-[#1F2937] mt-1">{warehouseActions}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-md mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="🔍 Search activity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
              />
            </div>
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
          >
            <option value="all">All Actions</option>
            <option value="product-created">Product Created</option>
            <option value="stock-updated">Stock Updated</option>
            <option value="warehouse-added">Warehouse Added</option>
            <option value="product-deleted">Product Deleted</option>
          </select>

          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
          >
            <option value="all">All Users</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-6">
        {/* Today */}
        {groupedLogs.today.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-[#1F2937] mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-[#C89B5A] rounded-full"></div>
              Today
            </h2>
            <div className="space-y-3">
              {groupedLogs.today.map((log) => {
                const { icon: Icon, color, bg } = getActivityIcon(log.type);
                return (
                  <div key={log.id} className="bg-white rounded-2xl p-6 shadow-md">
                    <div className="flex items-start gap-4">
                      <div className={`${bg} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-[#1F2937]">{log.action}</h3>
                            <p className="text-sm text-[#6B7280] mt-1">{log.description}</p>
                            <div className="flex gap-2 text-xs text-[#6B7280] mt-2">
                              <span className="flex items-center gap-1">
                                👤 {log.user}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                ⏱ {log.timestamp}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Yesterday */}
        {groupedLogs.yesterday.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-[#1F2937] mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              Yesterday
            </h2>
            <div className="space-y-3">
              {groupedLogs.yesterday.map((log) => {
                const { icon: Icon, color, bg } = getActivityIcon(log.type);
                return (
                  <div key={log.id} className="bg-white rounded-2xl p-6 shadow-md">
                    <div className="flex items-start gap-4">
                      <div className={`${bg} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-[#1F2937]">{log.action}</h3>
                            <p className="text-sm text-[#6B7280] mt-1">{log.description}</p>
                            <div className="flex gap-2 text-xs text-[#6B7280] mt-2">
                              <span className="flex items-center gap-1">
                                👤 {log.user}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                ⏱ {log.timestamp}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredLogs.length === 0 && (
          <div className="bg-white rounded-2xl p-12 shadow-md text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#1F2937] mb-2">📭 No activity yet</h3>
            <p className="text-[#6B7280]">All actions will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
