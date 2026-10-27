import React, { useEffect, useState } from 'react';
import { IncidentReport, UserProfile, EmergencyAlert, MissingPerson } from '../../types';
import { DataProvider } from '../../lib/supabase';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { exportToCSV } from '../../utils/exportCsv';
import {
  Shield, Users, AlertTriangle, Home, HeartHandshake, Bell,
  User, FileText, Download, BarChart2, CheckCircle, Search,
  Truck, TrendingUp
} from 'lucide-react';

interface AdminOpsProps {
  currentUser: UserProfile;
}

type AdminTab = 'overview' | 'incidents' | 'shelters' | 'alerts' | 'missing' | 'recovery';

export const AdminOperationsCenter: React.FC<AdminOpsProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [shelters, setShelters] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [missing, setMissing] = useState<MissingPerson[]>([]);
  const [recovery, setRecovery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignForm, setAssignForm] = useState<{ incId: string; note: string }>({ incId: '', note: '' });
  const [alertForm, setAlertForm] = useState({ title: '', message: '', severity: 'warning' as EmergencyAlert['severity'], affected_area: '' });
  const [showAlertForm, setShowAlertForm] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    const [incs, shls, alts, mps, recs] = await Promise.all([
      DataProvider.getIncidents(),
      DataProvider.getShelters(),
      DataProvider.getAlerts(),
      DataProvider.getMissingPersons(),
      DataProvider.getRecoveryResources(),
    ]);
    setIncidents(incs);
    setShelters(shls);
    setAlerts(alts);
    setMissing(mps);
    setRecovery(recs);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const handleTriageIncident = async (inc: IncidentReport) => {
    await DataProvider.updateIncidentStatus(inc.id, 'triaged', currentUser.full_name, 'admin', 'Command Center reviewed and triaged incident for dispatch.');
    loadAll();
  };

  const handleMarkMissingFound = async (id: string) => {
    await DataProvider.markMissingPersonFound(id);
    loadAll();
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    await DataProvider.createAlert(alertForm);
    setShowAlertForm(false);
    setAlertForm({ title: '', message: '', severity: 'warning', affected_area: '' });
    loadAll();
  };

  // Stats
  const activeIncidents = incidents.filter(i => !['rescued', 'closed'].includes(i.status));
  const criticalCount = activeIncidents.filter(i => i.priority_score >= 80).length;
  const totalCapacity = shelters.reduce((sum, s) => sum + s.capacity, 0);
  const totalOccupied = shelters.reduce((sum, s) => sum + s.current_occupancy, 0);
  const typeDistribution = incidents.reduce((acc, inc) => {
    acc[inc.disaster_type] = (acc[inc.disaster_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredIncidents = incidents.filter(i =>
    !searchQuery || i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.report_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'Command Overview', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'incidents', label: 'Incidents', icon: <AlertTriangle className="w-4 h-4" />, count: activeIncidents.length },
    { id: 'shelters', label: 'Shelters', icon: <Home className="w-4 h-4" /> },
    { id: 'alerts', label: 'Broadcasts', icon: <Bell className="w-4 h-4" />, count: alerts.length },
    { id: 'missing', label: 'Missing Persons', icon: <User className="w-4 h-4" />, count: missing.filter(m => m.status === 'missing').length },
    { id: 'recovery', label: 'Recovery', icon: <HeartHandshake className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Command Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold">Administrator Operations Center</h2>
              <p className="text-slate-300 text-sm">{currentUser.full_name} • Full System Command & Analytics</p>
            </div>
          </div>
          <button
            onClick={() => exportToCSV(incidents, 'dmers_incidents_report')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-xs hover:bg-white/20 transition"
          >
            <Download className="w-4 h-4" /> Export CSV Report
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-x-auto">
        <div className="flex border-b border-slate-200 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-4 text-xs font-bold transition border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-800 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-extrabold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading system data...</div>
          ) : (
            <>
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-red-50 border border-red-200 p-5 rounded-2xl text-center">
                      <div className="text-3xl font-black text-red-600">{criticalCount}</div>
                      <div className="text-xs font-semibold text-red-800 mt-1">CRITICAL Incidents</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl text-center">
                      <div className="text-3xl font-black text-blue-600">{activeIncidents.length}</div>
                      <div className="text-xs font-semibold text-blue-800 mt-1">Active Operations</div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-center">
                      <div className="text-3xl font-black text-emerald-600">{totalCapacity - totalOccupied}</div>
                      <div className="text-xs font-semibold text-emerald-800 mt-1">Shelter Beds Free</div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl text-center">
                      <div className="text-3xl font-black text-amber-600">{missing.filter(m => m.status === 'missing').length}</div>
                      <div className="text-xs font-semibold text-amber-800 mt-1">Missing Persons</div>
                    </div>
                  </div>

                  {/* Disaster Type Distribution */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                    <h4 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" /> Incident Distribution by Type
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(typeDistribution).map(([type, count]) => (
                        <div key={type}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold capitalize text-slate-700">{type.replace('_', ' ')}</span>
                            <span className="font-bold text-slate-900">{count}</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"
                              style={{ width: `${(count / incidents.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Pipeline */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(['reported', 'triaged', 'dispatched', 'on_scene', 'rescued', 'closed'] as const).map(status => {
                      const cnt = incidents.filter(i => i.status === status).length;
                      return (
                        <div key={status} className="bg-white border border-slate-200 p-4 rounded-2xl text-center shadow-sm">
                          <div className="text-2xl font-black text-slate-800">{cnt}</div>
                          <StatusBadge status={status} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* INCIDENTS TAB */}
              {activeTab === 'incidents' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search incidents by title, location, or report number..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="text-left p-3">Report #</th>
                          <th className="text-left p-3">Title / Location</th>
                          <th className="text-left p-3">Priority</th>
                          <th className="text-left p-3">Status</th>
                          <th className="text-left p-3">Assigned To</th>
                          <th className="text-left p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredIncidents.map(inc => (
                          <tr key={inc.id} className="hover:bg-slate-50 transition">
                            <td className="p-3 font-mono font-bold text-slate-700">{inc.report_number}</td>
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{inc.title}</div>
                              <div className="text-slate-500">{inc.location_name}</div>
                            </td>
                            <td className="p-3">
                              <PriorityBadge score={inc.priority_score} severity={inc.severity} disasterType={inc.disaster_type} peopleAffected={inc.people_affected} peopleNeedingHelp={inc.people_needing_help} />
                            </td>
                            <td className="p-3"><StatusBadge status={inc.status} /></td>
                            <td className="p-3 text-slate-600">{inc.assigned_rescue_team_name || <span className="text-red-500 font-semibold">Unassigned</span>}</td>
                            <td className="p-3">
                              {inc.status === 'reported' && (
                                <button onClick={() => handleTriageIncident(inc)} className="px-3 py-1.5 bg-amber-600 text-white rounded-xl font-bold text-[11px] hover:bg-amber-700 flex items-center gap-1">
                                  <Truck className="w-3.5 h-3.5" /> Triage
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ALERTS TAB */}
              {activeTab === 'alerts' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-900">Emergency Broadcast Management</h3>
                    <button onClick={() => setShowAlertForm(!showAlertForm)} className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700">
                      <Bell className="w-4 h-4" /> Issue New Broadcast
                    </button>
                  </div>

                  {showAlertForm && (
                    <form onSubmit={handleCreateAlert} className="bg-red-50 border border-red-200 p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-red-900 mb-1">Broadcast Title</label>
                        <input required value={alertForm.title} onChange={e => setAlertForm({ ...alertForm, title: e.target.value })} className="w-full p-2.5 rounded-xl border border-red-200" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-red-900 mb-1">Broadcast Message</label>
                        <textarea required rows={2} value={alertForm.message} onChange={e => setAlertForm({ ...alertForm, message: e.target.value })} className="w-full p-2.5 rounded-xl border border-red-200" />
                      </div>
                      <div>
                        <label className="block font-semibold text-red-900 mb-1">Severity</label>
                        <select value={alertForm.severity} onChange={e => setAlertForm({ ...alertForm, severity: e.target.value as EmergencyAlert['severity'] })} className="w-full p-2.5 rounded-xl border border-red-200">
                          <option value="info">Info</option>
                          <option value="warning">Warning</option>
                          <option value="danger">DANGER — Severe</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-red-900 mb-1">Affected Area</label>
                        <input required value={alertForm.affected_area} onChange={e => setAlertForm({ ...alertForm, affected_area: e.target.value })} placeholder="e.g. LB Nagar, Uppal, Malakpet" className="w-full p-2.5 rounded-xl border border-red-200" />
                      </div>
                      <div className="sm:col-span-2 flex justify-end gap-2">
                        <button type="button" onClick={() => setShowAlertForm(false)} className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold">Cancel</button>
                        <button type="submit" className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold">Issue Broadcast</button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-3">
                    {alerts.map(alert => (
                      <div key={alert.id} className={`p-4 rounded-2xl border text-sm ${
                        alert.severity === 'danger' ? 'bg-red-50 border-red-200 text-red-900' :
                        alert.severity === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                        'bg-blue-50 border-blue-200 text-blue-900'
                      }`}>
                        <div className="font-bold">{alert.title}</div>
                        <div className="text-xs mt-1">{alert.message}</div>
                        <div className="text-[11px] mt-1 opacity-70">Area: {alert.affected_area} • {new Date(alert.created_at).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MISSING PERSONS TAB */}
              {activeTab === 'missing' && (
                <div className="space-y-3">
                  {missing.map(mp => (
                    <div key={mp.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex justify-between items-start gap-4">
                      <div>
                        <div className="font-bold text-slate-900">{mp.full_name}, Age {mp.age} ({mp.gender})</div>
                        <div className="text-xs text-slate-500">Last seen: {mp.last_seen_location} on {mp.last_seen_date}</div>
                        <div className="text-xs text-slate-600 mt-1">{mp.description}</div>
                        <div className="text-[11px] text-slate-400">Reporter: {mp.reporter_name} — {mp.reporter_phone}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`text-[10px] font-extrabold px-2 py-1 rounded-lg border ${mp.status === 'missing' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'}`}>
                          {mp.status === 'missing' ? '⚠ MISSING' : '✓ FOUND'}
                        </span>
                        {mp.status === 'missing' && (
                          <button onClick={() => handleMarkMissingFound(mp.id)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold text-[11px] hover:bg-emerald-700 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Mark Found
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SHELTERS TAB */}
              {activeTab === 'shelters' && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="text-left p-3">Shelter Name</th>
                        <th className="text-left p-3">Location</th>
                        <th className="text-left p-3">Occupancy</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {shelters.map(sh => (
                        <tr key={sh.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{sh.name}</td>
                          <td className="p-3 text-slate-600">{sh.location}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${sh.status === 'full' ? 'bg-red-500' : sh.status === 'high_occupancy' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                  style={{ width: `${Math.min(sh.current_occupancy / sh.capacity * 100, 100)}%` }}
                                />
                              </div>
                              <span className="font-bold">{sh.current_occupancy}/{sh.capacity}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] font-extrabold px-2 py-1 rounded-lg border ${sh.status === 'available' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : sh.status === 'high_occupancy' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-red-100 text-red-800 border-red-300'}`}>
                              {sh.status.toUpperCase().replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">{sh.contact_person}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* RECOVERY TAB */}
              {activeTab === 'recovery' && (
                <div className="space-y-3">
                  {recovery.map(r => (
                    <div key={r.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex justify-between items-start">
                      <div>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${r.type === 'request' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {r.type}
                        </span>
                        <div className="font-bold text-slate-900 mt-1">{r.title}</div>
                        <div className="text-xs text-slate-500">{r.category} • {r.quantity} • {r.location}</div>
                        <div className="text-[11px] text-slate-400">{r.contact_name} — {r.contact_phone}</div>
                      </div>
                      <span className={`shrink-0 text-[10px] font-extrabold px-2 py-1 rounded-xl border ${r.status === 'open' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'}`}>
                        {r.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
