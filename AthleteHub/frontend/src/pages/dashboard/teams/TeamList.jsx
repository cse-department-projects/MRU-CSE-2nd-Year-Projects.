import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Shield, 
  Trophy, 
  UserCheck, 
  Calendar, 
  ArrowRight, 
  MoreVertical, 
  Trash2, 
  Edit3,
  Dumbbell,
  CheckCircle2,
  Clock,
  UserPlus
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { teamApi } from '@/api/teamApi';
import { referenceApi } from '@/api/referenceApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function TeamList() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [teams, setTeams] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSport, setSelectedSport] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');

  const loadTeams = async () => {
    try {
      setLoading(true);
      const [teamsData, sportsData] = await Promise.all([
        teamApi.getTeams(),
        referenceApi.getSports()
      ]);
      setTeams(Array.isArray(teamsData) ? teamsData : []);
      setSports(Array.isArray(sportsData) ? sportsData : []);
    } catch (err) {
      console.error("Failed to load teams:", err);
      toast.error("Failed to load teams.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleDeleteTeam = async (id, name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await teamApi.deleteTeam(id);
      toast.success(`Team "${name}" deleted successfully.`);
      setTeams(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete team.");
    }
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = !search || 
      team.name.toLowerCase().includes(search.toLowerCase()) ||
      (team.teamCode && team.teamCode.toLowerCase().includes(search.toLowerCase())) ||
      (team.sportName && team.sportName.toLowerCase().includes(search.toLowerCase()));

    const matchesSport = selectedSport === 'ALL' || (team.sportId && String(team.sportId) === selectedSport);
    const matchesGender = selectedGender === 'ALL' || team.gender === selectedGender;

    return matchesSearch && matchesSport && matchesGender;
  });

  const isAthlete = currentUser?.role === 'ROLE_ATHLETE';
  const totalMembers = teams.reduce((sum, t) => sum + (t.memberCount || 0), 0);
  const activeTeams = teams.filter(t => t.status === 'ACTIVE').length;

  return (
    <div className="space-y-8 page-enter pb-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Teams & Squads
            </h1>
            <Badge variant="outline" className="text-xs uppercase font-semibold text-primary border-primary/30">
              {currentUser?.organizationName || 'Roster'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isAthlete 
              ? 'Form your own squad with teammates and request coach review, or view registered teams.' 
              : 'Organize athletes into competitive teams, squads, and training groups.'}
          </p>
        </div>

        <Button
          onClick={() => navigate('/dashboard/teams/new')}
          className="rounded-full px-6 h-11 font-bold shadow-lg shadow-primary/20 gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isAthlete ? 'Propose Squad to Coach' : 'Create New Team'}</span>
        </Button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Teams</p>
              <p className="text-2xl font-black text-foreground mt-0.5">{teams.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Shield className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Active Squads</p>
              <p className="text-2xl font-black text-emerald-500 mt-0.5">{activeTeams}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Athletes in Teams</p>
              <p className="text-2xl font-black text-purple-500 mt-0.5">{totalMembers}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-card p-3 rounded-2xl border border-border/60">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams by name, code, or sport..."
            className="pl-10 h-10 rounded-xl border-border/50 bg-background/50"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Sport Filter */}
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="h-10 px-3 rounded-xl border border-border/50 bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Sports</option>
            {sports.map(s => (
              <option key={s.id} value={String(s.id)}>{s.name}</option>
            ))}
          </select>

          {/* Gender Filter */}
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="h-10 px-3 rounded-xl border border-border/50 bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Categories</option>
            <option value="MALE">Men's</option>
            <option value="FEMALE">Women's</option>
            <option value="COED">Coed</option>
          </select>
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-3xl bg-muted/30 animate-pulse border border-border/40" />
          ))}
        </div>
      ) : filteredTeams.length === 0 ? (
        <Card className="rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card/40">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No Teams Found</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-6">
            {search || selectedSport !== 'ALL' || selectedGender !== 'ALL'
              ? "No teams match your filter criteria. Try adjusting your search."
              : "You haven't formed any teams yet. Create a team to organize rosters, positions, and squad lineups."}
          </p>
          <Button
            onClick={() => navigate('/dashboard/teams/new')}
            className="rounded-full px-6 gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Team</span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Card
              key={team.id}
              onClick={() => navigate(`/dashboard/teams/${team.id}`)}
              className="rounded-3xl border border-border/60 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden group bg-card/80 backdrop-blur-sm flex flex-col justify-between"
            >
              <div>
                {/* Card Header Top */}
                <div className="p-6 pb-4 border-b border-border/40 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground border-border/60">
                          {team.teamCode || `TEAM#${team.id}`}
                        </Badge>
                        <Badge
                          className={`text-[10px] font-bold ${
                            team.status === 'ACTIVE' 
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                              : team.status === 'PENDING_APPROVAL'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse'
                              : team.status === 'REJECTED'
                              ? 'bg-destructive/15 text-destructive border-destructive/30'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {team.status === 'PENDING_APPROVAL' ? 'Awaiting Coach Review' : team.status}
                        </Badge>
                        {team.pendingRequestsCount > 0 && !isAthlete && (
                          <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {team.pendingRequestsCount} Request{team.pendingRequestsCount > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {team.name}
                      </h3>
                      {team.createdByAthleteName && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Squad proposed by <span className="font-semibold text-foreground">{team.createdByAthleteName}</span>
                        </p>
                      )}
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                      <Shield className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Card Body Specs */}
                <div className="p-6 space-y-3 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Dumbbell className="w-3.5 h-3.5 text-primary" />
                      <span>Sport:</span>
                    </span>
                    <span className="font-semibold text-foreground">{team.sportName || 'General Athletics'}</span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>Category:</span>
                    </span>
                    <span className="font-semibold text-foreground">
                      {team.gender === 'MALE' ? "Men's" : team.gender === 'FEMALE' ? "Women's" : "Coed"} • {team.ageGroup || 'All Ages'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                      <span>Reviewing Coach:</span>
                    </span>
                    <span className="font-semibold text-foreground truncate max-w-[150px]">
                      {team.coachName || 'Assigned Coach'}
                    </span>
                  </div>

                  {team.description && (
                    <p className="text-[11px] text-muted-foreground/80 line-clamp-2 pt-1 border-t border-border/30">
                      {team.description}
                    </p>
                  )}
                  {team.status === 'REJECTED' && team.rejectionReason && (
                    <div className="p-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[11px]">
                      <span className="font-semibold">Rejection note: </span>{team.rejectionReason}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Roster & CTA */}
              <div className="p-4 px-6 bg-muted/20 border-t border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Users className="w-4 h-4" />
                  <span>{team.memberCount || 0} Athletes</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Restrict edit/delete for regular athletes unless they are Org Admin or Coach, or deleting their own pending squad */}
                  {(!isAthlete || team.status === 'PENDING_APPROVAL') && (
                    <>
                      {!isAthlete && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/teams/${team.id}/edit`);
                          }}
                          className="h-8 w-8 p-0 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="Edit Team"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                      )}

                      {!isAthlete && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleDeleteTeam(team.id, team.name, e)}
                          className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          title="Delete Team"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </>
                  )}

                  <Button
                    size="sm"
                    className="rounded-full h-8 px-3 text-xs font-bold gap-1 shadow-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/teams/${team.id}`);
                    }}
                  >
                    <span>Squad Roster</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
