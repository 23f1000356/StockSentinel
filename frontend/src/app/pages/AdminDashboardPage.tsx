import { useEffect, useState } from 'react';
import { DollarSign, Users, CreditCard, TrendingDown } from 'lucide-react';
import api from '../api/axios';
import { Link } from 'react-router';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

export function AdminDashboardPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [overview, setOverview] = useState<null | {
    totalTenants: number;
    activeSubscriptions: number;
    mrr: number;
    churnRate: number;
  }>(null);

  const [revenueSeries, setRevenueSeries] = useState<Array<{ month: string; revenue: number }>>([]);
  const [newUsersSeries, setNewUsersSeries] = useState<Array<{ month: string; newUsers: number }>>([]);

  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setErr(null);
      try {
        const [ov, rev, nu, logs] = await Promise.all([
          api.get('/admin/analytics/overview'),
          api.get('/admin/analytics/revenue-series'),
          api.get('/admin/analytics/new-users-series'),
          api.get('/admin/logs'),
        ]);
        if (cancelled) return;

        setOverview(ov.data ?? null);
        setRevenueSeries(rev.data?.series ?? []);
        setNewUsersSeries(nu.data?.series ?? []);
        setRecentLogs((logs.data?.logs ?? []).slice(0, 6));
      } catch (e: any) {
        if (cancelled) return;
        setErr(e?.response?.data?.message || 'Failed to load admin dashboard.');
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
        <h1 className="text-3xl font-bold text-[#1F2937]">Dashboard</h1>
        <p className="text-[#6B7280] mt-1">Platform control & subscription analytics</p>
      </div>

      {err && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-[#1F2937]">{err}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280]">Total Tenants</p>
              <p className="text-2xl font-bold text-[#1F2937] mt-1">{overview?.totalTenants ?? 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280]">Active Subscriptions</p>
              <p className="text-2xl font-bold text-[#1F2937] mt-1">{overview?.activeSubscriptions ?? 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280]">MRR</p>
              <p className="text-2xl font-bold text-[#1F2937] mt-1">
                ₹{Number(overview?.mrr ?? 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280]">Churn Rate</p>
              <p className="text-2xl font-bold text-[#1F2937] mt-1">
                {(overview?.churnRate ?? 0).toFixed(2)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-[#1F2937] mb-4">Revenue (Monthly)</h3>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <LineChart data={revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#C89B5A" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-[#1F2937] mb-4">New Tenants</h3>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <LineChart data={newUsersSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="newUsers" stroke="#1F2937" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1F2937]">Recent Activities</h3>
          <Link to="/admin/logs" className="text-[#C89B5A] hover:underline text-sm">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="text-[#6B7280]">Loading recent activity...</div>
        ) : recentLogs.length === 0 ? (
          <div className="text-[#6B7280]">No activity yet.</div>
        ) : (
          <div className="space-y-4">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                <div className="w-2 h-2 bg-[#C89B5A] rounded-full mt-2" />
                <div className="flex-1">
                  <p className="font-semibold text-[#1F2937]">{log.action}</p>
                  <p className="text-sm text-[#6B7280]">
                    {(log.user?.name ?? 'Unknown') + ' • ' + (log.tenant?.name ?? 'Unknown')}
                  </p>
                </div>
                <div className="text-xs text-[#6B7280]">
                  {log.createdAt ? new Date(log.createdAt).toLocaleString('en-GB') : '-'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

