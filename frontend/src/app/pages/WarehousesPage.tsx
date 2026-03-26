import { useEffect, useState } from 'react';
import { Plus, MapPin, Package, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router';
import api from '../api/axios';

interface Warehouse {
  _id: string;
  name: string;
  location: string;
}

export function WarehousesPage() {
  const { plan, planStatus } = useApp();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [warehouseForm, setWarehouseForm] = useState({ name: '', location: '' });

  // Free plan allows only 1 warehouse. Pro allows unlimited.
  const canAddWarehouse = planStatus === 'active' && (plan === 'pro' || warehouses.length < 1);

  const refreshWarehouses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data);
      const productsRes = await api.get('/products');
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 402) setError('Subscription expired. Upgrade to continue.');
      else if (status === 403) setError('Warehouses are a Pro feature. Upgrade to Pro.');
      else setError('Failed to load warehouses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (planStatus !== 'active') return;
    refreshWarehouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planStatus]);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setWarehouseForm({ name: '', location: '' });
    setModalOpen(true);
  };

  const openEditModal = (wh: Warehouse) => {
    setModalMode('edit');
    setEditingId(wh._id);
    setWarehouseForm({ name: wh.name, location: wh.location ?? '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (modalMode === 'create' && !canAddWarehouse) return;
    if (!warehouseForm.name.trim()) return;
    if (!warehouseForm.location.trim()) return;

    try {
      if (modalMode === 'create') {
        await api.post('/warehouses', {
          name: warehouseForm.name,
          location: warehouseForm.location,
        });
      } else if (modalMode === 'edit' && editingId) {
        await api.patch(`/warehouses/${editingId}`, {
          name: warehouseForm.name,
          location: warehouseForm.location,
        });
      }

      setModalOpen(false);
      setWarehouseForm({ name: '', location: '' });
      await refreshWarehouses();
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Failed to save warehouse.';
      setError(message);
    }
  };

  return (
    <div className="page-animate-right">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1F2937]">Warehouses</h1>
          <p className="text-[#6B7280] mt-1">Manage your storage locations</p>
        </div>
        <button
          onClick={openCreateModal}
          disabled={!canAddWarehouse}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors ${
            !canAddWarehouse
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#C89B5A] text-white hover:bg-[#B88A4A]'
          }`}
        >
          <Plus className="w-5 h-5" />
          Add Warehouse
        </button>
      </div>

      {/* Feature Gating Banner */}
      {plan === 'free' ? (
        <div className="mb-6 bg-[#FEF3C7] border border-yellow-300 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-yellow-900">Multi-Warehouse is a Pro Feature</p>
              <p className="text-sm text-yellow-800 mt-1">Free plan allows only 1 warehouse</p>
            </div>
            <Link
              to="/user/subscription"
              className="px-6 py-2 bg-[#C89B5A] text-white rounded-xl hover:bg-[#B88A4A] transition-colors"
            >
              Upgrade to Pro 🚀
            </Link>
          </div>
        </div>
      ) : (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="font-semibold text-green-900">✅ You can create multiple warehouses</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <p className="text-sm text-[#6B7280]">Total Warehouses</p>
          <p className="text-2xl font-bold text-[#1F2937] mt-1">{warehouses.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <p className="text-sm text-[#6B7280]">Total Stock</p>
          <p className="text-2xl font-bold text-[#1F2937] mt-1">
            {products.reduce((sum, p) => sum + Number(p.stock ?? 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <p className="text-sm text-[#6B7280]">Total Categories</p>
          <p className="text-2xl font-bold text-[#1F2937] mt-1">
            {new Set(products.map((p) => String(p.category ?? '').trim()).filter(Boolean)).size}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-[#1F2937]">
          {error}
        </div>
      )}

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full bg-white rounded-2xl p-6 shadow-md text-[#6B7280]">Loading warehouses...</div>
        ) : warehouses.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-6 shadow-md text-[#6B7280]">No warehouses found.</div>
        ) : (
          warehouses.map((warehouse) => (
            <div key={warehouse._id} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-[#1F2937] mb-2">{warehouse.name}</h3>

              <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-6">
                <MapPin className="w-4 h-4" />
                <span>{warehouse.location}</span>
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/user/warehouses/${warehouse._id}`}
                  className="flex-1 px-4 py-2 bg-[#C89B5A] text-white rounded-xl hover:bg-[#B88A4A] transition-colors text-sm text-center"
                >
                  View
                </Link>
                <button
                  onClick={() => openEditModal(warehouse)}
                  className="flex-1 px-4 py-2 bg-[#C89B5A] text-white rounded-xl hover:bg-[#B88A4A] transition-colors text-sm"
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        )}

        {/* Locked Card for Free Plan */}
        {plan === 'free' && !canAddWarehouse && (
          <div className="bg-white rounded-2xl p-6 shadow-md opacity-60">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-[#1F2937] mb-2">🔒 Add New Warehouse</h3>
                <p className="text-sm text-[#6B7280] mb-4">Upgrade to Pro to unlock multiple warehouses</p>
                <Link
                  to="/user/subscription"
                  className="inline-block px-6 py-2 bg-[#C89B5A] text-white rounded-xl hover:bg-[#B88A4A] transition-colors"
                >
                  Upgrade 🚀
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Warehouse Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-[#1F2937] mb-4">
              {modalMode === 'create' ? 'Add Warehouse' : 'Edit Warehouse'}
            </h2>

            {modalMode === 'create' && !canAddWarehouse && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                <p className="text-yellow-900 font-semibold">Free plan allows only 1 warehouse</p>
                <Link
                  to="/user/subscription"
                  className="inline-block mt-2 px-4 py-2 bg-[#C89B5A] text-white rounded-lg text-sm hover:bg-[#B88A4A]"
                >
                  Upgrade Plan 🚀
                </Link>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">Warehouse Name</label>
                <input
                  type="text"
                  value={warehouseForm.name}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
                  placeholder="Enter warehouse name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">Location</label>
                <input
                  type="text"
                  value={warehouseForm.location}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, location: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
                  placeholder="Enter location"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-2 bg-[#EFEAE4] text-[#1F2937] rounded-xl hover:bg-[#E5DFD8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={modalMode === 'create' ? !canAddWarehouse : false}
                className={`flex-1 px-4 py-2 rounded-xl transition-colors ${
                  modalMode === 'create' && !canAddWarehouse
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#C89B5A] text-white hover:bg-[#B88A4A]'
                }`}
              >
                {modalMode === 'create' ? 'Create Warehouse' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
