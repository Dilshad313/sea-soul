import { useEffect, useState } from 'react';
import { Eye, CheckCircle, XCircle, Clock, Search, Filter, Calendar, User, Package } from 'lucide-react';
import api from '../../services/api';

export default function BookingsList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/admin/bookings');
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/bookings/${id}/status`, { status });
      fetchBookings();
    } catch (error) {
      alert('Failed to update booking status');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        bg: 'bg-yellow-50', 
        text: 'text-yellow-700', 
        border: 'border-yellow-200',
        icon: Clock,
        label: 'Pending'
      },
      confirmed: { 
        bg: 'bg-green-50', 
        text: 'text-green-700', 
        border: 'border-green-200',
        icon: CheckCircle,
        label: 'Confirmed'
      },
      cancelled: { 
        bg: 'bg-red-50', 
        text: 'text-red-700', 
        border: 'border-red-200',
        icon: XCircle,
        label: 'Cancelled'
      },
      completed: { 
        bg: 'bg-blue-50', 
        text: 'text-blue-700', 
        border: 'border-blue-200',
        icon: CheckCircle,
        label: 'Completed'
      },
    };
    return configs[status] || configs.pending;
  };

  const filteredBookings = bookings.filter(booking => {
    // ✅ Get customer name properly
    const customerName = booking.userId?.fullName || booking.user?.fullName || '';
    const customerEmail = booking.userId?.email || booking.user?.email || '';
    const itemName = booking.productId?.name || booking.activityId?.name || '';
    
    const matchStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchSearch = 
      booking._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statuses = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E5FF] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2B49]">Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all customer bookings and reservations</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200">
            <span className="text-sm text-gray-600">Total: </span>
            <span className="font-bold text-[#1A2B49]">{bookings.length}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, customer name, or item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition capitalize ${
                filterStatus === status
                  ? 'bg-[#1A2B49] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 text-center border border-gray-100">
          <div className="flex flex-col items-center">
            <Calendar size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-[#1A2B49]">No bookings found</h3>
            <p className="text-gray-500 text-sm mt-1">
              {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filter' : 'No bookings yet'}
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map((booking) => {
                  const statusConfig = getStatusConfig(booking.status);
                  const StatusIcon = statusConfig.icon;
                  
                  // ✅ Get customer name properly
                  const customerName = booking.userId?.fullName || booking.user?.fullName || 'Unknown User';
                  const customerEmail = booking.userId?.email || booking.user?.email || '';
                  
                  // ✅ Get item name properly
                  const itemName = booking.productId?.name || booking.activityId?.name || 'Unknown Item';
                  const itemCategory = booking.productId?.category || booking.activityId?.category || '';
                  
                  return (
                    <tr key={booking._id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4 font-mono text-sm text-gray-600">
                        #{booking._id?.slice(-8)}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[#1A2B49]">{customerName}</p>
                          <p className="text-sm text-gray-500">{customerEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-[#1A2B49]">{itemName}</p>
                        <p className="text-sm text-gray-500">{itemCategory}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#1A2B49]">₹{booking.totalAmount}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                          <StatusIcon size={14} />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button className="p-2 text-gray-400 hover:text-[#1A2B49] hover:bg-gray-100 rounded-lg transition">
                            <Eye size={17} />
                          </button>
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateStatus(booking._id, 'confirmed')}
                                className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                                title="Confirm"
                              >
                                <CheckCircle size={17} />
                              </button>
                              <button
                                onClick={() => updateStatus(booking._id, 'cancelled')}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                title="Cancel"
                              >
                                <XCircle size={17} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            {filteredBookings.map((booking) => {
              const statusConfig = getStatusConfig(booking.status);
              const StatusIcon = statusConfig.icon;
              
              // ✅ Get customer name properly
              const customerName = booking.userId?.fullName || booking.user?.fullName || 'Unknown User';
              const customerEmail = booking.userId?.email || booking.user?.email || '';
              
              // ✅ Get item name properly
              const itemName = booking.productId?.name || booking.activityId?.name || 'Unknown Item';
              
              return (
                <div key={booking._id} className="p-4 border-b border-gray-100 hover:bg-gray-50/50 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-sm text-gray-600">
                        #{booking._id?.slice(-8)}
                      </p>
                      <p className="font-medium text-[#1A2B49]">{customerName}</p>
                      <p className="text-sm text-gray-500">{customerEmail}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                      <StatusIcon size={14} />
                      {statusConfig.label}
                    </span>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-400">Item</p>
                      <p className="font-medium text-[#1A2B49]">{itemName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Amount</p>
                      <p className="font-bold text-[#1A2B49]">₹{booking.totalAmount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Date</p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-2 text-gray-400 hover:text-[#1A2B49] hover:bg-gray-100 rounded-lg transition">
                        <Eye size={17} />
                      </button>
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(booking._id, 'confirmed')}
                            className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                            title="Confirm"
                          >
                            <CheckCircle size={17} />
                          </button>
                          <button
                            onClick={() => updateStatus(booking._id, 'cancelled')}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Cancel"
                          >
                            <XCircle size={17} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}