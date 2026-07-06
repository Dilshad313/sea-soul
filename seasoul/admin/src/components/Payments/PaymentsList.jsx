import { useEffect, useState } from 'react';
import { Eye, CheckCircle, XCircle, Clock, Search, CreditCard, Wallet, Building2 } from 'lucide-react';
import api from '../../services/api';

export default function PaymentsList() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/admin/payments');
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock, label: 'Pending' },
      completed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle, label: 'Completed' },
      failed: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle, label: 'Failed' },
      refunded: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Clock, label: 'Refunded' },
    };
    return configs[status] || configs.pending;
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      card: CreditCard,
      upi: Wallet,
      netbanking: Building2,
    };
    return icons[method] || CreditCard;
  };

  const filteredPayments = payments.filter(payment => {
    const matchStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchSearch = payment._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        payment.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statuses = ['all', 'pending', 'completed', 'failed', 'refunded'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E5FF] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2B49]">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage all payment transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200">
            <span className="text-sm text-gray-600">Total: </span>
            <span className="font-bold text-[#1A2B49]">{payments.length}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by transaction ID or customer name..."
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

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 text-center border border-gray-100">
          <div className="flex flex-col items-center">
            <CreditCard size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-[#1A2B49]">No payments found</h3>
            <p className="text-gray-500 text-sm mt-1">
              {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filter' : 'No transactions yet'}
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((payment) => {
                  const statusConfig = getStatusConfig(payment.status);
                  const StatusIcon = statusConfig.icon;
                  const MethodIcon = getPaymentMethodIcon(payment.method);
                  
                  return (
                    <tr key={payment._id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4 font-mono text-sm text-gray-600">
                        #{payment._id?.slice(-8)}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[#1A2B49]">{payment.user?.fullName || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{payment.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#1A2B49]">₹{payment.amount}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MethodIcon size={16} />
                          {payment.method?.charAt(0).toUpperCase() + payment.method?.slice(1) || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                          <StatusIcon size={14} />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 text-gray-400 hover:text-[#1A2B49] hover:bg-gray-100 rounded-lg transition">
                          <Eye size={17} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            {filteredPayments.map((payment) => {
              const statusConfig = getStatusConfig(payment.status);
              const StatusIcon = statusConfig.icon;
              const MethodIcon = getPaymentMethodIcon(payment.method);
              
              return (
                <div key={payment._id} className="p-4 border-b border-gray-100 hover:bg-gray-50/50 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-sm text-gray-600">
                        #{payment._id?.slice(-8)}
                      </p>
                      <p className="font-medium text-[#1A2B49]">{payment.user?.fullName || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{payment.user?.email}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                      <StatusIcon size={14} />
                      {statusConfig.label}
                    </span>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-400">Amount</p>
                      <p className="font-bold text-[#1A2B49]">₹{payment.amount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Method</p>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MethodIcon size={14} />
                        {payment.method?.charAt(0).toUpperCase() + payment.method?.slice(1) || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Date</p>
                      <p className="text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString('en-IN', {
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