import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../api/axios';

type SubscriptionRow = {
  id: string;
  organizationId: string | null;
  tenantName: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string | null;
};

export function AdminSubscriptionsPage() {
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<SubscriptionRow[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.tenantName.toLowerCase().includes(q) || String(r.plan).toLowerCase().includes(q) || String(r.status).toLowerCase().includes(q));
  }, [rows, searchTerm]);

  const refresh = async () => {
    setLoading(true);
    setActionLoading(null);
    setError(null);
    try {
      const res = await api.get('/admin/subscriptions');
      setRows(res.data?.subscriptions ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load subscriptions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualUpgrade = async (organizationId: string) => {
    setActionLoading(organizationId);
    setError(null);
    try {
      await api.post(`/admin/tenants/${organizationId}/upgrade`);
      await refresh();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Manual upgrade failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleManualDowngrade = async (organizationId: string) => {
    setActionLoading(organizationId);
    setError(null);
    try {
      await api.post(`/admin/tenants/${organizationId}/downgrade`);
      await refresh();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Manual downgrade failed.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1F2937]">Subscriptions</h1>
        <p className="text-[#6B7280] mt-1">Monitor tenant subscriptions (and override for edge cases).</p>
      </div>

      {error && <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-[#1F2937]">{error}</div>}

      <div className="mb-6 bg-white rounded-2xl p-4 shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tenant / plan / status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Tenant</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Plan</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Start</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">End</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-[#6B7280]">Loading subscriptions...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-[#6B7280]">No subscriptions found.</td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="px-6 py-4 text-[#1F2937] font-medium">{r.tenantName}</td>
                    <td className="px-6 py-4 text-[#6B7280]">{r.plan}</td>
                    <td className="px-6 py-4 text-[#6B7280]">
                      <span className={r.status === 'ACTIVE' ? 'text-green-700 font-semibold' : 'text-yellow-700 font-semibold'}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#6B7280]">{r.startDate ? new Date(r.startDate).toLocaleDateString('en-GB') : '-'}</td>
                    <td className="px-6 py-4 text-[#6B7280]">{r.endDate ? new Date(r.endDate).toLocaleDateString('en-GB') : '-'}</td>
                    <td className="px-6 py-4 text-[#6B7280] text-sm">
                      {r.organizationId ? (
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-2 bg-[#C89B5A] text-white rounded-xl text-sm hover:bg-[#B88A4A] transition-colors disabled:opacity-50"
                            onClick={() => handleManualUpgrade(r.organizationId as string)}
                            disabled={actionLoading === r.organizationId}
                          >
                            Force Upgrade
                          </button>
                          <button
                            className="px-3 py-2 bg-gray-100 text-[#1F2937] rounded-xl text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
                            onClick={() => handleManualDowngrade(r.organizationId as string)}
                            disabled={actionLoading === r.organizationId}
                          >
                            Force Downgrade
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400">No org id</span>
                      )}
                    </td>
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

