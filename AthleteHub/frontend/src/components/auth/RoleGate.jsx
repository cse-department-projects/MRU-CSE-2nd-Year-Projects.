import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

/**
 * A wrapper component that conditionally renders its children based on permissions.
 * @param {Object} props
 * @param {string} [props.permission] A single permission required to render children.
 * @param {string[]} [props.anyPermission] An array of permissions, requires at least one to render.
 * @param {string[]} [props.allPermissions] An array of permissions, requires all to render.
 * @param {React.ReactNode} [props.fallback=null] Content to render if permission is denied.
 * @param {React.ReactNode} props.children Content to render if permission is granted.
 */
export default function RoleGate({
  permission,
  anyPermission,
  allPermissions,
  fallback = null,
  children
}) {
  const { can, canAny, canAll } = usePermissions();

  let isAllowed = true;

  if (permission && !can(permission)) {
    isAllowed = false;
  }

  if (anyPermission && !canAny(anyPermission)) {
    isAllowed = false;
  }

  if (allPermissions && !canAll(allPermissions)) {
    isAllowed = false;
  }

  return isAllowed ? <>{children}</> : <>{fallback}</>;
}
