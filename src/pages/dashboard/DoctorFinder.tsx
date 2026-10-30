import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Star, Filter, Calendar, Clock, 
  ChevronRight, Award, User,
  Video, Building2, Info, CheckCircle2,
  Map as MapIcon
} from 'lucide-react';
import type { IDoctor } from '../../models';
import Modal from '../../components/ui/Modal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export default function DoctorFinder() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real data state
  const [doctorsList, setDoctorsList] = useState<IDoctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);

  // Booking Modal State
  const [bookingDoctor, setBookingDoctor] = useState<IDoctor | null>(null);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [consultationType, setConsultationType] = useState<'physical' | 'online'>('physical');
  const [patientName, setPatientName] = useState('');
  const [reasonForVisit, setReasonForVisit] = useState('');

  const categories = ['All', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'General Practice'];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await supabase.from('doctors').select('*');
        if (data) setDoctorsList(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  let filteredDoctors = useMemo(() => {
    const specialty = (searchParams.get('specialty') || '').toLowerCase().trim();
    let docs = specialty ? doctorsList.filter(d => (d.specialty || '').toLowerCase().includes(specialty)) : doctorsList;

    return docs.filter(doc => {
      const docSpecialty = doc.specialty || '';
      const matchesCategory = activeCategory === 'All' || docSpecialty === activeCategory;
      const matchesSearch = (doc.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (doc.hospital_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (docSpecialty).toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, searchParams, doctorsList]);

  const specialty = (searchParams.get('specialty') || '').toLowerCase().trim();
  const hasNoSpecialists = specialty && filteredDoctors.length === 0;

  if (hasNoSpecialists) {
    filteredDoctors = doctorsList;
  }

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    if (cat === 'All') {
      searchParams.delete('specialty');
    } else {
      searchParams.set('specialty', cat);
    }
    setSearchParams(searchParams);
  };

  const handleBooking = async () => {
    if (bookingStep === 1) {
      if (!selectedSlot) return;
      setBookingStep(2);
    } else if (bookingStep === 2) {
      if (!patientName || !bookingDoctor) return;
      
      setIsBookingLoading(true);
      try {
        const { error } = await supabase.from('appointments').insert([{
          user_id: user?.id,
          doctor_name: bookingDoctor.full_name,
          specialty: bookingDoctor.specialty,
          appointment_date: new Date().toISOString().split('T')[0],
          appointment_time: selectedSlot,
          consultation_type: consultationType,
          patient_name: patientName,
          reason_for_visit: reasonForVisit,
          fee: bookingDoctor.consultation_fee,
          doctor_id: bookingDoctor.id,
          status: 'pending'
        }]);
        
        if (error) {
          console.error(error);
          throw error;
        }
        
        setBookingStep(3);
      } catch (err: any) {
        console.error("Booking error:", err);
        alert(`Failed to book appointment: ${err.message || 'Unknown error'}`);
      } finally {
        setIsBookingLoading(false);
      }
    }
  };

  const resetBooking = () => {
    setBookingDoctor(null);
    setTimeout(() => {
      setBookingStep(1);
      setSelectedSlot(null);
      setPatientName('');
      setReasonForVisit('');
      setConsultationType('physical');
    }, 300);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-120px)] overflow-hidden font-inter">
      
      {/* Header & Search */}
      <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-[32px] shadow-sm mb-6 flex-shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-poppins font-bold text-slate-900 mb-3 tracking-tight">Find a Specialist</h1>
          <p className="text-slate-500 mb-8 max-w-2xl text-sm font-medium leading-relaxed">
            Book in-person visits or virtual telehealth appointments with top-rated medical professionals in your network.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search doctors, hospitals, or specialties..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-800 placeholder:text-slate-400 shadow-sm" 
              />
            </div>
            <button className="px-8 py-4 rounded-2xl font-bold flex items-center justify-center transition-all bg-slate-900 text-white hover:bg-slate-800 shadow-md">
              <Filter className="w-5 h-5 md:mr-2" />
              <span className="hidden md:block">Filters</span>
            </button>
          </div>

          {/* Dynamic Categories */}
          <div className="flex overflow-x-auto pb-2 hide-scrollbar space-x-3">
            {categories.map((cat, i) => (
              <button 
                key={i} 
                onClick={() => handleCategoryClick(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm border ${
                  activeCategory === cat 
                    ? 'bg-slate-900 text-white border-slate-900' 
                    : 'bg-white text-slate-600 border-gray-200 hover:border-slate-400 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area (Split View) */}
      <div className="flex-1 flex gap-6 min-h-0">
        
        {/* Left: Doctor List */}
        <div className="w-full lg:w-3/5 overflow-y-auto pr-2 pb-6 hide-scrollbar space-y-5">
          
          <AnimatePresence>
            {isLoadingDoctors ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-10">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
              </motion.div>
            ) : hasNoSpecialists && filteredDoctors.length > 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-amber-50 rounded-[32px] border border-amber-100 mb-6">
                <Info className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-xl font-poppins font-bold text-slate-800 mb-2">No specialists found for this category</h3>
                <p className="text-slate-500 text-sm font-medium">Displaying all available doctors instead.</p>
              </motion.div>
            ) : filteredDoctors.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-white rounded-[32px] border border-gray-100">
                <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-poppins font-bold text-slate-800 mb-2">No specialists found</h3>
                <p className="text-slate-500 text-sm font-medium">Try adjusting your filters or search terms.</p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {!isLoadingDoctors && filteredDoctors.map((doc, idx) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={doc.id} 
              className="bg-white border border-gray-100 p-6 rounded-[32px] flex flex-col gap-6 group hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.1)] hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Avatar Column */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-28 h-28 rounded-[24px] bg-slate-50 border border-gray-100 overflow-hidden relative mb-3 flex items-center justify-center">
                       <User className="w-12 h-12 text-slate-300" />
                  </div>
                  <div className="flex items-center space-x-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl text-sm font-bold border border-amber-100 shadow-sm">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{doc.rating || 'New'}</span>
                  </div>
                </div>
                
                {/* Info Column */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-poppins font-bold text-xl text-slate-900 group-hover:text-primary transition-colors tracking-tight">{doc.full_name}</h3>
                        <p className="text-primary text-sm font-bold">{doc.specialty}</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="font-bold text-slate-800 text-lg">₹{doc.consultation_fee}</span>
                        <span className="text-xs text-slate-500 font-medium">per consultation</span>
                      </div>
                    </div>
                    
                    {/* Tags Grid */}
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-5 mt-4">
                      <div className="flex items-center text-xs text-slate-600 font-medium">
                        <Award className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" /> 
                        {doc.experience_years ? `${doc.experience_years} Years Exp.` : 'Experienced'}
                      </div>
                      <div className="flex items-center text-xs text-slate-600 font-medium col-span-2">
                        <Building2 className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" /> 
                        <span className="line-clamp-1">{doc.hospital_name || 'Hospital'}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-600 font-medium">
                        <Calendar className="w-4 h-4 mr-2 text-primary flex-shrink-0" /> 
                        <span className="text-primary font-bold">{doc.available ? 'Available' : 'Unavailable'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button className="flex-1 py-3 bg-white text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors flex items-center justify-center border border-gray-200">
                  <User className="w-4 h-4 mr-2" /> View Profile
                </button>
                <button 
                  onClick={() => { setBookingDoctor(doc); setBookingStep(1); }}
                  className="flex-[2] py-3 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-primary shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center group/btn"
                >
                  Book Appointment <ChevronRight className="w-4 h-4 ml-1 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                </button>
              </div>

            </motion.div>
          ))}
        </div>

        {/* Right: Embedded Map Placeholder */}
        <div className="hidden lg:flex w-2/5 flex-col h-full bg-slate-100 rounded-[32px] border border-gray-200 overflow-hidden shadow-inner relative group">
          
          <iframe 
             src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100939.98555098464!2d-122.507640204439!3d37.7578149966017!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f076adff!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus" 
             width="100%" 
             height="100%" 
             style={{ border: 0 }} 
             allowFullScreen={false} 
             loading="lazy" 
             referrerPolicy="no-referrer-when-downgrade"
             className="absolute inset-0 z-0 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
          ></iframe>
          
          <div className="absolute top-4 right-4 z-10">
             <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-md border border-white/20 flex items-center space-x-2 text-sm font-bold text-slate-700">
               <MapIcon className="w-4 h-4 text-primary" />
               <span>Interactive Map</span>
             </div>
          </div>
          
          {/* Overlay to catch clicks during mock phase */}
          <div className="absolute inset-0 z-0 bg-transparent" title="Map Integration Placeholder"></div>
        </div>

      </div>

      <Modal 
        isOpen={!!bookingDoctor} 
        onClose={resetBooking} 
        title={bookingStep === 1 ? 'Select Time Slot' : bookingStep === 2 ? 'Patient Details' : 'Confirmation'}
      >
        {bookingDoctor && (
          <div className="space-y-6">
            
            {/* Doctor Info Header (Visible in steps 1 & 2) */}
            {bookingStep < 3 && (
              <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-gray-100">
                <div className="w-16 h-16 rounded-[14px] bg-white border border-gray-100 flex items-center justify-center">
                  <User className="w-8 h-8 text-slate-300" />
                </div>
                <div>
                  <h4 className="font-poppins font-bold text-slate-900">{bookingDoctor.full_name}</h4>
                  <p className="text-sm font-medium text-slate-500">{bookingDoctor.specialty} • {bookingDoctor.hospital_name}</p>
                </div>
              </div>
            )}

            {/* STEP 1: Select Slot */}
            {bookingStep === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">Consultation Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setConsultationType('physical')}
                      className={`p-4 rounded-xl flex items-center justify-center space-x-2 font-bold border transition-all ${consultationType === 'physical' ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-gray-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Building2 className="w-4 h-4" /> <span>In-Person</span>
                    </button>
                    <button 
                      onClick={() => setConsultationType('online')}
                      className={`p-4 rounded-xl flex items-center justify-center space-x-2 font-bold border transition-all ${consultationType === 'online' ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-gray-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Video className="w-4 h-4" /> <span>Video Visit</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">Available Slots</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['09:00 AM', '10:30 AM', '11:15 AM', '02:00 PM', '03:45 PM', '04:30 PM'].map(time => (
                      <button 
                        key={time}
                        onClick={() => setSelectedSlot(time)}
                        className={`py-3 rounded-xl text-sm font-bold border transition-all ${selectedSlot === time ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-gray-200 text-slate-700 hover:border-slate-400'}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Patient Info */}
            {bookingStep === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Appointment Summary</p>
                    <p className="text-sm text-slate-600 mt-1">{consultationType === 'physical' ? 'In-person' : 'Video'} visit at {selectedSlot}</p>
                    <p className="text-sm font-bold text-primary mt-1">Fee: ₹{bookingDoctor.consultation_fee}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Patient Full Name</label>
                  <input 
                    type="text" 
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient name"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Reason for Visit (Optional)</label>
                  <textarea 
                    rows={3}
                    value={reasonForVisit}
                    onChange={(e) => setReasonForVisit(e.target.value)}
                    placeholder="Briefly describe your symptoms or reason for visit"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium resize-none"
                  ></textarea>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Success */}
            {bookingStep === 3 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-8 space-y-5">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-100 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-poppins font-bold text-slate-900">Booking Confirmed!</h3>
                  <p className="text-sm text-slate-500 mt-3 max-w-sm leading-relaxed font-medium">
                    Your {consultationType === 'physical' ? 'in-person' : 'video'} appointment with <strong>{bookingDoctor?.full_name}</strong> at <strong>{selectedSlot}</strong> has been scheduled successfully.
                  </p>
                </div>
                <div className="w-full bg-slate-50 p-4 rounded-xl border border-gray-100 mt-4 text-left">
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Next Steps</p>
                   <ul className="text-sm text-slate-700 space-y-2 font-medium">
                     <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2"/> Check email for calendar invite</li>
                     <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2"/> Complete pre-visit digital intake form</li>
                   </ul>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            {bookingStep < 3 && (
              <div className="pt-4 border-t border-gray-100 flex gap-3">
                {bookingStep === 2 && (
                  <button 
                    onClick={() => setBookingStep(1)}
                    className="flex-1 py-4 bg-white text-slate-700 border border-gray-200 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </button>
                )}
                <button 
                  disabled={isBookingLoading || (bookingStep === 1 && !selectedSlot) || (bookingStep === 2 && !patientName)}
                  onClick={handleBooking}
                  className="flex-[2] py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-md flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isBookingLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    bookingStep === 1 ? 'Continue to Details' : 'Confirm & Book'
                  )}
                </button>
              </div>
            )}
            
            {bookingStep === 3 && (
              <button 
                onClick={resetBooking}
                className="w-full mt-4 px-6 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-md"
              >
                Return to Dashboard
              </button>
            )}

          </div>
        )}
      </Modal>

    </div>
  );
}
