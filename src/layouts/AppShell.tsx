import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Map as MapIcon, 
  Bell, 
  BrainCircuit, 
  Radio, 
  LineChart, 
  Truck, 
  Settings, 
  Activity, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Clock, 
  Menu, 
  X, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  PhoneCall,
  Home
} from 'lucide-react';
import { useAlerts, useDashboardMetrics, useRiskZones, useSensors } from '../hooks/useSentinelData';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { useAuth, DEMO_USERS } from '../hooks/useAuth';
import { StakeholderRole } from '../types';

interface AppShellProps {
  children?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentTimeUTC, setCurrentTimeUTC] = useState('');
  const [currentTimeIST, setCurrentTimeIST] = useState('');
  
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout, switchRole } = useAuth();
  const { data: alertsData } = useAlerts();
  const { data: metrics } = useDashboardMetrics();
  const { data: zones } = useRiskZones();
  const { data: sensors } = useSensors();

  const activeAlertsCount = alertsData.filter(a => a.status === 'active').length;
  const criticalAlertsCount = alertsData.filter(a => a.status === 'active' && a.severity === 'critical').length;

  // Live Clocks
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeUTC(now.toUTCString().slice(17, 22) + ' UTC');
      const istString = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setCurrentTimeIST(istString + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close search and notification dropdown on outside click
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotificationPanel(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleGlobalClick);
    return () => document.removeEventListener('mousedown', handleGlobalClick);
  }, []);

  // Filter search results
  const searchResults = searchQuery.trim() ? {
    zones: zones.filter(z => z.name.toLowerCase().includes(searchQuery.toLowerCase()) || z.region.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3),
    alerts: alertsData.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.location.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3),
    sensors: sensors.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
  } : null;

  const totalResults = searchResults ? searchResults.zones.length + searchResults.alerts.length + searchResults.sensors.length : 0;

  const navItems = [
    { to: '/', label: 'Overview & Landing', icon: Home },
    { to: '/dashboard', label: 'Safety Check & Home', icon: LayoutDashboard },
    { to: '/map', label: 'Live Risk Map', icon: MapIcon },
    { to: '/alerts', label: 'Warnings & Alerts', icon: Bell, badge: activeAlertsCount > 0 ? activeAlertsCount : undefined, badgeColor: 'bg-[#D93025]' },
    { to: '/safety', label: 'Citizen Safety Guide', icon: ShieldAlert },
    { to: '/sensors', label: 'River & Weather Gauges', icon: Radio },
    { to: '/response', label: 'Shelters & Relief Ops', icon: Truck },
    { to: '/predictions', label: '72h AI Forecast', icon: BrainCircuit },
    { to: '/analytics', label: 'Risk Trends', icon: LineChart },
  ];

  const secondaryNavItems = [
    { to: '/login', label: 'Stakeholder Login / Auth', icon: ShieldCheck },
    { to: '/poster', label: '10-Screen UI Poster', icon: ExternalLink },
    { to: '/settings', label: 'Settings & Preferences', icon: Settings },
    { to: '/status', label: 'System Telemetry', icon: Activity },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#202124]">
      {/* TOP HEADER BAR */}
      <header className="h-16 bg-white border-b border-[#E8EAED] sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between shadow-2xs">
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            id="btn-mobile-sidebar-toggle"
            onClick={() => setMobileOpen(prev => !prev)}
            className="p-2 text-[#5F6368] hover:text-[#202124] hover:bg-gray-100 rounded-xl md:hidden transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>

          <NavLink to="/" className="flex items-center gap-2.5 focus:outline-hidden">
            <div className="w-8 h-8 rounded-xl bg-[#1A73E8] text-white flex items-center justify-center shadow-xs font-bold text-base">
              <ShieldAlert size={18} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-[#202124]">SENTINEL</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-blue-50 text-[#1A73E8] border border-blue-200 rounded">
                  EWS
                </span>
              </div>
              <span className="text-[10px] text-[#5F6368] hidden sm:block">
                Disaster Early Warning Platform
              </span>
            </div>
          </NavLink>
        </div>

        {/* Center: Global Quick Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-md mx-6 hidden md:block">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#80868B]">
              <Search size={15} />
            </div>
            <input
              id="global-search-input"
              type="text"
              placeholder="Search zones, sensors, alert codes, or hazards..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              className="w-full pl-9 pr-8 py-2 bg-[#F8F9FA] hover:bg-[#F1F3F4] focus:bg-white text-xs text-[#202124] rounded-xl border border-[#DADCE0] focus:border-[#1A73E8] focus:ring-2 focus:ring-blue-100 transition-all outline-hidden placeholder-[#80868B]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#80868B] hover:text-[#202124]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Search Dropdown */}
          {searchFocused && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E8EAED] rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto p-2 text-xs">
              {totalResults === 0 ? (
                <div className="p-4 text-center text-[#5F6368]">No matching records found for "{searchQuery}"</div>
              ) : (
                <div className="space-y-2 p-1">
                  {searchResults?.zones.length ? (
                    <div>
                      <div className="text-[10px] font-bold text-[#80868B] uppercase px-2 py-1">Risk Zones</div>
                      {searchResults.zones.map(z => (
                        <div 
                          key={z.id}
                          onClick={() => {
                            navigate(`/map?zone=${z.id}`);
                            setSearchFocused(false);
                          }}
                          className="p-2.5 hover:bg-[#F8F9FA] rounded-xl cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <span className="font-semibold text-[#202124]">{z.name}</span>
                            <span className="text-[#5F6368] text-[11px] block">{z.region} • {z.hazardType}</span>
                          </div>
                          <SeverityBadge severity={z.severity} size="sm" />
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {searchResults?.alerts.length ? (
                    <div>
                      <div className="text-[10px] font-bold text-[#80868B] uppercase px-2 py-1">Active Alerts</div>
                      {searchResults.alerts.map(a => (
                        <div 
                          key={a.id}
                          onClick={() => {
                            navigate('/alerts');
                            setSearchFocused(false);
                          }}
                          className="p-2.5 hover:bg-[#F8F9FA] rounded-xl cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <span className="font-semibold text-[#202124]">{a.title}</span>
                            <span className="text-[#5F6368] text-[11px] block">{a.location}</span>
                          </div>
                          <SeverityBadge severity={a.severity} size="sm" />
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {searchResults?.sensors.length ? (
                    <div>
                      <div className="text-[10px] font-bold text-[#80868B] uppercase px-2 py-1">Telemetry Sensors</div>
                      {searchResults.sensors.map(s => (
                        <div 
                          key={s.id}
                          onClick={() => {
                            navigate(`/sensors`);
                            setSearchFocused(false);
                          }}
                          className="p-2.5 hover:bg-[#F8F9FA] rounded-xl cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <span className="font-semibold text-[#202124]">{s.name} ({s.id})</span>
                            <span className="text-[#5F6368] text-[11px] block">{s.location.name} • {s.type}</span>
                          </div>
                          <span className="font-mono text-[11px] text-[#1A73E8] font-bold">{s.reading.value} {s.reading.unit}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Controls: Clocks, Emergency Button, Notifications */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">

          {/* Emergency 112 / 1078 Quick Call Pill */}
          <NavLink
            to="/safety"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-[#D93025] rounded-xl text-xs font-bold transition-all shrink-0"
            title="Citizen Emergency Helplines & SOS Guide"
          >
            <PhoneCall size={13} className="text-[#D93025]" />
            <span>SOS: 112</span>
          </NavLink>

          {/* Notifications Bell */}
          <div ref={notifRef} className="relative">
            <button
              id="btn-header-notifications"
              onClick={() => setShowNotificationPanel(prev => !prev)}
              className="p-2.5 text-[#5F6368] hover:text-[#202124] hover:bg-gray-100 rounded-xl relative transition-colors"
              aria-label="Alert feed"
            >
              <Bell size={18} />
              {activeAlertsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#D93025] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {activeAlertsCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotificationPanel && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E8EAED] rounded-2xl shadow-xl z-50 text-xs overflow-hidden">
                <div className="p-3.5 border-b border-[#E8EAED] bg-[#F8F9FA] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#202124]">Incident Notifications</span>
                    <span className="px-2 py-0.5 bg-red-100 text-[#D93025] rounded-full text-[10px] font-bold">
                      {activeAlertsCount} Active
                    </span>
                  </div>
                  <NavLink 
                    to="/alerts" 
                    onClick={() => setShowNotificationPanel(false)}
                    className="text-[#1A73E8] hover:underline text-[11px] font-semibold"
                  >
                    View All
                  </NavLink>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#F1F3F4]">
                  {alertsData.slice(0, 4).map(alert => (
                    <div 
                      key={alert.id}
                      onClick={() => {
                        navigate('/alerts');
                        setShowNotificationPanel(false);
                      }}
                      className="p-3.5 hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <SeverityBadge severity={alert.severity} size="sm" />
                        <span className="text-[10px] text-[#80868B]">{alert.timestamp}</span>
                      </div>
                      <h4 className="font-semibold text-[#202124] text-xs leading-snug line-clamp-1">
                        {alert.title}
                      </h4>
                      <p className="text-[11px] text-[#5F6368] mt-1 line-clamp-1">
                        {alert.location}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 border-t border-[#E8EAED] bg-[#F8F9FA] text-center">
                  <NavLink
                    to="/alerts"
                    onClick={() => setShowNotificationPanel(false)}
                    className="text-[#1A73E8] hover:underline font-bold block py-1"
                  >
                    Open Incident Command Feed →
                  </NavLink>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Stakeholder Menu */}
          <div ref={userMenuRef} className="relative pl-2 border-l border-[#E8EAED]">
            <button
              onClick={() => setShowUserMenu(prev => !prev)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-gray-100 transition-colors text-left"
              title="Stakeholder Profile & Access"
            >
              <div 
                className={`w-8 h-8 rounded-xl text-white font-bold text-xs flex items-center justify-center border border-white shadow-xs ${
                  user?.role === 'government' ? 'bg-red-600' :
                  user?.role === 'first_responder' ? 'bg-amber-600' :
                  user?.role === 'ngo' ? 'bg-emerald-600' : 'bg-[#1A73E8]'
                }`}
              >
                {user ? user.name.slice(0, 2).toUpperCase() : 'GS'}
              </div>
              <div className="hidden lg:flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#202124] leading-tight truncate max-w-[120px]">
                    {user?.name || 'Guest User'}
                  </span>
                  <span className={`text-[8px] font-black uppercase px-1 py-0.2 rounded ${
                    user?.role === 'government' ? 'bg-red-100 text-red-700' :
                    user?.role === 'first_responder' ? 'bg-amber-100 text-amber-700' :
                    user?.role === 'ngo' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user?.role === 'government' ? 'Govt' :
                     user?.role === 'first_responder' ? 'NDRF' :
                     user?.role === 'ngo' ? 'NGO' : 'Citizen'}
                  </span>
                </div>
                <span className="text-[10px] text-[#5F6368] truncate max-w-[140px]">
                  {user?.roleTitle || 'Citizen Portal'}
                </span>
              </div>
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E8EAED] rounded-2xl shadow-xl z-50 p-3 text-xs">
                {/* Active Profile Info */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#202124]">{user?.name}</span>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-100 text-[#1A73E8]">
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5F6368] mt-0.5">{user?.email}</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">
                    🏢 {user?.organization || 'Community Network'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    📍 {user?.jurisdiction || 'All Regions'}
                  </p>
                </div>

                {/* Quick Switch Stakeholder Role */}
                <div className="space-y-1.5 mb-3">
                  <span className="text-[10px] font-bold text-[#80868B] uppercase tracking-wider block">
                    Switch Stakeholder View:
                  </span>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => {
                        switchRole('citizen');
                        setShowUserMenu(false);
                      }}
                      className={`p-1.5 text-left rounded-lg text-[11px] font-bold border transition-colors ${
                        user?.role === 'citizen' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      👤 Citizen
                    </button>
                    <button
                      onClick={() => {
                        switchRole('ngo');
                        setShowUserMenu(false);
                      }}
                      className={`p-1.5 text-left rounded-lg text-[11px] font-bold border transition-colors ${
                        user?.role === 'ngo' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      🤝 NGO Lead
                    </button>
                    <button
                      onClick={() => {
                        switchRole('government');
                        setShowUserMenu(false);
                      }}
                      className={`p-1.5 text-left rounded-lg text-[11px] font-bold border transition-colors ${
                        user?.role === 'government' ? 'bg-red-50 border-red-300 text-red-700' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      🏛️ Govt NDMA
                    </button>
                    <button
                      onClick={() => {
                        switchRole('first_responder');
                        setShowUserMenu(false);
                      }}
                      className={`p-1.5 text-left rounded-lg text-[11px] font-bold border transition-colors ${
                        user?.role === 'first_responder' ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      🚒 First Responder
                    </button>
                  </div>
                </div>

                {/* Auth Navigation Links */}
                <div className="pt-2 border-t border-[#E8EAED] space-y-1">
                  <NavLink
                    to="/login"
                    onClick={() => setShowUserMenu(false)}
                    className="block w-full py-2 px-2.5 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold text-center"
                  >
                    Switch Account / Sign In Page &rarr;
                  </NavLink>
                  <NavLink
                    to="/signup"
                    onClick={() => setShowUserMenu(false)}
                    className="block w-full py-2 px-2.5 rounded-lg text-[#1A73E8] bg-blue-50 hover:bg-blue-100 font-bold text-center"
                  >
                    + Register New Stakeholder
                  </NavLink>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                      navigate('/login');
                    }}
                    className="block w-full py-1.5 px-2.5 rounded-lg text-red-600 hover:bg-red-50 font-semibold text-center"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* BODY SHELL: Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside 
          id="app-desktop-sidebar"
          className={`bg-white border-r border-[#E8EAED] transition-all duration-200 shrink-0 hidden md:flex flex-col justify-between ${
            collapsed ? 'w-16' : 'w-60'
          }`}
        >
          {/* Main Nav Items */}
          <div className="p-3 space-y-1.5 overflow-y-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-[#1A73E8] font-bold'
                        : 'text-[#5F6368] hover:text-[#202124] hover:bg-[#F8F9FA]'
                    }`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${item.badgeColor || 'bg-[#1A73E8]'}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              );
            })}

            <div className="my-3 border-t border-[#E8EAED]" />

            {secondaryNavItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-[#1A73E8] font-bold'
                        : 'text-[#5F6368] hover:text-[#202124] hover:bg-[#F8F9FA]'
                    }`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>

          {/* Bottom Sidebar Widget */}
          <div className="p-3.5 border-t border-[#E8EAED] bg-[#F8F9FA]">
            {!collapsed ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#5F6368]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#1E8E3E] inline-block animate-pulse" />
                    <span className="font-medium text-[#202124]">Telemetry Operational</span>
                  </div>
                </div>
                <div className="text-[10px] text-[#80868B] flex justify-between">
                  <span>1,284 Sensors</span>
                  <span>v2.4 LTS</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center" title="All Systems Operational">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E8E3E] inline-block" />
              </div>
            )}

            {/* Collapse / Expand Toggle Button */}
            <button
              id="btn-sidebar-collapse-toggle"
              onClick={() => setCollapsed(prev => !prev)}
              className="mt-2 w-full py-1.5 text-center text-[#5F6368] hover:text-[#202124] hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
        </aside>

        {/* MOBILE DRAWER */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-64 bg-white h-full flex flex-col justify-between p-4 z-10 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8EAED]">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={20} className="text-[#1A73E8]" />
                    <span className="font-bold text-base">SENTINEL</span>
                  </div>
                  <button onClick={() => setMobileOpen(false)} className="p-1 text-[#5F6368]">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-1">
                  {navItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium ${
                            isActive
                              ? 'bg-blue-50 text-[#1A73E8] font-bold'
                              : 'text-[#5F6368] hover:bg-[#F8F9FA]'
                          }`
                        }
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-[#D93025]">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-[#E8EAED] space-y-1">
                  {secondaryNavItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium ${
                            isActive
                              ? 'bg-blue-50 text-[#1A73E8] font-bold'
                              : 'text-[#5F6368] hover:bg-[#F8F9FA]'
                          }`
                        }
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8EAED] text-[11px] text-[#5F6368]">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#1E8E3E]" />
                  <span>Operational Status: Green</span>
                </div>
                <span className="text-[10px] text-[#80868B]">1,284 Sensors Active</span>
              </div>
            </div>
          </div>
        )}

        {/* MAIN ROUTED CONTENT */}
        <main 
          id="sentinel-main-viewport"
          className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col justify-between focus:outline-hidden"
        >
          <div className="p-5 md:p-8 max-w-7xl mx-auto w-full flex-1">
            {children || <Outlet />}
          </div>

          {/* FOOTER BAR */}
          <footer className="h-9 bg-white border-t border-[#E8EAED] px-4 md:px-8 flex items-center justify-between text-[11px] text-[#80868B] shrink-0 select-none">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-medium text-[#5F6368]">
                <span className="w-2 h-2 rounded-full bg-[#1E8E3E] inline-block animate-pulse" />
                Live Sync Active
              </span>
              <span className="text-[#DADCE0]">|</span>
              <span>1,284 Sensors</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-medium text-[#5F6368]">SENTINEL EWS</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
