import { DisasterType, SeverityLevel } from '../types';

export interface PriorityBreakdown {
  score: number;
  severityPoints: number;
  peoplePoints: number;
  vulnerabilityPoints: number;
  disasterTypePoints: number;
  waitingPoints: number;
  label: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  badgeColor: string;
}

/**
 * Calculates a transparent 0-100 Priority Score for Emergency Rescue Dispatch.
 */
export function calculatePriorityScore(params: {
  severity: SeverityLevel;
  peopleAffected: number;
  peopleNeedingHelp: number;
  disasterType: DisasterType;
  hasElderlyChildren?: boolean;
  hasMedicalEmergency?: boolean;
  isTrapped?: boolean;
  createdAt?: string;
}): PriorityBreakdown {
  const {
    severity,
    peopleAffected,
    peopleNeedingHelp,
    disasterType,
    hasElderlyChildren = false,
    hasMedicalEmergency = false,
    isTrapped = false,
    createdAt,
  } = params;

  // 1. Severity Base Score
  let severityPoints = 15;
  if (severity === 'medium') severityPoints = 35;
  if (severity === 'high') severityPoints = 65;
  if (severity === 'critical') severityPoints = 90;

  // 2. People Factor
  const affectedBonus = Math.min(peopleAffected * 1.5, 15);
  const helpBonus = Math.min(peopleNeedingHelp * 3, 25);
  const peoplePoints = Math.round(affectedBonus + helpBonus);

  // 3. Vulnerability Indicators
  let vulnerabilityPoints = 0;
  if (hasElderlyChildren) vulnerabilityPoints += 10;
  if (hasMedicalEmergency) vulnerabilityPoints += 20;
  if (isTrapped) vulnerabilityPoints += 20;

  // 4. Disaster Type Multiplier
  let disasterTypePoints = 0;
  if (disasterType === 'earthquake' || disasterType === 'building_collapse') {
    disasterTypePoints = 15;
  } else if (disasterType === 'fire' || disasterType === 'flood') {
    disasterTypePoints = 10;
  } else if (disasterType === 'cyclone' || disasterType === 'landslide') {
    disasterTypePoints = 8;
  }

  // 5. Waiting Time Acceleration
  let waitingPoints = 0;
  if (createdAt) {
    const elapsedMinutes = Math.max(0, (Date.now() - new Date(createdAt).getTime()) / (1000 * 60));
    const elapsedHours = elapsedMinutes / 60;
    waitingPoints = Math.min(Math.round(elapsedHours * 4), 20); // +4 pts per hour, max 20
  }

  // Raw Total Calculation
  const totalScore = Math.min(
    100,
    Math.round(severityPoints * 0.45 + peoplePoints * 0.25 + vulnerabilityPoints * 0.2 + disasterTypePoints * 0.1 + waitingPoints)
  );

  let label: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';

  if (totalScore >= 80) {
    label = 'CRITICAL';
    badgeColor = 'bg-red-100 text-red-800 border-red-300 animate-pulse';
  } else if (totalScore >= 60) {
    label = 'HIGH';
    badgeColor = 'bg-orange-100 text-orange-800 border-orange-300';
  } else if (totalScore >= 40) {
    label = 'MEDIUM';
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
  }

  return {
    score: totalScore,
    severityPoints,
    peoplePoints,
    vulnerabilityPoints,
    disasterTypePoints,
    waitingPoints,
    label,
    badgeColor,
  };
}
