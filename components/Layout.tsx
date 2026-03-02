
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ArrowLeftRight, 
  BarChart3, 
  Users, 
  LogOut, 
  Menu, 
  X,
  Zap,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Categories', path: '/categories', icon: Tags },
  { label: 'Stock Movement', path: '/stock', icon: ArrowLeftRight },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'User Management', path: '/users', icon: Users },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  // FIXED: Back button visibility logic
  const showBackButton = location.pathname !== '/';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden" 
          onClick={closeSidebar}
        />
      )}

      <aside 
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <Link to="/" onClick={closeSidebar} className="flex items-center gap-3 overflow-hidden">
              <div className="bg-yellow-400 p-2 rounded-lg shrink-0">
                <Zap className="text-slate-900 w-6 h-6 fill-current" />
              </div>
              <span className="text-lg font-bold tracking-tight leading-tight truncate">Sri Astalakshmi Electricals</span>
            </Link>
            <button className="p-2 text-slate-400 lg:hidden" onClick={closeSidebar}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive ? 'bg-yellow-400 text-slate-900 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="truncate">{item.label}</span>
                  {isActive && <ChevronRight className="ml-auto w-4 h-4 shrink-0" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                {user?.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.role}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="text-slate-400 hover:text-white transition-colors shrink-0"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button className="p-2 -ml-2 text-slate-500 lg:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            
            {/* FIXED: Back Button added for non-dashboard pages */}
            {showBackButton && (
              <button 
                onClick={() => navigate(-1)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold pr-3"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden xs:inline">Back</span>
              </button>
            )}

            <h1 className="text-lg font-semibold text-slate-800 truncate">
              {NAV_ITEMS.find(item => item.path === location.pathname)?.label || 'Sri Astalakshmi Electricals Manager'}
            </h1>
          </div>

          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          {children}
        </div>
      </main>
    </div>
  );
};
