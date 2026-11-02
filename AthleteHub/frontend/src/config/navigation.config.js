import {
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  CalendarDays,
  Trophy,
  Radio,
  Settings,
  Download,
  Briefcase,
  Search,
  List,
  CheckSquare,
  Shield
} from 'lucide-react';
import { ROLES, PERMISSIONS } from '../lib/permissions';

export const NAVIGATION_CONFIG = [
  {
    label: 'Platform Console',
    showForRoles: [ROLES.SUPER_ADMIN],
    items: [
      { path: '/dashboard', label: 'Platform Overview', icon: LayoutDashboard },
      { path: '/dashboard/organizations', label: 'Organizations', icon: Building2 },
    ],
  },
  {
    label: 'Overview',
    showForRoles: [ROLES.ORG_ADMIN],
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'My Desk',
    showForRoles: [ROLES.COACH],
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'My Space',
    showForRoles: [ROLES.ATHLETE],
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Recruitment',
    showForRoles: [ROLES.ORG_ADMIN],
    requireAnyPermission: [PERMISSIONS.RECRUITMENT_VIEW],
    items: [
      { path: '/dashboard/recruitment', label: 'Dashboard', icon: LayoutDashboard, requirePermission: PERMISSIONS.RECRUITMENT_VIEW },
      { path: '/dashboard/recruitment/discover', label: 'Discovery', icon: Search, requirePermission: PERMISSIONS.RECRUITMENT_VIEW },
      { path: '/dashboard/recruitment/pipeline', label: 'Pipeline', icon: Briefcase, requirePermission: PERMISSIONS.RECRUITMENT_VIEW },
      { path: '/dashboard/recruitment/shortlists', label: 'Shortlists', icon: List, requirePermission: PERMISSIONS.RECRUITMENT_VIEW },
      { path: '/dashboard/recruitment/tasks', label: 'Tasks', icon: CheckSquare, requirePermission: PERMISSIONS.RECRUITMENT_VIEW },
    ],
  },
  {
    label: 'Directory',
    showForRoles: [ROLES.ORG_ADMIN, ROLES.COACH, ROLES.ATHLETE],
    requireAnyPermission: [PERMISSIONS.ORG_VIEW, PERMISSIONS.ATHLETE_VIEW, PERMISSIONS.COACH_VIEW],
    items: [
      { path: '/dashboard/teams', label: 'Teams & Squads', icon: Shield, showForRoles: [ROLES.COACH, ROLES.ORG_ADMIN, ROLES.SUPER_ADMIN, ROLES.ATHLETE] },
      { path: '/dashboard/athletes', label: 'Athletes', icon: Users, requirePermission: PERMISSIONS.ATHLETE_VIEW },
      { path: '/dashboard/coaches', label: 'Coaches', icon: GraduationCap, requirePermission: PERMISSIONS.COACH_VIEW },
      { path: '/dashboard/coach-assignments/dashboard', label: 'Coach Assignments', icon: CheckSquare, showForRoles: [ROLES.ORG_ADMIN] },
      { path: '/dashboard/my-organization', label: 'My Organization', icon: Building2, showForRoles: [ROLES.ORG_ADMIN] },
    ],
  },
  {
    label: 'Schedule',
    showForRoles: [ROLES.ORG_ADMIN, ROLES.COACH, ROLES.ATHLETE],
    items: [
      { path: '/dashboard/training', label: 'Training', icon: CalendarDays, requirePermission: PERMISSIONS.TRAINING_VIEW },
      { path: '/dashboard/training/attendance', label: 'Attendance', icon: CheckSquare, requirePermission: PERMISSIONS.TRAINING_VIEW },
      { path: '/dashboard/events', label: 'Events', icon: Trophy, requirePermission: PERMISSIONS.EVENT_VIEW },
      { path: '/dashboard/tournaments', label: 'Tournaments', icon: Trophy, requirePermission: PERMISSIONS.EVENT_VIEW, showForRoles: [ROLES.ORG_ADMIN, ROLES.SUPER_ADMIN, ROLES.COACH, ROLES.ATHLETE] },
      { path: '/dashboard/matches/calendar', label: 'Match Calendar', icon: Radio, requirePermission: PERMISSIONS.EVENT_VIEW, showForRoles: [ROLES.ORG_ADMIN, ROLES.SUPER_ADMIN, ROLES.COACH, ROLES.ATHLETE] },
    ],
  },
  {
    label: 'Data Hub',
    showForRoles: [ROLES.SUPER_ADMIN],
    items: [
      { path: '/dashboard/imports', label: 'Import & Allocate', icon: Download },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
  },
];
