export type SeverityLevel = 'low' | 'moderate' | 'high' | 'critical';

export type SensorType = 
  | 'Seismic'
  | 'Flood'
  | 'Weather'
  | 'Temperature'
  | 'Air Quality'
  | 'Water Level'
  | 'Soil Moisture'
  | 'Rainfall Gauge';

export type SensorStatus = 'online' | 'warning' | 'offline' | 'calibrating';

export interface Sensor {
  id: string;
  name: string;
  type: SensorType;
  location: {
    name: string;
    lat: number;
    lng: number;
    region: string;
    elevationMeters?: number;
  };
  status: SensorStatus;
  reading: {
    value: number;
    unit: string;
    label: string;
    threshold: number;
    anomalyDetected: boolean;
  };
  batteryPercent: number;
  lastUpdate: string; // ISO string or relative time
  signalStrengthDbm: number;
  zoneId?: string;
}

export interface RiskZone {
  id: string;
  name: string;
  region: string;
  state: string;
  severity: SeverityLevel;
  riskScore: number; // 0 to 100
  hazardType: 'Flood' | 'Cyclone' | 'Landslide' | 'Heatwave' | 'Seismic' | 'Storm Surge' | 'Urban Waterlogging';
  coordinates: [number, number][]; // Polygon coordinates [lat, lng]
  center: [number, number]; // [lat, lng]
  populationExposed: number;
  activeSensorsCount: number;
  criticalSensorsCount: number;
  predictedEscalation: string; // e.g. "+18% in 2h" or "Stable (-2% in 6h)"
  trendDirection: 'up' | 'down' | 'stable';
  lastUpdated: string;
  description: string;
  evacuationStatus: 'none' | 'advisory' | 'mandatory' | 'completed';
  vulnerableStructuresCount: number;
}

export interface Alert {
  id: string;
  title: string;
  severity: SeverityLevel;
  category: 'Met' | 'Hydrological' | 'Geological' | 'Thermal' | 'Infrastructure';
  hazardType: string;
  location: string;
  coordinates: [number, number];
  zoneId?: string;
  timestamp: string;
  description: string;
  instruction: string;
  affectedPopulation: number;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  source: string;
}

export interface Prediction {
  id: string;
  title: string;
  hazardType: string;
  targetRegion: string;
  probabilityPercent: number;
  confidencePercent: number;
  timeHorizon: string; // e.g. "Next 2 to 6 Hours"
  trend: 'increasing' | 'stable' | 'decreasing';
  deltaPercent: number;
  keyDrivers: string[];
  recommendedAction: string;
  modelName: string;
  generatedAt: string;
  severity: SeverityLevel;
}

export interface ResponseUnit {
  id: string;
  name: string;
  type: 'NDRF Battalion' | 'SDRF Quick Response' | 'Coast Guard Patrol' | 'Medical Evac Helo' | 'High-Cap Flood Drainage' | 'Civil Defense Rescue' | 'Drone Reconnaissance';
  commander: string;
  status: 'deployed' | 'en_route' | 'standby' | 'returning' | 'maintenance';
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  assignedZone: string;
  personnelCount: number;
  etaMinutes?: number;
  equipment: string[];
  contactFrequency: string;
  lastComms: string;
}

export interface AnalyticsPoint {
  time: string; // "00:00", "01:00", etc.
  fullTimestamp: string;
  riskIndex: number; // 0-100
  alertCount: number;
  sensorAnomalies: number;
  rainfallMm: number;
  riverWaterLevelMeters: number;
  predictedRiskIndex?: number;
}

export interface RecentEvent {
  id: string;
  time: string;
  type: 'sensor_anomaly' | 'risk_escalation' | 'threshold_breach' | 'unit_dispatched' | 'model_updated' | 'alert_issued' | 'system_check';
  title: string;
  location: string;
  severity?: SeverityLevel;
}

export interface DashboardMetrics {
  activeAlerts: number;
  criticalAlerts: number;
  criticalZones: number;
  totalZones: number;
  sensorsOnline: number;
  sensorsTotal: number;
  predictionsToday: number;
  deployedUnits: number;
  populationAtHighRisk: number;
  systemLatencyMs: number;
  lastSyncTime: string;
}

export interface MapLayerConfig {
  riskZones: boolean;
  sensors: boolean;
  alerts: boolean;
  weatherRadar: boolean;
  populationHeat: boolean;
  responseUnits: boolean;
}

export type StakeholderRole = 'citizen' | 'ngo' | 'government' | 'first_responder';

export interface StakeholderUser {
  id: string;
  name: string;
  email: string;
  role: StakeholderRole;
  roleTitle: string;
  organization?: string;
  jurisdiction?: string;
  phone?: string;
  badgeId?: string;
  verified: boolean;
  avatar?: string;
  accessibleModules: string[];
}

