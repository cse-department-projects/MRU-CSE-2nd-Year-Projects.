import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, Users, Trophy, Target, ShieldAlert, ArrowRight, CheckCircle2, 
  TrendingUp, Medal, CalendarDays, LineChart as ChartIcon, Zap, ChevronRight, 
  BarChart3, Database, Lock, Search, Bell, LayoutDashboard, Sun, Moon, 
  Sparkles, HeartPulse, Check, ShieldCheck, Flame, Timer, Award, UserCheck
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useTheme } from '../contexts/ThemeContext';
import AthleteScrollAnimation from '../components/landing/AthleteScrollAnimation';

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { isDark, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <div className="relative min-h-screen text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden font-sans">
      
      {/* Navigation Bar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/90 backdrop-blur-md border-b border-border/80 py-3.5 shadow-sm' : 'bg-slate-950/25 backdrop-blur-sm py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-primary/25">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className={`text-xl font-extrabold tracking-tight leading-tight ${scrolled ? 'text-foreground' : 'text-white'}`}>AthleteHub</span>
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Sports Management</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#motion-capture" className={`text-sm font-semibold transition-colors ${scrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/80 hover:text-white'}`}>Motion Telemetry</a>
            <a href="#features" className={`text-sm font-semibold transition-colors ${scrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/80 hover:text-white'}`}>Features</a>
            <a href="#solutions" className={`text-sm font-semibold transition-colors ${scrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/80 hover:text-white'}`}>Solutions</a>
            <a href="#how-it-works" className={`text-sm font-semibold transition-colors ${scrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/80 hover:text-white'}`}>How It Works</a>
            <a href="#testimonials" className={`text-sm font-semibold transition-colors ${scrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/80 hover:text-white'}`}>Testimonials</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Switcher */}
            <button 
              onClick={toggleTheme}
              className="relative h-10 w-10 rounded-xl hover:bg-muted bg-card/80 border border-border/70 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-500 transition-transform hover:-rotate-12" />
              )}
            </button>

            <button 
              onClick={() => navigate('/login')}
              className={`text-sm font-semibold transition-colors hidden sm:inline-block px-4 py-2 cursor-pointer ${scrolled ? 'text-foreground/80 hover:text-foreground' : 'text-white/85 hover:text-white'}`}
            >
              Sign In
            </button>
            
            <Button 
              onClick={() => navigate('/register')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 py-2 font-bold text-sm shadow-lg shadow-primary/20 transition-all hover:scale-105 cursor-pointer"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="landing-content relative isolate z-10">

        {/* The cinematic scroll sequence is the first, full-viewport landing experience. */}
        <AthleteScrollAnimation />

        {/* =========================================================================
            HERO SECTION
            ========================================================================= */}
        <section id="hero" className="hidden max-w-7xl mx-auto px-6 pb-20 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/90 border border-primary/30 text-xs sm:text-sm font-semibold text-primary mb-6 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>The Unified Sports Management Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.12] mb-6 text-foreground">
            The operating system for <br className="hidden sm:inline"/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-purple-600">
              modern athletic excellence.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed mb-10">
            Unify athlete performance telemetry, squad rosters, training cycles, and tournament brackets in one intuitive platform. Built for sports federations, academies, coaches, and athletes.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              onClick={() => navigate('/register')}
              className="h-13 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-bold text-base shadow-xl shadow-primary/25 transition-all hover:scale-105 group cursor-pointer"
            >
              Start Free Trial <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              onClick={() => navigate('/login')}
              variant="outline"
              className="h-13 px-8 bg-card/80 hover:bg-card border-border/80 text-foreground rounded-full font-semibold text-base backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
            >
              Sign In to Workspace
            </Button>
          </div>

          {/* Platform Trust Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
            <div className="p-4 rounded-2xl bg-card/85 backdrop-blur-md border border-border/80 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-black text-foreground">50,000+</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">Active Athletes</div>
            </div>
            <div className="p-4 rounded-2xl bg-card/85 backdrop-blur-md border border-border/80 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-black text-foreground">1,400+</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">Clubs & Academies</div>
            </div>
            <div className="p-4 rounded-2xl bg-card/85 backdrop-blur-md border border-border/80 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-black text-foreground">99.9%</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">Telemetry Sync Uptime</div>
            </div>
            <div className="p-4 rounded-2xl bg-card/85 backdrop-blur-md border border-border/80 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-black text-foreground">35+</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">Sports Disciplines</div>
            </div>
          </div>

          {/* =========================================================================
              COMMAND CENTER DASHBOARD SHOWCASE
              ========================================================================= */}
          <div className="w-full max-w-5xl mx-auto rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-2xl overflow-hidden text-left">
            
            {/* Window Top Bar */}
            <div className="h-12 border-b border-border/70 bg-muted/40 px-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                <span className="text-xs font-mono font-medium text-muted-foreground ml-2 hidden sm:inline">
                  athletehub / mission-control / live-session
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Session Active: Varsity Track & Field
                </span>
              </div>
            </div>

            {/* Dashboard Body */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Top Stat Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-background/60 border border-border/60">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold mb-1">
                    <span>SQUAD ON FIELD</span>
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-2xl font-black text-foreground">18 / 24</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">6 in recovery protocol</div>
                </div>

                <div className="p-4 rounded-xl bg-background/60 border border-border/60">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold mb-1">
                    <span>AVERAGE HEART RATE</span>
                    <HeartPulse className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="text-2xl font-black text-foreground">154 BPM</div>
                  <div className="text-xs text-primary font-semibold mt-1">Zone 4 (Threshold)</div>
                </div>

                <div className="p-4 rounded-xl bg-background/60 border border-border/60">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold mb-1">
                    <span>SPRINT VELOCITY</span>
                    <Zap className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-foreground">32.8 km/h</div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">Peak: Marcus Vance</div>
                </div>

                <div className="p-4 rounded-xl bg-background/60 border border-border/60">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold mb-1">
                    <span>READINESS INDEX</span>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-black text-foreground">94.2%</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Optimal match condition</div>
                </div>
              </div>

              {/* Live Biometric Oscillation & Schedule Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 2 Cols: Live Telemetry Stream */}
                <div className="lg:col-span-2 p-5 rounded-2xl bg-background/50 border border-border/60">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Real-Time Telemetry Stream</h4>
                      <p className="text-xs text-muted-foreground">Aggregated squad aerobic load & velocity curve</p>
                    </div>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                      Sync: 42ms
                    </span>
                  </div>

                  {/* SVG Wave Visualization */}
                  <div className="h-32 w-full relative flex items-end">
                    <svg className="w-full h-full" viewBox="0 0 600 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="streamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path 
                        d="M0,80 Q50,30 100,55 T200,40 T300,75 T400,20 T500,50 T600,30 L600,120 L0,120 Z" 
                        fill="url(#streamGrad)" 
                      />
                      <path 
                        d="M0,80 Q50,30 100,55 T200,40 T300,75 T400,20 T500,50 T600,30" 
                        fill="none" 
                        stroke="var(--primary)" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                      />
                    </svg>
                  </div>

                  {/* Telemetry Axis */}
                  <div className="flex justify-between text-[11px] text-muted-foreground font-mono pt-2 border-t border-border/40">
                    <span>10:00 AM (Warmup)</span>
                    <span>10:20 AM (Sprint Intervals)</span>
                    <span>10:40 AM (Plyometrics)</span>
                    <span>11:00 AM (Cooldown)</span>
                  </div>
                </div>

                {/* 1 Col: Athlete Roster Sample */}
                <div className="p-5 rounded-2xl bg-background/50 border border-border/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-foreground">Top Squad Roster</h4>
                      <span className="text-xs font-semibold text-primary">View All</span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-card/80 border border-border/50 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px]">
                            MV
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">Marcus Vance</div>
                            <div className="text-[10px] text-muted-foreground">100m Sprint • Track</div>
                          </div>
                        </div>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px]">
                          98% Ready
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-card/80 border border-border/50 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-[10px]">
                            ER
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">Elena Rostova</div>
                            <div className="text-[10px] text-muted-foreground">400m Hurdles • Track</div>
                          </div>
                        </div>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px]">
                          95% Ready
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-card/80 border border-border/50 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-[10px]">
                            DO
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">David Okafor</div>
                            <div className="text-[10px] text-muted-foreground">Long Jump • Field</div>
                          </div>
                        </div>
                        <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full text-[10px]">
                          91% Ready
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Upcoming: Regional Finals</span>
                    <span className="font-bold text-foreground">In 3 Days</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =========================================================================
            CORE FEATURES SECTION
            ========================================================================= */}
        <section id="features" className="py-24 px-6 max-w-7xl mx-auto border-t border-border/60">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
              Platform Features
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
              Everything your athletic program needs to dominate.
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg font-medium">
              Eliminate disconnected spreadsheets, paperwork, and fragmented messaging. AthleteHub consolidates your operations into a single modern workflow.
            </p>
          </div>

          {/* 6 Feature Cards Grid */}
          <div className="feature-orbit-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="rounded-3xl bg-card/85 backdrop-blur-md border border-border/80 hover:border-primary/50 transition-all p-8 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 border border-blue-500/20">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Real-Time Performance Telemetry</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-medium">
                  Record and analyze high-resolution telemetry data including sprint velocities, heart rate zones, conditioning loads, and fatigue trends across all training sessions.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-foreground/80 font-semibold border-t border-border/50 pt-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Sub-second telemetry syncing</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Personalized fatigue thresholds</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="rounded-3xl bg-card/85 backdrop-blur-md border border-border/80 hover:border-indigo-500/50 transition-all p-8 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 border border-indigo-500/20">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Roster & Academy Governance</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-medium">
                  Govern multi-tier clubs, disciplines, and age divisions. Allocate coaches to squads, track player attendance with one click, and manage verified profiles.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-foreground/80 font-semibold border-t border-border/50 pt-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-500" /> Multi-sport club hierarchies</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-500" /> Rapid digital attendance tracking</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="rounded-3xl bg-card/85 backdrop-blur-md border border-border/80 hover:border-purple-500/50 transition-all p-8 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6 border border-purple-500/20">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Tournament & Bracket Engine</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-medium">
                  Generate single-elimination, double-elimination, and round-robin tournament brackets with automated seeding, score updates, and live fan leaderboards.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-foreground/80 font-semibold border-t border-border/50 pt-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-500" /> Interactive visual SVG brackets</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-500" /> Automated winner progressions</li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="rounded-3xl bg-card/85 backdrop-blur-md border border-border/80 hover:border-emerald-500/50 transition-all p-8 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 border border-emerald-500/20">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Tactical Training & Drill Builder</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-medium">
                  Construct progressive training cycles, plan daily workouts, attach tactical drill instructions, and deliver direct feedback to athletes in real time.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-foreground/80 font-semibold border-t border-border/50 pt-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Structured periodization calendars</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Video & drill resource library</li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div className="rounded-3xl bg-card/85 backdrop-blur-md border border-border/80 hover:border-amber-500/50 transition-all p-8 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6 border border-amber-500/20">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Wellness & Recovery Auditing</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-medium">
                  Empower athletes with daily check-ins for muscle soreness, sleep duration, mental readiness, and hydration to preempt injuries before they sideline your stars.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-foreground/80 font-semibold border-t border-border/50 pt-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-500" /> Daily athlete mobile check-ins</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-500" /> Early-warning injury risk flags</li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="rounded-3xl bg-card/85 backdrop-blur-md border border-border/80 hover:border-rose-500/50 transition-all p-8 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6 border border-rose-500/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Enterprise Security & Isolation</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-medium">
                  Engineered with strict multi-tenant isolation, encrypted telemetry storage, and role-based access control protecting your academy's proprietary training data.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-foreground/80 font-semibold border-t border-border/50 pt-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-rose-500" /> Granular role-based permissions</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-rose-500" /> Complete multi-tenant privacy</li>
              </ul>
            </div>

          </div>

        </section>

        {/* =========================================================================
            SOLUTIONS / ECOSYSTEM SECTION
            ========================================================================= */}
        <section id="solutions" className="py-24 px-6 max-w-7xl mx-auto border-t border-border/60">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4 border border-indigo-500/20">
              Tailored Workspaces
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
              Designed for every stakeholder in athletics.
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg font-medium">
              Every role receives a dedicated interface tailored specifically to their day-to-day priorities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Role 1: Organizations */}
            <div className="rounded-3xl bg-card/85 backdrop-blur-md border border-border/80 hover:border-blue-500/50 transition-all p-8 flex flex-col justify-between shadow-sm hover:shadow-xl">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 border border-blue-500/20">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Federations & Academies</div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Organizations</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-medium">
                  Oversee entire programs, manage multi-sport disciplines, review cross-squad compliance, and broadcast federation announcements.
                </p>
              </div>
              <div className="space-y-2.5 text-xs text-foreground/80 bg-muted/40 rounded-xl p-4 border border-border/50 font-medium">
                <div className="font-bold text-foreground">Key Capabilities:</div>
                <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Centralized roster governance</div>
                <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Academy join request approvals</div>
                <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Macro athletic KPI reporting</div>
              </div>
            </div>

            {/* Role 2: Coaches */}
            <div className="rounded-3xl bg-card/85 backdrop-blur-md border border-border/80 hover:border-purple-500/50 transition-all p-8 flex flex-col justify-between shadow-sm hover:shadow-xl">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6 border border-purple-500/20">
                  <Target className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2">Tactical Command</div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Coaching Staff</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-medium">
                  Design progressive training cycles, take squad attendance in seconds, record telemetry metrics, and deliver targeted tactical feedback.
                </p>
              </div>
              <div className="space-y-2.5 text-xs text-foreground/80 bg-muted/40 rounded-xl p-4 border border-border/50 font-medium">
                <div className="font-bold text-foreground">Key Capabilities:</div>
                <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500" /> Interactive training calendar</div>
                <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500" /> 1-tap attendance check-in</div>
                <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500" /> Squad fatigue & wellness logs</div>
              </div>
            </div>

            {/* Role 3: Athletes */}
            <div className="rounded-3xl bg-card/85 backdrop-blur-md border border-border/80 hover:border-emerald-500/50 transition-all p-8 flex flex-col justify-between shadow-sm hover:shadow-xl">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 border border-emerald-500/20">
                  <Medal className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">Personal Growth</div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Competitive Athletes</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-medium">
                  Focus on peak execution and recovery. Review practice schedules, track personal telemetry milestones, log daily wellness, and prepare for game day.
                </p>
              </div>
              <div className="space-y-2.5 text-xs text-foreground/80 bg-muted/40 rounded-xl p-4 border border-border/50 font-medium">
                <div className="font-bold text-foreground">Key Capabilities:</div>
                <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Mobile-first performance dashboard</div>
                <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Daily recovery check-in forms</div>
                <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Live tournament match brackets</div>
              </div>
            </div>

          </div>

        </section>

        {/* =========================================================================
            HOW IT WORKS SECTION
            ========================================================================= */}
        <section id="how-it-works" className="py-24 px-6 max-w-7xl mx-auto border-t border-border/60">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-500/20">
              Simple Workflow
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
              From onboarding to game day in minutes.
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg font-medium">
              Get your athletic department up and running without costly IT integrations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-border/80 relative shadow-sm">
              <div className="text-5xl font-black text-primary/30 mb-4 font-mono">01</div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Create & Configure</h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                Sign up your sports organization, set up sport disciplines, define age squads, and invite your coaching staff.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-border/80 relative shadow-sm">
              <div className="text-5xl font-black text-indigo-500/30 mb-4 font-mono">02</div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Track Sessions & Telemetry</h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                Log practice sessions, capture live biometrics, record attendances, and schedule tournament brackets with ease.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-border/80 relative shadow-sm">
              <div className="text-5xl font-black text-purple-500/30 mb-4 font-mono">03</div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Analyze & Win</h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                Review data-driven performance analytics, preempt fatigue injuries, and optimize athletic potential to dominate competitions.
              </p>
            </div>

          </div>

        </section>

        {/* =========================================================================
            TESTIMONIALS / SOCIAL PROOF
            ========================================================================= */}
        <section id="testimonials" className="py-24 px-6 max-w-7xl mx-auto border-t border-border/60">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-4 border border-purple-500/20">
              Community Validation
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
              Trusted by championship athletic directors.
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg font-medium">
              See how athletic directors and head coaches elevate their programs with AthleteHub.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-border/80 flex flex-col justify-between shadow-sm">
              <p className="text-foreground/90 text-sm leading-relaxed mb-6 font-medium italic">
                "AthleteHub reduced our club's administrative overhead by 70%. We replaced three different spreadsheets with one clean, real-time command center."
              </p>
              <div className="flex items-center gap-3 border-t border-border/50 pt-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-sm">
                  MV
                </div>
                <div>
                  <div className="font-bold text-foreground text-sm">Coach Michael Vance</div>
                  <div className="text-xs text-muted-foreground">Director of Athletics, Metro Track Academy</div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-border/80 flex flex-col justify-between shadow-sm">
              <p className="text-foreground/90 text-sm leading-relaxed mb-6 font-medium italic">
                "The live telemetry tracking and automated tournament brackets give our club an unfair competitive advantage. It is fast, intuitive, and loved by our athletes."
              </p>
              <div className="flex items-center gap-3 border-t border-border/50 pt-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center text-sm">
                  SJ
                </div>
                <div>
                  <div className="font-bold text-foreground text-sm">Dr. Sarah Jenkins</div>
                  <div className="text-xs text-muted-foreground">High-Performance Coordinator, Apex Elite Club</div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-card/85 backdrop-blur-md border border-border/80 flex flex-col justify-between shadow-sm">
              <p className="text-foreground/90 text-sm leading-relaxed mb-6 font-medium italic">
                "Having my daily workout regimen, wellness check-ins, and match fixtures in one app keeps me focused entirely on recovery and execution."
              </p>
              <div className="flex items-center gap-3 border-t border-border/50 pt-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-sm">
                  JH
                </div>
                <div>
                  <div className="font-bold text-foreground text-sm">Jordan Hayes</div>
                  <div className="text-xs text-muted-foreground">Collegiate Sprint Champion</div>
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* =========================================================================
            FINAL CALL TO ACTION BANNER
            ========================================================================= */}
        <section className="py-20 px-6 max-w-5xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-xl border border-primary/30 p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl">
            <div className="max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6 border border-primary/20">
                Start Today
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 text-foreground">
                Ready to elevate your athletic program?
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed font-medium">
                Join forward-thinking sports organizations, academies, and coaches optimizing athletic potential with AthleteHub.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                <Button 
                  onClick={() => navigate('/register')}
                  className="h-13 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-bold text-base shadow-xl shadow-primary/25 transition-all hover:scale-105 cursor-pointer"
                >
                  Create Free Account
                </Button>
                <Button 
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="h-13 px-8 bg-background/80 hover:bg-background border-border/80 text-foreground rounded-full font-semibold text-base backdrop-blur-md cursor-pointer"
                >
                  Sign In to Workspace
                </Button>
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                No credit card required • Instant access • Enterprise security included
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* =========================================================================
          FOOTER
          ========================================================================= */}
      <footer id="security" className="border-t border-border/60 bg-background/80 backdrop-blur-md pt-16 pb-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-primary/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-foreground">AthleteHub</span>
              <p className="text-xs text-muted-foreground">The unified sports management platform.</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm font-semibold text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#solutions" className="hover:text-foreground transition-colors">Solutions</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
            <button onClick={() => navigate('/login')} className="hover:text-foreground transition-colors cursor-pointer">Sign In</button>
            <button onClick={() => navigate('/register')} className="hover:text-foreground transition-colors cursor-pointer">Register</button>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            All systems operational
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-border/40 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <div>
            © {new Date().getFullYear()} AthleteHub Inc. All rights reserved. Built for athletic excellence.
          </div>
          <div className="flex gap-6">
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Security Overview</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
