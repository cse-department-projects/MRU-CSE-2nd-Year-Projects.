import React, { useState } from 'react';
import { useAnalytics } from '../hooks/useSentinelData';
import { LoadingSkeleton, ErrorState } from '../components/common/LoadingSkeleton';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  Download, 
  Activity, 
  CloudRain, 
  Waves, 
  AlertTriangle,
  Info
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24H' | '7D' | '30D'>('24H');
  const [activeMetricTab, setActiveMetricTab] = useState<'all' | 'risk' | 'hydro' | 'anomalies'>('all');

  const { data: analytics, loading, error, refetch } = useAnalytics(timeRange);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-gray-200 animate-pulse rounded" />
        <LoadingSkeleton rows={4} height="h-64" />
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={refetch} message={error} />;
  }

  // Calculate high level aggregate stats
  const peakRisk = Math.max(...analytics.map(a => a.riskIndex));
  const peakRainfall = Math.max(...analytics.map(a => a.rainfallMm));
  const totalAnomalies = analytics.reduce((acc, a) => Math.max(acc, a.sensorAnomalies), 0);

  return (
    <div id="analytics-page" className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#E8EAED] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#202124] tracking-tight">
            Hazard Trends, Telemetric Analytics & Hydrographs
          </h1>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Temporal time-series analysis for multi-basin risk indices, sensor anomaly distributions, and rainfall accumulation.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#F1F3F4] p-1 rounded-lg text-xs">
            <button
              id="range-24h"
              onClick={() => setTimeRange('24H')}
              className={`px-3 py-1 font-semibold rounded-md transition-all ${
                timeRange === '24H' ? 'bg-white text-[#1A73E8] shadow-xs' : 'text-[#5F6368] hover:text-[#202124]'
              }`}
            >
              24 Hours
            </button>
            <button
              id="range-7d"
              onClick={() => setTimeRange('7D')}
              className={`px-3 py-1 font-semibold rounded-md transition-all ${
                timeRange === '7D' ? 'bg-white text-[#1A73E8] shadow-xs' : 'text-[#5F6368] hover:text-[#202124]'
              }`}
            >
              7 Days
            </button>
            <button
              id="range-30d"
              onClick={() => setTimeRange('30D')}
              className={`px-3 py-1 font-semibold rounded-md transition-all ${
                timeRange === '30D' ? 'bg-white text-[#1A73E8] shadow-xs' : 'text-[#5F6368] hover:text-[#202124]'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>
      </div>

      {/* Aggregate Statistics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="g-card p-4">
          <span className="text-xs font-semibold text-[#5F6368] uppercase tracking-wide">
            Peak 24H Composite Risk Score
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-bold text-[#D93025]">{peakRisk} / 100</h3>
            <span className="text-xs text-[#5F6368]">Critical Threshold</span>
          </div>
          <p className="text-[11px] text-[#80868B] mt-2">
            Driven by concurrent astronomical spring tide & Mithi basin influx.
          </p>
        </div>

        <div className="g-card p-4">
          <span className="text-xs font-semibold text-[#5F6368] uppercase tracking-wide">
            Peak Cumulative Precipitation
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-bold text-[#1A73E8]">{peakRainfall} mm</h3>
            <span className="text-xs text-[#5F6368]">Over 24h Window</span>
          </div>
          <p className="text-[11px] text-[#80868B] mt-2">
            Automated radar and rain-gauge mesh average across coastal corridors.
          </p>
        </div>

        <div className="g-card p-4">
          <span className="text-xs font-semibold text-[#5F6368] uppercase tracking-wide">
            Active Sensor Node Anomalies
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-bold text-[#E37400]">{totalAnomalies} Nodes</h3>
            <span className="text-xs text-[#5F6368]">Triggered Warning</span>
          </div>
          <p className="text-[11px] text-[#80868B] mt-2">
            Pore pressure, water stage, and velocity sensors above safety limits.
          </p>
        </div>
      </div>

      {/* Main Chart 1: 24H Risk Index & Active Alert Trajectory */}
      <div className="g-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E8EAED] gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#202124] uppercase tracking-wide">
              Composite Risk Index & Incident Alert Frequency (24-Hour Horizon)
            </h3>
            <p className="text-xs text-[#5F6368]">
              Normalized multi-hazard risk index (0–100 scale) correlated with active civil defense alert dispatches.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-[#5F6368]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#D93025] inline-block" />
              <span>Risk Index</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#1A73E8] inline-block border-b border-dashed border-[#1A73E8]" />
              <span>Alert Count</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D93025" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#D93025" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F4" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#5F6368' }} interval={2} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#5F6368' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E8EAED',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  fontSize: '12px'
                }}
              />
              <Area
                type="monotone"
                dataKey="riskIndex"
                name="Risk Index"
                stroke="#D93025"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRisk)"
              />
              <Line
                type="monotone"
                dataKey="alertCount"
                name="Active Alerts"
                stroke="#1A73E8"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Secondary Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Hydrograph & River Stage */}
        <div className="g-card p-5">
          <h3 className="text-sm font-bold text-[#202124] uppercase tracking-wide mb-1">
            Catchment Precipitation vs. River Water Stage
          </h3>
          <p className="text-xs text-[#5F6368] mb-4">
            Precipitation intensity (mm) against river stage gauge elevation (meters).
          </p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F4" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#5F6368' }} interval={3} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#5F6368' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#5F6368' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E8EAED',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="rainfallMm"
                  name="Rainfall (mm)"
                  stroke="#1A73E8"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="riverWaterLevelMeters"
                  name="River Stage (m)"
                  stroke="#E37400"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Sensor Anomaly Frequency Histogram */}
        <div className="g-card p-5">
          <h3 className="text-sm font-bold text-[#202124] uppercase tracking-wide mb-1">
            Telemetry Anomaly Breaches by Hour
          </h3>
          <p className="text-xs text-[#5F6368] mb-4">
            Count of IoT sensors actively reporting values breaching programmed warning thresholds.
          </p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F4" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#5F6368' }} interval={3} />
                <YAxis domain={[0, 25]} tick={{ fontSize: 10, fill: '#5F6368' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E8EAED',
                    fontSize: '12px'
                  }}
                />
                <Bar
                  dataKey="sensorAnomalies"
                  name="Anomalous Nodes"
                  fill="#F9AB00"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
