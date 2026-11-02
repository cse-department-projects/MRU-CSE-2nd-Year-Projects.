import React, { useRef, useState, useEffect } from 'react';
import { 
  Activity, Users, Trophy, Target, ShieldAlert, ArrowRight, CheckCircle2, 
  TrendingUp, Medal, CalendarDays, LineChart as ChartIcon, Zap, ChevronRight, 
  BarChart3, Database, Lock, Search, Bell, LayoutDashboard, Sparkles, Check,
  Compass, Globe, Layers, Cpu
} from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

/**
 * GlobeCurvedSurface — Convex Globe Scroll Experience (Enhanced UI)
 * 
 * Recreates the convex 3D globe surface scroll:
 * - Content travels over the front hemisphere of an outward-bulging 3D globe.
 * - Center of the visible section rests at the apex (Z = 0), directly facing the viewer (flat, crisp, 100% readable).
 * - Upper outgoing content wraps over the crest of the northern hemisphere, curving backward into -Z
 *   and tilting backward (rotateX < 0) before dissolving over the horizon into depth.
 * - Lower incoming content curves upward from the southern hemisphere, curving backward into -Z
 *   and tilting forward (rotateX > 0), riding up toward the viewer to settle at the equator.
 * - Zero overlap: Section 1 and Section 2 maintain strict ~950px vertical clearance along the meridian.
 * - Natural scroll wheel, trackpad, and one-click orbit buttons for fluid bidirectional navigation.
 */

export default function GlobeCurvedSurface({ className = '' }) {
  const navigate = useNavigate();
  const trackRef = useRef(null);

  // Scroll progress: 0.0 (Section 1: Hero at apex) -> 1.0 (Section 2: Features at apex)
  const [scrollProgress, setScrollProgress] = useState(0);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const animFrameRef = useRef(null);

  // Globe curvature radius
  const [radius, setRadius] = useState(900);
  const [viewportHeight, setViewportHeight] = useState(900);

  // Responsive radius calculation based on viewport height
  useEffect(() => {
    const updateSize = () => {
      const h = window.innerHeight;
      setViewportHeight(h);
      // Sphere radius tuned for realistic convex curvature without distorting typography
      setRadius(Math.max(820, Math.min(1150, h * 1.05)));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Sync scroll progress with natural window scroll through the track
  useEffect(() => {
    const handleScroll = () => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const trackHeight = trackRef.current.offsetHeight;
      const windowH = window.innerHeight;
      const totalScrollable = trackHeight - windowH;

      if (totalScrollable <= 0) return;

      const progress = -rect.top / totalScrollable;
      targetProgressRef.current = Math.max(0, Math.min(1, progress));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth inertial animation loop (lerps currentProgress -> targetProgress at 60fps)
  useEffect(() => {
    const updateMotion = () => {
      const diff = targetProgressRef.current - currentProgressRef.current;
      if (Math.abs(diff) > 0.0001) {
        currentProgressRef.current += diff * 0.14;
        setScrollProgress(currentProgressRef.current);
      }
      animFrameRef.current = requestAnimationFrame(updateMotion);
    };
    animFrameRef.current = requestAnimationFrame(updateMotion);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Quick glide button helper for instant smooth scrolling between sections
  const scrollToProgress = (targetP) => {
    if (!trackRef.current) return;
    const trackTop = trackRef.current.offsetTop;
    const trackHeight = trackRef.current.offsetHeight;
    const totalScrollable = trackHeight - window.innerHeight;
    const targetY = trackTop + targetP * totalScrollable;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  // Angular distance between Section 1 and Section 2 centers along the convex globe (64 degrees in radians)
  const deltaTheta = (64 * Math.PI) / 180;

  // Active rotation angle along the convex globe surface
  // At progress 0: Section 1 is at 0 rad (apex), Section 2 is at -deltaTheta rad (southern hemisphere)
  // At progress 1: Section 1 is at +deltaTheta rad (northern hemisphere), Section 2 is at 0 rad (apex)
  const globeAngle = scrollProgress * deltaTheta;
  const section1Angle = globeAngle;
  const section2Angle = globeAngle - deltaTheta;

  /**
   * computeConvexTransform
   * 
   * Calculates the exact 3D Cartesian coordinates and angles for the OUTWARD-BULGING convex globe:
   * - theta = 0: Apex / equator, flush with camera at Z = 0, flat tilt.
   * - theta > 0: Moving UP into northern hemisphere. Curves backward into -Z, tilts backward (rotateX < 0).
   * - theta < 0: Moving DOWN into southern hemisphere. Curves backward into -Z, tilts forward (rotateX > 0).
   */
  const computeConvexTransform = (theta) => {
    // Vertical translation along the convex meridian:
    // When theta > 0, -R * sin(theta) is negative (moves up)
    // When theta < 0, -R * sin(theta) is positive (moves down)
    const yPx = -radius * Math.sin(theta);

    // Z depth curvature: curves backward into -Z away from viewer as |theta| increases
    // At apex theta = 0, zPx = 0 (closest focal plane)
    // As it rolls toward poles, it recedes into depth
    const zPx = -radius * (1 - Math.cos(theta)) * 0.92;

    // Convex Pitch Angle (rotateX):
    // For an outward bulging sphere:
    // When moving up (theta > 0), the surface tilts BACKWARD away from viewer: rotateX is negative
    // When moving down (theta < 0), the surface tilts FORWARD away from viewer: rotateX is positive
    const pitchDeg = -(theta * 180) / Math.PI * 0.82;

    // Spherical parallel compression (width narrows gently toward poles like globe parallels):
    const scale = Math.max(0.68, Math.cos(theta * 0.70));

    // Smooth visibility falloff as content arches over the horizon (+/- 75 deg):
    const cosVal = Math.max(0, Math.cos(theta * 1.35));
    const opacity = Math.min(1, Math.pow(cosVal, 1.8));

    // Subtle horizon lighting falloff:
    const horizonShadow = Math.abs(Math.sin(theta)) * 0.35;

    return {
      transform: `translate3d(0px, ${yPx.toFixed(1)}px, ${zPx.toFixed(1)}px) rotateX(${pitchDeg.toFixed(2)}deg) scale(${scale.toFixed(3)})`,
      opacity: opacity.toFixed(3),
      filter: `brightness(${(1 - horizonShadow * 0.35).toFixed(3)})`,
      pointerEvents: opacity < 0.25 ? 'none' : 'auto',
      transformOrigin: '50% 50%',
      willChange: 'transform, opacity'
    };
  };

  return (
    <div 
      ref={trackRef}
      className={`relative w-full h-[230vh] ${className}`}
    >
      {/* Sticky Fullscreen 3D Viewport with Convex Perspective */}
      <div 
        className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center select-none"
        style={{
          perspective: '1200px',
          perspectiveOrigin: '50% 50%'
        }}
      >
        {/* Subtle Convex Globe Horizon Glow & Atmospheric Vignette */}
        <div 
          className="pointer-events-none absolute inset-0 z-30 opacity-70"
          style={{
            background: `
              radial-gradient(circle 90% at 50% 50%, transparent 62%, rgba(59, 130, 246, 0.05) 82%, rgba(99, 102, 241, 0.12) 100%)
            `
          }}
        />

        {/* Northern Horizon Curve Depth Mask */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-background/95 via-background/40 to-transparent z-20" />

        {/* Southern Horizon Curve Depth Mask */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-background/95 via-background/40 to-transparent z-20" />

        {/* 3D Convex Globe Surface Container */}
        <div 
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >

          {/* =========================================================================
              SECTION 1: HERO & COMMAND CENTER (Convex Globe Equator Apex)
              ========================================================================= */}
          <div 
            className="absolute inset-x-0 mx-auto max-w-5xl px-6 flex flex-col items-center justify-center transition-all duration-75 ease-out"
            style={computeConvexTransform(section1Angle)}
          >
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs sm:text-sm font-semibold text-primary mb-4 backdrop-blur-md shadow-xs">
              <Globe className="w-3.5 h-3.5" />
              Convex Sphere Surface • Section 1 of 2
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[4.75rem] font-extrabold tracking-tight max-w-4xl mx-auto text-center leading-[1.08] mb-4 text-foreground">
              The unified sports <br className="hidden sm:block"/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-purple-600">
                management platform
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto text-center mb-6 font-medium leading-relaxed">
              AthleteHub connects organizations, coaches, and athletes. Manage global rosters, track performance telemetry, and schedule tournaments on a continuous 3D operating system.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-7">
              <Button 
                onClick={() => navigate('/register')}
                className="h-11 px-7 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-bold text-sm transition-all hover:scale-105 shadow-xl shadow-primary/25 group cursor-pointer"
              >
                Start Building Free <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                onClick={() => navigate('/login')}
                variant="outline"
                className="h-11 px-7 rounded-full font-semibold text-sm backdrop-blur-md bg-background/60 border-border/80 hover:bg-muted/70 transition-all cursor-pointer"
              >
                Sign In to Workspace
              </Button>
            </div>

            {/* Mission Command Center Glass Panel */}
            <div className="w-full max-w-3xl rounded-2xl border border-border/80 bg-card/75 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Window Bar */}
              <div className="h-10 border-b border-border/70 bg-muted/30 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80"></div>
                  <span className="text-xs font-mono font-medium text-muted-foreground ml-2">athletehub / command-center</span>
                </div>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Convex Meridian Apex
                </span>
              </div>

              {/* 4 KPI Metrics in one clean row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border/60">
                <div className="bg-card/75 p-3.5 text-center">
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Active Athletes</div>
                  <div className="text-xl font-black text-foreground">1,280+</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">+14% this month</div>
                </div>
                <div className="bg-card/75 p-3.5 text-center">
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Coaches</div>
                  <div className="text-xl font-black text-foreground">84</div>
                  <div className="text-[10px] text-primary font-semibold">100% verified</div>
                </div>
                <div className="bg-card/75 p-3.5 text-center">
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Tournaments</div>
                  <div className="text-xl font-black text-foreground">32</div>
                  <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Live brackets</div>
                </div>
                <div className="bg-card/75 p-3.5 text-center">
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Telemetry Sync</div>
                  <div className="text-xl font-black text-foreground">42ms</div>
                  <div className="text-[10px] text-muted-foreground font-medium">Sub-second</div>
                </div>
              </div>

              {/* Mini Sparkline Stream */}
              <div className="p-3 bg-card/40 flex items-center justify-between gap-4 text-xs font-semibold text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  <span>Telemetry Stream: <span className="text-foreground font-bold">142 bpm • 32.4 km/h max</span></span>
                </div>
                <div className="h-5 w-40 relative">
                  <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
                    <path d="M0,25 Q20,10 50,20 T100,8 T150,22 T200,10" fill="none" stroke="rgba(59, 130, 246, 0.85)" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

            </div>
          </div>


          {/* =========================================================================
              SECTION 2: FEATURES SHOWCASE (Curving up from southern hemisphere)
              ========================================================================= */}
          <div 
            className="absolute inset-x-0 mx-auto max-w-5xl px-6 flex flex-col items-center justify-center transition-all duration-75 ease-out"
            style={computeConvexTransform(section2Angle)}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs sm:text-sm font-semibold text-purple-600 dark:text-purple-400 mb-3 backdrop-blur-md shadow-xs">
                <Compass className="w-3.5 h-3.5" />
                Ascending Convex Hemisphere • Section 2 of 2
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-foreground">
                Designed for <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">scale and precision.</span>
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm font-medium max-w-xl mx-auto">
                AthleteHub replaces fragmented spreadsheets and legacy tools with one cohesive athletic operating system.
              </p>
            </div>

            {/* 4 Feature Cards (2x2 Grid) with Glass Styling */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              
              {/* Feature 1: Performance Telemetry */}
              <div className="rounded-2xl bg-card/75 backdrop-blur-md border border-border/80 hover:border-blue-500/50 p-5 shadow-lg flex flex-col justify-between transition-all hover:scale-[1.01]">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 border border-blue-500/20">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold mb-1 text-foreground">Performance Telemetry</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed mb-3">
                    Capture high-resolution athletic telemetry across training sessions. Track heart rate variability, speed, conditioning loads, and fatigue indices in real time.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-foreground/80 border-t border-border/50 pt-2.5">
                  <Check className="w-3 h-3 text-blue-500" /> Real-time biometric trends & personal bests
                </div>
              </div>

              {/* Feature 2: Global Rosters */}
              <div className="rounded-2xl bg-card/75 backdrop-blur-md border border-border/80 hover:border-purple-500/50 p-5 shadow-lg flex flex-col justify-between transition-all hover:scale-[1.01]">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 border border-purple-500/20">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold mb-1 text-foreground">Global Rosters & Academies</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed mb-3">
                    Govern vast hierarchies of clubs, sport disciplines, and age groups. Allocate coaches to specialized training squads and maintain pristine athlete profiles.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-foreground/80 border-t border-border/50 pt-2.5">
                  <Check className="w-3 h-3 text-purple-500" /> Seamless coach-to-athlete squad allocations
                </div>
              </div>

              {/* Feature 3: Tournament Brackets */}
              <div className="rounded-2xl bg-card/75 backdrop-blur-md border border-border/80 hover:border-emerald-500/50 p-5 shadow-lg flex flex-col justify-between transition-all hover:scale-[1.01]">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/20">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold mb-1 text-foreground">Tournament & Match Engine</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed mb-3">
                    Orchestrate live competitions with single/double-elimination and round-robin brackets. Auto-advance winners and update global rankings instantly.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-foreground/80 border-t border-border/50 pt-2.5">
                  <Check className="w-3 h-3 text-emerald-500" /> Dynamic SVG brackets & live seedings
                </div>
              </div>

              {/* Feature 4: Enterprise Security */}
              <div className="rounded-2xl bg-card/75 backdrop-blur-md border border-border/80 hover:border-orange-500/50 p-5 shadow-lg flex flex-col justify-between transition-all hover:scale-[1.01]">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-3 border border-orange-500/20">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold mb-1 text-foreground">Enterprise Security & Isolation</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed mb-3">
                    Engineered for high security with stateless JWT authentication, tenant isolation, and strict role-based access control protecting proprietary regimens.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-foreground/80 border-t border-border/50 pt-2.5">
                  <Check className="w-3 h-3 text-orange-500" /> Multi-tenant RBAC & strict role isolation
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* =========================================================================
            BOTTOM DOCK: CONVEX GLOBE MERIDIAN CONTROLS
            ========================================================================= */}
        <div className="absolute bottom-6 inset-x-0 mx-auto w-fit z-40 px-4">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-card/85 backdrop-blur-xl border border-border/80 shadow-2xl text-xs font-semibold text-foreground">
            
            {/* Convex Meridian Latitude Angle */}
            <div className="flex items-center gap-2 pr-3 border-r border-border/70">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-muted-foreground font-mono">
                Globe Latitude: <span className="text-foreground font-bold font-sans">{((scrollProgress * 64)).toFixed(0)}°</span>
              </span>
            </div>

            {/* Quick Glide Navigation Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scrollToProgress(0)}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${scrollProgress < 0.35 ? 'bg-primary text-primary-foreground font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}`}
              >
                1. Hero Apex
              </button>
              <button
                onClick={() => scrollToProgress(1)}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${scrollProgress > 0.65 ? 'bg-primary text-primary-foreground font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}`}
              >
                2. Features Apex
              </button>
            </div>

            {/* Scroll Navigation Hint */}
            <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-border/70 text-muted-foreground text-[11px]">
              <span>Scroll down to curve to Features • Scroll up to curve to Hero</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
