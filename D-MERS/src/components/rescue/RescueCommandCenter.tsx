import React, { useEffect, useState } from 'react';
import { IncidentReport, TimelineEvent, UserProfile, IncidentStatus } from '../../types';
import { DataProvider } from '../../lib/supabase';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import {
  AlertTriangle, Truck, MapPin, Users, CheckCircle2, Activity,
  Clock, ChevronDown, Radio, Phone, X
} from 'lucide-react';

interface RescueCommandProps {
  currentUser: UserProfile;
}

export const RescueCommandCenter: React.FC<RescueCommandProps> = ({ currentUser }) => {
  const [allIncidents, setAllIncidents] = useState<IncidentReport[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [statusToSet, setStatusToSet] = useState<IncidentStatus>('dispatched');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'assigned' | 'all' | 'completed'>('assigned');

  const loadData = async () => {
    setLoading(true);
    const incs = await DataProvider.getIncidents();
    setAllIncidents(incs);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSelectIncident = async (inc: IncidentReport) => {
    setSelectedIncident(inc);
    setStatusToSet(inc.status === 'dispatched' ? 'on_scene' : inc.status === 'on_scene' ? 'rescued' : 'rescued');
    const tl = await DataProvider.getTimelineEvents(inc.id);
    setTimeline(tl);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !noteInput.trim()) return;

    const updated = await DataProvider.updateIncidentStatus(
      selectedIncident.id,
      statusToSet,
      currentUser.full_name,
      'rescue_team',
      noteInput,
    );
    setSelectedIncident(updated);
    setNoteInput('');
    const tl = await DataProvider.getTimelineEvents(updated.id);
    setTimeline(tl);
    loadData();
  };

  const handleAcceptIncident = async (inc: IncidentReport) => {
    const updated = await DataProvider.updateIncidentStatus(
      inc.id,
      'dispatched',
      currentUser.full_name,
      'rescue_team',
      `${currentUser.full_name} (${currentUser.agency_name || 'Rescue Team'}) accepted this mission. Unit mobilizing for dispatch.`,
      currentUser.id,
      currentUser.agency_name || currentUser.full_name,
    );
    loadData();
    setSelectedIncident(updated);
    const tl = await DataProvider.getTimelineEvents(updated.id);
    setTimeline(tl);
  };

  const filteredIncidents = allIncidents.filter(inc => {
    if (activeFilter === 'assigned') return ['reported', 'triaged', 'dispatched', 'on_scene'].includes(inc.status);
    if (activeFilter === 'completed') return ['rescued', 'closed'].includes(inc.status);
    return true;
  });

  const criticalCount = allIncidents.filter(i => i.priority_score >= 80 && !['rescued', 'closed'].includes(i.status)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Command Header */}
      <div className="bg-gradient-to-r from-red-700 to-rose-800 rounded-3xl p-6 text-white shadow-xl mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/15 rounded-2xl border border-white/25">
              <Radio className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold">Rescue Command Center</h2>
              <p className="text-red-200 text-sm">{currentUser.agency_name || currentUser.full_name} • Operations Feed</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-black text-red-300">{criticalCount}</div>
              <div className="text-xs text-red-200">Critical Pending</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-white">{allIncidents.filter(i => ['dispatched', 'on_scene'].includes(i.status)).length}</div>
              <div className="text-xs text-red-200">Active Ops</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Priority Incident Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-lg">Priority Dispatch Queue</h3>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
              <button onClick={() => setActiveFilter('assigned')} className={`px-2.5 py-1 rounded-lg ${activeFilter === 'assigned' ? 'bg-white shadow text-red-700' : 'text-slate-500'}`}>Active</button>
              <button onClick={() => setActiveFilter('all')} className={`px-2.5 py-1 rounded-lg ${activeFilter === 'all' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>All</button>
              <button onClick={() => setActiveFilter('completed')} className={`px-2.5 py-1 rounded-lg ${activeFilter === 'completed' ? 'bg-white shadow text-emerald-700' : 'text-slate-500'}`}>Done</button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading incidents...</div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredIncidents.map(inc => (
                <div
                  key={inc.id}
                  onClick={() => handleSelectIncident(inc)}
                  className={`bg-white p-4 rounded-2xl border cursor-pointer transition hover:shadow-card-hover ${
                    selectedIncident?.id === inc.id ? 'border-red-400 shadow-md shadow-red-100' : 'border-slate-200 shadow-card'
                  }`}
                >
                  {/* Priority Score Bar */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 text-sm truncate">{inc.title}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-red-500" /> {inc.location_name}
                      </div>
                    </div>
                    <PriorityBadge score={inc.priority_score} severity={inc.severity} disasterType={inc.disaster_type} peopleAffected={inc.people_affected} peopleNeedingHelp={inc.people_needing_help} />
                  </div>

                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full ${inc.priority_score >= 80 ? 'bg-red-500' : inc.priority_score >= 60 ? 'bg-orange-500' : 'bg-amber-400'}`}
                      style={{ width: `${inc.priority_score}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <StatusBadge status={inc.status} />
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{inc.people_needing_help}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(inc.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {inc.status === 'reported' && (
                    <button
                      onClick={e => { e.stopPropagation(); handleAcceptIncident(inc); }}
                      className="mt-3 w-full py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 flex items-center justify-center gap-1.5"
                    >
                      <Truck className="w-4 h-4" /> Accept Mission & Dispatch
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Mission Detail & Timeline Logger */}
        <div className="space-y-4">
          {!selectedIncident ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-card h-[500px] flex flex-col items-center justify-center text-slate-400">
              <AlertTriangle className="w-12 h-12 text-slate-300 mb-3" />
              <p className="font-semibold">Select an incident from the queue</p>
              <p className="text-xs mt-1">to view details and update response status</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
              {/* Incident Header */}
              <div className="bg-slate-900 text-white p-5 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-blue-300">{selectedIncident.report_number}</span>
                    <h3 className="text-lg font-extrabold leading-snug">{selectedIncident.title}</h3>
                    <div className="flex items-center gap-1 text-slate-300 text-xs mt-0.5">
                      <MapPin className="w-3.5 h-3.5" /> {selectedIncident.location_name}
                    </div>
                  </div>
                  <PriorityBadge score={selectedIncident.priority_score} severity={selectedIncident.severity} disasterType={selectedIncident.disaster_type} peopleAffected={selectedIncident.people_affected} peopleNeedingHelp={selectedIncident.people_needing_help} />
                </div>
                <div className="flex gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <span>👤 {selectedIncident.citizen_name}</span>
                  <span><Phone className="inline w-3.5 h-3.5" /> {selectedIncident.citizen_phone}</span>
                  <span>👥 {selectedIncident.people_needing_help} need rescue</span>
                </div>
              </div>

              {/* Status Update Form */}
              {!['rescued', 'closed'].includes(selectedIncident.status) && (
                <form onSubmit={handleUpdateStatus} className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-800">Update Rescue Status</div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={statusToSet}
                      onChange={e => setStatusToSet(e.target.value as IncidentStatus)}
                      className="text-xs p-2 rounded-xl border border-slate-300 font-semibold"
                    >
                      <option value="dispatched">Dispatched — En Route</option>
                      <option value="on_scene">On Scene — Operations Active</option>
                      <option value="rescued">Rescued — Mission Complete</option>
                      <option value="closed">Closed — No Action Required</option>
                    </select>
                    <button type="submit" className="py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition">
                      Post Update
                    </button>
                  </div>
                  <textarea
                    required
                    rows={2}
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    placeholder="Field update note (location, situation, actions taken, resources deployed)..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </form>
              )}

              {/* Emergency Timeline */}
              <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-600" /> Response Timeline Log
                </div>
                {timeline.map((event, i) => (
                  <div key={event.id} className="flex gap-3 text-xs">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1 ring-4 ring-blue-100 shrink-0" />
                      {i < timeline.length - 1 && <div className="w-px bg-slate-200 flex-1 mt-1" />}
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={event.status} />
                        <span className="text-slate-400">{new Date(event.created_at).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{event.note}</p>
                      <span className="text-slate-400">— {event.updated_by_name} ({event.updated_by_role})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
