import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { matchApi } from '../../api/matchApi';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import {
  Activity,
  Trophy,
  MapPin,
  CalendarDays,
  ArrowRight,
  Eye,
  Loader2
} from 'lucide-react';

const statusColors = {
  LIVE: 'bg-red-100 text-red-800 border-red-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
  SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-200',
};

const MatchTimelineView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tournamentId = searchParams.get('tournamentId');

  const getTeamNames = (match) => {
    if (match.remarks && match.remarks.includes(' vs ')) {
      const parts = match.remarks.split(':').pop().split(' vs ');
      if (parts.length === 2) {
        return {
          teamOne: parts[0].trim(),
          teamTwo: parts[1].trim()
        };
      }
    }
    return {
      teamOne: match.participantOneName || match.homeTeamName || 'Team Alpha',
      teamTwo: match.participantTwoName || match.awayTeamName || 'Team Beta'
    };
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['matches', { tournamentId }],
    queryFn: async () => {
      const params = tournamentId ? { tournamentId } : {};
      const response = await matchApi.getMatches(params);
      return response.data?.data?.items || response.data?.items || [];
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-red-500">
        Error loading matches.
      </div>
    );
  }

  const matches = data || [];
  
  const liveMatches = matches.filter((m) => m.status === 'LIVE' || m.status === 'Live');
  const completedMatches = matches.filter((m) => m.status === 'COMPLETED' || m.status === 'Completed');
  const scheduledMatches = matches.filter((m) => m.status === 'SCHEDULED' || m.status === 'Scheduled' || !['LIVE', 'COMPLETED', 'Live', 'Completed'].includes(m.status));

  return (
    <div className="p-6 space-y-10 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Live Match Center {tournamentId && `(Tournament ID: ${tournamentId})`}</h1>
          <p className="text-muted-foreground">Track currently active matches with live scoreboards.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="rounded-xl h-10 px-4 self-start sm:self-auto font-medium"
        >
          &larr; Back to Tournament
        </Button>
      </div>

      {/* Live Matches */}
      <div className="space-y-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Activity className="h-4 w-4 inline mr-1 text-red-600 animate-pulse" />
          Live Now ({liveMatches.length})
        </p>
        {liveMatches.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {liveMatches.map((match) => (
              <Card
                key={match.id}
                className="card-premium rounded-xl border-red-200 bg-red-50/50 cursor-pointer hover:border-red-400 transition-colors"
                onClick={() => navigate(`/dashboard/matches/${match.id}`)}
              >
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                      <Activity className="h-3.5 w-3.5 mr-1 animate-pulse" />
                      LIVE
                    </Badge>
                    <Badge variant="secondary" className="text-sm">{match.sportName || 'N/A'}</Badge>
                  </div>
                  <div className="text-center space-y-6">
                    <div className="grid grid-cols-3 items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold text-lg">{match.participantOneName || 'TBD'}</p>
                      </div>
                      <div className="flex items-center justify-center gap-4">
                        <span className="text-4xl font-bold font-mono-telemetry">{match.participantOneScore ?? match.homeScore ?? (match.status === 'LIVE' ? '0' : '-')}</span>
                        <span className="text-muted-foreground text-xl">—</span>
                        <span className="text-4xl font-bold font-mono-telemetry">{match.participantTwoScore ?? match.awayScore ?? (match.status === 'LIVE' ? '0' : '-')}</span>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-lg">{match.participantTwoName || 'TBD'}</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p className="font-medium">{match.tournamentName || 'N/A'}</p>
                      <div className="flex items-center justify-center gap-6">
                        <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {match.venue || 'TBA'}</span>
                        <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {match.matchDate ? `${match.matchDate} ${match.startTime || ''}` : 'TBA'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="ghost" className="h-11 rounded-xl px-6 gap-1">
                      View Details <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="card-premium rounded-xl">
            <CardContent className="p-10 text-center text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">No live matches at the moment</p>
              <p className="text-sm">Check back later or view completed matches below</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      {/* Completed Matches */}
      <div className="space-y-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Trophy className="h-4 w-4 inline mr-1 text-green-600" />
          Completed ({completedMatches.length})
        </p>
        <div className="grid gap-4">
          {completedMatches.map((match) => {
            const { teamOne, teamTwo } = getTeamNames(match);
            return (
              <Card
                key={match.id}
                className="card-premium rounded-xl cursor-pointer hover:border-gray-300 transition-colors"
                onClick={() => navigate(`/dashboard/matches/${match.id}`)}
              >
                <CardContent className="p-8 flex items-center gap-6">
                  <Badge variant="outline" className={`text-sm ${statusColors['COMPLETED']}`}>COMPLETED</Badge>
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-lg">{teamOne}</span>
                      <span className="text-xl font-extrabold text-muted-foreground">VS</span>
                      <span className="font-bold text-lg">{teamTwo}</span>
                      {match.round && (
                        <Badge variant="secondary" className="text-xs font-semibold">{match.round}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{match.sportName || 'Basketball'} — {match.venue || 'TBA'} — {match.matchDate ? `${match.matchDate}` : 'TBA'}</p>
                  </div>
                  <Button variant="outline" className="h-11 rounded-xl px-6 gap-2" onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/matches/${match.id}`); }}>
                    <Eye className="h-4 w-4" /> View
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          {completedMatches.length === 0 && (
            <p className="text-muted-foreground text-sm italic">No completed matches found.</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Scheduled Matches */}
      <div className="space-y-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <CalendarDays className="h-4 w-4 inline mr-1 text-blue-600" />
          Scheduled ({scheduledMatches.length})
        </p>
        <div className="grid gap-4">
          {scheduledMatches.map((match) => {
            const { teamOne, teamTwo } = getTeamNames(match);
            return (
              <Card
                key={match.id}
                className="card-premium rounded-xl cursor-pointer hover:border-gray-300 transition-colors"
                onClick={() => navigate(`/dashboard/matches/${match.id}`)}
              >
                <CardContent className="p-8 flex items-center gap-6">
                  <Badge variant="outline" className={`text-sm ${statusColors['SCHEDULED']}`}>{match.status || 'SCHEDULED'}</Badge>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-lg">{teamOne} vs {teamTwo}</p>
                      {match.round && (
                        <Badge variant="secondary" className="text-xs font-semibold">{match.round}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{match.sportName || 'Basketball'} — {match.venue || 'TBA'} — {match.matchDate ? `${match.matchDate} ${match.startTime || ''}` : 'TBA'}</p>
                  </div>
                  <Button variant="outline" className="h-11 rounded-xl px-6 gap-2" onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/matches/${match.id}`); }}>
                    <Eye className="h-4 w-4" /> View
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          {scheduledMatches.length === 0 && (
             <p className="text-muted-foreground text-sm italic">No scheduled matches found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchTimelineView;
