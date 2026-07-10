import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function ActivityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    duration: '',
    location: '',
    maxParticipants: '',
    isActive: true,
    includes: [],
    requirements: [],
    images: [],
  });

  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      fetchActivity();
    }
  }, [id]);

  const fetchActivity = async () => {
    try {
      const response = await api.get(`/admin/activities/${id}`);
      const activity = response.data.activity;
      setFormData({
        name: activity.name || '',
        description: activity.description || '',
        price: activity.price || '',
        category: activity.category || '',
        duration: activity.duration || '',
        location: activity.location || '',
        maxParticipants: activity.maxParticipants || '',
        isActive: activity.isActive !== undefined ? activity.isActive : true,
        includes: activity.includes || [],
        requirements: activity.requirements || [],
        images: activity.images || [],
      });
    } catch (error) {
      console.error('Error fetching activity:', error);
      toast.error('Failed to load activity data');
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
    const toastId = toast.loading(isEdit ? 'Updating activity...' : 'Creating activity...');

    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        maxParticipants: parseInt(formData.maxParticipants) || 0,
      };

      if (isEdit) {
        await api.put(`/admin/activities/${id}`, data);
        toast.success('Activity updated successfully! 🎉', {
          id: toastId,
          duration: 3000,
        });
      } else {
        await api.post('/admin/activities', data);
        toast.success('Activity created successfully! 🎉', {
          id: toastId,
          duration: 3000,
        });
      }
      navigate('/activities');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save activity', {
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

  const handleArrayChange = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData({
      ...formData,
      [field]: items,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? 'Edit Activity' : 'Add Activity'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF]"
                required
                placeholder="e.g., Snorkeling Expedition"
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
                placeholder="Describe the activity..."
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
                  <option value="Water Sports">Water Sports</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Relaxation">Relaxation</option>
                  <option value="Dining">Dining</option>
                  <option value="Wildlife">Wildlife</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF]"
                  placeholder="2 hours"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF]"
                  placeholder="Agatti Island"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
              <input
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF]"
                placeholder="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Includes (comma separated)</label>
              <input
                type="text"
                value={formData.includes.join(', ')}
                onChange={(e) => handleArrayChange('includes', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF]"
                placeholder="Equipment, Guide, Snacks"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (comma separated)</label>
              <input
                type="text"
                value={formData.requirements.join(', ')}
                onChange={(e) => handleArrayChange('requirements', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF]"
                placeholder="Swimming ability, Age 12+"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-[#00E5FF]"
              />
              <label className="text-sm text-gray-700">Active</label>
            </div>
          </div>

          {/* Right Column - Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity Images</label>
            
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
                        alt={`Activity ${index + 1}`}
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
            {loading ? 'Saving...' : isEdit ? 'Update Activity' : 'Create Activity'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/activities')}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 w-full sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}