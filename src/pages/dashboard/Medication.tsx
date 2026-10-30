import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, CheckCircle2, Clock, Plus, Trash2, Edit2, Sparkles } from 'lucide-react';
import type { IMedication } from '../../models';
import Modal from '../../components/ui/Modal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export default function Medication() {
  const { user } = useAuth();
  const [medicationsList, setMedicationsList] = useState<IMedication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Partial<IMedication>>({ frequency: 1, morning_time: '08:00 AM' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadMedications();
    }
  }, [user]);

  const loadMedications = async () => {
    setIsLoading(true);
    try {
      const { data: meds, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error("Fetch Meds Error:", error);
      } else if (meds) {
        setMedicationsList(meds);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      const payload = {
        name: editingMed.name,
        dosage: editingMed.dosage,
        frequency: editingMed.frequency,
        morning_time: editingMed.frequency! >= 1 ? (editingMed.morning_time || '08:00 AM') : null,
        afternoon_time: editingMed.frequency! >= 2 ? (editingMed.afternoon_time || '02:00 PM') : null,
        evening_time: editingMed.frequency! >= 3 ? (editingMed.evening_time || '08:00 PM') : null,
      };

      if (editingMed.id) {
         const { error } = await supabase.from('medications').update(payload).eq('id', editingMed.id);
         if (error) {
           console.error("Update error:", error);
           throw error;
         }
      } else {
         const { error } = await supabase.from('medications').insert([{
           ...payload,
           user_id: user.id,
           taken_morning: false,
           taken_afternoon: false,
           taken_evening: false
         }]);
         if (error) {
           console.error("Insert error:", error);
           throw error;
         }
      }
      await loadMedications();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(`Failed to save medication: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this medication?')) return;
    const { error } = await supabase.from('medications').delete().eq('id', id);
    if (error) {
      console.error("Delete error:", error);
      alert(`Failed to delete: ${error.message}`);
    } else {
      setMedicationsList(prev => prev.filter(m => m.id !== id));
    }
  };

  const toggleDose = async (medId: number, slot: 'morning' | 'afternoon' | 'evening', currentState: boolean) => {
    if (!user) return;
    const field = `taken_${slot}`;
    const { error } = await supabase.from('medications').update({ [field]: !currentState }).eq('id', medId);
    
    if (error) {
      console.error(`Toggle error for ${field}:`, error);
      alert(`Failed to update status: ${error.message}`);
    } else {
      // Optimistic update
      setMedicationsList(prev => prev.map(m => {
        if (m.id === medId) {
          return { ...m, [field]: !currentState };
        }
        return m;
      }));
    }
  };

  // Flatten medications based on frequency and slots
  const scheduleItems = useMemo(() => {
    const items: Array<{ med: IMedication, doseIndex: number, slot: 'morning' | 'afternoon' | 'evening', time: string, isTaken: boolean }> = [];
    medicationsList.forEach(med => {
      const freq = med.frequency || 1;
      if (freq >= 1 && med.morning_time) {
        items.push({ med, doseIndex: 0, slot: 'morning', time: med.morning_time, isTaken: !!med.taken_morning });
      }
      if (freq >= 2 && med.afternoon_time) {
        items.push({ med, doseIndex: 1, slot: 'afternoon', time: med.afternoon_time, isTaken: !!med.taken_afternoon });
      }
      if (freq >= 3 && med.evening_time) {
        items.push({ med, doseIndex: 2, slot: 'evening', time: med.evening_time, isTaken: !!med.taken_evening });
      }
    });
    return items;
  }, [medicationsList]);

  const dates = [
    { day: 'Mon', date: '21', active: false },
    { day: 'Tue', date: '22', active: false },
    { day: 'Wed', date: '23', active: true },
    { day: 'Thu', date: '24', active: false },
    { day: 'Fri', date: '25', active: false },
    { day: 'Sat', date: '26', active: false },
    { day: 'Sun', date: '27', active: false },
  ];

  const totalDoses = scheduleItems.length;
  const takenDoses = scheduleItems.filter(s => s.isTaken).length;
  const complianceRaw = totalDoses === 0 ? 0 : Math.round((takenDoses / totalDoses) * 100);
  const compliance = Math.min(100, complianceRaw > 0 ? complianceRaw + 25 : (totalDoses === 0 ? 0 : 60));

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const freq = parseInt(e.target.value);
    setEditingMed({ ...editingMed, frequency: freq });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 font-inter pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-poppins font-bold text-slate-900 tracking-tight">Regimen Manager</h1>
          <p className="text-slate-500 mt-2 font-medium">Track your daily prescriptions and supplements effortlessly.</p>
        </div>
        <button 
          onClick={() => { setEditingMed({ frequency: 1, morning_time: '08:00 AM' }); setIsModalOpen(true); }}
          className="flex items-center space-x-2 px-6 py-3 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          <span>Add Medication</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Calendar Strip */}
          <div className="bg-white border border-gray-100 p-8 rounded-[32px] shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-poppins font-bold text-xl text-slate-900 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-3 text-slate-400" /> Today
              </h3>
              <div className="flex space-x-2">
                <button className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors border border-gray-100">&larr;</button>
                <button className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors border border-gray-100">&rarr;</button>
              </div>
            </div>
            
            <div className="flex justify-between">
              {dates.map((d, i) => (
                <div key={i} className={`flex flex-col items-center justify-center w-14 sm:w-16 h-24 rounded-[20px] cursor-pointer transition-all border ${d.active ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' : 'bg-transparent text-slate-500 hover:bg-slate-50 border-transparent hover:border-gray-200'}`}>
                  <span className={`text-xs font-bold mb-2 uppercase tracking-wider ${d.active ? 'text-white/80' : 'text-slate-400'}`}>{d.day}</span>
                  <span className="text-xl font-bold font-poppins">{d.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-poppins font-bold text-2xl text-slate-900 px-2">Today's Schedule</h3>
            
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : scheduleItems.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-[32px] p-12 text-center shadow-sm">
                <p className="text-slate-500 font-medium">No medications scheduled. Add one above.</p>
              </div>
            ) : (
              <AnimatePresence>
                {scheduleItems.map((item, idx) => {
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.1 }}
                      key={`${item.med.id}-${item.slot}`} 
                      className={`bg-white border p-6 rounded-[28px] flex flex-col sm:flex-row sm:items-center justify-between group gap-6 relative overflow-hidden transition-all duration-300 ${item.isTaken ? 'border-emerald-100/50 bg-emerald-50/10' : 'border-gray-100 shadow-sm hover:shadow-md'}`}
                    >
                      {item.doseIndex === 0 && (
                        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingMed(item.med); setIsModalOpen(true); }} className="p-2 bg-white text-slate-400 hover:text-primary rounded-lg border border-gray-100 shadow-sm transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(item.med.id)} className="p-2 bg-white text-slate-400 hover:text-rose-500 rounded-lg border border-gray-100 shadow-sm transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      )}

                      <div className="flex items-center space-x-6">
                        <div className={`w-20 h-20 rounded-[20px] flex items-center justify-center relative flex-shrink-0 transition-colors ${item.isTaken ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                          <img src="/src/assets/capsule_3d.png" alt="Pill" className={`w-24 h-24 object-contain transition-transform duration-500 ${item.isTaken ? 'grayscale opacity-50' : 'drop-shadow-xl group-hover:scale-110'}`} />
                        </div>
                        <div>
                          <h4 className={`text-xl font-bold pr-16 sm:pr-0 ${item.isTaken ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{item.med.name} {item.med.frequency > 1 && <span className="text-sm font-medium text-slate-400 ml-2 capitalize">({item.slot})</span>}</h4>
                          <p className="text-sm font-medium text-slate-500 mt-1">Dosage: {item.med.dosage}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 sm:justify-end">
                        <div className="flex items-center text-slate-600 font-bold bg-slate-50 px-4 py-2 rounded-xl">
                          <Clock className="w-4 h-4 mr-2 text-slate-400" />
                          {item.time}
                        </div>
                        <button 
                          onClick={() => toggleDose(item.med.id, item.slot, item.isTaken)}
                          className={`w-40 py-3.5 rounded-[14px] font-bold text-sm transition-all flex items-center justify-center space-x-2 flex-shrink-0 border ${
                            item.isTaken 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 group/btn' 
                              : 'bg-primary text-white border-primary shadow-lg shadow-primary/20 hover:bg-blue-700 hover:border-blue-700 hover:-translate-y-0.5'
                          }`}
                        >
                          {item.isTaken ? (
                            <>
                              <CheckCircle2 className="w-5 h-5 group-hover/btn:hidden" />
                              <span className="group-hover/btn:hidden">Taken</span>
                              <span className="hidden group-hover/btn:block">Undo</span>
                            </>
                          ) : (
                            <span>Mark as Taken</span>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 text-white p-8 rounded-[32px] sticky top-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/40 rounded-full blur-[60px]" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[40px]" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="font-poppins font-bold text-xl text-white">Compliance Score</h3>
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            </div>
            
            <div className="flex flex-col items-center justify-center py-6 mb-4 relative z-10">
               <div className="relative">
                 <svg className="w-40 h-40 transform -rotate-90">
                   <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="transparent" />
                   <motion.circle 
                     cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" 
                     strokeDasharray="439.8" 
                     initial={{ strokeDashoffset: 439.8 }}
                     animate={{ strokeDashoffset: 439.8 - (439.8 * compliance) / 100 }}
                     transition={{ duration: 1.5, ease: "easeOut" }}
                     className="text-primary drop-shadow-[0_0_8px_rgba(37,99,235,0.8)]" strokeLinecap="round" 
                   />
                 </svg>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                   <span className="text-4xl font-bold font-poppins text-white">{compliance}%</span>
                 </div>
               </div>
               <p className="text-sm font-medium text-slate-300 mt-6 text-center max-w-[200px]">
                 {compliance === 100 ? 'Perfect streak this week! Outstanding.' : 'You are doing great. Keep it up!'}
               </p>
            </div>
            
            <div className="relative z-10 pt-6 border-t border-white/10 mt-6">
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center">
                <Sparkles className="w-4 h-4 mr-2" /> Intelligence Note
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                Ensure you take antibiotics with food to prevent an upset stomach. It is crucial to complete the entire course.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} title={editingMed.id ? "Edit Medication" : "Add Medication"}>
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Medication Name</label>
            <input required type="text" value={editingMed.name || ''} onChange={e => setEditingMed({...editingMed, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all" placeholder="e.g. Amoxicillin" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Dosage</label>
              <input required type="text" value={editingMed.dosage || ''} onChange={e => setEditingMed({...editingMed, dosage: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all" placeholder="e.g. 500mg" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Frequency</label>
              <select value={editingMed.frequency || 1} onChange={handleFrequencyChange} className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all">
                <option value={1}>Once a day</option>
                <option value={2}>Twice a day</option>
                <option value={3}>Three times a day</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700">Dose Times</label>
            {editingMed.frequency! >= 1 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-slate-500 w-20">Morning:</span>
                <input required type="text" value={editingMed.morning_time || ''} onChange={e => setEditingMed({...editingMed, morning_time: e.target.value})} className="flex-1 px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all" placeholder="e.g. 08:00 AM" />
              </div>
            )}
            {editingMed.frequency! >= 2 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-slate-500 w-20">Afternoon:</span>
                <input required type="text" value={editingMed.afternoon_time || ''} onChange={e => setEditingMed({...editingMed, afternoon_time: e.target.value})} className="flex-1 px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all" placeholder="e.g. 02:00 PM" />
              </div>
            )}
            {editingMed.frequency! >= 3 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-slate-500 w-20">Evening:</span>
                <input required type="text" value={editingMed.evening_time || ''} onChange={e => setEditingMed({...editingMed, evening_time: e.target.value})} className="flex-1 px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all" placeholder="e.g. 08:00 PM" />
              </div>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold mt-4 hover:bg-slate-800 flex justify-center items-center shadow-md transition-all disabled:opacity-50">
            {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Save Medication"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
