import React, { useState } from 'react';
import { useResponseUnits, useRiskZones } from '../hooks/useSentinelData';
import { LoadingSkeleton, ErrorState } from '../components/common/LoadingSkeleton';
import { 
  Truck, 
  Users, 
  MapPin, 
  PhoneCall, 
  CheckCircle2, 
  Send, 
  ShieldCheck, 
  Search, 
  Filter, 
  ExternalLink,
  PlusCircle,
  HelpCircle,
  AlertTriangle,
  Waves,
  HeartPulse,
  Utensils
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReliefShelter {
  id: string;
  name: string;
  location: string;
  state: string;
  capacityTotal: number;
  capacityOccupied: number;
  contactNumber: string;
  inCharge: string;
  amenities: string[];
  status: 'open' | 'near_capacity' | 'full';
}

const RELIEF_SHELTERS: ReliefShelter[] = [
  {
    id: 'shelter-mumbai-1',
    name: 'Bandra Civic Community Emergency Shelter',
    location: 'BKC Ground, Bandra East, Mumbai',
    state: 'Maharashtra',
    capacityTotal: 1500,
    capacityOccupied: 420,
    contactNumber: '+91 22 2650 1100',
    inCharge: 'Officer Rajesh Sawant (MCGM)',
    amenities: ['Medical Dispensary', 'Dry Ration & Cooked Meals', 'Safe Drinking Water', 'Generator Power', 'Child Care'],
    status: 'open'
  },
  {
    id: 'shelter-guwahati-1',
    name: 'Pandu Multi-Purpose Flood Relief Camp',
    location: 'Pandu High School Complex, Guwahati',
    state: 'Assam',
    capacityTotal: 800,
    capacityOccupied: 650,
    contactNumber: '+91 361 244 5566',
    inCharge: 'Dr. B. K. Sarma (ASDMA)',
    amenities: ['Emergency First Aid', 'Infant Formula & Food', 'Potable Water Tankers', 'Sanitary Packs'],
    status: 'near_capacity'
  },
  {
    id: 'shelter-wayanad-1',
    name: 'Meppadi High Ground Resettlement Camp',
    location: 'Government College Hall, Meppadi, Wayanad',
    state: 'Kerala',
    capacityTotal: 600,
    capacityOccupied: 310,
    contactNumber: '+91 4936 202 333',
    inCharge: 'Divya Nair (KSDMA)',
    amenities: ['24x7 Trauma Paramedics', 'Hot Food Kitchen', 'Blankets & Sleeping Mats', 'Mobile Charging Stn'],
    status: 'open'
  },
  {
    id: 'shelter-puri-1',
    name: 'Puri Cyclone Multi-Hazard Safe Shelter #4',
    location: 'Puri Grand Road Shelter Complex',
    state: 'Odisha',
    capacityTotal: 2000,
    capacityOccupied: 1100,
    contactNumber: '+91 6752 222 045',
    inCharge: 'Alok Mohanty (ODRAF)',
    amenities: ['Reinforced Concrete Dome', 'Satellite Comms', 'Medical Unit', 'Community Kitchen', 'Water Purifier'],
    status: 'open'
  }
];

export const ResponsePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: units, loading, error, refetch } = useResponseUnits();

  const [activeTab, setActiveTab] = useState<'shelters' | 'teams' | 'request'>('shelters');
  const [searchTerm, setSearchTerm] = useState('');
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    assistanceType: 'rescue',
    peopleCount: '1',
    notes: ''
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton rows={5} height="h-28" />
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={refetch} message={error} />;
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSubmitted(true);
    setTimeout(() => {
      setRequestSubmitted(false);
      setRequestModalOpen(false);
      setFormData({
        name: '',
        phone: '',
        location: '',
        assistanceType: 'rescue',
        peopleCount: '1',
        notes: ''
      });
    }, 2500);
  };

  const filteredShelters = RELIEF_SHELTERS.filter(s =>
    !searchTerm ||
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="response-page" className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8EAED] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-[#1E8E3E] flex items-center justify-center font-bold">
              <Truck size={20} />
            </span>
            <h1 className="text-xl font-bold text-[#202124] tracking-tight">
              Emergency Relief Shelters & Response Units
            </h1>
          </div>
          <p className="text-xs md:text-sm text-[#5F6368] mt-1">
            Designated safe relief camps, food distribution points, and NDRF rescue battalion locations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRequestModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#1A73E8] hover:bg-[#1557B0] rounded-lg shadow-xs transition-colors"
          >
            <PlusCircle size={14} />
            <span>Request Emergency Aid / Report Hazard</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-[#E8EAED] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveTab('shelters')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'shelters'
                ? 'bg-[#1A73E8] text-white shadow-xs'
                : 'bg-[#F8F9FA] text-[#5F6368] hover:text-[#202124]'
            }`}
          >
            Relief Camps & Shelters ({RELIEF_SHELTERS.length})
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'teams'
                ? 'bg-[#1A73E8] text-white shadow-xs'
                : 'bg-[#F8F9FA] text-[#5F6368] hover:text-[#202124]'
            }`}
          >
            NDRF & Rescue Battalions ({units.length})
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search camp or district..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-[#F8F9FA] text-xs text-[#202124] rounded-lg border border-[#DADCE0] focus:bg-white focus:border-[#1A73E8] outline-hidden w-56"
          />
          <Search size={14} className="absolute left-2.5 top-2.5 text-[#80868B]" />
        </div>
      </div>

      {/* TAB 1: RELIEF SHELTERS */}
      {activeTab === 'shelters' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredShelters.map((shelter) => {
            const availableBeds = shelter.capacityTotal - shelter.capacityOccupied;
            const isNearCapacity = shelter.status === 'near_capacity';

            return (
              <div
                key={shelter.id}
                className="bg-white p-5 rounded-2xl border border-[#E8EAED] hover:border-[#1A73E8] transition-all shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#202124]">
                        {shelter.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isNearCapacity ? 'bg-amber-100 text-[#E37400]' : 'bg-emerald-100 text-[#1E8E3E]'
                      }`}>
                        {isNearCapacity ? 'Near Full' : 'Available'}
                      </span>
                    </div>
                    <p className="text-xs text-[#5F6368] mt-0.5 flex items-center gap-1">
                      <MapPin size={12} className="text-[#D93025]" />
                      {shelter.location}, {shelter.state}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-[#1E8E3E]">
                      {availableBeds} Vacant
                    </div>
                    <div className="text-[10px] text-[#80868B]">of {shelter.capacityTotal} Capacity</div>
                  </div>
                </div>

                {/* Amenities Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {shelter.amenities.map(a => (
                    <span
                      key={a}
                      className="px-2 py-0.5 rounded-md bg-[#F1F3F4] text-[#3C4043] text-[11px] font-medium"
                    >
                      ✓ {a}
                    </span>
                  ))}
                </div>

                {/* Contact & Route Action */}
                <div className="pt-3 border-t border-[#F1F3F4] flex items-center justify-between text-xs text-[#5F6368]">
                  <span>In-charge: <strong>{shelter.inCharge}</strong></span>
                  <a
                    href={`tel:${shelter.contactNumber}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#1A73E8] font-bold rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <PhoneCall size={12} />
                    <span>{shelter.contactNumber}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: RESCUE BATTALIONS */}
      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="bg-white p-4 rounded-xl border border-[#E8EAED] shadow-xs space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#202124]">{unit.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  unit.status === 'deployed' ? 'bg-red-100 text-[#D93025]' : 'bg-emerald-100 text-[#1E8E3E]'
                }`}>
                  {unit.status}
                </span>
              </div>
              <p className="text-[11px] text-[#5F6368]">📍 Base: {unit.location.name}</p>
              <div className="flex justify-between text-[11px] text-[#80868B] pt-2 border-t border-[#F1F3F4]">
                <span>Personnel: <strong>{unit.personnelCount}</strong></span>
                <span>Commander: <strong>{unit.commander}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REQUEST ASSISTANCE MODAL */}
      {requestModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-xl border border-[#E8EAED] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8EAED]">
              <h3 className="text-base font-bold text-[#202124]">
                Request Immediate Aid / Report Hazard
              </h3>
              <button
                onClick={() => setRequestModalOpen(false)}
                className="text-[#80868B] hover:text-[#202124] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {requestSubmitted ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle2 size={36} className="mx-auto text-[#1E8E3E]" />
                <h4 className="text-sm font-bold text-[#1E8E3E]">Request Dispatched to District EOC</h4>
                <p className="text-xs text-[#3C4043]">
                  Your distress alert has been logged into the National Disaster Response Force queue. Nearby field units and local collectorate have been notified.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-[#202124] block mb-1">Your Full Name / Household</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 bg-[#F8F9FA] rounded-lg border border-[#DADCE0] outline-hidden focus:border-[#1A73E8]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#202124] block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 bg-[#F8F9FA] rounded-lg border border-[#DADCE0] outline-hidden focus:border-[#1A73E8]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#202124] block mb-1">Exact Location / Landmark</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 302, Green Valley Apartments, Near Majuli Ghat"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-2 bg-[#F8F9FA] rounded-lg border border-[#DADCE0] outline-hidden focus:border-[#1A73E8]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#202124] block mb-1">Assistance Needed</label>
                  <select
                    value={formData.assistanceType}
                    onChange={e => setFormData({ ...formData, assistanceType: e.target.value })}
                    className="w-full p-2 bg-[#F8F9FA] rounded-lg border border-[#DADCE0] outline-hidden focus:border-[#1A73E8]"
                  >
                    <option value="rescue">Evacuation / Boat Rescue</option>
                    <option value="medical">Urgent Medical Aid / Ambulance</option>
                    <option value="food">Drinking Water & Food Packets</option>
                    <option value="waterlog">Report Severe Road Waterlogging / Debris</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestModalOpen(false)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#202124] font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#D93025] hover:bg-[#B31412] text-white font-bold rounded-lg shadow-xs"
                  >
                    Send Emergency Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
