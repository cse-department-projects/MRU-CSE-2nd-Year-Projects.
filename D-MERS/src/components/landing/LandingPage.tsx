import React from 'react';
import { Shield, AlertCircle, Zap, Activity, Users, Home, HeartHandshake, ArrowRight, CheckCircle2, Clock, MapPin, Radio } from 'lucide-react';
import { DisasterMap } from '../common/DisasterMap';
import { IncidentReport, Shelter, EmergencyAlert } from '../../types';

interface LandingPageProps {
  incidents: IncidentReport[];
  shelters: Shelter[];
  alerts: EmergencyAlert[];
  onOpenReportModal: () => void;
  onNavigateTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  incidents,
  shelters,
  alerts,
  onOpenReportModal,
  onNavigateTab,
}) => {
  const criticalCount = incidents.filter(i => i.priority_score >= 80).length;
  const activeAlert = alerts[0];

  return (
    <div className="space-y-12 pb-12">
      
      {/* Live Emergency Alert Banner */}
      {activeAlert && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-3 shadow-md animate-pulse-glow">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-white/20 rounded-md">
                <Radio className="w-4 h-4 animate-pulse text-white" />
              </span>
              <span className="font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-[10px]">
                EMERGENCY BROADCAST
              </span>
              <span className="font-bold">{activeAlert.title}:</span>
              <span className="text-red-100">{activeAlert.message}</span>
            </div>
            <div className="text-[11px] bg-black/20 px-2.5 py-1 rounded-full text-red-100 whitespace-nowrap">
              Area: {activeAlert.affected_area}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                <span>Next-Gen Smart City Crisis Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-900 tracking-tight leading-none">
                One Platform. <br />
                <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Faster Response.
                </span> <br />
                Safer Communities.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
                D-MERS is a centralized emergency command network connecting citizens, official rescue teams, community volunteers, and administrators in real time during floods, earthquakes, fires, and crisis events.
              </p>

              {/* Call to Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onOpenReportModal}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-sm shadow-lg shadow-red-500/25 hover:from-red-700 hover:to-rose-700 transition transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <AlertCircle className="w-5 h-5 animate-bounce" />
                  <span>Report Emergency SOS</span>
                </button>

                <button
                  onClick={() => onNavigateTab('citizen')}
                  className="px-6 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-800 font-bold text-sm shadow-sm hover:bg-slate-50 transition flex items-center gap-2"
                >
                  <span>Explore Citizen Portal</span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Quick Stat Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
                <div>
                  <div className="text-2xl font-black text-slate-900">&lt; 8 Mins</div>
                  <div className="text-xs text-slate-500 font-medium">Avg Dispatch Speed</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-red-600">{criticalCount} Active</div>
                  <div className="text-xs text-slate-500 font-medium">Critical Emergencies</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-600">100% Verified</div>
                  <div className="text-xs text-slate-500 font-medium">Shelter & Resource Intel</div>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Command Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5 relative">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-brand-900 rounded-xl text-white">
                      <Activity className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Emergency Command Feed</h3>
                      <p className="text-[11px] text-slate-500">Live Priority Operations</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ONLINE
                  </span>
                </div>

                {/* Priority Score Engine Feature Spotlight Card */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-blue-300 font-bold uppercase tracking-wider text-[10px]">
                      Smart Rescue Priority Engine
                    </span>
                    <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-black">
                      SCORE 94 / 100
                    </span>
                  </div>
                  <div className="font-bold text-sm text-white">Flood Rescue SOS: Sector 5 LB Nagar</div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 h-full w-[94%]"></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Severity + Vulnerability Weighting</span>
                    <span className="text-emerald-400 font-semibold">NDRF Team Dispatched</span>
                  </div>
                </div>

                {/* Shelter Intel Snapshot */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
                      <Home className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Govt Model School Shelter</div>
                      <div className="text-[11px] text-slate-500">Occupancy: 210 / 350 beds</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    AVAILABLE
                  </span>
                </div>

                {/* Action shortcut button */}
                <button
                  onClick={() => onNavigateTab('rescue')}
                  className="w-full py-2.5 rounded-xl bg-brand-900 text-white font-bold text-xs hover:bg-brand-800 transition text-center block"
                >
                  View Live Command Dashboard →
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Live Tactical Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Live Disaster Map & GIS Operations</h2>
            <p className="text-xs text-slate-500">Real-time incident plotting, rescue team positioning, and shelter capacity tracking</p>
          </div>
          <button
            onClick={() => onNavigateTab('shelter')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All Shelters</span> →
          </button>
        </div>

        <DisasterMap incidents={incidents} shelters={shelters} />
      </section>

      {/* 5 Unique Core Feature Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 font-bold text-xs border border-red-200">
            <Zap className="w-3.5 h-3.5 text-red-600" />
            <span>5 KEY INNOVATION MODULES</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Engineered for Maximum Speed & Operational Clarity
          </h2>
          <p className="text-slate-600 text-sm">
            Replacing standard basic CRUD with intelligent automated crisis workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600">INNOVATION FEATURE #1</span>
              <h3 className="text-lg font-extrabold text-slate-900">Smart Rescue Priority Engine</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Computes a 0–100 score based on severity, trapped victims, elderly/infants, medical conditions, and waiting time acceleration to prioritize critical lives first.
            </p>
            <button onClick={() => onNavigateTab('citizen')} className="text-xs font-bold text-red-600 hover:underline">
              Test Priority Calculator →
            </button>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">INNOVATION FEATURE #2</span>
              <h3 className="text-lg font-extrabold text-slate-900">Emergency Response Timeline</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provides complete transparency with live status logs (Reported → Triaged → Dispatched → On Scene → Rescued) with official field officer timestamps and notes.
            </p>
            <button onClick={() => onNavigateTab('rescue')} className="text-xs font-bold text-blue-600 hover:underline">
              View Dispatch Log →
            </button>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">INNOVATION FEATURE #3</span>
              <h3 className="text-lg font-extrabold text-slate-900">Smart Volunteer Matching</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Intelligently ranks available volunteers by matching required skills (First Aid, Medical, Logistics, Driving) and location proximity for instant deployment.
            </p>
            <button onClick={() => onNavigateTab('volunteer')} className="text-xs font-bold text-emerald-600 hover:underline">
              Match Volunteer Tasks →
            </button>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600">INNOVATION FEATURE #4</span>
              <h3 className="text-lg font-extrabold text-slate-900">Shelter Capacity Intelligence</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time bed occupancy monitoring, amenities tracking (medical, hot meals, power backup), and distance calculation to prevent shelter overcrowding.
            </p>
            <button onClick={() => onNavigateTab('shelter')} className="text-xs font-bold text-purple-600 hover:underline">
              Inspect Shelters →
            </button>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600">INNOVATION FEATURE #5</span>
              <h3 className="text-lg font-extrabold text-slate-900">Community Recovery Hub</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Post-disaster resource sharing platform. Request or donate essential supplies (water, blankets, tarpaulins, dry food) with status fulfillment tracking.
            </p>
            <button onClick={() => onNavigateTab('recovery')} className="text-xs font-bold text-orange-600 hover:underline">
              Open Recovery Hub →
            </button>
          </div>

          {/* Feature 6 - Admin Control */}
          <div className="bg-brand-900 p-6 rounded-3xl text-white shadow-card space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center border border-white/20">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-300">ADMINISTRATOR SUITE</span>
              <h3 className="text-lg font-extrabold text-white">Central Operations & Analytics</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Full administrative power: dispatch broadcasts, system analytics, user role control, CSV report generation, and missing person resolution.
            </p>
            <button onClick={() => onNavigateTab('admin')} className="text-xs font-bold text-blue-300 hover:underline">
              Access Admin Operations →
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};
