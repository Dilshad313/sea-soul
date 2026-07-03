import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Image as ImageIcon, Package, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/admin/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    const id = deleteConfirm;
    setDeleteConfirm(null);
    const toastId = toast.loading('Deleting product...');

    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product deleted successfully! 🗑️', {
        id: toastId,
        duration: 3000,
      });
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product', {
        id: toastId,
        duration: 4000,
      });
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Resorts: 'bg-blue-100 text-blue-700',
      Activities: 'bg-green-100 text-green-700',
      Scuba: 'bg-cyan-100 text-cyan-700',
      Honeymoon: 'bg-pink-100 text-pink-700',
      Dining: 'bg-orange-100 text-orange-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const filteredProducts = products.filter(product => {
    const matchCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const categories = ['all', ...new Set(products.map(p => p.category))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E5FF] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2B49]">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your products and packages</p>
        </div>
        <Link
          to="/products/add"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00E5FF] text-[#1A2B49] font-semibold rounded-xl hover:bg-[#00E5FF]/80 transition shadow-sm"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-[#1A2B49] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
          <div className="flex flex-col items-center">
            <Package size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-[#1A2B49]">No products found</h3>
            <p className="text-gray-500 text-sm mt-1">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter' 
                : 'Add your first product to get started'}
            </p>
            {(searchTerm || selectedCategory !== 'all') ? (
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                className="mt-4 text-[#00E5FF] font-medium hover:underline"
              >
                Clear filters
              </button>
            ) : (
              <Link
                to="/products/add"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#00E5FF] text-[#1A2B49] font-semibold rounded-xl hover:bg-[#00E5FF]/80 transition"
              >
                <Plus size={18} />
                Add Product
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-52 bg-gray-100">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-50">
                    <ImageIcon size={48} className="text-gray-300" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  {product.isFeatured && (
                    <span className="px-2.5 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                      FEATURED
                    </span>
                  )}
                  {product.isTrending && (
                    <span className="px-2.5 py-1 bg-red-400 text-red-900 text-xs font-bold rounded-full">
                      TRENDING
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#1A2B49] truncate">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      📍 {product.location || 'Location not specified'}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getCategoryColor(product.category)}`}>
                    {product.category}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xl font-bold text-[#00E5FF]">
                    ₹{product.price}
                  </span>
                  {product.duration && (
                    <span className="text-xs text-gray-400">• {product.duration}</span>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 pt-3 border-t border-gray-100">
                  <Link
                    to={`/products/edit/${product._id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition"
                  >
                    <Edit size={15} />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-[#1A2B49] mb-2">Delete Product?</h3>
              <p className="text-gray-500 text-sm mb-6">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}