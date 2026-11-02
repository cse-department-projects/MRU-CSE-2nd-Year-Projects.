export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ORG_ADMIN: 'ORG_ADMIN',
  COACH: 'COACH',
  ATHLETE: 'ATHLETE',
};

export const PERMISSIONS = {
  // Global Administration
  PLATFORM_MANAGE: 'platform.manage',
  ORG_CREATE: 'organization.create',
  ORG_DELETE: 'organization.delete',
  
  // Organization Administration
  ORG_VIEW: 'organization.view',
  ORG_UPDATE: 'organization.update',
  
  // Athlete Management
  ATHLETE_VIEW: 'athlete.view',
  ATHLETE_CREATE: 'athlete.create',
  ATHLETE_UPDATE: 'athlete.update',
  ATHLETE_DELETE: 'athlete.delete',
  
  // Coach Management
  COACH_VIEW: 'coach.view',
  COACH_ASSIGN: 'coach.assign',
  COACH_UPDATE: 'coach.update',
  
  // Training Operations
  TRAINING_VIEW: 'training.view',
  TRAINING_CREATE: 'training.create',
  TRAINING_UPDATE: 'training.update',
  TRAINING_DELETE: 'training.delete',
  
  // Event Management
  EVENT_VIEW: 'event.view',
  EVENT_REGISTER: 'event.register',
  EVENT_MANAGE: 'event.manage',
  TOURNAMENT_MANAGE: 'tournament.manage',
  MATCH_MANAGE: 'match.manage',

  // Performance & Analytics
  ANALYTICS_GLOBAL_VIEW: 'analytics.global.view',
  ANALYTICS_ORG_VIEW: 'analytics.org.view',
  PERFORMANCE_VIEW: 'performance.view',
  
  // Recruitment
  RECRUITMENT_VIEW: 'recruitment.view',
};

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.PLATFORM_MANAGE,
    PERMISSIONS.ORG_CREATE,
    PERMISSIONS.ORG_DELETE,
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.ORG_UPDATE,
    PERMISSIONS.ANALYTICS_GLOBAL_VIEW,
    PERMISSIONS.ATHLETE_VIEW,
    PERMISSIONS.ATHLETE_CREATE,
    PERMISSIONS.ATHLETE_UPDATE,
    PERMISSIONS.ATHLETE_DELETE,
    PERMISSIONS.COACH_VIEW,
    PERMISSIONS.COACH_ASSIGN,
    PERMISSIONS.COACH_UPDATE,
    PERMISSIONS.TRAINING_VIEW,
    PERMISSIONS.TRAINING_CREATE,
    PERMISSIONS.TRAINING_UPDATE,
    PERMISSIONS.TRAINING_DELETE,
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.EVENT_MANAGE,
    PERMISSIONS.TOURNAMENT_MANAGE,
    PERMISSIONS.MATCH_MANAGE,
    PERMISSIONS.PERFORMANCE_VIEW,
    PERMISSIONS.RECRUITMENT_VIEW,
  ],
  [ROLES.ORG_ADMIN]: [
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.ORG_UPDATE,
    PERMISSIONS.ATHLETE_VIEW,
    PERMISSIONS.ATHLETE_CREATE,
    PERMISSIONS.ATHLETE_UPDATE,
    PERMISSIONS.ATHLETE_DELETE,
    PERMISSIONS.COACH_VIEW,
    PERMISSIONS.COACH_ASSIGN,
    PERMISSIONS.COACH_UPDATE,
    PERMISSIONS.TRAINING_VIEW,
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.EVENT_MANAGE,
    PERMISSIONS.TOURNAMENT_MANAGE,
    PERMISSIONS.MATCH_MANAGE,
    PERMISSIONS.ANALYTICS_ORG_VIEW,
    PERMISSIONS.PERFORMANCE_VIEW,
    PERMISSIONS.RECRUITMENT_VIEW,
  ],
  [ROLES.COACH]: [
    PERMISSIONS.ATHLETE_VIEW,
    PERMISSIONS.TRAINING_VIEW,
    PERMISSIONS.TRAINING_CREATE,
    PERMISSIONS.TRAINING_UPDATE,
    PERMISSIONS.TRAINING_DELETE,
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.TOURNAMENT_MANAGE,
    PERMISSIONS.MATCH_MANAGE,
    PERMISSIONS.PERFORMANCE_VIEW,
  ],
  [ROLES.ATHLETE]: [
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.ATHLETE_VIEW,
    PERMISSIONS.TRAINING_VIEW,
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.EVENT_REGISTER,
    PERMISSIONS.PERFORMANCE_VIEW,
  ],
};

/**
 * Checks if a role has a specific permission.
 * @param {string} role The user's role.
 * @param {string} permission The required permission.
 * @returns {boolean} True if the role has the permission.
 */
export function hasPermission(role, permission) {
  if (!role || !ROLE_PERMISSIONS[role]) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Checks if a role has ANY of the specified permissions.
 * @param {string} role The user's role.
 * @param {string[]} permissions Array of permissions to check.
 * @returns {boolean} True if the role has at least one of the permissions.
 */
export function hasAnyPermission(role, permissions) {
  if (!role || !ROLE_PERMISSIONS[role]) return false;
  return permissions.some(p => ROLE_PERMISSIONS[role].includes(p));
}

/**
 * Checks if a role has ALL of the specified permissions.
 * @param {string} role The user's role.
 * @param {string[]} permissions Array of permissions to check.
 * @returns {boolean} True if the role has all of the permissions.
 */
export function hasAllPermissions(role, permissions) {
  if (!role || !ROLE_PERMISSIONS[role]) return false;
  return permissions.every(p => ROLE_PERMISSIONS[role].includes(p));
}
