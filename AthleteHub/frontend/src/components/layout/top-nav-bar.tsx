import React, { useState, useEffect } from 'react';
import { useNavigation } from '@/lib/navigation-store';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Search,
  Bell,
  Command,
  ChevronsUpDown,
  CircleDot,
  Trophy,
  LogOut,
  User,
  Settings,
  HelpCircle,
  Keyboard,
  Info,
  CheckCircle2,
  Menu,
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  CalendarDays,
  Radio,
  Plus,
  Sun,
  Moon,
  ChevronRight,
  Sparkles,
  Activity
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';

import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';

export function TopNavBar() {
  const { commandPaletteOpen, closeCommandPalette, mobileSidebarOpen, toggleMobileSidebar } = useNavigation();
  const { currentUser, currentRole, logout } = useAuth();
  const { isRole, can } = usePermissions();
  const { theme, setTheme, isDark } = useTheme();
  const canViewOrgs = isRole('SUPER_ADMIN') || isRole('ORG_ADMIN') || can('organization.view');
  const canRegisterAthlete = isRole('SUPER_ADMIN') || isRole('ORG_ADMIN') || can('athlete.create');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Dynamic live system notifications from real upcoming events and training sessions
  const { data: liveEvents } = useQuery({
    queryKey: ['nav-notifications-events'],
    queryFn: async () => {
      try {
        const res = await api.get('/events', { params: { pageSize: 3, page: 1, sortDir: 'desc' } });
        return res.data?.data?.items || res.data?.items || [];
      } catch {
        return [];
      }
    },
    staleTime: 60000,
  });

  const { data: liveSessions } = useQuery({
    queryKey: ['nav-notifications-sessions'],
    queryFn: async () => {
      try {
        const res = await api.get('/training-sessions', { params: { pageSize: 3, page: 1, sortDir: 'desc' } });
        return res.data?.data?.items || res.data?.items || [];
      } catch {
        return [];
      }
    },
    staleTime: 60000,
  });

  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);

  const notifications = React.useMemo(() => {
    const list: Array<{ id: string; title: string; time: string; unread: boolean; path?: string }> = [];
    
    if (liveEvents && liveEvents.length > 0) {
      liveEvents.forEach((ev: any) => {
        list.push({
          id: `ev-${ev.id}`,
          title: `Event: ${ev.name} (${ev.status || 'Active'})`,
          time: ev.startDate ? new Date(ev.startDate).toLocaleDateString() : 'Upcoming',
          unread: !readNotificationIds.includes(`ev-${ev.id}`),
          path: `/dashboard/events/${ev.id}`
        });
      });
    }

    if (liveSessions && liveSessions.length > 0) {
      liveSessions.forEach((sess: any) => {
        list.push({
          id: `sess-${sess.id}`,
          title: `Training: ${sess.title || sess.description || 'Scheduled Session'}`,
          time: sess.sessionDate || 'Scheduled',
          unread: !readNotificationIds.includes(`sess-${sess.id}`),
          path: `/dashboard/training-sessions/${sess.id}`
        });
      });
    }

    return list;
  }, [liveEvents, liveSessions, readNotificationIds]);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReadNotificationIds(notifications.map(n => n.id));
  };

  const handleNotificationClick = (n: { id: string; path?: string }) => {
    if (!readNotificationIds.includes(n.id)) {
      setReadNotificationIds(prev => [...prev, n.id]);
    }
    if (n.path) {
      navigate(n.path);
    }
  };

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    logout();
  };

  // Humanized breadcrumb parts
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const activeSection = pathSegments.length > 1 ? pathSegments[1].replace(/-/g, ' ') : 'Overview';
  const activeSubpage = pathSegments.length > 2 ? pathSegments[pathSegments.length - 1].replace(/-/g, ' ') : null;

  return (
    <>
      <header className="relative w-full h-16 border-b border-border/60 bg-card/40 dark:bg-card/25 backdrop-blur-xl px-6 lg:px-8 transition-colors flex items-center justify-between">
        <div className="flex items-center justify-between w-full gap-4">
          
          {/* Left section: Hamburger (Mobile) + Workspace Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger Menu (Mobile) */}
            <button
              onClick={toggleMobileSidebar}
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-muted/70 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <Menu className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Clean Breadcrumb Hierarchy */}
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span 
                onClick={() => navigate(`/dashboard/${pathSegments[1] || ''}`)}
                className="font-semibold text-muted-foreground hover:text-foreground transition-colors capitalize cursor-pointer tracking-tight"
              >
                {activeSection}
              </span>
              {activeSubpage && (
                <>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                  <span className="font-extrabold text-foreground capitalize tracking-tight px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs">
                    {activeSubpage}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Center: Command Spotlight Search Input */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-3 h-10 px-4 rounded-xl bg-background/60 dark:bg-black/25 border border-border/70 hover:border-primary/50 hover:bg-muted/30 text-muted-foreground transition-all w-[260px] lg:w-[380px] shadow-xs group"
          >
            <Search className="h-3.5 w-3.5 shrink-0 group-hover:text-primary transition-colors text-muted-foreground" />
            <span className="text-xs truncate font-medium">Search athletes, matches, stats...</span>
            <div className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/80 border border-border/80 text-[10px] font-mono font-semibold text-foreground/80 shadow-xs">
              <Command className="h-2.5 w-2.5" />
              <span>K</span>
            </div>
          </button>

          {/* Right Section: Theme Switch + Alerts + User Pill */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

            {/* Mobile Search Trigger */}
            <button 
              onClick={() => setSearchOpen(true)} 
              className="md:hidden h-9 w-9 rounded-xl bg-muted/40 flex items-center justify-center hover:bg-muted/70 transition-colors border border-border/50"
            >
              <Search className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Direct Theme Switcher (Light / Dark One-Click Toggle) */}
            <button
              onClick={() => {
                const nextTheme = isDark ? 'light' : 'dark';
                setTheme(nextTheme);
                toast.success(`Theme switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
              }}
              className="relative h-9 w-9 rounded-xl hover:bg-muted/80 bg-muted/40 border border-border/50 flex items-center justify-center transition-all hover:scale-105 active:scale-95 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400 transition-transform group-hover:rotate-45" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-500 transition-transform group-hover:-rotate-12" />
              )}
            </button>

            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative h-9 w-9 rounded-xl hover:bg-muted/80 bg-muted/40 border border-border/50 flex items-center justify-center transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow-xs">
                        {unreadCount}
                      </span>
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden rounded-2xl border border-border/60 shadow-xl">
                <div className="px-4 py-3 border-b flex items-center justify-between bg-muted/30">
                  <div>
                    <p className="font-bold text-sm">System Alerts</p>
                    <p className="text-xs text-muted-foreground">{unreadCount} unread events</p>
                  </div>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={handleMarkAllAsRead} title="Mark all as read">
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <DropdownMenuItem 
                        key={n.id} 
                        onClick={() => handleNotificationClick(n)}
                        className="px-4 py-3 flex items-start gap-3 cursor-pointer rounded-none border-b last:border-b-0 focus:bg-muted/50 transition-colors"
                      >
                        {n.unread ? (
                          <CircleDot className="h-3 w-3 text-primary mt-1 shrink-0" />
                        ) : (
                          <div className="h-3 w-3 mt-1 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-xs truncate", n.unread ? "font-semibold text-foreground" : "font-medium text-muted-foreground")}>{n.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      <p className="text-sm font-medium">All caught up!</p>
                      <p className="text-xs">No active notifications</p>
                    </div>
                  )}
                </div>
                <div className="border-t p-1 bg-muted/10">
                  <Button variant="ghost" className="w-full text-xs h-8 justify-center rounded-xl" onClick={() => navigate('/dashboard/notifications')}>
                    View all notifications
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Executive User Pill with Active Status */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 h-10 pl-1.5 pr-3 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/60 hover:border-primary/40 transition-all shadow-xs group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <div className="relative">
                    <Avatar className="h-7 w-7 border-2 border-primary/30 shadow-xs">
                      <AvatarFallback className="text-[10px] font-bold bg-gradient-to-tr from-primary to-blue-600 text-primary-foreground">
                        {currentUser?.name?.substring(0, 2).toUpperCase() || 'AH'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-card"></span>
                  </div>
                  <div className="hidden md:flex flex-col items-start justify-center text-left min-w-0">
                    <span className="font-bold text-xs truncate leading-none text-foreground group-hover:text-primary transition-colors">
                      {currentUser?.name || 'User'}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate leading-none mt-1 font-mono">
                      {currentRole?.replace('ROLE_', '') || 'USER'}
                    </span>
                  </div>
                  <ChevronsUpDown className="h-3 w-3 text-muted-foreground/60 group-hover:text-foreground shrink-0 transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-1.5 rounded-2xl border border-border/60 shadow-xl" sideOffset={8}>
                {/* User Card */}
                <div className="px-3 py-3 flex items-start gap-3 bg-muted/30 rounded-xl mb-1 border border-border/40">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
                      {currentUser?.name?.substring(0, 2).toUpperCase() || 'AH'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 min-w-0 flex-1">
                    <p className="text-sm font-bold leading-none truncate text-foreground">{currentUser?.name || 'User'}</p>
                    <div className="flex items-center">
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 font-mono uppercase bg-background">
                        {currentRole?.replace('_', ' ') || 'USER'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-none truncate">
                      {currentUser?.orgInfo?.organization || currentUser?.email || 'user@athletehub.io'}
                    </p>
                  </div>
                </div>
                
                <DropdownMenuSeparator />
                
                {/* Account */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold px-2 label-caps">Account Center</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate('/dashboard/profile')} className="cursor-pointer rounded-xl text-xs py-2">
                    <User className="mr-2 h-3.5 w-3.5 text-primary" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard/settings')} className="cursor-pointer rounded-xl text-xs py-2">
                    <Settings className="mr-2 h-3.5 w-3.5 text-primary" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                
                <DropdownMenuSeparator />

                {/* Danger Zone */}
                <DropdownMenuItem 
                  className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer rounded-xl text-xs py-2"
                  onClick={() => setShowLogoutDialog(true)}
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out of AthleteHub? You will need to log in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutConfirm} className="bg-red-600 hover:bg-red-700 text-white">
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Command Palette Dialog */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search athletes, coaches, organizations, events..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => { navigate('/dashboard'); setSearchOpen(false); }}>
              <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" /> Dashboard
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/dashboard/athletes'); setSearchOpen(false); }}>
              <Users className="mr-2 h-4 w-4 text-muted-foreground" /> Athletes
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/dashboard/coaches'); setSearchOpen(false); }}>
              <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" /> Coaches
            </CommandItem>
            {canViewOrgs && (
              <CommandItem onSelect={() => { navigate('/dashboard/organizations'); setSearchOpen(false); }}>
                <Building2 className="mr-2 h-4 w-4 text-muted-foreground" /> Organizations
              </CommandItem>
            )}
            <CommandItem onSelect={() => { navigate('/dashboard/training'); setSearchOpen(false); }}>
              <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /> Training
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/dashboard/teams'); setSearchOpen(false); }}>
              <Users className="mr-2 h-4 w-4 text-muted-foreground" /> Teams & Squads
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/dashboard/events'); setSearchOpen(false); }}>
              <Trophy className="mr-2 h-4 w-4 text-muted-foreground" /> Events
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/dashboard/matches/calendar'); setSearchOpen(false); }}>
              <Radio className="mr-2 h-4 w-4 text-muted-foreground" /> Live Matches
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/dashboard/profile'); setSearchOpen(false); }}>
              <Settings className="mr-2 h-4 w-4 text-muted-foreground" /> My Profile & Settings
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick Actions">
            {canRegisterAthlete && (
              <CommandItem onSelect={() => { navigate('/dashboard/athletes/new'); setSearchOpen(false); }}>
                <Plus className="mr-2 h-4 w-4 text-muted-foreground" /> Register New Athlete
              </CommandItem>
            )}
            <CommandItem onSelect={() => { navigate('/dashboard/tournaments'); setSearchOpen(false); }}>
              <Trophy className="mr-2 h-4 w-4 text-muted-foreground" /> View Tournaments
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}


