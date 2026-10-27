import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, Users, Home, HeartHandshake, BarChart2, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { supabase, DataProvider } from './lib/supabase';
import { UserProfile, UserRole } from './types';

// Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileSetupModal } from './components/auth/ProfileSetupModal';
import { IncidentReportWizard } from './components/citizen/IncidentReportWizard';
import { CitizenDashboard } from './components/citizen/CitizenDashboard';
import { RescueCommandCenter } from './components/rescue/RescueCommandCenter';
import { VolunteerPortal } from './components/volunteer/VolunteerPortal';
import { ShelterIntelligence } from './components/shelter/ShelterIntelligence';
import { RecoveryHub } from './components/recovery/RecoveryHub';
import { AdminOperationsCenter } from './components/admin/AdminOperationsCenter';

type AppTab = 'landing' | 'citizen' | 'rescue' | 'volunteer' | 'shelter' | 'recovery' | 'admin';

// Splash Screen Component
const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 200);
          return 100;
        }
        return p + 3;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-brand-900 flex flex-col items-center justify-center z-50 select-none">
      <div className="flex flex-col items-center space-y-6 text-white">
        {/* Animated Logo */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-white/10 border-2 border-white/25 flex items-center justify-center shadow-2xl">
            <Shield className="w-12 h-12 text-red-400" />
          </div>
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 animate-ping opacity-80"></span>
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500"></span>
        </div>

        {/* Brand Name */}
        <div className="text-center space-y-1">
          <h1 className="text-5xl font-black tracking-tight text-white">D-MERS</h1>
          <p className="text-blue-200 text-sm font-medium">Disaster Management & Emergency Response System</p>
          <p className="text-blue-400 text-xs font-medium italic">"One Platform. Faster Response. Safer Communities."</p>
        </div>

        {/* Progress Loader */}
        <div className="w-64 space-y-2">
          <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-red-500 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-blue-300 text-xs font-medium">
            {progress < 30 ? 'Initializing Emergency Grid...' :
             progress < 60 ? 'Loading Response Protocols...' :
             progress < 90 ? 'Connecting to Command Network...' :
             'Ready for Operations'}
          </p>
        </div>
      </div>

      <div className="absolute bottom-8 text-center">
        <p className="text-blue-400 text-[11px]">D-MERS v1.0 • Smart Emergency Response Platform</p>
      </div>
    </div>
  );
};

// No Internet Connection Screen
const NoInternetScreen: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div className="text-center max-w-sm space-y-5">
      <div className="w-20 h-20 rounded-3xl bg-slate-200 flex items-center justify-center mx-auto">
        <WifiOff className="w-10 h-10 text-slate-500" />
      </div>
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">No Internet Connection</h2>
        <p className="text-slate-600 text-sm mt-2 leading-relaxed">
          D-MERS requires an internet connection to access the emergency response network. Please check your connection and try again.
        </p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-900 text-white font-bold mx-auto hover:bg-brand-800 transition"
      >
        <RefreshCw className="w-5 h-5" />
        <span>Retry Connection</span>
      </button>
    </div>
  </div>
);

// Error Boundary Hook
const ErrorScreen: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div className="text-center max-w-sm space-y-5">
      <div className="w-20 h-20 rounded-3xl bg-red-100 flex items-center justify-center mx-auto">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Something went wrong</h2>
        <p className="text-slate-600 text-sm mt-2 leading-relaxed">
          D-MERS encountered an unexpected error. Please restart the application and try again.
        </p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-900 text-white font-bold mx-auto hover:bg-brand-800 transition"
      >
        <RefreshCw className="w-5 h-5" />
        <span>Restart Application</span>
      </button>
    </div>
  </div>
);

const getDashboardTabForRole = (role?: UserRole): AppTab => {
  switch (role) {
    case 'admin': return 'admin';
    case 'rescue_team': return 'rescue';
    case 'volunteer': return 'volunteer';
    case 'citizen':
    default: return 'citizen';
  }
};

// Authentication Initialization Screen
const AuthLoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 select-none">
    <div className="flex flex-col items-center space-y-5 text-center max-w-sm">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-brand-900 flex items-center justify-center shadow-xl">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 animate-ping opacity-75"></span>
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500"></span>
      </div>

      <div>
        <h3 className="text-xl font-extrabold tracking-tight text-slate-900">D-MERS</h3>
        <p className="text-sm text-slate-500 mt-1">Securing your session...</p>
      </div>

      <div className="w-48 space-y-2">
        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-red-500 rounded-full animate-pulse w-full" />
        </div>
      </div>
    </div>
  </div>
);

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // If returning from OAuth redirect, skip the intro splash screen to avoid delay
    const isOAuthRedirect =
      window.location.hash.includes('access_token') ||
      window.location.search.includes('code=');
    return !isOAuthRedirect;
  });
  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    try {
      const saved = sessionStorage.getItem('dmers_activeTab') as AppTab;
      if (saved) return saved;
    } catch (_) {}
    return 'landing';
  });
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showReportWizard, setShowReportWizard] = useState(false);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [shelters, setShelters] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasError, setHasError] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  // authLoading: true until Supabase has resolved the initial session (prevents flash of landing page)
  const [authLoading, setAuthLoading] = useState(true);


  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
    try {
      sessionStorage.setItem('dmers_activeTab', tab);
    } catch (_) {}
  };

  // ── Authentication Initializer & Listener ─────────────────────────────────
  useEffect(() => {
    let currentUserId: string | null = null;
    let isMounted = true;

    // ── Helper: Process Desktop Custom Protocol (dmers://auth/callback) ─────
    const handleDesktopOAuthUrl = async (callbackUrl: string) => {
      if (!callbackUrl || typeof callbackUrl !== 'string' || !callbackUrl.startsWith('dmers://')) return;
      console.log('[D-MERS Desktop Auth] Processing protocol callback URL: scheme=dmers');

      try {
        setAuthLoading(true);

        const hashIdx = callbackUrl.indexOf('#');
        const queryIdx = callbackUrl.indexOf('?');

        let queryString = '';
        let hashString = '';

        if (queryIdx !== -1) {
          const endQuery = hashIdx !== -1 && hashIdx > queryIdx ? hashIdx : callbackUrl.length;
          queryString = callbackUrl.slice(queryIdx + 1, endQuery);
        }
        if (hashIdx !== -1) {
          hashString = callbackUrl.slice(hashIdx + 1);
        }

        const queryParams = new URLSearchParams(queryString);
        const hashParams = new URLSearchParams(hashString);

        const errorParam = hashParams.get('error') || queryParams.get('error') ||
                           hashParams.get('error_description') || queryParams.get('error_description');
        if (errorParam) {
          console.warn('[D-MERS Desktop Auth] OAuth callback error:', errorParam);
          setShowAuthModal(false);
          setToast({ message: `Authentication error: ${errorParam}`, type: 'error' });
          setAuthLoading(false);
          return;
        }

        const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
        const code = queryParams.get('code') || hashParams.get('code');

        console.log('[D-MERS Desktop Auth] Callback parameters:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hasCode: !!code,
        });

        if (accessToken) {
          console.log('[D-MERS Desktop Auth] Setting Supabase session from hash tokens...');
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (error) {
            console.error('[D-MERS Desktop Auth] setSession failed:', error.message);
            setShowAuthModal(false);
            setToast({ message: `Session error: ${error.message}`, type: 'error' });
            setAuthLoading(false);
            return;
          }

          if (data?.session) {
            console.log('[D-MERS Desktop Auth] Session established. User ID:', data.session.user?.id);
            await processSession(data.session, true);
          }
        } else if (code) {
          console.log('[D-MERS Desktop Auth] Exchanging PKCE code for session...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error('[D-MERS Desktop Auth] exchangeCodeForSession failed:', error.message);
            setShowAuthModal(false);
            setToast({ message: `Code exchange error: ${error.message}`, type: 'error' });
            setAuthLoading(false);
            return;
          }

          if (data?.session) {
            console.log('[D-MERS Desktop Auth] Code exchange succeeded. User ID:', data.session.user?.id);
            await processSession(data.session, true);
          }
        } else {
          console.warn('[D-MERS Desktop Auth] No access_token or code found in callback URL.');
          setAuthLoading(false);
        }
      } catch (err: any) {
        console.error('[D-MERS Desktop Auth] Exception processing OAuth callback:', err);
        setShowAuthModal(false);
        setAuthLoading(false);
      }
    };

    // ── Pull any pending OAuth URL queued in Electron main on startup ──────
    if (typeof window !== 'undefined' && (window as any).electronAPI?.getPendingOAuthUrl) {
      (window as any).electronAPI.getPendingOAuthUrl().then((pendingUrl: string | null) => {
        if (pendingUrl) {
          console.log('[D-MERS Desktop Auth] Found pending OAuth callback on startup.');
          handleDesktopOAuthUrl(pendingUrl);
        }
      }).catch((e: any) => console.warn('getPendingOAuthUrl notice:', e));
    }

    // ── Listen for subsequent OAuth callback events from Electron main ─────
    let unlistenElectron: (() => void) | undefined;
    if (typeof window !== 'undefined' && (window as any).electronAPI?.onOAuthCallback) {
      unlistenElectron = (window as any).electronAPI.onOAuthCallback((callbackUrl: string) => {
        handleDesktopOAuthUrl(callbackUrl);
      });
    }

    // ── Web URL Hash Extraction (for browser environment) ──────────────────
    const urlHash = window.location.hash;
    const urlHasHash = urlHash.includes('access_token=');
    const urlHasCode = window.location.search.includes('code=');
    const hasOAuthParams = urlHasHash || urlHasCode;

    const attemptHashSession = async (): Promise<boolean> => {
      if (!urlHasHash) return false;
      try {
        const hash = urlHash.startsWith('#') ? urlHash.slice(1) : urlHash;
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        if (!accessToken) return false;

        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        if (error || !data.session) return false;

        try {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        } catch (_) {}

        await processSession(data.session, true);
        return true;
      } catch {
        return false;
      }
    };

    // ── Core: process a Supabase session into application state ───────────
    const processSession = async (session: any, isNewSignIn: boolean) => {
      if (!isMounted) return;

      if (session?.user) {
        // Ensure authentication modal is dismissed when session is resolved
        setShowAuthModal(false);
        setShowProfileModal(false);

        // Prevent redundant resolution for the same user unless this is an explicit sign in
        if (currentUserId === session.user.id && !isNewSignIn) {
          if (isMounted) setAuthLoading(false);
          return;
        }
        currentUserId = session.user.id;

        try {
          console.log('[D-MERS Auth] Resolving profile for Supabase user:', session.user.id);
          const profile = await DataProvider.handleOAuthCallback(session);
          if (!isMounted) return;

          if (profile) {
            console.log('[D-MERS Auth] Profile resolved: role =', profile.role);
            setCurrentUser(profile);
            const savedTab = sessionStorage.getItem('dmers_activeTab') as AppTab;
            const targetTab = (savedTab && savedTab !== 'landing')
              ? savedTab
              : getDashboardTabForRole(profile.role);

            console.log('[D-MERS Auth] Navigating to dashboard tab:', targetTab);
            setActiveTab(targetTab);
            try { sessionStorage.setItem('dmers_activeTab', targetTab); } catch (_) {}

            if (isNewSignIn) {
              setToast({ message: `Welcome to D-MERS, ${profile.full_name}!`, type: 'success' });
            }
          }
        } catch (err) {
          console.error('[D-MERS Auth] Profile resolution error:', err);
        } finally {
          if (isMounted) setAuthLoading(false);
        }
      } else {
        // No active Supabase session
        if (!hasOAuthParams) {
          const localUser = DataProvider.getCurrentUser();
          if (localUser && isMounted) {
            setCurrentUser(localUser);
            const savedTab = sessionStorage.getItem('dmers_activeTab') as AppTab;
            if (savedTab && savedTab !== 'landing') setActiveTab(savedTab);
          }
          if (isMounted) setAuthLoading(false);
        }
      }
    };

    // ── Subscribe to Supabase auth state changes ───────────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[D-MERS Auth] onAuthStateChange: '${event}' | hasSession: ${!!session}`);
        if (event === 'SIGNED_OUT') {
          if (!isMounted) return;
          currentUserId = null;
          setCurrentUser(null);
          setActiveTab('landing');
          try { sessionStorage.removeItem('dmers_activeTab'); } catch (_) {}
          setAuthLoading(false);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          if (session?.user) {
            await processSession(session, event === 'SIGNED_IN');
          } else if (!hasOAuthParams) {
            await processSession(null, false);
          }
        }
      }
    );

    // ── Check web hash tokens or initial session fallback ──────────────────
    (async () => {
      if (hasOAuthParams) {
        const manualSessionSet = await attemptHashSession();
        if (!manualSessionSet && isMounted && !currentUserId) {
          const { data: { session } } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
          await processSession(session, false);
        }
      } else {
        const { data: { session }, error } = await supabase.auth.getSession().catch(() => ({ data: { session: null }, error: null }));
        if (!error && session) {
          await processSession(session, false);
        } else if (!currentUserId) {
          await processSession(null, false);
        }
      }
    })();

    // ── Failsafe: unblock UI after 5s in case of slow network ─────────────
    const failsafe = setTimeout(() => {
      if (isMounted && !currentUserId) {
        setAuthLoading(false);
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearTimeout(failsafe);
      subscription.unsubscribe();
      if (typeof unlistenElectron === 'function') unlistenElectron();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      const [incs, shls, alts] = await Promise.all([
        DataProvider.getIncidents(),
        DataProvider.getShelters(),
        DataProvider.getAlerts(),
      ]);
      setIncidents(incs);
      setShelters(shls);
      setAlerts(alts);
    } catch (err) {
      console.error('Dashboard data load error:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setShowProfileModal(false);
    const user = DataProvider.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      const targetTab = getDashboardTabForRole(user.role);
      handleTabChange(targetTab);
      showToast(`Welcome to D-MERS, ${user.full_name}!`, 'success');
    }
  };

  const handleProfileSaved = (updated: UserProfile) => {
    setCurrentUser(updated);
    showToast('Profile updated successfully!', 'success');
  };

  const handleReportSubmitted = () => {
    loadDashboardData();
    showToast('Emergency report submitted! Rescue team will respond shortly.', 'success');
  };

  if (!isOnline) {
    return <NoInternetScreen onRetry={() => setIsOnline(navigator.onLine)} />;
  }

  if (hasError) {
    return <ErrorScreen onRetry={() => { setHasError(false); window.location.reload(); }} />;
  }

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold animate-in fade-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' :
          toast.type === 'error' ? 'bg-red-50 border-red-300 text-red-900' :
          'bg-blue-50 border-blue-300 text-blue-900'
        }`}>
          {toast.type === 'success' && '✓'}
          {toast.type === 'error' && '✗'}
          {toast.type === 'info' && 'ℹ'}
          <span>{toast.message}</span>
        </div>
      )}

      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={(tab) => handleTabChange(tab as AppTab)}
        onOpenReportModal={() => setShowReportWizard(true)}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onOpenProfileSetupModal={() => setShowProfileModal(true)}
      />

      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            incidents={incidents}
            shelters={shelters}
            alerts={alerts}
            onOpenReportModal={() => setShowReportWizard(true)}
            onNavigateTab={(tab) => handleTabChange(tab as AppTab)}
          />
        )}

        {activeTab === 'citizen' && (
          currentUser ? (
            <CitizenDashboard currentUser={currentUser} />
          ) : (
            <div className="max-w-lg mx-auto text-center py-24 px-6">
              <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Sign In Required</h2>
              <p className="text-slate-500 mb-6">Please sign in to access the Citizen Portal and report emergencies.</p>
              <button onClick={() => setShowAuthModal(true)} className="px-6 py-3 rounded-2xl bg-brand-900 text-white font-bold hover:bg-brand-800">
                Sign In to D-MERS
              </button>
            </div>
          )
        )}

        {activeTab === 'rescue' && (
          currentUser ? (
            <RescueCommandCenter currentUser={currentUser} />
          ) : (
            <div className="max-w-lg mx-auto text-center py-24 px-6">
              <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Sign In Required</h2>
              <p className="text-slate-500 mb-6">Rescue Command Center is accessible after signing in.</p>
              <button onClick={() => setShowAuthModal(true)} className="px-6 py-3 rounded-2xl bg-brand-900 text-white font-bold hover:bg-brand-800">
                Sign In to D-MERS
              </button>
            </div>
          )
        )}

        {activeTab === 'volunteer' && (
          currentUser ? (
            <VolunteerPortal currentUser={currentUser} />
          ) : (
            <div className="max-w-lg mx-auto text-center py-24 px-6">
              <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Sign In Required</h2>
              <p className="text-slate-500 mb-6">Join the volunteer network by signing in first.</p>
              <button onClick={() => setShowAuthModal(true)} className="px-6 py-3 rounded-2xl bg-brand-900 text-white font-bold hover:bg-brand-800">
                Sign In to D-MERS
              </button>
            </div>
          )
        )}

        {activeTab === 'shelter' && (
          currentUser ? (
            <ShelterIntelligence currentUser={currentUser} />
          ) : (
            <div className="max-w-lg mx-auto text-center py-24 px-6">
              <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Sign In to Access Shelters</h2>
              <p className="text-slate-500 mb-6">Sign in to view real-time shelter capacity and location info.</p>
              <button onClick={() => setShowAuthModal(true)} className="px-6 py-3 rounded-2xl bg-brand-900 text-white font-bold hover:bg-brand-800">
                Sign In
              </button>
            </div>
          )
        )}

        {activeTab === 'recovery' && (
          currentUser ? (
            <RecoveryHub currentUser={currentUser} />
          ) : (
            <div className="max-w-lg mx-auto text-center py-24 px-6">
              <HeartHandshake className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Recovery Hub Access</h2>
              <p className="text-slate-500 mb-6">Sign in to request or offer recovery resources for disaster victims.</p>
              <button onClick={() => setShowAuthModal(true)} className="px-6 py-3 rounded-2xl bg-brand-900 text-white font-bold hover:bg-brand-800">
                Sign In
              </button>
            </div>
          )
        )}

        {activeTab === 'admin' && (
          currentUser ? (
            <AdminOperationsCenter currentUser={currentUser} />
          ) : (
            <div className="max-w-lg mx-auto text-center py-24 px-6">
              <BarChart2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Admin Operations Restricted</h2>
              <p className="text-slate-500 mb-6">Administrator access requires authorized credentials.</p>
              <button onClick={() => setShowAuthModal(true)} className="px-6 py-3 rounded-2xl bg-brand-900 text-white font-bold hover:bg-brand-800">
                Sign In
              </button>
            </div>
          )
        )}
      </main>

      <Footer />

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      {currentUser && (
        <ProfileSetupModal
          isOpen={showProfileModal}
          user={currentUser}
          onClose={() => setShowProfileModal(false)}
          onSave={handleProfileSaved}
        />
      )}

      <IncidentReportWizard
        isOpen={showReportWizard}
        currentUser={currentUser}
        onClose={() => setShowReportWizard(false)}
        onSubmitted={handleReportSubmitted}
      />
    </div>
  );
}

export default App;
