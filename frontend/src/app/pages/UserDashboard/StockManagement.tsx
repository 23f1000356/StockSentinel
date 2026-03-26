import { useState } from 'react';
import { Search, Minus, Plus, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { useStore } from '../../store/useStore';

export function StockManagement() {
  const { products, updateProductStock } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockItems = products.filter((p) => p.stock < p.lowStockThreshold && p.stock > 0);
  const outOfStockItems = products.filter((p) => p.stock === 0);

  const categories = ['All', 'Electronics', 'Clothing', 'Accessories'];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
    const matchesStock =
      stockFilter === 'All' ||
      (stockFilter === 'In Stock' && product.stock >= product.lowStockThreshold) ||
      (stockFilter === 'Low Stock' && product.stock < product.lowStockThreshold && product.stock > 0) ||
      (stockFilter === 'Out of Stock' && product.stock === 0);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const getProductId = (p: any) => String(p?._id ?? p?.id ?? '');

  const handleStockChange = async (productId: string, change: number) => {
    const product = products.find((p: any) => getProductId(p) === productId);
    if (!product) return;

    const newStock = Math.max(0, Number(product.stock ?? 0) + change);
    setUpdatingId(productId);
    try {
      await updateProductStock(productId, newStock);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 page-animate-right">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl text-gray-800 mb-1">Stock Management</h1>
        <p className="text-gray-600">Monitor and update product stock levels</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Products</p>
              <p className="text-2xl text-gray-800">{products.length}</p>
            </div>
            <Package className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Stock</p>
              <p className="text-2xl text-gray-800">{totalStock}</p>
            </div>
            <TrendingUp className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Low Stock</p>
              <p className="text-2xl text-gray-800 flex items-center gap-1">
                {lowStockItems.length}
                <AlertTriangle className="text-yellow-500" size={18} />
              </p>
            </div>
            <AlertTriangle className="text-yellow-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
              <p className="text-2xl text-gray-800">{outOfStockItems.length}</p>
            </div>
            <span className="text-2xl">❌</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search product..."
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

          {/* Stock Status Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
          >
            <option value="All">All</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2">
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

      {/* Stock Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm text-gray-600">Product</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Category</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Warehouse</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Stock</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Update</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <p className="text-2xl mb-2">📦</p>
                    <p className="text-gray-800">No products available</p>
                    <p className="text-sm text-gray-500 mt-1">Add products to manage stock</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product: any) => {
                  const productId = getProductId(product);
                  const isUpdating = updatingId === productId;
                  const isLowStock = product.stock < product.lowStockThreshold && product.stock > 0;
                  const isOutOfStock = product.stock === 0;
                  return (
                  <tr
                    key={productId}
                    className={`group border-b border-gray-100 hover:!bg-[#111111] ${
                      isLowStock
                        ? 'bg-[#FEF3C7]'
                        : isOutOfStock
                        ? 'bg-[#FEE2E2]'
                        : ''
                    }`}
                    style={{}}
                  >
                    <td
                      className={`py-3 px-4 text-sm ${
                        isLowStock || isOutOfStock ? '!text-black group-hover:!text-white' : 'text-gray-800 group-hover:!text-white'
                      }`}
                    >
                      {product.name}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm ${
                        isLowStock || isOutOfStock ? '!text-black group-hover:!text-white' : 'text-gray-600 group-hover:!text-white'
                      }`}
                    >
                      {product.category}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm ${
                        isLowStock || isOutOfStock ? '!text-black group-hover:!text-white' : 'text-gray-600 group-hover:!text-white'
                      }`}
                    >
                      {product.warehouse}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm font-medium ${
                        isLowStock || isOutOfStock ? '!text-black group-hover:!text-white' : 'text-gray-800 group-hover:!text-white'
                      }`}
                    >
                      {product.stock}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStockChange(productId, -1)}
                          disabled={isUpdating}
                          className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm text-gray-800 group-hover:!text-white font-medium w-12 text-center">
                          {product.stock}
                        </span>
                        <button
                          onClick={() => handleStockChange(productId, 1)}
                          disabled={isUpdating}
                          className="w-8 h-8 rounded-lg text-white flex items-center justify-center transition-colors disabled:opacity-50"
                          style={{ backgroundColor: '#C89B5A' }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {isOutOfStock ? (
                        <span className={`${isLowStock || isOutOfStock ? '!text-black group-hover:!text-white' : 'text-red-600 group-hover:!text-white'} flex items-center gap-1`}>
                          Out ❌
                        </span>
                      ) : isLowStock ? (
                        <span className="!text-black group-hover:!text-white flex items-center gap-1">
                          Low <AlertTriangle size={14} />
                        </span>
                      ) : (
                        <span className="text-green-600 group-hover:!text-white">In Stock</span>
                      )}
                    </td>
                    <td className={`py-3 px-4 text-sm ${isLowStock || isOutOfStock ? '!text-black group-hover:!text-white' : 'text-gray-500 group-hover:!text-white'}`}>Today</td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alert Section */}
      {lowStockItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-yellow-600" size={20} />
            Low Stock Items
          </h2>
          <div className="space-y-2">
            {lowStockItems.map((product: any) => {
              const productId = getProductId(product);
              const isUpdating = updatingId === productId;
              return (
              <div
                key={productId}
                className="group flex items-center justify-between p-3 rounded-lg bg-[#FEF3C7] hover:!bg-[#111111] transition-colors"
                style={{ backgroundColor: '#FEF3C7' }}
              >
                <div>
                  <p className="text-sm !text-black group-hover:!text-white font-medium">{product.name}</p>
                  <p className="text-xs !text-black group-hover:!text-white">{product.stock} units remaining</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStockChange(productId, -1)}
                    disabled={isUpdating}
                    className="w-8 h-8 rounded-lg bg-white text-black hover:bg-gray-100 group-hover:bg-[#222222] group-hover:text-white flex items-center justify-center disabled:opacity-50"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm !text-black group-hover:!text-white font-medium w-8 text-center">{product.stock}</span>
                  <button
                    onClick={() => handleStockChange(productId, 1)}
                    disabled={isUpdating}
                    className="w-8 h-8 rounded-lg text-white flex items-center justify-center disabled:opacity-50"
                    style={{ backgroundColor: '#C89B5A' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )})}
          </div>
        </div>
      )}
    </div>
  );
}
