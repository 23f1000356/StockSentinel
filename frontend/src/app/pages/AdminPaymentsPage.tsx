import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useEffect } from 'react';
import api from '../api/axios';

export function AdminPaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/admin/payments');
        if (!cancelled) setPayments(res.data?.payments ?? []);
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.message || 'Failed to load payments.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = payments.filter((p) =>
    searchTerm ? String(p.tenantName ?? '').toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  const totalPaymentsCollected = useMemo(
    () =>
      payments
        .filter((p) => String(p.status ?? '').toUpperCase() === 'SUCCESS')
        .reduce((sum, p) => sum + Number(p.amount ?? 0), 0),
    [payments]
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1F2937]">Payments</h1>
        <p className="text-[#6B7280] mt-1">Track subscription payment events</p>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-md">
          <p className="text-sm text-[#6B7280]">Total Payments Collected (Till Now)</p>
          <p className="text-3xl font-bold text-[#1F2937] mt-1">
            ₹{totalPaymentsCollected.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-md">
          <p className="text-sm text-[#6B7280]">Total Transactions</p>
          <p className="text-3xl font-bold text-[#1F2937] mt-1">{payments.length}</p>
        </div>
      </div>

      <div className="mb-6 bg-white rounded-2xl p-4 shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tenants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
          />
        </div>
      </div>

      {error && <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-[#1F2937]">{error}</div>}

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Tenant</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Provider</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-[#6B7280]">Loading payments...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-[#6B7280]">No payments found.</td>
                </tr>
              ) : (
                filtered.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 text-[#1F2937] font-medium">{p.tenantName}</td>
                  <td className="px-6 py-4 text-[#6B7280]">₹{Number(p.amount ?? 0)}</td>
                  <td className="px-6 py-4">
                    <span className={String(p.status).toUpperCase() === 'SUCCESS' ? 'text-green-700 font-semibold' : 'text-yellow-700 font-semibold'}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#6B7280]">{p.createdAt ? new Date(p.createdAt).toLocaleString('en-GB') : '-'}</td>
                  <td className="px-6 py-4 text-[#6B7280]">{p.provider}</td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

