import { useEffect, useState } from 'react';
import { Eye, Star, User, Package, Activity, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function ReviewsList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get('/reviews/admin/all');
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, isApproved) => {
    try {
      await api.put(`/reviews/admin/${id}/status`, { isApproved });
      toast.success(`Review ${isApproved ? 'approved' : 'unapproved'}!`);
      fetchReviews();
    } catch (error) {
      toast.error('Failed to update review status');
    }
  };

  const deleteReview = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await api.delete(`/reviews/${id}`);
      toast.success('Review deleted successfully!');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const getStatusConfig = (isApproved) => {
    if (isApproved) {
      return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle, label: 'Approved' };
    }
    return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock, label: 'Pending' };
  };

  const getRatingStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const filteredReviews = reviews.filter(review => {
    const matchStatus = filterStatus === 'all' || 
      (filterStatus === 'approved' && review.isApproved) ||
      (filterStatus === 'pending' && !review.isApproved);
    const matchSearch = 
      review.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statuses = ['all', 'approved', 'pending'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E5FF] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2B49]">Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all customer reviews</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200">
            <span className="text-sm text-gray-600">Total: </span>
            <span className="font-bold text-[#1A2B49]">{reviews.length}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer, item, or title..."
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

      {/* Reviews Table */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 text-center border border-gray-100">
          <div className="flex flex-col items-center">
            <Star size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-[#1A2B49]">No reviews found</h3>
            <p className="text-gray-500 text-sm mt-1">
              {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filter' : 'No reviews yet'}
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Review</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReviews.map((review) => {
                  const statusConfig = getStatusConfig(review.isApproved);
                  const StatusIcon = statusConfig.icon;
                  const isProduct = review.itemType === 'product';
                  
                  return (
                    <tr key={review._id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[#1A2B49]">{review.userName || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{review.userId?.email || ''}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isProduct ? (
                            <Package size={16} className="text-[#00E5FF]" />
                          ) : (
                            <Activity size={16} className="text-[#00A694]" />
                          )}
                          <span className="font-medium text-[#1A2B49]">{review.itemName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-lg">{getRatingStars(review.rating)}</span>
                          <span className="text-sm font-bold text-[#1A2B49]">{review.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[#1A2B49]">{review.title}</p>
                          <p className="text-sm text-gray-500 truncate max-w-[200px]">{review.comment}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                          <StatusIcon size={14} />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedReview(review);
                              setShowModal(true);
                            }}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye size={17} />
                          </button>
                          <button
                            onClick={() => updateStatus(review._id, !review.isApproved)}
                            className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                            title={review.isApproved ? 'Unapprove' : 'Approve'}
                          >
                            <CheckCircle size={17} />
                          </button>
                          <button
                            onClick={() => deleteReview(review._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <XCircle size={17} />
                          </button>
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
            {filteredReviews.map((review) => {
              const statusConfig = getStatusConfig(review.isApproved);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div key={review._id} className="p-4 border-b border-gray-100 hover:bg-gray-50/50 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-[#1A2B49]">{review.userName || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{review.userId?.email || ''}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                      <StatusIcon size={14} />
                      {statusConfig.label}
                    </span>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm font-medium text-[#1A2B49]">{review.itemName}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-lg">{getRatingStars(review.rating)}</span>
                      <span className="text-sm font-bold text-[#1A2B49]">{review.rating}</span>
                    </div>
                    <p className="text-sm font-medium text-[#1A2B49] mt-1">{review.title}</p>
                    <p className="text-sm text-gray-500">{review.comment}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(review.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  <div className="mt-3 flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedReview(review);
                        setShowModal(true);
                      }}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                      title="View Details"
                    >
                      <Eye size={17} />
                    </button>
                    <button
                      onClick={() => updateStatus(review._id, !review.isApproved)}
                      className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                      title={review.isApproved ? 'Unapprove' : 'Approve'}
                    >
                      <CheckCircle size={17} />
                    </button>
                    <button
                      onClick={() => deleteReview(review._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <XCircle size={17} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review Details Modal */}
      {showModal && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold text-[#1A2B49]">Review Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <XCircle size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase">Customer</p>
                  <p className="text-sm font-medium text-[#1A2B49]">{selectedReview.userName || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{selectedReview.userId?.email || ''}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase">Item</p>
                  <p className="text-sm font-medium text-[#1A2B49]">{selectedReview.itemName}</p>
                  <p className="text-sm text-gray-500 capitalize">{selectedReview.itemType}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase">Rating</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-2xl">{getRatingStars(selectedReview.rating)}</span>
                    <span className="text-sm font-bold text-[#1A2B49]">{selectedReview.rating}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase">Title</p>
                  <p className="text-sm font-medium text-[#1A2B49]">{selectedReview.title}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase">Comment</p>
                  <p className="text-sm text-gray-600">{selectedReview.comment}</p>
                </div>

                {selectedReview.images && selectedReview.images.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase">Images</p>
                    <div className="flex gap-2 mt-1">
                      {selectedReview.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`Review ${i+1}`}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          onError={(e) => e.target.src = 'https://via.placeholder.com/64'}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                    selectedReview.isApproved
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }`}>
                    {selectedReview.isApproved ? '✅ Approved' : '⏳ Pending'}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase">Date</p>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedReview.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })} at {new Date(selectedReview.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {selectedReview.isEdited && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase">Edited</p>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedReview.editedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}