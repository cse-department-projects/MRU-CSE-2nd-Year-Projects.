import React, { useRef, useEffect, useCallback } from 'react';
import { ArrowRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

const TOTAL_FRAMES = 120;
const getFramePath = (index) => `/animations/athletehub-frames/ezgif-frame-${String(index + 1).padStart(3, '0')}.jpg`;

export default function AthleteScrollAnimation() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef(new Array(TOTAL_FRAMES));
  const targetFrameRef = useRef(0);
  const currentFrameRef = useRef(0);
  const animationFrameRef = useRef(null);
  const lastDrawnFrameRef = useRef(-1);

  const getClosestLoadedImage = useCallback((targetIndex) => {
    const images = imagesRef.current;
    if (images[targetIndex]?.complete && images[targetIndex]?.naturalWidth > 0) return images[targetIndex];
    for (let offset = 1; offset < TOTAL_FRAMES; offset += 1) {
      const before = targetIndex - offset;
      const after = targetIndex + offset;
      if (before >= 0 && images[before]?.complete && images[before]?.naturalWidth > 0) return images[before];
      if (after < TOTAL_FRAMES && images[after]?.complete && images[after]?.naturalWidth > 0) return images[after];
    }
    return null;
  }, []);

  // Canvas equivalent of object-fit: cover: preserve the image aspect ratio and crop overflow.
  const drawFrameToCanvas = useCallback((image) => {
    const canvas = canvasRef.current;
    if (!canvas || !image?.complete || image.naturalWidth === 0) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    const context = canvas.getContext('2d');
    if (!context) return;
    const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, (canvas.width - drawWidth) / 2, (canvas.height - drawHeight) / 2, drawWidth, drawHeight);
  }, []);

  useEffect(() => {
    let active = true;
    const preload = (index) => {
      const image = new Image();
      image.decoding = 'async';
      image.src = getFramePath(index);
      image.onload = () => {
        if (active && Math.round(currentFrameRef.current) === index) drawFrameToCanvas(image);
      };
      imagesRef.current[index] = image;
    };
    preload(0);
    for (let index = 1; index < TOTAL_FRAMES; index += 1) preload(index);
    return () => { active = false; };
  }, [drawFrameToCanvas]);

  useEffect(() => {
    const updateProgress = () => {
      // The sequence stays visible behind the entire landing page, not only its hero.
      const scrollDistance = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollDistance > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollDistance)) : 0;
      targetFrameRef.current = progress * (TOTAL_FRAMES - 1);
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  useEffect(() => {
    const animate = () => {
      const difference = targetFrameRef.current - currentFrameRef.current;
      currentFrameRef.current += Math.abs(difference) > 0.001 ? difference * 0.18 : difference;
      const frameIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(currentFrameRef.current)));
      if (frameIndex !== lastDrawnFrameRef.current) {
        const image = getClosestLoadedImage(frameIndex);
        if (image) {
          lastDrawnFrameRef.current = frameIndex;
          drawFrameToCanvas(image);
        }
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [drawFrameToCanvas, getClosestLoadedImage]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => drawFrameToCanvas(getClosestLoadedImage(Math.round(currentFrameRef.current))));
    if (canvasRef.current) resizeObserver.observe(canvasRef.current);
    return () => resizeObserver.disconnect();
  }, [drawFrameToCanvas, getClosestLoadedImage]);

  return (
    <section id="motion-capture" ref={sectionRef} className="relative h-[100svh] w-full">
      <div className="relative h-full w-full overflow-hidden">
        <canvas ref={canvasRef} className="fixed inset-0 z-0 h-full w-full" aria-label="Athlete motion analysis animation" />
        <div className="pointer-events-none fixed inset-0 z-[1] bg-gradient-to-r from-slate-950/75 via-slate-950/30 to-slate-950/55" />
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[1] h-48 bg-gradient-to-b from-slate-950/65 to-transparent" />
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[1] h-44 bg-gradient-to-t from-slate-950/70 to-transparent" />

        <div className="relative z-10 flex h-full items-center px-6 pt-20 sm:px-10 lg:px-16">
          <div className="max-w-3xl text-left text-white">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-slate-950/35 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
              <Activity className="h-3.5 w-3.5 text-cyan-300" />
              The Unified Sports Management Platform
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              The operating system for <span className="text-cyan-200">modern athletic excellence.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-slate-100 sm:text-xl">
              Unify athlete performance telemetry, squad rosters, training cycles, and tournament brackets in one intuitive platform. Built for sports federations, academies, coaches, and athletes.
            </p>
            <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Button onClick={() => navigate('/register')} className="h-13 rounded-full bg-primary px-8 text-base font-bold text-primary-foreground shadow-xl shadow-primary/30 transition-transform hover:scale-105 hover:bg-primary/90">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button onClick={() => navigate('/login')} variant="outline" className="h-13 rounded-full border-white/40 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur-md hover:scale-105 hover:bg-white/20 hover:text-white">
                Sign In to Workspace
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
