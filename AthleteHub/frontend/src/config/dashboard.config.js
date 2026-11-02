import {
  Users,
  GraduationCap,
  Building2,
  BarChart3,
  Plus,
  Settings,
  Calendar,
  Activity,
  Trophy,
  ActivitySquare,
  Shield
} from 'lucide-react';
import { ROLES, PERMISSIONS } from '../lib/permissions';

export const DASHBOARD_CONFIG = {
  [ROLES.SUPER_ADMIN]: {
    title: 'Platform Telemetry',
    description: 'Monitor global platform health and statistics.',
    kpis: [
      { id: 'total_organizations', label: 'Total Organizations', icon: Building2, color: 'primary' },
      { id: 'total_athletes', label: 'Total Athletes', icon: Users, color: 'blue' },
      { id: 'active_tournaments', label: 'Active Tourneys', icon: Trophy, color: 'emerald' },
      { id: 'total_events', label: 'Total Events', icon: ActivitySquare, color: 'purple' },
    ],
    quickActions: [
      { label: 'Register Organization', path: '/dashboard/organizations/new', icon: Plus, variant: 'primary', requirePermission: PERMISSIONS.ORG_CREATE },
      { label: 'Platform Settings', path: '/dashboard/settings', icon: Settings, requirePermission: PERMISSIONS.PLATFORM_MANAGE },
    ],
  },
  [ROLES.ORG_ADMIN]: {
    title: 'Organization Overview',
    description: 'Monitor the health and activity of your organization.',
    kpis: [
      { id: 'total_athletes', label: 'Total Athletes', icon: Users, color: 'primary' },
      { id: 'active_events', label: 'Active Events', icon: ActivitySquare, color: 'blue' },
      { id: 'active_tournaments', label: 'Active Tournaments', icon: Trophy, color: 'emerald' },
      { id: 'total_participants', label: 'Event Participants', icon: Users, color: 'purple' },
    ],
    quickActions: [
      { label: 'Register Athlete', path: '/dashboard/athletes/new', icon: Plus, variant: 'primary', requirePermission: PERMISSIONS.ATHLETE_CREATE },
      { label: 'Add Coach', path: '/dashboard/coaches/new', icon: Plus, requirePermission: PERMISSIONS.COACH_ASSIGN },
      { label: 'Schedule Event', path: '/dashboard/events/new', icon: Plus, requirePermission: PERMISSIONS.EVENT_MANAGE },
      { label: 'Organization Settings', path: '/dashboard/settings', icon: Settings, requirePermission: PERMISSIONS.ORG_UPDATE },
    ],
  },
  [ROLES.COACH]: {
    title: 'Coach Command Center',
    description: 'Overview of your assigned athletes, matches, and training sessions.',
    kpis: [
      { id: 'total_athletes', label: 'Assigned Athletes', icon: Users, color: 'primary' },
      { id: 'scheduled_matches', label: 'Matches Scheduled', icon: Trophy, color: 'blue' },
      { id: 'active_sessions', label: 'Active Sessions', icon: Calendar, color: 'emerald' },
      { id: 'upcoming_events', label: 'Upcoming Events', icon: ActivitySquare, color: 'purple' },
    ],
    quickActions: [
      { label: 'Create Session', path: '/dashboard/training-sessions/new', icon: Plus, variant: 'primary', requirePermission: PERMISSIONS.TRAINING_CREATE },
      { label: 'Manage Teams', path: '/dashboard/teams', icon: Shield, requirePermission: PERMISSIONS.ATHLETE_VIEW },
      { label: 'Match Schedule', path: '/dashboard/matches/calendar', icon: Trophy, requirePermission: PERMISSIONS.EVENT_VIEW },
      { label: 'Log Attendance', path: '/dashboard/training/attendance', icon: Activity, requirePermission: PERMISSIONS.TRAINING_UPDATE },
      { label: 'My Athletes', path: '/dashboard/athletes', icon: Users, requirePermission: PERMISSIONS.ATHLETE_VIEW },
    ],
  },
  [ROLES.ATHLETE]: {
    title: 'Athlete Dashboard',
    description: 'Your upcoming training and recent performance.',
    kpis: [
      { id: 'scheduled_matches', label: 'Next Match', icon: Calendar, color: 'primary' },
      { id: 'total_medals', label: 'Total Medals', icon: Trophy, color: 'blue' },
      { id: 'gold_medals', label: 'Gold Medals', icon: Trophy, color: 'emerald' },
      { id: 'completed_events', label: 'Events Attended', icon: ActivitySquare, color: 'purple' },
    ],
    quickActions: [
      { label: 'View Schedule', path: '/dashboard/training', icon: Calendar, variant: 'primary', requirePermission: PERMISSIONS.TRAINING_VIEW },
      { label: 'Teams & Squads', path: '/dashboard/teams', icon: Shield, requirePermission: PERMISSIONS.ATHLETE_VIEW },
      { label: 'Upcoming Events', path: '/dashboard/events', icon: Trophy, requirePermission: PERMISSIONS.EVENT_VIEW },
    ],
  },
};
