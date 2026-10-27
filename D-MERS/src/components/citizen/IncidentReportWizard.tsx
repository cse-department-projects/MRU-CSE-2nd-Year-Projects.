import React, { useState } from 'react';
import { DisasterType, SeverityLevel, UserProfile } from '../../types';
import { DataProvider } from '../../lib/supabase';
import { calculatePriorityScore } from '../../utils/priorityEngine';
import { AlertCircle, ShieldAlert, MapPin, Users, HeartPulse, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';

interface IncidentReportWizardProps {
  isOpen: boolean;
  currentUser: UserProfile | null;
  onClose: () => void;
  onSubmitted: () => void;
}

export const IncidentReportWizard: React.FC<IncidentReportWizardProps> = ({
  isOpen,
  currentUser,
  onClose,
  onSubmitted,
}) => {
  const [step, setStep] = useState(1);
  const [disasterType, setDisasterType] = useState<DisasterType>('flood');
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('high');
  const [peopleAffected, setPeopleAffected] = useState(5);
  const [peopleNeedingHelp, setPeopleNeedingHelp] = useState(2);
  const [hasElderlyChildren, setHasElderlyChildren] = useState(false);
  const [hasMedicalEmergency, setHasMedicalEmergency] = useState(false);
  const [isTrapped, setIsTrapped] = useState(false);
  const [citizenName, setCitizenName] = useState(currentUser?.full_name || '');
  const [citizenPhone, setCitizenPhone] = useState(currentUser?.phone || '+91 ');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const computedBreakdown = calculatePriorityScore({
    severity,
    peopleAffected,
    peopleNeedingHelp,
    disasterType,
    hasElderlyChildren,
    hasMedicalEmergency,
    isTrapped,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await DataProvider.createIncident({
        citizen_id: currentUser?.id || 'guest-citizen',
        citizen_name: citizenName || 'Anonymous Citizen',
        citizen_phone: citizenPhone || '+91 99999 99999',
        disaster_type: disasterType,
        title: title || `${disasterType.toUpperCase()} Emergency at ${locationName}`,
        location_name: locationName,
        latitude: 17.385 + (Math.random() - 0.5) * 0.1,
        longitude: 78.486 + (Math.random() - 0.5) * 0.1,
        description,
        severity,
        people_affected: Number(peopleAffected),
        people_needing_help: Number(peopleNeedingHelp),
        has_elderly_children: hasElderlyChildren,
        has_medical_emergency: hasMedicalEmergency,
        is_trapped: isTrapped,
      });

      setLoading(false);
      onSubmitted();
      onClose();
    } catch (e) {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-200 hover:text-white font-bold"
          >
            ✕
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl border border-white/20">
              <AlertCircle className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold">Report Emergency SOS</h3>
              <p className="text-xs text-red-100">Step {step} of 3 • Smart Dispatch Calculator Active</p>
            </div>
          </div>

          {/* Wizard Step Progress Pills */}
          <div className="grid grid-cols-3 gap-2 mt-4 text-[10px] font-bold uppercase tracking-wider text-center">
            <div className={`py-1 rounded-full ${step >= 1 ? 'bg-white text-red-700' : 'bg-red-800/60 text-red-200'}`}>
              1. Type & Location
            </div>
            <div className={`py-1 rounded-full ${step >= 2 ? 'bg-white text-red-700' : 'bg-red-800/60 text-red-200'}`}>
              2. Situation & Vulnerabilities
            </div>
            <div className={`py-1 rounded-full ${step >= 3 ? 'bg-white text-red-700' : 'bg-red-800/60 text-red-200'}`}>
              3. Priority Review & Submit
            </div>
          </div>
        </div>

        {/* Wizard Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-800 font-bold mb-1.5">Select Disaster / Emergency Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'flood', label: 'Flood / Water', icon: '🌊' },
                    { id: 'fire', label: 'Fire Outbreak', icon: '🔥' },
                    { id: 'earthquake', label: 'Earthquake', icon: '🏚️' },
                    { id: 'cyclone', label: 'Cyclone / Storm', icon: '🌪️' },
                    { id: 'building_collapse', label: 'Building Collapse', icon: '🏢' },
                    { id: 'landslide', label: 'Landslide', icon: '⛰️' },
                    { id: 'other', label: 'Other Emergency', icon: '⚠️' },
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setDisasterType(item.id as DisasterType)}
                      className={`p-3 rounded-2xl border-2 cursor-pointer text-center transition ${
                        disasterType === item.id
                          ? 'border-red-600 bg-red-50 text-red-900 font-bold shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="text-xl mb-1">{item.icon}</div>
                      <div className="text-[11px] font-semibold">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">Incident Headline / Short Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Roof Stranded Family due to Rising Flood Water"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">Exact Location / Address / Landmark</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-red-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. H.No 4-12, Sector 5, LB Nagar Low Area"
                    value={locationName}
                    onChange={e => setLocationName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-800 font-bold mb-1">Detailed Situation Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the current danger, hazards, condition of trapped people, surrounding conditions..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Total People Affected</label>
                  <input
                    type="number"
                    min={1}
                    value={peopleAffected}
                    onChange={e => setPeopleAffected(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">Needing Immediate Help</label>
                  <input
                    type="number"
                    min={1}
                    value={peopleNeedingHelp}
                    onChange={e => setPeopleNeedingHelp(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Critical Vulnerability Checkboxes */}
              <div className="p-3 bg-red-50/60 rounded-2xl border border-red-200 space-y-2">
                <div className="font-bold text-red-900 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-red-600" /> Vulnerability & Priority Factors
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                  <input
                    type="checkbox"
                    checked={isTrapped}
                    onChange={e => setIsTrapped(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span>Victims are trapped / unable to move to safety</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                  <input
                    type="checkbox"
                    checked={hasMedicalEmergency}
                    onChange={e => setHasMedicalEmergency(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span>Medical Emergency / Active Injuries requiring doctor</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                  <input
                    type="checkbox"
                    checked={hasElderlyChildren}
                    onChange={e => setHasElderlyChildren(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span>Elderly persons, infants, or pregnant women present</span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Reporter Name</label>
                  <input
                    type="text"
                    required
                    value={citizenName}
                    onChange={e => setCitizenName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Reporter Phone</label>
                  <input
                    type="text"
                    required
                    value={citizenPhone}
                    onChange={e => setCitizenPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">Severity Level</label>
                <select
                  value={severity}
                  onChange={e => setSeverity(e.target.value as SeverityLevel)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-800"
                >
                  <option value="low">Low - Controlled Hazard</option>
                  <option value="medium">Medium - Moderate Danger</option>
                  <option value="high">High - Escalating Threat</option>
                  <option value="critical">Critical - Immediate Life Danger</option>
                </select>
              </div>

              {/* Live Computed Priority Score Card */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-blue-300 font-bold flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4 text-red-500" /> Automated Priority Score Engine
                  </span>
                  <span className="text-2xl font-black text-red-500">{computedBreakdown.score} / 100</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-red-600 h-full transition-all duration-500"
                    style={{ width: `${computedBreakdown.score}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                  <div>Severity Weight: +{computedBreakdown.severityPoints}</div>
                  <div>People Factor: +{computedBreakdown.peoplePoints}</div>
                  <div>Vulnerability Factor: +{computedBreakdown.vulnerabilityPoints}</div>
                  <div>Disaster Type Risk: +{computedBreakdown.disasterTypePoints}</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-slate-200 flex justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition flex items-center gap-1 shadow-md shadow-red-600/20"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold hover:from-red-700 hover:to-rose-800 transition flex items-center gap-2 shadow-lg shadow-red-600/30"
              >
                <CheckCircle className="w-4 h-4" /> Submit Report SOS
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
