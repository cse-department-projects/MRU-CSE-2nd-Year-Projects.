import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Building2, MapPin, Mail, Trophy, Radio, ShieldCheck } from 'lucide-react';
import KPIWidget from '@/components/dashboard/widgets/KPIWidget';
import QuickActionsWidget from '@/components/dashboard/widgets/QuickActionsWidget';
import { ChartSkeleton } from '@/components/ui/skeleton-loaders';
import { Badge } from '@/components/ui/badge';
import api from '@/api/axios';
import { DASHBOARD_CONFIG } from '@/config/dashboard.config';
import { usePermissions } from '@/hooks/usePermissions';
import { ROLES } from '@/lib/permissions';
import RecentTrainingWidget from '@/components/dashboard/widgets/RecentTrainingWidget';
import RecentAthletesWidget from '@/components/dashboard/widgets/RecentAthletesWidget';
import RecentMatchResultsWidget from '@/components/dashboard/widgets/RecentMatchResultsWidget';
import CoachJoinOrganization from '@/components/dashboard/CoachJoinOrganization';
import { useAuth } from '@/contexts/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function CoachDashboard({ user: propUser }) {
  const { currentUser, refreshUser } = useAuth();
  const user = propUser || currentUser;
  const orgId = user?.organizationId || user?.organization_id;

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [organization, setOrganization] = useState(null);
  const { can } = usePermissions();

  if (!orgId) {
    return (
      <CoachJoinOrganization
        onAffiliated={async () => {
          await refreshUser();
          window.location.reload();
        }}
      />
    );
  }

  const config = DASHBOARD_CONFIG[ROLES.COACH];

  useEffect(() => {
    if (orgId) {
      api.get(`/organizations/${orgId}`)
        .then(res => {
          setOrganization(res.data?.data || res.data);
        })
        .catch(err => {
          console.warn("Could not load organization details:", err);
        });
    }
  }, [orgId]);

  useEffect(() => {
    const fetchCoachStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        const dashboard = response.data?.data || response.data;
        const data = {
          ...(dashboard?.stats || {}),
          ...(dashboard || {})
        };
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch coach dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCoachStats();
  }, [user?.organizationId]);

  const visibleActions = config.quickActions.filter(action => !action.requirePermission || can(action.requirePermission));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* Header & Organization Affiliation Banner */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gradient-primary">{config.title}</h1>
          <p className="text-muted-foreground mt-1 text-base font-medium">{config.description}</p>
        </div>

        {/* Visible Organization Affiliation Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-primary/10 via-card to-background border border-border/70 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-inner">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase font-bold tracking-wider text-primary">Affiliated Organization</span>
                <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
                  {organization?.organizationCode || currentUser?.organizationCode || 'ORG'}
                </Badge>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                {organization?.name || currentUser?.organizationName || 'Athletic Organization'}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-0.5">
                {(organization?.city || organization?.state) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    {[organization?.city, organization?.state].filter(Boolean).join(', ')}
                  </span>
                )}
                {organization?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                    {organization.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 gap-1.5 py-1 px-3 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Active Coach Staff
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* KPI Stats */}
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

      {/* Upper Grid: Matches & Fixtures + Recent Training */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="card-premium rounded-3xl overflow-hidden">
          <RecentMatchResultsWidget title="Organization Matches & Fixtures" />
        </motion.div>
        <motion.div variants={itemVariants} className="card-premium rounded-3xl overflow-hidden">
          <RecentTrainingWidget coachId={user?.coachId || user?.id} />
        </motion.div>
      </div>

      {/* Lower Grid: Athletes Roster + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 card-premium rounded-3xl overflow-hidden">
          <RecentAthletesWidget organizationId={orgId} />
        </motion.div>
        
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="card-premium rounded-3xl overflow-hidden h-full">
            <QuickActionsWidget actions={visibleActions} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
