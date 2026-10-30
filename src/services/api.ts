import { 
  RiskZone, 
  Sensor, 
  Alert, 
  Prediction, 
  ResponseUnit, 
  AnalyticsPoint, 
  RecentEvent, 
  DashboardMetrics 
} from '../types';

import {
  INITIAL_METRICS,
  MOCK_RISK_ZONES,
  MOCK_SENSORS,
  MOCK_ALERTS,
  MOCK_PREDICTIONS,
  MOCK_RESPONSE_UNITS,
  MOCK_ANALYTICS_HOURLY,
  MOCK_RECENT_EVENTS
} from '../mocks/disasterData';

/**
 * SENTINEL API Service Layer
 * 
 * Note for future backend integration:
 * When connecting to a real backend (e.g. Python FastAPI / Django / Node),
 * configure VITE_API_BASE_URL in your environment. Each method contains
 * the exact REST endpoint signature and payload definition.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// In-memory simulated mutable state
let currentMetrics = { ...INITIAL_METRICS };
let currentRiskZones = [...MOCK_RISK_ZONES];
let currentSensors = [...MOCK_SENSORS];
let currentAlerts = [...MOCK_ALERTS];
let currentPredictions = [...MOCK_PREDICTIONS];
let currentResponseUnits = [...MOCK_RESPONSE_UNITS];
let currentRecentEvents = [...MOCK_RECENT_EVENTS];

type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach(cb => cb());
}

export function subscribeToSentinelUpdates(callback: Listener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

// Simulated background live stream ticker (nudging readings subtly every 8s)
if (typeof window !== 'undefined') {
  setInterval(() => {
    // 1. Slightly adjust a random active sensor reading
    const onlineSensors = currentSensors.filter(s => s.status !== 'offline');
    if (onlineSensors.length > 0) {
      const randomIndex = Math.floor(Math.random() * onlineSensors.length);
      const targetSensor = onlineSensors[randomIndex];
      const sensorIndex = currentSensors.findIndex(s => s.id === targetSensor.id);
      
      if (sensorIndex !== -1) {
        const delta = (Math.random() * 0.4 - 0.2); // subtle nudge
        const updatedVal = Math.max(0.1, Number((targetSensor.reading.value + delta).toFixed(2)));
        currentSensors[sensorIndex] = {
          ...targetSensor,
          reading: {
            ...targetSensor.reading,
            value: updatedVal,
            anomalyDetected: updatedVal >= targetSensor.reading.threshold
          },
          lastUpdate: 'Just now'
        };
      }
    }

    // 2. Refresh metrics lastSyncTime and jitter latency
    currentMetrics = {
      ...currentMetrics,
      lastSyncTime: new Date().toISOString(),
      systemLatencyMs: Math.floor(125 + Math.random() * 35)
    };

    notifyListeners();
  }, 8000);
}

// Helper to simulate realistic network delay (100 - 300ms)
const simulateLatency = <T>(data: T, ms = 150): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
};

/**
 * Fetches high-level executive dashboard metrics
 * Endpoint: GET /api/v1/dashboard/metrics
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  if (API_BASE_URL) {
    const res = await fetch(`${API_BASE_URL}/api/v1/dashboard/metrics`);
    if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
    return res.json();
  }
  return simulateLatency({ ...currentMetrics });
}

/**
 * Fetches all geographic risk zones with severity and telemetry
 * Endpoint: GET /api/v1/risk-zones
 */
export async function getRiskZones(): Promise<RiskZone[]> {
  if (API_BASE_URL) {
    const res = await fetch(`${API_BASE_URL}/api/v1/risk-zones`);
    if (!res.ok) throw new Error('Failed to fetch risk zones');
    return res.json();
  }
  return simulateLatency([...currentRiskZones]);
}

/**
 * Fetches specific risk zone detail
 * Endpoint: GET /api/v1/risk-zones/:id
 */
export async function getRiskZoneById(id: string): Promise<RiskZone | null> {
  if (API_BASE_URL) {
    const res = await fetch(`${API_BASE_URL}/api/v1/risk-zones/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch risk zone ${id}`);
    return res.json();
  }
  const zone = currentRiskZones.find(z => z.id === id) || null;
  return simulateLatency(zone ? { ...zone } : null);
}

/**
 * Fetches all IoT / hydro-met telemetric sensors
 * Endpoint: GET /api/v1/sensors
 */
export async function getSensors(): Promise<Sensor[]> {
  if (API_BASE_URL) {
    const res = await fetch(`${API_BASE_URL}/api/v1/sensors`);
    if (!res.ok) throw new Error('Failed to fetch sensors');
    return res.json();
  }
  return simulateLatency([...currentSensors]);
}

/**
 * Fetches active and historic disaster alerts
 * Endpoint: GET /api/v1/alerts?status=:status&severity=:severity
 */
export async function getAlerts(): Promise<Alert[]> {
  if (API_BASE_URL) {
    const res = await fetch(`${API_BASE_URL}/api/v1/alerts`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  }
  return simulateLatency([...currentAlerts]);
}

/**
 * Acknowledges an alert by an authorized incident commander
 * Endpoint: POST /api/v1/alerts/:id/acknowledge
 */
export async function acknowledgeAlert(alertId: string, commanderName = 'Incident Commander (EOC)'): Promise<Alert> {
  if (API_BASE_URL) {
    const res = await fetch(`${API_BASE_URL}/api/v1/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acknowledgedBy: commanderName })
    });
    if (!res.ok) throw new Error(`Failed to acknowledge alert ${alertId}`);
    return res.json();
  }

  const idx = currentAlerts.findIndex(a => a.id === alertId);
  if (idx === -1) throw new Error(`Alert ${alertId} not found`);

  const updated: Alert = {
    ...currentAlerts[idx],
    status: 'acknowledged',
    acknowledgedBy: commanderName,
    acknowledgedAt: new Date().toISOString().substring(11, 16) + ' UTC'
  };

  currentAlerts[idx] = updated;
  
  // Add to recent events
  currentRecentEvents = [
    {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      time: new Date().toISOString().substring(11, 16),
      type: 'alert_issued',
      title: `Alert ${alertId} acknowledged by ${commanderName}`,
      location: updated.location,
      severity: updated.severity
    },
    ...currentRecentEvents
  ];

  notifyListeners();
  return simulateLatency(updated, 200);
}

/**
 * Fetches AI risk predictive models and forecasts
 * Endpoint: GET /api/v1/predictions
 */
export async function getPredictions(): Promise<Prediction[]> {
  if (API_BASE_URL) {
    const res = await fetch(`${API_BASE_URL}/api/v1/predictions`);
    if (!res.ok) throw new Error('Failed to fetch predictions');
    return res.json();
  }
  return simulateLatency([...currentPredictions]);
}

/**
 * Fetches response units, battalions, and assets
 * Endpoint: GET /api/v1/response-units
 */
export async function getResponseUnits(): Promise<ResponseUnit[]> {
  if (API_BASE_URL) {
    const res = await fetch(`${API_BASE_URL}/api/v1/response-units`);
    if (!res.ok) throw new Error('Failed to fetch response units');
    return res.json();
  }
  return simulateLatency([...currentResponseUnits]);
}

/**
 * Fetches risk trend time series data
 * Endpoint: GET /api/v1/analytics?range=24h
 */
export async function getAnalytics(range: '24H' | '7D' | '30D' = '24H'): Promise<AnalyticsPoint[]> {
  if (API_BASE_URL) {
    const res = await fetch(`${API_BASE_URL}/api/v1/analytics?range=${range}`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  }
  return simulateLatency([...MOCK_ANALYTICS_HOURLY]);
}

/**
 * Fetches live event timeline feed
 * Endpoint: GET /api/v1/events/recent
 */
export async function getRecentEvents(): Promise<RecentEvent[]> {
  if (API_BASE_URL) {
    const res = await fetch(`${API_BASE_URL}/api/v1/events/recent`);
    if (!res.ok) throw new Error('Failed to fetch recent events');
    return res.json();
  }
  return simulateLatency([...currentRecentEvents]);
}
