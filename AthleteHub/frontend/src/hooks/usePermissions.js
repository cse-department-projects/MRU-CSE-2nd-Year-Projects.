import { useAuth } from '../contexts/AuthContext';
import { hasPermission, hasAnyPermission, hasAllPermissions, ROLES, PERMISSIONS } from '../lib/permissions';

export function usePermissions() {
  const { currentRole } = useAuth();

  // Normalize the role to a plain string (handles objects and ROLE_ prefixes)
  let normalizedRole = null;
  if (currentRole) {
    if (typeof currentRole === 'string') {
      normalizedRole = currentRole.replace(/^ROLE_/, '');
    } else if (typeof currentRole === 'object') {
      if (currentRole.name) {
        normalizedRole = currentRole.name.replace(/^ROLE_/, '');
      } else if (currentRole.role) {
        normalizedRole = currentRole.role.replace(/^ROLE_/, '');
      }
    }
  }

  if (normalizedRole === 'ORGANIZATION_ADMIN') {
    normalizedRole = 'ORG_ADMIN';
  }

  const can = (permission) => hasPermission(normalizedRole, permission);
  const canAny = (permissions) => hasAnyPermission(normalizedRole, permissions);
  const canAll = (permissions) => hasAllPermissions(normalizedRole, permissions);
  const isRole = (role) => normalizedRole === role;

  return {
    can,
    canAny,
    canAll,
    isRole,
    currentRole: normalizedRole,
    ROLES,
    PERMISSIONS
  };
}
