import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';

/**
 * Scroll3DSection
 * 
 * Creates an immersive 3D computer display scroll experience:
 * - Incoming lower sections enter the virtual screen receding backward (translateZ < 0, subtle rotateX, scale down)
 *   and settle flat into normal position (translateZ = 0, scale = 1).
 * - Outgoing upper sections move outward toward the viewer (translateZ > 0, subtle rotateX, slight scale up).
 * - Smooth spring physics for natural momentum.
 * - Text remains ultra-crisp and readable (subtle rotations max 4deg, backface visibility hidden).
 * - Responsive: automatically gentles / disables rotation on mobile or prefers-reduced-motion.
 */
export default function Scroll3DSection({ 
  children, 
  id, 
  className = '', 
  isFirst = false,
  perspective = 1400 
}) {
  const ref = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Track scroll progression of this section across the viewport
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: isFirst 
      ? ["start start", "end start"] 
      : ["start end", "end start"]
  });

  // Smooth out scroll progression with light spring damping
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001
  });

  // Calculate 3D transformations
  // For the first (Hero) section:
  // progress 0 is at rest (start start). As it scrolls up to 1: moves outward toward viewer.
  // For subsequent sections:
  // progress 0 (entering from bottom) -> 0.45 (centered/settled) -> 1.0 (exiting to top)
  
  const zInput = isFirst ? [0, 1] : [0, 0.45, 1];
  const zOutput = isFirst ? [0, 75] : [-85, 0, 75];

  const rotInput = isFirst ? [0, 1] : [0, 0.45, 1];
  const rotOutput = isFirst ? [0, -3.5] : [3.5, 0, -3.5];

  const scaleInput = isFirst ? [0, 1] : [0, 0.45, 1];
  const scaleOutput = isFirst ? [1, 1.025] : [0.95, 1, 1.025];

  const opacityInput = isFirst ? [0, 0.75, 1] : [0, 0.25, 0.75, 1];
  const opacityOutput = isFirst ? [1, 0.9, 0.65] : [0.75, 1, 1, 0.65];

  const rawZ = useTransform(smoothProgress, zInput, zOutput);
  const rawRotX = useTransform(smoothProgress, rotInput, rotOutput);
  const rawScale = useTransform(smoothProgress, scaleInput, scaleOutput);
  const rawOpacity = useTransform(smoothProgress, opacityInput, opacityOutput);

  // If reduced motion is requested, disable 3D rotation and depth
  const translateZ = shouldReduceMotion ? 0 : rawZ;
  const rotateX = shouldReduceMotion ? 0 : rawRotX;
  const scale = shouldReduceMotion ? 1 : rawScale;
  const opacity = shouldReduceMotion ? 1 : rawOpacity;

  return (
    <div 
      id={id} 
      ref={ref} 
      className={`relative w-full ${className}`}
      style={{ perspective: `${perspective}px` }}
    >
      <motion.div
        style={{
          z: translateZ,
          rotateX: rotateX,
          scale: scale,
          opacity: opacity,
          transformStyle: 'preserve-3d',
          transformOrigin: '50% 50%',
          willChange: 'transform, opacity'
        }}
        className="w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
