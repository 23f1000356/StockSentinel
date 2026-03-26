import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

type LogRow = {
  id: string;
  action: string;
  metadata: Record<string, any>;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
  tenant: { id: string; name: string } | null;
};

export function AdminLogsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogRow[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/admin/logs');
        if (cancelled) return;
        setLogs(res.data?.logs ?? []);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.response?.data?.message || 'Failed to load logs.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const actions = useMemo(() => {
    const set = new Set<string>();
    for (const l of logs) set.add(l.action);
    return ['all', ...Array.from(set).slice(0, 12)];
  }, [logs]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return logs.filter((l) => {
      const matchesSearch =
        !q ||
        l.action.toLowerCase().includes(q) ||
        (l.user?.email ?? '').toLowerCase().includes(q) ||
        (l.tenant?.name ?? '').toLowerCase().includes(q);
      const matchesAction = actionFilter === 'all' || l.action === actionFilter;
      return matchesSearch && matchesAction;
    });
  }, [logs, searchTerm, actionFilter]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1F2937]">Logs</h1>
        <p className="text-[#6B7280] mt-1">Admin activity & tenant events</p>
      </div>

      {error && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-[#1F2937]">{error}</div>
      )}

      <div className="bg-white rounded-2xl p-4 shadow-md mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder="Search action/user/tenant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
          >
            {actions.map((a) => (
              <option key={a} value={a}>
                {a === 'all' ? 'All Actions' : a}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Action</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Tenant</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-[#6B7280]">Loading logs...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-[#6B7280]">No logs found.</td>
                </tr>
              ) : (
                filtered.slice(0, 200).map((l) => (
                  <tr key={l.id}>
                    <td className="px-6 py-4 text-[#1F2937] font-medium">{l.action}</td>
                    <td className="px-6 py-4 text-[#6B7280]">{l.tenant?.name ?? '-'}</td>
                    <td className="px-6 py-4 text-[#6B7280]">
                      {l.user ? (
                        <>
                          {l.user.name}
                          <div className="text-xs text-gray-500">{l.user.email}</div>
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#6B7280]">
                      {l.createdAt ? new Date(l.createdAt).toLocaleString('en-GB') : '-'}
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

