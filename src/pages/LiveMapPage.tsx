import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRiskZones, useSensors, useAlerts, useResponseUnits } from '../hooks/useSentinelData';
import { SentinelMap } from '../components/map/SentinelMap';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { RiskZone } from '../types';
import { 
  Filter, 
  MapPin, 
  Users, 
  Search, 
  Navigation,
  Waves,
  Wind,
  Mountain,
  Sun,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const LiveMapPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const zoneParam = searchParams.get('zone');

  const { data: zones } = useRiskZones();
  const { data: sensors } = useSensors();
  const { data: alerts } = useAlerts();
  const { data: units } = useResponseUnits();

  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedHazard, setSelectedHazard] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (zoneParam && zones.length > 0) {
      const z = zones.find(item => item.id === zoneParam);
      if (z) setSelectedZone(z);
    }
  }, [zoneParam, zones]);

  const filteredZones = zones.filter(zone => {
    const matchSeverity = selectedSeverity === 'all' || zone.severity === selectedSeverity;
    const matchHazard = selectedHazard === 'all' || zone.hazardType.toLowerCase() === selectedHazard.toLowerCase();
    const matchSearch = !searchTerm || 
      zone.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      zone.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.state.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSeverity && matchHazard && matchSearch;
  });

  const handleZoneSelect = (zone: RiskZone | null) => {
    setSelectedZone(zone);
    if (zone) {
      setSearchParams({ zone: zone.id });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div id="live-map-page" className="space-y-4">
      {/* Header and Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8EAED] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#202124] tracking-tight flex items-center gap-2">
            <span>Live Geospatial Disaster Risk Map</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#1E8E3E] inline-block animate-pulse" />
          </h1>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Interactive hazard contours, real-time river level pins, and designated emergency relief zones.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Search Box */}
          <div className="relative">
            <input
              id="map-zone-search"
              type="text"
              placeholder="Search region or city..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-7 pr-3 py-1.5 bg-[#F8F9FA] text-xs rounded-lg border border-[#DADCE0] focus:bg-white focus:border-[#1A73E8] outline-hidden w-44"
            />
            <Search size={13} className="absolute left-2.5 top-2.5 text-[#80868B]" />
          </div>

          {/* Hazard Filter */}
          <select
            id="filter-map-hazard"
            value={selectedHazard}
            onChange={e => setSelectedHazard(e.target.value)}
            className="px-2.5 py-1.5 bg-[#F8F9FA] rounded-lg border border-[#DADCE0] text-[#202124] focus:border-[#1A73E8] outline-hidden cursor-pointer"
          >
            <option value="all">All Hazards</option>
            <option value="flood">🌊 Floods</option>
            <option value="cyclone">🌀 Cyclones</option>
            <option value="landslide">⛰️ Landslides</option>
            <option value="heatwave">☀️ Heatwaves</option>
          </select>

          {/* Severity Filter */}
          <select
            id="filter-map-severity"
            value={selectedSeverity}
            onChange={e => setSelectedSeverity(e.target.value)}
            className="px-2.5 py-1.5 bg-[#F8F9FA] rounded-lg border border-[#DADCE0] text-[#202124] focus:border-[#1A73E8] outline-hidden cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Risk</option>
            <option value="high">High Risk</option>
            <option value="moderate">Moderate Risk</option>
          </select>
        </div>
      </div>

      {/* Main Map View + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Monitored Sectors Sidebar (4 Cols) */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8EAED] shadow-xs flex flex-col h-[620px] lg:col-span-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8EAED]">
            <span className="font-bold text-xs text-[#202124] uppercase tracking-wide">
              Monitored Hazard Hotspots ({filteredZones.length})
            </span>
            <span className="text-[10px] text-[#80868B]">Click to zoom</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mt-2 pr-1">
            {filteredZones.map(zone => {
              const isSelected = selectedZone?.id === zone.id;
              const isCritical = zone.severity === 'critical';

              return (
                <div
                  key={zone.id}
                  id={`zone-item-${zone.id}`}
                  onClick={() => handleZoneSelect(zone)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 border-[#1A73E8] shadow-xs'
                      : isCritical
                      ? 'bg-red-50/30 border-red-200 hover:border-red-300'
                      : 'bg-[#F8F9FA] border-[#E8EAED] hover:bg-white hover:border-[#DADCE0]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5 mb-1">
                    <h4 className="font-bold text-[#202124] leading-snug line-clamp-1">
                      {zone.name}
                    </h4>
                    <span className="font-mono font-bold text-[#D93025] shrink-0">
                      Risk: {zone.riskScore}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#5F6368] mb-1.5">
                    <span>{zone.region}, {zone.state}</span>
                    <SeverityBadge severity={zone.severity} size="sm" />
                  </div>

                  <p className="text-[11px] text-[#5F6368] line-clamp-2 leading-relaxed mb-2">
                    {zone.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-[#80868B] pt-1.5 border-t border-[#E8EAED]">
                    <span>Pop: {zone.populationExposed.toLocaleString()} exposed</span>
                    <span className="font-bold text-[#1A73E8] flex items-center gap-0.5">
                      Inspect Zone <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map Canvas (8 Cols) */}
        <div className="lg:col-span-8">
          <SentinelMap
            riskZones={filteredZones}
            sensors={sensors}
            alerts={alerts}
            responseUnits={units}
            selectedZoneId={selectedZone?.id}
            onSelectZone={handleZoneSelect}
            height="h-[620px]"
            isDashboardPreview={false}
          />
        </div>
      </div>
    </div>
  );
};
