import React, { useState } from 'react';
import { useSensors } from '../hooks/useSentinelData';
import { MetricCard } from '../components/common/MetricCard';
import { LoadingSkeleton, ErrorState } from '../components/common/LoadingSkeleton';
import { 
  Radio, 
  Search, 
  Filter, 
  Waves, 
  CloudRain, 
  Mountain, 
  Thermometer, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info,
  RefreshCw,
  ExternalLink,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RiverStation {
  id: string;
  riverName: string;
  stationName: string;
  state: string;
  currentLevelM: number;
  warningLevelM: number;
  dangerLevelM: number;
  trend: 'rising' | 'falling' | 'steady';
  dischargeCusecs: string;
  status: 'critical' | 'warning' | 'normal';
}

const RIVER_STATIONS: RiverStation[] = [
  {
    id: 'cwc-brahma-pandu',
    riverName: 'Brahmaputra River',
    stationName: 'Pandu (Guwahati)',
    state: 'Assam',
    currentLevelM: 51.18,
    warningLevelM: 49.00,
    dangerLevelM: 49.70,
    trend: 'rising',
    dischargeCusecs: '28,400 m³/s',
    status: 'critical',
  },
  {
    id: 'cwc-mithi-kurla',
    riverName: 'Mithi River',
    stationName: 'Kurla Bridge (Bandra-Kurla Complex)',
    state: 'Maharashtra',
    currentLevelM: 4.82,
    warningLevelM: 3.50,
    dangerLevelM: 4.20,
    trend: 'rising',
    dischargeCusecs: '3,800 m³/s',
    status: 'critical',
  },
  {
    id: 'cwc-yamuna-delhi',
    riverName: 'Yamuna River',
    stationName: 'Old Railway Bridge (Delhi NCR)',
    state: 'Delhi',
    currentLevelM: 205.33,
    warningLevelM: 204.50,
    dangerLevelM: 205.33,
    trend: 'rising',
    dischargeCusecs: '14,200 m³/s',
    status: 'warning',
  },
  {
    id: 'cwc-ganga-patna',
    riverName: 'Ganga River',
    stationName: 'Gandhi Ghat (Patna)',
    state: 'Bihar',
    currentLevelM: 48.60,
    warningLevelM: 48.00,
    dangerLevelM: 49.50,
    trend: 'steady',
    dischargeCusecs: '32,100 m³/s',
    status: 'warning',
  },
  {
    id: 'cwc-mahanadi-cuttack',
    riverName: 'Mahanadi River',
    stationName: 'Jobra Barrage (Cuttack)',
    state: 'Odisha',
    currentLevelM: 21.40,
    warningLevelM: 22.00,
    dangerLevelM: 23.50,
    trend: 'steady',
    dischargeCusecs: '18,500 m³/s',
    status: 'normal',
  },
  {
    id: 'cwc-godavari-bhadrachalam',
    riverName: 'Godavari River',
    stationName: 'Bhadrachalam Bridge',
    state: 'Telangana',
    currentLevelM: 43.20,
    warningLevelM: 48.00,
    dangerLevelM: 53.00,
    trend: 'falling',
    dischargeCusecs: '9,400 m³/s',
    status: 'normal',
  },
  {
    id: 'cwc-kaveri-anicut',
    riverName: 'Kaveri River',
    stationName: 'Grand Anicut (Kallanai)',
    state: 'Tamil Nadu',
    currentLevelM: 14.10,
    warningLevelM: 16.50,
    dangerLevelM: 18.00,
    trend: 'steady',
    dischargeCusecs: '6,200 m³/s',
    status: 'normal',
  },
];

export const SensorsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: sensors, loading, error, refetch } = useSensors();

  const [activeTab, setActiveTab] = useState<'rivers' | 'rainfall' | 'all'>('rivers');
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredRivers = RIVER_STATIONS.filter(r => 
    !searchTerm || 
    r.riverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.stationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="sensors-page" className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8EAED] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#1A73E8] flex items-center justify-center font-bold">
              <Waves size={20} />
            </span>
            <h1 className="text-xl font-bold text-[#202124] tracking-tight">
              River Water Levels & Telemetry Gauges
            </h1>
          </div>
          <p className="text-xs md:text-sm text-[#5F6368] mt-1">
            Real-time hydrometric gauges maintained with Central Water Commission (CWC) and IMD Doppler Radars.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#F8F9FA] hover:bg-gray-100 border border-[#DADCE0] rounded-lg font-semibold text-[#202124] transition-colors"
          >
            <RefreshCw size={13} />
            <span>Sync Gauges</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-red-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5F6368] mb-1">
            <span className="font-bold uppercase tracking-wider text-[#D93025]">Above Danger Mark</span>
            <AlertTriangle size={16} className="text-[#D93025]" />
          </div>
          <div className="text-2xl font-bold text-[#D93025] font-mono">2 Rivers</div>
          <div className="text-[11px] text-[#5F6368] mt-1">Brahmaputra (+1.48m), Mithi River (+0.62m)</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5F6368] mb-1">
            <span className="font-bold uppercase tracking-wider text-[#E37400]">Above Warning Mark</span>
            <Waves size={16} className="text-[#E37400]" />
          </div>
          <div className="text-2xl font-bold text-[#E37400] font-mono">2 Rivers</div>
          <div className="text-[11px] text-[#5F6368] mt-1">Yamuna (Delhi), Ganga (Patna)</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5F6368] mb-1">
            <span className="font-bold uppercase tracking-wider text-[#1E8E3E]">Normal Safe Flow</span>
            <CheckCircle2 size={16} className="text-[#1E8E3E]" />
          </div>
          <div className="text-2xl font-bold text-[#1E8E3E] font-mono">3 Rivers</div>
          <div className="text-[11px] text-[#5F6368] mt-1">Mahanadi, Godavari, Kaveri</div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-[#E8EAED] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveTab('rivers')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'rivers'
                ? 'bg-[#1A73E8] text-white shadow-xs'
                : 'bg-[#F8F9FA] text-[#5F6368] hover:text-[#202124]'
            }`}
          >
            Major River Gauges ({RIVER_STATIONS.length})
          </button>
          <button
            onClick={() => setActiveTab('rainfall')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'rainfall'
                ? 'bg-[#1A73E8] text-white shadow-xs'
                : 'bg-[#F8F9FA] text-[#5F6368] hover:text-[#202124]'
            }`}
          >
            Rainfall & Soil Moisture
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search river or station..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-[#F8F9FA] text-xs text-[#202124] rounded-lg border border-[#DADCE0] focus:bg-white focus:border-[#1A73E8] outline-hidden w-56"
          />
          <Search size={14} className="absolute left-2.5 top-2.5 text-[#80868B]" />
        </div>
      </div>

      {/* RIVER GAUGES LIST */}
      {activeTab === 'rivers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRivers.map((station) => {
            const isCritical = station.status === 'critical';
            const isWarning = station.status === 'warning';
            
            // Calculate visual percentage relative to danger mark
            const pct = Math.min(100, Math.max(10, Math.round((station.currentLevelM / (station.dangerLevelM * 1.05)) * 100)));

            return (
              <div
                key={station.id}
                className={`bg-white p-5 rounded-2xl border transition-all shadow-xs space-y-4 ${
                  isCritical ? 'border-red-300 bg-red-50/20' : isWarning ? 'border-amber-200' : 'border-[#E8EAED]'
                }`}
              >
                {/* Station Title */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#202124]">
                        {station.riverName}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isCritical
                          ? 'bg-red-100 text-[#D93025]'
                          : isWarning
                          ? 'bg-amber-100 text-[#E37400]'
                          : 'bg-emerald-100 text-[#1E8E3E]'
                      }`}>
                        {isCritical ? '🚨 Exceeds Danger Mark' : isWarning ? '⚠️ Warning Level' : '🟢 Normal Level'}
                      </span>
                    </div>
                    <p className="text-xs text-[#5F6368] mt-0.5">
                      📍 {station.stationName}, {station.state}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold font-mono text-[#202124]">
                      {station.currentLevelM.toFixed(2)} m
                    </div>
                    <div className="text-[10px] text-[#80868B]">Current Level</div>
                  </div>
                </div>

                {/* Visual Level Gauge Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-[#5F6368]">
                    <span>Warning: {station.warningLevelM.toFixed(2)}m</span>
                    <span className="font-bold text-[#D93025]">Danger: {station.dangerLevelM.toFixed(2)}m</span>
                  </div>

                  <div className="w-full bg-[#F1F3F4] h-3 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isCritical ? 'bg-[#D93025]' : isWarning ? 'bg-[#E37400]' : 'bg-[#1E8E3E]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="pt-3 border-t border-[#F1F3F4] flex items-center justify-between text-xs text-[#5F6368]">
                  <span>Discharge: <strong>{station.dischargeCusecs}</strong></span>
                  <span className="flex items-center gap-1 font-semibold capitalize">
                    Trend: {station.trend}
                  </span>
                  <button
                    onClick={() => navigate('/map')}
                    className="text-[#1A73E8] font-bold hover:underline"
                  >
                    View Map →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RAINFALL TAB */}
      {activeTab === 'rainfall' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#E8EAED] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-[#5F6368]">
              <span className="font-bold text-[#202124]">Mumbai Santacruz AWS</span>
              <span className="px-1.5 py-0.5 bg-red-100 text-[#D93025] rounded font-bold text-[10px]">Extremely Heavy</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#D93025]">142.4 mm / 24h</div>
            <p className="text-xs text-[#5F6368]">IMD Automatic Weather Station, Mumbai Suburbs.</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E8EAED] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-[#5F6368]">
              <span className="font-bold text-[#202124]">Wayanad Meppadi Hill</span>
              <span className="px-1.5 py-0.5 bg-red-100 text-[#D93025] rounded font-bold text-[10px]">High InSAR Saturation</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#D93025]">210.0 mm / 24h</div>
            <p className="text-xs text-[#5F6368]">Soil moisture index at 94.2% (Debris flow risk).</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E8EAED] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-[#5F6368]">
              <span className="font-bold text-[#202124]">Guwahati Borjhar Station</span>
              <span className="px-1.5 py-0.5 bg-amber-100 text-[#E37400] rounded font-bold text-[10px]">Heavy Rainfall</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#E37400]">88.5 mm / 24h</div>
            <p className="text-xs text-[#5F6368]">Continuous monsoon precipitation over catchment area.</p>
          </div>
        </div>
      )}
    </div>
  );
};
