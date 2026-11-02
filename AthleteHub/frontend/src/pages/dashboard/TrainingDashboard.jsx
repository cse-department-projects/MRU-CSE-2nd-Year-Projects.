import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  Activity,
  Calendar,
  Users,
  CheckCircle,
  CalendarDays,
  Plus,
  ArrowRight,
  Clock,
  Dumbbell,
  Target,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ChartSkeleton, TableSkeleton } from '../../components/ui/skeleton-loaders';
import TrainingNav from '../../components/training/TrainingNav';
import RoleGate from '../../components/auth/RoleGate';
import { PERMISSIONS } from '../../lib/permissions';

const statusBadgeStyles = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  Active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  DRAFT: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  Draft: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  COMPLETED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  Completed: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  SCHEDULED: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  Scheduled: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  CANCELLED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  Cancelled: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
};

export default function TrainingDashboard() {
  const [stats, setStats] = useState(null);
  const [recentPlans, setRecentPlans] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrainingOverview();
  }, []);

  const fetchTrainingOverview = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats, recent plans, and upcoming sessions in parallel
      const [statsRes, plansRes, sessionsRes] = await Promise.allSettled([
        api.get('/training-dashboard/stats'),
        api.get('/training-plans', { params: { page: 0, size: 5 } }),
        api.get('/training-sessions', { params: { page: 1, page_size: 5 } })
      ]);

      if (statsRes.status === 'fulfilled') {
        const data = statsRes.value.data?.data || statsRes.value.data || {};
        setStats(data);
      } else {
        console.warn('Failed to fetch training stats', statsRes.reason);
        setError(statsRes.reason?.response?.data?.message || 'Failed to fetch training stats');
      }

      if (plansRes.status === 'fulfilled') {
        const plansData = plansRes.value.data?.data || plansRes.value.data || {};
        setRecentPlans(plansData.items || []);
      }

      if (sessionsRes.status === 'fulfilled') {
        const sessionsData = sessionsRes.value.data?.data || sessionsRes.value.data || {};
        setUpcomingSessions(sessionsData.items || []);
      }
    } catch (err) {
      console.error('Training dashboard fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load training overview');
    } finally {
      setLoading(false);
    }
  };

  // Safe stat accessors
  const activePlansCount = stats?.trainingPlans?.active ?? stats?.active_plans ?? 0;
  const totalPlansCount = stats?.trainingPlans?.total ?? stats?.total_plans ?? 0;
  const todaySessionsCount = stats?.trainingSessions?.today ?? 0;
  const upcomingSessionsCount = stats?.trainingSessions?.upcoming ?? stats?.upcoming_sessions ?? 0;
  const completedSessionsCount = stats?.trainingSessions?.completed ?? stats?.completed_sessions ?? 0;
  const attendanceRate = stats?.attendance?.percentage != null 
    ? stats.attendance.percentage 
    : (stats?.athleteStatistics?.attendancePercentage ?? 0);

  const presentCount = stats?.attendance?.present ?? 0;
  const absentCount = stats?.attendance?.absent ?? 0;
  const lateCount = stats?.attendance?.late ?? 0;
  const excusedCount = stats?.attendance?.excused ?? 0;

  return (
    <div className="p-6 md:p-8 space-y-8 page-enter max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Training Center</h1>
            <span className="font-mono-telemetry text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Overview
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Plan, organize, monitor, and evaluate all athlete training programs and sessions.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="shadow-sm" asChild>
            <Link to="/dashboard/training-sessions">
              <CalendarDays className="mr-2 h-4 w-4" /> View Sessions
            </Link>
          </Button>
          <RoleGate permission={PERMISSIONS.TRAINING_CREATE}>
            <Button className="shadow-sm" asChild>
              <Link to="/dashboard/training-plans/new">
                <Plus className="mr-2 h-4 w-4" /> Create Plan
              </Link>
            </Button>
          </RoleGate>
        </div>
      </div>

      {/* 2. Segmented Navigation */}
      <TrainingNav />

      {/* 3. Error Banner */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4. Overview KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ChartSkeleton className="h-32 rounded-2xl" />
          <ChartSkeleton className="h-32 rounded-2xl" />
          <ChartSkeleton className="h-32 rounded-2xl" />
          <ChartSkeleton className="h-32 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-telemetry-elevated group overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4 relative">
              <div className="p-3.5 rounded-2xl bg-primary/10 text-primary shrink-0 z-10 group-hover:scale-105 transition-transform">
                <Target size={22} />
              </div>
              <div className="z-10">
                <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider label-caps">Active Plans</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <p className="text-3xl font-bold font-mono-telemetry text-foreground tracking-tight">{activePlansCount}</p>
                  <span className="text-xs text-muted-foreground">/ {totalPlansCount} total</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-telemetry-elevated group overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4 relative">
              <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-500 shrink-0 z-10 group-hover:scale-105 transition-transform">
                <Calendar size={22} />
              </div>
              <div className="z-10">
                <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider label-caps">Today / Upcoming</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <p className="text-3xl font-bold font-mono-telemetry text-foreground tracking-tight">{todaySessionsCount}</p>
                  <span className="text-xs text-muted-foreground">({upcomingSessionsCount} scheduled)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-telemetry-elevated group overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4 relative">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500 shrink-0 z-10 group-hover:scale-105 transition-transform">
                <CheckCircle size={22} />
              </div>
              <div className="z-10">
                <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider label-caps">Completed Sessions</p>
                <p className="text-3xl font-bold font-mono-telemetry text-foreground mt-0.5 tracking-tight">{completedSessionsCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-telemetry-elevated group overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4 relative">
              <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-500 shrink-0 z-10 group-hover:scale-105 transition-transform">
                <Dumbbell size={22} />
              </div>
              <div className="z-10">
                <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider label-caps">Workload Status</p>
                <p className="text-3xl font-bold font-mono-telemetry text-foreground mt-0.5 tracking-tight">
                  {stats?.coachStatistics?.weeklyWorkload || 'Optimal'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 5. Workload & Progress Analytics */}
      {!loading && stats && (
        <Card className="card-telemetry-elevated">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-primary" /> Coaching Workload & Progress
              </CardTitle>
              <CardDescription>Coaching workload and athlete activity summary across training sessions.</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="rounded-full text-xs">
              <Link to="/dashboard/training/attendance">
                View Attendance Hub &rarr;
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-muted/40 rounded-xl border border-border/60">
                <p className="text-2xl font-bold text-foreground font-mono-telemetry">
                  {stats?.coachStatistics?.sessionsConducted ?? completedSessionsCount}
                </p>
                <p className="text-xs text-muted-foreground font-medium mt-1">Sessions Done</p>
              </div>
              <div className="p-4 bg-muted/40 rounded-xl border border-border/60">
                <p className="text-2xl font-bold text-foreground font-mono-telemetry">
                  {stats?.coachStatistics?.weeklyWorkload ?? 'Medium'}
                </p>
                <p className="text-xs text-muted-foreground font-medium mt-1">Weekly Intensity</p>
              </div>
              <div className="p-4 bg-muted/40 rounded-xl border border-border/60">
                <p className="text-2xl font-bold text-foreground font-mono-telemetry">
                  {stats?.coachStatistics?.monthlyWorkload ?? 'Optimal'}
                </p>
                <p className="text-xs text-muted-foreground font-medium mt-1">Monthly Load</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 6. Overview Data: Recent Plans & Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Training Plans */}
        <Card className="card-telemetry-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" /> Recent Training Plans
              </CardTitle>
              <CardDescription className="text-xs">Active and drafted training curricula.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
              <Link to="/dashboard/training-plans">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-2">
                <div className="h-14 bg-muted/30 rounded-xl animate-pulse" />
                <div className="h-14 bg-muted/30 rounded-xl animate-pulse" />
                <div className="h-14 bg-muted/30 rounded-xl animate-pulse" />
              </div>
            ) : recentPlans.length > 0 ? (
              recentPlans.map((plan) => (
                <Link
                  key={plan.id}
                  to={`/dashboard/training-plans/${plan.id}`}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/40 hover:border-primary/30 transition-all group"
                >
                  <div className="space-y-1 min-w-0 pr-3">
                    <p className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {plan.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{plan.sport?.name || 'General Sport'}</span>
                      <span>•</span>
                      <span>{plan.durationWeeks || plan.duration_weeks || 1} wks</span>
                      <span>•</span>
                      <span className="capitalize">{plan.difficultyLevel?.toLowerCase() || 'Intermediate'}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[11px] font-semibold shrink-0 ${statusBadgeStyles[plan.status] || ''}`}>
                    {plan.status || 'Active'}
                  </Badge>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No training plans found.</p>
                <RoleGate permission={PERMISSIONS.TRAINING_CREATE}>
                  <Button size="sm" variant="outline" className="mt-3 text-xs" asChild>
                    <Link to="/dashboard/training-plans/new">Create First Plan</Link>
                  </Button>
                </RoleGate>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Training Sessions */}
        <Card className="card-telemetry-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" /> Upcoming Sessions
              </CardTitle>
              <CardDescription className="text-xs">Scheduled workouts, drills, and evaluations.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
              <Link to="/dashboard/training-sessions">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-2">
                <div className="h-14 bg-muted/30 rounded-xl animate-pulse" />
                <div className="h-14 bg-muted/30 rounded-xl animate-pulse" />
                <div className="h-14 bg-muted/30 rounded-xl animate-pulse" />
              </div>
            ) : upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => (
                <Link
                  key={session.id}
                  to={`/dashboard/training-sessions/${session.id}`}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/40 hover:border-blue-500/30 transition-all group"
                >
                  <div className="space-y-1 min-w-0 pr-3">
                    <p className="font-semibold text-sm text-foreground truncate group-hover:text-blue-500 transition-colors">
                      {session.title || session.description || 'Training Session'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-mono-telemetry">
                        <CalendarDays className="h-3 w-3" />
                        {session.sessionDate || 'Scheduled'}
                      </span>
                      <span>•</span>
                      <span>{session.startTime || ''}</span>
                      {session.venue && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[120px]">{session.venue}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[11px] font-semibold shrink-0 ${statusBadgeStyles[session.status] || ''}`}>
                    {session.status || 'Scheduled'}
                  </Badge>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No scheduled sessions found.</p>
                <RoleGate permission={PERMISSIONS.TRAINING_CREATE}>
                  <Button size="sm" variant="outline" className="mt-3 text-xs" asChild>
                    <Link to="/dashboard/training-sessions/new">Schedule Session</Link>
                  </Button>
                </RoleGate>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
