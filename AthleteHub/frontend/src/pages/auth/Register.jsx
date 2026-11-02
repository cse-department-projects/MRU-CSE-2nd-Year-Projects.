import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { 
  Mail, 
  Lock, 
  User, 
  Trophy, 
  ShieldCheck, 
  ArrowRight, 
  Users, 
  GraduationCap, 
  Building2, 
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const ROLES_OPTIONS = [
  {
    id: 'ROLE_ATHLETE',
    title: 'Athlete',
    desc: 'Personal schedule, wellness & performance telemetry',
    icon: Trophy,
    badge: 'Player'
  },
  {
    id: 'ROLE_COACH',
    title: 'Coach',
    desc: 'Squad rosters, training sessions & attendance',
    icon: GraduationCap,
    badge: 'Staff'
  },
  {
    id: 'ROLE_ORG_ADMIN',
    title: 'Organization',
    desc: 'Club governance, facilities & team administration',
    icon: Building2,
    badge: 'Club'
  }
];

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'ROLE_ATHLETE'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setLoading(true);
    setError(null);

    const payload = {
      full_name: `${formData.first_name} ${formData.last_name}`.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || null,
      password: formData.password,
      role_name: formData.role
    };

    try {
      const response = await api.post('/auth/register', payload);
      if (response.status === 201 || response.status === 200) {
        navigate('/login?registered=true');
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Registration failed. Please check your information.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-8 font-sans text-foreground sm:px-6 lg:px-8">
      {/* Dynamic Ambient Background Glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[-10%] top-[20%] h-[32rem] w-[32rem] rounded-full bg-secondary/15 blur-3xl" />
        <div className="absolute bottom-[-15%] left-[25%] h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_30%,rgba(255,255,255,0.01))]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_1.1fr] xl:gap-14 my-auto">
          
          {/* Left Hero & Value Proposition Section */}
          <section className="hidden lg:flex flex-col justify-center rounded-[2rem] border border-border bg-card/60 p-10 shadow-lg backdrop-blur-xl lg:min-h-[700px] lg:p-12">
            <div className="max-w-xl space-y-8">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                AthleteHub Network
              </div>

              <div className="space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                  <Trophy size={28} />
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground leading-[1.12]">
                  Elevate your athletic operations to the professional level.
                </h1>
                <p className="text-base leading-7 text-muted-foreground">
                  Connect athletes, coaches, and sports organizations on a single high-performance platform.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Dedicated Role Workspaces</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Custom dashboards tailored specifically for athletes, coaches, and sports club administrators.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Training & Attendance Tracking</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Real-time attendance marking, workout logs, tactical playbooks, and injury monitoring.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Tournament & Match Schedules</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Unified competition timelines, results tracking, and squad match preparation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 text-xs text-muted-foreground">
                Already registered?{' '}
                <Link to="/login" className="font-bold text-primary hover:underline">
                  Sign in to your account
                </Link>
              </div>
            </div>
          </section>

          {/* Right Registration Card */}
          <section className="flex items-center justify-center">
            <Card className="w-full card-telemetry-elevated !p-0 shadow-2xl border-border/80">
              {/* Card Header */}
              <div className="border-b border-border/60 px-7 py-6 sm:px-9">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground label-caps">
                      Account Registration
                    </p>
                    <h2 className="text-2xl font-black tracking-tight text-foreground">
                      Create Your Account
                    </h2>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-7 sm:p-9 space-y-6">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-start gap-2.5 text-xs font-semibold animate-in fade-in">
                    <span className="shrink-0 text-sm">⚠️</span>
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">
                  {/* Role Selection Interactive Cards */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-2 uppercase tracking-wider text-muted-foreground">
                      Select Your Role
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {ROLES_OPTIONS.map((r) => {
                        const isSelected = formData.role === r.id;
                        const Icon = r.icon;
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, role: r.id })}
                            className={`p-3 rounded-xl border text-left transition-all duration-200 relative flex flex-col justify-between h-24 ${
                              isSelected
                                ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary'
                                : 'border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-border'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <Icon className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                              }`}>
                                {r.badge}
                              </span>
                            </div>
                            <div>
                              <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {r.title}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          name="first_name"
                          placeholder="John"
                          value={formData.first_name}
                          onChange={handleChange}
                          required
                          className="w-full h-10 rounded-xl border border-input bg-background/80 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Last Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          name="last_name"
                          placeholder="Doe"
                          value={formData.last_name}
                          onChange={handleChange}
                          required
                          className="w-full h-10 rounded-xl border border-input bg-background/80 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        name="email"
                        placeholder="you@athletehub.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full h-10 rounded-xl border border-input bg-background/80 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-foreground">Password</label>
                      <span className="text-[11px] text-muted-foreground">Min. 8 characters</span>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                        className="w-full h-10 rounded-xl border border-input bg-background/80 pl-9 pr-10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-xl text-xs font-bold gap-2 shadow-md shadow-primary/20 transition-all mt-2"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Creating Account...
                      </span>
                    ) : (
                      <>
                        Complete Registration
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="text-center text-xs text-muted-foreground pt-2">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-primary hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </Card>
          </section>

        </div>
      </div>
    </div>
  );
}
