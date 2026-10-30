import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Heart, Thermometer, Wind, Droplets, 
  Moon, X, AlertCircle, Sparkles, UploadCloud, 
  Search, Flame, Scale, Footprints, Weight,
  CheckCircle2, Circle, CloudSun, Calendar as CalIcon,
  ChevronDown, Download, BrainCircuit,
  FileSignature
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// Use the local 3D asset for the Hero section
import dnaImg from '../assets/dna_3d.png';

// -----------------------------------------------------------------------------
// MOCK DATA
// -----------------------------------------------------------------------------
const chartData = [
  { name: 'Mon', hr: 72, sleep: 7.5, steps: 6000 },
  { name: 'Tue', hr: 74, sleep: 6.8, steps: 8500 },
  { name: 'Wed', hr: 71, sleep: 8.1, steps: 10200 },
  { name: 'Thu', hr: 73, sleep: 7.2, steps: 7800 },
  { name: 'Fri', hr: 70, sleep: 7.9, steps: 11000 },
  { name: 'Sat', hr: 68, sleep: 8.5, steps: 14000 },
  { name: 'Sun', hr: 72, sleep: 8.0, steps: 9500 },
];

const metrics = [
  { id: 'hr', title: 'Heart Rate', value: '72', unit: 'bpm', icon: Heart, iconColor: 'text-rose-500', iconBg: 'bg-rose-100/50', border: 'border-rose-100', shadow: 'shadow-rose-500/20', trend: '+2%', status: 'Normal', desc: 'Resting heart rate optimal.' },
  { id: 'bp', title: 'Blood Pressure', value: '120/80', unit: 'mmHg', icon: Activity, iconColor: 'text-blue-500', iconBg: 'bg-blue-100/50', border: 'border-blue-100', shadow: 'shadow-blue-500/20', trend: 'Stable', status: 'Optimal', desc: 'Blood pressure is perfectly stable.' },
  { id: 'o2', title: 'Oxygen Level', value: '98', unit: '%', icon: Wind, iconColor: 'text-teal-500', iconBg: 'bg-teal-100/50', border: 'border-teal-100', shadow: 'shadow-teal-500/20', trend: '+1%', status: 'Excellent', desc: 'SpO2 levels indicate excellent respiratory function.' },
  { id: 'temp', title: 'Body Temp', value: '36.6', unit: '°C', icon: Thermometer, iconColor: 'text-amber-500', iconBg: 'bg-amber-100/50', border: 'border-amber-100', shadow: 'shadow-amber-500/20', trend: '-0.2°', status: 'Normal', desc: 'Core temperature is normal.' },
  { id: 'sleep', title: 'Sleep Quality', value: '7.5', unit: 'hrs', icon: Moon, iconColor: 'text-indigo-500', iconBg: 'bg-indigo-100/50', border: 'border-indigo-100', shadow: 'shadow-indigo-500/20', trend: '+15%', status: 'Good', desc: 'Deep sleep increased by 15% last night.' },
  { id: 'steps', title: 'Daily Steps', value: '8,432', unit: 'steps', icon: Footprints, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-100/50', border: 'border-emerald-100', shadow: 'shadow-emerald-500/20', trend: '+12%', status: 'On Track', desc: '1,500 steps away from daily goal.' },
  { id: 'water', title: 'Water Intake', value: '1.8', unit: 'L', icon: Droplets, iconColor: 'text-cyan-500', iconBg: 'bg-cyan-100/50', border: 'border-cyan-100', shadow: 'shadow-cyan-500/20', trend: '-0.2L', status: 'Attention', desc: 'Drink 2 more glasses today.' },
  { id: 'cals', title: 'Calories Burned', value: '2,140', unit: 'kcal', icon: Flame, iconColor: 'text-orange-500', iconBg: 'bg-orange-100/50', border: 'border-orange-100', shadow: 'shadow-orange-500/20', trend: '+5%', status: 'Optimal', desc: 'Active metabolism is burning well.' },
  { id: 'bmi', title: 'Current BMI', value: '22.4', unit: 'kg/m²', icon: Scale, iconColor: 'text-fuchsia-500', iconBg: 'bg-fuchsia-100/50', border: 'border-fuchsia-100', shadow: 'shadow-fuchsia-500/20', trend: 'Stable', status: 'Healthy', desc: 'BMI is strictly within the healthy target range.' },
  { id: 'weight', title: 'Body Weight', value: '71.2', unit: 'kg', icon: Weight, iconColor: 'text-violet-500', iconBg: 'bg-violet-100/50', border: 'border-violet-100', shadow: 'shadow-violet-500/20', trend: '-0.5kg', status: 'Stable', desc: 'Maintaining target weight smoothly.' }
];

const quickActions = [
  { name: 'Upload Report', icon: UploadCloud, path: '/dashboard/reports', bg: 'bg-gradient-to-br from-blue-400 to-blue-600', shadow: 'shadow-blue-500/30' },
  { name: 'Ask AI', icon: Sparkles, path: '/dashboard/ai', bg: 'bg-gradient-to-br from-indigo-400 to-indigo-600', shadow: 'shadow-indigo-500/30' },
  { name: 'Find Doctor', icon: Search, path: '/dashboard/doctors', bg: 'bg-gradient-to-br from-teal-400 to-teal-600', shadow: 'shadow-teal-500/30' },
  { name: 'Body Explorer', icon: Activity, path: '/dashboard/anatomy', bg: 'bg-gradient-to-br from-rose-400 to-rose-600', shadow: 'shadow-rose-500/30' }
];

const schedule = [
  { id: 1, time: '08:00 AM', title: 'Take Vitamin D3', type: 'Medication', status: 'done', detail: 'Take 1 pill after breakfast with water.' },
  { id: 2, time: '10:30 AM', title: 'Dr. Sarah Jenkins', type: 'Cardiology', status: 'pending', detail: 'Follow-up on ECG results. Location: Mount Sinai Hospital, Floor 3.' },
  { id: 3, time: '02:00 PM', title: 'Take Amoxicillin', type: 'Medication', status: 'pending', detail: 'Take 1 pill after lunch. Must complete the 7-day course.' }
];

const reports = [
  { id: 1, name: 'Comprehensive Blood Test', date: 'Oct 12, 2026', type: 'Lab Report', doctor: 'Dr. Emily Chen' },
  { id: 2, name: 'Cardiology ECG Analysis', date: 'Oct 05, 2026', type: 'Cardiology', doctor: 'Dr. Sarah Jenkins' }
];

// -----------------------------------------------------------------------------
// COMPONENTS
// -----------------------------------------------------------------------------

// Smooth count-up animation for numeric values
const AnimatedCounter = ({ value }: { value: string }) => {
  const numValue = parseFloat(value.replace(/,/g, ''));
  if (isNaN(numValue)) return <>{value}</>;
  
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    let startTimestamp: number | null = null;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // EaseOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(start + (numValue - start) * ease);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [numValue]);
  
  const formatted = value.includes(',') 
    ? Math.floor(count).toLocaleString() 
    : value.includes('.') ? count.toFixed(1) : Math.floor(count);
    
  return <>{formatted}</>;
};

// Subtle background with grid and slow floating particles
const BackgroundEffects = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Light blue medical gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f8fafc] via-[#eff6ff] to-[#f0f9ff] opacity-80" />
      
      {/* Animated medical grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: 'linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)', 
          backgroundSize: '40px 40px',
          backgroundPosition: 'center center'
        }}
      />
      
      {/* Soft floating glow orbs */}
      <motion.div 
        animate={{ y: [0, -30, 0], x: [0, 20, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[15%] w-[400px] h-[400px] bg-blue-300/20 rounded-full blur-[100px]"
      />
      <motion.div 
        animate={{ y: [0, 40, 0], x: [0, -30, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-indigo-300/20 rounded-full blur-[120px]"
      />
      
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ 
            y: ['0vh', '-100vh'],
            opacity: [0, 0.6, 0]
          }}
          transition={{ 
            duration: Math.random() * 20 + 20, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 10
          }}
          className="absolute w-1 h-1 bg-blue-400 rounded-full blur-[1px]"
          style={{ 
            left: `${Math.random() * 100}%`,
            top: '100%'
          }}
        />
      ))}
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  
  const [activeChartTab, setActiveChartTab] = useState('Heart Rate');
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  
  // AI Insight State
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(true);
  
  // Schedule & Report State
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [previewReport, setPreviewReport] = useState<any>(null);
  const [selectedMetric, setSelectedMetric] = useState<any>(null);

  useEffect(() => {
    // Current Date/Time
    const updateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 60000);
    
    // AI Analysis simulation
    const aiTimer = setTimeout(() => setIsAiAnalyzing(false), 2000);
    
    return () => {
      clearInterval(clockInterval);
      clearTimeout(aiTimer);
    };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getChartDataKey = () => {
    if (activeChartTab === 'Heart Rate') return 'hr';
    if (activeChartTab === 'Sleep') return 'sleep';
    if (activeChartTab === 'Steps') return 'steps';
    return 'hr';
  };

  const getChartColor = () => {
    if (activeChartTab === 'Heart Rate') return '#f43f5e';
    if (activeChartTab === 'Sleep') return '#6366f1';
    if (activeChartTab === 'Steps') return '#10b981';
    return '#f43f5e';
  };

  return (
    <div className="relative min-h-screen pb-12 overflow-x-hidden font-inter bg-slate-50">
      <BackgroundEffects />
      
      <div className="relative z-10 max-w-[1400px] mx-auto space-y-8 px-4 md:px-8 pt-6">
        
        {/* Premium Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative bg-white/60 backdrop-blur-2xl border border-blue-50/80 rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgba(37,99,235,0.06)] overflow-hidden flex flex-col md:flex-row justify-between items-center"
        >
          <div className="relative z-10 w-full md:w-2/3">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-xs font-bold text-slate-600 flex items-center bg-white/80 px-4 py-1.5 rounded-full shadow-sm border border-blue-100/50 backdrop-blur-md">
                <CalIcon className="w-3.5 h-3.5 mr-2 text-blue-500" /> {currentDate}
              </span>
              <span className="text-xs font-bold text-slate-600 flex items-center bg-white/80 px-4 py-1.5 rounded-full shadow-sm border border-blue-100/50 backdrop-blur-md">
                <ClockIcon className="w-3.5 h-3.5 mr-2 text-indigo-500" /> {currentTime}
              </span>
              <span className="text-xs font-bold text-slate-600 flex items-center bg-white/80 px-4 py-1.5 rounded-full shadow-sm border border-blue-100/50 backdrop-blur-md">
                <CloudSun className="w-3.5 h-3.5 mr-2 text-amber-500" /> 22°C Clear
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-poppins font-bold text-slate-900 tracking-tight mb-2">
              {getGreeting()} 👋
            </h1>
            <p className="text-slate-500 text-lg font-medium max-w-xl leading-relaxed">
              Welcome to your health intelligence center. Your vitals are optimal and AI analysis is up to date.
            </p>
          </div>
          
          {/* Decorative Floating Element */}
          <div className="hidden md:block absolute right-[-5%] top-[-20%] w-[400px] h-[400px] pointer-events-none">
             <div className="absolute inset-0 bg-blue-400/10 rounded-full blur-[60px]"></div>
             <motion.img 
               src={dnaImg} 
               alt="DNA Decoration" 
               className="w-full h-full object-contain opacity-90 drop-shadow-2xl"
               animate={{ y: [0, -15, 0], rotate: [0, 2, 0] }}
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
             />
          </div>
        </motion.div>

        {/* Quick Actions Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
           {quickActions.map((action, idx) => (
             <motion.div 
               key={action.name}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ delay: idx * 0.1, duration: 0.5 }}
               whileHover={{ scale: 1.02, y: -4 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => navigate(action.path)}
               className="bg-white/70 backdrop-blur-xl border border-blue-50 rounded-[24px] p-5 flex items-center space-x-4 shadow-[0_8px_20px_rgba(37,99,235,0.04)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.08)] transition-all cursor-pointer group relative overflow-hidden"
             >
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
               <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center text-white ${action.bg} shadow-lg ${action.shadow} group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                 <action.icon className="w-5 h-5" />
               </div>
               <div className="relative z-10">
                 <h3 className="font-bold text-sm text-slate-800">{action.name}</h3>
               </div>
             </motion.div>
           ))}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left/Middle Column (Metrics & Charts) */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Health Metrics Grid (10 Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
              {metrics.map((metric, idx) => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  onClick={() => setSelectedMetric(metric)}
                  className="bg-white/70 backdrop-blur-xl border border-blue-50/80 p-5 rounded-[24px] relative overflow-hidden group hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.12)] hover:-translate-y-1.5 transition-all duration-400 cursor-pointer"
                >
                   {/* Background hover glow */}
                   <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${metric.iconBg.replace('/50', '')}`} />
                   
                   {/* Subtle border glow on hover */}
                   <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 border-2 rounded-[24px] transition-opacity duration-500 pointer-events-none ${metric.border}`} />

                   <div className="flex justify-between items-start mb-4 relative z-10">
                     <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center border border-white shadow-sm ${metric.iconBg} group-hover:shadow-md group-hover:scale-110 transition-all duration-300`}>
                       <metric.icon className={`w-5 h-5 ${metric.iconColor} group-hover:animate-pulse`} />
                     </div>
                     <motion.span 
                       initial={{ scale: 0.8, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       transition={{ delay: 0.5 }}
                       className="text-[10px] font-bold text-slate-600 bg-white/80 backdrop-blur-sm border border-slate-100/80 px-2 py-0.5 rounded-md shadow-sm"
                     >
                       {metric.trend}
                     </motion.span>
                   </div>
                   <div className="relative z-10">
                     <p className="text-xs font-semibold text-slate-500 mb-1 line-clamp-1">{metric.title}</p>
                     <div className="flex items-baseline space-x-1">
                       <span className="text-2xl font-poppins font-bold text-slate-900 tracking-tight">
                         <AnimatedCounter value={metric.value} />
                       </span>
                       <span className="text-[10px] font-bold text-slate-400">{metric.unit}</span>
                     </div>
                   </div>
                </motion.div>
              ))}
            </div>

            {/* Interactive Trends Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white/70 backdrop-blur-2xl border border-blue-50/80 rounded-[32px] p-6 shadow-[0_8px_30px_rgba(37,99,235,0.04)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.08)] transition-shadow duration-500"
            >
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <div>
                    <h3 className="font-poppins font-bold text-xl text-slate-900 flex items-center">
                      <Activity className="w-5 h-5 text-blue-500 mr-2" />
                      Health Trends
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">Monitor your vital progression over time.</p>
                  </div>
                  <div className="mt-4 sm:mt-0 flex space-x-2 bg-white/80 p-1.5 rounded-xl border border-blue-50 shadow-sm backdrop-blur-md">
                    {['Heart Rate', 'Sleep', 'Steps'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveChartTab(tab)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-[10px] transition-all duration-300 ${
                          activeChartTab === tab 
                          ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' 
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
               </div>
               
               <div className="h-[300px] w-full">
                 <AnimatePresence mode="wait">
                   <motion.div
                     key={activeChartTab}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     transition={{ duration: 0.3 }}
                     className="h-full w-full"
                   >
                     <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                         <defs>
                           <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor={getChartColor()} stopOpacity={0.4}/>
                             <stop offset="95%" stopColor={getChartColor()} stopOpacity={0}/>
                           </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
                         <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
                         <Tooltip 
                           contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}
                           labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                           itemStyle={{ fontWeight: 'bold' }}
                           cursor={{ stroke: getChartColor(), strokeWidth: 1, strokeDasharray: '4 4' }}
                         />
                         <Area 
                           type="monotone" 
                           dataKey={getChartDataKey()} 
                           stroke={getChartColor()} 
                           strokeWidth={4}
                           fillOpacity={1} 
                           fill="url(#colorValue)" 
                           animationDuration={1500}
                           activeDot={{ r: 6, strokeWidth: 3, stroke: '#fff', fill: getChartColor(), className: 'drop-shadow-md' }}
                         />
                       </AreaChart>
                     </ResponsiveContainer>
                   </motion.div>
                 </AnimatePresence>
               </div>
            </motion.div>
          </div>

          {/* Right Column (AI Score, Schedule, Reports) */}
          <div className="space-y-6">
            
            {/* AI Insight Panel */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-8 rounded-[32px] text-white relative overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.3)] group"
            >
               {/* Ambient Glow */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
               <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-[50px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />
               
               {/* Animated reflection sweep */}
               <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-[150%] animate-[shimmer_4s_infinite] pointer-events-none" />

               <div className="relative z-10 flex flex-col justify-between h-full">
                 <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center space-x-3">
                     <div className="relative w-12 h-12 rounded-[16px] overflow-hidden border border-white/20 bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                       <img src="/src/assets/ai_avatar_3d.png" alt="AI Avatar" className="w-full h-full object-cover scale-125" />
                     </div>
                     <div>
                       <span className="text-[10px] font-bold text-slate-300 tracking-wide uppercase flex items-center">
                         <Sparkles className="w-3 h-3 mr-1 text-blue-400" />
                         HealthSphere AI
                       </span>
                       <p className="text-xs text-white/60 font-medium mt-0.5">Intelligence Engine</p>
                     </div>
                   </div>
                   
                   {/* Circular Score Ring */}
                   <div className="relative w-16 h-16 flex items-center justify-center bg-white/5 rounded-full border border-white/10 backdrop-blur-sm">
                      <svg className="absolute inset-0 w-16 h-16 transform -rotate-90">
                        <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
                        <motion.circle 
                          cx="32" cy="32" r="26" 
                          stroke="currentColor" 
                          strokeWidth="4" 
                          fill="none" 
                          className="text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]"
                          strokeDasharray={2 * Math.PI * 26}
                          initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - 0.89) }}
                          transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                        />
                      </svg>
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-lg font-poppins font-bold text-white leading-none">
                          <AnimatedCounter value="89" />
                        </span>
                      </div>
                   </div>
                 </div>
                 
                 <AnimatePresence mode="wait">
                   {isAiAnalyzing ? (
                     <motion.div 
                       key="analyzing"
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       className="py-6 flex flex-col items-center justify-center space-y-4"
                     >
                       <div className="flex space-x-2">
                         {[0, 1, 2].map((i) => (
                           <motion.div 
                             key={i}
                             animate={{ y: [0, -8, 0], opacity: [0.3, 1, 0.3] }}
                             transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                             className="w-2.5 h-2.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]"
                           />
                         ))}
                       </div>
                       <p className="text-sm font-medium text-slate-400">Synthesizing real-time biometrics...</p>
                     </motion.div>
                   ) : (
                     <motion.div 
                       key="result"
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ duration: 0.5 }}
                     >
                       <h3 className="text-xl font-poppins font-bold mb-2">Excellent Wellness</h3>
                       <p className="text-slate-300 mb-6 text-sm leading-relaxed font-medium">
                         Your metrics indicate strong cardiovascular health and improved sleep recovery. Hydration remains the only minor area for improvement today.
                       </p>
                       
                       <div className="space-y-3">
                         <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 flex space-x-3 hover:bg-white/10 transition-colors">
                           <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                             <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                           </div>
                           <div>
                             <p className="text-xs font-bold text-white mb-0.5">Positive Trend</p>
                             <p className="text-xs text-slate-300 font-medium">Deep sleep increased by 15%.</p>
                           </div>
                         </div>
                         <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 flex space-x-3 hover:bg-white/10 transition-colors">
                           <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                             <AlertCircle className="w-4 h-4 text-cyan-400" />
                           </div>
                           <div>
                             <p className="text-xs font-bold text-white mb-0.5">Recommendation</p>
                             <p className="text-xs text-slate-300 font-medium">Consume 500ml water before 2 PM.</p>
                           </div>
                         </div>
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
            </motion.div>

            {/* Today's Schedule */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/70 backdrop-blur-xl border border-blue-50/80 p-6 rounded-[32px] shadow-[0_8px_30px_rgba(37,99,235,0.04)]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-poppins font-bold text-lg text-slate-900">Today's Schedule</h3>
                <Link to="/dashboard/medication" className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/80 border border-blue-100 px-3 py-1.5 rounded-full transition-all hover:shadow-sm">View All</Link>
              </div>
              
              <div className="space-y-3">
                  {schedule.map((item, i) => (
                    <motion.div 
                      key={item.id} 
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + 0.2 }}
                      onClick={() => setExpandedTask(expandedTask === item.id ? null : item.id)}
                      className="bg-white border border-slate-100 rounded-[20px] p-4 cursor-pointer hover:shadow-md hover:border-blue-100 transition-all duration-300 group"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="mt-1">
                          {item.status === 'done' ? (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 drop-shadow-sm" />
                            </motion.div>
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className={`text-sm font-bold transition-colors ${item.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-900 group-hover:text-blue-600'}`}>{item.title}</h4>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">{item.time}</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-400 mt-1">{item.type}</p>
                          
                          {/* Expanded detail panel */}
                          <AnimatePresence>
                            {expandedTask === item.id && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                  <p className="text-xs font-medium text-slate-600 leading-relaxed">{item.detail}</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>

            {/* Recent Reports */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/70 backdrop-blur-xl border border-blue-50/80 p-6 rounded-[32px] shadow-[0_8px_30px_rgba(37,99,235,0.04)]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-poppins font-bold text-lg text-slate-900">Recent Reports</h3>
                <Link to="/dashboard/reports" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50/80 border border-indigo-100 px-3 py-1.5 rounded-full transition-all hover:shadow-sm">View Archive</Link>
              </div>
              
              <div className="space-y-4">
                  {reports.map((report, i) => (
                    <motion.div 
                      key={report.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + 0.3 }}
                      onClick={() => setPreviewReport(report)}
                      className="flex items-center space-x-4 p-4 bg-white border border-slate-100 rounded-[20px] hover:shadow-md hover:border-indigo-100 cursor-pointer group transition-all duration-300"
                    >
                      <div className="w-12 h-12 bg-indigo-50 border border-indigo-100/50 text-indigo-500 rounded-[14px] flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-[0_4px_15px_rgba(99,102,241,0.4)] transition-all duration-300">
                        <FileSignature className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-700 transition-colors">{report.name}</h4>
                        <div className="flex items-center text-[10px] font-bold text-slate-500 mt-1.5 space-x-2">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{report.type}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span>{report.date}</span>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-300 -rotate-90 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </motion.div>
                  ))}
              </div>
            </motion.div>

          </div>
        </div>

        {/* ------------------------------------------------------------------------- */}
        {/* MODALS */}
        {/* ------------------------------------------------------------------------- */}
        
        {/* Metric Detail Modal */}
        <AnimatePresence>
          {selectedMetric && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedMetric(null)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white/90 backdrop-blur-2xl border border-white w-full max-w-md rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] relative z-10 overflow-hidden"
              >
                <div className={`p-8 ${selectedMetric.iconBg.replace('/50', '')} relative overflow-hidden border-b border-gray-100/50`}>
                   <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/50 rounded-full blur-3xl pointer-events-none" />
                   <button onClick={() => setSelectedMetric(null)} className="absolute top-6 right-6 p-2 bg-white/50 hover:bg-white rounded-full transition-colors shadow-sm">
                     <X className="w-5 h-5 text-slate-700" />
                   </button>
                   <motion.div 
                     initial={{ scale: 0.5, rotate: -20 }}
                     animate={{ scale: 1, rotate: 0 }}
                     transition={{ type: "spring", stiffness: 200, damping: 15 }}
                     className={`w-16 h-16 rounded-[20px] flex items-center justify-center bg-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.2)] mb-6 ${selectedMetric.iconColor}`}
                   >
                     <selectedMetric.icon className="w-8 h-8" />
                   </motion.div>
                   <h2 className="text-2xl font-poppins font-bold text-slate-900">{selectedMetric.title}</h2>
                </div>
                
                <div className="p-8">
                  <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-8">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Reading</p>
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-5xl font-poppins font-bold text-slate-900 tracking-tight">
                          {selectedMetric.value}
                        </span>
                        <span className="text-lg font-bold text-slate-400">{selectedMetric.unit}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Status</p>
                      <span className="bg-slate-50 text-slate-700 font-bold px-3 py-1.5 rounded-[10px] border border-slate-200 text-sm shadow-sm">{selectedMetric.status}</span>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h4 className="flex items-center text-sm font-bold text-slate-900 mb-3">
                      <BrainCircuit className="w-4 h-4 mr-2 text-blue-500" /> AI Context
                    </h4>
                    <p className="text-slate-600 leading-relaxed text-sm font-medium bg-slate-50 p-4 rounded-[16px] border border-slate-100">
                      {selectedMetric.desc}
                    </p>
                  </div>

                  <button 
                    onClick={() => setSelectedMetric(null)}
                    className="w-full py-4 bg-slate-900 text-white rounded-[20px] font-bold hover:bg-slate-800 transition-all shadow-[0_8px_20px_rgba(15,23,42,0.15)] hover:shadow-[0_12px_25px_rgba(15,23,42,0.25)] hover:-translate-y-0.5"
                  >
                    Close Insights
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Report Preview Modal */}
        <AnimatePresence>
          {previewReport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPreviewReport(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-[14px] flex items-center justify-center">
                      <FileSignature className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="font-poppins font-bold text-lg text-slate-900">{previewReport.name}</h2>
                      <p className="text-xs font-semibold text-slate-500">{previewReport.date} • {previewReport.doctor}</p>
                    </div>
                  </div>
                  <button onClick={() => setPreviewReport(null)} className="p-2 bg-white border border-gray-200 hover:bg-slate-50 rounded-full transition-colors shadow-sm">
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
                
                {/* Mock PDF Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-100/50">
                  <div className="bg-white border border-gray-200 shadow-sm rounded-xl min-h-[500px] p-8">
                     <div className="flex justify-between items-start border-b border-gray-100 pb-6 mb-6">
                       <div>
                         <h1 className="text-2xl font-serif font-bold text-slate-900">HealthSphere Laboratory</h1>
                         <p className="text-sm text-slate-500 mt-1">Official Medical Report Document</p>
                       </div>
                       <div className="text-right">
                         <p className="text-sm font-bold text-slate-800">Patient: John Doe</p>
                         <p className="text-sm text-slate-500">ID: HS-928471</p>
                         <p className="text-sm text-slate-500">Date: {previewReport.date}</p>
                       </div>
                     </div>
                     
                     <div className="space-y-6">
                       <div>
                         <h3 className="font-bold text-slate-800 mb-3 border-b border-gray-100 pb-2">Diagnostic Summary</h3>
                         <div className="h-4 bg-slate-100 rounded-md w-full mb-2"></div>
                         <div className="h-4 bg-slate-100 rounded-md w-5/6 mb-2"></div>
                         <div className="h-4 bg-slate-100 rounded-md w-4/6"></div>
                       </div>
                       
                       <div>
                         <h3 className="font-bold text-slate-800 mb-3 border-b border-gray-100 pb-2">Biomarker Analysis</h3>
                         <div className="space-y-3">
                           {[1,2,3,4].map((i) => (
                             <div key={i} className="flex justify-between items-center">
                               <div className="h-4 bg-slate-100 rounded-md w-1/3"></div>
                               <div className="h-4 bg-slate-100 rounded-md w-16"></div>
                               <div className="h-4 bg-slate-100 rounded-md w-24"></div>
                             </div>
                           ))}
                         </div>
                       </div>
                     </div>
                  </div>
                </div>
                
                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 bg-white flex justify-end space-x-3">
                  <button className="px-6 py-3 bg-white border border-gray-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center">
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                  </button>
                  <button 
                    onClick={() => setPreviewReport(null)}
                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
                  >
                    Close Preview
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

// Minimal missing icon placeholder if needed
const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
