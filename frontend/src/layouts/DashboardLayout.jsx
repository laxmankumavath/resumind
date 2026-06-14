import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  LayoutDashboard,
  LogOut,
  UploadCloud,
  User as UserIcon,
  Wand2,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { logout } from '../api/auth.api';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { user, logout: clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Resume', path: '/dashboard/upload', icon: UploadCloud },
    { name: 'ATS Analysis', path: '/dashboard/analysis', icon: BarChart3 },
    { name: 'Resume Rewrite', path: '/dashboard/rewrite', icon: Wand2 },
    { name: 'Company Match Predictor', path: '/dashboard/company-match', icon: Building2 },
    { name: 'Profile', path: '/dashboard/profile', icon: UserIcon },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:h-screen md:flex-row">
      {/* Sidebar */}
      <div className="w-full bg-white border-b border-slate-200 flex flex-col md:w-64 md:border-b-0 md:border-r">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">
            Resu<span className="text-brand-indigo">Mind</span>
          </h1>
        </div>
        
        <nav className="flex gap-1 overflow-x-auto px-4 py-4 md:flex-1 md:flex-col md:space-y-1 md:overflow-y-auto md:py-6">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex shrink-0 items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-brand-indigo/10 text-brand-indigo'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        
        <div className="hidden p-4 border-t border-slate-200 md:block">
          <div className="flex items-center mb-4 px-3">
            <div className="w-8 h-8 rounded-full bg-brand-indigo text-white flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
