import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Activity,
  BookOpen,
  CreditCard,
  Users,
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/products', icon: Package, label: 'Products' },
  { path: '/activities', icon: Activity, label: 'Activities' },
  { path: '/bookings', icon: BookOpen, label: 'Bookings' },
  { path: '/payments', icon: CreditCard, label: 'Payments' },
  { path: '/users', icon: Users, label: 'Users' },
];

export default function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-navy text-white p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-accent">🌊 SeaSoul</h1>
        <p className="text-gray-400 text-sm">Admin Panel</p>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                isActive 
                  ? 'bg-white/10 text-accent' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        onClick={logout}
        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition w-full mt-4"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </aside>
  );
}