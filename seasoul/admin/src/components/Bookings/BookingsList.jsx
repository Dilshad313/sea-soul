import { useEffect, useState } from 'react';
import { Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../services/api';

export default function BookingsList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      completed: 'bg-blue-100 text-blue-700',
    };
    return styles[status] || styles.pending;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={16} className="text-green-600" />;
      case 'cancelled': return <XCircle size={16} className="text-red-600" />;
      case 'completed': return <CheckCircle size={16} className="text-blue-600" />;
      default: return <Clock size={16} className="text-yellow-600" />;
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bookings</h1>
        <div className="flex gap-2">
          <select className="px-4 py-2 border border-gray-300 rounded-xl text-sm">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Booking ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Customer</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Item</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking._id}>
                  <td className="px-6 py-4 font-mono text-sm text-gray-600">
                    #{booking._id?.slice(-6)}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{booking.user?.fullName || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{booking.user?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{booking.item?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{booking.item?.category}</p>
                  </td>
                  <td className="px-6 py-4 font-medium">₹{booking.totalAmount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(booking.status)} flex items-center gap-1 w-fit`}>
                      {getStatusIcon(booking.status)}
                      {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(booking._id, 'confirmed')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Confirm"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => updateStatus(booking._id, 'cancelled')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Cancel"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}