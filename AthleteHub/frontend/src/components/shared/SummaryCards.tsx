import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function AthleteCard({ athlete }) {
  const navigate = useNavigate();
  if (!athlete) return null;

  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-colors shadow-sm"
      onClick={() => navigate(`/dashboard/athletes/${athlete.id}`)}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <Avatar className="h-12 w-12 border">
          <AvatarImage src={athlete.profilePhotoUrl} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold">
            {athlete.firstName?.charAt(0)}{athlete.lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{athlete.fullName || `${athlete.firstName} ${athlete.lastName}`}</h4>
          <p className="text-xs text-muted-foreground truncate">{athlete.athleteCode}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge variant="secondary" className="text-[10px]">{athlete.sport?.name || athlete.sport || 'Unknown'}</Badge>
          <span className="text-[10px] text-muted-foreground">{athlete.status}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function CoachCard({ coach }) {
  const navigate = useNavigate();
  if (!coach) return null;

  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-colors shadow-sm"
      onClick={() => navigate(`/dashboard/coaches/${coach.id}`)}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <Avatar className="h-12 w-12 border">
          <AvatarFallback className="bg-blue-500/10 text-blue-700 font-bold">
            {coach.firstName?.charAt(0)}{coach.lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{coach.fullName || `${coach.firstName} ${coach.lastName}`}</h4>
          <p className="text-xs text-muted-foreground truncate">Coach</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge variant="outline" className="text-[10px]">{coach.specialization || 'General'}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function OrganizationCard({ organization }) {
  const navigate = useNavigate();
  if (!organization) return null;

  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-colors shadow-sm"
      onClick={() => navigate(`/dashboard/organizations/${organization.id}`)}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center border shrink-0">
          <span className="font-bold text-lg text-muted-foreground">
            {organization.name?.substring(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{organization.name}</h4>
          <p className="text-xs text-muted-foreground truncate">{organization.contactEmail || organization.city || 'Organization'}</p>
        </div>
      </CardContent>
    </Card>
  );
}
