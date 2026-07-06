import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Upload, Image as ImageIcon, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    location: '',
    duration: '',
    isFeatured: false,
    isTrending: false,
    images: [],
  });

  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/admin/products/${id}`);
      const product = response.data.product;
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        location: product.location || '',
        duration: product.duration || '',
        isFeatured: product.isFeatured || false,
        isTrending: product.isTrending || false,
        images: product.images || [],
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product data');
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const toastId = toast.loading('Uploading images...');

    const uploadedImages = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post('/admin/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          uploadedImages.push(response.data.url);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image: ' + file.name);
      }
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...uploadedImages],
    }));
    setUploading(false);
    e.target.value = '';

    toast.success(`${uploadedImages.length} image(s) uploaded successfully!`, {
      id: toastId,
    });
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    toast.success('Image removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading(isEdit ? 'Updating product...' : 'Creating product...');

    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
      };

      if (isEdit) {
        await api.put(`/admin/products/${id}`, data);
        toast.success('Product updated successfully! 🎉', {
          id: toastId,
          duration: 3000,
        });
      } else {
        await api.post('/admin/products', data);
        toast.success('Product created successfully! 🎉', {
          id: toastId,
          duration: 3000,
        });
      }
      navigate('/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product', {
        id: toastId,
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? 'Edit Product' : 'Add Product'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF]"
                required
                placeholder="e.g., Luxury Beach Resort"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF]"
                required
                placeholder="Describe your product in detail..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF]"
                  required
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF]"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Resorts">Resorts</option>
                  <option value="Activities">Activities</option>
                  <option value="Scuba">Scuba</option>
                  <option value="Honeymoon">Honeymoon</option>
                  <option value="Dining">Dining</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF]"
                  required
                  placeholder="e.g., Agatti Island"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF]"
                  placeholder="3 Nights / 4 Days"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#00E5FF]"
                />
                <span className="text-sm text-gray-700">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isTrending"
                  checked={formData.isTrending}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#00E5FF]"
                />
                <span className="text-sm text-gray-700">Trending</span>
              </label>
            </div>
          </div>

          {/* Right Column - Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-[#00E5FF] transition">
              <label className="block cursor-pointer">
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 text-center">
                    Click to upload images
                  </p>
                  <p className="text-xs text-gray-400 mt-1 text-center">
                    PNG, JPG, JPEG, WEBP (Max 5MB each)
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              {uploading && (
                <div className="text-center text-sm text-[#00E5FF] py-2">
                  Uploading... Please wait
                </div>
              )}
            </div>

            {formData.images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Uploaded Images ({formData.images.length})
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100x100?text=Error';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 mt-6">
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-6 py-2 bg-[#00E5FF] text-[#0D1516] font-bold rounded-xl hover:opacity-90 disabled:opacity-50 w-full sm:w-auto"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 w-full sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}