import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ActivityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
      });
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        maxParticipants: parseInt(formData.maxParticipants) || 0,
      };

      if (isEdit) {
        await api.put(`/admin/activities/${id}`, data);
      } else {
        await api.post('/admin/activities', data);
      }
      navigate('/activities');
    } catch (error) {
      alert('Failed to save activity');
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
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? 'Edit Activity' : 'Add Activity'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent"
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
                placeholder="2 hours"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Includes (comma separated)</label>
            <input
              type="text"
              value={formData.includes.join(', ')}
              onChange={(e) => handleArrayChange('includes', e.target.value)}
              placeholder="Equipment, Guide, Snacks"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (comma separated)</label>
            <input
              type="text"
              value={formData.requirements.join(', ')}
              onChange={(e) => handleArrayChange('requirements', e.target.value)}
              placeholder="Swimming ability, Age 12+"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-accent"
            />
            <label className="text-sm text-gray-700">Active</label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-accent text-dark font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/activities')}
              className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}