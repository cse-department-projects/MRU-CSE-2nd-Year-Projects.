import React from 'react';
import { 
  CheckCircle2, 
  Activity, 
  Server, 
  Radio, 
  ShieldCheck, 
  Cpu, 
  Clock, 
  Zap, 
  Globe,
  Database
} from 'lucide-react';
import { useDashboardMetrics } from '../hooks/useSentinelData';

export const SystemStatusPage: React.FC = () => {
  const { data: metrics } = useDashboardMetrics();

  const services = [
    {
      name: 'IoT Telemetry Ingestion Mesh',
      desc: 'Real-time MQTT/CoAP stream ingestion for 1,301 distributed field sensors',
      status: 'Operational',
      uptime: '99.99%',
      latency: `${metrics?.systemLatencyMs || 138} ms`,
      icon: Radio,
    },
    {
      name: 'Hydro-Geological AI Inference Engine',
      desc: 'DeepCyclone, GeoSlope-LSTM, and RiverNet transformer neural models',
      status: 'Operational',
      uptime: '99.95%',
      latency: '42 ms',
      icon: Cpu,
    },
    {
      name: 'CAP Emergency Broadcast Relays',
      desc: 'Common Alerting Protocol cell-broadcast and siren dispatch gateway',
      status: 'Operational',
      uptime: '100.0%',
      latency: '85 ms',
      icon: ShieldCheck,
    },
    {
      name: 'Geospatial InSAR & Vector Mapping',
      desc: 'CartoDB Positron / OSM dynamic layer polygon rasterizer and boundary engine',
      status: 'Operational',
      uptime: '99.98%',
      latency: '24 ms',
      icon: Globe,
    },
    {
      name: 'Tactical Disaster Command Comms',
      desc: 'VHF marine channels, satellite telemetry, and inter-agency encrypted data links',
      status: 'Operational',
      uptime: '99.92%',
      latency: '110 ms',
      icon: Database,
    },
  ];

  const regionalNodes = [
    { city: 'Mumbai Central EOC', latency: '28 ms', status: 'Healthy', load: '38%' },
    { city: 'Delhi National EOC Hub', latency: '19 ms', status: 'Healthy', load: '44%' },
    { city: 'Guwahati Brahmaputra Node', latency: '54 ms', status: 'Healthy', load: '72%' },
    { city: 'Chennai Coastal Station', latency: '34 ms', status: 'Healthy', load: '29%' },
    { city: 'Kolkata Delta Ingestion', latency: '41 ms', status: 'Healthy', load: '35%' },
    { city: 'Bhubaneswar Cyclone Center', latency: '37 ms', status: 'Healthy', load: '65%' },
  ];

  return (
    <div id="system-status-page" className="max-w-5xl mx-auto space-y-6">
      {/* Overall Health Card */}
      <div className="g-card p-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#1E8E3E] flex items-center justify-center shrink-0">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#202124] tracking-tight flex items-center gap-2">
                <span>All Sentinel Systems Operational</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E8E3E] inline-block animate-pulse" />
              </h1>
              <p className="text-xs text-[#5F6368] mt-0.5">
                No active service outages detected. All national early warning relays running at nominal capacity.
              </p>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-[#5F6368] block">Overall System Uptime (90 Days)</span>
            <span className="text-2xl font-bold text-[#1E8E3E]">99.98%</span>
          </div>
        </div>
      </div>

      {/* 90-Day Visual Uptime Bars */}
      <div className="g-card p-5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#202124] uppercase tracking-wide text-[11px]">
            90-Day Continuous Availability Log
          </span>
          <span className="text-[#1E8E3E] font-semibold">100% Availability Today</span>
        </div>

        {/* Bar strip */}
        <div className="grid grid-cols-45 sm:grid-cols-90 gap-0.5 h-7 items-end">
          {Array.from({ length: 90 }).map((_, i) => (
            <div
              key={i}
              title={`Day ${90 - i}: 100% Operational`}
              className="h-full bg-emerald-500 hover:bg-emerald-600 rounded-2xs transition-colors cursor-pointer"
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#80868B] pt-1">
          <span>90 Days Ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Subsystem Health List */}
      <div className="g-card overflow-hidden">
        <div className="p-4 bg-[#F8F9FA] border-b border-[#E8EAED]">
          <h3 className="text-xs font-bold text-[#5F6368] uppercase tracking-wider">
            Subsystem Infrastructure & Telemetry Services
          </h3>
        </div>

        <div className="divide-y divide-[#F1F3F4]">
          {services.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8F9FA] transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-[#1A73E8] shrink-0 mt-0.5">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#202124]">{svc.name}</h4>
                    <p className="text-xs text-[#5F6368] mt-0.5">{svc.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs shrink-0 self-end sm:self-auto">
                  <div>
                    <span className="text-[#80868B] text-[10px] block">Latency</span>
                    <span className="font-mono font-semibold text-[#202124]">{svc.latency}</span>
                  </div>

                  <div>
                    <span className="text-[#80868B] text-[10px] block">Uptime</span>
                    <span className="font-semibold text-emerald-700">{svc.uptime}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#1E8E3E] border border-emerald-200 uppercase">
                    <CheckCircle2 size={11} />
                    <span>{svc.status}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Regional Edge Node Ping Latencies */}
      <div className="g-card p-5 space-y-4">
        <h3 className="text-xs font-bold text-[#5F6368] uppercase tracking-wider pb-2 border-b border-[#E8EAED]">
          Regional Command Relay Latencies & Ingestion Nodes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {regionalNodes.map((node, i) => (
            <div key={i} className="p-3 rounded-lg bg-[#F8F9FA] border border-[#E8EAED] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#202124] block">{node.city}</span>
                <span className="text-[10px] text-[#5F6368]">Ingestion Load: {node.load}</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-emerald-700 block">{node.latency}</span>
                <span className="text-[10px] text-emerald-600 font-semibold">{node.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
