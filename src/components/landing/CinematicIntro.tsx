import React, { useEffect, useState, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  Play, 
  Pause
} from 'lucide-react';

interface CinematicIntroProps {
  onComplete: () => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const TOTAL_DURATION = 8.0; // 8 seconds cinematic intro
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const globeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Soft telemetry sound synthesizer
  const startAudioEngine = () => {
    try {
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        return;
      }
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      // Soft ambient hum
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(118, ctx.currentTime);
      oscGain.gain.setValueAtTime(soundEnabled ? 0.012 : 0.0, ctx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start();
    } catch (e) {
      // Audio fallback
    }
  };

  const playTechPing = (freq: number) => {
    if (!soundEnabled || !audioContextRef.current) return;
    try {
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + 0.12);

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      // Ignore
    }
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      startAudioEngine();
    }
  };

  useEffect(() => {
    startAudioEngine();
    const handleGesture = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      } else {
        startAudioEngine();
      }
    };
    window.addEventListener('click', handleGesture, { once: true });
    window.addEventListener('keydown', handleGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('keydown', handleGesture);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Animation timeline progression
  useEffect(() => {
    if (isPaused) return;

    if (elapsed >= TOTAL_DURATION) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setElapsed((prev) => {
        const next = Math.round((prev + 0.05) * 100) / 100;
        if (prev < 1.5 && next >= 1.5) playTechPing(659.25); // DETECT (E5)
        if (prev < 2.5 && next >= 2.5) playTechPing(783.99); // ALERT (G5)
        if (prev < 3.5 && next >= 3.5) playTechPing(987.77); // RESPOND (B5)
        if (prev < 4.5 && next >= 4.5) playTechPing(1318.51); // SAVE LIVES (E6)
        return next;
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [isPaused, elapsed, onComplete, soundEnabled]);

  // Subtle vertical lift calculation for the 4 action categories
  const getCardOffset = (startTime: number, endTime: number) => {
    if (elapsed < startTime || elapsed > endTime) return 0;
    const progress = (elapsed - startTime) / (endTime - startTime);
    const arch = Math.sin(progress * Math.PI);
    return -arch * 12; // 12px upward lift
  };

  const detectOffset = getCardOffset(1.5, 2.5);
  const alertOffset = getCardOffset(2.5, 3.5);
  const respondOffset = getCardOffset(3.5, 4.5);
  const saveLivesOffset = getCardOffset(4.5, 5.5);

  // Photorealistic 3D Earth Globe with Continents, Clouds, Solar Flare & Orbital Telemetry
  useEffect(() => {
    const canvas = globeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let rotation = 0;
    const size = 760;
    canvas.width = size;
    canvas.height = size;

    // Landmass coordinates for realistic Earth mapping (Asia, India, Australia, Africa, Europe)
    const landPoints: Array<{ lat: number; lng: number; size: number; col: string }> = [];

    // India & Indian Subcontinent
    for (let lat = 8; lat <= 36; lat += 1.8) {
      for (let lng = 68; lng <= 92; lng += 1.8) {
        if (lat < 22 && Math.abs(lng - 78) > (lat - 8) * 0.9) continue;
        landPoints.push({ lat, lng, size: 2.2, col: '#4A6B3D' });
      }
    }

    // Southeast Asia & Indonesia archipelago
    for (let lat = -10; lat <= 24; lat += 2) {
      for (let lng = 95; lng <= 140; lng += 2) {
        if (Math.random() > 0.35) {
          landPoints.push({ lat, lng, size: 2.0, col: '#3E5C31' });
        }
      }
    }

    // East Asia (China, Japan, Korea)
    for (let lat = 20; lat <= 55; lat += 2.2) {
      for (let lng = 95; lng <= 145; lng += 2.2) {
        landPoints.push({ lat, lng, size: 2.4, col: '#5A7545' });
      }
    }

    // Australia
    for (let lat = -40; lat <= -12; lat += 2) {
      for (let lng = 112; lng <= 154; lng += 2) {
        if (Math.abs(lat + 26) < 14 && Math.abs(lng - 133) < 18) {
          landPoints.push({ lat, lng, size: 2.3, col: '#8B6A47' }); // Australian outback brown/ochre
        }
      }
    }

    // Middle East & Africa
    for (let lat = -35; lat <= 35; lat += 2.2) {
      for (let lng = 15; lng <= 60; lng += 2.2) {
        const isSahara = lat > 15 && lat < 30;
        landPoints.push({ lat, lng, size: 2.4, col: isSahara ? '#C2A676' : '#4E6D3B' });
      }
    }

    // Europe & Russia
    for (let lat = 36; lat <= 68; lat += 2.2) {
      for (let lng = -10; lng <= 80; lng += 2.2) {
        landPoints.push({ lat, lng, size: 2.2, col: '#557242' });
      }
    }

    // Atmospheric Cloud Swirls
    const clouds: Array<{ lat: number; lng: number; r: number; alpha: number }> = [];
    for (let i = 0; i < 180; i++) {
      clouds.push({
        lat: (Math.sin(i * 0.4) * 65),
        lng: (i * 18) % 360,
        r: 6 + Math.sin(i) * 5,
        alpha: 0.35 + Math.cos(i) * 0.25
      });
    }

    const render = () => {
      rotation += 0.22; // smooth slow rotation around Y-axis
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const radius = size * 0.36;

      // 1. Concentric Telemetry Orbit Rings (Left Arc Extensions)
      const telemetryTime = rotation * 0.05;
      const orbitRadii = [radius * 1.08, radius * 1.20, radius * 1.34, radius * 1.50];
      
      orbitRadii.forEach((r, idx) => {
        ctx.save();
        ctx.beginPath();
        // Draw left-side arc only
        ctx.arc(cx, cy, r, Math.PI * 0.55, Math.PI * 1.45);
        ctx.strokeStyle = idx === 1 ? 'rgba(59, 130, 246, 0.45)' : 'rgba(147, 197, 253, 0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash(idx % 2 === 0 ? [3, 6] : []);
        ctx.stroke();
        ctx.restore();

        // Node dots along the orbits
        const nodeAngle = Math.PI + Math.sin(telemetryTime + idx * 1.5) * 0.6;
        const nx = cx + r * Math.cos(nodeAngle);
        const ny = cy + r * Math.sin(nodeAngle);

        ctx.fillStyle = '#0B57D0';
        ctx.beginPath();
        ctx.arc(nx, ny, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(nx, ny, 6, 0, Math.PI * 2);
        ctx.stroke();
      });

      // 2. Cyan / Neon Blue Radar Rings at Bottom-Right
      const radarPulse = (Math.sin(rotation * 0.08) + 1) * 0.5;
      [radius * 0.95, radius * 1.05, radius * 1.15].forEach((rr, i) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, rr + radarPulse * 6, Math.PI * 0.18, Math.PI * 0.42);
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + i * 0.2})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();
      });

      // 3. Globe Outer Atmospheric Glow
      const atmosGlow = ctx.createRadialGradient(cx, cy, radius * 0.92, cx, cy, radius * 1.18);
      atmosGlow.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
      atmosGlow.addColorStop(0.5, 'rgba(147, 197, 253, 0.2)');
      atmosGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = atmosGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.18, 0, Math.PI * 2);
      ctx.fill();

      // 4. Base Photorealistic Ocean Sphere
      const oceanGrad = ctx.createRadialGradient(
        cx - radius * 0.25,
        cy - radius * 0.25,
        radius * 0.1,
        cx,
        cy,
        radius
      );
      oceanGrad.addColorStop(0, '#1E5899');
      oceanGrad.addColorStop(0.5, '#123D73');
      oceanGrad.addColorStop(0.85, '#0A254D');
      oceanGrad.addColorStop(1, '#041329');

      ctx.fillStyle = oceanGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Clip within Globe Sphere for Continents and Clouds
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      // 5. Draw Continents with 3D Orthographic Projection
      landPoints.forEach((pt) => {
        const latRad = (pt.lat * Math.PI) / 180;
        const currentLng = (pt.lng + rotation) % 360;
        const lngRad = (currentLng * Math.PI) / 180;

        const x3D = radius * Math.cos(latRad) * Math.sin(lngRad);
        const y3D = radius * Math.sin(latRad);
        const z3D = radius * Math.cos(latRad) * Math.cos(lngRad);

        if (z3D > 0) {
          const depthAlpha = z3D / radius;
          const px = cx + x3D;
          const py = cy - y3D;

          ctx.fillStyle = pt.col;
          ctx.globalAlpha = 0.6 + depthAlpha * 0.4;
          ctx.beginPath();
          ctx.arc(px, py, pt.size * (0.8 + depthAlpha * 0.5), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 6. Draw Clouds with 3D Rotation
      clouds.forEach((cl) => {
        const latRad = (cl.lat * Math.PI) / 180;
        const currentLng = (cl.lng + rotation * 1.15) % 360;
        const lngRad = (currentLng * Math.PI) / 180;

        const x3D = radius * Math.cos(latRad) * Math.sin(lngRad);
        const y3D = radius * Math.sin(latRad);
        const z3D = radius * Math.cos(latRad) * Math.cos(lngRad);

        if (z3D > 0) {
          const depthAlpha = z3D / radius;
          const px = cx + x3D;
          const py = cy - y3D;

          ctx.fillStyle = '#FFFFFF';
          ctx.globalAlpha = cl.alpha * depthAlpha * 0.85;
          ctx.beginPath();
          ctx.arc(px, py, cl.r * (0.7 + depthAlpha * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 7. Shading & Rim Light on Sphere
      ctx.globalAlpha = 1.0;
      const rimGrad = ctx.createRadialGradient(
        cx + radius * 0.4,
        cy - radius * 0.4,
        radius * 0.2,
        cx,
        cy,
        radius
      );
      rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      rimGrad.addColorStop(0.6, 'rgba(59, 130, 246, 0.1)');
      rimGrad.addColorStop(0.95, 'rgba(3, 15, 38, 0.7)');
      rimGrad.addColorStop(1, 'rgba(2, 6, 23, 0.95)');
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 8. Bright Stellar Lens Flare on Upper-Right Limb
      const flareX = cx + radius * 0.68;
      const flareY = cy - radius * 0.68;

      // Cross Starburst Rays
      ctx.save();
      ctx.translate(flareX, flareY);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(-1.5, -45, 3, 90);
      ctx.fillRect(-45, -1.5, 90, 3);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = 'rgba(191, 219, 254, 0.5)';
      ctx.fillRect(-1, -30, 2, 60);
      ctx.fillRect(-30, -1, 60, 2);
      ctx.restore();

      // Radial Flare Glow
      const flareGrad = ctx.createRadialGradient(flareX, flareY, 0, flareX, flareY, 60);
      flareGrad.addColorStop(0, '#FFFFFF');
      flareGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.9)');
      flareGrad.addColorStop(0.4, 'rgba(191, 219, 254, 0.6)');
      flareGrad.addColorStop(0.7, 'rgba(59, 130, 246, 0.25)');
      flareGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = flareGrad;
      ctx.beginPath();
      ctx.arc(flareX, flareY, 60, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div 
      id="cinematic-landing-intro"
      className="fixed inset-0 z-50 flex items-center justify-between bg-[#F8FAFD] select-none overflow-hidden"
    >
      {/* Upper-Left Dot Matrix Background Pattern */}
      <div 
        className="absolute top-0 left-0 w-[480px] h-[360px] pointer-events-none opacity-40"
        style={{
          backgroundImage: 'radial-gradient(#0B57D0 1.2px, transparent 1.2px)',
          backgroundSize: '18px 18px'
        }}
      />

      {/* Bottom-Left Flowing Ethereal Waves */}
      <div className="absolute -bottom-20 -left-12 w-[650px] h-[380px] pointer-events-none opacity-30">
        <svg viewBox="0 0 650 380" fill="none" className="w-full h-full stroke-blue-400">
          <path d="M 0 160 C 180 200, 280 90, 650 260" strokeWidth="1.2" />
          <path d="M 0 190 C 210 240, 310 120, 650 290" strokeWidth="1.2" strokeDasharray="4 4" />
          <path d="M 0 220 C 240 270, 340 150, 650 320" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Top Right Controls (Sound & Pause) */}
      <div className="absolute top-6 right-8 z-40 flex items-center gap-2.5 pointer-events-auto">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="p-2.5 rounded-full bg-white/95 hover:bg-white border border-[#E2E8F0] text-[#334155] hover:text-[#0B3B95] shadow-xs transition-all hover:scale-105"
          title={isPaused ? 'Resume' : 'Pause'}
        >
          {isPaused ? <Play size={15} className="text-[#0B57D0]" /> : <Pause size={15} />}
        </button>

        <button
          onClick={toggleSound}
          className="p-2.5 rounded-full bg-white/95 hover:bg-white border border-[#E2E8F0] text-[#334155] hover:text-[#0B3B95] shadow-xs transition-all hover:scale-105"
          title="Toggle Ambient Telemetry Audio"
        >
          {soundEnabled ? <Volume2 size={15} className="text-[#0B57D0]" /> : <VolumeX size={15} />}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* LEFT SECTION: EXACT SENTINEL LOGO, TITLE, SUBTITLE, 4 CARDS & BUTTON       */}
      {/* ========================================================================= */}
      <div className="relative z-20 flex-1 max-w-[580px] lg:max-w-[620px] pl-8 sm:pl-14 md:pl-20 lg:pl-24 space-y-5 shrink-0">
        
        {/* 1. SENTINEL SHIELD LOGO (Blue gradient shield + Radio Tower + 3 Wave Arcs) */}
        <div className="w-20 h-24 relative flex items-center justify-center">
          <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id="sentinelShieldGradExact" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0B57D0" />
                <stop offset="100%" stopColor="#00358E" />
              </linearGradient>
            </defs>
            {/* Shield Outline */}
            <path
              d="M50 4 L92 22 C92 72 50 114 50 114 C50 114 8 72 8 22 Z"
              fill="url(#sentinelShieldGradExact)"
              stroke="#00245E"
              strokeWidth="2.5"
            />
            {/* White Radio Tower with Concentric Signal Waves */}
            <g transform="translate(50, 60)" stroke="#FFFFFF" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {/* 3 Left Waves */}
              <path d="M -18 -14 A 20 20 0 0 0 -18 14" strokeWidth="2.2" />
              <path d="M -13 -9 A 14 14 0 0 0 -13 9" strokeWidth="2.2" />
              <path d="M -8 -5 A 8 8 0 0 0 -8 5" strokeWidth="2.2" />
              
              {/* 3 Right Waves */}
              <path d="M 18 -14 A 20 20 0 0 1 18 14" strokeWidth="2.2" />
              <path d="M 13 -9 A 14 14 0 0 1 13 9" strokeWidth="2.2" />
              <path d="M 8 -5 A 8 8 0 0 1 8 5" strokeWidth="2.2" />
              
              {/* Tower Antenna Sphere */}
              <circle cx="0" cy="-15" r="3.5" fill="#FFFFFF" />
              {/* Tower Legs */}
              <path d="M 0 -11 L -12 18 M 0 -11 L 12 18" strokeWidth="2.5" />
              {/* Crossbars */}
              <path d="M -5 -1 L 5 -1 M -9 9 L 9 9" strokeWidth="2" />
              <path d="M -5 -1 L 9 9 M 5 -1 L -9 9" strokeWidth="1.5" />
            </g>
          </svg>
        </div>

        {/* 2. TITLE & SUBTITLE */}
        <div className="space-y-1.5">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-[0.08em] text-[#0B3B95] uppercase font-sans drop-shadow-xs">
            SENTINEL
          </h1>
          <p className="text-[11px] sm:text-xs md:text-[13px] font-bold tracking-[0.24em] text-[#0B57D0] uppercase">
            EARLY WARNING SYSTEMS IN DISASTER MANAGEMENT
          </p>
        </div>

        {/* 3. EKG / SEISMIC BLUE PULSE DIVIDER LINE */}
        <div className="flex items-center justify-start py-1">
          <svg width="280" height="20" viewBox="0 0 280 20" className="stroke-[#0B57D0]">
            <path
              d="M 0 10 L 105 10 L 118 3 L 128 17 L 138 4 L 148 14 L 158 10 L 280 10"
              fill="none"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* 4. FOUR WHITE ROUNDED CARDS (DETECT, ALERT, RESPOND, SAVE LIVES) */}
        <div className="flex items-center gap-3 sm:gap-4 pt-1">
          
          {/* CARD 1: DETECT */}
          <div 
            className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-white shadow-[0_8px_25px_rgba(0,0,0,0.06)] border border-slate-100/90 flex flex-col items-center justify-center gap-2.5 transition-transform duration-300 ease-out"
            style={{ transform: `translateY(${detectOffset}px)` }}
          >
            {/* Target Radar Icon */}
            <div className="text-[#0B57D0]">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0B57D0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="12" cy="12" r="1.5" fill="#0B57D0" />
                <path d="M 15 15 L 21 21" strokeWidth="2.5" />
              </svg>
            </div>
            <span className="text-[10px] sm:text-[11px] font-black tracking-wider text-[#0B3B95] uppercase">
              DETECT
            </span>
          </div>

          {/* CARD 2: ALERT */}
          <div 
            className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-white shadow-[0_8px_25px_rgba(0,0,0,0.06)] border border-slate-100/90 flex flex-col items-center justify-center gap-2.5 transition-transform duration-300 ease-out"
            style={{ transform: `translateY(${alertOffset}px)` }}
          >
            {/* Solid Bell Icon */}
            <div className="text-[#0B57D0]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#0B57D0">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
            </div>
            <span className="text-[10px] sm:text-[11px] font-black tracking-wider text-[#0B3B95] uppercase">
              ALERT
            </span>
          </div>

          {/* CARD 3: RESPOND */}
          <div 
            className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-white shadow-[0_8px_25px_rgba(0,0,0,0.06)] border border-slate-100/90 flex flex-col items-center justify-center gap-2.5 transition-transform duration-300 ease-out"
            style={{ transform: `translateY(${respondOffset}px)` }}
          >
            {/* Solid Users Team Icon */}
            <div className="text-[#0B57D0]">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="#0B57D0">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </div>
            <span className="text-[10px] sm:text-[11px] font-black tracking-wider text-[#0B3B95] uppercase">
              RESPOND
            </span>
          </div>

          {/* CARD 4: SAVE LIVES */}
          <div 
            className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-white shadow-[0_8px_25px_rgba(0,0,0,0.06)] border border-slate-100/90 flex flex-col items-center justify-center gap-2.5 transition-transform duration-300 ease-out"
            style={{ transform: `translateY(${saveLivesOffset}px)` }}
          >
            {/* Shield with Checkmark */}
            <div className="text-[#0B57D0]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" fill="#0B57D0" />
                <path d="M9 12l2 2 4-4" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[10px] sm:text-[11px] font-black tracking-wider text-[#0B3B95] uppercase whitespace-nowrap">
              SAVE LIVES
            </span>
          </div>

        </div>

        {/* 5. ENTER SYSTEM BUTTON (Royal blue pill button with right arrow) */}
        <div className="pt-3">
          <button
            id="btn-enter-system"
            onClick={onComplete}
            className="inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-[#0B57D0] via-[#0052CC] to-[#0047BA] hover:from-[#0047BA] hover:to-[#0B57D0] text-white text-sm font-black rounded-full shadow-lg shadow-blue-600/35 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-wider animate-pulse"
          >
            <span>ENTER SYSTEM</span>
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* CENTER-RIGHT: 3D ROTATING DIGITAL MONITORING GLOBE                         */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex items-center justify-center -ml-6 lg:ml-0 pointer-events-none shrink-0 pr-6 lg:pr-16">
        <canvas ref={globeCanvasRef} className="w-[520px] h-[520px] lg:w-[680px] lg:h-[680px] xl:w-[740px] xl:h-[740px] object-contain" />
      </div>

      {/* Discrete Skip Button on Bottom Left */}
      <div className="absolute bottom-6 left-10 z-30 pointer-events-auto">
        <button
          onClick={onComplete}
          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/80 hover:bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] shadow-xs transition-all"
        >
          Skip Intro ({Math.max(0, Math.ceil(TOTAL_DURATION - elapsed))}s)
        </button>
      </div>

    </div>
  );
};
