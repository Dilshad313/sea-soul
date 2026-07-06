import { useEffect, useState } from 'react';
import { Eye, UserCheck, UserX, Search, Mail, Phone, Calendar, Shield, X } from 'lucide-react';
import api from '../../services/api';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      await api.put(`/admin/users/${id}/status`, { 
        isActive: !currentStatus 
      });
      fetchUsers();
    } catch (error) {
      alert('Failed to update user status');
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E5FF] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2B49]">Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all registered users</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200">
            <span className="text-sm text-gray-600">Total: </span>
            <span className="font-bold text-[#1A2B49]">{users.length}</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-full md:max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search users by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent"
        />
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 text-center border border-gray-100">
          <div className="flex flex-col items-center">
            <UserX size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-[#1A2B49]">No users found</h3>
            <p className="text-gray-500 text-sm mt-1">
              {searchTerm ? 'Try adjusting your search' : 'No registered users yet'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.profileImage || 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png'}
                          alt={user.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          onError={(e) => {
                            e.target.src = 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png';
                          }}
                        />
                        <span className="font-medium text-[#1A2B49]">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.phone || 'N/A'}</td>
                    <td className="px-6 py-4">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                          <Shield size={12} />
                          Admin
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.isActive !== false 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {user.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye size={17} />
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => toggleUserStatus(user._id, user.isActive !== false)}
                            className={`p-2 rounded-lg transition ${
                              user.isActive !== false
                                ? 'text-red-500 hover:bg-red-50'
                                : 'text-green-500 hover:bg-green-50'
                            }`}
                            title={user.isActive !== false ? 'Deactivate' : 'Activate'}
                          >
                            {user.isActive !== false ? <UserX size={17} /> : <UserCheck size={17} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            {filteredUsers.map((user) => (
              <div key={user._id} className="p-4 border-b border-gray-100 hover:bg-gray-50/50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={user.profileImage || 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png'}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0"
                      onError={(e) => {
                        e.target.src = 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png';
                      }}
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-[#1A2B49] truncate">{user.fullName}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    user.isActive !== false 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {user.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-sm text-gray-600">{user.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Role</p>
                    {user.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        <Shield size={12} />
                        Admin
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        User
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Joined</p>
                    <p className="text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleViewUser(user)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                      title="View Details"
                    >
                      <Eye size={17} />
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => toggleUserStatus(user._id, user.isActive !== false)}
                        className={`p-2 rounded-lg transition ${
                          user.isActive !== false
                            ? 'text-red-500 hover:bg-red-50'
                            : 'text-green-500 hover:bg-green-50'
                        }`}
                        title={user.isActive !== false ? 'Deactivate' : 'Activate'}
                      >
                        {user.isActive !== false ? <UserX size={17} /> : <UserCheck size={17} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Details Modal - Responsive */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold text-[#1A2B49]">User Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6">
              {/* Profile Image & Name */}
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={selectedUser.profileImage || 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png'}
                  alt={selectedUser.fullName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.target.src = 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png';
                  }}
                />
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#1A2B49]">{selectedUser.fullName}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {selectedUser.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        <Shield size={12} />
                        Admin
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        User
                      </span>
                    )}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      selectedUser.isActive !== false 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedUser.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Info Grid */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm text-[#1A2B49] mt-1 flex items-center gap-2">
                    <Mail size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="break-all">{selectedUser.email}</span>
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Phone</p>
                  <p className="text-sm text-[#1A2B49] mt-1 flex items-center gap-2">
                    <Phone size={16} className="text-gray-400 flex-shrink-0" />
                    {selectedUser.phone || 'Not provided'}
                  </p>
                </div>

                {selectedUser.location && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Location</p>
                    <p className="text-sm text-[#1A2B49] mt-1 flex items-center gap-2">
                      📍 {selectedUser.location}
                    </p>
                  </div>
                )}

                {selectedUser.bio && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Bio</p>
                    <p className="text-sm text-[#1A2B49] mt-1">{selectedUser.bio}</p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</p>
                  <p className="text-sm text-[#1A2B49] mt-1 flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                    {new Date(selectedUser.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })} at {new Date(selectedUser.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">User ID</p>
                  <p className="text-sm font-mono text-[#1A2B49] mt-1 break-all">{selectedUser._id}</p>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedUser.role !== 'admin' && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      toggleUserStatus(selectedUser._id, selectedUser.isActive !== false);
                      setShowModal(false);
                    }}
                    className={`w-full py-3 rounded-xl font-medium transition ${
                      selectedUser.isActive !== false
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {selectedUser.isActive !== false ? (
                      <>
                        <UserX size={18} className="inline mr-2" />
                        Deactivate User
                      </>
                    ) : (
                      <>
                        <UserCheck size={18} className="inline mr-2" />
                        Activate User
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}