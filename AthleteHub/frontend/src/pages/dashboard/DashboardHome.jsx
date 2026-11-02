import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import AthleteDashboard from './roles/AthleteDashboard';
import CoachDashboard from './roles/CoachDashboard';
import OrgAdminDashboard from './roles/OrgAdminDashboard';
import SuperAdminDashboard from './roles/SuperAdminDashboard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function DashboardHome() {
  const { currentUser, isLoading } = useAuth();
  const { isRole, ROLES } = usePermissions();

  if (isLoading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div className="page-enter animate-fade-in pb-10 w-full max-w-7xl mx-auto">
      {isRole(ROLES.ATHLETE) && <AthleteDashboard user={currentUser} />}
      {isRole(ROLES.COACH) && <CoachDashboard user={currentUser} />}
      {isRole(ROLES.ORG_ADMIN) && <OrgAdminDashboard user={currentUser} />}
      {isRole(ROLES.SUPER_ADMIN) && <SuperAdminDashboard user={currentUser} />}
      
      {!isRole(ROLES.ATHLETE) && !isRole(ROLES.COACH) && !isRole(ROLES.ORG_ADMIN) && !isRole(ROLES.SUPER_ADMIN) && (
        <div className="bg-destructive/10 text-destructive p-6 rounded-xl flex items-center gap-4 border border-destructive/20">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-bold">Unknown Role</h3>
            <p className="text-sm mt-1">Your user role is not recognized. Please contact support.</p>
          </div>
        </div>
      )}
    </div>
  );
}
