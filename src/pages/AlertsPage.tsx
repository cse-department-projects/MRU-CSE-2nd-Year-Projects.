import React, { useState } from 'react';
import { useAlerts } from '../hooks/useSentinelData';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { LoadingSkeleton, ErrorState } from '../components/common/LoadingSkeleton';
import { 
  Bell, 
  Search, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Filter, 
  AlertTriangle, 
  Share2, 
  Volume2, 
  PhoneCall, 
  ExternalLink,
  ShieldAlert,
  Info,
  Check,
  Waves,
  Wind,
  Mountain,
  Sun
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: alerts, loading, error, refetch, acknowledge } = useAlerts();

  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'high' | 'moderate' | 'acknowledged'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHazard, setSelectedHazard] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-gray-200 animate-pulse rounded" />
        <LoadingSkeleton rows={5} height="h-28" />
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={refetch} message={error} />;
  }

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    // Tab filtering
    if (activeTab === 'critical' && alert.severity !== 'critical') return false;
    if (activeTab === 'high' && alert.severity !== 'high') return false;
    if (activeTab === 'moderate' && alert.severity !== 'moderate') return false;
    if (activeTab === 'acknowledged' && alert.status !== 'acknowledged') return false;

    // Hazard filtering
    if (selectedHazard !== 'all' && !alert.hazardType.toLowerCase().includes(selectedHazard.toLowerCase())) return false;

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        alert.title.toLowerCase().includes(q) ||
        alert.location.toLowerCase().includes(q) ||
        alert.description.toLowerCase().includes(q) ||
        alert.hazardType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleShare = (alert: any) => {
    const text = `🚨 [DISASTER ALERT - ${alert.severity.toUpperCase()}]\n${alert.title}\n📍 Location: ${alert.location}\n⚠️ Instruction: ${alert.instruction}\n📞 Emergency Helpline: 112 / 1078`;
    navigator.clipboard.writeText(text);
    setCopiedId(alert.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (alert: any) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (playingAudioId === alert.id) {
        setPlayingAudioId(null);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(`${alert.severity} alert for ${alert.location}. ${alert.title}. Action required: ${alert.instruction}`);
      utterance.rate = 0.95;
      utterance.onend = () => setPlayingAudioId(null);
      utterance.onerror = () => setPlayingAudioId(null);
      setPlayingAudioId(alert.id);
      window.speechSynthesis.speak(utterance);
    }
  };

  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;
  const highCount = alerts.filter(a => a.severity === 'high' && a.status === 'active').length;
  const modCount = alerts.filter(a => a.severity === 'moderate' && a.status === 'active').length;

  return (
    <div id="alerts-page" className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8EAED] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-red-50 text-[#D93025] flex items-center justify-center font-bold">
              <Bell size={20} />
            </span>
            <h1 className="text-xl font-bold text-[#202124] tracking-tight">
              Active Disaster Warnings & Early Advisories
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-[#D93025]">
              {criticalCount + highCount + modCount} Active
            </span>
          </div>
          <p className="text-xs md:text-sm text-[#5F6368] mt-1">
            Official emergency alerts issued by India Meteorological Department (IMD) & Central Water Commission (CWC).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="tel:112"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#D93025] hover:bg-[#B31412] rounded-lg shadow-xs transition-colors"
          >
            <PhoneCall size={14} />
            <span>Emergency SOS: 112</span>
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E8EAED] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Severity Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-[#1A73E8] text-white shadow-xs'
                : 'bg-[#F8F9FA] text-[#5F6368] hover:text-[#202124]'
            }`}
          >
            All Warnings ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('critical')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeTab === 'critical'
                ? 'bg-[#D93025] text-white shadow-xs'
                : 'bg-red-50 text-[#D93025] hover:bg-red-100'
            }`}
          >
            Critical ({criticalCount})
          </button>
          <button
            onClick={() => setActiveTab('high')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeTab === 'high'
                ? 'bg-[#E37400] text-white shadow-xs'
                : 'bg-amber-50 text-[#E37400] hover:bg-amber-100'
            }`}
          >
            High Risk ({highCount})
          </button>
          <button
            onClick={() => setActiveTab('moderate')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
              activeTab === 'moderate'
                ? 'bg-[#F9AB00] text-[#202124] shadow-xs'
                : 'bg-yellow-50 text-amber-800 hover:bg-yellow-100'
            }`}
          >
            Advisory ({modCount})
          </button>
        </div>

        {/* Hazard Dropdown & Search Input */}
        <div className="flex items-center gap-2">
          <select
            value={selectedHazard}
            onChange={e => setSelectedHazard(e.target.value)}
            className="px-3 py-1.5 bg-[#F8F9FA] rounded-lg border border-[#DADCE0] text-xs text-[#202124] focus:border-[#1A73E8] outline-hidden cursor-pointer"
          >
            <option value="all">All Hazards</option>
            <option value="flood">🌊 Floods</option>
            <option value="cyclone">🌀 Cyclones</option>
            <option value="landslide">⛰️ Landslides</option>
            <option value="heat">☀️ Heatwaves</option>
          </select>

          <div className="relative">
            <input
              type="text"
              placeholder="Search district or warning..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#F8F9FA] text-xs text-[#202124] rounded-lg border border-[#DADCE0] focus:bg-white focus:border-[#1A73E8] outline-hidden w-48"
            />
            <Search size={14} className="absolute left-2.5 top-2.5 text-[#80868B]" />
          </div>
        </div>
      </div>

      {/* ALERTS FEED CARDS */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-[#E8EAED] text-center text-[#5F6368] space-y-2">
            <CheckCircle2 size={36} className="mx-auto text-[#1E8E3E]" />
            <h3 className="text-sm font-bold text-[#202124]">No alerts match your filter</h3>
            <p className="text-xs">There are no active disaster warnings in this specific category.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isCritical = alert.severity === 'critical';
            return (
              <div
                key={alert.id}
                id={`alert-card-${alert.id}`}
                className={`bg-white p-5 rounded-2xl border transition-all shadow-xs space-y-3 ${
                  isCritical
                    ? 'border-red-200 hover:border-red-400 bg-gradient-to-r from-red-50/20 to-white'
                    : 'border-[#E8EAED] hover:border-[#DADCE0]'
                }`}
              >
                {/* Alert Top Line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <SeverityBadge severity={alert.severity} size="md" pulse={isCritical} />
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#F1F3F4] text-[#5F6368]">
                      {alert.hazardType}
                    </span>
                    <span className="text-xs text-[#80868B] flex items-center gap-1">
                      <Clock size={12} />
                      {alert.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#5F6368] flex items-center gap-1">
                      <MapPin size={13} className="text-[#D93025]" />
                      {alert.location}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-[11px] text-[#80868B]">Source: {alert.source || 'IMD / CWC'}</span>
                  </div>
                </div>

                {/* Alert Title & Plain Language Description */}
                <div>
                  <h3 className="text-base font-bold text-[#202124]">
                    {alert.title}
                  </h3>
                  <p className="text-xs text-[#5F6368] mt-1 leading-relaxed">
                    {alert.description}
                  </p>
                </div>

                {/* What You Should Do (Action Box) */}
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs">
                  <h4 className="font-bold text-[#1A73E8] mb-1 flex items-center gap-1.5">
                    <ShieldAlert size={15} />
                    Immediate Safety Directives for Citizens & Responders:
                  </h4>
                  <p className="text-[#202124] font-medium leading-relaxed">
                    {alert.instruction}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F1F3F4] text-xs">
                  <div className="flex items-center gap-2">
                    {/* Share Warning */}
                    <button
                      onClick={() => handleShare(alert)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F9FA] hover:bg-gray-100 border border-[#DADCE0] text-[#202124] rounded-lg font-semibold transition-colors"
                      title="Copy alert for WhatsApp / SMS broadcast"
                    >
                      {copiedId === alert.id ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                      <span>{copiedId === alert.id ? 'Copied Alert!' : 'Share Warning'}</span>
                    </button>

                    {/* Audio Broadcast */}
                    <button
                      onClick={() => handleSpeak(alert)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold border transition-colors ${
                        playingAudioId === alert.id
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-[#F8F9FA] hover:bg-gray-100 border-[#DADCE0] text-[#202124]'
                      }`}
                    >
                      <Volume2 size={14} />
                      <span>{playingAudioId === alert.id ? 'Playing Voice...' : 'Listen Aloud'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View Nearest Shelters */}
                    <button
                      onClick={() => navigate('/response')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#1E8E3E] rounded-lg font-bold transition-colors"
                    >
                      <span>View Shelters</span>
                      <ExternalLink size={12} />
                    </button>

                    {/* Acknowledge Button */}
                    <button
                      onClick={() => acknowledge(alert.id)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-colors ${
                        alert.status === 'acknowledged'
                          ? 'bg-gray-100 text-[#80868B] cursor-default'
                          : 'bg-[#1A73E8] hover:bg-[#1557B0] text-white'
                      }`}
                    >
                      <CheckCircle2 size={13} />
                      <span>{alert.status === 'acknowledged' ? 'Acknowledged' : 'Mark Understood'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
