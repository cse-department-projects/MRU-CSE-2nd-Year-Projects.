import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchApi } from '../../api/matchApi';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  ArrowLeft,
  Trophy,
  MapPin,
  CalendarDays,
  Activity,
  Clock,
  Loader2,
  Edit,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  Play,
  Plus,
  Minus
} from 'lucide-react';
import { toast } from 'sonner';

const statusColors = {
  LIVE: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300',
  SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
};

const eventIconColors = {
  Score: 'bg-green-100 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-300',
  Default: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300'
};

export default function MatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  const isAdminOrCoach = ['ROLE_ORG_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_COACH', 'ROLE_ORGANIZATION_ADMIN'].includes(currentUser?.role);

  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [scoreForm, setScoreForm] = useState({
    participantOneScore: '',
    participantTwoScore: '',
    status: 'COMPLETED',
    winnerId: '',
    venue: '',
    matchDate: '',
    startTime: ''
  });

  const [resultForm, setResultForm] = useState({
    athleteId: '',
    score: '',
    rank: '',
    medal: '',
    remarks: ''
  });

  const { data: matchData, isLoading: matchLoading, error: matchError, refetch: refetchMatch } = useQuery({
    queryKey: ['match', id],
    queryFn: async () => {
      const response = await matchApi.getMatchById(id);
      const data = response.data?.data || response.data;
      if (data) {
        setScoreForm({
          participantOneScore: data.participantOneScore ?? data.homeScore ?? '',
          participantTwoScore: data.participantTwoScore ?? data.awayScore ?? '',
          status: data.status || 'COMPLETED',
          winnerId: data.winnerId || '',
          venue: data.venue || '',
          matchDate: data.matchDate ? data.matchDate.split('T')[0] : '',
          startTime: data.startTime ? data.startTime.substring(0, 5) : ''
        });
      }
      return data;
    },
    enabled: !!id
  });

  const { data: resultsData, isLoading: resultsLoading, refetch: refetchResults } = useQuery({
    queryKey: ['matchResults', id],
    queryFn: async () => {
      const response = await matchApi.getMatchResults(id);
      return response.data?.data || response.data || [];
    },
    enabled: !!id
  });

  const handleOpenScoreModal = () => {
    const r1 = (resultsData || []).find(r => r.athleteId === matchData?.participantOneId);
    const r2 = (resultsData || []).find(r => r.athleteId === matchData?.participantTwoId);
    setScoreForm({
      participantOneScore: r1?.score ?? matchData?.participantOneScore ?? '',
      participantTwoScore: r2?.score ?? matchData?.participantTwoScore ?? '',
      status: matchData?.status || 'COMPLETED',
      winnerId: matchData?.winnerId || '',
      venue: matchData?.venue || '',
      matchDate: matchData?.matchDate ? matchData.matchDate.split('T')[0] : '',
      startTime: matchData?.startTime ? matchData.startTime.substring(0, 5) : ''
    });
    setShowScoreModal(true);
  };

  const handleQuickStartMatch = async () => {
    try {
      await matchApi.updateMatch(id, {
        status: 'LIVE'
      });
      const r1 = (resultsData || []).find(r => r.athleteId === matchData?.participantOneId);
      const r2 = (resultsData || []).find(r => r.athleteId === matchData?.participantTwoId);
      if (matchData?.participantOneId && !r1) {
        try { await matchApi.addMatchResult(id, { athleteId: matchData.participantOneId, score: '0' }); } catch (e) {}
      }
      if (matchData?.participantTwoId && !r2) {
        try { await matchApi.addMatchResult(id, { athleteId: matchData.participantTwoId, score: '0' }); } catch (e) {}
      }
      toast.success("Match started! Status is now LIVE.");
      refetchMatch();
      refetchResults();
      queryClient.invalidateQueries({ queryKey: ['match', id] });
      queryClient.invalidateQueries({ queryKey: ['matchResults', id] });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to start match");
    }
  };

  const handleQuickScoreChange = async (participantIndex, delta) => {
    try {
      const r1 = (resultsData || []).find(r => r.athleteId === matchData?.participantOneId);
      const r2 = (resultsData || []).find(r => r.athleteId === matchData?.participantTwoId);
      const currentScore1 = parseFloat(r1?.score || '0');
      const currentScore2 = parseFloat(r2?.score || '0');
      const newScore1 = participantIndex === 1 ? Math.max(0, currentScore1 + delta) : currentScore1;
      const newScore2 = participantIndex === 2 ? Math.max(0, currentScore2 + delta) : currentScore2;

      if (participantIndex === 1 && matchData?.participantOneId) {
        if (r1) {
          await matchApi.updateMatchResult(r1.id, { score: String(newScore1) });
        } else {
          await matchApi.addMatchResult(id, { athleteId: matchData.participantOneId, score: String(newScore1) });
        }
      }

      if (participantIndex === 2 && matchData?.participantTwoId) {
        if (r2) {
          await matchApi.updateMatchResult(r2.id, { score: String(newScore2) });
        } else {
          await matchApi.addMatchResult(id, { athleteId: matchData.participantTwoId, score: String(newScore2) });
        }
      }

      toast.success(`Score updated: ${newScore1} — ${newScore2}`);
      refetchResults();
      queryClient.invalidateQueries({ queryKey: ['matchResults', id] });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to update score");
    }
  };

  const handleQuickDeclareWinner = async (winnerId, winnerName) => {
    if (!winnerId) {
      toast.error("Participant ID not found.");
      return;
    }
    if (!window.confirm(`Are you sure you want to declare ${winnerName} as the WINNER and complete this match?`)) {
      return;
    }
    try {
      await matchApi.updateMatch(id, {
        status: 'COMPLETED',
        winnerId: winnerId
      });

      const r1 = (resultsData || []).find(r => r.athleteId === matchData?.participantOneId);
      const r2 = (resultsData || []).find(r => r.athleteId === matchData?.participantTwoId);

      if (r1) {
        await matchApi.updateMatchResult(r1.id, {
          rank: matchData.participantOneId === winnerId ? 1 : 2
        });
      } else if (matchData?.participantOneId) {
        await matchApi.addMatchResult(id, {
          athleteId: matchData.participantOneId,
          score: '0',
          rank: matchData.participantOneId === winnerId ? 1 : 2
        });
      }

      if (r2) {
        await matchApi.updateMatchResult(r2.id, {
          rank: matchData.participantTwoId === winnerId ? 1 : 2
        });
      } else if (matchData?.participantTwoId) {
        await matchApi.addMatchResult(id, {
          athleteId: matchData.participantTwoId,
          score: '0',
          rank: matchData.participantTwoId === winnerId ? 1 : 2
        });
      }

      toast.success(`🏆 ${winnerName} declared as Winner! Match completed & bracket advanced.`);
      refetchMatch();
      refetchResults();
      queryClient.invalidateQueries({ queryKey: ['match', id] });
      queryClient.invalidateQueries({ queryKey: ['matchResults', id] });
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to declare winner");
    }
  };

  const handleUpdateScore = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        status: scoreForm.status,
        winnerId: scoreForm.winnerId ? parseInt(scoreForm.winnerId, 10) : null,
        venue: scoreForm.venue,
        matchDate: scoreForm.matchDate,
        startTime: scoreForm.startTime ? (scoreForm.startTime.length === 5 ? `${scoreForm.startTime}:00` : scoreForm.startTime) : null
      };

      await matchApi.updateMatch(id, payload);

      const r1 = (resultsData || []).find(r => r.athleteId === matchData?.participantOneId);
      const r2 = (resultsData || []).find(r => r.athleteId === matchData?.participantTwoId);
      const winnerIdInt = scoreForm.winnerId ? parseInt(scoreForm.winnerId, 10) : null;

      if (scoreForm.participantOneScore !== '' && matchData?.participantOneId) {
        const p1Rank = winnerIdInt ? (winnerIdInt === matchData.participantOneId ? 1 : 2) : undefined;
        if (r1) {
          await matchApi.updateMatchResult(r1.id, { score: String(scoreForm.participantOneScore), rank: p1Rank });
        } else {
          await matchApi.addMatchResult(id, { athleteId: matchData.participantOneId, score: String(scoreForm.participantOneScore), rank: p1Rank });
        }
      }

      if (scoreForm.participantTwoScore !== '' && matchData?.participantTwoId) {
        const p2Rank = winnerIdInt ? (winnerIdInt === matchData.participantTwoId ? 1 : 2) : undefined;
        if (r2) {
          await matchApi.updateMatchResult(r2.id, { score: String(scoreForm.participantTwoScore), rank: p2Rank });
        } else {
          await matchApi.addMatchResult(id, { athleteId: matchData.participantTwoId, score: String(scoreForm.participantTwoScore), rank: p2Rank });
        }
      }

      toast.success("Match scores, status, and winner updated successfully!");
      setShowScoreModal(false);
      refetchMatch();
      refetchResults();
      queryClient.invalidateQueries({ queryKey: ['match', id] });
      queryClient.invalidateQueries({ queryKey: ['matchResults', id] });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to update match");
    }
  };

  const handleAddResult = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        athleteId: parseInt(resultForm.athleteId, 10),
        score: resultForm.score ? parseFloat(resultForm.score) : null,
        rank: resultForm.rank ? parseInt(resultForm.rank, 10) : null,
        medal: resultForm.medal || null,
        remarks: resultForm.remarks || null
      };

      await matchApi.addMatchResult(id, payload);
      toast.success("Match result and athlete performance recorded successfully!");
      setShowResultModal(false);
      setResultForm({ athleteId: '', score: '', rank: '', medal: '', remarks: '' });
      refetchResults();
      queryClient.invalidateQueries({ queryKey: ['matchResults', id] });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to record result");
    }
  };

  if (matchLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (matchError || !matchData) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-red-500 font-bold">
        <p>Error loading match details.</p>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
      </div>
    );
  }

  const match = matchData;
  const status = match.status?.toUpperCase() || 'SCHEDULED';
  const isLive = status === 'LIVE';
  const isCompleted = status === 'COMPLETED';
  const results = resultsData || [];

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-8 max-w-7xl mx-auto page-enter pb-20">
      
      {/* Back button + Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full h-10 w-10 border-border/60 hover:bg-muted" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Match Details
              </h1>
              <Badge variant="outline" className={`text-xs px-2.5 py-0.5 font-bold uppercase ${statusColors[status] || statusColors['SCHEDULED']}`}>
                {isLive && <Activity className="h-3 w-3 mr-1 animate-pulse" />}
                {status}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {match.tournamentName || 'Tournament Match'} • {match.round || 'Round 1'} • {match.sportName || 'Sport'}
            </p>
          </div>
        </div>

        {isAdminOrCoach && (
          <div className="flex items-center gap-3 flex-wrap">
            {!isLive && !isCompleted && (
              <Button 
                onClick={handleQuickStartMatch} 
                className="rounded-xl px-5 h-10 font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                <Play className="h-4 w-4 fill-current" /> Start Match
              </Button>
            )}
            <Button 
              onClick={handleOpenScoreModal} 
              className="rounded-xl px-5 h-10 font-bold gap-2 shadow-sm"
            >
              <Edit className="h-4 w-4" /> Update Score & Winner
            </Button>
            <Button 
              onClick={() => setShowResultModal(true)} 
              variant="outline" 
              className="rounded-xl px-5 h-10 font-bold gap-2 border-border/60"
            >
              <Award className="h-4 w-4 text-amber-500" /> Record Performance
            </Button>
          </div>
        )}
      </div>

      {/* Match Scoreboard Card */}
      {(() => {
        let teamOne = match.participantOneName || 'Team 1';
        let teamTwo = match.participantTwoName || 'Team 2';
        if (match.remarks && match.remarks.includes(' vs ')) {
          const parts = match.remarks.split(':').pop().split(' vs ');
          if (parts.length === 2) {
            teamOne = parts[0].trim();
            teamTwo = parts[1].trim();
          }
        }

        const r1 = results.find(r => r.athleteId === match.participantOneId);
        const r2 = results.find(r => r.athleteId === match.participantTwoId);
        const displayScore1 = r1?.score ?? match.participantOneScore ?? match.homeScore ?? (isLive ? '0' : '-');
        const displayScore2 = r2?.score ?? match.participantTwoScore ?? match.awayScore ?? (isLive ? '0' : '-');

        return (
          <Card className={`card-premium rounded-3xl border ${isLive ? 'border-red-300/80 bg-red-50/10' : 'border-border/60'} shadow-xl overflow-hidden`}>
            <CardContent className="p-6 sm:p-10">
              <div className="text-center space-y-8">
                <div className="grid grid-cols-3 items-center gap-4 sm:gap-8">
                  
                  {/* Participant 1 / Team 1 */}
                  <div className="text-right space-y-2">
                    <p className="font-extrabold text-lg sm:text-3xl text-foreground truncate" title={teamOne}>
                      {teamOne}
                    </p>
                    {match.winnerId === match.participantOneId && isCompleted && (
                      <Badge className="bg-emerald-600 text-white font-bold gap-1 px-3 py-1 shadow-sm">
                        <Trophy className="h-3.5 w-3.5" /> Winner
                      </Badge>
                    )}
                  </div>

                  {/* Score Center */}
                  <div className="flex items-center justify-center gap-3 sm:gap-6">
                    <span className="text-3xl sm:text-6xl font-black font-mono-telemetry text-foreground">
                      {displayScore1}
                    </span>
                    <span className="text-muted-foreground text-xl sm:text-3xl font-light">—</span>
                    <span className="text-3xl sm:text-6xl font-black font-mono-telemetry text-foreground">
                      {displayScore2}
                    </span>
                  </div>

                  {/* Participant 2 / Team 2 */}
                  <div className="text-left space-y-2">
                    <p className="font-extrabold text-lg sm:text-3xl text-foreground truncate" title={teamTwo}>
                      {teamTwo}
                    </p>
                    {match.winnerId === match.participantTwoId && isCompleted && (
                      <Badge className="bg-emerald-600 text-white font-bold gap-1 px-3 py-1 shadow-sm">
                        <Trophy className="h-3.5 w-3.5" /> Winner
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Interactive Control Panel for Admin/Coach */}
                {isAdminOrCoach && (
                  <div className="pt-2">
                    {!isLive && !isCompleted && (
                      <div className="bg-muted/40 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-border/60 text-left">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span>Match is currently scheduled. Ready to start competition?</span>
                        </div>
                        <Button 
                          onClick={handleQuickStartMatch}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 rounded-xl gap-2 shadow-md shadow-emerald-600/20"
                        >
                          <Play className="h-4 w-4 fill-current" /> Start Match (Go Live)
                        </Button>
                      </div>
                    )}

                    {isLive && (
                      <div className="bg-red-500/10 border border-red-300/60 p-4 sm:p-5 rounded-2xl space-y-4 text-left">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-200/40 pb-3">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-red-600 animate-pulse" />
                            <span className="font-bold text-sm text-red-700 dark:text-red-400">Match in Progress (Live Scorer Controls)</span>
                          </div>
                          <span className="text-xs text-muted-foreground">Adjust points in real-time or declare the winner</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Participant 1 quick controls */}
                          <div className="bg-card p-4 rounded-xl border border-border/60 space-y-3 text-center shadow-xs">
                            <p className="text-sm font-bold text-foreground truncate">{teamOne}</p>
                            <div className="flex items-center justify-center gap-3">
                              <Button size="sm" variant="outline" onClick={() => handleQuickScoreChange(1, -1)} className="h-9 w-9 rounded-lg p-0 font-bold border-border/70 hover:bg-muted">
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="text-2xl font-black font-mono-telemetry px-3 min-w-[3rem]">{r1?.score ?? 0}</span>
                              <Button size="sm" variant="outline" onClick={() => handleQuickScoreChange(1, 1)} className="h-9 w-9 rounded-lg p-0 font-bold border-border/70 hover:bg-muted">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            {match.participantOneId && (
                              <Button 
                                size="sm" 
                                onClick={() => handleQuickDeclareWinner(match.participantOneId, teamOne)}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl gap-1.5 h-9"
                              >
                                <Trophy className="h-3.5 w-3.5" /> Declare {teamOne} as Winner
                              </Button>
                            )}
                          </div>

                          {/* Participant 2 quick controls */}
                          <div className="bg-card p-4 rounded-xl border border-border/60 space-y-3 text-center shadow-xs">
                            <p className="text-sm font-bold text-foreground truncate">{teamTwo}</p>
                            <div className="flex items-center justify-center gap-3">
                              <Button size="sm" variant="outline" onClick={() => handleQuickScoreChange(2, -1)} className="h-9 w-9 rounded-lg p-0 font-bold border-border/70 hover:bg-muted">
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="text-2xl font-black font-mono-telemetry px-3 min-w-[3rem]">{r2?.score ?? 0}</span>
                              <Button size="sm" variant="outline" onClick={() => handleQuickScoreChange(2, 1)} className="h-9 w-9 rounded-lg p-0 font-bold border-border/70 hover:bg-muted">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            {match.participantTwoId && (
                              <Button 
                                size="sm" 
                                onClick={() => handleQuickDeclareWinner(match.participantTwoId, teamTwo)}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl gap-1.5 h-9"
                              >
                                <Trophy className="h-3.5 w-3.5" /> Declare {teamTwo} as Winner
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="bg-emerald-500/10 border border-emerald-300/50 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-left">
                        <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                          <CheckCircle2 className="h-5 w-5 shrink-0" />
                          <span>Match Finished & Winner Finalized: {match.winnerName || (match.winnerId === match.participantOneId ? teamOne : teamTwo) || 'Declared'}</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleOpenScoreModal}
                          className="rounded-xl text-xs font-bold gap-1.5 border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        >
                          <Edit className="h-3.5 w-3.5" /> Edit Final Score / Winner
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-6 border-t border-border/50">
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> {match.venue || 'Tournament Arena / Ground'}</span>
                  <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-blue-500" /> {match.matchDate ? `${match.matchDate} ${match.startTime || ''}` : 'Scheduled Date'}</span>
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Trophy className="h-4 w-4 text-amber-500" /> {match.eventName ? `${match.eventName} • ` : ''}{match.tournamentName || 'Tournament'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Results / Performance Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Match Results & Recorded Performance
          </h2>
          {isAdminOrCoach && (
            <Button size="sm" variant="ghost" onClick={() => setShowResultModal(true)} className="text-xs font-bold text-primary">
              + Add Result Record
            </Button>
          )}
        </div>

        {resultsLoading ? (
          <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((result, i) => (
              <Card key={i} className="card-premium rounded-2xl border border-border/60 p-5 flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <Trophy className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-base">{result.athleteName || `Athlete #${result.athleteId}`}</span>
                    {result.medal && (
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 font-bold text-xs">
                        {result.medal}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-4">
                    <span>Metric Score: <strong className="text-foreground">{result.score ?? 'N/A'}</strong></span>
                    {result.rank && <span>Rank: <strong className="text-foreground">#{result.rank}</strong></span>}
                  </div>
                  {result.remarks && (
                    <p className="text-xs text-muted-foreground mt-2 italic bg-muted/40 p-2 rounded-xl">
                      "{result.remarks}"
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="card-premium rounded-3xl border border-border/60 p-10 text-center text-muted-foreground">
            <Clock className="h-10 w-10 mx-auto mb-3 opacity-40 text-muted-foreground" />
            <p className="text-base font-bold text-foreground">No Performance Records Yet</p>
            <p className="text-xs mt-1">Coaches and coordinators can record individual performance metrics after match conclusion.</p>
          </Card>
        )}
      </div>

      {/* Modal 1: Score & Winner Update Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <Card className="w-full max-w-lg rounded-3xl border border-border shadow-2xl p-6 sm:p-8 space-y-6 bg-card">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                  <Edit className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Update Match Score</h3>
                  <p className="text-xs text-muted-foreground">Set participant points, match status, and winner</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowScoreModal(false)} className="rounded-full">
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleUpdateScore} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground truncate block">
                    {match.participantOneName || 'Participant 1'} Score
                  </Label>
                  <Input
                    type="number"
                    value={scoreForm.participantOneScore}
                    onChange={(e) => setScoreForm({ ...scoreForm, participantOneScore: e.target.value })}
                    placeholder="0"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground truncate block">
                    {match.participantTwoName || 'Participant 2'} Score
                  </Label>
                  <Input
                    type="number"
                    value={scoreForm.participantTwoScore}
                    onChange={(e) => setScoreForm({ ...scoreForm, participantTwoScore: e.target.value })}
                    placeholder="0"
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground">Match Status</Label>
                  <select
                    value={scoreForm.status}
                    onChange={(e) => setScoreForm({ ...scoreForm, status: e.target.value })}
                    className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="LIVE">Live / In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground">Winner</Label>
                  <select
                    value={scoreForm.winnerId}
                    onChange={(e) => setScoreForm({ ...scoreForm, winnerId: e.target.value })}
                    className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select Winner (Optional)</option>
                    {match.participantOneId && (
                      <option value={match.participantOneId}>{match.participantOneName || `Athlete #${match.participantOneId}`}</option>
                    )}
                    {match.participantTwoId && (
                      <option value={match.participantTwoId}>{match.participantTwoName || `Athlete #${match.participantTwoId}`}</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-foreground">Venue</Label>
                <Input
                  type="text"
                  value={scoreForm.venue}
                  onChange={(e) => setScoreForm({ ...scoreForm, venue: e.target.value })}
                  placeholder="e.g. Court A / Main Track / Arena"
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                <Button type="button" variant="outline" onClick={() => setShowScoreModal(false)} className="rounded-xl px-5">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl px-6 font-bold">
                  Save Score & Update
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal 2: Record Athlete Performance Result */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <Card className="w-full max-w-lg rounded-3xl border border-border shadow-2xl p-6 sm:p-8 space-y-6 bg-card">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Record Performance Result</h3>
                  <p className="text-xs text-muted-foreground">Log timings, points, ranks, and medals for athlete</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowResultModal(false)} className="rounded-full">
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleAddResult} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-foreground">Select Athlete <span className="text-destructive">*</span></Label>
                <select
                  value={resultForm.athleteId}
                  onChange={(e) => setResultForm({ ...resultForm, athleteId: e.target.value })}
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">Select participant</option>
                  {match.participantOneId && (
                    <option value={match.participantOneId}>{match.participantOneName || `Athlete #${match.participantOneId}`}</option>
                  )}
                  {match.participantTwoId && (
                    <option value={match.participantTwoId}>{match.participantTwoName || `Athlete #${match.participantTwoId}`}</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground">Performance Score / Metric Value</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={resultForm.score}
                    onChange={(e) => setResultForm({ ...resultForm, score: e.target.value })}
                    placeholder="e.g. 12.45 or 95"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground">Rank / Position</Label>
                  <Input
                    type="number"
                    value={resultForm.rank}
                    onChange={(e) => setResultForm({ ...resultForm, rank: e.target.value })}
                    placeholder="e.g. 1"
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-foreground">Medal / Recognition</Label>
                <select
                  value={resultForm.medal}
                  onChange={(e) => setResultForm({ ...resultForm, medal: e.target.value })}
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">None</option>
                  <option value="Gold">Gold Medal</option>
                  <option value="Silver">Silver Medal</option>
                  <option value="Bronze">Bronze Medal</option>
                  <option value="Finalist">Finalist</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-foreground">Remarks / Coach Notes</Label>
                <Textarea
                  value={resultForm.remarks}
                  onChange={(e) => setResultForm({ ...resultForm, remarks: e.target.value })}
                  placeholder="e.g. Set new personal best in 100m sprint..."
                  className="rounded-2xl min-h-[80px] text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                <Button type="button" variant="outline" onClick={() => setShowResultModal(false)} className="rounded-xl px-5">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl px-6 font-bold">
                  Save Result
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}
