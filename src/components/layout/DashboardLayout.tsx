import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Activity, FileText, Pill, MessageSquare, Settings, User, LogOut, Bell, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../Logo';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Interactive Anatomy', path: '/dashboard/anatomy', icon: Activity },
    { name: 'Medication', path: '/dashboard/medication', icon: Pill },
    { name: 'Find a Doctor', path: '/dashboard/doctors', icon: Activity },
    { name: 'Medical Reports', path: '/dashboard/reports', icon: FileText },
    { name: 'AI Assistant', path: '/dashboard/ai', icon: MessageSquare },
  ];

  return (
    <div className="flex min-h-screen bg-[#fafafa] relative overflow-hidden">
      
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-100 flex flex-col z-40 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-[280px]'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-20 flex items-center justify-between px-4 lg:px-6 border-b border-gray-50 flex-shrink-0">
          <Link to="/" className={`flex items-center space-x-3 group ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-out flex-shrink-0">
              <Logo size={isCollapsed ? 32 : 38} />
            </div>
            {!isCollapsed && (
              <span className="text-xl lg:text-2xl font-poppins font-bold text-slate-800 tracking-tight group-hover:text-primary transition-colors duration-300 truncate">
                HealthSphere
              </span>
            )}
          </Link>
          
          {/* Mobile close button */}
          <button 
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600 rounded-lg"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 flex flex-col py-6 overflow-y-auto px-3 hide-scrollbar">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center rounded-2xl transition-all duration-200 ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3 space-x-3'} ${
                    isActive 
                      ? 'bg-primary text-white shadow-md shadow-primary/20' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                  {!isCollapsed && <span className="font-medium truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="w-full p-3 border-t border-gray-100 bg-white flex-shrink-0">
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full flex items-center rounded-xl hover:bg-gray-50 transition-colors focus:outline-none ${isCollapsed ? 'justify-center p-2' : 'p-2 space-x-3'}`}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border-2 border-transparent hover:border-primary transition-all flex-shrink-0">
                 <img src={user?.avatar_url || "/src/assets/ai_avatar_3d.png"} alt="Profile" className={`w-full h-full object-cover ${!user?.avatar_url ? 'scale-150' : ''}`} />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-bold text-slate-800 truncate">{user?.name || 'Alex Johnson'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || 'alex@example.com'}</p>
                </div>
              )}
            </button>

            {isDropdownOpen && (
              <div className={`absolute bottom-full mb-2 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-50 p-1.5 ${isCollapsed ? 'left-14 w-48' : 'left-0 w-full'}`}>
                <Link to="/dashboard/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors">
                  <User className="w-4 h-4 mr-3 text-slate-400" />
                  View Profile
                </Link>
                <Link to="/dashboard/settings" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors">
                  <Settings className="w-4 h-4 mr-3 text-slate-400" />
                  Settings
                </Link>
                <Link to="/dashboard/settings" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors">
                  <Bell className="w-4 h-4 mr-3 text-slate-400" />
                  Notifications
                </Link>
                <div className="h-px bg-gray-100 my-1 mx-2"></div>
                <button onClick={() => { setIsDropdownOpen(false); handleLogout(); }} className="w-full text-left flex items-center px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                  <LogOut className="w-4 h-4 mr-3 text-red-500" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out w-full
          ${isCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'}
        `}
      >
        {/* Top Header / Hamburger Bar */}
        <header className="h-20 flex items-center px-6 lg:px-8 bg-[#fafafa] flex-shrink-0 w-full">
          <button 
            onClick={() => {
              if (window.innerWidth < 1024) {
                setIsMobileOpen(true);
              } else {
                setIsCollapsed(!isCollapsed);
              }
            }}
            className="p-2.5 bg-white border border-gray-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-primary transition-colors shadow-sm focus:outline-none flex items-center justify-center"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Dynamic Outlet Content */}
        <div className="flex-1 flex flex-col px-6 pb-6 lg:px-8 w-full [&>div]:flex-1 [&>div]:flex [&>div]:flex-col overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
