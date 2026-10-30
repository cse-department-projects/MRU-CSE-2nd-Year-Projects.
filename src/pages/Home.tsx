import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Brain, Activity, Shield, 
  Star, HeartPulse, Stethoscope, Sparkles, Plus, Minus, ChevronRight,
  Lock, Zap, FileText, CheckCircle, Search, MessageSquare
} from 'lucide-react';

// Reusable animated counter component
const AnimatedCounter = ({ end, suffix = "", duration = 2 }: { end: number, suffix?: string, duration?: number }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / (duration * 1000), 1);
      const easeOut = 1 - Math.pow(1 - percentage, 4);
      setCount(Math.floor(end * easeOut));
      if (percentage < 1) animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  return <span>{count}{suffix}</span>;
};

// FAQ Item Component
const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-gray-200/50 py-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none group"
      >
        <span className="text-lg font-poppins font-semibold text-slate-900 group-hover:text-primary transition-colors">{question}</span>
        <div className={`p-2 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-primary text-white rotate-180 shadow-md' : 'bg-gray-50 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pt-4 text-slate-600 leading-relaxed pr-12 font-medium">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Home() {
  const { scrollYProgress } = useScroll();
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const opacityFade = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 50; 
      const y = (clientY / innerHeight - 0.5) * 50;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="bg-[#fafafa] overflow-hidden relative selection:bg-primary/20 selection:text-primary font-inter">
      
      {/* ----------------- ULTRA PREMIUM HERO SECTION ----------------- */}
      <section ref={heroRef} id="home" className="relative min-h-[85vh] flex flex-col justify-center pt-24 pb-16 overflow-hidden">
        {/* Subtle Linear/Vercel Grid Background with Medical Accents */}
        <motion.div 
          animate={{ backgroundPosition: ["0px 0px", "40px 40px"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLCAwLCAwLCAwLjA0KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] pointer-events-none" 
        />
        
        {/* Volumetric Soft Lighting */}
        <div className="absolute top-[15%] left-[20%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-multiply opacity-50 animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-[20%] right-[15%] w-[450px] h-[450px] bg-teal-400/20 rounded-full blur-[120px] mix-blend-multiply opacity-40 pointer-events-none" />
        <div className="absolute top-[10%] right-[30%] w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-multiply opacity-40 pointer-events-none" />

        {/* Floating Background Particles (Cells/Neural) */}
        <motion.div 
          animate={{ y: [0, -15, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] left-[10%] w-3 h-3 bg-red-400/40 rounded-full blur-[2px] pointer-events-none"
        />
        <motion.div 
          animate={{ y: [0, 20, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[40%] right-[10%] w-4 h-4 bg-teal-400/40 rounded-full blur-[2px] pointer-events-none"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Hero Text Content */}
            <div className="w-full lg:w-[48%] flex flex-col items-center lg:items-start text-center lg:text-left z-20 mt-4 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center space-x-2 bg-white/70 backdrop-blur-md border border-gray-200/40 rounded-full px-3 py-1 shadow-sm mb-5 hover:shadow transition-all cursor-default"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">HealthSphere 2.0</span>
                <ChevronRight className="w-3 h-3 text-gray-400" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl sm:text-5xl lg:text-[3.5rem] font-poppins font-bold leading-[1.1] text-slate-900 tracking-[-0.02em]"
              >
                Intelligent <br />
                <span className="relative inline-block mt-0.5">
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">Healthcare.</span>
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="mt-4 text-base text-slate-500 max-w-md font-medium leading-relaxed"
              >
                A radically better way to manage your vitals, medical records, and AI-driven diagnostics in one unified, beautiful workspace.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6 flex flex-col sm:flex-row gap-3 w-full justify-center lg:justify-start"
              >
                <Link to="/register" className="w-full sm:w-auto">
                  <button className="w-full flex items-center justify-center space-x-2 px-5 py-2.5 rounded-full font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 shadow-[0_4px_14px_rgb(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgb(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-300">
                    <span>Start Your Journey</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <button className="w-full flex items-center justify-center px-5 py-2.5 rounded-full font-bold text-sm bg-white text-slate-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm transition-all duration-300">
                    Sign In
                  </button>
                </Link>
              </motion.div>

              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ duration: 0.8, delay: 0.4 }}
                 className="mt-10 flex items-center gap-6 text-left"
              >
                 <div className="flex flex-col">
                    <div className="text-xl font-poppins font-bold text-slate-900"><AnimatedCounter end={99} suffix="%" /></div>
                    <div className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">Diagnostic Accuracy</div>
                 </div>
                 <div className="w-px h-6 bg-gray-200"></div>
                 <div className="flex flex-col">
                    <div className="text-xl font-poppins font-bold text-slate-900"><AnimatedCounter end={24} suffix="/7" /></div>
                    <div className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">AI Access</div>
                 </div>
              </motion.div>
            </div>
            
            {/* Enhanced 3D Visual Bounding Box & Floating Elements */}
            <div className="w-full lg:w-[52%] relative h-[450px] flex items-center justify-center lg:justify-end mt-4 lg:mt-0 perspective-1000">
               <motion.div 
                 className="relative w-full max-w-[420px] aspect-square z-10 flex items-center justify-center transform-gpu"
                 animate={{ 
                    rotateX: mousePosition.y * -0.15, 
                    rotateY: mousePosition.x * 0.15,
                    x: mousePosition.x * 0.3, 
                    y: mousePosition.y * 0.3 
                 }}
                 transition={{ type: "spring", stiffness: 50, damping: 25 }}
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/70 to-white/20 backdrop-blur-xl border border-white/80 rounded-[32px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,1)] flex items-center justify-center overflow-hidden group">
                     {/* Floating Medical Grid/ECG Background */}
                     <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDUgTCAyMCA1IE0gNSAwIEwgNSAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] pointer-events-none" />
                     
                     {/* Core Anatomical Visual */}
                     <div className="relative z-20 flex items-center justify-center w-full h-full">
                       <div className="absolute inset-0 bg-rose-400/20 blur-[50px] rounded-full scale-[1.2] animate-pulse-slow"></div>
                       <motion.img 
                         src="/src/assets/heart_3d.png" 
                         alt="Heart Model" 
                         className="w-48 h-48 object-contain relative z-10 drop-shadow-xl"
                         animate={{ y: [0, -8, 0], scale: [1, 1.02, 1] }}
                         transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                       />
                     </div>
                  </div>

                  {/* 3D Decorative Assets - DNA */}
                  <motion.img 
                    src="/src/assets/dna_3d.png"
                    alt="DNA"
                    className="absolute -top-6 left-10 w-20 h-20 object-contain z-30 drop-shadow-md blur-[0.5px]"
                    animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  />

                  {/* 3D Decorative Assets - Capsule */}
                  <motion.img 
                    src="/src/assets/capsule_3d.png"
                    alt="Capsule"
                    className="absolute top-1/4 -right-10 w-16 h-16 object-contain z-30 drop-shadow-md blur-[1px] opacity-90"
                    animate={{ y: [0, 10, 0], rotate: [0, -10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  />

                  {/* 3D Decorative Assets - Medical Cross */}
                  <motion.img 
                    src="/src/assets/medical_cross_3d.png"
                    alt="Medical Cross"
                    className="absolute bottom-10 -left-8 w-14 h-14 object-contain z-30 drop-shadow-md blur-[0.5px]"
                    animate={{ y: [0, 8, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                  />

                  {/* Floating Glass UI Cards */}
                  <motion.div 
                    className="absolute top-[20%] -left-[15%] bg-white/80 backdrop-blur-xl border border-white p-3 rounded-2xl shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] z-40 flex items-center gap-3"
                    animate={{ x: mousePosition.x * -0.8, y: mousePosition.y * -0.8 }}
                    transition={{ type: "spring", stiffness: 40, damping: 20 }}
                  >
                    <div className="w-8 h-8 bg-rose-50 rounded-full flex items-center justify-center">
                      <HeartPulse className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Vitals Status</p>
                      <p className="text-sm font-poppins font-bold text-slate-900">Optimal</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="absolute bottom-[25%] -right-[15%] bg-white/80 backdrop-blur-xl border border-white p-3 rounded-2xl shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] z-40 flex items-center gap-3"
                    animate={{ x: mousePosition.x * 1.2, y: mousePosition.y * 1.2 }}
                    transition={{ type: "spring", stiffness: 40, damping: 20 }}
                  >
                    <div className="w-8 h-8 bg-teal-50 rounded-full flex items-center justify-center">
                      <Brain className="w-4 h-4 text-teal-500" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">AI Analysis</p>
                      <p className="text-sm font-poppins font-bold text-slate-900">Processing</p>
                    </div>
                  </motion.div>
                  
               </motion.div>
            </div>
          </div>
        </div>

        {/* Mouse Scroll Indicator */}
        <motion.div 
          style={{ opacity: opacityFade }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center pointer-events-none"
        >
          <motion.div 
            animate={{ y: [0, 8, 0] }} 
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 rounded-full border-2 border-slate-300 flex justify-center p-1"
          >
            <div className="w-1 h-2 bg-slate-400 rounded-full"></div>
          </motion.div>
        </motion.div>
      </section>

      {/* ----------------- LOGO CLOUD ----------------- */}
      <section className="py-8 bg-white border-y border-gray-100 relative z-20">
        <div className="max-w-7xl mx-auto px-4 overflow-hidden">
          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Trusted by leading healthcare innovators</p>
          <div className="flex justify-center items-center gap-8 sm:gap-16 flex-wrap opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="text-lg font-poppins font-bold flex items-center text-slate-800"><Activity className="mr-1.5 w-5 h-5"/> MedTech</div>
             <div className="text-lg font-poppins font-bold flex items-center text-slate-800"><HeartPulse className="mr-1.5 w-5 h-5"/> CarePlus</div>
             <div className="text-lg font-poppins font-bold flex items-center text-slate-800"><Stethoscope className="mr-1.5 w-5 h-5"/> VitalsMD</div>
             <div className="text-lg font-poppins font-bold flex items-center text-slate-800"><Shield className="mr-1.5 w-5 h-5"/> SecureHealth</div>
          </div>
        </div>
      </section>

      {/* ----------------- FEATURE GRID (Linear Style) ----------------- */}
      <section id="features" className="py-20 bg-[#fafafa] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-slate-900 mb-4 tracking-tight">Built for modern health.</h2>
            <p className="text-lg text-slate-500 font-medium">An ecosystem of tools designed to bring clarity to your health data, powered by advanced AI and intuitive design.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
             {/* Feature 1 */}
             <motion.div whileHover={{ y: -2 }} className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col relative overflow-hidden group">
               <div className="w-10 h-10 bg-slate-50 border border-gray-100 rounded-xl flex items-center justify-center mb-4">
                 <Brain className="w-5 h-5 text-primary" />
               </div>
               <h3 className="text-lg font-poppins font-bold text-slate-900 mb-2">Intelligent Diagnostics</h3>
               <p className="text-sm text-slate-500 leading-relaxed font-medium">Upload medical PDFs and our AI extracts critical values, creating plain-language summaries and tracking trends over time.</p>
               <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
             </motion.div>

             {/* Feature 2 */}
             <motion.div whileHover={{ y: -2 }} className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col relative overflow-hidden group">
               <div className="w-10 h-10 bg-slate-50 border border-gray-100 rounded-xl flex items-center justify-center mb-4">
                 <Lock className="w-5 h-5 text-emerald-500" />
               </div>
               <h3 className="text-lg font-poppins font-bold text-slate-900 mb-2">Enterprise Security</h3>
               <p className="text-sm text-slate-500 leading-relaxed font-medium">Your medical data is protected with AES-256 encryption. We adhere strictly to HIPAA compliance standards.</p>
               <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
             </motion.div>

             {/* Feature 3 */}
             <motion.div whileHover={{ y: -2 }} className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col relative overflow-hidden group">
               <div className="w-10 h-10 bg-slate-50 border border-gray-100 rounded-xl flex items-center justify-center mb-4">
                 <Zap className="w-5 h-5 text-amber-500" />
               </div>
               <h3 className="text-lg font-poppins font-bold text-slate-900 mb-2">Real-time Sync</h3>
               <p className="text-sm text-slate-500 leading-relaxed font-medium">Connect Apple Health and Garmin to pipe your live vitals directly into your interactive dashboard.</p>
               <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
             </motion.div>
          </div>
        </div>
      </section>

      {/* ----------------- AI ASSISTANT SHOWCASE ----------------- */}
      <section className="py-20 bg-white border-y border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="w-full lg:w-1/2 order-2 lg:order-1 relative perspective-1000">
               <div className="w-full h-[400px] bg-slate-900 rounded-[32px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] overflow-hidden relative transform-gpu rotate-y-[-2deg] rotate-x-[2deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-500 p-6 flex flex-col">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />
                 
                 {/* Mock AI Chat Interface */}
                 <div className="flex items-center space-x-2 mb-6 border-b border-white/10 pb-3">
                   <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-md">
                     <Sparkles className="w-4 h-4 text-primary" />
                   </div>
                   <span className="text-base font-poppins font-bold text-white">HealthAI Assistant</span>
                 </div>

                 <div className="flex-1 space-y-4">
                   <div className="flex justify-end">
                     <div className="bg-primary text-white px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[85%] text-sm font-medium shadow-sm">
                       Can you explain my recent cholesterol results?
                     </div>
                   </div>
                   <div className="flex justify-start">
                     <div className="bg-white/10 backdrop-blur-md text-white px-4 py-3 rounded-2xl rounded-tl-sm max-w-[90%] text-sm font-medium border border-white/10 shadow-sm leading-relaxed">
                       <p>Based on your uploaded report from Oct 24th, your LDL is <strong>110 mg/dL</strong> (slightly elevated) and HDL is <strong>55 mg/dL</strong> (optimal).</p>
                       <p className="mt-1.5 text-slate-300">I recommend increasing your omega-3 intake. Would you like a suggested meal plan?</p>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
            
            <div className="w-full lg:w-1/2 order-1 lg:order-2 lg:pl-6">
              <div className="inline-flex items-center space-x-2 bg-slate-50 rounded-full px-3 py-1 mb-4 border border-slate-100">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Conversational AI</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-slate-900 mb-4 tracking-tight">Your personal medical intelligence.</h2>
              <p className="text-lg text-slate-500 font-medium leading-relaxed mb-6">
                Ask questions about your health, get explanations for complex lab results, and receive personalized lifestyle recommendations—all securely processed by our advanced healthcare AI.
              </p>
              <ul className="space-y-3 mb-8">
                {['Analyzes PDF lab reports instantly', 'Context-aware of your medical history', 'Evidence-based recommendations'].map((item, i) => (
                  <li key={i} className="flex items-center text-sm text-slate-700 font-semibold">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-2.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <button className="flex items-center space-x-2 px-6 py-3 rounded-full font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm">
                  <span>Try AI Assistant</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- MEDICAL REPORTS & DOCTOR FINDER PREVIEWS ----------------- */}
      <section className="py-20 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          
          {/* Reports Preview */}
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="w-full lg:w-1/2 pr-0 lg:pr-8">
              <div className="inline-flex items-center space-x-2 bg-blue-50/80 rounded-full px-3 py-1 mb-4 border border-blue-100/50">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Document Parsing</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-slate-900 mb-4 tracking-tight">Decipher any lab result instantly.</h2>
              <p className="text-lg text-slate-500 font-medium leading-relaxed mb-6">
                Upload your PDFs. Our OCR and NLP models extract biomarkers, flag abnormalities, and map your historical data to beautiful trend charts automatically.
              </p>
              <Link to="/register">
                <button className="flex items-center font-bold text-sm text-primary hover:text-blue-700 transition-colors">
                  Explore Reports <ArrowRight className="w-4 h-4 ml-1.5" />
                </button>
              </Link>
            </div>
            <div className="w-full lg:w-1/2">
               <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                 <h4 className="font-poppins font-bold text-base mb-4 text-slate-800">Extracted Biomarkers</h4>
                 <div className="space-y-2.5 relative z-10">
                   {[
                     { name: 'Hemoglobin', value: '14.2 g/dL', status: 'Normal', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                     { name: 'LDL Cholesterol', value: '135 mg/dL', status: 'Borderline', color: 'text-amber-600', bg: 'bg-amber-50' },
                     { name: 'Vitamin D', value: '28 ng/mL', status: 'Low', color: 'text-rose-600', bg: 'bg-rose-50' },
                   ].map((item, idx) => (
                     <div key={idx} className="flex justify-between items-center p-3 border border-gray-100/60 rounded-xl hover:border-gray-200 transition-colors bg-white">
                       <span className="font-semibold text-sm text-slate-700">{item.name}</span>
                       <div className="flex items-center space-x-3">
                         <span className="font-bold text-sm text-slate-900">{item.value}</span>
                         <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-bold ${item.bg} ${item.color}`}>{item.status}</span>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </div>

          {/* Doctors Preview */}
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="w-full lg:w-1/2 order-2 lg:order-1">
               <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                 <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-50 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                 
                 <div className="flex items-center space-x-2.5 mb-5 bg-slate-50/50 p-1.5 rounded-xl border border-gray-100/80 relative z-10">
                   <div className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100"><Search className="w-4 h-4 text-slate-400" /></div>
                   <input type="text" placeholder="Search by specialty..." className="bg-transparent border-none focus:outline-none text-xs font-semibold flex-1 text-slate-600" disabled />
                 </div>

                 <div className="space-y-3 relative z-10">
                   <div className="flex items-center p-3 border border-gray-100/60 rounded-xl hover:border-emerald-100 transition-colors cursor-default bg-white">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg mr-3 overflow-hidden">
                        <img src="/src/assets/doctor_3d.png" alt="Doctor" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-slate-900">Dr. Sarah Jenkins</h4>
                        <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Cardiology • 15 yrs exp</p>
                      </div>
                      <div className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                        <Star className="w-3 h-3 mr-1 fill-current" /> 4.9
                      </div>
                   </div>
                 </div>
               </div>
            </div>
            <div className="w-full lg:w-1/2 order-1 lg:order-2 lg:pl-8">
              <div className="inline-flex items-center space-x-2 bg-emerald-50/80 rounded-full px-3 py-1 mb-4 border border-emerald-100/50">
                <Search className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Doctor Network</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-slate-900 mb-4 tracking-tight">Find the right specialist.</h2>
              <p className="text-lg text-slate-500 font-medium leading-relaxed mb-6">
                Search our verified network of top-tier medical professionals. Book appointments, share your AI-generated health summaries, and get second opinions easily.
              </p>
              <Link to="/register">
                <button className="flex items-center font-bold text-sm text-emerald-600 hover:text-emerald-700 transition-colors">
                  Browse Doctors <ArrowRight className="w-4 h-4 ml-1.5" />
                </button>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ----------------- STATISTICS & SOCIAL PROOF ----------------- */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="pt-6 md:pt-0">
              <div className="text-4xl font-poppins font-bold text-white mb-1"><AnimatedCounter end={2} suffix="M+" /></div>
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Reports Analyzed</p>
            </div>
            <div className="pt-6 md:pt-0">
              <div className="text-4xl font-poppins font-bold text-white mb-1"><AnimatedCounter end={500} suffix="k" /></div>
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Active Users</p>
            </div>
            <div className="pt-6 md:pt-0">
              <div className="text-4xl font-poppins font-bold text-white mb-1"><AnimatedCounter end={99} suffix="%" /></div>
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Uptime Reliability</p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- FAQ ----------------- */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-1">
             <FAQItem 
               question="Is my medical data secure?" 
               answer="Absolutely. We use military-grade AES-256 encryption. Your data is HIPAA compliant, encrypted at rest and in transit, and we never sell your personal information to third parties." 
             />
             <FAQItem 
               question="How accurate is the AI Assistant?" 
               answer="Our AI models are trained on validated medical literature and fine-tuned for high accuracy. However, they are designed to assist and inform, not to replace professional medical diagnosis." 
             />
             <FAQItem 
               question="Can I share reports with my doctor?" 
               answer="Yes, you can generate secure, time-limited, and password-protected links to share your AI-summarized medical reports directly with your healthcare provider." 
             />
             <FAQItem 
               question="Which smartwatches are supported?" 
               answer="Currently, HealthSphere syncs seamlessly with Apple Health, Google Fit, Garmin Connect, and Oura Ring via our mobile companion app." 
             />
          </div>
        </div>
      </section>

      {/* ----------------- PRE-FOOTER CTA ----------------- */}
      <section className="py-24 bg-[#fafafa] relative overflow-hidden text-center">
        <div className="max-w-3xl mx-auto px-4 relative z-10">
           <h2 className="text-4xl md:text-5xl font-poppins font-bold mb-4 text-slate-900 tracking-tight">Ready for clarity?</h2>
           <p className="text-lg text-slate-500 mb-8 max-w-xl mx-auto font-medium">Join thousands of early adopters experiencing the next generation of personal health management today.</p>
           
           <Link to="/register">
             <button className="px-8 py-4 rounded-full font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-300">
               Create Free Account
             </button>
           </Link>
        </div>
      </section>

      {/* ----------------- PROFESSIONAL FOOTER ----------------- */}
      <footer className="bg-white pt-16 pb-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
            <div className="col-span-2 pr-8">
               <div className="flex items-center space-x-2 mb-4">
                 <div className="p-1.5 bg-primary/10 rounded-lg">
                   <Activity className="h-5 w-5 text-primary" />
                 </div>
                 <span className="text-lg font-poppins font-bold text-slate-900">HealthSphere</span>
               </div>
               <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs">
                 The premium AI healthcare companion designed for the modern world. Take control of your health with intelligent insights.
               </p>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-[11px]">Product</h4>
              <ul className="space-y-3 text-sm font-semibold text-slate-500">
                <li className="hover:text-primary cursor-pointer transition-colors">Features</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Security</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Pricing</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Updates</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-[11px]">Company</h4>
              <ul className="space-y-3 text-sm font-semibold text-slate-500">
                <li className="hover:text-primary cursor-pointer transition-colors">About Us</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Careers</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Contact</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Blog</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-[11px]">Legal</h4>
              <ul className="space-y-3 text-sm font-semibold text-slate-500">
                <li className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-primary cursor-pointer transition-colors">HIPAA Compliance</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 font-bold">
            <p>© 2026 HealthSphere Inc. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="hover:text-slate-700 cursor-pointer transition-colors">Twitter</span>
              <span className="hover:text-slate-700 cursor-pointer transition-colors">LinkedIn</span>
              <span className="hover:text-slate-700 cursor-pointer transition-colors">GitHub</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
