import React, { useEffect, useRef, useState } from 'react';
import { RiskZone, Sensor, Alert, ResponseUnit, MapLayerConfig } from '../../types';
import L from 'leaflet';
import { 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  Radio, 
  Truck, 
  Activity,
  CloudRain
} from 'lucide-react';
import { ZoneDetailDrawer } from '../common/ZoneDetailDrawer';

interface SentinelMapProps {
  riskZones: RiskZone[];
  sensors?: Sensor[];
  alerts?: Alert[];
  responseUnits?: ResponseUnit[];
  selectedZoneId?: string | null;
  onSelectZone?: (zone: RiskZone | null) => void;
  height?: string;
  isDashboardPreview?: boolean;
  className?: string;
}

export const SentinelMap: React.FC<SentinelMapProps> = ({
  riskZones,
  sensors = [],
  alerts = [],
  responseUnits = [],
  selectedZoneId,
  onSelectZone,
  height = 'h-[600px]',
  isDashboardPreview = false,
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<{
    zones: L.FeatureGroup;
    sensors: L.LayerGroup;
    alerts: L.LayerGroup;
    units: L.LayerGroup;
    weather: L.LayerGroup;
  } | null>(null);

  const [layers, setLayers] = useState<MapLayerConfig>({
    riskZones: true,
    sensors: !isDashboardPreview,
    alerts: true,
    weatherRadar: false,
    populationHeat: false,
    responseUnits: !isDashboardPreview,
  });

  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeZone, setActiveZone] = useState<RiskZone | null>(null);

  // Synchronize incoming selectedZoneId
  useEffect(() => {
    if (selectedZoneId) {
      const z = riskZones.find(item => item.id === selectedZoneId);
      if (z) {
        setActiveZone(z);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(z.center, 8, { duration: 1.2 });
        }
      }
    }
  }, [selectedZoneId, riskZones]);

  // Color lookup for severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#D93025';
      case 'high': return '#E37400';
      case 'moderate': return '#F9AB00';
      case 'low': return '#1E8E3E';
      default: return '#1A73E8';
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered on India overview
    const map = L.map(mapContainerRef.current, {
      center: [21.500, 81.000],
      zoom: isDashboardPreview ? 4.5 : 5,
      zoomControl: false,
      attributionControl: false,
    });

    // Clean Google-like Light Basemap (CartoDB Positron / OSM)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Create Layer Groups
    const zoneGroup = L.featureGroup().addTo(map);
    const sensorGroup = L.layerGroup().addTo(map);
    const alertGroup = L.layerGroup().addTo(map);
    const unitGroup = L.layerGroup().addTo(map);
    const weatherGroup = L.layerGroup().addTo(map);

    layerGroupsRef.current = {
      zones: zoneGroup,
      sensors: sensorGroup,
      alerts: alertGroup,
      units: unitGroup,
      weather: weatherGroup,
    };

    mapInstanceRef.current = map;

    // Invalidate size on resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isDashboardPreview]);

  // Update Layers & Markers when data or visibility toggles change
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupsRef.current) return;
    const { zones, sensors: sGroup, alerts: aGroup, units: uGroup, weather: wGroup } = layerGroupsRef.current;

    // 1. Clear current layers
    zones.clearLayers();
    sGroup.clearLayers();
    aGroup.clearLayers();
    uGroup.clearLayers();
    wGroup.clearLayers();

    // 2. Render Risk Zones Polygons
    if (layers.riskZones) {
      riskZones.forEach(zone => {
        const color = getSeverityColor(zone.severity);
        const isCritical = zone.severity === 'critical';
        const isSelected = activeZone?.id === zone.id;

        const polygon = L.polygon(zone.coordinates, {
          color: isSelected ? '#1A73E8' : color,
          weight: isSelected ? 3.5 : isCritical ? 2.5 : 1.5,
          opacity: isSelected ? 1 : 0.9,
          fillColor: color,
          fillOpacity: isSelected ? 0.45 : isCritical ? 0.32 : 0.22,
          className: isCritical ? 'critical-pulse' : '',
        });

        // Tooltip hover
        polygon.bindTooltip(
          `<div class="p-1.5 text-xs font-sans">
            <div class="font-bold text-gray-900">${zone.name}</div>
            <div class="text-gray-600 flex items-center justify-between gap-2 mt-0.5">
              <span>Risk: <strong>${zone.riskScore}/100</strong></span>
              <span class="uppercase font-semibold text-[10px]" style="color: ${color}">${zone.severity}</span>
            </div>
            <div class="text-[11px] text-gray-500 mt-0.5">Pop: ${zone.populationExposed.toLocaleString()}</div>
          </div>`,
          { sticky: true, direction: 'top', className: 'g-map-tooltip' }
        );

        polygon.on('click', () => {
          setActiveZone(zone);
          if (onSelectZone) onSelectZone(zone);
        });

        zones.addLayer(polygon);

        // Add Center Zone Label Badge
        const labelIcon = L.divIcon({
          className: 'zone-map-label',
          html: `
            <div class="flex items-center gap-1 px-1.5 py-0.5 rounded shadow-xs text-[10px] font-bold uppercase whitespace-nowrap cursor-pointer border"
                 style="background: #FFFFFF; color: ${color}; border-color: ${color}40;">
              <span class="w-1.5 h-1.5 rounded-full" style="background: ${color}"></span>
              <span>${zone.hazardType}: ${zone.riskScore}</span>
            </div>
          `,
          iconSize: [80, 20],
          iconAnchor: [40, 10],
        });

        const labelMarker = L.marker(zone.center, { icon: labelIcon });
        labelMarker.on('click', () => {
          setActiveZone(zone);
          if (onSelectZone) onSelectZone(zone);
        });
        zones.addLayer(labelMarker);
      });
    }

    // 3. Render Sensors
    if (layers.sensors && sensors.length > 0) {
      sensors.forEach(sensor => {
        const isWarn = sensor.status === 'warning';
        const isOff = sensor.status === 'offline';
        const dotColor = isOff ? '#80868B' : isWarn ? '#E37400' : '#1E8E3E';

        const sensorIcon = L.divIcon({
          className: 'custom-sensor-icon',
          html: `
            <div class="w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs flex items-center justify-center cursor-pointer"
                 style="background-color: ${dotColor}">
            </div>
          `,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const marker = L.marker([sensor.location.lat, sensor.location.lng], { icon: sensorIcon });
        marker.bindTooltip(
          `<div class="p-1.5 text-xs">
            <div class="font-bold text-gray-900">${sensor.name}</div>
            <div class="text-gray-600 text-[11px]">${sensor.type} • Status: <strong style="color:${dotColor}">${sensor.status}</strong></div>
            <div class="font-mono text-[11px] mt-0.5 font-semibold">${sensor.reading.label}: ${sensor.reading.value} ${sensor.reading.unit}</div>
          </div>`,
          { direction: 'top' }
        );

        sGroup.addLayer(marker);
      });
    }

    // 4. Render Active Alerts
    if (layers.alerts && alerts.length > 0) {
      alerts.filter(a => a.status === 'active').forEach(alert => {
        const color = getSeverityColor(alert.severity);

        const alertIcon = L.divIcon({
          className: 'custom-alert-icon',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer">
              <div class="absolute w-6 h-6 rounded-full opacity-40 animate-ping" style="background-color: ${color}"></div>
              <div class="w-5 h-5 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-[9px] font-bold"
                   style="background-color: ${color}">
                !
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker(alert.coordinates, { icon: alertIcon });
        marker.bindTooltip(
          `<div class="p-2 text-xs max-w-xs">
            <div class="font-bold text-red-600">${alert.title}</div>
            <div class="text-gray-700 text-[11px] mt-1">${alert.description}</div>
            <div class="text-[10px] text-gray-500 mt-1">${alert.location} • ${alert.timestamp}</div>
          </div>`,
          { direction: 'top' }
        );

        aGroup.addLayer(marker);
      });
    }

    // 5. Render Response Units
    if (layers.responseUnits && responseUnits.length > 0) {
      responseUnits.forEach(unit => {
        const isDeployed = unit.status === 'deployed';
        const color = isDeployed ? '#1A73E8' : '#5F6368';

        const unitIcon = L.divIcon({
          className: 'custom-unit-icon',
          html: `
            <div class="px-1.5 py-0.5 rounded shadow-sm text-[10px] font-bold text-white border border-white flex items-center gap-1 cursor-pointer"
                 style="background-color: ${color}">
              <span>${unit.type.split(' ')[0]}</span>
            </div>
          `,
          iconSize: [60, 20],
          iconAnchor: [30, 10],
        });

        const marker = L.marker([unit.location.lat, unit.location.lng], { icon: unitIcon });
        marker.bindTooltip(
          `<div class="p-1.5 text-xs">
            <div class="font-bold text-gray-900">${unit.name}</div>
            <div class="text-gray-600 text-[11px]">${unit.commander} • ${unit.personnelCount} Personnel</div>
            <div class="text-[11px] text-blue-600 font-semibold mt-0.5">Status: ${unit.status.toUpperCase()}</div>
          </div>`,
          { direction: 'top' }
        );

        uGroup.addLayer(marker);
      });
    }

    // 6. Weather radar simulation overlay
    if (layers.weatherRadar) {
      // Simulated monsoon cloud cluster over Bay of Bengal and Western Ghats
      const monsoonCircle1 = L.circle([19.5, 86.5], {
        radius: 220000,
        color: '#1A73E8',
        fillColor: '#1A73E8',
        fillOpacity: 0.18,
        weight: 1,
        dashArray: '4, 4'
      }).bindTooltip('Cyclone Doppler Radar Precipitation Core');

      const monsoonCircle2 = L.circle([18.8, 73.2], {
        radius: 140000,
        color: '#1A73E8',
        fillColor: '#1A73E8',
        fillOpacity: 0.22,
        weight: 1,
        dashArray: '4, 4'
      }).bindTooltip('Western Ghats Convective Rain Band');

      wGroup.addLayer(monsoonCircle1);
      wGroup.addLayer(monsoonCircle2);
    }

  }, [riskZones, sensors, alerts, responseUnits, layers, activeZone, onSelectZone]);

  // Toolbar Actions
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetView = () => {
    mapInstanceRef.current?.setView([21.500, 81.000], isDashboardPreview ? 4.5 : 5);
    setActiveZone(null);
    if (onSelectZone) onSelectZone(null);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 200);
  };

  return (
    <div 
      id="sentinel-map-container"
      className={`relative w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : height} rounded-lg overflow-hidden border border-[#E8EAED] shadow-xs flex ${className}`}
    >
      {/* Map Surface */}
      <div 
        ref={mapContainerRef} 
        id="sentinel-leaflet-canvas"
        className="w-full h-full z-0 bg-[#F1F3F4]" 
      />

      {/* Floating Toolbar (Google Cloud style top-right) */}
      <div className="absolute top-3 right-3 z-30 flex flex-col gap-1.5">
        {/* Layer Dropdown */}
        <div className="relative">
          <button
            id="btn-map-layers-toggle"
            onClick={() => setShowLayerMenu(prev => !prev)}
            className="p-2 bg-white hover:bg-gray-50 text-[#5F6368] hover:text-[#202124] rounded-md border border-[#DADCE0] shadow-sm flex items-center gap-1.5 text-xs font-semibold transition-colors"
            title="Toggle Map Layers"
          >
            <Layers size={16} />
            <span className="hidden sm:inline">Layers</span>
          </button>

          {showLayerMenu && (
            <div className="absolute right-0 mt-1 w-56 bg-white border border-[#E8EAED] rounded-lg shadow-lg p-2 z-40 text-xs space-y-1">
              <div className="font-semibold text-[#5F6368] px-2 py-1 uppercase text-[10px] tracking-wider border-b border-[#F1F3F4]">
                Map Overlays
              </div>
              
              <label className="flex items-center justify-between px-2 py-1.5 hover:bg-[#F8F9FA] rounded cursor-pointer">
                <span className="flex items-center gap-2 text-[#202124]">
                  <ShieldAlert size={14} className="text-[#D93025]" />
                  Risk Zones
                </span>
                <input
                  type="checkbox"
                  checked={layers.riskZones}
                  onChange={e => setLayers(l => ({ ...l, riskZones: e.target.checked }))}
                  className="rounded text-[#1A73E8] focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between px-2 py-1.5 hover:bg-[#F8F9FA] rounded cursor-pointer">
                <span className="flex items-center gap-2 text-[#202124]">
                  <Activity size={14} className="text-[#1E8E3E]" />
                  Sensor Telemetry
                </span>
                <input
                  type="checkbox"
                  checked={layers.sensors}
                  onChange={e => setLayers(l => ({ ...l, sensors: e.target.checked }))}
                  className="rounded text-[#1A73E8] focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between px-2 py-1.5 hover:bg-[#F8F9FA] rounded cursor-pointer">
                <span className="flex items-center gap-2 text-[#202124]">
                  <Radio size={14} className="text-[#D93025]" />
                  Incident Alerts
                </span>
                <input
                  type="checkbox"
                  checked={layers.alerts}
                  onChange={e => setLayers(l => ({ ...l, alerts: e.target.checked }))}
                  className="rounded text-[#1A73E8] focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between px-2 py-1.5 hover:bg-[#F8F9FA] rounded cursor-pointer">
                <span className="flex items-center gap-2 text-[#202124]">
                  <Truck size={14} className="text-[#1A73E8]" />
                  Response Units
                </span>
                <input
                  type="checkbox"
                  checked={layers.responseUnits}
                  onChange={e => setLayers(l => ({ ...l, responseUnits: e.target.checked }))}
                  className="rounded text-[#1A73E8] focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between px-2 py-1.5 hover:bg-[#F8F9FA] rounded cursor-pointer">
                <span className="flex items-center gap-2 text-[#202124]">
                  <CloudRain size={14} className="text-blue-500" />
                  Doppler Radar Overlay
                </span>
                <input
                  type="checkbox"
                  checked={layers.weatherRadar}
                  onChange={e => setLayers(l => ({ ...l, weatherRadar: e.target.checked }))}
                  className="rounded text-[#1A73E8] focus:ring-0"
                />
              </label>
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="bg-white border border-[#DADCE0] rounded-md shadow-sm overflow-hidden flex flex-col">
          <button
            id="btn-map-zoom-in"
            onClick={handleZoomIn}
            className="p-2 text-[#5F6368] hover:text-[#202124] hover:bg-gray-100 transition-colors border-b border-[#F1F3F4]"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            id="btn-map-zoom-out"
            onClick={handleZoomOut}
            className="p-2 text-[#5F6368] hover:text-[#202124] hover:bg-gray-100 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
        </div>

        {/* Reset View */}
        <button
          id="btn-map-reset-view"
          onClick={handleResetView}
          className="p-2 bg-white hover:bg-gray-50 text-[#5F6368] hover:text-[#202124] rounded-md border border-[#DADCE0] shadow-sm transition-colors"
          title="Reset Map View"
        >
          <RotateCcw size={16} />
        </button>

        {/* Fullscreen Toggle */}
        <button
          id="btn-map-fullscreen"
          onClick={toggleFullscreen}
          className="p-2 bg-white hover:bg-gray-50 text-[#5F6368] hover:text-[#202124] rounded-md border border-[#DADCE0] shadow-sm transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* Legend (Bottom-Left) */}
      <div className="absolute bottom-3 left-3 z-30 bg-white/95 backdrop-blur-xs border border-[#DADCE0] rounded-md p-2.5 shadow-sm text-[11px] text-[#5F6368]">
        <div className="font-semibold text-[#202124] mb-1 text-[10px] uppercase tracking-wider">
          Risk Severity Index
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D93025]" />
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E37400]" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F9AB00]" />
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1E8E3E]" />
            <span>Low</span>
          </div>
        </div>
      </div>

      {/* Slide-over Inspection Drawer for Selected Zone */}
      {activeZone && (
        <div className="absolute top-0 right-0 bottom-0 z-40 max-w-sm w-full">
          <ZoneDetailDrawer
            zone={activeZone}
            onClose={() => {
              setActiveZone(null);
              if (onSelectZone) onSelectZone(null);
            }}
          />
        </div>
      )}
    </div>
  );
};
