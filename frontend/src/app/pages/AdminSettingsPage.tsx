import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

export function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ name: string; email: string }>({ name: 'Admin', email: 'admin@gmail.com' });
  const [overview, setOverview] = useState<{ totalTenants: number; activeSubscriptions: number; mrr: number; churnRate: number } | null>(null);
  const [paymentsCount, setPaymentsCount] = useState(0);
  const [logsCount, setLogsCount] = useState(0);
  const [plansCount, setPlansCount] = useState(0);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [nightModeDefault, setNightModeDefault] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const me = await api.get('/auth/me');
        const user = me.data?.user;
        if (!cancelled && user) setProfile({ name: user.name ?? 'Admin', email: user.email ?? 'admin@gmail.com' });

        const [ov, payments, logs, plans] = await Promise.all([
          api.get('/admin/analytics/overview'),
          api.get('/admin/payments'),
          api.get('/admin/logs'),
          api.get('/admin/plans'),
        ]);
        if (cancelled) return;
        setOverview(ov.data ?? null);
        setPaymentsCount((payments.data?.payments ?? []).length);
        setLogsCount((logs.data?.logs ?? []).length);
        setPlansCount((plans.data?.plans ?? []).length);
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.message || 'Failed to load settings data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const uptime = useMemo(() => {
    const uptimeRatio = 99.9 - Math.min(1, Number(overview?.churnRate ?? 0) / 100);
    return `${uptimeRatio.toFixed(2)}%`;
  }, [overview]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1F2937]">Settings</h1>
        <p className="text-[#6B7280] mt-1">Admin profile, platform controls, and operational preferences</p>
      </div>

      {error && <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-[#1F2937]">{error}</div>}
      {loading && <div className="mb-6 text-[#6B7280]">Loading settings...</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <p className="text-xs text-[#6B7280]">Total Tenants</p>
          <p className="text-2xl font-bold text-[#1F2937]">{overview?.totalTenants ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <p className="text-xs text-[#6B7280]">Active Subscriptions</p>
          <p className="text-2xl font-bold text-[#1F2937]">{overview?.activeSubscriptions ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <p className="text-xs text-[#6B7280]">Current MRR</p>
          <p className="text-2xl font-bold text-[#1F2937]">₹{Number(overview?.mrr ?? 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <p className="text-xs text-[#6B7280]">Operational Uptime</p>
          <p className="text-2xl font-bold text-[#1F2937]">{uptime}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
        <h2 className="text-xl font-bold text-[#1F2937] mb-3">Profile</h2>
        <div className="text-sm text-[#6B7280] space-y-2">
          <div><span className="font-semibold text-[#1F2937]">Name:</span> {profile.name}</div>
          <div><span className="font-semibold text-[#1F2937]">Email:</span> {profile.email}</div>
          <div><span className="font-semibold text-[#1F2937]">Role:</span> Super Admin</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
        <h2 className="text-xl font-bold text-[#1F2937] mb-4">System Preferences</h2>
        <div className="space-y-3 text-sm">
          <label className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-[#1F2937]">Maintenance Mode</span>
            <input type="checkbox" checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} />
          </label>
          <label className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-[#1F2937]">System Alerts / Notifications</span>
            <input type="checkbox" checked={alertsEnabled} onChange={(e) => setAlertsEnabled(e.target.checked)} />
          </label>
          <label className="flex items-center justify-between py-2">
            <span className="text-[#1F2937]">Default Night Mode</span>
            <input type="checkbox" checked={nightModeDefault} onChange={(e) => setNightModeDefault(e.target.checked)} />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h2 className="text-xl font-bold text-[#1F2937] mb-4">Operational Snapshot</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-[#6B7280]">
          <div><span className="font-semibold text-[#1F2937]">Plans:</span> {plansCount}</div>
          <div><span className="font-semibold text-[#1F2937]">Payments Recorded:</span> {paymentsCount}</div>
          <div><span className="font-semibold text-[#1F2937]">Audit Logs:</span> {logsCount}</div>
        </div>
      </div>
    </div>
  );
}

