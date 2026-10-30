import React, { useState } from 'react';
import { usePredictions } from '../hooks/useSentinelData';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { LoadingSkeleton, ErrorState } from '../components/common/LoadingSkeleton';
import { 
  BrainCircuit, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  Waves,
  Wind,
  Mountain,
  Sun,
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PredictionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: predictions, loading, error, refetch } = usePredictions();
  const [selectedHazard, setSelectedHazard] = useState('all');

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton rows={4} height="h-36" />
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={refetch} message={error} />;
  }

  const filtered = predictions.filter(p => {
    if (selectedHazard === 'all') return true;
    return p.hazardType.toLowerCase().includes(selectedHazard.toLowerCase());
  });

  return (
    <div id="predictions-page" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8EAED] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#1A73E8] flex items-center justify-center font-bold">
              <BrainCircuit size={20} />
            </span>
            <h1 className="text-xl font-bold text-[#202124] tracking-tight">
              72-Hour Disaster Escalation Forecast
            </h1>
          </div>
          <p className="text-xs md:text-sm text-[#5F6368] mt-1">
            Predictive AI models forecasting flood crests, cyclonic storm surges, and landslide risk window for the next 24 to 72 hours.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            id="filter-pred-hazard"
            value={selectedHazard}
            onChange={e => setSelectedHazard(e.target.value)}
            className="px-3 py-1.5 bg-[#F8F9FA] rounded-lg border border-[#DADCE0] text-xs text-[#202124] focus:border-[#1A73E8] outline-hidden cursor-pointer"
          >
            <option value="all">All Hazard Forecasts</option>
            <option value="flood">🌊 Flood Forecasts</option>
            <option value="cyclone">🌀 Cyclone Tracks</option>
            <option value="landslide">⛰️ Landslide Windows</option>
            <option value="heat">☀️ Heat Dome Risk</option>
          </select>
        </div>
      </div>

      {/* Model Accuracy & Scope Card */}
      <div className="bg-gradient-to-r from-blue-50/60 to-indigo-50/40 p-4 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#1A73E8] font-bold">
          <Info size={16} />
          <span>Continuous Hydrological & Atmospheric Forecast Engine</span>
        </div>
        <div className="flex items-center gap-4 text-[#5F6368]">
          <span>Confidence Score: <strong className="text-emerald-700 font-bold">88.4%</strong></span>
          <span>Forecast Horizon: <strong className="text-[#202124]">24h – 72h Ahead</strong></span>
        </div>
      </div>

      {/* PREDICTIONS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((pred) => {
          const isCritical = pred.severity === 'critical';
          const isHigh = pred.severity === 'high';

          return (
            <div
              key={pred.id}
              className={`bg-white p-5 rounded-2xl border transition-all shadow-xs space-y-3.5 ${
                isCritical ? 'border-red-200 hover:border-red-300' : isHigh ? 'border-amber-200' : 'border-[#E8EAED]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={pred.severity} size="sm" />
                    <span className="text-xs font-bold text-[#202124]">{pred.hazardType}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#202124] mt-1">
                    {pred.title}
                  </h3>
                  <p className="text-xs text-[#5F6368] mt-0.5">
                    📍 Target Region: <strong>{pred.targetRegion}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-[#D93025]">
                    {pred.probabilityPercent}%
                  </div>
                  <div className="text-[10px] text-[#80868B]">Escalation Probability</div>
                </div>
              </div>

              {/* Forecast Time Horizon Bar */}
              <div className="p-2.5 rounded-lg bg-[#F8F9FA] border border-[#E8EAED] flex items-center justify-between text-xs text-[#5F6368]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock size={13} className="text-[#1A73E8]" />
                  Window: <strong>{pred.timeHorizon}</strong>
                </span>
                <span className="flex items-center gap-1 font-semibold text-[#D93025]">
                  <TrendingUp size={13} />
                  +{pred.deltaPercent}% Surge Trend
                </span>
              </div>

              {/* Key Environmental Drivers */}
              <div className="space-y-1 text-xs">
                <span className="text-[11px] font-bold text-[#80868B] uppercase">Trigger Factors:</span>
                <div className="flex flex-wrap gap-1">
                  {pred.keyDrivers.map((driver, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-gray-100 text-[#3C4043] text-[11px]"
                    >
                      • {driver}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Action */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs">
                <span className="font-bold text-[#1A73E8] block mb-0.5">Recommended Precaution:</span>
                <p className="text-[#202124] leading-relaxed font-medium">
                  {pred.recommendedAction}
                </p>
              </div>

              <div className="pt-2 border-t border-[#F1F3F4] flex items-center justify-between text-xs">
                <span className="text-[#80868B] text-[11px]">Model: {pred.modelName}</span>
                <button
                  onClick={() => navigate('/alerts')}
                  className="text-[#1A73E8] font-bold hover:underline"
                >
                  View Active Directives →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
