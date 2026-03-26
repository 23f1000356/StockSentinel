import { useState } from 'react';
import { Plus, Search, Edit, Trash2, MinusCircle, PlusCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router';

interface Product {
  id: number;
  name: string;
  category: string;
  stock: number;
  warehouse: string;
  price: string;
  status: 'active' | 'low' | 'out';
}

const initialProducts: Product[] = [
  { id: 1, name: 'iPhone 14', category: 'Electronics', stock: 25, warehouse: 'Main', price: '₹80,000', status: 'active' },
  { id: 2, name: 'Shoes', category: 'Fashion', stock: 5, warehouse: 'Main', price: '₹2,000', status: 'low' },
  { id: 3, name: 'Laptop', category: 'Electronics', stock: 15, warehouse: 'Main', price: '₹65,000', status: 'active' },
  { id: 4, name: 'T-Shirt', category: 'Fashion', stock: 30, warehouse: 'Main', price: '₹500', status: 'active' },
  { id: 5, name: 'Watch', category: 'Accessories', stock: 0, warehouse: 'Main', price: '₹3,500', status: 'out' },
  { id: 6, name: 'Headphones', category: 'Electronics', stock: 20, warehouse: 'Main', price: '₹5,000', status: 'active' },
  { id: 7, name: 'Bag', category: 'Fashion', stock: 8, warehouse: 'Main', price: '₹1,500', status: 'low' },
];

export function ProductsPage() {
  const { plan, planStatus, productsCount, productsLimit, addProduct, deleteProduct } = useApp();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    warehouse: 'Main',
  });

  const usagePercentage = (productsCount / productsLimit) * 100;
  const isLimitReached = productsCount >= productsLimit;
  const isNearLimit = usagePercentage >= 80;

  const handleAddProduct = () => {
    if (planStatus === 'expired') {
      alert('Your subscription has expired. Please renew to continue.');
      return;
    }

    if (isLimitReached) {
      alert('Product limit reached! Upgrade to Pro for unlimited products.');
      return;
    }

    if (newProduct.name && newProduct.category && newProduct.price && newProduct.stock) {
      const product: Product = {
        id: products.length + 1,
        name: newProduct.name,
        category: newProduct.category,
        stock: parseInt(newProduct.stock),
        warehouse: newProduct.warehouse,
        price: newProduct.price,
        status: parseInt(newProduct.stock) === 0 ? 'out' : parseInt(newProduct.stock) < 10 ? 'low' : 'active',
      };
      setProducts([...products, product]);
      addProduct();
      setShowAddModal(false);
      setNewProduct({ name: '', category: '', price: '', stock: '', warehouse: 'Main' });
    }
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
    deleteProduct();
  };

  const updateStock = (id: number, change: number) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const newStock = Math.max(0, p.stock + change);
        return {
          ...p,
          stock: newStock,
          status: newStock === 0 ? 'out' : newStock < 10 ? 'low' : 'active',
        };
      }
      return p;
    }));
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getBannerColor = () => {
    if (isLimitReached) return 'bg-red-50 border-red-200';
    if (isNearLimit) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const getBannerText = () => {
    if (isLimitReached) {
      return {
        title: 'Limit Reached ❌',
        message: 'Upgrade to Pro to add more products 🚀',
      };
    }
    if (isNearLimit) {
      return {
        title: `Products Usage: ${productsCount} / ${productsLimit}`,
        message: `Only ${productsLimit - productsCount} product(s) remaining ⚠️`,
      };
    }
    return {
      title: `Products Usage: ${productsCount} / ${plan === 'free' ? productsLimit : '∞'}`,
      message: `You can add ${productsLimit - productsCount} more products`,
    };
  };

  const bannerText = getBannerText();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1F2937]">Products</h1>
          <p className="text-[#6B7280] mt-1">Manage your inventory products</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={isLimitReached || planStatus === 'expired'}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-colors w-full sm:w-auto ${
            isLimitReached || planStatus === 'expired'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#C89B5A] text-white hover:bg-[#B88A4A]'
          }`}
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Subscription Expired Banner */}
      {planStatus === 'expired' && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-red-900">Subscription Expired ❌</p>
              <p className="text-sm text-red-700 mt-1">All actions are disabled. Please renew your subscription.</p>
            </div>
            <Link
              to="/subscription"
              className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              Renew Now
            </Link>
          </div>
        </div>
      )}

      {/* Usage Banner */}
      <div className={`mb-6 border rounded-2xl p-4 ${getBannerColor()}`}>
        <div className="flex items-center justify-between mb-2">
          <p className="font-semibold text-gray-900">{bannerText.title}</p>
          {isLimitReached && (
            <Link
              to="/subscription"
              className="px-4 py-2 bg-[#C89B5A] text-white rounded-xl text-sm hover:bg-[#B88A4A] transition-colors"
            >
              Upgrade Now
            </Link>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isLimitReached ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(100, usagePercentage)}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-700">{bannerText.message}</p>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 bg-white rounded-2xl p-4 shadow-md">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="🔍 Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
              />
            </div>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
          >
            <option value="all">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Accessories">Accessories</option>
          </select>

          <button
            disabled={plan === 'free'}
            className={`px-4 py-2 rounded-xl ${
              plan === 'free'
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#EFEAE4] text-[#1F2937] hover:bg-[#E5DFD8]'
            }`}
            title={plan === 'free' ? 'Upgrade to Pro to use this feature' : ''}
          >
            Bulk Import
          </button>

          <button
            disabled={plan === 'free'}
            className={`px-4 py-2 rounded-xl ${
              plan === 'free'
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#EFEAE4] text-[#1F2937] hover:bg-[#E5DFD8]'
            }`}
            title={plan === 'free' ? 'Upgrade to Pro to use this feature' : ''}
          >
            Export
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Product Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Stock</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Warehouse</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1F2937]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className={product.status === 'low' ? 'bg-[#FEF3C7]' : product.status === 'out' ? 'bg-red-50' : ''}
                >
                  <td className="px-6 py-4 text-[#1F2937]">{product.name}</td>
                  <td className="px-6 py-4 text-[#6B7280]">{product.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateStock(product.id, -1)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <MinusCircle className="w-4 h-4" />
                      </button>
                      <span className="font-semibold w-8 text-center">{product.stock}</span>
                      <button
                        onClick={() => updateStock(product.id, 1)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <PlusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#6B7280]">{product.warehouse}</td>
                  <td className="px-6 py-4 text-[#1F2937]">{product.price}</td>
                  <td className="px-6 py-4">
                    {product.status === 'active' && <span className="text-green-600">✅ Active</span>}
                    {product.status === 'low' && <span className="text-yellow-600">⚠️ Low</span>}
                    {product.status === 'out' && <span className="text-red-600">❌ Out</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Add Product</h2>

            {isLimitReached && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-900 font-semibold">You've reached your limit ({productsCount}/{productsLimit})</p>
                <Link
                  to="/subscription"
                  className="inline-block mt-2 px-4 py-2 bg-[#C89B5A] text-white rounded-lg text-sm hover:bg-[#B88A4A]"
                >
                  Upgrade Plan 🚀
                </Link>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">Product Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
                >
                  <option value="">Select category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">Price</label>
                <input
                  type="text"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
                  placeholder="₹0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">Stock</label>
                <input
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">Warehouse</label>
                <select
                  value={newProduct.warehouse}
                  onChange={(e) => setNewProduct({ ...newProduct, warehouse: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
                >
                  <option value="Main">Main</option>
                  <option value="Secondary">Secondary</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-[#EFEAE4] text-[#1F2937] rounded-xl hover:bg-[#E5DFD8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                disabled={isLimitReached}
                className={`flex-1 px-4 py-2 rounded-xl transition-colors ${
                  isLimitReached
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#C89B5A] text-white hover:bg-[#B88A4A]'
                }`}
              >
                Create Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
