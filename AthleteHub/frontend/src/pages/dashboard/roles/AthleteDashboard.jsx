import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Activity, Trophy, Radio, Clock, ShieldCheck, ChevronRight, Bell, Sparkles } from 'lucide-react';
import KPIWidget from '@/components/dashboard/widgets/KPIWidget';
import QuickActionsWidget from '@/components/dashboard/widgets/QuickActionsWidget';
import { ChartSkeleton } from '@/components/ui/skeleton-loaders';
import api from '@/api/axios';
import { DASHBOARD_CONFIG } from '@/config/dashboard.config';
import { usePermissions } from '@/hooks/usePermissions';
import { ROLES } from '@/lib/permissions';
import RecentTrainingWidget from '@/components/dashboard/widgets/RecentTrainingWidget';
import RecentMatchResultsWidget from '@/components/dashboard/widgets/RecentMatchResultsWidget';
import AthleteJoinOrganization from '@/components/dashboard/AthleteJoinOrganization';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function AthleteDashboard({ user }) {
  // If athlete has not joined any organization, show onboarding affiliation screen
  if (!user?.organizationId && !user?.organization_id) {
    return <AthleteJoinOrganization onAffiliated={() => window.location.reload()} />;
  }

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState([]);
  const [recruitmentOpportunities, setRecruitmentOpportunities] = useState([]);
  
  const { can } = usePermissions();
  const config = DASHBOARD_CONFIG[ROLES.ATHLETE];

  useEffect(() => {
    const fetchAthleteStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        const dashboard = response.data?.data || response.data;
        // The dashboard endpoint wraps the KPI values in `stats` but keeps the
        // athlete id at the top level. Keep a single, component-friendly shape
        // so the cards and athlete-scoped widgets receive the correct values.
        const data = {
          ...(dashboard?.stats || {}),
          athlete_id: dashboard?.athlete_id ?? dashboard?.athleteId,
        };
        setStats(data);

        // Fetch upcoming scheduled matches
        try {
          const matchesRes = await api.get('/matches', { params: { pageSize: 5, status: 'SCHEDULED' } });
          const mList = matchesRes.data?.data?.items || matchesRes.data?.items || [];
          setUpcomingMatches(Array.isArray(mList) ? mList : []);
        } catch (e) {
          console.warn("Failed to fetch upcoming matches", e);
        }

        // Fetch upcoming tournaments
        try {
          const tourRes = await api.get('/tournaments', { params: { pageSize: 3 } });
          const tList = tourRes.data?.data?.items || tourRes.data?.items || [];
          setUpcomingTournaments(Array.isArray(tList) ? tList : []);
        } catch (e) {
          console.warn("Failed to fetch tournaments", e);
        }

        // Fetch recruitment inquiries & scout pipeline opportunities
        try {
          const recruitRes = await api.get('/recruitment/my-status');
          const rList = recruitRes.data?.data || recruitRes.data || [];
          setRecruitmentOpportunities(Array.isArray(rList) ? rList : []);
        } catch (e) {
          console.warn("Failed to fetch recruitment opportunities", e);
        }
      } catch (error) {
        console.error("Failed to fetch athlete dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAthleteStats();
  }, []);

  const visibleActions = config.quickActions.filter(action => !action.requirePermission || can(action.requirePermission));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      
      <motion.div variants={itemVariants} className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gradient-primary">{config.title}</h1>
          <p className="text-muted-foreground mt-2 text-lg font-medium">{config.description}</p>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ChartSkeleton className="h-32 rounded-2xl" /><ChartSkeleton className="h-32 rounded-2xl" /><ChartSkeleton className="h-32 rounded-2xl" /><ChartSkeleton className="h-32 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {config.kpis.map(kpi => (
            <motion.div key={kpi.id} variants={itemVariants} className="h-full">
              <KPIWidget 
                title={kpi.label} 
                value={stats ? `${stats[kpi.id] || 0}${kpi.suffix || ''}` : (kpi.suffix ? `0${kpi.suffix}` : '0')} 
                icon={kpi.icon} 
                color={kpi.color}
                className="h-full rounded-2xl"
              />
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <div className="card-premium rounded-3xl overflow-hidden h-full">
               <RecentTrainingWidget athleteId={stats?.athlete_id} />
            </div>
            <div className="card-premium rounded-3xl overflow-hidden h-full">
               <RecentMatchResultsWidget athleteId={stats?.athlete_id} />
            </div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="h-full">
          <div className="card-premium rounded-3xl overflow-hidden h-full">
            <QuickActionsWidget actions={visibleActions} />
          </div>
        </motion.div>
      </div>

      {/* Match Calendar & Tournaments Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Match Calendar & Upcoming Reminders */}
        <motion.div variants={itemVariants} className="card-premium rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Match Calendar & Reminders</h3>
                <p className="text-xs text-muted-foreground">Upcoming fixtures & live schedule reminders</p>
              </div>
            </div>
            <Link to="/dashboard/matches/calendar">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-semibold text-primary hover:text-primary/80">
                <span>Full Calendar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {upcomingMatches.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10 space-y-2">
              <Calendar className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm font-semibold text-foreground">No fixtures scheduled for this week</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Check back soon or explore the full interactive Match Calendar to view scheduled tournament fixtures.
              </p>
              <Link to="/dashboard/matches/calendar" className="inline-block pt-2">
                <Button size="sm" variant="outline" className="rounded-full text-xs gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-primary" /> Open Match Calendar
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingMatches.map(m => (
                <div key={m.id} className="p-3.5 rounded-2xl border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-background font-mono">
                        {m.round || "Fixture"}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {m.matchDate} {m.startTime ? `at ${m.startTime}` : ''}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-foreground truncate">
                      {m.homeTeamName || m.participantOneName || "Team Alpha"} vs {m.awayTeamName || m.participantTwoName || "Team Beta"}
                    </p>
                    {m.venue && (
                      <p className="text-xs text-muted-foreground truncate">{m.venue}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                      {m.status || "Scheduled"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Tournaments & Events Notice Hub */}
        <motion.div variants={itemVariants} className="card-premium rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Tournaments & Championships</h3>
                <p className="text-xs text-muted-foreground">Official club competitions & events</p>
              </div>
            </div>
            <Link to="/dashboard/tournaments">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-semibold text-primary hover:text-primary/80">
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Coach & Admin Roster Allocation Notice */}
          <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-semibold text-foreground">Coach & Admin Roster Entry</span>
              <p className="text-muted-foreground mt-0.5">
                Official tournament registrations, athlete rosters, and division seeds are submitted and verified by your club Coach and Org Administrator.
              </p>
            </div>
          </div>

          {upcomingTournaments.length === 0 ? (
            <div className="p-6 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10 space-y-2">
              <Trophy className="w-7 h-7 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm font-semibold text-foreground">No upcoming tournaments listed</p>
              <p className="text-xs text-muted-foreground">Check events for open training camps or exhibition series.</p>
              <Link to="/dashboard/events" className="inline-block pt-1">
                <Button size="sm" variant="outline" className="rounded-full text-xs">
                  Browse Events
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingTournaments.map(t => (
                <div key={t.id} className="p-3.5 rounded-2xl border border-border/40 bg-muted/20 flex items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{t.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                        {t.sportName || "Athletics"}
                      </Badge>
                      <span>{t.startDate} {t.endDate ? `to ${t.endDate}` : ''}</span>
                    </div>
                  </div>
                  <Link to={`/dashboard/tournaments/${t.id}`}>
                    <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1 shrink-0">
                      <span>View</span>
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recruitment Pipeline & Scout Inquiries Section */}
      <motion.div variants={itemVariants} className="card-premium rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border/40 gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground text-lg">Recruitment Pipeline & Trial Invitations</h3>
                <Badge variant="outline" className="text-xs font-semibold text-purple-500 border-purple-500/30">
                  {recruitmentOpportunities.length} Inquiries
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Scouting interest, trial invitations, and signing status from organizations</p>
            </div>
          </div>
          <Link to="/dashboard/teams">
            <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold gap-1.5 self-start sm:self-auto">
              <span>View Squads</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {recruitmentOpportunities.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10 space-y-2">
            <Sparkles className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
            <p className="text-sm font-semibold text-foreground">No active recruitment inquiries</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              When scouts or institutional recruiters add your profile to trial pipelines or roster reviews, you'll see your recruitment stage, scouting notes, and trial status here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recruitmentOpportunities.map((opp) => (
              <div 
                key={opp.id} 
                className="p-4 rounded-2xl border border-border/60 bg-card/80 hover:border-purple-500/50 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Badge className={`text-[10px] font-bold ${
                      opp.stage === 'SIGNED' ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30' :
                      opp.stage === 'OFFER_EXTENDED' ? 'bg-blue-500/20 text-blue-600 border-blue-500/30' :
                      opp.stage === 'TRIAL_INVITED' ? 'bg-amber-500/20 text-amber-600 border-amber-500/30 font-extrabold' :
                      opp.stage === 'REJECTED' ? 'bg-destructive/20 text-destructive border-destructive/30' :
                      'bg-purple-500/10 text-purple-600 border-purple-500/20'
                    }`}>
                      {opp.stage ? opp.stage.replace('_', ' ') : 'IN REVIEW'}
                    </Badge>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {opp.createdAt ? new Date(opp.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>

                  <h4 className="font-bold text-foreground text-sm mt-2">
                    {opp.organizationName || 'Scouting Organization'}
                  </h4>
                  {opp.assignedScoutName && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Recruiter: <span className="font-semibold text-foreground">{opp.assignedScoutName}</span>
                    </p>
                  )}
                </div>

                {opp.timeline && opp.timeline.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 text-[11px] space-y-1">
                    <p className="font-semibold text-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3 text-primary" /> Latest Note
                    </p>
                    <p className="text-muted-foreground italic">
                      "{opp.timeline[opp.timeline.length - 1].notes || 'Stage updated'}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
