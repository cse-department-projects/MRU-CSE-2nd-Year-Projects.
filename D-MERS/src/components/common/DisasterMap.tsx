import React, { useState } from 'react';
import { IncidentReport, Shelter } from '../../types';
import { MapPin, Navigation, Home, ShieldAlert, AlertTriangle, Users } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

interface DisasterMapProps {
  incidents: IncidentReport[];
  shelters: Shelter[];
  onSelectIncident?: (incident: IncidentReport) => void;
}

export const DisasterMap: React.FC<DisasterMapProps> = ({
  incidents,
  shelters,
  onSelectIncident,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'shelters'>('all');
  const [selectedPin, setSelectedPin] = useState<{ type: 'incident' | 'shelter'; item: IncidentReport | Shelter } | null>(null);

  const filteredIncidents = incidents.filter(inc => {
    if (activeFilter === 'critical') return inc.priority_score >= 80;
    if (activeFilter === 'shelters') return false;
    return true;
  });

  const filteredShelters = activeFilter === 'critical' ? [] : shelters;

  return (
    <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">
      {/* Map Control Bar */}
      <div className="bg-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <Navigation className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Live Emergency Tactical Map</h3>
            <p className="text-xs text-slate-400">Spatial Command Grid • Real-time Monitoring</p>
          </div>
        </div>

        {/* Map Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeFilter === 'all' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            All Live Markers ({incidents.length + shelters.length})
          </button>
          <button
            onClick={() => setActiveFilter('critical')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeFilter === 'critical' ? 'bg-red-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            Critical Incidents ({incidents.filter(i => i.priority_score >= 80).length})
          </button>
          <button
            onClick={() => setActiveFilter('shelters')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeFilter === 'shelters' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            Relief Shelters ({shelters.length})
          </button>
        </div>
      </div>

      {/* Interactive Map Visual Surface */}
      <div className="relative w-full h-[400px] bg-slate-100 overflow-hidden flex items-center justify-center">
        {/* SVG Grid Overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E3A8A" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Simulated River / Terrain Lines */}
          <path d="M 0 150 Q 300 250 800 120 T 1400 300" fill="none" stroke="#3B82F6" strokeWidth="12" opacity="0.3" />
        </svg>

        {/* Tactical Legend */}
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-md text-xs space-y-1.5">
          <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider mb-1">Map Indicators</div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 ring-4 ring-red-100 animate-pulse"></span>
            <span className="text-slate-700">Critical Emergency SOS (Score 80+)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-slate-700">High / Medium Incident</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
            <span className="text-slate-700">Active Relief Shelter</span>
          </div>
        </div>

        {/* Incident Map Markers */}
        {filteredIncidents.map((inc, index) => {
          // Normalize lat/lng to grid percentages for visual plotting
          const posX = 15 + ((index * 27) % 70);
          const posY = 20 + ((index * 31) % 60);
          const isCritical = inc.priority_score >= 80;

          return (
            <div
              key={inc.id}
              onClick={() => {
                setSelectedPin({ type: 'incident', item: inc });
                if (onSelectIncident) onSelectIncident(inc);
              }}
              style={{ left: `${posX}%`, top: `${posY}%` }}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-transform hover:scale-125"
            >
              <div className="relative">
                {isCritical && (
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></span>
                )}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white ${
                    isCritical ? 'bg-red-600 shadow-red-300' : 'bg-amber-500 shadow-amber-200'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
                {/* Tooltip Preview */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl pointer-events-none whitespace-normal text-center z-30">
                  <div className="font-bold">{inc.title}</div>
                  <div className="text-red-300 font-semibold">Priority Score: {inc.priority_score}</div>
                  <div className="text-slate-400">{inc.location_name}</div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Shelter Map Markers */}
        {filteredShelters.map((sh, index) => {
          const posX = 25 + ((index * 33) % 65);
          const posY = 30 + ((index * 23) % 55);

          return (
            <div
              key={sh.id}
              onClick={() => setSelectedPin({ type: 'shelter', item: sh })}
              style={{ left: `${posX}%`, top: `${posY}%` }}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-transform hover:scale-125"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-lg border-2 border-white">
                  <Home className="w-4 h-4" />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl pointer-events-none whitespace-normal text-center z-30">
                  <div className="font-bold">{sh.name}</div>
                  <div className="text-emerald-300">{sh.current_occupancy} / {sh.capacity} Capacity</div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Selected Marker Detail Modal Overlay */}
        {selectedPin && (
          <div className="absolute bottom-4 right-4 z-40 w-80 bg-white p-4 rounded-2xl shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {selectedPin.type === 'incident' ? 'Disaster Report' : 'Relief Shelter'}
              </span>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {selectedPin.type === 'incident' ? (
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 text-sm">{(selectedPin.item as IncidentReport).title}</h4>
                <div className="flex items-center justify-between">
                  <PriorityBadge score={(selectedPin.item as IncidentReport).priority_score} />
                  <StatusBadge status={(selectedPin.item as IncidentReport).status} />
                </div>
                <p className="text-slate-600 line-clamp-2">{(selectedPin.item as IncidentReport).description}</p>
                <div className="flex items-center gap-1 text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>{(selectedPin.item as IncidentReport).location_name}</span>
                </div>
                <div className="pt-2 flex justify-between items-center text-slate-700 border-t border-slate-100">
                  <span>People Needing Help: <strong>{(selectedPin.item as IncidentReport).people_needing_help}</strong></span>
                  <span className="text-blue-600 font-semibold">
                    {(selectedPin.item as IncidentReport).assigned_rescue_team_name || 'Unassigned'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 text-sm">{(selectedPin.item as Shelter).name}</h4>
                <div className="flex items-center gap-1 text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{(selectedPin.item as Shelter).location}</span>
                </div>
                <div className="bg-emerald-50 p-2 rounded-xl text-emerald-900 flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-emerald-600" /> Current Occupancy:
                  </span>
                  <span className="font-bold text-sm">
                    {(selectedPin.item as Shelter).current_occupancy} / {(selectedPin.item as Shelter).capacity}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Contact: {(selectedPin.item as Shelter).contact_person} ({(selectedPin.item as Shelter).contact_phone})
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
