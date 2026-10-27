import React, { useState } from 'react';
import { ShieldAlert, Info } from 'lucide-react';
import { calculatePriorityScore } from '../../utils/priorityEngine';
import { DisasterType, SeverityLevel } from '../../types';

interface PriorityBadgeProps {
  score: number;
  severity?: SeverityLevel;
  disasterType?: DisasterType;
  peopleAffected?: number;
  peopleNeedingHelp?: number;
  showBreakdownModal?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  score,
  severity = 'high',
  disasterType = 'flood',
  peopleAffected = 5,
  peopleNeedingHelp = 2,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const breakdown = calculatePriorityScore({
    severity,
    peopleAffected,
    peopleNeedingHelp,
    disasterType,
  });

  return (
    <div className="relative inline-block">
      <div 
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border cursor-help transition-all shadow-sm ${breakdown.badgeColor}`}
      >
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>PRIORITY {score}/100</span>
        <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-white/60 text-slate-800">
          {breakdown.label}
        </span>
      </div>

      {showTooltip && (
        <div className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl border border-slate-700 transition-all pointer-events-none">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-700 font-semibold text-blue-300">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Priority Engine Score
            </span>
            <span className="text-white font-bold">{score} / 100</span>
          </div>
          <div className="space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span>Severity Level Impact:</span>
              <span className="font-semibold text-white">+{breakdown.severityPoints} pts</span>
            </div>
            <div className="flex justify-between">
              <span>People Affected & Injured:</span>
              <span className="font-semibold text-white">+{breakdown.peoplePoints} pts</span>
            </div>
            <div className="flex justify-between">
              <span>Vulnerability Multiplier:</span>
              <span className="font-semibold text-white">+{breakdown.vulnerabilityPoints} pts</span>
            </div>
            <div className="flex justify-between">
              <span>Disaster Type Index:</span>
              <span className="font-semibold text-white">+{breakdown.disasterTypePoints} pts</span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-800 pt-1 italic">
            Automated Smart Rescue Dispatch Weighting
          </div>
        </div>
      )}
    </div>
  );
};
