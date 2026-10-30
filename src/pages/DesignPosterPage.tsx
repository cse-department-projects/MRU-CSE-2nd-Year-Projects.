import React, { useRef, useState } from 'react';
import { 
  Download, 
  ArrowRight, 
  ArrowLeft, 
  Shield, 
  Bell, 
  MapPin, 
  Phone, 
  AlertTriangle, 
  CloudRain, 
  Flame, 
  Radio, 
  CheckCircle2, 
  Share2, 
  Camera, 
  ChevronRight,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DesignPosterPage: React.FC = () => {
  const navigate = useNavigate();
  const posterRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // High-Resolution PNG export using Canvas
  const handleDownloadPNG = async () => {
    if (!posterRef.current) return;
    setDownloading(true);

    try {
      // Dynamic import of html2canvas if available, or SVG canvas rasterization
      const element = posterRef.current;
      
      // Use SVG foreignObject serialization to render crisp 2x / 4k image
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      const scale = 2; // High resolution 2x

      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.scale(scale, scale);
        
        // Clone HTML with computed styles into an SVG foreignObject
        const data = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
            <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml">
                ${new XMLSerializer().serializeToString(element)}
              </div>
            </foreignObject>
          </svg>
        `;

        const img = new Image();
        const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);

          const pngUrl = canvas.toDataURL('image/png', 1.0);
          const link = document.createElement('a');
          link.download = 'SENTINEL-Early-Warning-System-UI-Design.png';
          link.href = pngUrl;
          link.click();
          setDownloading(false);
        };

        img.onerror = () => {
          // Fallback simple window print / snapshot
          window.print();
          setDownloading(false);
        };

        img.src = url;
      }
    } catch (err) {
      console.error(err);
      window.print();
      setDownloading(false);
    }
  };

  const handleCopyNotice = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 flex flex-col items-center">
      
      {/* Top Action Bar */}
      <div className="w-full max-w-7xl flex flex-wrap items-center justify-between gap-4 mb-6 bg-slate-800/90 border border-slate-700 p-4 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold transition-all"
          >
            <ArrowLeft size={16} />
            <span>Back to Web App</span>
          </button>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <span>SENTINEL UI/UX Design Poster</span>
              <span className="text-xs bg-blue-600/30 text-blue-400 border border-blue-500/40 px-2 py-0.5 rounded-full font-mono">10-Screen Workflow</span>
            </h1>
            <p className="text-xs text-slate-400">Ready to save, screenshot, or download as an image for your group presentation</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold transition-all"
          >
            <span>Print / PDF</span>
          </button>

          <button
            onClick={handleDownloadPNG}
            disabled={downloading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <Download size={16} />
            <span>{downloading ? 'Preparing Image...' : 'Download Image (PNG)'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* POSTER CANVAS CONTAINER (EXACT LAYOUT TO USER'S REFERENCE IMAGE)           */}
      {/* ========================================================================= */}
      <div className="w-full overflow-x-auto pb-8 flex justify-center">
        <div 
          ref={posterRef}
          id="sentinel-ui-poster"
          className="bg-white text-slate-900 w-[1420px] min-w-[1420px] p-10 rounded-2xl shadow-2xl border border-slate-200 flex flex-col select-none"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          {/* POSTER HEADER */}
          <div className="text-center space-y-1 mb-8">
            <h2 className="text-4xl font-black tracking-wide text-[#0B3B95] uppercase flex items-center justify-center gap-3">
              <span className="text-red-600">EARLY WARNING SYSTEMS</span>
              <span>IN DISASTER MANAGEMENT</span>
            </h2>
            <p className="text-base font-extrabold tracking-[0.25em] text-[#475569] uppercase">
              USER INTERFACE DESIGN & WORKFLOW
            </p>
          </div>

          {/* ===================================================================== */}
          {/* ROW 1: SCREENS 1 TO 5                                                */}
          {/* ===================================================================== */}
          <div className="flex items-center justify-between gap-3 mb-10">
            
            {/* 1. LOGIN / SIGN UP */}
            <div className="flex flex-col items-center flex-1 max-w-[245px]">
              <span className="text-xs font-black text-slate-800 uppercase mb-2 tracking-wider">1. LOGIN / SIGN UP</span>
              <div className="w-full h-[470px] rounded-[32px] bg-[#0A192F] p-3 border-4 border-slate-800 shadow-xl flex flex-col justify-between text-white relative overflow-hidden">
                {/* Status Bar */}
                <div className="flex justify-between items-center text-[10px] text-slate-400 px-2 pt-1">
                  <span>09:41</span>
                  <div className="flex gap-1"><span>5G</span><span>100%</span></div>
                </div>

                {/* Logo & Slogan */}
                <div className="flex flex-col items-center text-center mt-6 space-y-2">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/40">
                    <Radio size={32} className="text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-wide text-white">SENTINEL</h3>
                    <p className="text-[10px] font-bold text-red-400 tracking-wider uppercase">Stay Alert, Stay Safe</p>
                    <p className="text-[9px] text-slate-400">Early Warning Today, Safe Tomorrow</p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="space-y-2 my-auto px-2">
                  <button className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md">
                    Login
                  </button>
                  <button className="w-full py-2.5 rounded-xl bg-blue-900/60 border border-blue-700 text-blue-200 font-bold text-xs">
                    Sign Up
                  </button>
                  
                  <div className="pt-2 space-y-1.5">
                    <div className="w-full py-2 rounded-xl bg-white text-slate-800 font-bold text-[11px] flex items-center justify-center gap-2">
                      <span className="text-red-500 font-black">G</span> Continue with Google
                    </div>
                    <div className="w-full py-2 rounded-xl bg-[#1877F2] text-white font-bold text-[11px] flex items-center justify-center gap-2">
                      <span className="font-black">f</span> Continue with Facebook
                    </div>
                  </div>
                </div>

                {/* Footer terms */}
                <p className="text-[8px] text-slate-500 text-center pb-2">
                  By continuing, you agree to our Terms & Privacy Policy
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="text-slate-400 shrink-0"><ArrowRight size={22} strokeWidth={2.5} /></div>

            {/* 2. HOME DASHBOARD */}
            <div className="flex flex-col items-center flex-1 max-w-[245px]">
              <span className="text-xs font-black text-slate-800 uppercase mb-2 tracking-wider">2. HOME DASHBOARD</span>
              <div className="w-full h-[470px] rounded-[32px] bg-slate-50 p-2.5 border-4 border-slate-800 shadow-xl flex flex-col justify-between text-slate-800 relative overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-1 pt-1 border-b border-slate-200 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">S</div>
                    <span className="text-xs font-bold text-slate-800">Dashboard</span>
                  </div>
                  <Bell size={14} className="text-slate-600" />
                </div>

                {/* Location */}
                <div className="px-1 pt-1 flex items-center gap-1 text-[10px] text-slate-600">
                  <MapPin size={10} className="text-red-500" />
                  <span className="font-semibold">New Delhi, India</span>
                  <span className="text-[9px] text-slate-400 ml-auto">Live GPS</span>
                </div>

                {/* Red Emergency Alert Card */}
                <div className="bg-red-600 text-white p-2.5 rounded-2xl shadow-md space-y-1 my-1">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase">
                    <AlertTriangle size={14} />
                    <span>High Flood Risk Alert</span>
                  </div>
                  <p className="text-[9px] text-red-100 leading-tight">
                    Severe water level rise in low-lying areas. Evacuate to high ground.
                  </p>
                  <span className="text-[9px] font-bold underline cursor-pointer">View Details & Route &rarr;</span>
                </div>

                {/* Current Weather / Conditions Telemetry */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-700 uppercase">Current Conditions</span>
                  <div className="grid grid-cols-3 gap-1 text-center">
                    <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[9px] text-slate-400 block">Temp</span>
                      <span className="text-xs font-black text-slate-800">28°C</span>
                    </div>
                    <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[9px] text-slate-400 block">Humidity</span>
                      <span className="text-xs font-black text-blue-600">65%</span>
                    </div>
                    <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[9px] text-slate-400 block">Wind</span>
                      <span className="text-xs font-black text-slate-800">12 km/h</span>
                    </div>
                  </div>
                </div>

                {/* Active Alerts List */}
                <div className="space-y-1 my-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-700">Recent Alerts</span>
                    <span className="text-blue-600 font-bold text-[9px]">See All</span>
                  </div>
                  
                  <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><CloudRain size={12} /></div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-800 leading-none">Flood Warning</p>
                        <span className="text-[8px] text-slate-400">Today, 07:30 AM</span>
                      </div>
                    </div>
                    <ChevronRight size={12} className="text-slate-400" />
                  </div>

                  <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><CloudRain size={12} /></div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-800 leading-none">Heavy Rainfall Alert</p>
                        <span className="text-[8px] text-slate-400">Today, 06:15 AM</span>
                      </div>
                    </div>
                    <ChevronRight size={12} className="text-slate-400" />
                  </div>
                </div>

                {/* Bottom Navigation */}
                <div className="bg-white rounded-2xl border border-slate-200 py-1.5 px-3 flex justify-between items-center text-[9px] font-bold text-slate-400">
                  <div className="flex flex-col items-center text-red-600"><Radio size={12} /><span>Home</span></div>
                  <div className="flex flex-col items-center"><Bell size={12} /><span>Alerts</span></div>
                  <div className="flex flex-col items-center"><MapPin size={12} /><span>Map</span></div>
                  <div className="flex flex-col items-center"><Phone size={12} /><span>Contacts</span></div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="text-slate-400 shrink-0"><ArrowRight size={22} strokeWidth={2.5} /></div>

            {/* 3. ALERTS / WARNINGS */}
            <div className="flex flex-col items-center flex-1 max-w-[245px]">
              <span className="text-xs font-black text-slate-800 uppercase mb-2 tracking-wider">3. ALERTS / WARNINGS</span>
              <div className="w-full h-[470px] rounded-[32px] bg-slate-50 p-2.5 border-4 border-slate-800 shadow-xl flex flex-col justify-between text-slate-800 relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-1 pt-1 border-b border-slate-200 pb-1.5">
                  <span className="text-xs font-bold text-slate-800">Alerts & Warnings</span>
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 text-[10px] font-bold text-center">
                  <div className="flex-1 py-1 text-red-600 border-b-2 border-red-600">All (5)</div>
                  <div className="flex-1 py-1 text-slate-500">Active (3)</div>
                  <div className="flex-1 py-1 text-slate-400">Expired</div>
                </div>

                {/* Alert Cards */}
                <div className="space-y-2 my-auto">
                  {/* Alert 1 */}
                  <div className="bg-white p-2.5 rounded-2xl border-l-4 border-l-red-600 border border-slate-200 shadow-2xs space-y-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-red-100 text-red-600 flex items-center justify-center"><AlertTriangle size={12} /></div>
                      <span className="text-[11px] font-black text-slate-800">Flood Warning</span>
                    </div>
                    <p className="text-[9px] text-slate-600">High risk of flooding in low-lying riverside zones.</p>
                    <span className="text-[8px] text-slate-400 block font-mono">13 May 2025, 07:30 AM</span>
                  </div>

                  {/* Alert 2 */}
                  <div className="bg-white p-2.5 rounded-2xl border-l-4 border-l-orange-500 border border-slate-200 shadow-2xs space-y-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center"><Radio size={12} /></div>
                      <span className="text-[11px] font-black text-slate-800">Cyclone Alert</span>
                    </div>
                    <p className="text-[9px] text-slate-600">Cyclone likely to make landfall in 24 hours.</p>
                    <span className="text-[8px] text-slate-400 block font-mono">13 May 2025, 06:45 AM</span>
                  </div>

                  {/* Alert 3 */}
                  <div className="bg-white p-2.5 rounded-2xl border-l-4 border-l-amber-400 border border-slate-200 shadow-2xs space-y-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center"><CloudRain size={12} /></div>
                      <span className="text-[11px] font-black text-slate-800">Heavy Rainfall</span>
                    </div>
                    <p className="text-[9px] text-slate-600">Heavy rainfall expected across coastal belts.</p>
                    <span className="text-[8px] text-slate-400 block font-mono">13 May 2025, 06:15 AM</span>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="bg-white rounded-2xl border border-slate-200 py-1.5 px-3 flex justify-between items-center text-[9px] font-bold text-slate-400">
                  <div className="flex flex-col items-center"><Radio size={12} /><span>Home</span></div>
                  <div className="flex flex-col items-center text-red-600"><Bell size={12} /><span>Alerts</span></div>
                  <div className="flex flex-col items-center"><MapPin size={12} /><span>Map</span></div>
                  <div className="flex flex-col items-center"><Phone size={12} /><span>Contacts</span></div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="text-slate-400 shrink-0"><ArrowRight size={22} strokeWidth={2.5} /></div>

            {/* 4. ALERT DETAILS */}
            <div className="flex flex-col items-center flex-1 max-w-[245px]">
              <span className="text-xs font-black text-slate-800 uppercase mb-2 tracking-wider">4. ALERT DETAILS</span>
              <div className="w-full h-[470px] rounded-[32px] bg-slate-50 p-2.5 border-4 border-slate-800 shadow-xl flex flex-col justify-between text-slate-800 relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-1 pt-1 border-b border-slate-200 pb-1">
                  <span className="text-xs font-bold text-slate-800">&larr; Alert Details</span>
                  <Share2 size={12} className="text-slate-600" />
                </div>

                {/* Hazard Graphic Card */}
                <div className="w-full h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-2.5 flex flex-col justify-between relative overflow-hidden shadow-md">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded-md">HIGH SEVERITY</span>
                    <AlertTriangle size={16} className="text-yellow-300" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black">Flood Warning</h4>
                    <p className="text-[9px] text-blue-100">Yamuna River Basin Overflow</p>
                  </div>
                </div>

                {/* Detail fields */}
                <div className="space-y-1.5 text-[9px] text-slate-600 px-1">
                  <div>
                    <span className="font-bold text-slate-800 block">Date & Time</span>
                    <span>13 May 2025, 07:30 AM</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Affected Area</span>
                    <span>Low-lying areas near Yamuna River Basin</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Description</span>
                    <p className="text-slate-600 leading-tight">Heavy rainfall may cause sudden surge in flood waters. Residents advised to evacuate immediately.</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Safety Instructions</span>
                    <p className="text-slate-600 leading-tight">&bull; Avoid low-lying areas<br />&bull; Turn off power breakers<br />&bull; Move to assigned relief shelters</p>
                  </div>
                </div>

                {/* Red CTA button */}
                <button className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md">
                  Share Alert & Broadcast
                </button>
              </div>
            </div>

            {/* Arrow */}
            <div className="text-slate-400 shrink-0"><ArrowRight size={22} strokeWidth={2.5} /></div>

            {/* 5. MAP VIEW */}
            <div className="flex flex-col items-center flex-1 max-w-[245px]">
              <span className="text-xs font-black text-slate-800 uppercase mb-2 tracking-wider">5. MAP VIEW</span>
              <div className="w-full h-[470px] rounded-[32px] bg-slate-50 p-2.5 border-4 border-slate-800 shadow-xl flex flex-col justify-between text-slate-800 relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-1 pt-1 border-b border-slate-200 pb-1">
                  <span className="text-xs font-bold text-slate-800">Geospatial Risk Map</span>
                  <div className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">Live GPS</div>
                </div>

                {/* Simulated Geographic GIS Map */}
                <div className="w-full h-[270px] rounded-2xl bg-[#E5E9F0] relative overflow-hidden border border-slate-300 shadow-inner flex items-center justify-center">
                  {/* Map Roads & Water lines */}
                  <svg className="absolute inset-0 w-full h-full stroke-slate-300 fill-none" strokeWidth="3">
                    <path d="M 0 50 Q 80 80 150 40 T 245 90" stroke="#CBD5E1" strokeWidth="6" />
                    <path d="M 40 0 Q 70 120 120 270" stroke="#93C5FD" strokeWidth="8" />
                    <path d="M 120 0 Q 140 140 245 200" stroke="#CBD5E1" strokeWidth="4" />
                  </svg>

                  {/* Red High Risk Zone */}
                  <div className="absolute top-12 left-10 w-24 h-24 rounded-full bg-red-500/30 border-2 border-red-600 flex items-center justify-center animate-pulse">
                    <AlertTriangle size={18} className="text-red-700" />
                  </div>

                  {/* Amber Moderate Zone */}
                  <div className="absolute bottom-10 right-6 w-20 h-20 rounded-full bg-amber-400/30 border-2 border-amber-500 flex items-center justify-center">
                    <AlertTriangle size={14} className="text-amber-700" />
                  </div>

                  {/* Safe Green Zone */}
                  <div className="absolute bottom-6 left-6 w-16 h-16 rounded-full bg-emerald-400/30 border-2 border-emerald-500 flex items-center justify-center">
                    <Shield size={14} className="text-emerald-700" />
                  </div>

                  {/* Map Pins */}
                  <div className="absolute top-8 right-8 text-red-600 drop-shadow-md"><MapPin size={18} fill="#DC2626" className="text-white" /></div>
                </div>

                {/* Map Legend */}
                <div className="grid grid-cols-2 gap-1 text-[9px] font-bold text-slate-700 pt-1">
                  <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-600" /> High Risk</div>
                  <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Moderate Risk</div>
                  <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Safe Shelter</div>
                  <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Water Gauge</div>
                </div>

                {/* Bottom Bar */}
                <div className="bg-white rounded-2xl border border-slate-200 py-1.5 px-3 flex justify-between items-center text-[9px] font-bold text-slate-400">
                  <div className="flex flex-col items-center"><Radio size={12} /><span>Home</span></div>
                  <div className="flex flex-col items-center"><Bell size={12} /><span>Alerts</span></div>
                  <div className="flex flex-col items-center text-red-600"><MapPin size={12} /><span>Map</span></div>
                  <div className="flex flex-col items-center"><Phone size={12} /><span>Contacts</span></div>
                </div>
              </div>
            </div>

          </div>

          {/* ===================================================================== */}
          {/* ROW 2: SCREENS 6 TO 10                                               */}
          {/* ===================================================================== */}
          <div className="flex items-center justify-between gap-3 mb-8">
            
            {/* 6. NOTIFICATIONS LOCKSCREEN */}
            <div className="flex flex-col items-center flex-1 max-w-[245px]">
              <span className="text-xs font-black text-slate-800 uppercase mb-2 tracking-wider">6. NOTIFICATIONS</span>
              <div className="w-full h-[470px] rounded-[32px] bg-gradient-to-b from-blue-900 via-slate-900 to-[#0A192F] p-3 border-4 border-slate-800 shadow-xl flex flex-col justify-between text-white relative overflow-hidden">
                {/* Clock */}
                <div className="text-center pt-5 space-y-0.5">
                  <span className="text-3xl font-black tracking-tight text-white block">10:30</span>
                  <span className="text-[10px] text-blue-200 font-semibold">Tuesday, 13 May 2025</span>
                </div>

                {/* Push Notification Cards */}
                <div className="space-y-2 my-auto">
                  {/* Alert 1 */}
                  <div className="bg-white/90 backdrop-blur-md text-slate-900 p-2.5 rounded-2xl shadow-lg border border-white/40 space-y-0.5">
                    <div className="flex items-center justify-between text-[9px] font-bold text-red-600">
                      <span className="flex items-center gap-1"><AlertTriangle size={10} /> SENTINEL EMERGENCY</span>
                      <span className="text-slate-400">now</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-900">Flood Warning in your sector</p>
                    <p className="text-[9px] text-slate-600 leading-tight">Immediate evacuation notice for river basin zones.</p>
                  </div>

                  {/* Alert 2 */}
                  <div className="bg-white/80 backdrop-blur-md text-slate-900 p-2.5 rounded-2xl shadow-lg border border-white/40 space-y-0.5">
                    <div className="flex items-center justify-between text-[9px] font-bold text-amber-600">
                      <span className="flex items-center gap-1"><CloudRain size={10} /> SENTINEL WEATHER</span>
                      <span className="text-slate-400">15m ago</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-900">Heavy Rainfall Alert</p>
                    <p className="text-[9px] text-slate-600 leading-tight">Rainfall intensity &gt; 80mm/hr detected by telemetry.</p>
                  </div>

                  {/* Alert 3 */}
                  <div className="bg-white/70 backdrop-blur-md text-slate-900 p-2.5 rounded-2xl shadow-lg border border-white/40 space-y-0.5">
                    <div className="flex items-center justify-between text-[9px] font-bold text-blue-600">
                      <span className="flex items-center gap-1"><Radio size={10} /> SENTINEL SATELLITE</span>
                      <span className="text-slate-400">1h ago</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-900">Cyclone Advisory Issued</p>
                    <p className="text-[9px] text-slate-600 leading-tight">Wind speed 110km/h tracking toward coastline.</p>
                  </div>
                </div>

                {/* Lockscreen footer */}
                <div className="text-center text-[9px] text-slate-400 pb-2">
                  <span>Swipe up to unlock &rarr;</span>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="text-slate-400 shrink-0"><ArrowRight size={22} strokeWidth={2.5} /></div>

            {/* 7. SAFETY GUIDELINES */}
            <div className="flex flex-col items-center flex-1 max-w-[245px]">
              <span className="text-xs font-black text-slate-800 uppercase mb-2 tracking-wider">7. SAFETY GUIDELINES</span>
              <div className="w-full h-[470px] rounded-[32px] bg-slate-50 p-2.5 border-4 border-slate-800 shadow-xl flex flex-col justify-between text-slate-800 relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-1 pt-1 border-b border-slate-200 pb-1">
                  <span className="text-xs font-bold text-slate-800">Safety Guidelines</span>
                  <Shield size={12} className="text-blue-600" />
                </div>

                {/* Safety steps list */}
                <div className="space-y-2 my-auto">
                  
                  <div className="bg-white p-2.5 rounded-2xl border border-slate-200 flex items-start gap-2 shadow-2xs">
                    <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Shield size={14} />
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold text-slate-900">Stay Indoors & Protected</h5>
                      <p className="text-[9px] text-slate-600 leading-tight">Remain inside structured shelter and avoid unnecessary travel.</p>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-2xl border border-slate-200 flex items-start gap-2 shadow-2xs">
                    <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Radio size={14} />
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold text-slate-900">Follow Official Broadcasts</h5>
                      <p className="text-[9px] text-slate-600 leading-tight">Adhere strictly to civil defense and municipal notifications.</p>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-2xl border border-slate-200 flex items-start gap-2 shadow-2xs">
                    <div className="w-7 h-7 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={14} />
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold text-slate-900">Prepare Emergency Kit</h5>
                      <p className="text-[9px] text-slate-600 leading-tight">Stock essential medicines, drinking water, flashlights and batteries.</p>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-2xl border border-slate-200 flex items-start gap-2 shadow-2xs">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={14} />
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold text-slate-900">Move to Higher Elevation</h5>
                      <p className="text-[9px] text-slate-600 leading-tight">Evacuate to elevated shelters if living in flood-prone valleys.</p>
                    </div>
                  </div>

                </div>

                {/* Bottom Bar */}
                <div className="bg-white rounded-2xl border border-slate-200 py-1.5 px-3 flex justify-between items-center text-[9px] font-bold text-slate-400">
                  <div className="flex flex-col items-center"><Radio size={12} /><span>Home</span></div>
                  <div className="flex flex-col items-center"><Bell size={12} /><span>Alerts</span></div>
                  <div className="flex flex-col items-center"><MapPin size={12} /><span>Map</span></div>
                  <div className="flex flex-col items-center text-red-600"><Shield size={12} /><span>Safety</span></div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="text-slate-400 shrink-0"><ArrowRight size={22} strokeWidth={2.5} /></div>

            {/* 8. EMERGENCY CONTACTS */}
            <div className="flex flex-col items-center flex-1 max-w-[245px]">
              <span className="text-xs font-black text-slate-800 uppercase mb-2 tracking-wider">8. EMERGENCY CONTACTS</span>
              <div className="w-full h-[470px] rounded-[32px] bg-slate-50 p-2.5 border-4 border-slate-800 shadow-xl flex flex-col justify-between text-slate-800 relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-1 pt-1 border-b border-slate-200 pb-1">
                  <span className="text-xs font-bold text-slate-800">Emergency Contacts</span>
                  <Phone size={12} className="text-red-600" />
                </div>

                {/* Contacts Directory */}
                <div className="space-y-1.5 my-auto">
                  
                  {/* National Emergency */}
                  <div className="bg-white p-2 rounded-2xl border border-slate-200 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xs">!</div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-900 leading-none">National Emergency</p>
                        <span className="text-xs font-black text-red-600 font-mono">112</span>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center"><Phone size={12} /></div>
                  </div>

                  {/* Police */}
                  <div className="bg-white p-2 rounded-2xl border border-slate-200 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs">+</div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-900 leading-none">Police Control Room</p>
                        <span className="text-xs font-black text-blue-600 font-mono">100</span>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Phone size={12} /></div>
                  </div>

                  {/* Ambulance */}
                  <div className="bg-white p-2 rounded-2xl border border-slate-200 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs">&hearts;</div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-900 leading-none">Medical Ambulance</p>
                        <span className="text-xs font-black text-emerald-600 font-mono">108</span>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><Phone size={12} /></div>
                  </div>

                  {/* Disaster Management */}
                  <div className="bg-white p-2 rounded-2xl border border-slate-200 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs">D</div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-900 leading-none">Disaster Helpline</p>
                        <span className="text-xs font-black text-purple-600 font-mono">1070</span>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center"><Phone size={12} /></div>
                  </div>

                  {/* Fire Services */}
                  <div className="bg-white p-2 rounded-2xl border border-slate-200 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-xs"><Flame size={12} /></div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-900 leading-none">Fire & Rescue</p>
                        <span className="text-xs font-black text-orange-500 font-mono">101</span>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center"><Phone size={12} /></div>
                  </div>

                </div>

                {/* Bottom Bar */}
                <div className="bg-white rounded-2xl border border-slate-200 py-1.5 px-3 flex justify-between items-center text-[9px] font-bold text-slate-400">
                  <div className="flex flex-col items-center"><Radio size={12} /><span>Home</span></div>
                  <div className="flex flex-col items-center"><Bell size={12} /><span>Alerts</span></div>
                  <div className="flex flex-col items-center"><MapPin size={12} /><span>Map</span></div>
                  <div className="flex flex-col items-center text-red-600"><Phone size={12} /><span>Contacts</span></div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="text-slate-400 shrink-0"><ArrowRight size={22} strokeWidth={2.5} /></div>

            {/* 9. REPORT INCIDENT */}
            <div className="flex flex-col items-center flex-1 max-w-[245px]">
              <span className="text-xs font-black text-slate-800 uppercase mb-2 tracking-wider">9. REPORT INCIDENT</span>
              <div className="w-full h-[470px] rounded-[32px] bg-slate-50 p-2.5 border-4 border-slate-800 shadow-xl flex flex-col justify-between text-slate-800 relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-1 pt-1 border-b border-slate-200 pb-1">
                  <span className="text-xs font-bold text-slate-800">Report Incident</span>
                  <Camera size={12} className="text-slate-600" />
                </div>

                {/* Form fields */}
                <div className="space-y-2 my-auto text-[9px]">
                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5">Incident Type</label>
                    <div className="bg-white p-2 rounded-xl border border-slate-200 text-slate-700 font-semibold flex justify-between items-center">
                      <span>Flood Water Inundation</span>
                      <ChevronRight size={10} className="rotate-90 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5">Incident Location</label>
                    <div className="bg-white p-2 rounded-xl border border-slate-200 text-slate-700 font-semibold flex items-center gap-1.5">
                      <MapPin size={10} className="text-red-500" />
                      <span>Yamuna Ghat Road #4</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5">Description & Urgency</label>
                    <div className="bg-white p-2 rounded-xl border border-slate-200 text-slate-500 h-16">
                      Road blocked due to overflow. 15 families stranded on rooftop.
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5">Add Evidence Photo / Video</label>
                    <div className="bg-white p-2.5 rounded-xl border-2 border-dashed border-slate-300 text-center text-slate-500 flex flex-col items-center justify-center gap-1">
                      <Camera size={16} className="text-blue-600" />
                      <span className="text-[8px] font-bold text-blue-600">Attach Live GPS Photos</span>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md">
                  Submit Incident Report
                </button>
              </div>
            </div>

            {/* Arrow */}
            <div className="text-slate-400 shrink-0"><ArrowRight size={22} strokeWidth={2.5} /></div>

            {/* 10. STAY INFORMED */}
            <div className="flex flex-col items-center flex-1 max-w-[245px]">
              <span className="text-xs font-black text-slate-800 uppercase mb-2 tracking-wider">10. STAY INFORMED</span>
              <div className="w-full h-[470px] rounded-[32px] bg-slate-50 p-2.5 border-4 border-slate-800 shadow-xl flex flex-col justify-between text-slate-800 relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-1 pt-1 border-b border-slate-200 pb-1">
                  <span className="text-xs font-bold text-slate-800">Stay Informed</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>

                {/* Megaphone vector graphic */}
                <div className="flex flex-col items-center text-center my-auto space-y-2">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
                    <Radio size={36} className="animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Stay Alert, Stay Safe!</h4>
                    <p className="text-[9px] text-slate-600 px-2 leading-tight">
                      Receive verified, zero-latency emergency broadcasts directly to protect your family and community.
                    </p>
                  </div>

                  {/* Bullet points */}
                  <div className="text-left w-full space-y-1.5 px-2 text-[9px] font-bold text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-blue-600 shrink-0" />
                      <span>Real-time Telemetry Alerts</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-blue-600 shrink-0" />
                      <span>Live Weather & Radar Feeds</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-blue-600 shrink-0" />
                      <span>Interactive Safety Instructions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-blue-600 shrink-0" />
                      <span>Verified Government Information</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="bg-white rounded-2xl border border-slate-200 py-1.5 px-3 flex justify-between items-center text-[9px] font-bold text-slate-400">
                  <div className="flex flex-col items-center"><Radio size={12} /><span>Home</span></div>
                  <div className="flex flex-col items-center"><Bell size={12} /><span>Alerts</span></div>
                  <div className="flex flex-col items-center"><MapPin size={12} /><span>Map</span></div>
                  <div className="flex flex-col items-center text-red-600"><Radio size={12} /><span>Profile</span></div>
                </div>
              </div>
            </div>

          </div>

          {/* ===================================================================== */}
          {/* POSTER FOOTER BANNER                                                  */}
          {/* ===================================================================== */}
          <div className="w-full bg-[#EEF4FF] border border-blue-200 py-3.5 px-6 rounded-2xl flex items-center justify-center gap-4 text-center shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-[#0B57D0] text-white flex items-center justify-center shadow-xs">
              <Shield size={16} />
            </div>
            <span className="text-sm font-extrabold text-[#0B3B95] tracking-wide">
              Early Warning Today, Safe Tomorrow
            </span>
            <span className="text-slate-300 font-light">|</span>
            <span className="text-xs font-bold text-slate-600 tracking-wider uppercase">
              Be Aware. Be Prepared. Stay Safe.
            </span>
          </div>

        </div>
      </div>

    </div>
  );
};
