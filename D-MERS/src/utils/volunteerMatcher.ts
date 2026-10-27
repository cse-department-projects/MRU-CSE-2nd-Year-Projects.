export interface VolunteerMatchResult {
  matchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  availabilityBonus: boolean;
  matchGrade: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR';
  badgeColor: string;
}

export function calculateVolunteerMatch(
  volunteerSkills: string[] = [],
  isAvailable: boolean = true,
  requiredSkills: string[] = []
): VolunteerMatchResult {
  if (requiredSkills.length === 0) {
    return {
      matchPercentage: isAvailable ? 100 : 50,
      matchingSkills: volunteerSkills,
      missingSkills: [],
      availabilityBonus: isAvailable,
      matchGrade: 'EXCELLENT',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    };
  }

  const volunteerSkillsLower = volunteerSkills.map(s => s.toLowerCase().trim());
  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];

  requiredSkills.forEach(req => {
    const isMatch = volunteerSkillsLower.some(v => v.includes(req.toLowerCase().trim()) || req.toLowerCase().trim().includes(v));
    if (isMatch) {
      matchingSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  });

  const skillCoverageRatio = matchingSkills.length / requiredSkills.length;
  let score = skillCoverageRatio * 75; // Skill weight 75%

  if (isAvailable) {
    score += 25; // Availability weight 25%
  }

  const matchPercentage = Math.round(score);

  let matchGrade: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR' = 'POOR';
  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-300';

  if (matchPercentage >= 85) {
    matchGrade = 'EXCELLENT';
    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold';
  } else if (matchPercentage >= 65) {
    matchGrade = 'GOOD';
    badgeColor = 'bg-blue-100 text-blue-800 border-blue-300 font-semibold';
  } else if (matchPercentage >= 40) {
    matchGrade = 'MODERATE';
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
  }

  return {
    matchPercentage,
    matchingSkills,
    missingSkills,
    availabilityBonus: isAvailable,
    matchGrade,
    badgeColor,
  };
}
