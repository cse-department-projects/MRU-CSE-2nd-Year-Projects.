import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function RoleSpecificSection({ user, role }) {
  if (!role) return null;

  if (role === 'athlete') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sports Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><p className="text-sm text-muted-foreground mb-1">Sport</p><p className="font-medium">{user?.sportsInfo?.sport || 'N/A'}</p></div>
            <div><p className="text-sm text-muted-foreground mb-1">Position</p><p className="font-medium">{user?.sportsInfo?.position || 'N/A'}</p></div>
            <div><p className="text-sm text-muted-foreground mb-1">Height / Weight</p><p className="font-medium">{user?.sportsInfo?.height || '-'} / {user?.sportsInfo?.weight || '-'}</p></div>
            <div><p className="text-sm text-muted-foreground mb-1">Dominant Hand</p><p className="font-medium">{user?.sportsInfo?.dominantHand || 'N/A'}</p></div>
            <div><p className="text-sm text-muted-foreground mb-1">Coach</p><p className="font-medium">{user?.sportsInfo?.coach || 'N/A'}</p></div>
            <div><p className="text-sm text-muted-foreground mb-1">Organization</p><p className="font-medium">{user?.sportsInfo?.organization || 'N/A'}</p></div>
          </div>
          {user?.achievements?.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-3">Recent Achievements</h4>
              <ul className="list-disc pl-5 space-y-1">
                {user.achievements.map((ach, i) => <li key={i} className="text-sm">{ach}</li>)}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (role === 'coach') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Professional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><p className="text-sm text-muted-foreground mb-1">Assigned Athletes</p><p className="font-medium text-2xl">{user?.coachingInfo?.assignedAthletes || 0}</p></div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Certifications</p>
              <ul className="list-disc pl-5 space-y-1 mt-1">
                {user?.coachingInfo?.certifications?.map((cert, i) => <li key={i} className="text-sm font-medium">{cert}</li>) || <li className="text-sm text-muted-foreground">No certifications listed</li>}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (role === 'org_admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Organization Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><p className="text-sm text-muted-foreground mb-1">Organization Type</p><p className="font-medium">{user?.orgInfo?.type || 'N/A'}</p></div>
            <div><p className="text-sm text-muted-foreground mb-1">Total Athletes</p><p className="font-medium">{user?.orgInfo?.managementStatistics?.totalAthletes || 0}</p></div>
            <div><p className="text-sm text-muted-foreground mb-1">Total Coaches</p><p className="font-medium">{user?.orgInfo?.managementStatistics?.totalCoaches || 0}</p></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (role === 'super_admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Platform Administration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">Global Permissions</p>
          <div className="flex flex-wrap gap-2">
            {user?.platformInfo?.globalPermissions?.map((perm, i) => (
              <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md font-medium">{perm}</span>
            )) || <span className="text-sm text-muted-foreground">Standard access</span>}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
