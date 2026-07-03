import { useEffect, useState } from 'react';
import { 
  Package, 
  BookOpen, 
  Users, 
  DollarSign, 
  Activity, 
  TrendingUp, 
  Calendar, 
  CreditCard,
  Eye,
  User,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ 
    products: 0, 
    bookings: 0, 
    users: 0, 
    revenue: 0,
    activities: 0 
  });
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentUsers();
    fetchRecentProducts();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const response = await api.get('/admin/users?limit=5');
      setRecentUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching recent users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchRecentProducts = async () => {
    try {
      const response = await api.get('/admin/products?limit=5');
      setRecentProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching recent products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const statsCards = [
    { 
      title: 'Total Products', 
      value: stats.products, 
      icon: Package, 
      color: '#00E5FF',
      bgColor: 'rgba(0, 229, 255, 0.1)',
      borderColor: 'rgba(0, 229, 255, 0.2)',
      link: '/products'
    },
    { 
      title: 'Total Activities', 
      value: stats.activities || 0, 
      icon: Activity, 
      color: '#00A694',
      bgColor: 'rgba(0, 166, 148, 0.1)',
      borderColor: 'rgba(0, 166, 148, 0.2)',
      link: '/activities'
    },
    { 
      title: 'Total Bookings', 
      value: stats.bookings, 
      icon: Calendar, 
      color: '#FFB84D',
      bgColor: 'rgba(255, 184, 77, 0.1)',
      borderColor: 'rgba(255, 184, 77, 0.2)',
      link: '/bookings'
    },
    { 
      title: 'Total Users', 
      value: stats.users, 
      icon: Users, 
      color: '#9B59B6',
      bgColor: 'rgba(155, 89, 182, 0.1)',
      borderColor: 'rgba(155, 89, 182, 0.2)',
      link: '/users'
    },
    { 
      title: 'Revenue', 
      value: `₹${stats.revenue || 0}`, 
      icon: DollarSign, 
      color: '#2ECC71',
      bgColor: 'rgba(46, 204, 113, 0.1)',
      borderColor: 'rgba(46, 204, 113, 0.2)',
      link: '/payments'
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E5FF] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A2B49]">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
        {statsCards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className="bg-white rounded-2xl p-5 border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 block"
            style={{ borderColor: card.borderColor }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-[#1A2B49] mt-2">
                  {card.value}
                </p>
              </div>
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: card.bgColor }}
              >
                <card.icon size={20} style={{ color: card.color }} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Users & Products - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Users */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-[#9B59B6]" />
              <h3 className="text-sm font-semibold text-[#1A2B49]">Latest Users</h3>
            </div>
            <Link to="/users" className="text-xs text-[#00E5FF] hover:underline font-medium">
              View All →
            </Link>
          </div>
          
          {loadingUsers ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00E5FF]"></div>
            </div>
          ) : recentUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No users registered yet
            </div>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((user, index) => (
                <div 
                  key={user._id} 
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={user.profileImage || 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png'}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        onError={(e) => {
                          e.target.src = 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png';
                        }}
                      />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        user.isActive !== false ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1A2B49]">{user.fullName}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      user.isActive !== false 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                    <Link 
                      to={`/users`}
                      className="p-1.5 text-gray-400 hover:text-[#1A2B49] hover:bg-gray-100 rounded-lg transition"
                    >
                      <Eye size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package size={20} className="text-[#00E5FF]" />
              <h3 className="text-sm font-semibold text-[#1A2B49]">Latest Products</h3>
            </div>
            <Link to="/products" className="text-xs text-[#00E5FF] hover:underline font-medium">
              View All →
            </Link>
          </div>
          
          {loadingProducts ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00E5FF]"></div>
            </div>
          ) : recentProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No products added yet
            </div>
          ) : (
            <div className="space-y-3">
              {recentProducts.map((product) => (
                <div 
                  key={product._id} 
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition group"
                >
                  <div className="flex items-center gap-3">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/40x40?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Package size={18} className="text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-[#1A2B49] truncate max-w-[150px]">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#00E5FF]">₹{product.price}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">{product.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    {product.isFeatured && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-yellow-400 text-yellow-900 rounded font-bold">
                        FEATURED
                      </span>
                    )}
                    <Link 
                      to={`/products/edit/${product._id}`}
                      className="p-1.5 text-gray-400 hover:text-[#1A2B49] hover:bg-gray-100 rounded-lg transition"
                    >
                      <Eye size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity & Quick Actions - Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-[#1A2B49] mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#00E5FF]" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="flex items-center gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-[#00E5FF]/10 flex items-center justify-center flex-shrink-0">
                  <Clock size={14} className="text-[#00E5FF]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">New booking received</p>
                  <p className="text-xs text-gray-400">2 minutes ago</p>
                </div>
                <span className="text-xs font-medium text-[#00A694]">New</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-[#1A2B49] mb-4 flex items-center gap-2">
            <Activity size={18} className="text-[#00A694]" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Link 
              to="/products/add"
              className="p-4 bg-[#1A2B49]/5 rounded-xl hover:bg-[#1A2B49]/10 transition text-left group"
            >
              <Package size={20} className="text-[#1A2B49] mb-2 group-hover:scale-110 transition" />
              <p className="text-sm font-medium text-[#1A2B49]">Add Product</p>
            </Link>
            <Link 
              to="/activities/add"
              className="p-4 bg-[#00E5FF]/5 rounded-xl hover:bg-[#00E5FF]/10 transition text-left group"
            >
              <Activity size={20} className="text-[#00E5FF] mb-2 group-hover:scale-110 transition" />
              <p className="text-sm font-medium text-[#1A2B49]">Add Activity</p>
            </Link>
            <Link 
              to="/bookings"
              className="p-4 bg-[#FFB84D]/5 rounded-xl hover:bg-[#FFB84D]/10 transition text-left group"
            >
              <Calendar size={20} className="text-[#FFB84D] mb-2 group-hover:scale-110 transition" />
              <p className="text-sm font-medium text-[#1A2B49]">View Bookings</p>
            </Link>
            <Link 
              to="/users"
              className="p-4 bg-[#2ECC71]/5 rounded-xl hover:bg-[#2ECC71]/10 transition text-left group"
            >
              <Users size={20} className="text-[#2ECC71] mb-2 group-hover:scale-110 transition" />
              <p className="text-sm font-medium text-[#1A2B49]">Manage Users</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}