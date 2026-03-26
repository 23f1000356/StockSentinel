import { useEffect, useState } from 'react';
import api from '../api/axios';

export function AdminTenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/admin/tenants');
        if (!cancelled) setTenants(res.data?.tenants ?? []);
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.message || 'Failed to load tenants.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1F2937]">Tenants</h1>
        <p className="text-[#6B7280] mt-1">Global tenant view across organizations</p>
      </div>

      {error && <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-[#1F2937]">{error}</div>}

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Tenant</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Plan</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Users</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Products</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Warehouses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-[#6B7280]">Loading tenants...</td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-[#6B7280]">No tenants found.</td>
                </tr>
              ) : (
                tenants.map((t) => (
                  <tr key={t.id}>
                    <td className="px-6 py-4 text-[#1F2937]">{t.name}</td>
                    <td className="px-6 py-4 text-[#6B7280]">{t.plan}</td>
                    <td className="px-6 py-4 text-[#6B7280]">{t.planStatus}</td>
                    <td className="px-6 py-4 text-[#6B7280]">{t.usersCount}</td>
                    <td className="px-6 py-4 text-[#6B7280]">{t.productsCount}</td>
                    <td className="px-6 py-4 text-[#6B7280]">{t.warehousesCount}</td>
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

