import { useEffect, useState } from 'react';
import { Plus, Search, AlertTriangle, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useApp } from '../../context/AppContext';
import api from '../../api/axios';

export function Products() {
  const { products, addProduct } = useStore();
  const { plan, planStatus } = useApp();
  const [warehouses, setWarehouses] = useState<Array<{ _id: string; name: string }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Electronics',
    price: 0,
    stock: 0,
    warehouse: 'Main',
    lowStockThreshold: 5,
  });

  const categories = ['All', 'Electronics', 'Clothing', 'Accessories'];
  const stockLevels = ['All', 'Low Stock', 'Out of Stock'];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
    const matchesStock =
      stockFilter === 'All' ||
      (stockFilter === 'Low Stock' && product.stock < product.lowStockThreshold && product.stock > 0) ||
      (stockFilter === 'Out of Stock' && product.stock === 0);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const isFreeLimitReached = plan === 'free' && products.length >= 10;
    if (isFreeLimitReached) {
      alert('❌ Cannot add product\nLimit reached (10/10)\nContact admin or upgrade plan');
      return;
    }
    addProduct(newProduct);
    setShowAddModal(false);
    setNewProduct({
      name: '',
      category: 'Electronics',
      price: 0,
      stock: 0,
      warehouse: 'Main',
      lowStockThreshold: 5,
    });
  };

  const lowStockCount = products.filter((p) => p.stock < p.lowStockThreshold).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  useEffect(() => {
    let cancelled = false;
    const loadWarehouses = async () => {
      try {
        const res = await api.get('/warehouses');
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setWarehouses(list);
        if (list.length > 0) {
          setNewProduct((prev) => {
            const exists = list.some((w) => w.name === prev.warehouse);
            return { ...prev, warehouse: exists ? prev.warehouse : list[0].name };
          });
        }
      } catch {
        if (!cancelled) setWarehouses([]);
      }
    };
    loadWarehouses();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6 page-animate-right">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl text-gray-800 mb-1">Products</h1>
          <p className="text-gray-600">Manage and update your inventory</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={(plan === 'free' && products.length >= 10) || planStatus === 'expired'}
          className="px-6 py-3 rounded-lg text-white flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{ backgroundColor: '#C89B5A' }}
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Plan Limit Warning */}
      {plan === 'free' && products.length >= 10 && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          <p>❌ Product limit reached ({products.length}/10)</p>
          <p className="text-sm mt-1">Contact admin or upgrade plan to add more products</p>
        </div>
      )}

      {/* Quick Info Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Products</p>
          <p className="text-2xl text-gray-800">{products.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Low Stock</p>
          <p className="text-2xl text-gray-800 flex items-center gap-2">
            {lowStockCount} <AlertTriangle size={18} className="text-yellow-500" />
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Out of Stock</p>
          <p className="text-2xl text-gray-800">
            {outOfStockCount} <span className="text-red-500">❌</span>
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex gap-4 items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C89B5A] focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
          >
            {stockLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                categoryFilter === cat
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={categoryFilter === cat ? { backgroundColor: '#C89B5A' } : {}}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm text-gray-600">Product Name</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Category</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Stock</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Warehouse</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Price</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <p className="text-2xl mb-2">📦</p>
                    <p className="text-gray-800">No products found</p>
                    <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  (() => {
                    const isLowStock = product.stock < product.lowStockThreshold && product.stock > 0;
                    return (
                  <tr
                    key={product.id}
                    className={`border-b border-gray-100 ${
                      isLowStock ? 'bg-[#FEF3C7] hover:bg-[#1A1A1A] group' : 'hover:bg-[#1A1A1A] group'
                    }`}
                  >
                    <td className={`py-3 px-4 text-sm group-hover:!text-white ${isLowStock ? '!text-black' : 'text-gray-800'}`}>{product.name}</td>
                    <td className={`py-3 px-4 text-sm group-hover:!text-white ${isLowStock ? '!text-black' : 'text-gray-600'}`}>{product.category}</td>
                    <td className={`py-3 px-4 text-sm group-hover:!text-white ${isLowStock ? '!text-black' : 'text-gray-800'}`}>{product.stock}</td>
                    <td className={`py-3 px-4 text-sm group-hover:!text-white ${isLowStock ? '!text-black' : 'text-gray-600'}`}>{product.warehouse}</td>
                    <td className={`py-3 px-4 text-sm group-hover:!text-white ${isLowStock ? '!text-black' : 'text-gray-800'}`}>₹{product.price.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm group-hover:!text-white">
                      {product.stock === 0 ? (
                        <span className="text-red-600 group-hover:!text-white flex items-center gap-1">
                          Out ❌
                        </span>
                      ) : isLowStock ? (
                        <span className="!text-black group-hover:!text-white flex items-center gap-1">
                          Low <AlertTriangle size={14} />
                        </span>
                      ) : (
                        <span className="text-green-600 group-hover:!text-white">Active</span>
                      )}
                    </td>
                  </tr>
                    );
                  })()
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl text-gray-800">Add Product</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
                >
                  <option>Electronics</option>
                  <option>Clothing</option>
                  <option>Accessories</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Stock</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Warehouse</label>
                <select
                  value={newProduct.warehouse}
                  onChange={(e) => setNewProduct({ ...newProduct, warehouse: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
                  required
                >
                  {warehouses.length === 0 ? (
                    <option value="Main">Main</option>
                  ) : (
                    warehouses.map((w) => (
                      <option key={w._id} value={w.name}>
                        {w.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: '#C89B5A' }}
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
