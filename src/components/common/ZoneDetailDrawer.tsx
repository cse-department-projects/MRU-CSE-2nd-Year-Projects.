import React, { useState } from 'react';
import { RiskZone } from '../../types';
import { SeverityBadge } from './SeverityBadge';
import { 
  X, 
  Users, 
  Activity, 
  TrendingUp, 
  Clock, 
  ShieldAlert, 
  Send, 
  Radio, 
  CheckCircle,
  Building,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ZoneDetailDrawerProps {
  zone: RiskZone | null;
  onClose: () => void;
  onDispatch?: (zone: RiskZone) => void;
}

export const ZoneDetailDrawer: React.FC<ZoneDetailDrawerProps> = ({
  zone,
  onClose,
  onDispatch
}) => {
  const [dispatched, setDispatched] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);

  if (!zone) return null;

  const handleDispatch = () => {
    setDispatched(true);
    if (onDispatch) onDispatch(zone);
    setTimeout(() => setDispatched(false), 4000);
  };

  const handleBroadcast = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 4000);
  };

  return (
    <div 
      id="zone-detail-drawer"
      className="bg-white border-l border-[#E8EAED] shadow-xl flex flex-col h-full max-h-full overflow-y-auto w-full sm:w-96 z-40 transition-all"
    >
      {/* Header */}
      <div className="p-4 border-b border-[#E8EAED] flex items-start justify-between bg-[#F8F9FA] sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <SeverityBadge severity={zone.severity} size="sm" pulse={zone.severity === 'critical'} />
            <span className="text-[11px] font-semibold text-[#5F6368] uppercase tracking-wider">
              {zone.hazardType} Hazard
            </span>
          </div>
          <h3 className="text-base font-bold text-[#202124] leading-snug">
            {zone.name}
          </h3>
          <div className="flex items-center gap-1 text-xs text-[#5F6368] mt-1">
            <MapPin size={12} className="text-[#80868B]" />
            <span>{zone.region}, {zone.state}</span>
          </div>
        </div>
        <button
          id="btn-close-zone-drawer"
          onClick={onClose}
          className="p-1 text-[#5F6368] hover:text-[#202124] hover:bg-gray-200 rounded-md transition-colors"
          aria-label="Close panel"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4 text-xs text-[#202124]">
        {/* Risk Score Highlight */}
        <div className="g-card-flat p-3.5 bg-gray-50 border border-[#E8EAED] rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-[#5F6368] uppercase text-[11px]">Composite Risk Score</span>
            <span className="text-lg font-bold text-[#D93025]">{zone.riskScore}/100</span>
          </div>
          <div className="w-full bg-[#E8EAED] rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                zone.severity === 'critical' ? 'bg-[#D93025]' :
                zone.severity === 'high' ? 'bg-[#E37400]' :
                zone.severity === 'moderate' ? 'bg-[#F9AB00]' : 'bg-[#1E8E3E]'
              }`}
              style={{ width: `${zone.riskScore}%` }}
            />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#5F6368] mt-2">
            <TrendingUp size={13} className="text-[#D93025]" />
            <span>Predicted escalation: <strong className="text-[#202124]">{zone.predictedEscalation}</strong></span>
          </div>
        </div>

        {/* Narrative Description */}
        <div>
          <h4 className="font-semibold text-[#5F6368] uppercase text-[11px] mb-1">Incident Assessment</h4>
          <p className="text-[13px] text-[#3C4043] leading-relaxed bg-[#F8F9FA] p-3 rounded border border-[#E8EAED]">
            {zone.description}
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="g-card-flat p-2.5 bg-white border border-[#E8EAED] rounded">
            <div className="flex items-center gap-1.5 text-[#5F6368] text-[11px] mb-1">
              <Users size={13} className="text-[#1A73E8]" />
              <span>Pop. Exposed</span>
            </div>
            <p className="text-sm font-bold text-[#202124]">
              {zone.populationExposed.toLocaleString()}
            </p>
          </div>

          <div className="g-card-flat p-2.5 bg-white border border-[#E8EAED] rounded">
            <div className="flex items-center gap-1.5 text-[#5F6368] text-[11px] mb-1">
              <Activity size={13} className="text-[#1E8E3E]" />
              <span>Sensors Grid</span>
            </div>
            <p className="text-sm font-bold text-[#202124]">
              {zone.activeSensorsCount} <span className="text-[11px] font-normal text-[#5F6368]">active ({zone.criticalSensorsCount} alert)</span>
            </p>
          </div>

          <div className="g-card-flat p-2.5 bg-white border border-[#E8EAED] rounded">
            <div className="flex items-center gap-1.5 text-[#5F6368] text-[11px] mb-1">
              <ShieldAlert size={13} className="text-[#E37400]" />
              <span>Evacuation</span>
            </div>
            <p className="text-xs font-bold uppercase text-[#202124]">
              {zone.evacuationStatus}
            </p>
          </div>

          <div className="g-card-flat p-2.5 bg-white border border-[#E8EAED] rounded">
            <div className="flex items-center gap-1.5 text-[#5F6368] text-[11px] mb-1">
              <Building size={13} className="text-[#5F6368]" />
              <span>Vulnerable Assets</span>
            </div>
            <p className="text-sm font-bold text-[#202124]">
              {zone.vulnerableStructuresCount} structures
            </p>
          </div>
        </div>

        {/* Sync Info */}
        <div className="flex items-center justify-between text-[11px] text-[#80868B] pt-2 border-t border-[#E8EAED]">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>Updated {zone.lastUpdated}</span>
          </div>
          <span className="text-[#1E8E3E] font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E8E3E]" />
            Telemetry Live
          </span>
        </div>

        {/* Action Controls */}
        <div className="space-y-2 pt-2 border-t border-[#E8EAED]">
          <h4 className="font-semibold text-[#5F6368] uppercase text-[11px]">Command Actions</h4>
          
          <button
            id={`btn-dispatch-${zone.id}`}
            onClick={handleDispatch}
            disabled={dispatched}
            className={`w-full py-2 px-3 text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors ${
              dispatched 
                ? 'bg-emerald-600 text-white' 
                : 'bg-[#1A73E8] hover:bg-[#1557B0] text-white shadow-xs'
            }`}
          >
            {dispatched ? (
              <>
                <CheckCircle size={14} />
                SDRF & NDRF Unit Dispatched!
              </>
            ) : (
              <>
                <Send size={14} />
                Dispatch Response Unit
              </>
            )}
          </button>

          <button
            id={`btn-broadcast-${zone.id}`}
            onClick={handleBroadcast}
            disabled={broadcastSent}
            className={`w-full py-2 px-3 text-xs font-semibold rounded border flex items-center justify-center gap-2 transition-colors ${
              broadcastSent
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-white hover:bg-gray-50 text-[#202124] border-[#DADCE0]'
            }`}
          >
            {broadcastSent ? (
              <>
                <CheckCircle size={14} className="text-[#E37400]" />
                Public Cell Broadcast Sent (Simulated)
              </>
            ) : (
              <>
                <Radio size={14} className="text-[#E37400]" />
                Issue Public Cell Broadcast
              </>
            )}
          </button>

          <Link
            to={`/sensors?zone=${zone.id}`}
            className="w-full py-1.5 text-center text-xs text-[#1A73E8] hover:underline flex items-center justify-center gap-1 mt-1"
          >
            <span>View all {zone.activeSensorsCount} sensors in this zone</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
};
