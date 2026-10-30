import React, { useState } from 'react';
import { 
  useDashboardMetrics, 
  useRiskZones, 
  useAlerts, 
  useSensors 
} from '../hooks/useSentinelData';
import { MetricCard } from '../components/common/MetricCard';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { SentinelMap } from '../components/map/SentinelMap';
import { CardSkeleton, ErrorState } from '../components/common/LoadingSkeleton';
import { 
  Bell, 
  ShieldAlert, 
  Radio, 
  BrainCircuit, 
  ArrowUpRight, 
  Search, 
  MapPin, 
  PhoneCall, 
  ShieldCheck, 
  AlertTriangle, 
  Navigation, 
  Waves, 
  Wind, 
  Mountain, 
  Sun, 
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: metrics, loading: metricsLoading, error: metricsError, refetch } = useDashboardMetrics();
  const { data: zones } = useRiskZones();
  const { data: alerts } = useAlerts();
  const { data: sensors } = useSensors();

  // City Safety Search State
  const [searchLocation, setSearchLocation] = useState('');
  const [searchedCityData, setSearchedCityData] = useState<{
    cityName: string;
    status: 'safe' | 'warning' | 'critical';
    hazard?: string;
    details: string;
    shelterDistance?: string;
    shelterName?: string;
    zoneId?: string;
  } | null>(null);

  const [selectedHazardFilter, setSelectedHazardFilter] = useState<'all' | 'flood' | 'cyclone' | 'landslide'>('all');

  const popularCities = ['Mumbai', 'Guwahati', 'Wayanad', 'Puri', 'Delhi', 'Bengaluru'];

  const handleCitySearch = (query: string) => {
    const q = query.trim().toLowerCase();
    setSearchLocation(query);

    if (!q) {
      setSearchedCityData(null);
      return;
    }

    const matchedZone = zones.find(z => 
      z.name.toLowerCase().includes(q) || 
      z.region.toLowerCase().includes(q) || 
      z.state.toLowerCase().includes(q)
    );

    if (matchedZone) {
      setSearchedCityData({
        cityName: matchedZone.name,
        status: matchedZone.severity === 'critical' ? 'critical' : 'warning',
        hazard: matchedZone.hazardType,
        details: matchedZone.description,
        shelterDistance: '1.4 km away',
        shelterName: `${matchedZone.region} Civic Relief Center`,
        zoneId: matchedZone.id
      });
    } else {
      setSearchedCityData({
        cityName: query,
        status: 'safe',
        details: 'No active flood warnings, cyclonic storm alerts, or landslide advisories for this area.',
        shelterDistance: '2.8 km away',
        shelterName: 'District Community Hall'
      });
    }
  };

  if (metricsLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <CardSkeleton count={4} />
        <div className="h-96 bg-gray-100 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (metricsError || !metrics) {
    return <ErrorState onRetry={refetch} message={metricsError || undefined} />;
  }

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const criticalZones = zones.filter(z => z.severity === 'critical');

  const filteredZones = zones.filter(z => {
    if (selectedHazardFilter === 'all') return true;
    return z.hazardType.toLowerCase().includes(selectedHazardFilter);
  });

  return (
    <div id="dashboard-page" className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* 1. HERO AREA SAFETY SEARCH - Clean & Spacious */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8EAED] shadow-xs space-y-5">
        <div className="max-w-3xl space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1E8E3E] inline-block animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#1A73E8]">
              Instant Citizen Safety Check
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight">
            Check Your Area Safety & Evacuation Directives
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6368]">
            Real-time flood status, cyclone paths, and nearby relief camps across India.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-3.5 text-[#80868B]" />
            <input
              id="input-city-safety-search"
              type="text"
              placeholder="Search your city or district (e.g. Mumbai, Guwahati, Wayanad)..."
              value={searchLocation}
              onChange={e => handleCitySearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#F8F9FA] hover:bg-[#F1F3F4] focus:bg-white text-sm text-[#202124] rounded-2xl border border-[#DADCE0] focus:border-[#1A73E8] focus:ring-2 focus:ring-blue-100 outline-hidden transition-all placeholder-[#80868B]"
            />
          </div>

          <button
            id="btn-use-current-location"
            onClick={() => handleCitySearch('Mumbai')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-[#1A73E8] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl transition-colors shrink-0"
          >
            <Navigation size={14} />
            <span>Use My Location</span>
          </button>
        </div>

        {/* Quick-Select Chips */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-[#5F6368]">
          <span className="text-[11px] font-semibold text-[#80868B]">Suggested:</span>
          {popularCities.map(city => (
            <button
              key={city}
              onClick={() => handleCitySearch(city)}
              className="px-3 py-1 bg-[#F8F9FA] hover:bg-blue-50 hover:text-[#1A73E8] border border-[#E8EAED] rounded-xl text-xs font-medium transition-colors"
            >
              {city}
            </button>
          ))}
        </div>

        {/* SEARCH RESULT VERDICT BANNER */}
        {searchedCityData && (
          <div className={`p-5 rounded-2xl border transition-all ${
            searchedCityData.status === 'safe'
              ? 'bg-emerald-50/70 border-emerald-200'
              : 'bg-red-50/70 border-red-200'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl shrink-0 text-white ${
                  searchedCityData.status === 'safe' ? 'bg-[#1E8E3E]' : 'bg-[#D93025]'
                }`}>
                  {searchedCityData.status === 'safe' ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#202124]">
                      {searchedCityData.cityName}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      searchedCityData.status === 'safe'
                        ? 'bg-emerald-100 text-[#1E8E3E]'
                        : 'bg-red-100 text-[#D93025]'
                    }`}>
                      {searchedCityData.status === 'safe' ? 'Safe • No Active Alerts' : `${searchedCityData.hazard} Warning Active`}
                    </span>
                  </div>
                  <p className="text-xs text-[#3C4043] leading-relaxed">
                    {searchedCityData.details}
                  </p>
                  {searchedCityData.shelterName && (
                    <p className="text-xs text-[#5F6368] pt-1">
                      📍 Designated Relief Camp: <strong>{searchedCityData.shelterName}</strong> ({searchedCityData.shelterDistance})
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {searchedCityData.zoneId && (
                  <button
                    onClick={() => navigate(`/map?zone=${searchedCityData.zoneId}`)}
                    className="px-4 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    View Map Hotspot
                  </button>
                )}
                <Link
                  to="/safety"
                  className="px-4 py-2 bg-white hover:bg-gray-50 border border-[#DADCE0] text-[#202124] text-xs font-bold rounded-xl transition-colors"
                >
                  Citizen Guide
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. 4 SPACIOUS METRIC TILES */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div 
          onClick={() => navigate('/alerts')}
          className="bg-white p-5 rounded-3xl border border-[#E8EAED] hover:border-red-300 hover:shadow-xs transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5F6368] uppercase tracking-wider">Active Warnings</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#D93025] flex items-center justify-center">
              <Bell size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#D93025] tracking-tight">{metrics.activeAlerts}</div>
            <p className="text-xs text-[#5F6368] mt-1">{metrics.criticalAlerts} Critical Emergencies</p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/map')}
          className="bg-white p-5 rounded-3xl border border-[#E8EAED] hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5F6368] uppercase tracking-wider">Monitored Basins</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#E37400] flex items-center justify-center">
              <ShieldAlert size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#E37400] tracking-tight">{metrics.criticalZones} High Risk</div>
            <p className="text-xs text-[#5F6368] mt-1">of {metrics.totalZones} river basins tracked</p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/sensors')}
          className="bg-white p-5 rounded-3xl border border-[#E8EAED] hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5F6368] uppercase tracking-wider">River Stations</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#1E8E3E] flex items-center justify-center">
              <Radio size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#1E8E3E] tracking-tight">{metrics.sensorsOnline} Online</div>
            <p className="text-xs text-[#5F6368] mt-1">98.7% reporting hydrometric flow</p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/response')}
          className="bg-white p-5 rounded-3xl border border-[#E8EAED] hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5F6368] uppercase tracking-wider">Relief Shelters</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1A73E8] flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#1A73E8] tracking-tight">4,900+</div>
            <p className="text-xs text-[#5F6368] mt-1">Available beds in relief camps</p>
          </div>
        </div>
      </section>

      {/* 3. MAIN SECTION: Live Risk Map & Clean Warning Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Map Preview (8 Cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-3xl border border-[#E8EAED] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#202124] flex items-center gap-2">
                <span>Live Disaster Contours & River Gauges</span>
                <span className="w-2 h-2 rounded-full bg-[#D93025] animate-ping" />
              </h2>
              <p className="text-xs text-[#5F6368] mt-0.5">
                Click any zone marker to inspect flood levels, surge predictions, and relief centers.
              </p>
            </div>

            <Link
              to="/map"
              className="text-xs font-bold text-[#1A73E8] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Full Screen Map</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* Hazard Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedHazardFilter('all')}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
                selectedHazardFilter === 'all'
                  ? 'bg-[#1A73E8] text-white shadow-xs'
                  : 'bg-[#F1F3F4] text-[#5F6368] hover:text-[#202124]'
              }`}
            >
              All Hazards
            </button>
            <button
              onClick={() => setSelectedHazardFilter('flood')}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 ${
                selectedHazardFilter === 'flood'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <Waves size={13} />
              <span>Floods ({zones.filter(z => z.hazardType === 'Flood').length})</span>
            </button>
            <button
              onClick={() => setSelectedHazardFilter('cyclone')}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 ${
                selectedHazardFilter === 'cyclone'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <Wind size={13} />
              <span>Cyclone</span>
            </button>
            <button
              onClick={() => setSelectedHazardFilter('landslide')}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 ${
                selectedHazardFilter === 'landslide'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              <Mountain size={13} />
              <span>Landslide</span>
            </button>
          </div>

          {/* Map Canvas */}
          <div className="rounded-2xl overflow-hidden border border-[#E8EAED]">
            <SentinelMap
              riskZones={filteredZones}
              sensors={sensors}
              alerts={alerts}
              height="h-[400px] md:h-[440px]"
              isDashboardPreview={true}
            />
          </div>

          {/* Quick Basin Chips */}
          <div className="pt-2 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-[11px] font-bold text-[#80868B] uppercase whitespace-nowrap">
              Priority Hotspots:
            </span>
            {criticalZones.map(zone => (
              <button
                key={zone.id}
                onClick={() => navigate(`/map?zone=${zone.id}`)}
                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-[#D93025] font-semibold text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#D93025]" />
                <span>{zone.name.split('&')[0].trim()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right 4 Cols: Active Warnings & Citizen Action */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Active Warnings Card */}
          <div className="bg-white p-5 rounded-3xl border border-[#E8EAED] shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8EAED]">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                  Active Disaster Alerts
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-[#D93025]">
                  {activeAlerts.length}
                </span>
              </div>
              <Link to="/alerts" className="text-xs font-bold text-[#1A73E8] hover:underline">
                View All
              </Link>
            </div>

            <div className="divide-y divide-[#F1F3F4] max-h-[300px] overflow-y-auto pr-1">
              {activeAlerts.slice(0, 3).map(alert => (
                <div key={alert.id} className="py-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <SeverityBadge severity={alert.severity} size="sm" pulse={alert.severity === 'critical'} />
                    <span className="text-[10px] text-[#80868B]">{alert.timestamp}</span>
                  </div>
                  <h4 className="font-bold text-[#202124] leading-snug">
                    {alert.title}
                  </h4>
                  <p className="text-[11px] text-[#5F6368] line-clamp-2">
                    {alert.instruction}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Citizen SOS Card */}
          <div className="bg-gradient-to-br from-red-50 to-white p-5 rounded-3xl border border-red-200 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#D93025] text-white flex items-center justify-center shadow-xs">
                <PhoneCall size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#202124]">Citizen Emergency Helpline</h4>
                <p className="text-xs text-[#5F6368]">24x7 Direct Emergency Dispatch</p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <a
                href="tel:112"
                className="flex-1 py-2.5 bg-[#D93025] hover:bg-[#B31412] text-white text-center text-xs font-bold rounded-xl transition-colors shadow-2xs"
              >
                Call 112
              </a>
              <Link
                to="/safety"
                className="flex-1 py-2.5 bg-white hover:bg-gray-50 border border-red-200 text-[#D93025] text-center text-xs font-bold rounded-xl transition-colors"
              >
                Safety Guide
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
