import React, { useEffect, useState } from 'react';
import { IncidentReport, TimelineEvent, UserProfile } from '../../types';
import { DataProvider } from '../../lib/supabase';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { IncidentReportWizard } from './IncidentReportWizard';
import {
  AlertCircle, Clock, CheckCircle2, Home, Bell, User,
  FileText, Phone, ChevronRight, X, MapPin, Users, Activity
} from 'lucide-react';

interface CitizenDashboardProps {
  currentUser: UserProfile;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({ currentUser }) => {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [shelters, setShelters] = useState<any[]>([]);
  const [missing, setMissing] = useState<any[]>([]);
  const [showReportWizard, setShowReportWizard] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMissingForm, setShowMissingForm] = useState(false);
  const [mpForm, setMpForm] = useState({ full_name: '', age: 0, gender: 'Male', last_seen_location: '', last_seen_date: '', description: '', reporter_name: currentUser.full_name, reporter_phone: currentUser.phone || '' });

  const loadData = async () => {
    setLoading(true);
    const [incs, alts, shls, mps] = await Promise.all([
      DataProvider.getIncidents(),
      DataProvider.getAlerts(),
      DataProvider.getShelters(),
      DataProvider.getMissingPersons(),
    ]);
    const myIncidents = incs.filter(i => i.citizen_id === currentUser.id);
    setIncidents(myIncidents);
    setAlerts(alts);
    setShelters(shls);
    setMissing(mps);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleViewTimeline = async (inc: IncidentReport) => {
    setSelectedIncident(inc);
    const tl = await DataProvider.getTimelineEvents(inc.id);
    setTimeline(tl);
  };

  const handleMissingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await DataProvider.createMissingPerson({ ...mpForm, age: Number(mpForm.age) });
    setShowMissingForm(false);
    const mps = await DataProvider.getMissingPersons();
    setMissing(mps);
  };

  const myActive = incidents.filter(i => !['rescued', 'closed'].includes(i.status));
  const myResolved = incidents.filter(i => ['rescued', 'closed'].includes(i.status));
  const availableShelters = shelters.filter(s => s.status === 'available');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-brand-900 to-blue-800 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-2xl font-black">
              {currentUser.full_name.charAt(0)}
            </div>
            <div>
              <p className="text-blue-200 text-sm font-medium">Welcome back to D-MERS</p>
              <h2 className="text-2xl font-extrabold">{currentUser.full_name}</h2>
              <p className="text-blue-300 text-xs">{currentUser.location || 'Location not set'} • Citizen Portal</p>
            </div>
          </div>
          <button
            onClick={() => setShowReportWizard(true)}
            className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 rounded-2xl text-white font-bold text-sm shadow-lg shadow-red-900/30 transition"
          >
            <AlertCircle className="w-5 h-5 animate-bounce" />
            <span>Report Emergency SOS</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card text-center">
          <div className="text-3xl font-black text-red-600">{myActive.length}</div>
          <div className="text-xs font-semibold text-slate-500 mt-1">Active Reports</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card text-center">
          <div className="text-3xl font-black text-emerald-600">{myResolved.length}</div>
          <div className="text-xs font-semibold text-slate-500 mt-1">Resolved</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card text-center">
          <div className="text-3xl font-black text-blue-600">{availableShelters.length}</div>
          <div className="text-xs font-semibold text-slate-500 mt-1">Open Shelters</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card text-center">
          <div className="text-3xl font-black text-amber-600">{alerts.length}</div>
          <div className="text-xs font-semibold text-slate-500 mt-1">Active Alerts</div>
        </div>
      </div>

      {/* Active Alerts Banner */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-600" /> Emergency Alerts
          </h3>
          {alerts.map(alert => (
            <div key={alert.id} className={`p-4 rounded-2xl border flex items-start gap-3 ${
              alert.severity === 'danger' ? 'bg-red-50 border-red-200 text-red-900' :
              alert.severity === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
              'bg-blue-50 border-blue-200 text-blue-900'
            }`}>
              <Bell className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <div className="font-bold text-sm">{alert.title}</div>
                <div className="text-xs mt-0.5">{alert.message}</div>
                <div className="text-[11px] mt-1 opacity-70">Area: {alert.affected_area}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Disaster Reports */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" /> My Emergency Reports
          </h3>
          <button onClick={() => setShowReportWizard(true)} className="text-xs font-bold text-blue-600 hover:underline">
            + New Report
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-400 text-sm">Loading your reports...</div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-card">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">No reports yet</p>
            <p className="text-xs text-slate-400 mt-1">Report an emergency and help will be dispatched.</p>
            <button onClick={() => setShowReportWizard(true)} className="mt-4 px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700">
              Report Emergency Now
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map(inc => (
              <div key={inc.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card hover:shadow-card-hover transition">
                <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                  <div>
                    <div className="font-bold text-slate-900">{inc.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500" /> {inc.location_name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">ID: {inc.report_number}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <PriorityBadge
                      score={inc.priority_score}
                      severity={inc.severity}
                      disasterType={inc.disaster_type}
                      peopleAffected={inc.people_affected}
                      peopleNeedingHelp={inc.people_needing_help}
                    />
                    <StatusBadge status={inc.status} />
                  </div>
                </div>
                <div className="text-xs text-slate-600 line-clamp-2 mb-3">{inc.description}</div>
                <div className="flex flex-wrap justify-between items-center gap-2 text-[11px] pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> {inc.people_needing_help} need help
                    </span>
                    {inc.assigned_rescue_team_name && (
                      <span className="font-semibold text-blue-700">
                        🚒 {inc.assigned_rescue_team_name}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleViewTimeline(inc)}
                    className="flex items-center gap-1 text-blue-600 font-bold hover:underline"
                  >
                    View Rescue Timeline <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shelter Availability */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
          <Home className="w-5 h-5 text-emerald-600" /> Nearby Relief Shelters
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shelters.map(sh => {
            const ratio = sh.current_occupancy / sh.capacity;
            return (
              <div key={sh.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-slate-900 text-sm leading-snug">{sh.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{sh.location}</div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-1 rounded-lg border ${
                    sh.status === 'available' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                    sh.status === 'high_occupancy' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                    'bg-red-100 text-red-800 border-red-300'
                  }`}>
                    {sh.status === 'available' ? '✓ OPEN' : sh.status === 'high_occupancy' ? '⚠ HIGH' : '✗ FULL'}
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Occupancy</span>
                    <span className="font-bold">{sh.current_occupancy} / {sh.capacity}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${ratio >= 1 ? 'bg-red-500' : ratio >= 0.85 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {sh.amenities.slice(0, 4).map((a: string, i: number) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-medium">
                      {a}
                    </span>
                  ))}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {sh.contact_person}: {sh.contact_phone}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Missing Persons */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-orange-600" /> Missing Person Reports
          </h3>
          <button onClick={() => setShowMissingForm(!showMissingForm)} className="text-xs font-bold text-orange-600 hover:underline">
            {showMissingForm ? 'Cancel' : '+ Report Missing Person'}
          </button>
        </div>

        {showMissingForm && (
          <form onSubmit={handleMissingSubmit} className="bg-orange-50 border border-orange-200 p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-orange-900 mb-1">Full Name</label>
              <input required value={mpForm.full_name} onChange={e => setMpForm({ ...mpForm, full_name: e.target.value })} className="w-full p-2 rounded-xl border border-orange-200 focus:outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-orange-900 mb-1">Age</label>
              <input required type="number" value={mpForm.age} onChange={e => setMpForm({ ...mpForm, age: Number(e.target.value) })} className="w-full p-2 rounded-xl border border-orange-200 focus:outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-orange-900 mb-1">Gender</label>
              <select value={mpForm.gender} onChange={e => setMpForm({ ...mpForm, gender: e.target.value })} className="w-full p-2 rounded-xl border border-orange-200 focus:outline-none">
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-orange-900 mb-1">Last Seen Location</label>
              <input required value={mpForm.last_seen_location} onChange={e => setMpForm({ ...mpForm, last_seen_location: e.target.value })} className="w-full p-2 rounded-xl border border-orange-200 focus:outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-orange-900 mb-1">Last Seen Date</label>
              <input required type="date" value={mpForm.last_seen_date} onChange={e => setMpForm({ ...mpForm, last_seen_date: e.target.value })} className="w-full p-2 rounded-xl border border-orange-200 focus:outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-orange-900 mb-1">Reporter Phone</label>
              <input required value={mpForm.reporter_phone} onChange={e => setMpForm({ ...mpForm, reporter_phone: e.target.value })} className="w-full p-2 rounded-xl border border-orange-200 focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-orange-900 mb-1">Physical Description</label>
              <textarea required rows={2} value={mpForm.description} onChange={e => setMpForm({ ...mpForm, description: e.target.value })} className="w-full p-2 rounded-xl border border-orange-200 focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="w-full py-2.5 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700">Submit Missing Person Report</button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {missing.map(mp => (
            <div key={mp.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex justify-between items-start gap-4">
              <div>
                <div className="font-bold text-slate-900">{mp.full_name}, Age {mp.age} ({mp.gender})</div>
                <div className="text-xs text-slate-500 mt-0.5">Last seen: {mp.last_seen_location} on {mp.last_seen_date}</div>
                <div className="text-xs text-slate-600 mt-1">{mp.description}</div>
                <div className="text-[11px] text-slate-400 mt-1">Contact: {mp.reporter_name} — {mp.reporter_phone}</div>
              </div>
              <span className={`shrink-0 text-[10px] font-extrabold px-2 py-1 rounded-lg border ${
                mp.status === 'missing' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                {mp.status === 'missing' ? '⚠ MISSING' : '✓ FOUND'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Timeline Drawer */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedIncident(null)}>
          <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl p-6 space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Rescue Response Timeline</h3>
                <p className="text-xs text-slate-500">{selectedIncident.report_number} • {selectedIncident.title}</p>
              </div>
              <button onClick={() => setSelectedIncident(null)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <PriorityBadge score={selectedIncident.priority_score} severity={selectedIncident.severity} disasterType={selectedIncident.disaster_type} peopleAffected={selectedIncident.people_affected} peopleNeedingHelp={selectedIncident.people_needing_help} />
              <StatusBadge status={selectedIncident.status} />
            </div>

            <div className="relative space-y-0">
              {timeline.length === 0 && <p className="text-xs text-slate-400 text-center py-8">No timeline events yet.</p>}
              {timeline.map((event, index) => (
                <div key={event.id} className="relative flex gap-4 pb-6">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center z-10">
                      <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                    {index < timeline.length - 1 && <div className="w-0.5 bg-slate-200 flex-1 mt-1" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <StatusBadge status={event.status} />
                    <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">{event.note}</p>
                    <div className="text-[11px] text-slate-400 mt-1">
                      By: {event.updated_by_name} ({event.updated_by_role}) • {new Date(event.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <IncidentReportWizard
        isOpen={showReportWizard}
        currentUser={currentUser}
        onClose={() => setShowReportWizard(false)}
        onSubmitted={loadData}
      />
    </div>
  );
};
