import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PersonalInformationCard({ user }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Full Name</p>
            <p className="font-medium">{user?.name || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Date of Birth</p>
            <p className="font-medium">{user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Gender</p>
            <p className="font-medium">{user?.gender || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Role</p>
            <p className="font-medium capitalize">{user?.role?.replace('_', ' ') || 'User'}</p>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold mb-3">Emergency Contact</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Name</p>
              <p className="font-medium">{user?.emergencyContact?.name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Relationship</p>
              <p className="font-medium">{user?.emergencyContact?.relation || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Phone</p>
              <p className="font-medium">{user?.emergencyContact?.phone || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
