'use client';

import React from 'react';
import { useNavigation } from '@/lib/navigation-store';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Trophy,
  Activity,
  Users,
  GraduationCap,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const statusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-800 border-green-200',
  Injured: 'bg-red-100 text-red-800 border-red-200',
  Inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  Suspended: 'bg-orange-100 text-orange-800 border-orange-200',
};

const medicalColors: Record<string, string> = {
  Fit: 'bg-green-100 text-green-800 border-green-200',
  'Under Review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Restricted: 'bg-red-100 text-red-800 border-red-200',
  Recovering: 'bg-blue-100 text-blue-800 border-blue-200',
};

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-muted-foreground h-full">
      <Loader2 className="h-8 w-8 animate-spin mb-4" />
      <p>Loading details...</p>
    </div>
  );
}

function ErrorState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-destructive text-center h-full">
      <AlertCircle className="h-8 w-8 mb-4" />
      <p className="font-medium">Failed to load data</p>
      {message && <p className="text-sm mt-1 opacity-80">{message}</p>}
    </div>
  );
}

function ComingSoonState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-muted-foreground text-center h-full">
      <Activity className="h-12 w-12 mb-4 opacity-20" />
      <h3 className="text-lg font-semibold text-foreground mb-2">Details Coming Soon</h3>
      <p className="text-sm">Detailed information for this item is not yet available. This feature will be enabled in a future AthleteHub update.</p>
    </div>
  );
}

function AthletePanel({ athleteId }: { athleteId: string }) {
  const navigate = useNavigate();
  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ['athlete', athleteId],
    queryFn: async () => {
      const res = await api.get(`/athletes/${athleteId}`);
      return res.data;
    }
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={(error as any)?.message} />;
  
  const athlete = response?.data;
  if (!athlete) return <ErrorState message="Athlete not found" />;

  const fullName = athlete.fullName || `${athlete.firstName || ''} ${athlete.lastName || ''}`.trim() || 'Unknown';
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2);

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{fullName}</h3>
          <p className="text-sm text-muted-foreground truncate">{athlete.sport?.name || athlete.sportName || 'N/A'} — {athlete.organizationName || 'N/A'}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className={statusColors[athlete.status] || ''}>{athlete.status || 'Unknown'}</Badge>
            {athlete.medicalStatus && (
              <Badge variant="outline" className={medicalColors[athlete.medicalStatus] || ''}>{athlete.medicalStatus}</Badge>
            )}
          </div>
        </div>
      </div>
      <Separator />
      <div className="space-y-4">
        {athlete.email && <div className="flex items-center gap-3 text-sm"><Mail className="h-4 w-4 text-muted-foreground shrink-0" /> <span className="truncate">{athlete.email}</span></div>}
        {athlete.phone && <div className="flex items-center gap-3 text-sm"><Phone className="h-4 w-4 text-muted-foreground shrink-0" /> {athlete.phone}</div>}
        <div className="flex items-center gap-3 text-sm"><Calendar className="h-4 w-4 text-muted-foreground shrink-0" /> {athlete.age ? `${athlete.age} yrs, ` : ''}{athlete.gender || 'N/A'}</div>
      </div>
      <Separator />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Performance Rating</p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold">{athlete.performanceRating || 0}</span>
          <span className="text-sm text-muted-foreground">/100</span>
        </div>
        <Progress value={athlete.performanceRating || 0} className="h-2" />
      </div>
      <Separator />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Achievements</p>
        {athlete.achievements && athlete.achievements.length > 0 ? (
          <div className="space-y-2">
            {athlete.achievements.map((a: string, i: number) => (
              <div key={i} className="flex items-center gap-2 text-sm"><Trophy className="h-4 w-4 text-amber-500 shrink-0" /><span>{a}</span></div>
            ))}
          </div>
        ) : <p className="text-sm text-muted-foreground">No achievements recorded</p>}
      </div>
      <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/athletes/' + athlete.id)}>View Full Profile</Button>
    </div>
  );
}

function CoachPanel({ coachId }: { coachId: string }) {
  const navigate = useNavigate();
  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ['coach', coachId],
    queryFn: async () => {
      const res = await api.get(`/coaches/${coachId}`);
      return res.data;
    }
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={(error as any)?.message} />;
  
  const coach = response?.data;
  if (!coach) return <ErrorState message="Coach not found" />;

  const fullName = coach.fullName || `${coach.firstName || ''} ${coach.lastName || ''}`.trim() || 'Unknown';
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2);

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{fullName}</h3>
          <p className="text-sm text-muted-foreground truncate">{coach.sportName || coach.sport?.name || 'N/A'} — {coach.organizationName || 'N/A'}</p>
          <Badge variant="outline" className={coach.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>
            {coach.status || 'Unknown'}
          </Badge>
        </div>
      </div>
      <Separator />
      <div className="space-y-4 text-sm">
        {coach.experienceYears !== undefined && <div className="flex items-center gap-3"><GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" /> {coach.experienceYears} years experience</div>}
        {coach.email && <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground shrink-0" /> <span className="truncate">{coach.email}</span></div>}
        {coach.phone && <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground shrink-0" /> {coach.phone}</div>}
      </div>
      <Separator />
      <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/coaches/' + coach.id)}>View Full Profile</Button>
    </div>
  );
}

function OrgPanel({ orgId }: { orgId: string }) {
  const navigate = useNavigate();
  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ['org', orgId],
    queryFn: async () => {
      const res = await api.get(`/organizations/${orgId}`);
      return res.data;
    }
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={(error as any)?.message} />;
  
  const org = response?.data;
  if (!org) return <ErrorState message="Organization not found" />;

  const initials = (org.name || 'Unknown').split(' ').map((n: string) => n[0]).join('').substring(0, 2);

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{org.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{org.sportName || 'N/A'} — {org.type || 'N/A'}</p>
        </div>
      </div>
      <Separator />
      <div className="space-y-4 text-sm">
        {org.location && <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-muted-foreground shrink-0" /> {org.location}</div>}
      </div>
      <Separator />
      {org.description && <p className="text-sm text-muted-foreground leading-relaxed">{org.description}</p>}
      <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/organizations/' + org.id)}>View Full Details</Button>
    </div>
  );
}

function MatchPanel({ matchId }: { matchId: string }) {
  const navigate = useNavigate();
  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ['match', matchId],
    queryFn: async () => {
      const res = await api.get(`/matches/${matchId}`);
      return res.data;
    }
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={(error as any)?.message} />;
  
  const match = response?.data;
  if (!match) return <ErrorState message="Match not found" />;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Badge variant="outline" className={match.status === 'LIVE' ? 'bg-red-100 text-red-800 border-red-200' : match.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-blue-100 text-blue-800 border-blue-200'}>
          {match.status === 'LIVE' && <Activity className="h-3 w-3 mr-1 animate-pulse" />}
          {match.status}
        </Badge>
      </div>
      <div className="text-center space-y-2">
        <p className="font-semibold text-lg">{match.homeTeamName || 'TBD'}</p>
        <p className="text-3xl font-bold">{match.homeScore ?? '-'} : {match.awayScore ?? '-'}</p>
        <p className="font-semibold text-lg">{match.awayTeamName || 'TBD'}</p>
      </div>
      <Separator />
      <div className="space-y-4 text-sm">
        {match.tournamentName && <div className="flex items-center gap-3"><Trophy className="h-4 w-4 text-muted-foreground shrink-0" /> {match.tournamentName}</div>}
        {match.venue && <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-muted-foreground shrink-0" /> {match.venue}</div>}
        {match.scheduledTime && <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-muted-foreground shrink-0" /> {new Date(match.scheduledTime).toLocaleString()}</div>}
      </div>
      <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/matches/' + match.id)}>View Full Details</Button>
    </div>
  );
}

function TrainingPanel({ sessionId }: { sessionId: string }) {
  const navigate = useNavigate();
  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ['trainingSession', sessionId],
    queryFn: async () => {
      const res = await api.get(`/training-sessions/${sessionId}`);
      return res.data;
    }
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState message={(error as any)?.message} />;
  
  const session = response?.data;
  if (!session) return <ErrorState message="Session not found" />;

  return (
    <div className="space-y-8">
      <h3 className="font-semibold text-lg">{session.title}</h3>
      <Badge variant="outline">{session.status || 'SCHEDULED'}</Badge>
      <Separator />
      <div className="space-y-4 text-sm">
        {session.sessionDate && <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-muted-foreground shrink-0" /> {session.sessionDate}</div>}
        {session.location && <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-muted-foreground shrink-0" /> {session.location}</div>}
        {session.coachName && <div className="flex items-center gap-3"><GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" /> Coach: {session.coachName}</div>}
      </div>
      <Separator />
      <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/training-sessions/' + session.id)}>View Full Details</Button>
    </div>
  );
}

export function ContextPanel() {
  const { contextPanelOpen, contextPanelType, contextPanelId, closeContextPanel } = useNavigation();

  if (!contextPanelOpen || !contextPanelType || !contextPanelId) return null;

  return (
    <div className="fixed top-14 right-0 bottom-[28px] w-[340px] z-50 bg-background border-l border-border/40 shadow-xl transition-transform duration-300 transform translate-x-0">
      <div className="flex items-center justify-between px-5 h-12 border-b">
        <span className="font-semibold text-sm">
          {contextPanelType === 'athlete' ? 'Athlete Details' :
           contextPanelType === 'coach' ? 'Coach Details' :
           contextPanelType === 'org' ? 'Organization Details' :
           contextPanelType === 'match' ? 'Match Details' :
           contextPanelType === 'training' ? 'Training Session' : 'Quick View'}
        </span>
        <button onClick={closeContextPanel} className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-5 overflow-y-auto custom-scrollbar h-[calc(100vh-14px-12px-28px-48px)]">
        {contextPanelType === 'athlete' && <AthletePanel athleteId={contextPanelId} />}
        {contextPanelType === 'coach' && <CoachPanel coachId={contextPanelId} />}
        {contextPanelType === 'org' && <OrgPanel orgId={contextPanelId} />}
        {contextPanelType === 'match' && <MatchPanel matchId={contextPanelId} />}
        {contextPanelType === 'training' && <TrainingPanel sessionId={contextPanelId} />}
      </div>
    </div>
  );
}
