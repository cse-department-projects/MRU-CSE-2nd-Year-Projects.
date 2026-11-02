import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export function RequireRole({ allowedRoles, children, fallback = null }) {
  const { currentRole } = useAuth();
  
  const role = currentRole || 'UNKNOWN';

  if (!allowedRoles.includes(role)) {
    if (fallback !== null) {
        return fallback;
    }
    return null;
  }

  return <>{children}</>;
}

export function RequireAuthRoute({ allowedRoles, children }) {
    const { currentRole, currentUser } = useAuth();
    
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    const role = currentRole || 'UNKNOWN';
    if (!allowedRoles.includes(role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
