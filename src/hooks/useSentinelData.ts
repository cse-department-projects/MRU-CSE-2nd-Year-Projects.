import { useState, useEffect, useCallback } from 'react';
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
import * as api from '../services/api';

export function useDashboardMetrics() {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setError(null);
      const res = await api.getDashboardMetrics();
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const unsubscribe = api.subscribeToSentinelUpdates(() => {
      fetchMetrics();
    });
    return unsubscribe;
  }, [fetchMetrics]);

  return { data, loading, error, refetch: fetchMetrics };
}

export function useRiskZones() {
  const [data, setData] = useState<RiskZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchZones = useCallback(async () => {
    try {
      setError(null);
      const res = await api.getRiskZones();
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load risk zones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
    const unsubscribe = api.subscribeToSentinelUpdates(() => {
      fetchZones();
    });
    return unsubscribe;
  }, [fetchZones]);

  return { data, loading, error, refetch: fetchZones };
}

export function useSensors() {
  const [data, setData] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSensors = useCallback(async () => {
    try {
      setError(null);
      const res = await api.getSensors();
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sensors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSensors();
    const unsubscribe = api.subscribeToSentinelUpdates(() => {
      fetchSensors();
    });
    return unsubscribe;
  }, [fetchSensors]);

  return { data, loading, error, refetch: fetchSensors };
}

export function useAlerts() {
  const [data, setData] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setError(null);
      const res = await api.getAlerts();
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const unsubscribe = api.subscribeToSentinelUpdates(() => {
      fetchAlerts();
    });
    return unsubscribe;
  }, [fetchAlerts]);

  const acknowledge = async (alertId: string, commanderName?: string) => {
    try {
      const updated = await api.acknowledgeAlert(alertId, commanderName);
      setData(prev => prev.map(a => a.id === alertId ? updated : a));
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { data, loading, error, refetch: fetchAlerts, acknowledge };
}

export function usePredictions() {
  const [data, setData] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = useCallback(async () => {
    try {
      setError(null);
      const res = await api.getPredictions();
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load predictions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPredictions();
    const unsubscribe = api.subscribeToSentinelUpdates(() => {
      fetchPredictions();
    });
    return unsubscribe;
  }, [fetchPredictions]);

  return { data, loading, error, refetch: fetchPredictions };
}

export function useResponseUnits() {
  const [data, setData] = useState<ResponseUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnits = useCallback(async () => {
    try {
      setError(null);
      const res = await api.getResponseUnits();
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load response units');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnits();
    const unsubscribe = api.subscribeToSentinelUpdates(() => {
      fetchUnits();
    });
    return unsubscribe;
  }, [fetchUnits]);

  return { data, loading, error, refetch: fetchUnits };
}

export function useAnalytics(range: '24H' | '7D' | '30D' = '24H') {
  const [data, setData] = useState<AnalyticsPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setError(null);
      const res = await api.getAnalytics(range);
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, loading, error, refetch: fetchAnalytics };
}

export function useRecentEvents() {
  const [data, setData] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setError(null);
      const res = await api.getRecentEvents();
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    const unsubscribe = api.subscribeToSentinelUpdates(() => {
      fetchEvents();
    });
    return unsubscribe;
  }, [fetchEvents]);

  return { data, loading, error, refetch: fetchEvents };
}
