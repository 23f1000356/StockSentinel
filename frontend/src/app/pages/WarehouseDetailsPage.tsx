import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import api from '../api/axios';

type Warehouse = { _id: string; name: string; location: string };
type Product = {
  _id: string;
  name: string;
  category: string;
  warehouse?: string;
  stock: number;
  price: number;
};

export function WarehouseDetailsPage() {
  const { warehouseId } = useParams();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingProduct, setConfirmingProduct] = useState<Product | null>(null);
  const [removing, setRemoving] = useState(false);

  const refresh = async () => {
    if (!warehouseId) return;
    setLoading(true);
    setError(null);
    try {
      const [wRes, pRes] = await Promise.all([api.get('/warehouses'), api.get('/products')]);
      const list: Warehouse[] = Array.isArray(wRes.data) ? wRes.data : [];
      const selected = list.find((w) => String(w._id) === String(warehouseId)) ?? null;
      setWarehouse(selected);

      const allProducts: Product[] = Array.isArray(pRes.data) ? pRes.data : [];
      const selectedName = String(selected?.name ?? '').trim().toLowerCase();
      const filtered = allProducts.filter((p) => String(p.warehouse ?? 'Main').trim().toLowerCase() === selectedName);
      setProducts(filtered);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load warehouse details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouseId]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + Number(p.stock ?? 0), 0);
    const totalRevenue = products.reduce((sum, p) => sum + Number(p.stock ?? 0) * Number(p.price ?? 0), 0);
    const totalCategories = new Set(products.map((p) => String(p.category ?? '').trim()).filter(Boolean)).size;
    return { totalProducts, totalStock, totalRevenue, totalCategories };
  }, [products]);

  const handleRemove = async (productId: string) => {
    try {
      setRemoving(true);
      await api.delete(`/products/${productId}`);
      setConfirmingProduct(null);
      await refresh();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to remove product.');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1F2937]">Warehouse Details</h1>
          <p className="text-[#6B7280] mt-1">
            {warehouse ? `${warehouse.name} - ${warehouse.location}` : 'Warehouse'}
          </p>
        </div>
        <Link
          to="/user/warehouses"
          className="px-6 py-3 bg-[#C89B5A] text-white rounded-xl hover:bg-[#B88A4A] transition-colors"
        >
          Back
        </Link>
      </div>

      {error && <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-[#1F2937]">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <p className="text-sm text-[#6B7280]">Total Products</p>
          <p className="text-2xl font-bold text-[#1F2937] mt-1">{stats.totalProducts}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <p className="text-sm text-[#6B7280]">Total Stock</p>
          <p className="text-2xl font-bold text-[#1F2937] mt-1">{stats.totalStock}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <p className="text-sm text-[#6B7280]">Total Categories</p>
          <p className="text-2xl font-bold text-[#1F2937] mt-1">{stats.totalCategories}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <p className="text-sm text-[#6B7280]">Total Revenue</p>
          <p className="text-2xl font-bold text-[#1F2937] mt-1">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h2 className="text-xl font-bold text-[#1F2937] mb-4">Products in this Warehouse</h2>
        {loading ? (
          <div className="text-[#6B7280]">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-[#6B7280]">No products found in this warehouse.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#1F2937]">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#1F2937]">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#1F2937]">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#1F2937]">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#1F2937]">Revenue</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#1F2937]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p._id}>
                    <td className="px-4 py-3 text-[#1F2937]">{p.name}</td>
                    <td className="px-4 py-3 text-[#6B7280]">{p.category}</td>
                    <td className="px-4 py-3 text-[#1F2937]">{p.stock}</td>
                    <td className="px-4 py-3 text-[#1F2937]">₹{Number(p.price ?? 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-[#1F2937]">
                      ₹{(Number(p.stock ?? 0) * Number(p.price ?? 0)).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setConfirmingProduct(p)}
                        className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmingProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-[#1F2937] mb-2">Confirm Remove</h3>
            <p className="text-[#6B7280] mb-6">
              Remove <span className="font-semibold text-[#1F2937]">{confirmingProduct.name}</span> from this warehouse?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmingProduct(null)}
                disabled={removing}
                className="flex-1 px-4 py-2 bg-[#EFEAE4] text-[#1F2937] rounded-xl hover:bg-[#E5DFD8] transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemove(String(confirmingProduct._id))}
                disabled={removing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {removing ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

