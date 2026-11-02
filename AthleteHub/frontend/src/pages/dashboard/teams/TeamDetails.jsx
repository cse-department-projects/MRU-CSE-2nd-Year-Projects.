import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Shield, 
  Trophy, 
  UserCheck, 
  Dumbbell, 
  Hash, 
  CheckCircle2, 
  X, 
  Check, 
  AlertCircle,
  Building2,
  Calendar,
  Sparkles,
  UserPlus,
  Clock,
  MessageSquare,
  Send
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { teamApi } from '@/api/teamApi';
import api from '@/api/axios';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const ROLE_OPTIONS = [
  'Player',
  'Captain',
  'Vice Captain',
  'Starter',
  'Reserve',
  'Goalkeeper',
  'Forward',
  'Defender',
  'Midfielder',
  'Sprinter',
  'Point Guard',
  'Center'
];

export default function TeamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add Athlete Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [availableAthletes, setAvailableAthletes] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [selectedAthleteIds, setSelectedAthleteIds] = useState([]);
  const [selectedRole, setSelectedRole] = useState('Player');
  const [addingMembers, setAddingMembers] = useState(false);

  // Edit Member Inline State
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [memberRole, setMemberRole] = useState('');
  const [memberJersey, setMemberJersey] = useState('');
  const [memberPosition, setMemberPosition] = useState('');

  // Athlete Profile State & Join Request Modal State
  const [currentAthlete, setCurrentAthlete] = useState(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinPosition, setJoinPosition] = useState('Player');
  const [joinJersey, setJoinJersey] = useState('');
  const [joinNotes, setJoinNotes] = useState('');
  const [submittingJoin, setSubmittingJoin] = useState(false);

  useEffect(() => {
    if (currentUser?.role === 'ROLE_ATHLETE') {
      api.get('/athletes/me')
        .then(res => setCurrentAthlete(res.data?.data || null))
        .catch(err => {
          console.warn("Could not load current athlete profile:", err);
          setCurrentAthlete(null);
        });
    }
  }, [currentUser]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      const data = await teamApi.getTeamById(id);
      setTeam(data);
    } catch (err) {
      console.error("Failed to load team details:", err);
      toast.error(err.response?.data?.message || "Failed to load team.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamData();
  }, [id]);

  const handleRequestToJoin = async (e) => {
    e.preventDefault();
    setSubmittingJoin(true);
    try {
      await teamApi.requestToJoinTeam(id, {
        position: joinPosition.trim() || 'Player',
        jerseyNumber: joinJersey ? parseInt(joinJersey, 10) : null,
        notes: joinNotes.trim() || null
      });
      toast.success(`Join request submitted to Coach ${team?.coachName || ''} for review!`);
      setIsJoinModalOpen(false);
      setJoinNotes('');
      setJoinJersey('');
      await loadTeamData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit join request.");
    } finally {
      setSubmittingJoin(false);
    }
  };

  const handleApproveJoinRequest = async (athleteId, athleteName) => {
    try {
      await teamApi.approveJoinRequest(id, athleteId);
      toast.success(`${athleteName} has been approved and added to ${team?.name || 'the team'}!`);
      await loadTeamData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve join request.");
    }
  };

  const handleRejectJoinRequest = async (athleteId, athleteName) => {
    const reason = window.prompt(`Please enter an optional reason for rejecting ${athleteName}'s join request:`);
    if (reason === null) return;
    try {
      await teamApi.rejectJoinRequest(id, athleteId, reason);
      toast.success(`Join request for ${athleteName} rejected.`);
      await loadTeamData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject join request.");
    }
  };

  const handleCancelJoinRequest = async () => {
    if (!window.confirm("Are you sure you want to cancel your pending join request for this team?")) return;
    try {
      await teamApi.cancelJoinRequest(id);
      toast.success("Join request cancelled successfully.");
      await loadTeamData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel join request.");
    }
  };

  const openAddModal = async () => {
    setIsAddModalOpen(true);
    setSelectedAthleteIds([]);
    setSelectedRole('Player');
    try {
      setLoadingAvailable(true);
      const available = await teamApi.getAvailableAthletes(id);
      setAvailableAthletes(Array.isArray(available) ? available : []);
    } catch (err) {
      console.error("Failed to load available athletes:", err);
      toast.error("Failed to load athletes.");
    } finally {
      setLoadingAvailable(false);
    }
  };

  const toggleAthleteSelection = (athleteId) => {
    setSelectedAthleteIds(prev => 
      prev.includes(athleteId) ? prev.filter(x => x !== athleteId) : [...prev, athleteId]
    );
  };

  const handleAddMembersSubmit = async (e) => {
    e.preventDefault();
    if (selectedAthleteIds.length === 0) {
      toast.error("Please select at least one athlete to add to the team.");
      return;
    }

    setAddingMembers(true);
    try {
      await teamApi.addMembersBatch(id, selectedAthleteIds, selectedRole);
      toast.success(`Successfully added ${selectedAthleteIds.length} athlete(s) to the team!`);
      setIsAddModalOpen(false);
      await loadTeamData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add athletes to team.");
    } finally {
      setAddingMembers(false);
    }
  };

  const handleRemoveMember = async (athleteId, athleteName) => {
    if (!window.confirm(`Are you sure you want to remove ${athleteName} from this team?`)) return;

    try {
      await teamApi.removeMember(id, athleteId);
      toast.success(`${athleteName} removed from team roster.`);
      setTeam(prev => ({
        ...prev,
        members: prev.members.filter(m => m.athleteId !== athleteId),
        memberCount: Math.max(0, (prev.memberCount || 1) - 1)
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove athlete.");
    }
  };

  const startEditMember = (member) => {
    setEditingMemberId(member.athleteId);
    setMemberRole(member.role || 'Player');
    setMemberJersey(member.jerseyNumber ? String(member.jerseyNumber) : '');
    setMemberPosition(member.position || '');
  };

  const saveEditMember = async (athleteId) => {
    try {
      await teamApi.updateMember(id, athleteId, {
        role: memberRole,
        jerseyNumber: memberJersey ? parseInt(memberJersey) : null,
        position: memberPosition.trim() || null
      });
      toast.success("Member roster details updated!");
      setEditingMemberId(null);
      await loadTeamData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update member details.");
    }
  };

  if (loading) return <LoadingSpinner text="Loading team roster & details..." />;
  if (!team) return <div className="text-center py-16 text-muted-foreground">Team not found.</div>;

  const members = team.members || [];
  const filteredMembers = members.filter(m => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (m.athleteName && m.athleteName.toLowerCase().includes(q)) ||
      (m.athleteCode && m.athleteCode.toLowerCase().includes(q)) ||
      (m.role && m.role.toLowerCase().includes(q)) ||
      (m.position && m.position.toLowerCase().includes(q))
    );
  });

  const filteredAvailable = availableAthletes.filter(a => {
    if (!modalSearch) return true;
    const q = modalSearch.toLowerCase();
    return (
      (a.fullName && a.fullName.toLowerCase().includes(q)) ||
      (a.athleteCode && a.athleteCode.toLowerCase().includes(q)) ||
      (a.sportName && a.sportName.toLowerCase().includes(q))
    );
  });

  const isAthlete = currentUser?.role === 'ROLE_ATHLETE';
  const isCoach = currentUser?.role === 'ROLE_COACH';
  const isOrgAdmin = currentUser?.role === 'ROLE_ORG_ADMIN' || currentUser?.role === 'ROLE_SUPER_ADMIN';
  const canManage = isOrgAdmin || isCoach;

  const isAlreadyMember = currentAthlete && members.some(m => m.athleteId === currentAthlete.id);
  const myJoinRequest = currentAthlete && (team?.joinRequests || []).find(r => r.athleteId === currentAthlete.id);
  const isRequestPending = !!myJoinRequest;

  const handleApproveTeam = async () => {
    try {
      await teamApi.approveTeam(id);
      toast.success(`Squad "${team.name}" has been approved and activated!`);
      await loadTeamData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve squad.");
    }
  };

  const handleRejectTeam = async () => {
    const reason = window.prompt("Please enter a reason for rejecting this squad proposal:");
    if (reason === null) return;
    try {
      await teamApi.rejectTeam(id, reason);
      toast.success(`Squad proposal rejected.`);
      await loadTeamData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject squad.");
    }
  };

  return (
    <div className="space-y-8 page-enter pb-16 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/dashboard/teams')}
            className="rounded-full h-10 w-10 shrink-0 border-border/60 hover:bg-muted"
            title="Back to Teams"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Team Squad</span>
              <span className="text-border">•</span>
              <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                {team.teamCode || `TEAM#${team.id}`}
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground mt-0.5">
              {team.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/dashboard/teams/${team.id}/edit`)}
              className="rounded-full gap-1.5 h-10 px-4 text-xs font-semibold"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Team</span>
            </Button>
          )}

          {canManage && (
            <Button
              onClick={openAddModal}
              className="rounded-full gap-2 h-10 px-5 text-xs font-bold shadow-md shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Athletes</span>
            </Button>
          )}

          {/* Athlete Action: Request to Join, Pending status, or Active Member badge */}
          {isAthlete && (
            <div className="flex items-center gap-2">
              {isAlreadyMember ? (
                <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-xs px-3.5 py-1.5 font-bold flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Team Member</span>
                </Badge>
              ) : isRequestPending ? (
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-xs px-3.5 py-1.5 font-bold flex items-center gap-1.5 shadow-xs">
                    <Clock className="w-4 h-4" />
                    <span>Join Request Pending</span>
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelJoinRequest}
                    className="rounded-full text-xs h-9 px-3 text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    Cancel
                  </Button>
                </div>
              ) : team?.status === 'ACTIVE' && (
                <Button
                  onClick={() => setIsJoinModalOpen(true)}
                  className="rounded-full gap-2 h-10 px-5 text-xs font-bold shadow-md shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Request to Join Team</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pending Coach Approval Notice / Action Banner */}
      {team.status === 'PENDING_APPROVAL' && (
        <Card className="rounded-3xl border-2 border-amber-500/40 bg-amber-500/10 p-6 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-foreground">Squad Awaiting Coach Review</h3>
                  <Badge className="bg-amber-500 text-white font-bold text-xs">Pending Approval</Badge>
                </div>
                <p className="text-xs text-muted-foreground max-w-2xl">
                  {team.createdByAthleteName 
                    ? `This squad proposal was created by athlete ${team.createdByAthleteName} requesting mentorship from Coach ${team.coachName || 'assigned coach'}.`
                    : "This squad is currently pending approval by the designated coach and org administration."}
                </p>
              </div>
            </div>

            {canManage && (
              <div className="flex items-center gap-3 shrink-0">
                <Button
                  variant="outline"
                  onClick={handleRejectTeam}
                  className="rounded-full px-5 h-10 text-xs font-bold border-destructive/40 text-destructive hover:bg-destructive/10"
                >
                  <X className="w-4 h-4 mr-1.5" /> Reject Proposal
                </Button>
                <Button
                  onClick={handleApproveTeam}
                  className="rounded-full px-6 h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                >
                  <Check className="w-4 h-4 mr-1.5" /> Approve & Activate Squad
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Rejected Squad Notice */}
      {team.status === 'REJECTED' && (
        <Card className="rounded-3xl border border-destructive/40 bg-destructive/10 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-destructive/20 text-destructive flex items-center justify-center shrink-0">
              <X className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Squad Proposal Rejected</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {team.rejectionReason 
                  ? `Reason: ${team.rejectionReason}`
                  : "This squad was reviewed and not approved for official competition rosters."}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Team Overview Banner Card */}
      <Card className="rounded-3xl border border-border/60 overflow-hidden bg-gradient-to-r from-primary/10 via-card to-background shadow-md">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-16 h-16 rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-inner">
                <Shield className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs font-bold">
                    {team.sportName || 'Athletics'}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-medium">
                    {team.gender === 'MALE' ? "Men's Roster" : team.gender === 'FEMALE' ? "Women's Roster" : "Coed Squad"}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-mono text-muted-foreground">
                    {team.ageGroup || 'All Ages'}
                  </Badge>
                  <Badge className={`text-xs font-bold ${team.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' : 'bg-muted text-muted-foreground'}`}>
                    {team.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <UserCheck className="w-4 h-4 text-primary" />
                    <span>Head Coach:</span>
                    <span className="font-bold">{team.coachName || 'Assigned Coach'}</span>
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span>{team.organizationName || currentUser?.organizationName || 'Athletic Club'}</span>
                  </span>
                </div>

                {team.description && (
                  <p className="text-xs text-muted-foreground/90 italic pt-1 max-w-2xl">
                    "{team.description}"
                  </p>
                )}
              </div>
            </div>

            {/* Roster Counter Chip */}
            <div className="flex items-center gap-4 self-start lg:self-center bg-card/80 border border-border/60 rounded-2xl p-4 shadow-sm">
              <div className="text-right">
                <p className="text-2xl font-black text-foreground">{members.length}</p>
                <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Roster Athletes</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Athlete Join Request Banner (for athlete who is viewing) */}
      {isAthlete && isRequestPending && (
        <Card className="rounded-3xl border-2 border-amber-500/40 bg-amber-500/10 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Your Join Request is Pending Coach Review</h4>
                <p className="text-xs text-muted-foreground">
                  You requested to join as <strong>{myJoinRequest.position || 'Player'}</strong> {myJoinRequest.jerseyNumber ? `(Jersey #${myJoinRequest.jerseyNumber})` : ''}. Coach <strong>{team.coachName || 'the assigned coach'}</strong> has been notified to review your request.
                </p>
                {myJoinRequest.requestNotes && (
                  <p className="text-xs text-muted-foreground italic mt-1 bg-amber-500/10 px-2.5 py-1 rounded-lg inline-block">
                    Your note: "{myJoinRequest.requestNotes}"
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelJoinRequest}
              className="rounded-full text-xs h-9 px-4 text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0 self-start sm:self-auto"
            >
              Cancel Request
            </Button>
          </div>
        </Card>
      )}

      {/* Pending Athlete Join Requests Section (for Coach / Admin or if requests exist) */}
      {team.joinRequests && team.joinRequests.length > 0 && (canManage || isAthlete) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Pending Join Requests</h2>
              <Badge className="bg-amber-500 text-white font-bold text-xs">
                {team.joinRequests.length} Pending
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {canManage 
                ? `Athletes requesting Coach ${team.coachName || ''} to join this team. Review and approve or reject.` 
                : "Athletes awaiting coach approval"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {team.joinRequests.map((req) => (
              <Card key={req.athleteId} className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-sm">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 rounded-xl border border-border/60">
                        <AvatarImage src={req.photoUrl} />
                        <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                          {(req.athleteName || 'AT').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-sm text-foreground">{req.athleteName}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <span className="font-mono text-[11px]">{req.athleteCode || `ATH-${req.athleteId}`}</span>
                          <span>•</span>
                          <span>{req.gender || 'Athlete'}</span>
                          {req.age && <span>• {req.age} yrs</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <Badge variant="outline" className="text-xs font-mono font-semibold bg-background">
                        Rating: {req.performanceRating ?? '—'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs bg-card/60 p-2.5 rounded-xl border border-border/40">
                    <span className="font-semibold text-muted-foreground">Requested Position:</span>
                    <Badge variant="secondary" className="text-xs font-bold">{req.position || 'Player'}</Badge>
                    {req.jerseyNumber && (
                      <Badge variant="outline" className="text-xs font-mono">#{req.jerseyNumber}</Badge>
                    )}
                    {req.requestNotes && (
                      <div className="w-full text-[11px] text-muted-foreground italic pt-1 flex items-start gap-1">
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
                        <span>"{req.requestNotes}"</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span>Pending Coach Review</span>
                    </span>

                    {canManage ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectJoinRequest(req.athleteId, req.athleteName)}
                          className="h-8 px-3 rounded-full text-xs font-bold text-destructive border-destructive/30 hover:bg-destructive/10"
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApproveJoinRequest(req.athleteId, req.athleteName)}
                          className="h-8 px-4 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Approve
                        </Button>
                      </div>
                    ) : currentAthlete && req.athleteId === currentAthlete.id ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelJoinRequest}
                        className="h-8 px-3 rounded-full text-xs font-bold text-destructive border-destructive/30 hover:bg-destructive/10"
                      >
                        Cancel My Request
                      </Button>
                    ) : null}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Roster Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground">Squad Roster & Lineup</h2>
            <Badge variant="outline" className="text-xs font-semibold">
              {filteredMembers.length} of {members.length}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search athlete, role, position..."
                className="pl-9 h-9 rounded-xl text-xs bg-card"
              />
            </div>

            {canManage && (
              <Button
                size="sm"
                onClick={openAddModal}
                className="rounded-xl h-9 px-3 text-xs font-bold gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Athlete</span>
              </Button>
            )}
          </div>
        </div>

        {/* Members Roster Table */}
        <Card className="rounded-3xl border border-border/60 overflow-hidden bg-card/60 backdrop-blur-sm shadow-sm">
          {filteredMembers.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mx-auto">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">No Athletes in Squad Roster</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                  {search ? "No athletes match your search filter." : "Click 'Add Athlete' to assign athletes from your institution to this team."}
                </p>
              </div>
              <Button
                size="sm"
                onClick={openAddModal}
                className="rounded-full px-5 text-xs font-bold gap-1.5 shadow-md shadow-primary/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Athlete</span>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="py-4 px-6">Athlete</th>
                    <th className="py-4 px-4">Role in Squad</th>
                    <th className="py-4 px-4">Position</th>
                    <th className="py-4 px-4">Jersey #</th>
                    <th className="py-4 px-4">Sport</th>
                    <th className="py-4 px-4">Joined</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredMembers.map((m) => {
                    const isEditing = editingMemberId === m.athleteId;
                    return (
                      <tr key={m.id || m.athleteId} className="hover:bg-muted/30 transition-colors">
                        {/* Athlete Info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 rounded-xl border border-border/60">
                              <AvatarImage src={m.photoUrl} />
                              <AvatarFallback className="font-bold text-xs bg-primary/10 text-primary">
                                {(m.athleteName || 'AT').substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-bold text-foreground">{m.athleteName}</div>
                              <div className="text-[11px] font-mono text-muted-foreground">{m.athleteCode || `ID#${m.athleteId}`}</div>
                            </div>
                          </div>
                        </td>

                        {/* Role in Squad */}
                        <td className="py-4 px-4">
                          {isEditing ? (
                            <select
                              value={memberRole}
                              onChange={(e) => setMemberRole(e.target.value)}
                              className="h-8 px-2 text-xs rounded-lg border border-border bg-background"
                            >
                              {ROLE_OPTIONS.map(r => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          ) : (
                            <Badge
                              className={`text-xs font-bold ${
                                m.role === 'Captain' 
                                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                  : m.role === 'Vice Captain'
                                  ? 'bg-blue-500/15 text-blue-600 border-blue-500/30'
                                  : 'bg-muted text-foreground'
                              }`}
                            >
                              {m.role || 'Player'}
                            </Badge>
                          )}
                        </td>

                        {/* Position */}
                        <td className="py-4 px-4">
                          {isEditing ? (
                            <Input
                              value={memberPosition}
                              onChange={(e) => setMemberPosition(e.target.value)}
                              placeholder="e.g. Forward"
                              className="h-8 w-28 text-xs"
                            />
                          ) : (
                            <span className="text-xs text-foreground font-medium">
                              {m.position || '-'}
                            </span>
                          )}
                        </td>

                        {/* Jersey Number */}
                        <td className="py-4 px-4">
                          {isEditing ? (
                            <Input
                              type="number"
                              min="0"
                              max="99"
                              value={memberJersey}
                              onChange={(e) => setMemberJersey(e.target.value)}
                              placeholder="#"
                              className="h-8 w-16 text-xs text-center font-bold"
                            />
                          ) : (
                            <span className="text-xs font-bold font-mono text-primary">
                              {m.jerseyNumber != null ? `#${m.jerseyNumber}` : '-'}
                            </span>
                          )}
                        </td>

                        {/* Sport */}
                        <td className="py-4 px-4 text-xs text-muted-foreground">
                          {m.sportName || team.sportName || 'Athletics'}
                        </td>

                        {/* Joined Date */}
                        <td className="py-4 px-4 text-xs text-muted-foreground font-mono">
                          {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : 'Active'}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {canManage ? (
                              isEditing ? (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => saveEditMember(m.athleteId)}
                                    className="h-7 px-2.5 rounded-lg text-xs font-bold gap-1"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Save</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingMemberId(null)}
                                    className="h-7 w-7 p-0 rounded-lg"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => startEditMember(m)}
                                    className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                                    title="Edit Role / Jersey"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRemoveMember(m.athleteId, m.athleteName)}
                                    className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    title="Remove from Team"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </>
                              )
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                Active Squad Member
                              </Badge>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Add Athletes Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-2xl rounded-3xl border border-border/80 shadow-2xl bg-card overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Add Athletes to {team.name}</h3>
                  <p className="text-xs text-muted-foreground">Select athletes from your institution to enroll into this squad</p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleAddMembersSubmit} className="flex-1 overflow-hidden flex flex-col">
              <div className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                {/* Default Role Picker */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">Assigned Squad Role for Selected Athletes</label>
                    <span className="text-xs font-mono text-primary font-bold">{selectedAthleteIds.length} Selected</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ROLE_OPTIONS.slice(0, 6).map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSelectedRole(r)}
                        className={`px-3 py-1 text-xs rounded-xl border transition-all ${
                          selectedRole === r 
                            ? 'bg-primary text-primary-foreground border-primary font-bold' 
                            : 'bg-background border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Athlete Search */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    placeholder="Filter athletes by name, sport, or ID..."
                    className="pl-10 h-10 rounded-xl"
                  />
                </div>

                {/* Athletes Selection List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                    <span>Available Athletes in Institution</span>
                    {availableAthletes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedAthleteIds.length === filteredAvailable.length) {
                            setSelectedAthleteIds([]);
                          } else {
                            setSelectedAthleteIds(filteredAvailable.map(a => a.id));
                          }
                        }}
                        className="text-primary hover:underline font-semibold"
                      >
                        {selectedAthleteIds.length === filteredAvailable.length ? 'Deselect All' : 'Select All'}
                      </button>
                    )}
                  </div>

                  {loadingAvailable ? (
                    <div className="py-12 text-center text-xs text-muted-foreground">
                      Loading available athletes...
                    </div>
                  ) : filteredAvailable.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-border/60 rounded-2xl text-xs text-muted-foreground">
                      {modalSearch 
                        ? "No athletes match your search." 
                        : "All athletes in your institution are already members of this team or no active athletes exist."}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                      {filteredAvailable.map(athlete => {
                        const isSelected = selectedAthleteIds.includes(athlete.id);
                        return (
                          <div
                            key={athlete.id}
                            onClick={() => toggleAthleteSelection(athlete.id)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected 
                                ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30' 
                                : 'border-border/60 hover:bg-muted/40'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Avatar className="h-8 w-8 rounded-xl shrink-0">
                                <AvatarImage src={athlete.profilePhotoUrl} />
                                <AvatarFallback className="text-[10px] font-bold">
                                  {(athlete.fullName || 'AT').substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-bold text-xs text-foreground truncate">{athlete.fullName}</p>
                                <p className="text-[10px] text-muted-foreground truncate">
                                  {athlete.sportName || 'Athletics'} • {athlete.gender || 'Athlete'}
                                </p>
                              </div>
                            </div>

                            <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                              isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-border'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 px-6 border-t border-border/50 bg-muted/20 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-full px-5 h-10 text-xs font-semibold"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={addingMembers || selectedAthleteIds.length === 0}
                  className="rounded-full px-6 h-10 text-xs font-bold gap-2 shadow-md shadow-primary/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {addingMembers 
                      ? 'Adding Athletes...' 
                      : `Add ${selectedAthleteIds.length} Athlete(s) to Team`}
                  </span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Athlete Join Request Modal Dialog */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <Card className="w-full max-w-lg rounded-3xl border border-border/80 shadow-2xl overflow-hidden bg-card animate-in zoom-in-95 duration-200">
            <form onSubmit={handleRequestToJoin}>
              <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Request Coach to Join Team</h3>
                    <p className="text-xs text-muted-foreground">
                      Submit your application to Coach {team?.coachName || 'the assigned coach'} for {team?.name}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsJoinModalOpen(false)}
                  className="rounded-full h-8 w-8 text-muted-foreground hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-6 space-y-4">
                {/* Team Summary Pill */}
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-foreground">{team?.name}</p>
                    <p className="text-muted-foreground">
                      {team?.sportName || 'Athletics'} • {team?.gender === 'MALE' ? "Men's" : team?.gender === 'FEMALE' ? "Women's" : "Coed"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">Coach: {team?.coachName || 'Assigned'}</p>
                    <p className="text-muted-foreground">{members.length} Active Players</p>
                  </div>
                </div>

                {/* Preferred Position */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Preferred Position / Competition Role
                  </label>
                  <select
                    value={joinPosition}
                    onChange={(e) => setJoinPosition(e.target.value)}
                    className="w-full h-10 rounded-xl px-3 text-xs bg-background border border-border/60 focus:ring-1 focus:ring-primary outline-none"
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Preferred Jersey Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Preferred Jersey Number (Optional)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="99"
                    value={joinJersey}
                    onChange={(e) => setJoinJersey(e.target.value)}
                    placeholder="e.g. 7, 10, 23"
                    className="h-10 rounded-xl text-xs"
                  />
                </div>

                {/* Message to Coach */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Message / Note to Coach (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={joinNotes}
                    onChange={(e) => setJoinNotes(e.target.value)}
                    placeholder="Tell the coach why you would like to join this squad, your availability, or playing experience..."
                    className="w-full rounded-xl p-3 text-xs bg-background border border-border/60 focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 px-6 border-t border-border/50 bg-muted/20 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsJoinModalOpen(false)}
                  className="rounded-full px-5 h-10 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingJoin}
                  className="rounded-full px-6 h-10 text-xs font-bold gap-2 shadow-md shadow-primary/20 bg-primary text-primary-foreground"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingJoin ? 'Submitting...' : 'Send Request to Coach'}</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
