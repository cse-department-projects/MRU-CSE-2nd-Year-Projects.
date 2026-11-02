import React from "react";
import { PageLayout } from "../../components/ui/PageLayout";
import api from "../../api/axios";
import { Users, TrendingUp, Target, CheckCircle, Map, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorState from "@/components/ui/ErrorState";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Link } from "react-router-dom";

const STAGE_COLORS = {
  NEW_PROSPECT: '#3b82f6',
  UNDER_REVIEW: '#a855f7',
  SHORTLISTED: '#6366f1',
  CONTACTED: '#f59e0b',
  TRIAL_INVITED: '#f97316',
  TRIAL_COMPLETED: '#14b8a6',
  SELECTED: '#22c55e',
  REJECTED: '#ef4444'
};

const STAGE_LABELS = {
  NEW_PROSPECT: 'New',
  UNDER_REVIEW: 'Review',
  SHORTLISTED: 'Shortlist',
  CONTACTED: 'Contacted',
  TRIAL_INVITED: 'Invited',
  TRIAL_COMPLETED: 'Trial Done',
  SELECTED: 'Selected',
  REJECTED: 'Rejected'
};

export default function RecruitmentDashboard() {
  const { data: metrics, isLoading: loadingMetrics, error: metricsError } = useQuery({
    queryKey: ["recruitmentDashboard"],
    queryFn: async () => {
      const response = await api.get("/recruitment/dashboard");
      return response.data.data;
    }
  });

  const { data: prospects = [], isLoading: loadingProspects } = useQuery({
    queryKey: ["recruitmentProspectsList"],
    queryFn: async () => {
      const response = await api.get("/recruitment/prospects");
      return response.data.data || [];
    }
  });

  if (loadingMetrics || loadingProspects) {
    return (
      <PageLayout title="Recruitment Command Center">
        <LoadingSpinner />
      </PageLayout>
    );
  }

  if (metricsError) {
    return (
      <PageLayout title="Recruitment Command Center">
        <ErrorState message="Failed to load dashboard metrics" />
      </PageLayout>
    );
  }

  // Calculate real stage distribution for chart
  const stageCounts = Object.keys(STAGE_COLORS).map(stageKey => {
    const count = prospects.filter(p => p.stage === stageKey).length;
    return {
      stage: STAGE_LABELS[stageKey] || stageKey,
      count,
      color: STAGE_COLORS[stageKey]
    };
  });

  const kpis = [
    { label: "Total Prospects", value: metrics?.totalProspects ?? prospects.length, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Active Pipeline", value: metrics?.activePipeline ?? prospects.filter(p => !['SELECTED', 'REJECTED'].includes(p.stage)).length, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Shortlisted", value: metrics?.shortlistedAthletes ?? prospects.filter(p => p.stage === 'SHORTLISTED').length, icon: Target, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Selected", value: metrics?.selectedAthletes ?? prospects.filter(p => p.stage === 'SELECTED').length, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Upcoming Trials", value: metrics?.upcomingTrials ?? prospects.filter(p => p.stage === 'TRIAL_INVITED').length, icon: Map, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Overdue Tasks", value: metrics?.overdueTasks ?? 0, icon: Clock, color: "text-red-500", bg: "bg-red-500/10" }
  ];

  return (
    <PageLayout title="Recruitment Command Center">
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Recruitment Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-base">Live talent acquisition metrics, pipeline distribution, and recent scout activities.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/dashboard/recruitment/import" className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
              Import Prospects
            </Link>
            <Link to="/dashboard/recruitment/discover" className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
              Discover Talent
            </Link>
            <Link to="/dashboard/recruitment/pipeline" className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
              View Pipeline
            </Link>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div key={index} className="card-premium overflow-hidden rounded-2xl border border-border/50 p-6 transition-all hover:translate-y-[-2px]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
                    <h3 className="mt-2 text-3xl font-bold font-mono-telemetry tracking-tight text-foreground">{kpi.value}</h3>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${kpi.bg} ${kpi.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Charts & Feed */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Real Pipeline Distribution Bar Chart */}
          <div className="card-premium rounded-2xl border border-border/50 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Pipeline Stage Distribution</h3>
              <span className="text-xs font-mono text-muted-foreground">{prospects.length} Total Prospects</span>
            </div>
            {prospects.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageCounts} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="stage" stroke="#9ca3af" fontSize={11} interval={0} angle={-25} textAnchor="end" />
                    <YAxis allowDecimals={false} stroke="#9ca3af" fontSize={11} />
                    <Tooltip 
                      formatter={(val) => [`${val} athletes`, 'Prospects']}
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {stageCounts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-xl">
                <Users className="h-10 w-10 mb-2 opacity-30" />
                <p className="text-sm">No active prospects in pipeline</p>
                <Link to="/dashboard/recruitment/discover" className="text-xs text-primary mt-2 hover:underline">Add athletes to begin tracking</Link>
              </div>
            )}
          </div>

          {/* Real Recent Prospects & Activity Feed */}
          <div className="card-premium rounded-2xl border border-border/50 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Recent Prospects</h3>
              <Link to="/dashboard/recruitment/pipeline" className="text-xs text-primary hover:underline">View All</Link>
            </div>
            {Array.isArray(prospects) && prospects.length > 0 ? (
              <div className="space-y-3 overflow-y-auto max-h-64 custom-scrollbar pr-1">
                {prospects.slice(0, 5).map((p) => {
                  const name = p.athlete?.fullName || (p.athlete?.firstName ? `${p.athlete.firstName} ${p.athlete.lastName}` : `Athlete #${p.athleteId || p.id}`);
                  return (
                    <Link
                      key={p.id}
                      to={`/dashboard/recruitment/prospects/${p.id}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors border border-border/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{name}</p>
                          <p className="text-xs text-muted-foreground">{p.athlete?.sport?.name || 'General'} · Rating: {p.rating || 'N/A'}/10</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-background" style={{ borderColor: STAGE_COLORS[p.stage] || '#64748b', color: STAGE_COLORS[p.stage] || '#64748b' }}>
                        {STAGE_LABELS[p.stage] || p.stage}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-xl">
                <Target className="h-10 w-10 mb-2 opacity-30" />
                <p className="text-sm">No recent recruitment activity</p>
                <Link to="/dashboard/recruitment/discover" className="text-xs text-primary mt-2 hover:underline">Discover and scout talent</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

