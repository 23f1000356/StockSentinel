import { useState } from 'react';
import { Search, Minus, Plus, Package, AlertTriangle, TrendingUp, Trash2, X } from 'lucide-react';
import { useStore } from '../../store/useStore';

export function StockManagement() {
  const { products, updateProductStock, deleteProduct } = useStore();
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
  const [productToDelete, setProductToDelete] = useState<any | null>(null);

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

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    const productId = getProductId(productToDelete);
    
    setUpdatingId(productId);
    try {
      await deleteProduct(productId);
      setProductToDelete(null);
    } catch (err) {
      alert('Failed to delete product');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 page-animate-right">
      {/* Styled Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in transition-all">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-2">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <button 
                onClick={() => setProductToDelete(null)} 
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-gray-900">"{productToDelete.name}"</span>? 
              This action will remove it from all warehouses and stock management records.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                disabled={updatingId !== null}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={updatingId !== null}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 font-medium flex items-center justify-center"
              >
                {updatingId !== null ? 'Deleting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl text-gray-800 mb-1">Stock Management</h1>
        <p className="text-gray-600">Monitor and update product stock levels</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
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

          <div className="flex gap-4">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
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
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
            >
              <option value="All">All</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 min-w-0 overflow-x-auto pb-2 no-scrollbar scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
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
                <th className="text-left py-3 px-4 text-sm text-gray-600">Actions</th>
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
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setProductToDelete(product)}
                        disabled={isUpdating}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Delete product"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
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
                className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg bg-[#FEF3C7] hover:!bg-[#111111] transition-colors gap-3"
                style={{ backgroundColor: '#FEF3C7' }}
              >
                <div>
                  <p className="text-sm !text-black group-hover:!text-white font-medium">{product.name}</p>
                  <p className="text-xs !text-black group-hover:!text-white">{product.stock} units remaining</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start bg-white/50 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                  <button
                    onClick={() => handleStockChange(productId, -1)}
                    disabled={isUpdating}
                    className="w-8 h-8 rounded-lg bg-white text-black hover:bg-gray-100 group-hover:bg-[#222222] group-hover:text-white flex items-center justify-center disabled:opacity-50 border border-gray-200 sm:border-none"
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
                    <button
                      onClick={() => setProductToDelete(product)}
                      disabled={isUpdating}
                      className="w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-colors disabled:opacity-50 ml-1"
                      title="Delete product"
                    >
                      <Trash2 size={14} />
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
