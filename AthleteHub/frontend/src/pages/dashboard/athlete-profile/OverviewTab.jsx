import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const medicalColors = {
  Fit: 'bg-green-100 text-green-800 border-green-200',
  'Under Review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Restricted: 'bg-red-100 text-red-800 border-red-200',
  Recovering: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function OverviewTab({ athlete }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Personal Information */}
      <Card className="card-premium">
        <CardContent className="p-10">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-8">Personal Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div><p className="text-xs text-muted-foreground mb-1">Full Name</p><p className="font-semibold text-lg">{athlete.name}</p></div>
            <div><p className="text-xs text-muted-foreground mb-1">Sport</p><p className="font-semibold text-lg">{athlete.sport}</p></div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Organization</p>
              <p 
                className={`font-semibold text-lg ${athlete.organizationId ? 'cursor-pointer text-primary hover:underline' : ''}`}
                onClick={() => athlete.organizationId && navigate(`/dashboard/organizations/${athlete.organizationId}`)}
              >
                {athlete.organization}
              </p>
            </div>
            <div><p className="text-xs text-muted-foreground mb-1">Age</p><p className="font-semibold text-lg">{athlete.age} years</p></div>
            <div><p className="text-xs text-muted-foreground mb-1">Gender</p><p className="font-semibold text-lg">{athlete.gender}</p></div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Assigned Coach</p>
              <p className="font-semibold text-lg">{athlete.assignedCoachName}</p>
            </div>
            {athlete.height && <div><p className="text-xs text-muted-foreground mb-1">Height</p><p className="font-semibold text-lg">{athlete.height} cm</p></div>}
            {athlete.weight && <div><p className="text-xs text-muted-foreground mb-1">Weight</p><p className="font-semibold text-lg">{athlete.weight} kg</p></div>}
            {athlete.bloodGroup && <div><p className="text-xs text-muted-foreground mb-1">Blood Group</p><p className="font-semibold text-lg">{athlete.bloodGroup}</p></div>}
          </div>
        </CardContent>
      </Card>

      {/* Medical Status */}
      <Card className="card-premium">
        <CardContent className="p-10">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-8">Medical Status</h3>
          <div className="flex items-center gap-4 mb-8">
            <Badge variant="outline" className={medicalColors[athlete.medicalStatus] || 'bg-gray-100 text-gray-800'}>
              {athlete.medicalStatus}
            </Badge>
          </div>
          <Separator className="mb-8" />
          {athlete.injuries && athlete.injuries.length > 0 ? (
            <div className="space-y-4">
              <p className="font-semibold text-sm">Current Injuries / Notes</p>
              {athlete.injuries.map((injury, i) => (
                <div key={i} className="p-6 bg-red-50 border border-red-200 rounded-xl">
                  <p className="font-semibold text-red-900">{injury}</p>
                  <p className="text-sm text-red-700 mt-1">Under medical supervision</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-green-50 border border-green-200 rounded-xl text-center">
              <p className="font-semibold text-green-900 text-lg">No Current Injuries</p>
              <p className="text-sm text-green-700 mt-1">Athlete is medically fit for all activities</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
