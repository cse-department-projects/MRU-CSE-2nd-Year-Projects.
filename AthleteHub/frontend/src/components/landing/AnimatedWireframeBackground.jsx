import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * AnimatedWireframeBackground
 * 
 * Recreates the exact visual effect requested:
 * - Clean white / off-white background in light theme (#fafbfc), sleek slate/charcoal in dark theme.
 * - Delicate, thin light-gray lines forming an irregular geometric wireframe mesh
 *   of intersecting diagonal lines, triangles and polygons.
 * - Covers the entire landing page, remaining visible as the user scrolls.
 * - Smooth, slow, continuous harmonic movement causing the geometric network to subtly drift.
 * - Subtle, translucent pale-blue squares, outlined circles and tiny floating nodes.
 * - Soft ambient blue and lavender glows in selected areas (adapted to active theme).
 * - Low-intensity mouse-movement and scroll-based parallax for depth.
 * - High performance 2D canvas with DPI scaling, cleanup, and prefers-reduced-motion support.
 * - Flawless multi-theme support: seamlessly interpolates wireframe colors and background glows
 *   when switching between Light and Dark themes with zero coordinate jumping or flicker.
 */

// Helper to linearly interpolate between two numbers
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Helper to interpolate between two RGBA color arrays [r, g, b, a]
function interpolateRgba(c1, c2, t) {
  const r = Math.round(lerp(c1[0], c2[0], t));
  const g = Math.round(lerp(c1[1], c2[1], t));
  const b = Math.round(lerp(c1[2], c2[2], t));
  const a = lerp(c1[3], c2[3], t).toFixed(3);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// Color palettes for Light (0) and Dark (1) themes
const THEME_PALETTES = {
  // Wireframe edges
  edgeLight: [203, 213, 225, 0.45], // delicate light slate-300
  edgeDark: [148, 163, 184, 0.20],  // subtle glowing slate-400

  // Polygons / Triangles
  polyPaleBlueLight: [219, 234, 254, 0.16], // pale blue
  polyPaleBlueDark: [59, 130, 246, 0.10],   // translucent soft cyan/blue

  polyLavenderLight: [237, 233, 254, 0.14], // soft lavender
  polyLavenderDark: [139, 92, 246, 0.08],   // translucent soft violet

  polyIndigoLight: [224, 231, 255, 0.13],   // soft indigo
  polyIndigoDark: [99, 102, 241, 0.08],     // translucent indigo

  // Floating squares
  squareFillLight: [191, 219, 254, 0.22],
  squareFillDark: [59, 130, 246, 0.12],

  squareStrokeLight: [147, 197, 253, 0.45],
  squareStrokeDark: [96, 165, 250, 0.35],

  // Floating circles
  circleStrokeLight: [148, 163, 184, 0.35],
  circleStrokeDark: [148, 163, 184, 0.22],

  // Vertex nodes
  nodeFillLight: [148, 163, 184, 0.55],
  nodeFillDark: [147, 197, 253, 0.70],

  // Flowing Organic Wave Layers
  wave1Light: [237, 233, 254, 0.22], // lavender
  wave1Dark: [139, 92, 246, 0.08],

  wave2Light: [219, 234, 254, 0.26], // pale blue
  wave2Dark: [59, 130, 246, 0.10],

  wave3Light: [224, 231, 255, 0.24], // light indigo
  wave3Dark: [99, 102, 241, 0.09],

  wave4Light: [224, 242, 254, 0.20], // soft sky blue
  wave4Dark: [14, 165, 233, 0.07],

  waveCrestLight: [191, 219, 254, 0.40],
  waveCrestDark: [96, 165, 250, 0.20]
};

export default function AnimatedWireframeBackground({ className = '' }) {
  const canvasRef = useRef(null);
  
  // Connect to ThemeContext if available
  let themeContext;
  try {
    themeContext = useTheme();
  } catch {
    themeContext = null;
  }
  
  const contextIsDark = themeContext ? themeContext.isDark : false;
  
  // Track active theme state
  const [activeIsDark, setActiveIsDark] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark') || contextIsDark;
    }
    return contextIsDark;
  });

  // Keep state synchronized with context or DOM class
  useEffect(() => {
    const isDocDark = document.documentElement.classList.contains('dark');
    setActiveIsDark(isDocDark || contextIsDark);
  }, [contextIsDark]);

  useEffect(() => {
    // Observer for direct DOM class changes on <html>
    const observer = new MutationObserver(() => {
      const isDocDark = document.documentElement.classList.contains('dark');
      setActiveIsDark(isDocDark);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mouse & Scroll Parallax Targets & Smoothed Values
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetScrollY = window.scrollY || 0;
    let scrollY = window.scrollY || 0;

    // Theme interpolation progress: 0.0 (Light) -> 1.0 (Dark)
    let currentThemeT = document.documentElement.classList.contains('dark') ? 1.0 : 0.0;
    let targetThemeT = currentThemeT;

    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleScroll = () => {
      targetScrollY = window.scrollY || 0;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Mesh Grid Configuration
    let cols = 0;
    let rows = 0;
    let nodes = [];
    let edges = [];
    let filledPolygons = [];
    let floatingSquares = [];
    let floatingCircles = [];
    let waves = [];

    const initScene = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Determine grid resolution based on viewport
      const cellWidth = Math.max(160, Math.min(240, width / 7));
      const cellHeight = Math.max(140, Math.min(220, height / 5));

      cols = Math.ceil(width / cellWidth) + 2;
      rows = Math.ceil(height / cellHeight) + 2;

      const originX = -cellWidth;
      const originY = -cellHeight;

      nodes = [];
      edges = [];
      filledPolygons = [];

      // 1. Generate irregular nodes with deterministic random jitter
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const baseX = originX + c * cellWidth;
          const baseY = originY + r * cellHeight;

          // Organic jitter within cell boundaries
          const jitterX = (Math.sin(c * 17.3 + r * 23.7) * 0.35) * cellWidth;
          const jitterY = (Math.cos(c * 19.1 + r * 13.5) * 0.35) * cellHeight;

          nodes.push({
            baseX: baseX + jitterX,
            baseY: baseY + jitterY,
            x: baseX + jitterX,
            y: baseY + jitterY,
            // Harmonic drift parameters (slow, tranquil frequencies)
            ampX: 12 + Math.abs(Math.sin(c * 5.1 + r * 7.9)) * 14,
            ampY: 10 + Math.abs(Math.cos(c * 3.7 + r * 9.1)) * 14,
            freqX: 0.00035 + (c % 3) * 0.0001,
            freqY: 0.00030 + (r % 3) * 0.0001,
            phaseX: (c * 1.3 + r * 2.1),
            phaseY: (c * 2.7 + r * 1.5),
            depth: 0.5 + Math.abs(Math.sin(c + r)) * 0.5 // multi-depth parallax
          });
        }
      }

      // Helper to convert grid coord to 1D index
      const getIdx = (c, r) => r * cols + c;

      // 2. Connect grid nodes to form diagonal wireframe mesh and polygons
      for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols - 1; c++) {
          const topLeft = getIdx(c, r);
          const topRight = getIdx(c + 1, r);
          const bottomLeft = getIdx(c, r + 1);
          const bottomRight = getIdx(c + 1, r + 1);

          // Horizontal & Vertical edges
          edges.push([topLeft, topRight]);
          edges.push([topLeft, bottomLeft]);

          // Diagonal line: alternate direction for natural polygonal variety
          if ((c + r) % 2 === 0) {
            edges.push([topLeft, bottomRight]);
            // Triangle 1: topLeft, topRight, bottomRight
            if ((c * 3 + r * 7) % 5 === 0) {
              filledPolygons.push({
                indices: [topLeft, topRight, bottomRight],
                type: (c + r) % 4 === 0 ? 'paleBlue' : 'lavender'
              });
            }
            // Triangle 2: topLeft, bottomLeft, bottomRight
            if ((c * 5 + r * 11) % 6 === 0) {
              filledPolygons.push({
                indices: [topLeft, bottomLeft, bottomRight],
                type: 'indigo'
              });
            }
          } else {
            edges.push([topRight, bottomLeft]);
            // Triangle 1: topLeft, topRight, bottomLeft
            if ((c * 2 + r * 9) % 5 === 0) {
              filledPolygons.push({
                indices: [topLeft, topRight, bottomLeft],
                type: 'paleBlue'
              });
            }
            // Triangle 2: topRight, bottomRight, bottomLeft
            if ((c * 7 + r * 3) % 7 === 0) {
              filledPolygons.push({
                indices: [topRight, bottomRight, bottomLeft],
                type: 'lavender'
              });
            }
          }
        }
      }

      // Connect right and bottom edges
      for (let r = 0; r < rows - 1; r++) {
        edges.push([getIdx(cols - 1, r), getIdx(cols - 1, r + 1)]);
      }
      for (let c = 0; c < cols - 1; c++) {
        edges.push([getIdx(c, rows - 1), getIdx(c + 1, rows - 1)]);
      }

      // 3. Subtle translucent floating squares
      floatingSquares = [
        { relX: 0.14, relY: 0.22, size: 36, rot: 0.12, rotSpeed: 0.00015, amp: 16, phase: 0.5 },
        { relX: 0.82, relY: 0.18, size: 28, rot: 0.45, rotSpeed: -0.00018, amp: 14, phase: 1.8 },
        { relX: 0.74, relY: 0.68, size: 44, rot: 0.28, rotSpeed: 0.00012, amp: 18, phase: 3.2 },
        { relX: 0.28, relY: 0.76, size: 32, rot: 0.60, rotSpeed: -0.00014, amp: 15, phase: 4.5 },
        { relX: 0.52, relY: 0.38, size: 22, rot: 0.35, rotSpeed: 0.00020, amp: 12, phase: 2.1 }
      ];

      // 4. Subtle outlined circles
      floatingCircles = [
        { relX: 0.22, relY: 0.44, radius: 24, amp: 12, phase: 1.2 },
        { relX: 0.88, relY: 0.52, radius: 32, amp: 16, phase: 2.8 },
        { relX: 0.40, relY: 0.84, radius: 20, amp: 10, phase: 4.1 },
        { relX: 0.64, relY: 0.12, radius: 28, amp: 14, phase: 0.9 }
      ];

      // 5. Flowing Organic Wave Layers (layered depths, varying speeds & harmonic curves)
      waves = [
        {
          baseYRatio: 0.48,
          amp1: 22,
          amp2: 11,
          freq1: 0.0016,
          freq2: 0.0032,
          speed1: 0.00060,
          speed2: -0.00040,
          phase: 0.0,
          colorKey: 'wave1',
          parallax: 0.30
        },
        {
          baseYRatio: 0.60,
          amp1: 28,
          amp2: 14,
          freq1: 0.0013,
          freq2: 0.0027,
          speed1: -0.00050,
          speed2: 0.00035,
          phase: 1.7,
          colorKey: 'wave2',
          parallax: 0.42
        },
        {
          baseYRatio: 0.72,
          amp1: 26,
          amp2: 13,
          freq1: 0.0015,
          freq2: 0.0035,
          speed1: 0.00070,
          speed2: -0.00045,
          phase: 3.3,
          colorKey: 'wave3',
          parallax: 0.52
        },
        {
          baseYRatio: 0.84,
          amp1: 20,
          amp2: 10,
          freq1: 0.0018,
          freq2: 0.0038,
          speed1: -0.00055,
          speed2: 0.00030,
          phase: 4.9,
          colorKey: 'wave4',
          parallax: 0.62
        }
      ];
    };

    initScene();

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initScene();
      }, 150);
    };

    window.addEventListener('resize', handleResize);

    // Render Animation Loop
    let startTime = performance.now();

    const render = (time) => {
      animId = requestAnimationFrame(render);

      const elapsed = time - startTime;
      const motionSpeedFactor = prefersReducedMotion ? 0.05 : 1.0;

      // Update theme interpolation target dynamically
      const isDarkActive = document.documentElement.classList.contains('dark');
      targetThemeT = isDarkActive ? 1.0 : 0.0;
      // Smoothly ease theme progress
      currentThemeT += (targetThemeT - currentThemeT) * 0.08;

      // Smooth mouse and scroll interpolation
      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;
      scrollY += (targetScrollY - scrollY) * 0.08;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Subtle vertical scroll offset modulo
      const scrollOffset = (scrollY * 0.04) % (height * 0.5);

      // 1. Update node positions with harmonic drift and parallax
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const driftX = Math.sin(elapsed * n.freqX * motionSpeedFactor + n.phaseX) * n.ampX;
        const driftY = Math.cos(elapsed * n.freqY * motionSpeedFactor + n.phaseY) * n.ampY;

        // Subtle mouse parallax (scaled by node depth)
        const pMouseX = mouseX * 14 * n.depth;
        const pMouseY = mouseY * 12 * n.depth;

        // Subtle scroll parallax
        const pScrollY = -scrollOffset * n.depth;

        n.x = n.baseX + driftX + pMouseX;
        n.y = n.baseY + driftY + pMouseY + pScrollY;
      }

      // Active dynamic theme color values for this frame
      const currentEdgeColor = interpolateRgba(
        THEME_PALETTES.edgeLight,
        THEME_PALETTES.edgeDark,
        currentThemeT
      );
      const currentPaleBlue = interpolateRgba(
        THEME_PALETTES.polyPaleBlueLight,
        THEME_PALETTES.polyPaleBlueDark,
        currentThemeT
      );
      const currentLavender = interpolateRgba(
        THEME_PALETTES.polyLavenderLight,
        THEME_PALETTES.polyLavenderDark,
        currentThemeT
      );
      const currentIndigo = interpolateRgba(
        THEME_PALETTES.polyIndigoLight,
        THEME_PALETTES.polyIndigoDark,
        currentThemeT
      );
      const currentSquareFill = interpolateRgba(
        THEME_PALETTES.squareFillLight,
        THEME_PALETTES.squareFillDark,
        currentThemeT
      );
      const currentSquareStroke = interpolateRgba(
        THEME_PALETTES.squareStrokeLight,
        THEME_PALETTES.squareStrokeDark,
        currentThemeT
      );
      const currentCircleStroke = interpolateRgba(
        THEME_PALETTES.circleStrokeLight,
        THEME_PALETTES.circleStrokeDark,
        currentThemeT
      );
      const currentNodeFill = interpolateRgba(
        THEME_PALETTES.nodeFillLight,
        THEME_PALETTES.nodeFillDark,
        currentThemeT
      );

      // 1.5. Render Flowing Animated Wave Layers (Underneath wireframe mesh)
      for (let w = 0; w < waves.length; w++) {
        const wave = waves[w];
        const waveColor = interpolateRgba(
          THEME_PALETTES[`${wave.colorKey}Light`],
          THEME_PALETTES[`${wave.colorKey}Dark`],
          currentThemeT
        );
        const crestColor = interpolateRgba(
          THEME_PALETTES.waveCrestLight,
          THEME_PALETTES.waveCrestDark,
          currentThemeT
        );

        const baseY = wave.baseYRatio * height + (mouseY * 8 * wave.parallax) - (scrollOffset * wave.parallax);

        ctx.beginPath();
        ctx.moveTo(0, height);

        const step = 16;
        const count = Math.ceil(width / step) + 1;

        for (let i = 0; i <= count; i++) {
          const x = i * step;
          const y = baseY +
            Math.sin(x * wave.freq1 + elapsed * wave.speed1 * motionSpeedFactor + wave.phase) * wave.amp1 +
            Math.cos(x * wave.freq2 + elapsed * wave.speed2 * motionSpeedFactor + wave.phase * 1.5) * wave.amp2;

          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        // Organic vertical gradient from top crest to bottom
        const grad = ctx.createLinearGradient(0, baseY - wave.amp1, 0, height);
        grad.addColorStop(0, waveColor);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fill();

        // Subtle glowing wave crest highlight
        ctx.strokeStyle = crestColor;
        ctx.lineWidth = 0.85;
        ctx.stroke();
      }

      // 2. Render subtle translucent filled polygons / triangles
      for (let i = 0; i < filledPolygons.length; i++) {
        const poly = filledPolygons[i];
        const [i0, i1, i2] = poly.indices;
        const p0 = nodes[i0];
        const p1 = nodes[i1];
        const p2 = nodes[i2];

        if (!p0 || !p1 || !p2) continue;

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.closePath();

        if (poly.type === 'paleBlue') {
          ctx.fillStyle = currentPaleBlue;
        } else if (poly.type === 'lavender') {
          ctx.fillStyle = currentLavender;
        } else {
          ctx.fillStyle = currentIndigo;
        }
        ctx.fill();
      }

      // 3. Render delicate, semi-transparent wireframe lines
      ctx.beginPath();
      ctx.strokeStyle = currentEdgeColor;
      ctx.lineWidth = 0.85;

      for (let i = 0; i < edges.length; i++) {
        const [idxA, idxB] = edges[i];
        const pA = nodes[idxA];
        const pB = nodes[idxB];
        if (!pA || !pB) continue;

        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
      }
      ctx.stroke();

      // 4. Render translucent floating squares
      for (let i = 0; i < floatingSquares.length; i++) {
        const sq = floatingSquares[i];
        const cx = sq.relX * width + Math.sin(elapsed * 0.0004 * motionSpeedFactor + sq.phase) * sq.amp + mouseX * 8;
        const cy = sq.relY * height + Math.cos(elapsed * 0.00035 * motionSpeedFactor + sq.phase) * sq.amp + mouseY * 8 - (scrollOffset * 0.6);
        const currentRot = sq.rot + elapsed * sq.rotSpeed * motionSpeedFactor;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(currentRot);

        // Fill & Stroke
        ctx.fillStyle = currentSquareFill;
        ctx.strokeStyle = currentSquareStroke;
        ctx.lineWidth = 1;
        ctx.fillRect(-sq.size / 2, -sq.size / 2, sq.size, sq.size);
        ctx.strokeRect(-sq.size / 2, -sq.size / 2, sq.size, sq.size);

        ctx.restore();
      }

      // 5. Render subtle outlined circles
      for (let i = 0; i < floatingCircles.length; i++) {
        const c = floatingCircles[i];
        const cx = c.relX * width + Math.cos(elapsed * 0.00038 * motionSpeedFactor + c.phase) * c.amp + mouseX * 10;
        const cy = c.relY * height + Math.sin(elapsed * 0.00042 * motionSpeedFactor + c.phase) * c.amp + mouseY * 10 - (scrollOffset * 0.5);

        ctx.beginPath();
        ctx.arc(cx, cy, c.radius, 0, Math.PI * 2);
        ctx.strokeStyle = currentCircleStroke;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 6. Render tiny floating nodes at vertex intersections
      ctx.fillStyle = currentNodeFill;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        // Draw node on alternate points for restrained elegance
        if (i % 2 === 0) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`} 
      aria-hidden="true"
    >
      {/* Light Theme Background & Ambient Radial Glows */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${activeIsDark ? 'opacity-0' : 'opacity-100'}`}
        style={{
          backgroundColor: '#fafbfc',
          backgroundImage: `
            radial-gradient(circle 700px at 15% 15%, rgba(224, 231, 255, 0.55) 0%, transparent 60%),
            radial-gradient(circle 800px at 85% 35%, rgba(219, 234, 254, 0.48) 0%, transparent 65%),
            radial-gradient(circle 750px at 20% 80%, rgba(237, 233, 254, 0.45) 0%, transparent 60%),
            radial-gradient(circle 850px at 80% 88%, rgba(224, 242, 254, 0.40) 0%, transparent 65%)
          `
        }}
      />

      {/* Dark Theme Background & Ambient Radial Glows */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${activeIsDark ? 'opacity-100' : 'opacity-0'}`}
        style={{
          backgroundColor: '#0b0f19',
          backgroundImage: `
            radial-gradient(circle 700px at 15% 15%, rgba(59, 130, 246, 0.14) 0%, transparent 60%),
            radial-gradient(circle 800px at 85% 35%, rgba(99, 102, 241, 0.12) 0%, transparent 65%),
            radial-gradient(circle 750px at 20% 80%, rgba(139, 92, 246, 0.10) 0%, transparent 60%),
            radial-gradient(circle 850px at 80% 88%, rgba(14, 165, 233, 0.10) 0%, transparent 65%)
          `
        }}
      />

      {/* High-Performance 2D Wireframe Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
}
