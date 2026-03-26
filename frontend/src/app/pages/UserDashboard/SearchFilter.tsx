import { useState } from 'react';
import { Search, X, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store/useStore';

export function SearchFilter() {
  const { products } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');

  const categories = ['All', 'Electronics', 'Clothing', 'Accessories'];
  const stockLevels = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

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

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setStockFilter('All');
  };

  const hasActiveFilters = searchTerm !== '' || categoryFilter !== 'All' || stockFilter !== 'All';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl text-gray-800 mb-1">Search & Filters</h1>
        <p className="text-gray-600">Find products quickly using filters</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C89B5A] focus:border-transparent text-lg"
          />
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-2">Stock Level</label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C89B5A]"
            >
              {stockLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="px-4 py-2 rounded-lg flex items-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={16} />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-800">
            Showing <span className="font-medium">{filteredProducts.length}</span> results
          </p>
          {hasActiveFilters && (
            <div className="flex gap-2 mt-2 text-sm text-gray-600">
              {categoryFilter !== 'All' && (
                <span className="px-3 py-1 bg-gray-100 rounded-lg">Category: {categoryFilter}</span>
              )}
              {stockFilter !== 'All' && (
                <span className="px-3 py-1 bg-gray-100 rounded-lg">Stock: {stockFilter}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Products Display */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-xl text-gray-800 mb-2">No products found</p>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg ${
                product.stock < product.lowStockThreshold && product.stock > 0
                  ? 'border-l-4 border-yellow-400'
                  : product.stock === 0
                  ? 'border-l-4 border-red-400'
                  : ''
              }`}
              style={
                product.stock < product.lowStockThreshold && product.stock > 0
                  ? { backgroundColor: '#FEF3C7' }
                  : product.stock === 0
                  ? { backgroundColor: '#FEE2E2' }
                  : {}
              }
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-2xl">
                  📦
                </div>
                {product.stock < product.lowStockThreshold && product.stock > 0 && (
                  <AlertTriangle className="text-yellow-600" size={20} />
                )}
                {product.stock === 0 && <span className="text-red-600">❌</span>}
              </div>

              <h3 className="text-lg text-gray-800 mb-2">{product.name}</h3>

              <div className="space-y-1 mb-4">
                <p className="text-sm text-gray-600">
                  Category: <span className="text-gray-800">{product.category}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Stock:{' '}
                  <span
                    className={`font-medium ${
                      product.stock === 0
                        ? 'text-red-600'
                        : product.stock < product.lowStockThreshold
                        ? 'text-yellow-700'
                        : 'text-gray-800'
                    }`}
                  >
                    {product.stock} units
                    {product.stock < product.lowStockThreshold && product.stock > 0 && ' ⚠️'}
                    {product.stock === 0 && ' ❌'}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Price: <span className="text-gray-800 font-medium">₹{product.price.toLocaleString()}</span>
                </p>
              </div>

              {product.stock < product.lowStockThreshold && (
                <div className="pt-3 border-t border-gray-200">
                  {product.stock === 0 ? (
                    <p className="text-sm text-red-600">Out of stock</p>
                  ) : (
                    <p className="text-sm text-yellow-700">Low stock warning</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination (Mock) */}
      {filteredProducts.length > 0 && (
        <div className="flex justify-center gap-2">
          <button className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50">
            &lt; Prev
          </button>
          <button className="px-3 py-2 rounded-lg text-white" style={{ backgroundColor: '#C89B5A' }}>
            1
          </button>
          <button className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">
            2
          </button>
          <button className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">
            3
          </button>
          <button className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">
            Next &gt;
          </button>
        </div>
      )}
    </div>
  );
}
