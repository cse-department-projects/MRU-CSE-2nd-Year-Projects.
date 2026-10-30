import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 40 }: LogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Outer Glow / Glassmorphism Background */}
      <div className="absolute inset-0 bg-cyan-500/10 rounded-full backdrop-blur-md border border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.4)]" />
      
      {/* Rotating Circuit Ring */}
      <motion.svg
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-1 text-blue-500/50"
        viewBox="0 0 100 100"
      >
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="12 4" />
        {/* Circuit Nodes */}
        <circle cx="50" cy="4" r="2" fill="currentColor" />
        <circle cx="96" cy="50" r="2" fill="currentColor" />
        <circle cx="50" cy="96" r="2" fill="currentColor" />
        <circle cx="4" cy="50" r="2" fill="currentColor" />
      </motion.svg>

      {/* Core Emblem SVG */}
      <svg 
        viewBox="0 0 100 100" 
        className="relative z-10 w-3/4 h-3/4 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
      >
        <defs>
          <linearGradient id="crossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" /> {/* cyan-500 */}
            <stop offset="100%" stopColor="#3b82f6" /> {/* blue-500 */}
          </linearGradient>
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Medical Cross Base */}
        <path 
          d="M35,15 h30 v20 h20 v30 h-20 v20 h-30 v-20 h-20 v-30 h20 z" 
          fill="url(#crossGradient)" 
          opacity="0.2"
        />
        <path 
          d="M35,15 h30 v20 h20 v30 h-20 v20 h-30 v-20 h-20 v-30 h20 z" 
          fill="none" 
          stroke="url(#crossGradient)" 
          strokeWidth="3" 
          strokeLinejoin="round"
          filter="url(#neonGlow)"
        />

        {/* AI Circuit Lines inside Cross */}
        <path d="M40,25 v15 h-15" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
        <circle cx="25" cy="40" r="1.5" fill="#60a5fa" />
        <path d="M60,75 v-15 h15" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
        <circle cx="75" cy="60" r="1.5" fill="#60a5fa" />

        {/* Heartbeat Wave intersecting */}
        <motion.path 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
          d="M10,50 h25 l7,-15 l12,30 l8,-15 h28" 
          fill="none" 
          stroke="#ffffff" 
          strokeWidth="3" 
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#neonGlow)"
        />
      </svg>
    </div>
  );
}
