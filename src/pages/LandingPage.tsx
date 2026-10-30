import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Search, 
  MapPin, 
  Bell, 
  Waves, 
  Truck, 
  PhoneCall, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Compass, 
  Radio, 
  BrainCircuit, 
  ShieldCheck,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useDashboardMetrics, useRiskZones, useAlerts } from '../hooks/useSentinelData';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: metrics } = useDashboardMetrics();
  const { data: zones } = useRiskZones();
  const { data: alerts } = useAlerts();

  const [searchCity, setSearchCity] = useState('');
  const [cityResult, setCityResult] = useState<{
    cityName: string;
    status: 'safe' | 'warning' | 'critical';
    message: string;
    hazard?: string;
    shelter?: string;
  } | null>(null);

  const popularCities = ['Mumbai', 'Guwahati', 'Wayanad', 'Puri', 'Delhi', 'Chennai', 'Kolkata', 'Bengaluru'];

  const handleCitySearch = (query: string) => {
    setSearchCity(query);
    const q = query.trim().toLowerCase();
    if (!q) {
      setCityResult(null);
      return;
    }

    const matchedZone = zones.find(z =>
      z.name.toLowerCase().includes(q) ||
      z.region.toLowerCase().includes(q) ||
      z.state.toLowerCase().includes(q)
    );

    if (matchedZone) {
      setCityResult({
        cityName: matchedZone.name,
        status: matchedZone.severity === 'critical' ? 'critical' : 'warning',
        hazard: matchedZone.hazardType,
        message: matchedZone.description,
        shelter: `${matchedZone.region} Civic Relief Shelter (1.4 km away)`
      });
    } else {
      setCityResult({
        cityName: query,
        status: 'safe',
        message: 'No flood breaches, cyclone warnings, or landslide alerts active for this region.',
        shelter: 'District Community Center'
      });
    }
  };

  return (
    <div id="sentinel-landing-page" className="min-h-screen bg-[#F8F9FA] text-[#202124]">
      
      {/* Top Simple Brand Bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#E8EAED] sticky top-0 z-30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1A73E8] text-white flex items-center justify-center shadow-xs">
              <ShieldAlert size={20} />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-[#202124]">SENTINEL</span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-blue-50 text-[#1A73E8] rounded border border-blue-200">
                EWS Network
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/poster')}
              className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-[#1A73E8] text-xs font-bold rounded-xl border border-slate-300 shadow-2xs transition-all flex items-center gap-1.5"
              title="View & Download 10-Screen UI/UX Design Poster for Group"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">UI Poster</span>
            </button>

            <button
              onClick={() => navigate('/login')}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-[#1A73E8] text-xs font-bold rounded-xl border border-blue-200 hover:border-blue-400 shadow-2xs transition-all flex items-center gap-1.5"
            >
              <ShieldCheck size={14} />
              <span>Login / Sign Up</span>
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Console</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION - Airy, generous whitespace, focused action */}
      <section className="pt-16 pb-20 px-6 max-w-5xl mx-auto text-center space-y-8">
        
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#DADCE0] shadow-xs text-xs text-[#3C4043]">
          <span className="w-2 h-2 rounded-full bg-[#1E8E3E] inline-block animate-pulse" />
          <span className="font-semibold text-[#1A73E8]">National Early Warning Network Online</span>
          <span className="text-gray-300">•</span>
          <span className="text-[#5F6368]">18 Basins Monitored</span>
        </div>

        {/* Big Display Headline */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#202124] tracking-tight leading-[1.15]">
            Disaster Early Warnings & Life-Saving Directives.
          </h1>
          <p className="text-base sm:text-lg text-[#5F6368] font-normal leading-relaxed max-w-2xl mx-auto">
            Check live flood water levels, cyclonic storms, and verified evacuation relief shelters across your district in seconds.
          </p>
        </div>

        {/* Spacious City Safety Search Card */}
        <div className="max-w-2xl mx-auto bg-white p-4 sm:p-5 rounded-3xl border border-[#DADCE0] shadow-sm text-left space-y-3 transition-all hover:border-[#1A73E8]">
          <label className="text-xs font-bold uppercase tracking-wider text-[#5F6368] block ml-1">
            Check Your City or District Safety Status
          </label>

          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-3.5 text-[#80868B]" />
              <input
                id="landing-search-input"
                type="text"
                placeholder="Enter city (e.g., Mumbai, Guwahati, Wayanad, Puri)..."
                value={searchCity}
                onChange={e => handleCitySearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#F8F9FA] focus:bg-white text-sm text-[#202124] rounded-2xl border border-[#E8EAED] focus:border-[#1A73E8] focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
              />
            </div>

            <button
              onClick={() => handleCitySearch('Mumbai')}
              className="px-5 py-3 bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs font-bold rounded-2xl transition-colors shrink-0 shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Check Safety</span>
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Quick Popular Pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs text-[#5F6368]">
            <span className="text-[11px] text-[#80868B] mr-1">Quick Select:</span>
            {popularCities.map(city => (
              <button
                key={city}
                onClick={() => handleCitySearch(city)}
                className="px-3 py-1 bg-[#F1F3F4] hover:bg-blue-50 hover:text-[#1A73E8] rounded-xl text-xs font-medium transition-colors"
              >
                {city}
              </button>
            ))}
          </div>

          {/* Instant Search Result Box */}
          {cityResult && (
            <div className={`mt-3 p-4 rounded-2xl border transition-all ${
              cityResult.status === 'safe'
                ? 'bg-emerald-50/80 border-emerald-200'
                : 'bg-red-50/80 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl text-white shrink-0 ${
                  cityResult.status === 'safe' ? 'bg-[#1E8E3E]' : 'bg-[#D93025]'
                }`}>
                  {cityResult.status === 'safe' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#202124]">
                      {cityResult.cityName}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      cityResult.status === 'safe' ? 'bg-emerald-100 text-[#1E8E3E]' : 'bg-red-100 text-[#D93025]'
                    }`}>
                      {cityResult.status === 'safe' ? '🟢 Safe Area' : `🚨 Active Warning (${cityResult.hazard})`}
                    </span>
                  </div>
                  <p className="text-xs text-[#3C4043] leading-relaxed">
                    {cityResult.message}
                  </p>
                  {cityResult.shelter && (
                    <p className="text-xs text-[#5F6368] pt-1">
                      📍 Nearest Relief Center: <strong>{cityResult.shelter}</strong>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-black/5 flex items-center justify-end gap-2">
                <button
                  onClick={() => navigate('/map')}
                  className="px-3.5 py-1.5 bg-[#1A73E8] text-white text-xs font-bold rounded-xl hover:bg-[#1557B0] transition-colors"
                >
                  View on Live Map
                </button>
                <button
                  onClick={() => navigate('/safety')}
                  className="px-3.5 py-1.5 bg-white text-[#202124] border border-[#DADCE0] text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Citizen Safety Guide
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Primary 2 CTAs */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-7 py-3.5 bg-[#1A73E8] hover:bg-[#1557B0] text-white text-sm font-bold rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2"
          >
            <span>Open Early Warning Dashboard</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={() => navigate('/map')}
            className="px-7 py-3.5 bg-white hover:bg-gray-50 border border-[#DADCE0] text-[#202124] text-sm font-bold rounded-2xl shadow-2xs transition-all flex items-center gap-2"
          >
            <Compass size={16} className="text-[#1A73E8]" />
            <span>Interactive Risk Map</span>
          </button>
        </div>
      </section>

      {/* 4 CORE SOLUTION PILLARS - Uncluttered, generous spacing */}
      <section className="py-16 px-6 max-w-6xl mx-auto border-t border-[#E8EAED]">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#202124] tracking-tight">
            Comprehensive Crisis Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-[#5F6368]">
            Built with open hydrometric feeds from IMD and Central Water Commission.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Live Risk Map */}
          <div 
            onClick={() => navigate('/map')}
            className="bg-white p-6 rounded-3xl border border-[#E8EAED] hover:border-[#1A73E8] hover:shadow-sm transition-all cursor-pointer space-y-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1A73E8] flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Compass size={24} />
            </div>
            <h3 className="text-base font-bold text-[#202124] group-hover:text-[#1A73E8] transition-colors">
              Geospatial Threat Map
            </h3>
            <p className="text-xs text-[#5F6368] leading-relaxed">
              Explore flood basin contours, cyclonic landfall vectors, and live gauge markers across India.
            </p>
            <span className="text-xs font-bold text-[#1A73E8] inline-flex items-center gap-1">
              Explore Map <ArrowRight size={13} />
            </span>
          </div>

          {/* Card 2: Warnings & Alerts */}
          <div 
            onClick={() => navigate('/alerts')}
            className="bg-white p-6 rounded-3xl border border-[#E8EAED] hover:border-[#D93025] hover:shadow-sm transition-all cursor-pointer space-y-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#D93025] flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Bell size={24} />
            </div>
            <h3 className="text-base font-bold text-[#202124] group-hover:text-[#D93025] transition-colors">
              Instant Plain Warnings
            </h3>
            <p className="text-xs text-[#5F6368] leading-relaxed">
              Clear emergency directives, audio voice broadcasts, and 1-tap WhatsApp sharing for citizen safety.
            </p>
            <span className="text-xs font-bold text-[#D93025] inline-flex items-center gap-1">
              View Warnings <ArrowRight size={13} />
            </span>
          </div>

          {/* Card 3: River Gauges */}
          <div 
            onClick={() => navigate('/sensors')}
            className="bg-white p-6 rounded-3xl border border-[#E8EAED] hover:border-[#1E8E3E] hover:shadow-sm transition-all cursor-pointer space-y-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#1E8E3E] flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Waves size={24} />
            </div>
            <h3 className="text-base font-bold text-[#202124] group-hover:text-[#1E8E3E] transition-colors">
              River Level Telemetry
            </h3>
            <p className="text-xs text-[#5F6368] leading-relaxed">
              Live water level gauges for Brahmaputra, Mithi, Yamuna, and Ganga with danger mark status.
            </p>
            <span className="text-xs font-bold text-[#1E8E3E] inline-flex items-center gap-1">
              Check Gauges <ArrowRight size={13} />
            </span>
          </div>

          {/* Card 4: Relief Shelters */}
          <div 
            onClick={() => navigate('/response')}
            className="bg-white p-6 rounded-3xl border border-[#E8EAED] hover:border-[#E37400] hover:shadow-sm transition-all cursor-pointer space-y-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#E37400] flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Truck size={24} />
            </div>
            <h3 className="text-base font-bold text-[#202124] group-hover:text-[#E37400] transition-colors">
              Emergency Relief Shelters
            </h3>
            <p className="text-xs text-[#5F6368] leading-relaxed">
              Verified community camps with food, clean water, medical aid, and 24x7 in-charge contacts.
            </p>
            <span className="text-xs font-bold text-[#E37400] inline-flex items-center gap-1">
              Find Shelters <ArrowRight size={13} />
            </span>
          </div>

        </div>
      </section>

      {/* STAKEHOLDER ACCESS GATEWAYS (Citizens, NGOs, Government, First Responders) */}
      <section className="py-16 px-6 max-w-6xl mx-auto border-t border-[#E8EAED] bg-gradient-to-b from-white to-[#F8F9FA] rounded-3xl my-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A73E8] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Dedicated Stakeholder Gateways
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#202124] tracking-tight">
            Secure Access for Every Disaster Stakeholder
          </h2>
          <p className="text-xs sm:text-sm text-[#5F6368]">
            Log in with role-tailored dashboards, permissions, and specialized emergency response tools.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Stakeholder 1: Citizens */}
          <div className="bg-white p-5 rounded-2xl border border-[#DADCE0] hover:border-[#1A73E8] transition-all flex flex-col justify-between space-y-4 shadow-2xs">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1A73E8] flex items-center justify-center font-bold">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-sm font-bold text-[#202124]">Citizen & Residents</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                Hyperlocal risk radar, personalized safety checklists, nearby shelter maps, and SOS incident reports.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2 bg-blue-50 hover:bg-[#1A73E8] text-[#1A73E8] hover:text-white text-xs font-bold rounded-xl transition-colors text-center"
            >
              Sign In as Citizen &rarr;
            </button>
          </div>

          {/* Stakeholder 2: NGOs */}
          <div className="bg-white p-5 rounded-2xl border border-[#DADCE0] hover:border-[#1E8E3E] transition-all flex flex-col justify-between space-y-4 shadow-2xs">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1E8E3E] flex items-center justify-center font-bold">
                <Truck size={20} />
              </div>
              <h3 className="text-sm font-bold text-[#202124]">NGOs & Volunteer Teams</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                Relief camp supply management, food & water distribution tracking, and volunteer personnel deployment.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2 bg-emerald-50 hover:bg-[#1E8E3E] text-[#1E8E3E] hover:text-white text-xs font-bold rounded-xl transition-colors text-center"
            >
              Sign In as NGO Lead &rarr;
            </button>
          </div>

          {/* Stakeholder 3: Government NDMA */}
          <div className="bg-white p-5 rounded-2xl border border-[#DADCE0] hover:border-[#D93025] transition-all flex flex-col justify-between space-y-4 shadow-2xs">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#D93025] flex items-center justify-center font-bold">
                <ShieldAlert size={20} />
              </div>
              <h3 className="text-sm font-bold text-[#202124]">Govt & NDMA Authorities</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                Multi-channel early warning broadcast (SMS/Sirens), sensor threshold overrides, and evacuation orders.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2 bg-red-50 hover:bg-[#D93025] text-[#D93025] hover:text-white text-xs font-bold rounded-xl transition-colors text-center"
            >
              Sign In as Authority &rarr;
            </button>
          </div>

          {/* Stakeholder 4: First Responders */}
          <div className="bg-white p-5 rounded-2xl border border-[#DADCE0] hover:border-[#E37400] transition-all flex flex-col justify-between space-y-4 shadow-2xs">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#E37400] flex items-center justify-center font-bold">
                <Compass size={20} />
              </div>
              <h3 className="text-sm font-bold text-[#202124]">First Responders & NDRF</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                Tactical battalion telemetry, GPS casualty routing, field situation reports, and rescue logistics.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2 bg-amber-50 hover:bg-[#E37400] text-[#E37400] hover:text-white text-xs font-bold rounded-xl transition-colors text-center"
            >
              Sign In as Responder &rarr;
            </button>
          </div>

        </div>
      </section>

      {/* EMERGENCY SOS STRIP - Simple, High Contrast */}
      <section className="bg-white py-12 px-6 border-t border-[#E8EAED]">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-red-50 to-orange-50 p-6 md:p-8 rounded-3xl border border-red-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-[#202124] flex items-center justify-center md:justify-start gap-2">
              <PhoneCall size={20} className="text-[#D93025]" />
              <span>National Citizen Emergency Helplines</span>
            </h3>
            <p className="text-xs text-[#5F6368]">
              Immediate assistance for flood rescue, medical emergencies, and cyclone evacuations.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <a
              href="tel:112"
              className="px-5 py-2.5 bg-[#D93025] hover:bg-[#B31412] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              Dial 112 (National Emergency)
            </a>
            <a
              href="tel:1078"
              className="px-5 py-2.5 bg-white hover:bg-gray-50 border border-red-200 text-[#D93025] text-xs font-bold rounded-xl shadow-2xs transition-colors"
            >
              Dial 1078 (NDMA Disaster)
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-xs text-[#80868B] border-t border-[#E8EAED]">
        <p>SENTINEL Disaster Early Warning Platform • Synchronized with IMD, CWC & NDMA Telemetry</p>
      </footer>
    </div>
  );
};
