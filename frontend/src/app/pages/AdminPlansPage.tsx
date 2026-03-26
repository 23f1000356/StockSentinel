import { useEffect, useMemo, useState } from 'react';
import { Pencil } from 'lucide-react';
import api from '../api/axios';

export function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editPlanId, setEditPlanId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{
    price: number;
    productLimit: number;
    warehouseLimit: number;
    features: string[];
  }>({ price: 0, productLimit: 0, warehouseLimit: 0, features: [] });

  const allFeatures = useMemo(
    () => ['ANALYTICS', 'MULTI_WAREHOUSE', 'BULK_IMPORT', 'EXPORT'],
    []
  );

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/admin/plans');
        if (cancelled) return;
        setPlans(res.data?.plans ?? []);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.response?.data?.message || 'Failed to load plans.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const editingPlan = useMemo(() => {
    if (!editPlanId) return null;
    return plans.find((p) => String(p._id ?? p.id) === String(editPlanId)) ?? null;
  }, [editPlanId, plans]);

  useEffect(() => {
    if (!editingPlan) return;
    setEditDraft({
      price: Number(editingPlan.price ?? 0),
      productLimit: Number(editingPlan.productLimit ?? 0),
      warehouseLimit: Number(editingPlan.warehouseLimit ?? (editingPlan.name === 'FREE' ? 1 : -1)),
      features: Array.isArray(editingPlan.features) ? editingPlan.features : [],
    });
  }, [editingPlan]);

  const toggleFeature = (f: string) => {
    setEditDraft((prev) => {
      const has = prev.features.includes(f);
      const nextFeatures = has ? prev.features.filter((x) => x !== f) : [...prev.features, f];
      return { ...prev, features: nextFeatures };
    });
  };

  const handleSavePlan = async () => {
    if (!editPlanId) return;
    setLoading(true);
    setError(null);
    try {
      const payload = {
        price: editDraft.price,
        features: editDraft.features,
        productLimit: editDraft.productLimit,
        warehouseLimit: editDraft.warehouseLimit,
      };
      const res = await api.patch(`/admin/plans/${editPlanId}`, payload);
      const updated = res.data?.plan;
      if (updated) {
        setPlans((prev) =>
          prev.map((p) => (String(p._id ?? p.id) === String(updated._id ?? updated.id) ? updated : p))
        );
      }
      setEditPlanId(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to save plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1F2937]">Plans</h1>
          <p className="text-[#6B7280] mt-1">Define features & usage limits</p>
        </div>
        <div className="text-sm text-[#6B7280]">Edit existing plans (FREE/PRO)</div>
      </div>

      {error && <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-[#1F2937]">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="text-[#6B7280]">Loading plans...</div>
        ) : (
          plans.map((p) => (
          <div key={p.name} className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#1F2937] mb-2">{p.name}</h2>
                <p className="text-[#6B7280] mb-4">₹{Number(p.price ?? 0)}</p>
              </div>
              <button
                className="px-4 py-2 bg-[#EFEAE4] text-[#1F2937] rounded-xl hover:bg-[#E5DFD8] transition-colors text-sm flex items-center gap-2"
                onClick={() => setEditPlanId(String(p._id ?? p.id))}
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-[#6B7280] mb-2">Features</p>
              {p.features.length === 0 ? (
                <div className="text-sm text-[#6B7280]">None</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {p.features.map((f) => (
                    <span key={f} className="px-3 py-1 bg-[#F3E8D9] text-[#C89B5A] rounded-full text-xs font-semibold">
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm text-[#6B7280] mb-2">Limits</p>
              <div className="text-sm text-[#1F2937] space-y-1">
                <div>
                  Max Products:{' '}
                  {String(p.productLimit) === '-1' ? 'Unlimited' : Number(p.productLimit ?? 0)}
                </div>
                <div>
                  Max Warehouses:{' '}
                  {typeof p.warehouseLimit === 'number' && p.warehouseLimit === -1 ? 'Unlimited' : Number(p.warehouseLimit ?? 0)}
                </div>
              </div>
            </div>

            <div className="mt-6 text-sm text-[#6B7280]">Click Edit to update plan settings.</div>
          </div>
        ))
        )}
      </div>

      {editPlanId && editingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Edit Plan: {editingPlan.name}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">Price (INR)</label>
                <input
                  type="number"
                  value={editDraft.price}
                  onChange={(e) => setEditDraft((prev) => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-1">Max Products</label>
                  <input
                    type="number"
                    value={editDraft.productLimit}
                    onChange={(e) => setEditDraft((prev) => ({ ...prev, productLimit: Number(e.target.value) }))}
                    className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-1">Max Warehouses</label>
                  <input
                    type="number"
                    value={editDraft.warehouseLimit}
                    onChange={(e) => setEditDraft((prev) => ({ ...prev, warehouseLimit: Number(e.target.value) }))}
                    className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
                  />
                </div>
              </div>

              <div>
                <div className="block text-sm font-medium text-[#1F2937] mb-2">Features</div>
                <div className="flex flex-wrap gap-2">
                  {allFeatures.map((f) => {
                    const checked = editDraft.features.includes(f);
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => toggleFeature(f)}
                        className={`px-3 py-2 rounded-xl border text-sm transition-colors ${
                          checked
                            ? 'bg-[#F3E8D9] border-[#C89B5A] text-[#C89B5A]'
                            : 'bg-white border-gray-200 text-[#6B7280] hover:border-gray-300'
                        }`}
                      >
                        {checked ? '✓ ' : ''}{f}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {error && <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-2xl p-3 text-[#1F2937]">{error}</div>}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditPlanId(null)}
                className="flex-1 px-4 py-2 bg-[#EFEAE4] text-[#1F2937] rounded-xl hover:bg-[#E5DFD8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlan}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[#C89B5A] text-white rounded-xl hover:bg-[#B88A4A] transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

