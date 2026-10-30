import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, AlertCircle, Eye, EyeOff, Stethoscope, HeartPulse, Brain } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../../components/Logo';
import { supabase } from '../../lib/supabase';

export default function Register() {
  const navigate = useNavigate();
  const { session, loading, signUp } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user) {
      navigate('/dashboard', { replace: true });
    }
  }, [session, navigate]);

  if (loading) return null;

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard'
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred with Google Sign-In.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { data, error: signUpError } = await signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([
            { id: data.user.id, full_name: name, email }
          ]);
          
        if (profileError) throw profileError;
      }
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#111827] relative overflow-hidden font-inter">
      {/* Ambient Glows & Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-600/30 rounded-full blur-[120px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-700/20 rounded-full blur-[150px] mix-blend-screen" 
        />
        {/* Floating Particles */}
        <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[20%] left-[20%] w-2 h-2 bg-cyan-400/50 rounded-full blur-[1px]" />
        <motion.div animate={{ y: [0, 30, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[30%] right-[30%] w-3 h-3 bg-blue-400/40 rounded-full blur-[2px]" />
      </div>

      {/* Main Glass Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-[1200px] min-h-[720px] bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.45)] flex flex-col lg:flex-row overflow-hidden relative z-10"
      >
        
        {/* Left Side: Form Area (45%) */}
        <div className="w-full lg:w-[45%] p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative z-20">
          
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <Logo size={42} />
              <span className="text-2xl font-poppins font-bold text-white tracking-tight">HealthSphere</span>
            </div>
            <h1 className="text-3xl font-poppins font-bold text-white mb-3">Create Your Account</h1>
            <p className="text-slate-400 text-sm font-medium">Join the next generation of AI-powered healthcare assistance.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }} 
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }} 
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="p-3.5 bg-rose-500/10 text-rose-400 rounded-xl text-sm font-medium flex items-center border border-rose-500/20 shadow-[inset_0_0_10px_rgba(244,63,94,0.1)]"
                >
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-slate-300 uppercase tracking-wider mb-2 ml-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors duration-300" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-950/60 border border-slate-700/60 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/50 transition-all duration-300 placeholder:text-slate-600 hover:border-slate-600"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[13px] font-semibold text-slate-300 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors duration-300" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-950/60 border border-slate-700/60 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/50 transition-all duration-300 placeholder:text-slate-600 hover:border-slate-600"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-300 uppercase tracking-wider mb-2 ml-1">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors duration-300" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-11 pr-10 py-3.5 bg-slate-950/60 border border-slate-700/60 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/50 transition-all duration-300 placeholder:text-slate-600 hover:border-slate-600"
                      placeholder="••••••••"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-cyan-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-300 uppercase tracking-wider mb-2 ml-1">Confirm</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors duration-300" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 bg-slate-950/60 border border-slate-700/60 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/50 transition-all duration-300 placeholder:text-slate-600 hover:border-slate-600"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="group relative w-full flex justify-center items-center py-4 px-4 border border-slate-700 text-sm font-bold rounded-xl text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition-all duration-300 hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center items-center py-4 px-4 border border-cyan-400/30 text-sm font-bold rounded-xl text-white bg-cyan-500/20 hover:bg-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4 text-cyan-300 group-hover:translate-x-1 group-hover:text-cyan-100 transition-all duration-300" />
                  </>
                )}
              </button>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-sm text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Right Side: Hero Section (55%) */}
        <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-gradient-to-br from-slate-800/20 to-slate-900/40 border-l border-white/5 items-center justify-center p-12">
          
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDUgTCAyMCA1IE0gNSAwIEwgNSAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] pointer-events-none" />

          {/* Central 3D Asset */}
          <motion.div 
            className="relative z-10 w-full max-w-sm flex items-center justify-center"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full scale-150 animate-pulse-slow" />
            <img src="/src/assets/heart_3d.png" alt="3D Heart Model" className="relative z-20 w-64 h-64 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]" />
          </motion.div>

          {/* Floating Assets */}
          <motion.img 
            src="/src/assets/dna_3d.png" 
            alt="DNA" 
            className="absolute top-[15%] left-[20%] w-20 h-20 object-contain z-20 drop-shadow-lg opacity-80"
            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
          <motion.img 
            src="/src/assets/capsule_3d.png" 
            alt="Capsule" 
            className="absolute bottom-[20%] right-[15%] w-16 h-16 object-contain z-20 drop-shadow-lg opacity-90"
            animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          {/* Glass Cards */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute top-[25%] right-[10%] bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex items-center gap-3 z-30"
          >
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
              <Brain className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Feature</div>
              <div className="text-sm font-bold text-white">AI Diagnosis</div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="absolute bottom-[35%] left-[10%] bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex items-center gap-3 z-30"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <HeartPulse className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Live Sync</div>
              <div className="text-sm font-bold text-white">Vitals Monitoring</div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="absolute bottom-[15%] right-[25%] bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex items-center gap-3 z-30"
          >
            <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
              <Stethoscope className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Network</div>
              <div className="text-sm font-bold text-white">Doctor Booking</div>
            </div>
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
}
