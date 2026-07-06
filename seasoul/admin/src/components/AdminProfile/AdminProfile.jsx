import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Camera, X, User, Mail, Phone, MapPin, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function AdminProfile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png');
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || '',
  });

  const hasImage = profileImage && 
                   profileImage.trim() !== '' && 
                   !profileImage.includes('default-avatar');

  const initial = user?.fullName?.charAt(0)?.toUpperCase() || 'A';

  // Load profile data
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/admin/profile');
      if (response.data.success) {
        const userData = response.data.user;
        setProfileImage(userData.profileImage || 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png');
        setFormData({
          fullName: userData.fullName || '',
          phone: userData.phone || '',
          bio: userData.bio || '',
          location: userData.location || '',
        });
        
        // Update auth context
        if (setUser) {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    const toastId = toast.loading('Uploading image...');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/admin/profile/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setProfileImage(response.data.profileImage);
        
        // Update auth context
        if (setUser && response.data.user) {
          setUser(response.data.user);
        }
        
        toast.success('Profile image updated successfully!', {
          id: toastId,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image', {
        id: toastId,
        duration: 4000,
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = async () => {
    if (!hasImage) return;

    setUploading(true);
    const toastId = toast.loading('Removing image...');

    try {
      const response = await api.delete('/admin/profile/image');
      
      if (response.data.success) {
        setProfileImage('https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png');
        
        // Update auth context
        if (setUser && response.data.user) {
          setUser(response.data.user);
        }
        
        toast.success('Profile image removed', {
          id: toastId,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error(error.response?.data?.message || 'Failed to remove image', {
        id: toastId,
        duration: 4000,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Updating profile...');

    try {
      const response = await api.put('/admin/profile', formData);
      
      if (response.data.success) {
        // Update auth context
        if (setUser && response.data.user) {
          setUser(response.data.user);
        }
        
        toast.success('Profile updated successfully!', {
          id: toastId,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile', {
        id: toastId,
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A2B49]">Admin Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile information</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            {/* Profile Image or Initial */}
            <div className="w-32 h-32 rounded-full border-4 border-[#00E5FF]/20 overflow-hidden">
              {hasImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = `
                      <div class="w-full h-full bg-[#1A2B49] flex items-center justify-center">
                        <span class="text-[#00E5FF] text-5xl font-bold">${initial}</span>
                      </div>
                    `;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-[#1A2B49] flex items-center justify-center">
                  <span className="text-[#00E5FF] text-5xl font-bold">{initial}</span>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <label className="absolute bottom-0 right-0 p-2 bg-[#00E5FF] rounded-full cursor-pointer hover:bg-[#00E5FF]/80 transition shadow-lg">
              <Camera size={20} className="text-[#1A2B49]" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          {uploading && (
            <div className="mt-2 text-sm text-[#00E5FF]">Uploading...</div>
          )}

          {hasImage && (
            <button
              onClick={handleRemoveImage}
              disabled={uploading}
              className="mt-2 text-sm text-red-500 hover:text-red-600 transition flex items-center gap-1"
            >
              <X size={16} />
              Remove Image
            </button>
          )}

          <div className="mt-4 text-center">
            <p className="font-medium text-[#1A2B49]">{formData.fullName || 'Admin'}</p>
            <p className="text-sm text-gray-500">{user?.email || 'admin@seasoul.com'}</p>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF]"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF]"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF]"
                placeholder="Enter your location"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <div className="relative">
              <FileText size={18} className="absolute left-3 top-3 text-gray-400" />
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF] resize-none"
                placeholder="Tell us about yourself"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-6 py-2.5 bg-[#00E5FF] text-[#1A2B49] font-bold rounded-xl hover:bg-[#00E5FF]/80 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={fetchProfile}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}