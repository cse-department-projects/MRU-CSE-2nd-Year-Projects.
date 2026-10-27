import React from 'react';
import { Shield, PhoneCall, AlertTriangle, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 pt-12 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="p-1.5 bg-blue-600 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg text-white">D-MERS</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Disaster Management & Emergency Response System. Connecting citizens, rescue teams, volunteers, and administrators for rapid response.
            </p>
            <div className="text-[11px] text-blue-400 font-medium">
              Tagline: “One Platform. Faster Response. Safer Communities.”
            </div>
          </div>

          {/* Emergency Helplines */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Emergency Helplines</h4>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center justify-between bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                <span className="flex items-center gap-1.5"><PhoneCall className="w-3.5 h-3.5 text-red-500" /> National Disaster Control</span>
                <span className="font-bold text-white">1078</span>
              </li>
              <li className="flex items-center justify-between bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                <span className="flex items-center gap-1.5"><PhoneCall className="w-3.5 h-3.5 text-orange-500" /> Fire & Emergency</span>
                <span className="font-bold text-white">101</span>
              </li>
              <li className="flex items-center justify-between bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                <span className="flex items-center gap-1.5"><PhoneCall className="w-3.5 h-3.5 text-blue-400" /> Police Rescue</span>
                <span className="font-bold text-white">100 / 112</span>
              </li>
            </ul>
          </div>

          {/* System Modules */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Core Operations</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>Smart Rescue Priority Engine (0-100 Score)</li>
              <li>Real-time Response Timeline Logger</li>
              <li>Smart Volunteer Skill Matcher</li>
              <li>Shelter Occupancy Intelligence</li>
              <li>Post-Disaster Community Recovery Hub</li>
            </ul>
          </div>

          {/* Platform Notice */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">System Status</h4>
            <div className="bg-emerald-950/60 border border-emerald-800 p-3 rounded-xl text-emerald-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>All Nodes Operational</span>
              </div>
              <p className="text-[11px]">
                High-availability emergency response grid ready for high-concurrency disaster scenarios.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 D-MERS • Disaster Management & Emergency Response System. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Built with Modern Web Technologies & PostgreSQL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
