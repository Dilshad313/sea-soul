import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Header({ isMobile, onMenuClick, isSidebarOpen }) {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const userEmail = user?.email || 'admin@seasoul.com';

  const handleLogout = () => {
    setShowLogoutConfirm(true);
    setShowDropdown(false);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    setShowDropdown(false);
    logout();
    toast.success('Logged out successfully! 👋', {
      duration: 3000,
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Menu button for mobile */}
        <div className="flex items-center gap-3">
          {isMobile && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? (
                <X size={24} className="text-[#1A2B49]" />
              ) : (
                <Menu size={24} className="text-[#1A2B49]" />
              )}
            </button>
          )}
          {/* Title - only show on mobile when sidebar is closed */}
          {isMobile && !isSidebarOpen && (
            <h1 className="text-xl font-bold text-[#1A2B49]">SeaSoul Admin</h1>
          )}
        </div>

        {/* Right side - Profile Section */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full bg-[#00E5FF]/20 flex items-center justify-center hover:bg-[#00E5FF]/30 transition">
              <span className="text-[#00E5FF] font-bold text-sm">
                {userEmail.charAt(0).toUpperCase()}
              </span>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDropdown(false)}
              />
              
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#00E5FF]/20 flex items-center justify-center">
                      <span className="text-[#00E5FF] font-bold text-sm">
                        {userEmail.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {userEmail}
                      </p>
                      <p className="text-xs text-gray-500">Admin</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-150"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut size={28} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-[#1A2B49] mb-2">Confirm Logout</h3>
              <p className="text-gray-500 text-sm mb-6">
                Are you sure you want to logout? You'll need to login again to access the admin panel.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}