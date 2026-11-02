import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tournamentApi } from '../../api/tournamentApi';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Trophy, 
  Activity, 
  CalendarDays, 
  MapPin, 
  ArrowLeft, 
  Edit, 
  Shuffle, 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Users, 
  UserCheck, 
  AlertCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Award,
  PlusCircle,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { BracketViewer } from '../../components/BracketViewer';
import { toast } from 'sonner';
import { checkGenderEligibility, checkAgeEligibility } from '../../utils/eligibility';

const tournamentStatusColors = {
  'UPCOMING': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
  'ACTIVE': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300',
  'COMPLETED': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300',
};

export default function TournamentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  const isAthlete = currentUser?.role === 'ROLE_ATHLETE';
  const isCoach = currentUser?.role === 'ROLE_COACH';
  const isOrgAdmin = ['ROLE_ORG_ADMIN', 'ROLE_ORGANIZATION_ADMIN'].includes(currentUser?.role);
  const isSuperAdmin = currentUser?.role === 'ROLE_SUPER_ADMIN';
  const isAdminOrCoach = isCoach || isOrgAdmin || isSuperAdmin;

  const [bracketMatches, setBracketMatches] = useState([]);
  const [activeTab, setActiveTab] = useState('teams');
  const [generating, setGenerating] = useState(false);

  // Modals
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [teamRegistrationNotes, setTeamRegistrationNotes] = useState('');
  const [addingTeam, setAddingTeam] = useState(false);

  const [showJoinTeamModal, setShowJoinTeamModal] = useState(false);
  const [targetTeamToJoin, setTargetTeamToJoin] = useState(null);
  const [athleteJoinNotes, setAthleteJoinNotes] = useState('');
  const [submittingJoinRequest, setSubmittingJoinRequest] = useState(false);

  // Fetch Tournament
  const { data: tournament, isLoading, error, refetch: refetchTournament } = useQuery({
    queryKey: ['tournament', id],
    queryFn: async () => {
      const response = await tournamentApi.getTournamentById(id);
      return response.data?.data || response.data;
    }
  });

  // Fetch Current Athlete Profile
  const { data: myAthleteProfile } = useQuery({
    queryKey: ['myAthleteProfile'],
    queryFn: async () => {
      try {
        const res = await api.get('/athletes/me');
        return res.data?.data || res.data;
      } catch (e) {
        return null;
      }
    },
    enabled: isAthlete
  });

  // Fetch Tournament Participating Teams
  const { data: tournamentTeamsData, refetch: refetchTournamentTeams } = useQuery({
    queryKey: ['tournamentTeams', id],
    queryFn: async () => {
      try {
        const res = await tournamentApi.getTournamentTeams(id);
        return res.data || [];
      } catch (e) {
        return [];
      }
    }
  });

  // Fetch Available Teams for Coach / Admin to Add
  const { data: availableTeamsData, refetch: refetchAvailableTeams } = useQuery({
    queryKey: ['availableTeams', id],
    queryFn: async () => {
      try {
        const res = await api.get('/teams');
        return res.data?.data || [];
      } catch (e) {
        return [];
      }
    },
    enabled: isAdminOrCoach
  });

  // Fetch All Teams for Athlete to identify their current team
  const { data: allTeamsForAthlete } = useQuery({
    queryKey: ['allTeamsForAthlete'],
    queryFn: async () => {
      try {
        const res = await api.get('/teams');
        return res.data?.data || [];
      } catch (e) {
        return [];
      }
    },
    enabled: isAthlete
  });

  // Fetch Bracket Matches
  const fetchBracket = async () => {
    try {
      const res = await tournamentApi.getBracket(id);
      const data = res.data?.data || res.data || [];
      setBracketMatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching bracket:", err);
    }
  };

  useEffect(() => {
    if (tournament) {
      fetchBracket();
    }
  }, [tournament, id]);

  const tournamentTeams = Array.isArray(tournamentTeamsData) ? tournamentTeamsData : [];
  const availableTeams = Array.isArray(availableTeamsData) ? availableTeamsData : [];
  const allTeams = Array.isArray(allTeamsForAthlete) ? allTeamsForAthlete : [];

  // Identify athlete's active team in this tournament
  const athleteParticipatingTeam = isAthlete && myAthleteProfile
    ? tournamentTeams.find(t => t.members?.some(m => m.athleteId === myAthleteProfile.id && m.status === 'ACTIVE'))
    : null;

  // Identify athlete's existing team in the organization
  const athleteAnyTeam = isAthlete && myAthleteProfile
    ? allTeams.find(t => t.members?.some(m => m.athleteId === myAthleteProfile.id && m.status === 'ACTIVE'))
    : null;

  // Handle Coach/Admin Adding Team to Tournament
  const handleAddTeam = async (e) => {
    e.preventDefault();
    if (!selectedTeamId) {
      toast.error("Please select a team to add to the tournament.");
      return;
    }

    const teamObj = availableTeams.find(t => String(t.id) === String(selectedTeamId));
    if (teamObj) {
      // Validate gender compatibility
      if (tournament?.genderCategory && teamObj.gender) {
        const gCheck = checkGenderEligibility(tournament.genderCategory, teamObj.gender);
        if (!gCheck.eligible) {
          toast.error(`Cannot add team: ${gCheck.reason}`);
          return;
        }
      }
      // Validate age compatibility
      if (tournament?.ageCategory && teamObj.ageGroup) {
        const aCheck = checkAgeEligibility(tournament.ageCategory, null, null);
        // Additional basic check
      }
    }

    setAddingTeam(true);
    try {
      await tournamentApi.addTeamToTournament(id, {
        teamId: parseInt(selectedTeamId, 10),
        notes: teamRegistrationNotes || 'Enrolled by Coach for tournament competition'
      });
      toast.success("Team registered for tournament successfully!");
      setShowAddTeamModal(false);
      setSelectedTeamId('');
      setTeamRegistrationNotes('');
      refetchTournamentTeams();
      queryClient.invalidateQueries({ queryKey: ['tournamentTeams', id] });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to add team to tournament");
    } finally {
      setAddingTeam(false);
    }
  };

  // Handle Coach/Admin Removing Team from Tournament
  const handleRemoveTeam = async (teamId, teamName) => {
    if (!window.confirm(`Are you sure you want to withdraw team "${teamName}" from this tournament?`)) return;
    try {
      await tournamentApi.removeTeamFromTournament(id, teamId);
      toast.success(`Team "${teamName}" removed from tournament.`);
      refetchTournamentTeams();
      queryClient.invalidateQueries({ queryKey: ['tournamentTeams', id] });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to remove team");
    }
  };

  // Handle Athlete Requesting to Join a Team (Team-Wise Entry)
  const handleRequestJoinTeam = async (e) => {
    e.preventDefault();
    if (!targetTeamToJoin || !myAthleteProfile?.id) {
      toast.error("Please complete your athlete profile before submitting join requests.");
      return;
    }

    // Gender check with team
    const gCheck = checkGenderEligibility(targetTeamToJoin.gender, myAthleteProfile.gender);
    if (!gCheck.eligible) {
      toast.error(`Ineligible for this team: ${gCheck.reason}`);
      return;
    }

    setSubmittingJoinRequest(true);
    try {
      await api.post(`/teams/${targetTeamToJoin.teamId || targetTeamToJoin.id}/join-requests`, {
        remarks: athleteJoinNotes || `Athlete requested to join team for ${tournament.name}`
      });
      toast.success(`Join request submitted to Coach! Once approved, you will compete with ${targetTeamToJoin.teamName || targetTeamToJoin.name} in this tournament.`);
      setShowJoinTeamModal(false);
      setTargetTeamToJoin(null);
      setAthleteJoinNotes('');
      refetchTournamentTeams();
      queryClient.invalidateQueries({ queryKey: ['tournamentTeams', id] });
      queryClient.invalidateQueries({ queryKey: ['allTeamsForAthlete'] });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to submit team join request");
    } finally {
      setSubmittingJoinRequest(false);
    }
  };

  // Handle Bracket Generation
  const handleGenerateBracket = async () => {
    if (tournamentTeams.length < 2) {
      toast.error("At least 2 participating teams are required to generate a tournament bracket.");
      return;
    }

    setGenerating(true);
    try {
      const res = await tournamentApi.generateBracket(id);
      const matches = res.data?.data || res.data || [];
      setBracketMatches(Array.isArray(matches) ? matches : []);
      toast.success("Tournament bracket and match fixtures generated successfully!");
      fetchBracket();
      refetchTournament();
      refetchTournamentTeams();
      queryClient.invalidateQueries({ queryKey: ['tournament', id] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      setActiveTab('brackets');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to generate bracket");
    } finally {
      setGenerating(false);
    }
  };

  if (isLoading) return (
    <div className="p-16 flex flex-col items-center justify-center space-y-4">
      <Activity className="animate-spin text-primary h-8 w-8" />
      <p className="text-sm font-semibold text-muted-foreground">Loading Tournament Details...</p>
    </div>
  );
  if (error) return <div className="p-10 text-red-500 font-bold">Error: {error.message}</div>;
  if (!tournament) return <div className="p-10 text-center font-bold">Tournament not found.</div>;

  // Filter available teams not already entered in tournament
  const nonEnrolledTeams = availableTeams.filter(t => !tournamentTeams.some(tt => tt.teamId === t.id));

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 page-enter pb-24">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/dashboard/tournaments')} 
            className="rounded-full h-10 w-10 border-border/60 hover:bg-muted"
            title="Back to Tournaments"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {tournament.name}
              </h1>
              <Badge variant="outline" className={`text-xs px-2.5 py-0.5 font-bold uppercase ${tournamentStatusColors[tournament.status] || ''}`}>
                {tournament.status}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
              <span>Parent Event:</span>
              {tournament.eventId ? (
                <Link to={`/dashboard/events/${tournament.eventId}`} className="text-primary hover:underline font-semibold flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {tournament.eventName || `Event #${tournament.eventId}`}
                </Link>
              ) : (
                <span className="font-semibold text-foreground">{tournament.eventName || 'Independent Meet'}</span>
              )}
              <span>•</span>
              <span className="font-medium text-foreground">{tournament.sportName || 'Sport'}</span>
              <span>•</span>
              <Badge variant="secondary" className="text-xs">Team Tournament</Badge>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          {/* Coach / Admin Add Team Button */}
          {isAdminOrCoach && tournament.status !== 'COMPLETED' && (
            <Button
              onClick={() => setShowAddTeamModal(true)}
              className="rounded-xl h-10 font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-sm"
            >
              <PlusCircle className="h-4 w-4" /> Add Team to Tournament
            </Button>
          )}

          {isAdminOrCoach && (
            <Link to={`/dashboard/tournaments/${tournament.id}/edit`}>
              <Button variant="outline" className="h-10 rounded-xl px-4 gap-2 border-border/60">
                <Edit className="h-4 w-4" /> Edit Tournament
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Athlete Team-Wise Participation Status Banner */}
      {isAthlete && (
        <Card className={`rounded-2xl border ${athleteParticipatingTeam ? 'border-primary/40 bg-primary/5' : 'border-border/60 bg-muted/20'} p-5 shadow-sm`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl ${athleteParticipatingTeam ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-foreground text-base">Your Tournament Entry (Team-Wise)</h3>
                  {athleteParticipatingTeam ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 font-bold text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1 inline" /> Active on Team Roster
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground">Not in Participating Team</Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {athleteParticipatingTeam ? (
                    <span>
                      🎉 You are competing in this tournament as an active player on team <strong className="text-foreground">{athleteParticipatingTeam.teamName}</strong> (Coach: {athleteParticipatingTeam.coachName || 'Assigned Coach'}).
                    </span>
                  ) : athleteAnyTeam ? (
                    <span>
                      Your squad <strong className="text-foreground">{athleteAnyTeam.name}</strong> is not entered in this tournament yet. Ask your coach <strong className="text-foreground">{athleteAnyTeam.coachName}</strong> to add the team, or request to join one of the participating teams below.
                    </span>
                  ) : (
                    <span>
                      Tournaments are team-based competitions. Browse the participating teams below and click <strong>"Request to Join Team"</strong> to ask the coach for squad approval!
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/50 p-5 bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider">
            <span>Sport Division</span>
            <Trophy className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xl font-extrabold text-foreground mt-2">{tournament.sportName || 'Sport'}</p>
          <p className="text-xs text-muted-foreground mt-1 capitalize">{tournament.genderCategory || 'All'} • {tournament.ageCategory || 'Open'}</p>
        </Card>

        <Card className="rounded-2xl border-border/50 p-5 bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider">
            <span>Participating Teams</span>
            <Users className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-2">{tournamentTeams.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Teams registered by coaches</p>
        </Card>

        <Card className="rounded-2xl border-border/50 p-5 bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider">
            <span>Tournament Dates</span>
            <CalendarDays className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-sm font-bold text-foreground mt-2">{tournament.startDate || 'TBA'}</p>
          <p className="text-xs text-muted-foreground">to {tournament.endDate || 'TBA'}</p>
        </Card>

        <Card className="rounded-2xl border-border/50 p-5 bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider">
            <span>Bracket Status</span>
            <Shuffle className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-xl font-extrabold text-foreground mt-2">
            {bracketMatches.length > 0 ? `${bracketMatches.length} Matches` : 'Not Generated'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {bracketMatches.length > 0 ? 'Fixtures scheduled' : 'Requires 2+ teams'}
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full sm:w-auto sm:inline-flex h-12 rounded-2xl bg-muted/60 p-1">
          <TabsTrigger value="teams" className="rounded-xl text-sm font-bold flex items-center gap-2">
            <Users className="h-4 w-4" /> Participating Teams ({tournamentTeams.length})
          </TabsTrigger>
          <TabsTrigger value="brackets" className="rounded-xl text-sm font-bold flex items-center gap-2">
            <Shuffle className="h-4 w-4" /> Matches & Bracket ({bracketMatches.length})
          </TabsTrigger>
          <TabsTrigger value="overview" className="rounded-xl text-sm font-bold">
            Tournament Info
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Participating Teams */}
        <TabsContent value="teams" className="space-y-6 animate-fade-in">
          {/* Header Action Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Registered Teams</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Teams entered in this tournament. Athletes participate team-wise through registered team rosters.
              </p>
            </div>
            {isAdminOrCoach && (
              <Button
                onClick={() => setShowAddTeamModal(true)}
                className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-9 text-xs"
              >
                <PlusCircle className="h-4 w-4" /> Add Team to Tournament
              </Button>
            )}
          </div>

          {tournamentTeams.length === 0 ? (
            <Card className="rounded-3xl border border-border/60 p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground">No Teams Registered Yet</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                {isAdminOrCoach
                  ? 'Coaches can click "Add Team to Tournament" to enter their squad into this tournament competition.'
                  : 'Coaches add their teams to this tournament. Athletes can then ask for coach approval to join team-wise.'}
              </p>
              {isAdminOrCoach && (
                <Button onClick={() => setShowAddTeamModal(true)} className="mt-4 rounded-xl font-bold text-xs">
                  <PlusCircle className="h-4 w-4 mr-1.5" /> Register First Team
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournamentTeams.map((teamEntry) => {
                const isMemberOfThisTeam = isAthlete && myAthleteProfile && 
                  teamEntry.members?.some(m => m.athleteId === myAthleteProfile.id && m.status === 'ACTIVE');

                const isCoachOfThisTeam = isCoach && currentUser?.id && teamEntry.coachId;

                return (
                  <Card key={teamEntry.id} className="rounded-3xl border border-border/60 bg-card shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
                    <div>
                      {/* Top Team Header */}
                      <div className="p-5 border-b border-border/50 bg-muted/20 flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-foreground text-lg">{teamEntry.teamName}</h3>
                            <Badge variant="outline" className="text-xs font-mono">{teamEntry.teamCode || `TEAM-${teamEntry.teamId}`}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Coach: <strong className="text-foreground">{teamEntry.coachName || 'Assigned Coach'}</strong>
                          </p>
                        </div>
                        {isMemberOfThisTeam && (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs font-bold shrink-0">
                            Your Team 🏆
                          </Badge>
                        )}
                      </div>

                      {/* Team Stats & Badges */}
                      <div className="p-5 space-y-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs font-medium">
                            Gender: {teamEntry.gender || 'COED'}
                          </Badge>
                          <Badge variant="secondary" className="text-xs font-medium">
                            Age: {teamEntry.ageGroup || 'All Ages'}
                          </Badge>
                          {teamEntry.sportName && (
                            <Badge variant="outline" className="text-xs font-medium border-primary/30 text-primary">
                              {teamEntry.sportName}
                            </Badge>
                          )}
                        </div>

                        {/* Roster Preview */}
                        <div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold mb-2">
                            <span>Active Roster</span>
                            <span>{teamEntry.memberCount || teamEntry.members?.length || 0} Players</span>
                          </div>
                          {teamEntry.members && teamEntry.members.length > 0 ? (
                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                              {teamEntry.members.map((m) => (
                                <div key={m.athleteId} className="flex items-center justify-between text-xs p-2 rounded-xl bg-muted/40">
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="font-mono text-muted-foreground text-xs">#{m.jerseyNumber || '-'}</span>
                                    <span className="font-medium text-foreground truncate">{m.athleteName}</span>
                                    {m.athleteId === myAthleteProfile?.id && (
                                      <Badge variant="outline" className="text-[10px] px-1 py-0 text-emerald-600 border-emerald-300">You</Badge>
                                    )}
                                  </div>
                                  <span className="text-muted-foreground text-[11px] capitalize">{m.position || m.role || 'Player'}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-3 text-center rounded-xl bg-muted/30 text-xs text-muted-foreground">
                              No players added to squad yet
                            </div>
                          )}
                        </div>

                        {teamEntry.notes && (
                          <p className="text-xs text-muted-foreground italic border-t border-border/40 pt-2">
                            "{teamEntry.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Tray */}
                    <div className="p-4 border-t border-border/50 bg-muted/10 flex items-center justify-between gap-2">
                      <Link to={`/dashboard/teams/${teamEntry.teamId}`}>
                        <Button variant="ghost" size="sm" className="rounded-xl text-xs font-semibold gap-1">
                          Team Profile <ChevronRight className="h-3 w-3" />
                        </Button>
                      </Link>

                      {/* Athlete Join Request Action */}
                      {isAthlete && !isMemberOfThisTeam && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setTargetTeamToJoin(teamEntry);
                            setShowJoinTeamModal(true);
                          }}
                          className="rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs"
                        >
                          <UserPlus className="h-3.5 w-3.5" /> Request to Join Team
                        </Button>
                      )}

                      {/* Coach/Admin Remove Team Action */}
                      {isAdminOrCoach && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTeam(teamEntry.teamId, teamEntry.teamName)}
                          className="rounded-xl text-xs text-destructive hover:bg-destructive/10"
                          title="Withdraw team from tournament"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Matches & Bracket */}
        <TabsContent value="brackets" className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
            <div>
              <h2 className="text-xl font-bold text-foreground">Tournament Bracket & Matches</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Seeded match fixtures and knockout progression tree</p>
            </div>
            {isAdminOrCoach && bracketMatches.length === 0 && (
              <Button 
                onClick={handleGenerateBracket} 
                disabled={generating || tournamentTeams.length < 2} 
                className="bg-primary hover:bg-primary/90 font-bold rounded-xl shadow-md gap-2"
              >
                <Shuffle className="h-4 w-4" />
                {generating ? 'Generating...' : `Generate Bracket (${tournamentTeams.length} Teams)`}
              </Button>
            )}
          </div>

          <Card className="rounded-3xl border border-border/60 shadow-md overflow-hidden">
            <CardContent className="p-0">
              {bracketMatches.length > 0 ? (
                <div className="p-4 sm:p-6 space-y-8">
                  <div className="rounded-2xl bg-muted/20 border border-border/50 p-4 overflow-x-auto">
                    <BracketViewer matches={bracketMatches} />
                  </div>

                  {/* Match Cards List */}
                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-primary" /> Match Fixtures & Live Scoring ({bracketMatches.length})
                      </h3>
                      <div className="flex items-center gap-2">
                        <Link to={`/dashboard/matches/timeline?tournamentId=${tournament.id}`}>
                          <Button size="sm" variant="outline" className="h-8 text-xs rounded-xl gap-1">
                            <Activity className="h-3.5 w-3.5 text-primary" /> Live Center
                          </Button>
                        </Link>
                        <Link to={`/dashboard/matches/calendar?tournamentId=${tournament.id}`}>
                          <Button size="sm" variant="outline" className="h-8 text-xs rounded-xl gap-1">
                            <CalendarDays className="h-3.5 w-3.5 text-blue-500" /> Calendar
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bracketMatches.map((m) => {
                        const isCompleted = m.status === 'COMPLETED' || m.status === 'Completed';
                        const isLive = m.status === 'LIVE' || m.status === 'Live';

                        return (
                          <div 
                            key={m.id} 
                            className={`p-5 rounded-2xl border bg-card transition-all shadow-sm flex flex-col justify-between space-y-4 ${
                              isLive ? 'border-red-400 bg-red-50/10 shadow-md' : isCompleted ? 'border-border/60' : 'border-border/60 hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider text-primary border-primary/30">
                                  {m.round || `Match #${m.matchNumber || m.id}`}
                                </Badge>
                                {m.matchCode && (
                                  <span className="font-mono text-xs text-muted-foreground font-semibold">
                                    {m.matchCode}
                                  </span>
                                )}
                              </div>
                              <Badge 
                                variant="outline" 
                                className={`text-xs font-semibold capitalize ${
                                  isLive 
                                    ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 animate-pulse' 
                                    : isCompleted 
                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300' 
                                    : 'bg-muted/80 text-muted-foreground'
                                }`}
                              >
                                {m.status || 'SCHEDULED'}
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              <div className={`p-3 rounded-xl flex items-center justify-between transition-colors ${
                                m.winnerId === m.participantOneId && m.winnerId 
                                  ? 'bg-primary/10 font-bold text-foreground border border-primary/20' 
                                  : 'bg-muted/40'
                              }`}>
                                <div className="flex items-center gap-2 truncate pr-2">
                                  {m.winnerId === m.participantOneId && m.winnerId && (
                                    <Trophy className="h-4 w-4 text-primary shrink-0" />
                                  )}
                                  <span className="text-sm font-medium truncate">{m.participantOneName || 'Team / Participant 1'}</span>
                                </div>
                                <span className="text-sm font-mono font-bold">{m.participantOneScore ?? (isCompleted ? '0' : '-')}</span>
                              </div>

                              <div className={`p-3 rounded-xl flex items-center justify-between transition-colors ${
                                m.winnerId === m.participantTwoId && m.winnerId 
                                  ? 'bg-primary/10 font-bold text-foreground border border-primary/20' 
                                  : 'bg-muted/40'
                              }`}>
                                <div className="flex items-center gap-2 truncate pr-2">
                                  {m.winnerId === m.participantTwoId && m.winnerId && (
                                    <Trophy className="h-4 w-4 text-primary shrink-0" />
                                  )}
                                  <span className="text-sm font-medium truncate">{m.participantTwoName || 'Team / Participant 2'}</span>
                                </div>
                                <span className="text-sm font-mono font-bold">{m.participantTwoScore ?? (isCompleted ? '0' : '-')}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1 truncate"><MapPin className="h-3.5 w-3.5 text-primary shrink-0" /> {m.venue || tournament.venue || 'Main Ground'}</span>
                              <Link to={`/dashboard/matches/${m.id}`}>
                                <Button size="sm" variant="default" className="h-8 px-3 text-xs font-bold rounded-xl gap-1.5 shadow-xs">
                                  {isAdminOrCoach ? 'View & Score' : 'Match Details'} <ExternalLink className="h-3 w-3" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center">
                  <div className="h-20 w-20 bg-muted/30 rounded-3xl flex items-center justify-center mb-6">
                    <Trophy className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <p className="text-xl font-bold text-foreground">No Bracket Generated Yet</p>
                  <p className="text-sm mt-2 max-w-md text-muted-foreground leading-relaxed">
                    Once at least 2 teams are registered by coaches, click "Generate Bracket" to build the knockout tournament tree and schedule matches.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Overview */}
        <TabsContent value="overview" className="space-y-6 animate-fade-in">
          <Card className="rounded-3xl border border-border/60 shadow-md">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-lg font-bold">Tournament Specifications</CardTitle>
              <CardDescription>Rules, eligibility categories, and tournament details</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tournament Name</span>
                  <p className="font-semibold text-foreground text-base mt-1">{tournament.name}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sport</span>
                  <p className="font-semibold text-foreground text-base mt-1">{tournament.sportName || 'Sport'}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Parent Event</span>
                  <p className="font-semibold text-foreground text-base mt-1">{tournament.eventName || `Event #${tournament.eventId}`}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gender Division</span>
                  <p className="font-semibold text-foreground mt-1">{tournament.genderCategory || 'Mixed / Open'}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Age Requirement</span>
                  <p className="font-semibold text-foreground mt-1">{tournament.ageCategory || 'All Ages Eligible'}</p>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Participation Format</span>
                  <p className="font-semibold text-foreground mt-1">Team-Based Tournament</p>
                </div>
              </div>

              {tournament.description && (
                <div className="pt-4 border-t border-border/50">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Overview & Rules</span>
                  <p className="text-sm text-foreground mt-2 leading-relaxed whitespace-pre-wrap">{tournament.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal 1: Coach Adds Team to Tournament */}
      {showAddTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <Card className="w-full max-w-lg rounded-3xl border border-border shadow-2xl p-6 sm:p-8 space-y-6 bg-card">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Add Team to Tournament</h3>
                  <p className="text-xs text-muted-foreground">Enroll your squad into this tournament competition</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowAddTeamModal(false)} className="rounded-full">
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleAddTeam} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="selectedTeam" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Select Team <span className="text-destructive">*</span>
                </Label>
                <select
                  id="selectedTeam"
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">Select a team to enter</option>
                  {nonEnrolledTeams.map((t) => {
                    const gCheck = checkGenderEligibility(tournament?.genderCategory, t.gender);
                    return (
                      <option key={t.id} value={t.id} disabled={!gCheck.eligible}>
                        {t.name} ({t.teamCode || `TEAM-${t.id}`}) • {t.gender || 'COED'} • {t.ageGroup || 'All Ages'} {!gCheck.eligible ? `[INELIGIBLE: ${gCheck.reason}]` : '• Eligible'}
                      </option>
                    );
                  })}
                </select>
                {nonEnrolledTeams.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No available teams found. Make sure you have created an active team in this organization.
                  </p>
                )}
              </div>

              {/* Tournament division banner */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
                <span>Tournament Criteria:</span>
                <span className="font-bold text-foreground">
                  Gender: <span className="text-primary">{tournament?.genderCategory || 'ANY'}</span> • Age: <span className="text-primary">{tournament?.ageCategory || 'OPEN'}</span>
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamNotes" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Coach / Registration Notes</Label>
                <Textarea
                  id="teamNotes"
                  placeholder="e.g. Starting squad, coach remarks..."
                  value={teamRegistrationNotes}
                  onChange={(e) => setTeamRegistrationNotes(e.target.value)}
                  className="rounded-2xl min-h-[90px] text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddTeamModal(false)} className="rounded-xl px-5">
                  Cancel
                </Button>
                <Button type="submit" disabled={addingTeam || !selectedTeamId} className="rounded-xl px-6 font-bold">
                  {addingTeam ? 'Registering Team...' : 'Confirm & Register Team'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal 2: Athlete Requests to Join Team (Team-Wise Entry) */}
      {showJoinTeamModal && targetTeamToJoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <Card className="w-full max-w-lg rounded-3xl border border-border shadow-2xl p-6 sm:p-8 space-y-6 bg-card">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                  <UserPlus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Join Tournament Team</h3>
                  <p className="text-xs text-muted-foreground">Request coach approval to compete on this squad</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowJoinTeamModal(false)} className="rounded-full">
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleRequestJoinTeam} className="space-y-5">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Team:</span>
                  <span className="font-extrabold text-foreground text-sm">{targetTeamToJoin.teamName || targetTeamToJoin.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Head Coach:</span>
                  <span className="font-semibold text-foreground">{targetTeamToJoin.coachName || 'Team Coach'}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Category:</span>
                  <span>{targetTeamToJoin.gender || 'COED'} • {targetTeamToJoin.ageGroup || 'All Ages'}</span>
                </div>
              </div>

              {/* Ineligibility Warning if any */}
              {myAthleteProfile && (() => {
                const gCheck = checkGenderEligibility(targetTeamToJoin.gender, myAthleteProfile.gender);
                if (!gCheck.eligible) {
                  return (
                    <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{gCheck.reason}</span>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="space-y-2">
                <Label htmlFor="athleteJoinNotes" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Message to Coach</Label>
                <Textarea
                  id="athleteJoinNotes"
                  placeholder="e.g. Preferred position, jersey number, why you'd like to play in this tournament..."
                  value={athleteJoinNotes}
                  onChange={(e) => setAthleteJoinNotes(e.target.value)}
                  className="rounded-2xl min-h-[90px] text-sm"
                />
              </div>

              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">Team-Wise Participation Flow:</p>
                <p>Your request will be sent to <strong>{targetTeamToJoin.coachName || 'the coach'}</strong> for review. Once approved, you become an active player on this squad and participate in this tournament.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowJoinTeamModal(false)} className="rounded-xl px-5">
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingJoinRequest} className="rounded-xl px-6 font-bold">
                  {submittingJoinRequest ? 'Submitting Request...' : 'Send Request to Coach'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}
