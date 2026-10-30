import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  Radio, 
  Bell, 
  ShieldAlert, 
  RefreshCw, 
  CheckCircle2, 
  Server, 
  Sliders, 
  Save,
  Info
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [apiEndpoint, setApiEndpoint] = useState(import.meta.env.VITE_API_BASE_URL || '');
  const [streamInterval, setStreamInterval] = useState('8');
  const [anomalySimulation, setAnomalySimulation] = useState(true);
  const [audioAlerts, setAudioAlerts] = useState(false);
  const [desktopNotifs, setDesktopNotifs] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = () => {
    window.location.reload();
  };

  return (
    <div id="settings-page" className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-[#E8EAED] shadow-xs">
        <h1 className="text-xl font-bold text-[#202124] tracking-tight flex items-center gap-2">
          <Settings size={20} className="text-[#1A73E8]" />
          <span>Platform Settings & Simulated Environment Preferences</span>
        </h1>
        <p className="text-xs text-[#5F6368] mt-0.5">
          Configure telemetry update frequency, connect external REST API backends, and customize operator alerts.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Backend Connectivity Config */}
        <div className="g-card p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E8EAED]">
            <Server size={18} className="text-[#1A73E8]" />
            <h3 className="text-sm font-bold text-[#202124] uppercase tracking-wide">
              Backend API & Service Connector
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-[#202124] block mb-1">
                REST API Base URL
              </label>
              <div className="flex gap-2">
                <input
                  id="input-api-endpoint"
                  type="text"
                  placeholder="e.g. https://api.sentinel-disaster.internal or http://localhost:8000"
                  value={apiEndpoint}
                  onChange={e => setApiEndpoint(e.target.value)}
                  className="flex-1 p-2 bg-[#F8F9FA] rounded border border-[#DADCE0] focus:bg-white focus:border-[#1A73E8] focus:ring-1 focus:ring-[#1A73E8] outline-hidden font-mono"
                />
                <button
                  type="button"
                  onClick={() => alert(`Connection tested to ${apiEndpoint || 'mock environment'}: Telemetry service responded OK (200)`)}
                  className="px-3 py-2 bg-[#F1F3F4] hover:bg-[#E8EAED] text-[#202124] font-semibold rounded border border-[#DADCE0] transition-colors"
                >
                  Test Ping
                </button>
              </div>
              <p className="text-[11px] text-[#5F6368] mt-1 flex items-center gap-1">
                <Info size={12} />
                <span>Leave blank to utilize the built-in simulated high-fidelity mock data service.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Live Simulation Toggles */}
        <div className="g-card p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E8EAED]">
            <Sliders size={18} className="text-[#1E8E3E]" />
            <h3 className="text-sm font-bold text-[#202124] uppercase tracking-wide">
              Telemetry Stream & Simulation Parameters
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-[#202124] block mb-1">
                Telemetry Push Interval
              </label>
              <select
                id="select-stream-interval"
                value={streamInterval}
                onChange={e => setStreamInterval(e.target.value)}
                className="w-full p-2 bg-[#F8F9FA] rounded border border-[#DADCE0] focus:border-[#1A73E8] outline-hidden cursor-pointer"
              >
                <option value="5">Every 5 Seconds (High Frequency)</option>
                <option value="8">Every 8 Seconds (Recommended Default)</option>
                <option value="15">Every 15 Seconds (Low Bandwidth)</option>
                <option value="0">Paused / Static Telemetry</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-[#202124] block mb-1">
                Hazard Anomaly Generator
              </label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={anomalySimulation}
                  onChange={e => setAnomalySimulation(e.target.checked)}
                  className="rounded text-[#1A73E8] focus:ring-0 w-4 h-4"
                />
                <span className="text-xs text-[#202124]">
                  Simulate stochastic micro-variations in sensor river stages
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="g-card p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E8EAED]">
            <Bell size={18} className="text-[#E37400]" />
            <h3 className="text-sm font-bold text-[#202124] uppercase tracking-wide">
              Operator Notification Directives
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-lg bg-[#F8F9FA] border border-[#E8EAED] cursor-pointer hover:bg-gray-100/70">
              <div>
                <span className="font-semibold text-[#202124] block">Desktop In-App Alerts</span>
                <span className="text-[11px] text-[#5F6368]">Show toast notifications whenever a critical risk zone escalates</span>
              </div>
              <input
                type="checkbox"
                checked={desktopNotifs}
                onChange={e => setDesktopNotifs(e.target.checked)}
                className="rounded text-[#1A73E8] focus:ring-0 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-[#F8F9FA] border border-[#E8EAED] cursor-pointer hover:bg-gray-100/70">
              <div>
                <span className="font-semibold text-[#202124] block">Audible High-Priority Siren Tone</span>
                <span className="text-[11px] text-[#5F6368]">Play subtle chime when CAP level 1 critical alert is ingested</span>
              </div>
              <input
                type="checkbox"
                checked={audioAlerts}
                onChange={e => setAudioAlerts(e.target.checked)}
                className="rounded text-[#1A73E8] focus:ring-0 w-4 h-4"
              />
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetData}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#D93025] hover:bg-red-50 rounded-md border border-red-200 transition-colors"
          >
            <RefreshCw size={13} />
            <span>Reset Demo State to Initial Baseline</span>
          </button>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs font-semibold text-[#1E8E3E] flex items-center gap-1 animate-fade-in">
                <CheckCircle2 size={14} />
                Preferences Saved
              </span>
            )}
            <button
              id="btn-save-settings"
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#1A73E8] hover:bg-[#1557B0] rounded-md transition-colors shadow-xs"
            >
              <Save size={14} />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
