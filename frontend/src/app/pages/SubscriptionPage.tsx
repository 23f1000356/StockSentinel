import { useEffect, useMemo, useState } from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../api/axios';
import { useLocation } from 'react-router';

export function SubscriptionPage() {
  const { plan, planStatus, productsCount, refreshSubscription, userRole } = useApp();
  const location = useLocation();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'day' | 'week' | 'month'>('month');

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [history, setHistory] = useState<
    Array<{
      id: string;
      status: 'ACTIVE' | 'EXPIRED';
      startDate: string;
      endDate: string | null;
      plan: { name: string } | null;
    }>
  >([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const isAdminPanel = location.pathname.startsWith('/admin');

  const loadRazorpayScript = async () => {
    // Razorpay checkout script must be loaded before opening the payment modal.
    const existing = document.getElementById('razorpay-checkout-js');
    if (existing) return;

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-js';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay script.'));
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await api.post('/subscriptions/upgrade', { plan: 'PRO', billingCycle });
      const data = res.data ?? {};

      if (data.mocked) {
        setShowUpgradeModal(false);
        setActionError(data.message || 'Upgrade successful. Pro features are now enabled.');
        await refreshSubscription();
        return;
      }

      await loadRazorpayScript();

      const options = {
        key: data.keyId,
        amount: data.amountPaise,
        currency: data.currency,
        name: 'Admin dashboard',
        description: `Upgrade to Pro (${billingCycle})`,
        order_id: data.orderId,
        handler: async (response: any) => {
          try {
            await api.post('/subscriptions/upgrade/verify', {
              transactionId: data.transactionId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            setShowUpgradeModal(false);
            setActionError(`Payment verified. Pro enabled for ${billingCycle}.`);
            await refreshSubscription();
          } catch (e: any) {
            setActionError(e?.response?.data?.message || 'Payment verification failed.');
          } finally {
            setActionLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setActionLoading(false);
            setActionError('Payment cancelled.');
          },
        },
        prefill: {},
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Razorpay = (window as any).Razorpay;
      if (!Razorpay) throw new Error('Razorpay checkout is not available.');

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (e: any) {
      setActionError(e?.response?.data?.message || 'Upgrade failed.');
      setActionLoading(false);
    } finally {
      // `handler` will set actionLoading=false after verification.
    }
  };

  const handleDowngrade = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      await api.post('/subscriptions/downgrade', { plan: 'FREE' });
      setShowDowngradeModal(false);
      setActionError('Downgraded to Free immediately.');

      await refreshSubscription();
      // No history poll needed for user view.
    } catch (e: any) {
      setActionError(e?.response?.data?.message || 'Downgrade failed.');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (userRole !== 'admin') return;
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        if (isAdminPanel) {
          const res = await api.get('/admin/subscriptions');
          if (cancelled) return;
          const nextHistory = (res.data?.subscriptions ?? []).map((s: any) => ({
            id: s.id,
            status: s.status,
            startDate: s.startDate,
            endDate: s.endDate,
            plan: s.plan ? { name: s.plan } : null,
          }));
          setHistory(nextHistory);
        } else {
          const res = await api.get('/subscription/history');
          if (cancelled) return;
          setHistory(res.data?.history ?? []);
        }
      } catch (e: any) {
        if (cancelled) return;
        setHistoryError(e?.response?.data?.message || 'Failed to load subscription history.');
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [userRole, isAdminPanel]);

  const features = useMemo(
    () => [
      { name: 'Products Limit', free: '10', pro: 'Unlimited' },
      { name: 'Analytics', free: false, pro: true },
      { name: 'Multi-Warehouse', free: false, pro: true },
      { name: 'Bulk Import', free: false, pro: true },
      { name: 'Export Reports', free: false, pro: true },
    ],
    []
  );

  const currentFeatureFlags = useMemo(() => {
    return {
      analytics: plan === 'pro' && planStatus === 'active',
      multiWarehouse: plan === 'pro' && planStatus === 'active',
      bulkImport: plan === 'pro' && planStatus === 'active',
      export: plan === 'pro' && planStatus === 'active',
    };
  }, [plan, planStatus]);

  return (
    <div className="page-animate-right">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1F2937]">Subscription & Billing</h1>
        <p className="text-[#6B7280] mt-1">Manage your plan and billing details</p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-white rounded-2xl p-8 shadow-md mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Current Plan</h2>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-[#C89B5A] capitalize">{plan}</span>
              {planStatus === 'active' ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  ✅ Active
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                  ❌ Expired
                </span>
              )}
            </div>
          </div>
          {plan === 'free' ? (
            userRole === 'staff' ? (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="px-6 py-3 bg-[#C89B5A] text-white rounded-xl hover:bg-[#B88A4A] transition-colors"
                disabled={actionLoading}
              >
                Upgrade to Pro (Pay) 🚀
              </button>
            ) : (
              <div className="text-sm text-[#6B7280]">Admin monitor mode (no user changes).</div>
            )
          ) : (
            userRole === 'staff' ? (
              <button
                onClick={() => setShowDowngradeModal(true)}
                className="px-6 py-3 bg-[#C89B5A] text-white rounded-xl hover:bg-[#B88A4A] transition-colors"
                disabled={actionLoading}
              >
                Downgrade to Free
              </button>
            ) : (
              <div className="text-sm text-[#6B7280]">Admin monitor mode (no user changes).</div>
            )
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-[#6B7280] mb-1">Products Limit</p>
            <p className="text-xl font-bold text-[#1F2937]">
              {plan === 'free' ? '10' : 'Unlimited'}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280] mb-1">Features</p>
            <p className="text-xl font-bold text-[#1F2937]">
              {plan === 'free' ? 'Limited' : 'All Features Enabled'}
            </p>
          </div>
        </div>

        {planStatus === 'expired' && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Subscription Expired ❌</p>
                <p className="text-sm text-red-700">Please renew your subscription to continue using the service.</p>
              </div>
            </div>
            {userRole === 'staff' ? (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                disabled={actionLoading}
              >
                Renew / Upgrade 🚀
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Current Usage */}
      <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
        <h3 className="text-lg font-bold text-[#1F2937] mb-4">Current Usage</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#6B7280]">Products</span>
              <span className="font-semibold text-[#1F2937]">
                {productsCount} / {plan === 'free' ? '10' : '∞'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#C89B5A] h-2 rounded-full transition-all"
                style={{ width: plan === 'free' ? `${(productsCount / 10) * 100}%` : '50%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Comparison Table */}
      <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
        <h3 className="text-lg font-bold text-[#1F2937] mb-4">Plan Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#1F2937]">Feature</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-[#1F2937]">
                  Free
                  {plan === 'free' && (
                    <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">Current</span>
                  )}
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-[#C89B5A]">
                  Pro
                  {plan === 'pro' && (
                    <span className="ml-2 px-2 py-1 bg-[#F3E8D9] text-[#C89B5A] rounded-full text-xs">Current</span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {features.map((feature, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 text-[#1F2937]">{feature.name}</td>
                  <td className="px-4 py-3 text-center">
                    {typeof feature.free === 'boolean' ? (
                      feature.free ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-600 mx-auto" />
                      )
                    ) : (
                      <span className="text-[#6B7280]">{feature.free}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {typeof feature.pro === 'boolean' ? (
                      feature.pro ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-600 mx-auto" />
                      )
                    ) : (
                      <span className="text-[#C89B5A] font-semibold">{feature.pro}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription History (Admin only) */}
      {userRole === 'admin' ? (
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-[#1F2937] mb-4">Subscription History</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#1F2937]">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#1F2937]">Plan</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#1F2937]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historyLoading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-[#6B7280]">
                      Loading history...
                    </td>
                  </tr>
                ) : historyError ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-[#6B7280]">
                      {historyError}
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-[#6B7280]">
                      No subscription history found.
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-[#6B7280]">
                        {item.startDate ? new Date(item.startDate).toLocaleDateString('en-GB') : '-'}
                      </td>
                      <td className="px-4 py-3 text-[#1F2937]">{item.plan?.name ?? '-'}</td>
                      <td className="px-4 py-3">
                        {item.status === 'ACTIVE' ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-red-600">Expired</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-[#1F2937] mb-4">Your Feature Access</h3>
          <div className="space-y-2 text-sm text-[#6B7280]">
            <div>Products: {plan === 'free' ? 'Limited (10)' : 'Unlimited'}</div>
            <div>Analytics: {currentFeatureFlags.analytics ? 'Enabled' : 'Locked'}</div>
            <div>Multi-Warehouse: {currentFeatureFlags.multiWarehouse ? 'Enabled' : 'Locked'}</div>
            <div>Bulk Import: {currentFeatureFlags.bulkImport ? 'Enabled' : 'Locked'}</div>
            <div>Export Reports: {currentFeatureFlags.export ? 'Enabled' : 'Locked'}</div>
          </div>
          <div className="mt-4 text-sm text-[#6B7280]">
            Upgrade to unlock premium features instantly.
          </div>
        </div>
      )}

      {actionError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-[#1F2937] mt-6">
          {actionError}
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Payment Gateway</h2>
            <p className="text-[#6B7280] mb-6">
              Select billing cycle, then continue to secure payment checkout.
            </p>
            <div className="mb-4">
              <label className="block text-sm text-[#1F2937] mb-2">Billing Cycle</label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as 'day' | 'week' | 'month')}
                className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
              >
                <option value="day">1 Day</option>
                <option value="week">1 Week</option>
                <option value="month">1 Month</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2 bg-[#EFEAE4] text-[#1F2937] rounded-xl hover:bg-[#E5DFD8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgrade}
                className="flex-1 px-4 py-2 bg-[#C89B5A] text-white rounded-xl hover:bg-[#B88A4A] transition-colors"
                disabled={actionLoading}
              >
                Proceed to Pay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Downgrade Modal */}
      {showDowngradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Downgrade to Free?</h2>
            
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-sm text-yellow-900">
                <strong>Warning:</strong> You currently have {productsCount} products.
                {productsCount > 10 && (
                  <>
                    <br />
                      Free plan allows only 10. You won't be able to add new products after your billing end date.
                  </>
                )}
              </p>
            </div>

            <p className="text-[#6B7280] mb-6">
              You will be downgraded immediately and premium features will be disabled now.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDowngradeModal(false)}
                className="flex-1 px-4 py-2 bg-[#EFEAE4] text-[#1F2937] rounded-xl hover:bg-[#E5DFD8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDowngrade}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                disabled={actionLoading}
              >
                Confirm Downgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
