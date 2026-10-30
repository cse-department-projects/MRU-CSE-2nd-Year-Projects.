import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Droplets, Moon, Scale, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchWeightData, addWeightLog } from '../../services/mockApi';
import type { IHealthMetric } from '../../models';
import Modal from '../../components/ui/Modal';

export default function HealthTracker() {
  const [weightData, setWeightData] = useState<IHealthMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchWeightData();
    setWeightData(data);
    setIsLoading(false);
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || isNaN(Number(newWeight))) return;

    setIsSubmitting(true);
    try {
      const added = await addWeightLog(Number(newWeight), 'Today');
      setWeightData(prev => [...prev.slice(1), added]); 
      setIsModalOpen(false);
      setNewWeight('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentWeight = weightData.length > 0 ? weightData[weightData.length - 1].weight : 73.8;

  const trackers = [
    { title: 'Water Intake', value: '1.8', unit: 'L', target: '2.5L', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', progress: 72 },
    { title: 'Sleep', value: '6.5', unit: 'h', target: '8h', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100', progress: 81 },
    { title: 'Weight', value: currentWeight.toFixed(1), unit: 'kg', target: '70kg', icon: Scale, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', trend: -1.2 },
    { title: 'Activity', value: '45', unit: 'min', target: '60min', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', trend: 15 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 font-inter pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-poppins font-bold text-slate-900 tracking-tight">Health Metrics</h1>
          <p className="text-slate-500 mt-2 font-medium">Log and monitor your daily progress across key health vectors.</p>
        </div>
      </div>

      {/* Quick Log Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trackers.map((tracker, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            whileHover={{ y: -4 }}
            className="bg-white border border-gray-100 p-6 rounded-[24px] relative overflow-hidden group shadow-sm hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer"
          >
             <div className="flex justify-between items-start mb-6">
               <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center border ${tracker.bg} ${tracker.border} group-hover:scale-110 transition-transform duration-300`}>
                 <tracker.icon className={`w-6 h-6 ${tracker.color}`} />
               </div>
               {tracker.trend !== undefined && (
                 <div className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-lg ${tracker.trend < 0 ? (tracker.title === 'Weight' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100') : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                   {tracker.trend < 0 ? <ArrowDown className="w-3 h-3 mr-1"/> : <ArrowUp className="w-3 h-3 mr-1"/>}
                   {Math.abs(tracker.trend)}
                 </div>
               )}
             </div>
             
             <p className="text-sm font-semibold text-slate-500 mb-1">{tracker.title}</p>
             <div className="flex items-baseline space-x-1.5">
               <span className="text-3xl font-poppins font-bold text-slate-900 tracking-tight">{tracker.value}</span>
               <span className="text-sm font-bold text-slate-400">{tracker.unit}</span>
             </div>
             
             {tracker.progress !== undefined && (
               <div className="w-full h-1.5 bg-slate-100 rounded-full mt-5 overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }} 
                   animate={{ width: `${tracker.progress}%` }} 
                   transition={{ duration: 1, delay: 0.2 }}
                   className={`h-full ${tracker.color.replace('text-', 'bg-')} rounded-full`} 
                 />
               </div>
             )}
          </motion.div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="bg-white border border-gray-100 p-8 rounded-[32px] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h3 className="font-poppins font-bold text-xl text-slate-900">Weight Trajectory</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">30-day historical data</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-xl transition-all shadow-md hover:-translate-y-0.5">
            <Plus className="w-4 h-4 mr-1.5" /> Add Log
          </button>
        </div>
        
        <div className="h-[360px] w-full relative z-10">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 600 }} 
                  itemStyle={{ color: '#0f172a' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#10B981" 
                  strokeWidth={4} 
                  dot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: '#10B981' }} 
                  activeDot={{ r: 8, strokeWidth: 0, fill: '#10B981' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} title="Log Weight Entry">
        <form onSubmit={handleAddLog} className="space-y-5">
          <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 text-center mb-6">
            <Scale className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-500">Current Weight</p>
            <p className="text-2xl font-poppins font-bold text-slate-900">{currentWeight.toFixed(1)} kg</p>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">New Weight (kg)</label>
            <input 
              required 
              type="number" 
              step="0.1" 
              value={newWeight} 
              onChange={e => setNewWeight(e.target.value)} 
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-center" 
              placeholder="e.g. 73.5" 
              autoFocus
            />
          </div>
          
          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold mt-2 hover:bg-slate-800 flex justify-center items-center shadow-md transition-colors disabled:opacity-50">
            {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Save Entry"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
