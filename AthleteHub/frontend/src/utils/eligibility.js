/**
 * Utility functions for athlete gender and age eligibility checking across Teams and Tournaments.
 */

export function isMale(gender) {
  if (!gender) return false;
  const g = String(gender).trim().toUpperCase();
  return ['MALE', 'MEN', 'MAN', 'BOYS', 'BOY', 'M'].includes(g);
}

export function isFemale(gender) {
  if (!gender) return false;
  const g = String(gender).trim().toUpperCase();
  return ['FEMALE', 'WOMEN', 'WOMAN', 'GIRLS', 'GIRL', 'F'].includes(g);
}

export function isNeutralOrCoed(category) {
  if (!category) return true;
  const c = String(category).trim().toUpperCase();
  return ['COED', 'MIXED', 'ANY', 'OPEN', 'ALL', 'ALL AGES'].includes(c);
}

/**
 * Check if an athlete's gender is eligible for a team/tournament category.
 */
export function checkGenderEligibility(categoryGender, athleteGender) {
  if (isNeutralOrCoed(categoryGender)) return { eligible: true };
  
  if (isMale(categoryGender)) {
    if (isFemale(athleteGender)) {
      return { eligible: false, reason: `Female athletes cannot join Male/Men division` };
    }
    return { eligible: true };
  }

  if (isFemale(categoryGender)) {
    if (isMale(athleteGender)) {
      return { eligible: false, reason: `Male athletes cannot join Female/Women division` };
    }
    return { eligible: true };
  }

  return { eligible: true };
}

/**
 * Extracts the maximum allowed age for a team ageGroup or tournament ageCategory.
 */
export function getMaxAgeLimit(ageGroup) {
  if (!ageGroup) return null;
  const norm = String(ageGroup).trim().toUpperCase();

  if (norm.includes('ALL AGES') || norm === 'OPEN' || norm.includes('SENIOR')) {
    return null;
  }
  if (norm.includes('U14') || norm.includes('UNDER-14') || norm.includes('UNDER 14') || norm.includes('UNDER_14')) {
    return 14;
  }
  if (norm.includes('U16') || norm.includes('UNDER-16') || norm.includes('UNDER 16') || norm.includes('UNDER_16')) {
    return 16;
  }
  if (norm.includes('U18') || norm.includes('UNDER-18') || norm.includes('UNDER 18') || norm.includes('UNDER_18') || norm.includes('JUNIOR VARSITY')) {
    return 18;
  }
  if (norm.includes('U19') || norm.includes('UNDER-19') || norm.includes('UNDER 19') || norm.includes('UNDER_19')) {
    return 19;
  }
  if (norm.includes('U21') || norm.includes('UNDER-21') || norm.includes('UNDER 21') || norm.includes('UNDER_21') || norm.includes('SENIOR VARSITY')) {
    return 21;
  }
  if (norm.includes('U23') || norm.includes('UNDER-23') || norm.includes('UNDER 23') || norm.includes('UNDER_23')) {
    return 23;
  }
  if (norm.includes('COLLEGIATE')) {
    return 25;
  }

  const match = norm.match(/(?:U|UNDER[-_ ]?)(\d+)/i);
  if (match) {
    return parseInt(match[1], 10);
  }

  return null;
}

/**
 * Calculates current age from date of birth.
 */
export function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Check if athlete age is eligible for an age group/category.
 */
export function checkAgeEligibility(ageGroup, dateOfBirth, directAge) {
  const age = directAge !== undefined && directAge !== null ? directAge : calculateAge(dateOfBirth);
  if (age === null || !ageGroup) return { eligible: true, age };

  const maxAge = getMaxAgeLimit(ageGroup);
  if (maxAge !== null && age > maxAge) {
    return {
      eligible: false,
      age,
      maxAge,
      reason: `Age ${age} exceeds limit of ${maxAge} for ${ageGroup}`
    };
  }

  return { eligible: true, age, maxAge };
}
