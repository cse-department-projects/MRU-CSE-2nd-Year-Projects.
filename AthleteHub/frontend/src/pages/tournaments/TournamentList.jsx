import React from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tournamentApi } from '../../api/tournamentApi';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Trophy, CalendarDays, MapPin, Activity, Plus, Flag, ShieldCheck } from 'lucide-react';
import { CardSkeleton } from '../../components/ui/skeleton-loaders';
import EmptyState from '../../components/ui/EmptyState';

const tournamentStatusColors = {
  'Registration Open': 'bg-blue-100 text-blue-800 border-blue-200',
  Active: 'bg-green-100 text-green-800 border-green-200',
  Completed: 'bg-gray-100 text-gray-800 border-gray-200',
  UPCOMING: 'bg-blue-100 text-blue-800 border-blue-200',
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
};

const TournamentList = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAthlete = currentUser?.role === 'ROLE_ATHLETE';
  const eventId = searchParams.get('eventId');

  const { data, isLoading, error } = useQuery({
    queryKey: ['tournaments', eventId],
    queryFn: async () => {
      const params = eventId ? { eventId } : {};
      const response = await tournamentApi.getTournaments(params);
      return response.data?.data?.items || response.data?.items || [];
    }
  });

  if (error) return <div className="p-10 text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-6 md:p-10 space-y-8 page-enter max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-up stagger-1">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Tournaments Hub</h1>
            {data && data.length > 0 && (
              <Badge variant="secondary" className="font-mono-telemetry font-bold px-2.5 py-0.5 text-xs">
                {data.length} Active Brackets
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {isAthlete 
              ? "Follow championship brackets, match fixtures, and your organization's roster progress." 
              : "Manage competitive brackets, match seeding, and tournament leaderboards."}
          </p>
        </div>
        {!isAthlete && (
          <Link to="/dashboard/tournaments/new">
            <Button className="rounded-xl px-5 h-10 shadow-sm gap-2">
              <Plus className="h-4 w-4" /> Create Tournament
            </Button>
          </Link>
        )}
      </div>

      {isAthlete && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20 text-xs sm:text-sm text-muted-foreground animate-fade-in shadow-xs">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
          <span>
            <strong className="text-foreground">Official Roster Note:</strong> Athletes track schedules, fixture brackets, and match results here. Official tournament applications and squad nominations are coordinated directly by your Coach and Organization Administrators.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <CardSkeleton className="h-64 rounded-2xl" />
            <CardSkeleton className="h-64 rounded-2xl" />
            <CardSkeleton className="h-64 rounded-2xl" />
          </>
        ) : data.length === 0 ? (
          <div className="col-span-full">
            <EmptyState 
              icon={Flag}
              title="No tournaments scheduled" 
              description={isAthlete ? "There are currently no active tournament brackets for your organization." : "Get started by creating a new tournament bracket."}
              actionLabel={!isAthlete ? "Create Tournament" : undefined}
              onAction={!isAthlete ? () => navigate('/dashboard/tournaments/new') : undefined}
            />
          </div>
        ) : (
          data.map((tournament) => (
            <Card key={tournament.id} className="card-telemetry-elevated overflow-hidden group flex flex-col justify-between">
              <CardContent className="p-0 flex-1 flex flex-col justify-between">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className={`text-xs px-2.5 py-0.5 font-semibold ${tournamentStatusColors[tournament.status] || 'bg-muted text-muted-foreground'}`}>
                      {tournament.status}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors" title={tournament.name}>
                      {tournament.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium flex items-center gap-1.5 truncate">
                      <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" />
                      {tournament.eventName ? `Event: ${tournament.eventName}` : (tournament.sportName || 'Tournament')}
                    </p>
                  </div>

                  <div className="space-y-2 mt-3 pt-3 border-t border-border/40 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-blue-500 shrink-0" />
                      <span className="font-medium text-foreground">{tournament.startDate} — {tournament.endDate || 'TBA'}</span>
                    </div>
                    {tournament.sportName && (
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
                        <span className="font-semibold text-foreground">{tournament.sportName}</span>
                        {tournament.genderCategory && (
                          <span className="capitalize text-muted-foreground">({tournament.genderCategory.toLowerCase()})</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0">
                   <Link to={`/dashboard/tournaments/${tournament.id}`} className="w-full block">
                      <Button variant="outline" size="sm" className="w-full rounded-xl h-9 text-xs font-semibold shadow-xs hover:bg-primary hover:text-primary-foreground transition-all">
                         Manage Bracket & Seeding →
                      </Button>
                   </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TournamentList;
