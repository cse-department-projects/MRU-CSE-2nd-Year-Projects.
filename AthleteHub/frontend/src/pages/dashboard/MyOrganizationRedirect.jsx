import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PendingOrgActivation from '@/components/dashboard/PendingOrgActivation';

export default function MyOrganizationRedirect() {
  const { currentUser } = useAuth();
  const orgId = currentUser?.organizationId || currentUser?.organization_id;

  if (!orgId) {
    return <PendingOrgActivation />;
  }

  return <Navigate to={`/dashboard/organizations/${orgId}`} replace />;
}
