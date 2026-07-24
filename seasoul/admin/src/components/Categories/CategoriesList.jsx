import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function CategoriesList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
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
    const toastId = toast.loading('Deleting category...');

    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted successfully! 🗑️', {
        id: toastId,
        duration: 3000,
      });
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category', {
        id: toastId,
        duration: 4000,
      });
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/categories/${id}`, { isActive: !currentStatus });
      toast.success(`Category ${!currentStatus ? 'activated' : 'deactivated'}!`);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to update category status');
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to get icon name safely
  const getIconName = (category) => {
    return category.icon && category.icon.trim() !== '' ? category.icon : 'category';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E5FF] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2B49]">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage package categories</p>
        </div>
        <Link
          to="/categories/add"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00E5FF] text-[#1A2B49] font-semibold rounded-xl hover:bg-[#00E5FF]/80 transition shadow-sm"
        >
          <Plus size={18} />
          Add Category
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-full md:max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent"
        />
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 text-center border border-gray-100">
          <div className="flex flex-col items-center">
            <span className="material-icons text-6xl text-gray-300">category</span>
            <h3 className="text-lg font-medium text-[#1A2B49]">No categories found</h3>
            <p className="text-gray-500 text-sm mt-1">
              {searchTerm ? 'Try adjusting your search' : 'Add your first category'}
            </p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-[#00E5FF] font-medium hover:underline"
              >
                Clear search
              </button>
            ) : (
              <Link
                to="/categories/add"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#00E5FF] text-[#1A2B49] font-semibold rounded-xl hover:bg-[#00E5FF]/80 transition"
              >
                <Plus size={18} />
                Add Category
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filteredCategories.map((category) => {
            const iconName = getIconName(category);
            return (
              <div
                key={category._id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="p-4 md:p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: category.color + '20' }}
                      >
                        <span 
                          className="material-icons text-2xl"
                          style={{ color: category.color }}
                        >
                          {iconName}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1A2B49]">{category.name}</h3>
                        <p className="text-xs text-gray-400">Slug: {category.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleStatus(category._id, category.isActive)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition"
                        title={category.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {category.isActive ? (
                          <Eye size={16} className="text-green-500" />
                        ) : (
                          <EyeOff size={16} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {category.description && (
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                    <span className={`px-2 py-0.5 rounded-full ${
                      category.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded-full flex items-center gap-1">
                      <span className="material-icons text-sm text-gray-500 align-middle">
                        {iconName}
                      </span>
                      <span className="text-xs text-gray-400">{iconName}</span>
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-2 pt-3 border-t border-gray-100">
                    <Link
                      to={`/categories/edit/${category._id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition"
                    >
                      <Edit size={15} />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
              <h3 className="text-xl font-bold text-[#1A2B49] mb-2">Delete Category?</h3>
              <p className="text-gray-500 text-sm mb-6">
                Are you sure you want to delete this category? This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
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