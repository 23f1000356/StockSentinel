import { useEffect, useMemo, useState } from 'react';
import { DollarSign, Users, BarChart3, Lock, AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#C89B5A', '#D4A574', '#E0B88E', '#ECCAA8', '#1F2937'];

export function AdminAnalyticsPage() {
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
  const [featureUsage, setFeatureUsage] = useState<Array<{ featureKey: string; count: number }>>([]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setErr(null);
      try {
        const [ov, rev, nu, fu] = await Promise.all([
          api.get('/admin/analytics/overview'),
          api.get('/admin/analytics/revenue-series'),
          api.get('/admin/analytics/new-users-series'),
          api.get('/admin/analytics/feature-usage'),
        ]);
        if (cancelled) return;

        setOverview(ov.data ?? null);
        setRevenueSeries(rev.data?.series ?? []);
        setNewUsersSeries(nu.data?.series ?? []);
        setFeatureUsage(fu.data?.usage ?? []);
      } catch (e: any) {
        if (cancelled) return;
        setErr(e?.response?.data?.message || 'Failed to load analytics.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const usagePieData = useMemo(() => {
    const total = featureUsage.reduce((s, x) => s + Number(x.count ?? 0), 0);
    return featureUsage.map((u) => ({
      name: u.featureKey,
      value: u.count ?? 0,
      percent: total === 0 ? 0 : (Number(u.count ?? 0) / total) * 100,
    }));
  }, [featureUsage]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1F2937]">Analytics</h1>
        <p className="text-[#6B7280] mt-1">Platform-level KPIs and feature usage</p>
      </div>

      {err && <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-[#1F2937]">{err}</div>}
      {loading && <div className="mb-6 text-[#6B7280]">Loading analytics...</div>}

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
              <BarChart3 className="w-6 h-6 text-green-600" />
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
              <p className="text-sm text-[#6B7280]">Churn</p>
              <p className="text-2xl font-bold text-[#1F2937] mt-1">
                {(overview?.churnRate ?? 0).toFixed(2)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-700" />
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
        <h3 className="text-lg font-bold text-[#1F2937] mb-4">Feature Usage (Last 30 days)</h3>
        {usagePieData.reduce((s, x) => s + x.value, 0) === 0 ? (
          <div className="text-[#6B7280]">No feature usage yet.</div>
        ) : (
          <div style={{ width: '100%', height: 340 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={usagePieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label
                >
                  {usagePieData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

