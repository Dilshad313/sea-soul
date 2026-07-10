import { useEffect, useState } from 'react';
import { 
  Package, 
  BookOpen, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  CreditCard,
  Eye,
  User,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

// ✅ User Avatar Component with Dark Navy background
const UserAvatar = ({ user, size = 'w-10 h-10' }) => {
  const name = user?.fullName || 'User';
  const initial = name.charAt(0).toUpperCase();
  const profileImage = user?.profileImage;
  
  const hasImage = profileImage && 
                   profileImage.trim() !== '' && 
                   !profileImage.includes('default-avatar');
  
  if (hasImage) {
    return (
      <img
        src={profileImage}
        alt={name}
        className={`${size} rounded-full object-cover border border-gray-200 flex-shrink-0`}
        onError={(e) => {
          e.target.style.display = 'none';
          const parent = e.target.parentNode;
          const initialDiv = document.createElement('div');
          initialDiv.className = `${size} rounded-full bg-[#1A2B49] flex items-center justify-center flex-shrink-0`;
          initialDiv.innerHTML = `<span class="text-[#00E5FF] font-bold text-sm">${initial}</span>`;
          parent.appendChild(initialDiv);
        }}
      />
    );
  }
  
  return (
    <div className={`${size} rounded-full bg-[#1A2B49] flex items-center justify-center flex-shrink-0`}>
      <span className="text-[#00E5FF] font-bold text-sm">
        {initial}
      </span>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ 
    packages: 0, 
    bookings: 0, 
    users: 0, 
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentPackages, setRecentPackages] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentUsers();
    fetchRecentPackages();
    fetchRecentBookings();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats({
        packages: response.data.products || 0,
        bookings: response.data.bookings || 0,
        users: response.data.users || 0,
        revenue: response.data.revenue || 0
      });
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

  const fetchRecentPackages = async () => {
    try {
      const response = await api.get('/admin/products?limit=5');
      setRecentPackages(response.data.products || []);
    } catch (error) {
      console.error('Error fetching recent packages:', error);
    } finally {
      setLoadingPackages(false);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      const response = await api.get('/admin/bookings?limit=5');
      setRecentBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching recent bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  // ✅ Format time ago
  const timeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // ✅ Generate recent activity items from real data
  const getRecentActivities = () => {
    const activities = [];

    // Add recent users
    recentUsers.slice(0, 2).forEach(user => {
      if (user.createdAt) {
        activities.push({
          id: `user-${user._id}`,
          type: 'user',
          title: `New user registered: ${user.fullName}`,
          time: timeAgo(user.createdAt),
          icon: 'user',
          link: '/users',
          isNew: true
        });
      }
    });

    // Add recent packages
    recentPackages.slice(0, 2).forEach(pkg => {
      if (pkg.createdAt) {
        activities.push({
          id: `package-${pkg._id}`,
          type: 'package',
          title: `New package added: ${pkg.name}`,
          time: timeAgo(pkg.createdAt),
          icon: 'package',
          link: '/packages',
          isNew: true
        });
      }
    });

    // Add recent bookings
    recentBookings.slice(0, 2).forEach(booking => {
      if (booking.createdAt) {
        const customerName = booking.userId?.fullName || booking.user?.fullName || 'User';
        const itemName = booking.productId?.name || booking.activityId?.name || 'Package';
        activities.push({
          id: `booking-${booking._id}`,
          type: 'booking',
          title: `New booking: ${customerName} booked ${itemName}`,
          time: timeAgo(booking.createdAt),
          icon: 'booking',
          link: '/bookings',
          isNew: true
        });
      }
    });

    // Sort by time (newest first)
    activities.sort((a, b) => {
      const timeA = a.time.includes('min') ? parseInt(a.time) : 
                   a.time.includes('hour') ? parseInt(a.time) * 60 : 
                   a.time.includes('day') ? parseInt(a.time) * 1440 : 0;
      const timeB = b.time.includes('min') ? parseInt(b.time) : 
                   b.time.includes('hour') ? parseInt(b.time) * 60 : 
                   b.time.includes('day') ? parseInt(b.time) * 1440 : 0;
      return timeA - timeB;
    });

    return activities.slice(0, 5);
  };

  // ✅ Stats Cards - Removed Activities
  const statsCards = [
    { 
      title: 'Total Packages', 
      value: stats.packages, 
      icon: Package, 
      color: '#00E5FF',
      bgColor: 'rgba(0, 229, 255, 0.1)',
      borderColor: 'rgba(0, 229, 255, 0.2)',
      link: '/packages'
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

  const recentActivityItems = getRecentActivities();

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

  // ✅ Get icon based on activity type
  const getActivityIcon = (type) => {
    switch(type) {
      case 'user':
        return <Users size={14} className="text-[#9B59B6]" />;
      case 'package':
        return <Package size={14} className="text-[#00E5FF]" />;
      case 'booking':
        return <Calendar size={14} className="text-[#FFB84D]" />;
      default:
        return <Clock size={14} className="text-[#00E5FF]" />;
    }
  };

  // ✅ Get activity background color
  const getActivityBg = (type) => {
    switch(type) {
      case 'user':
        return 'bg-[#9B59B6]/10';
      case 'package':
        return 'bg-[#00E5FF]/10';
      case 'booking':
        return 'bg-[#FFB84D]/10';
      default:
        return 'bg-[#00E5FF]/10';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1A2B49]">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Stats Grid - 4 Cards (Removed Activities) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-6 md:mb-8">
        {statsCards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 block"
            style={{ borderColor: card.borderColor }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {card.title}
                </p>
                <p className="text-base sm:text-xl md:text-2xl font-bold text-[#1A2B49] mt-1 sm:mt-2">
                  {card.value}
                </p>
              </div>
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: card.bgColor }}
              >
                <card.icon size={16} className="sm:w-[18px] sm:h-[18px] md:w-[20px] md:h-[20px]" style={{ color: card.color }} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Users & Packages - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Recent Users */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="sm:w-[20px] sm:h-[20px] text-[#9B59B6]" />
              <h3 className="text-sm sm:text-base font-semibold text-[#1A2B49]">Latest Users</h3>
            </div>
            <button
              onClick={() => navigate('/users')}
              className="text-xs text-[#00E5FF] hover:underline font-medium flex items-center gap-1"
            >
              View All <ArrowRight size={12} />
            </button>
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
              {recentUsers.slice(0, 4).map((user) => (
                <div 
                  key={user._id} 
                  className="flex items-center justify-between p-2 sm:p-3 rounded-xl hover:bg-gray-50 transition group cursor-pointer"
                  onClick={() => navigate('/users')}
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <UserAvatar user={user} size="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-[#1A2B49] truncate">{user.fullName}</p>
                      <p className="text-[10px] sm:text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                      user.isActive !== false 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Packages */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package size={18} className="sm:w-[20px] sm:h-[20px] text-[#00E5FF]" />
              <h3 className="text-sm sm:text-base font-semibold text-[#1A2B49]">Latest Packages</h3>
            </div>
            <button
              onClick={() => navigate('/packages')}
              className="text-xs text-[#00E5FF] hover:underline font-medium flex items-center gap-1"
            >
              View All <ArrowRight size={12} />
            </button>
          </div>
          
          {loadingPackages ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00E5FF]"></div>
            </div>
          ) : recentPackages.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No packages added yet
            </div>
          ) : (
            <div className="space-y-3">
              {recentPackages.slice(0, 4).map((pkg) => (
                <div 
                  key={pkg._id} 
                  className="flex items-center justify-between p-2 sm:p-3 rounded-xl hover:bg-gray-50 transition group cursor-pointer"
                  onClick={() => navigate(`/packages/edit/${pkg._id}`)}
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    {pkg.images && pkg.images.length > 0 ? (
                      <img
                        src={pkg.images[0]}
                        alt={pkg.name}
                        className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/40x40?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Package size={14} className="sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px] text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-[#1A2B49] truncate max-w-[100px] sm:max-w-[150px]">
                        {pkg.name}
                      </p>
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        <span className="text-[10px] sm:text-xs font-bold text-[#00E5FF]">₹{pkg.price}</span>
                        <span className="text-[10px] sm:text-xs text-gray-400">•</span>
                        <span className="text-[10px] sm:text-xs text-gray-400">{pkg.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    {pkg.isFeatured && (
                      <span className="text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 bg-yellow-400 text-yellow-900 rounded font-bold">
                        FEATURED
                      </span>
                    )}
                    <Eye size={14} className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity & Quick Actions - Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Activity - Real Data */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-[#1A2B49] flex items-center gap-2">
              <TrendingUp size={16} className="sm:w-[18px] sm:h-[18px] text-[#00E5FF]" />
              Recent Activity
            </h3>
            <button
              onClick={() => {
                fetchStats();
                fetchRecentUsers();
                fetchRecentPackages();
                fetchRecentBookings();
              }}
              className="text-xs text-[#00E5FF] hover:underline font-medium"
            >
              Refresh
            </button>
          </div>
          
          {recentActivityItems.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No recent activity
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {recentActivityItems.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center gap-2 sm:gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-50/50 p-2 rounded-lg transition"
                  onClick={() => navigate(activity.link)}
                >
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full ${getActivityBg(activity.type)} flex items-center justify-center flex-shrink-0`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-800 truncate">{activity.title}</p>
                    <p className="text-[10px] sm:text-xs text-gray-400">{activity.time}</p>
                  </div>
                  {activity.isNew && (
                    <span className="text-[10px] sm:text-xs font-medium text-[#00A694] flex-shrink-0 bg-[#00A694]/10 px-2 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions - Working */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm sm:text-base font-semibold text-[#1A2B49] mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="sm:w-[18px] sm:h-[18px] text-[#00A694]" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/packages/add')}
              className="p-3 sm:p-4 bg-[#1A2B49]/5 rounded-xl hover:bg-[#1A2B49]/10 transition text-left group"
            >
              <Package size={16} className="sm:w-[18px] sm:h-[18px] md:w-[20px] md:h-[20px] text-[#1A2B49] mb-1 sm:mb-2 group-hover:scale-110 transition" />
              <p className="text-xs sm:text-sm font-medium text-[#1A2B49]">Add Package</p>
            </button>
            <button
              onClick={() => navigate('/bookings')}
              className="p-3 sm:p-4 bg-[#FFB84D]/5 rounded-xl hover:bg-[#FFB84D]/10 transition text-left group"
            >
              <Calendar size={16} className="sm:w-[18px] sm:h-[18px] md:w-[20px] md:h-[20px] text-[#FFB84D] mb-1 sm:mb-2 group-hover:scale-110 transition" />
              <p className="text-xs sm:text-sm font-medium text-[#1A2B49]">View Bookings</p>
            </button>
            <button
              onClick={() => navigate('/users')}
              className="p-3 sm:p-4 bg-[#2ECC71]/5 rounded-xl hover:bg-[#2ECC71]/10 transition text-left group"
            >
              <Users size={16} className="sm:w-[18px] sm:h-[18px] md:w-[20px] md:h-[20px] text-[#2ECC71] mb-1 sm:mb-2 group-hover:scale-110 transition" />
              <p className="text-xs sm:text-sm font-medium text-[#1A2B49]">Manage Users</p>
            </button>
            <button
              onClick={() => navigate('/payments')}
              className="p-3 sm:p-4 bg-[#00E5FF]/5 rounded-xl hover:bg-[#00E5FF]/10 transition text-left group"
            >
              <CreditCard size={16} className="sm:w-[18px] sm:h-[18px] md:w-[20px] md:h-[20px] text-[#00E5FF] mb-1 sm:mb-2 group-hover:scale-110 transition" />
              <p className="text-xs sm:text-sm font-medium text-[#1A2B49]">View Payments</p>
            </button>
          </div>

          {/* Extra Quick Actions - Bottom Row */}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/packages')}
              className="p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition text-left group"
            >
              <Package size={16} className="sm:w-[18px] sm:h-[18px] md:w-[20px] md:h-[20px] text-gray-500 mb-1 sm:mb-2 group-hover:scale-110 transition" />
              <p className="text-xs sm:text-sm font-medium text-gray-600">View Packages</p>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition text-left group"
            >
              <TrendingUp size={16} className="sm:w-[18px] sm:h-[18px] md:w-[20px] md:h-[20px] text-gray-500 mb-1 sm:mb-2 group-hover:scale-110 transition" />
              <p className="text-xs sm:text-sm font-medium text-gray-600">Refresh Stats</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}