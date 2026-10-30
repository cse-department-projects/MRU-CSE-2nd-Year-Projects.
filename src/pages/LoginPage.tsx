import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  Building2, 
  MapPin, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  Radio, 
  AlertTriangle, 
  Sparkles, 
  Eye, 
  EyeOff,
  Flame,
  HeartHandshake,
  Landmark,
  Truck,
  ArrowLeft
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../hooks/useAuth';
import { StakeholderRole } from '../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithPreset, register, user: currentUser } = useAuth();

  // Mode: login vs register
  const [authMode, setAuthMode] = useState<'login' | 'register'>(
    location.pathname === '/signup' ? 'register' : 'login'
  );

  // Selected stakeholder tab
  const [selectedRole, setSelectedRole] = useState<StakeholderRole>('citizen');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone' | 'sso'>('email');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration fields
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [jurisdiction, setJurisdiction] = useState('New Delhi (NCR Zone)');
  const [badgeNumber, setBadgeNumber] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const stakeholderInfo: Record<StakeholderRole, {
    title: string;
    subtitle: string;
    icon: React.ElementType;
    color: string;
    badge: string;
    benefits: string[];
  }> = {
    citizen: {
      title: 'Citizen & Community Resident',
      subtitle: 'Neighborhood risk detection, instant emergency alerts, shelter routing & family check-ins.',
      icon: User,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Public Tier',
      benefits: [
        'Hyperlocal Flood & Cyclone Radar Warnings',
        'Direct SOS & Live Incident Reporting',
        'Nearby Certified Relief Shelter Navigation'
      ]
    },
    ngo: {
      title: 'NGO & Volunteer Response Lead',
      subtitle: 'Aid coordination, relief camp logistics, supply chain distribution & volunteer rosters.',
      icon: HeartHandshake,
      color: 'from-emerald-600 to-teal-700',
      badge: 'Humanitarian Partner',
      benefits: [
        'Relief Camp Occupancy & Resource Tracking',
        'Food, Water & Medical Aid Dispatch Management',
        'Direct Liaison with Civil Defense & NDRF'
      ]
    },
    government: {
      title: 'Government Disaster Authority (NDMA / SDMA)',
      subtitle: 'Official broadcast authorization, critical threshold overrides & regional evacuation directives.',
      icon: Landmark,
      color: 'from-red-600 to-rose-700',
      badge: 'Command Authority',
      benefits: [
        'Multi-Channel Early Warning Broadcast (SMS/Sirens/Apps)',
        'Full Sensor Network Override & Threshold Controls',
        'State-Wide Evacuation Order Enforcement'
      ]
    },
    first_responder: {
      title: 'First Responder & Emergency Services',
      subtitle: 'NDRF, SDRF, Police, Fire, Coast Guard & Medical rapid response task force personnel.',
      icon: Truck,
      color: 'from-amber-600 to-orange-700',
      badge: 'Tactical Responder',
      benefits: [
        'Real-time GPS Incident & Casualty Navigation',
        'Direct Radio & Encrypted Telemetry Feeds',
        'Automated Deployment Status Synchronization'
      ]
    }
  };

  const handleSendOtp = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setSuccessMessage(`OTP sent successfully to +91 ${phoneNumber}. (Use code: 123456)`);
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    setTimeout(() => {
      setLoading(false);
      if (authMode === 'login') {
        if (loginMethod === 'phone' && otpSent && otpCode !== '123456' && otpCode !== '999999') {
          setErrorMessage('Invalid OTP code. Please use demo code 123456');
          return;
        }
        login(email || DEMO_USERS[selectedRole].email, selectedRole, fullName || DEMO_USERS[selectedRole].name);
        setSuccessMessage(`Welcome back! Authenticated as ${stakeholderInfo[selectedRole].title}`);
      } else {
        register({
          name: fullName || 'New Stakeholder',
          email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@sentinel-ews.org`,
          role: selectedRole,
          roleTitle: stakeholderInfo[selectedRole].title,
          organization: organization || (selectedRole === 'government' ? 'State Disaster Management Authority' : 'Civic Community Network'),
          jurisdiction: jurisdiction || 'National Central Command',
          phone: phoneNumber || '+91 98765 00000',
          badgeId: badgeNumber || (selectedRole === 'first_responder' ? 'NDRF-REG-901' : undefined),
          accessibleModules: DEMO_USERS[selectedRole].accessibleModules
        });
        setSuccessMessage(`Account created successfully as verified ${stakeholderInfo[selectedRole].title}!`);
      }

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }, 900);
  };

  const handleQuickPreset = (role: StakeholderRole) => {
    setLoading(true);
    loginWithPreset(role);
    setSuccessMessage(`Switched to demo session: ${DEMO_USERS[role].name} (${DEMO_USERS[role].roleTitle})`);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#202124] flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      
      {/* Top Header */}
      <header className="bg-white border-b border-[#E8EAED] px-6 py-4 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#1A73E8] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <ShieldAlert size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-[#202124]">SENTINEL</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-blue-50 text-[#1A73E8] rounded border border-blue-200">
                  Auth Portal
                </span>
              </div>
              <span className="text-[10px] text-[#5F6368]">Disaster Early Warning Platform</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#1A73E8] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Overview</span>
            </Link>

            <Link
              to="/dashboard"
              className="px-4 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              Enter Live Console &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN AUTH CONTAINER */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 flex-1 flex flex-col items-center justify-center">
        
        <div className="w-full max-w-5xl bg-white rounded-3xl border border-[#DADCE0] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT SIDE: STAKEHOLDER CONTEXT & ROLE SELECTOR (5 COLS) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0B3B95] via-[#0B2A6B] to-[#041638] p-8 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Background Pattern */}
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#FFFFFF 1.5px, transparent 1.5px)',
                backgroundSize: '20px 20px'
              }}
            />

            <div className="relative z-10 space-y-6">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-blue-300 px-2.5 py-1 bg-blue-900/60 rounded-full border border-blue-400/30">
                  Stakeholder Access
                </span>
                <h2 className="text-2xl font-black tracking-tight text-white mt-3">
                  Multi-Agency Early Warning Gateway
                </h2>
                <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                  Dedicated secure channels for residents, humanitarian NGOs, disaster authorities, and emergency first responders.
                </p>
              </div>

              {/* Stakeholder Role Selector Cards */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold text-blue-200 uppercase tracking-wider block">
                  Select Your Stakeholder Category:
                </label>
                
                {(['citizen', 'ngo', 'government', 'first_responder'] as StakeholderRole[]).map((role) => {
                  const isSelected = selectedRole === role;
                  const item = stakeholderInfo[role];
                  const Icon = item.icon;

                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`w-full p-3 rounded-2xl text-left border transition-all flex items-start gap-3 ${
                        isSelected 
                          ? 'bg-white text-slate-900 border-white shadow-lg shadow-black/20 scale-[1.02]' 
                          : 'bg-white/10 text-white border-white/10 hover:bg-white/15'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${
                        isSelected ? 'bg-[#0B3B95] text-white' : 'bg-white/20 text-white'
                      }`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black truncate">{item.title}</span>
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-blue-100 text-[#0B3B95]' : 'bg-white/20 text-blue-200'
                          }`}>
                            {item.badge}
                          </span>
                        </div>
                        <p className={`text-[10px] mt-0.5 line-clamp-1 ${
                          isSelected ? 'text-slate-600 font-medium' : 'text-blue-200'
                        }`}>
                          {item.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Role-Specific Capabilities Highlights */}
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-300 block flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-blue-400" />
                  <span>Role Access Privileges:</span>
                </span>
                <ul className="space-y-1 text-[11px] text-blue-100">
                  {stakeholderInfo[selectedRole].benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Demo One-Click Login Presets */}
            <div className="relative z-10 pt-6 mt-6 border-t border-white/15 space-y-2">
              <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider block">
                ⚡ Quick Demo Presets (Instant Switch):
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickPreset('government')}
                  className="px-2.5 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-[10px] font-black transition-all flex items-center justify-center gap-1"
                >
                  <Landmark size={11} />
                  <span>NDMA Officer</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPreset('first_responder')}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white text-[10px] font-black transition-all flex items-center justify-center gap-1"
                >
                  <Truck size={11} />
                  <span>NDRF Command</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPreset('ngo')}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-[10px] font-black transition-all flex items-center justify-center gap-1"
                >
                  <HeartHandshake size={11} />
                  <span>Red Cross NGO</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPreset('citizen')}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white text-[10px] font-black transition-all flex items-center justify-center gap-1"
                >
                  <User size={11} />
                  <span>Citizen Aarav</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: AUTH FORM (7 COLS) */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white">
            
            <div>
              {/* Login / Register Toggle Tabs */}
              <div className="flex items-center justify-between border-b border-[#E8EAED] pb-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-[#202124]">
                    {authMode === 'login' ? 'Sign in to Sentinel' : 'Create Stakeholder Account'}
                  </h3>
                  <p className="text-xs text-[#5F6368] mt-0.5">
                    {authMode === 'login' 
                      ? `Accessing portal as ${stakeholderInfo[selectedRole].title}`
                      : `Register verified profile for ${stakeholderInfo[selectedRole].title}`
                    }
                  </p>
                </div>

                <div className="flex items-center bg-[#F1F3F4] p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      authMode === 'login' 
                        ? 'bg-white text-[#1A73E8] shadow-xs' 
                        : 'text-[#5F6368] hover:text-[#202124]'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      authMode === 'register' 
                        ? 'bg-white text-[#1A73E8] shadow-xs' 
                        : 'text-[#5F6368] hover:text-[#202124]'
                    }`}
                  >
                    Register
                  </button>
                </div>
              </div>

              {/* Status Notifications */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 size={15} className="shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Sign In Method Selector */}
              {authMode === 'login' && (
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('email')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      loginMethod === 'email'
                        ? 'bg-blue-50 border-[#1A73E8] text-[#1A73E8]'
                        : 'bg-white border-[#DADCE0] text-[#5F6368] hover:bg-gray-50'
                    }`}
                  >
                    <Mail size={13} />
                    <span>Email & Pass</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoginMethod('phone')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      loginMethod === 'phone'
                        ? 'bg-blue-50 border-[#1A73E8] text-[#1A73E8]'
                        : 'bg-white border-[#DADCE0] text-[#5F6368] hover:bg-gray-50'
                    }`}
                  >
                    <Phone size={13} />
                    <span>Mobile OTP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoginMethod('sso')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      loginMethod === 'sso'
                        ? 'bg-blue-50 border-[#1A73E8] text-[#1A73E8]'
                        : 'bg-white border-[#DADCE0] text-[#5F6368] hover:bg-gray-50'
                    }`}
                  >
                    <Landmark size={13} />
                    <span>Govt SSO</span>
                  </button>
                </div>
              )}

              {/* FORM FIELDS */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Registration Only Fields */}
                {authMode === 'register' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#3C4043] mb-1">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User size={14} className="absolute left-3 top-3 text-[#80868B]" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Aarav Sharma"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#DADCE0] focus:border-[#1A73E8] focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#3C4043] mb-1">
                          Mobile Contact *
                        </label>
                        <div className="relative">
                          <Phone size={14} className="absolute left-3 top-3 text-[#80868B]" />
                          <input
                            type="tel"
                            required
                            placeholder="+91 98765 43210"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#DADCE0] focus:border-[#1A73E8] focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#3C4043] mb-1">
                          {selectedRole === 'government' ? 'Ministry / Department *' : selectedRole === 'ngo' ? 'NGO Organization *' : 'Community / Resident Association'}
                        </label>
                        <div className="relative">
                          <Building2 size={14} className="absolute left-3 top-3 text-[#80868B]" />
                          <input
                            type="text"
                            placeholder={selectedRole === 'government' ? 'e.g. NDMA / SDMA Central Command' : selectedRole === 'ngo' ? 'e.g. Red Cross / Oxfam Relief' : 'e.g. Yamuna Basin Resident Welfare'}
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#DADCE0] focus:border-[#1A73E8] focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#3C4043] mb-1">
                          Assigned Jurisdiction / District *
                        </label>
                        <div className="relative">
                          <MapPin size={14} className="absolute left-3 top-3 text-[#80868B]" />
                          <select
                            value={jurisdiction}
                            onChange={(e) => setJurisdiction(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#DADCE0] focus:border-[#1A73E8] focus:ring-2 focus:ring-blue-100 outline-hidden transition-all bg-white"
                          >
                            <option value="New Delhi (NCR Zone)">New Delhi (NCR Zone)</option>
                            <option value="Brahmaputra Basin, Assam">Brahmaputra Basin, Assam</option>
                            <option value="Odisha Coastal Cyclone Belt">Odisha Coastal Cyclone Belt</option>
                            <option value="Chamoli & Himalayan Zone">Chamoli & Himalayan Zone</option>
                            <option value="Mumbai Coastal & Mithi Basin">Mumbai Coastal & Mithi Basin</option>
                            <option value="Kerala Coastal & Western Ghats">Kerala Coastal & Western Ghats</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {(selectedRole === 'government' || selectedRole === 'first_responder' || selectedRole === 'ngo') && (
                      <div>
                        <label className="block text-xs font-bold text-[#3C4043] mb-1">
                          Official Badge / Employee ID Code (For Instant Verification)
                        </label>
                        <div className="relative">
                          <ShieldCheck size={14} className="absolute left-3 top-3 text-[#80868B]" />
                          <input
                            type="text"
                            placeholder="e.g. GOV-NDMA-0019 or NDRF-BAT-084"
                            value={badgeNumber}
                            onChange={(e) => setBadgeNumber(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#DADCE0] focus:border-[#1A73E8] focus:ring-2 focus:ring-blue-100 outline-hidden transition-all font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Email Login Mode */}
                {(authMode === 'register' || loginMethod === 'email') && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-[#3C4043] mb-1">
                        Stakeholder Email Address *
                      </label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-3 text-[#80868B]" />
                        <input
                          type="email"
                          required
                          placeholder={DEMO_USERS[selectedRole].email}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#DADCE0] focus:border-[#1A73E8] focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                        />
                      </div>
                      {authMode === 'login' && (
                        <p className="text-[10px] text-[#80868B] mt-1">
                          Default preset: <span className="font-mono text-blue-600 font-bold">{DEMO_USERS[selectedRole].email}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-[#3C4043]">
                          Password *
                        </label>
                        {authMode === 'login' && (
                          <a href="#forgot" onClick={(e) => { e.preventDefault(); setSuccessMessage('Reset link sent to registered email.'); }} className="text-[10px] text-[#1A73E8] hover:underline font-semibold">
                            Forgot password?
                          </a>
                        )}
                      </div>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3 top-3 text-[#80868B]" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-[#DADCE0] focus:border-[#1A73E8] focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-[#80868B] hover:text-[#202124]"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Phone OTP Login Mode */}
                {authMode === 'login' && loginMethod === 'phone' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-[#3C4043] mb-1">
                        Registered Mobile Number *
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Phone size={14} className="absolute left-3 top-3 text-[#80868B]" />
                          <input
                            type="tel"
                            placeholder="9876543210"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#DADCE0] focus:border-[#1A73E8] focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={loading}
                          className="px-4 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
                        >
                          {otpSent ? 'Resend' : 'Send OTP'}
                        </button>
                      </div>
                    </div>

                    {otpSent && (
                      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                        <label className="block text-xs font-bold text-[#0B3B95]">
                          Enter 6-Digit Verification Code:
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="w-full px-3 py-2 text-center tracking-[0.5em] font-mono text-sm font-black rounded-xl border border-[#DADCE0] focus:border-[#1A73E8] focus:ring-2 focus:ring-blue-100 outline-hidden bg-white"
                        />
                        <p className="text-[10px] text-slate-500 text-center">
                          Demo OTP code: <span className="font-mono font-bold text-[#1A73E8]">123456</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Government / Parichay SSO Mode */}
                {authMode === 'login' && loginMethod === 'sso' && (
                  <div className="space-y-3 py-2">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <Landmark size={16} className="text-[#0B3B95]" />
                        <span>Digital India & Parichay Government Single Sign-On</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Authorized disaster management officers, NDMA coordinators, and State SDRF controllers can authenticate using their official @gov.in credentials.
                      </p>
                      
                      <button
                        type="button"
                        onClick={() => handleQuickPreset('government')}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#0B3B95] hover:bg-[#08296B] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 mt-2"
                      >
                        <ShieldCheck size={15} />
                        <span>Authenticate with Parichay GOV SSO &rarr;</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                {loginMethod !== 'sso' && (
                  <button
                    id="btn-submit-auth"
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 mt-4 hover:scale-[1.01] active:scale-98"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>
                          {authMode === 'login' 
                            ? `Sign in as ${stakeholderInfo[selectedRole].badge}` 
                            : `Register as ${stakeholderInfo[selectedRole].badge}`
                          }
                        </span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                )}

              </form>

              {/* Social Login Options */}
              {authMode === 'login' && loginMethod === 'email' && (
                <div className="mt-6 pt-6 border-t border-[#E8EAED] space-y-2.5">
                  <span className="text-[10px] text-[#80868B] uppercase font-bold tracking-wider block text-center">
                    Or Continue With Verified Provider:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickPreset(selectedRole)}
                      className="w-full py-2 px-3 rounded-xl border border-[#DADCE0] hover:bg-gray-50 text-xs font-bold text-[#3C4043] flex items-center justify-center gap-2 transition-colors"
                    >
                      <span className="text-red-500 font-black">G</span>
                      <span>Google SSO</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickPreset('government')}
                      className="w-full py-2 px-3 rounded-xl border border-[#DADCE0] hover:bg-gray-50 text-xs font-bold text-[#3C4043] flex items-center justify-center gap-2 transition-colors"
                    >
                      <ShieldCheck size={14} className="text-[#1A73E8]" />
                      <span>DigiLocker ID</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Security Assurance Footnote */}
            <div className="pt-6 mt-6 border-t border-[#E8EAED] flex items-center justify-between text-[10px] text-[#80868B]">
              <span className="flex items-center gap-1">
                <Lock size={11} className="text-emerald-600" />
                <span>256-Bit TLS End-to-End Encrypted</span>
              </span>
              <span>NDMA EWS Standard Compliant</span>
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E8EAED] py-4 px-6 text-center text-xs text-[#5F6368]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>&copy; 2025 SENTINEL Disaster Early Warning Platform &bull; Citizen & Stakeholder Gateway</span>
          <div className="flex items-center gap-4">
            <Link to="/safety" className="hover:text-[#1A73E8]">Safety Directives</Link>
            <Link to="/map" className="hover:text-[#1A73E8]">Risk Map</Link>
            <Link to="/alerts" className="hover:text-[#1A73E8]">Active Warnings</Link>
            <Link to="/poster" className="hover:text-[#1A73E8]">UI Poster</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};
