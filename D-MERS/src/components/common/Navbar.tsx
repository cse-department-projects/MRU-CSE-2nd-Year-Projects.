import React, { useState } from 'react';
import { Shield, AlertCircle, User, LogOut, HeartHandshake, Home, Activity, CheckCircle, ShieldCheck } from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { DataProvider } from '../../lib/supabase';

interface NavbarProps {
  currentUser: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenReportModal: () => void;
  onOpenAuthModal: () => void;
  onOpenProfileSetupModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenReportModal,
  onOpenAuthModal,
  onOpenProfileSetupModal,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const handleLogout = async () => {
    setShowRoleDropdown(false);
    await DataProvider.logout();
    window.location.reload();
  };

  const getRoleLabel = (role?: UserRole) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'rescue_team': return 'Rescue Team Leader';
      case 'volunteer': return 'Registered Volunteer';
      case 'citizen':
      default: return 'Citizen User';
    }
  };

  const getRoleBadgeColor = (role?: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'rescue_team': return 'bg-red-100 text-red-800 border-red-200';
      case 'volunteer': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'citizen':
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="p-2 bg-brand-900 rounded-xl text-white shadow-md shadow-brand-900/20 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 text-red-500 fill-red-500/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-brand-900">D-MERS</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Disaster Management & Emergency Response System
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold text-slate-700">
            <button
              onClick={() => setActiveTab('landing')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'landing' ? 'bg-white text-brand-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Overview
            </button>

            {(!currentUser || currentUser.role === 'citizen') && (
              <button
                onClick={() => setActiveTab('citizen')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'citizen' ? 'bg-white text-brand-900 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                Citizen Portal
              </button>
            )}

            {(currentUser?.role === 'rescue_team' || currentUser?.role === 'admin') && (
              <button
                onClick={() => setActiveTab('rescue')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'rescue' ? 'bg-white text-brand-900 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                Rescue Command
              </button>
            )}

            {(currentUser?.role === 'volunteer' || currentUser?.role === 'admin') && (
              <button
                onClick={() => setActiveTab('volunteer')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'volunteer' ? 'bg-white text-brand-900 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                Volunteer Match
              </button>
            )}

            <button
              onClick={() => setActiveTab('shelter')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'shelter' ? 'bg-white text-brand-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Shelter Intel
            </button>

            <button
              onClick={() => setActiveTab('recovery')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'recovery' ? 'bg-white text-brand-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Recovery Hub
            </button>

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'admin' ? 'bg-white text-brand-900 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                Admin Ops
              </button>
            )}
          </nav>

          {/* Action Buttons & User Menu */}
          <div className="flex items-center gap-3">
            {/* Instant Emergency SOS Trigger Button */}
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs shadow-md shadow-red-500/25 hover:from-red-700 hover:to-rose-700 transition active:scale-95"
            >
              <AlertCircle className="w-4 h-4 animate-bounce" />
              <span>Report Emergency SOS</span>
            </button>

            {/* Profile & Role Controls */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition text-xs font-semibold text-slate-800"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-900 text-white flex items-center justify-center font-bold text-xs">
                    {currentUser.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="font-bold text-slate-900 leading-tight">{currentUser.full_name}</div>
                    <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded border ${getRoleBadgeColor(currentUser.role)}`}>
                      {currentUser.role.replace('_', ' ')}
                    </span>
                  </div>
                </button>

                {/* Role Switcher Dropdown */}
                {showRoleDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 border-b border-slate-100">
                      <div className="font-bold text-slate-900">{currentUser.full_name}</div>
                      <div className="text-slate-500 text-[11px] truncate">{currentUser.email}</div>
                    </div>

                    <div className="py-2">
                      <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Quick Actions
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <button
                        onClick={onOpenProfileSetupModal}
                        className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-slate-700 text-left"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        <span>Edit Profile Settings</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-rose-50 text-rose-600 font-semibold text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-4 py-2 rounded-xl bg-brand-900 text-white font-bold text-xs hover:bg-brand-800 transition shadow-sm"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
