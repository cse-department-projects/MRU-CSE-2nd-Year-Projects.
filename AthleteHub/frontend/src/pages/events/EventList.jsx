import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventApi } from '../../api/eventApi';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CalendarDays, 
  MapPin, 
  Search, 
  Users, 
  Plus, 
  Play, 
  StopCircle, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import { toast } from 'sonner';

const statusBadgeStyles = {
  UPCOMING: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  ACTIVE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  COMPLETED: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
  CANCELLED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  ARCHIVED: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
};

export default function EventList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentUser, currentRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const isOrgAdmin = ['ROLE_ORG_ADMIN', 'ROLE_SUPER_ADMIN'].includes(currentRole || currentUser?.role);

  const { data, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventApi.getEvents({}).then(res => res.data?.data?.items || res.data?.items || []),
  });

  const events = data || [];
  const statuses = ['all', 'UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

  // Lifecycle Mutations
  const startEventMutation = useMutation({
    mutationFn: (id) => eventApi.startEvent(id),
    onSuccess: () => {
      toast.success('Event started successfully! Event is now Active.');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to start event');
    }
  });

  const endEventMutation = useMutation({
    mutationFn: (id) => eventApi.endEvent(id),
    onSuccess: () => {
      toast.success('Event ended successfully! Event marked as Completed.');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to end event');
    }
  });

  const startRegistrationMutation = useMutation({
    mutationFn: (id) => eventApi.startRegistration(id),
    onSuccess: () => {
      toast.success('Registrations opened! Athletes and coaches can now register.');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to open registrations');
    }
  });

  const endRegistrationMutation = useMutation({
    mutationFn: (id) => eventApi.endRegistration(id),
    onSuccess: () => {
      toast.success('Registrations closed! No further athlete entries allowed.');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to close registrations');
    }
  });

  const isActionPending = startEventMutation.isPending || endEventMutation.isPending || 
                          startRegistrationMutation.isPending || endRegistrationMutation.isPending;

  const handleStartEvent = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to start this event? Its status will become Active.')) {
      startEventMutation.mutate(id);
    }
  };

  const handleEndEvent = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to end this event? It will be marked as Completed.')) {
      endEventMutation.mutate(id);
    }
  };

  const handleStartRegistration = (e, id) => {
    e.stopPropagation();
    startRegistrationMutation.mutate(id);
  };

  const handleEndRegistration = (e, id) => {
    e.stopPropagation();
    endRegistrationMutation.mutate(id);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const getRegistrationState = (event) => {
    if (!event.registrationStartDate || !event.registrationEndDate) {
      return { label: 'Registration Closed', status: 'CLOSED', style: 'bg-muted text-muted-foreground' };
    }
    if (todayStr >= event.registrationStartDate && todayStr <= event.registrationEndDate) {
      return { label: 'Registration Open', status: 'OPEN', style: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
    }
    if (todayStr < event.registrationStartDate) {
      return { label: 'Registration Upcoming', status: 'UPCOMING', style: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
    }
    return { label: 'Registration Closed', status: 'CLOSED', style: 'bg-muted text-muted-foreground' };
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.venue?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) return <LoadingSpinner text="Loading events..." />;
  if (error) return <ErrorState title="Failed to load events" message={error.message} />;

  return (
    <div className="space-y-6 page-enter max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-up stagger-1">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Events Center</h1>
            <Badge variant="secondary" className="font-mono-telemetry font-bold px-2.5 py-0.5 text-xs">
              {filteredEvents.length} Events
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Coordinate multi-sport championships, manage registration windows, and launch tournaments.
          </p>
        </div>
        
        {isOrgAdmin && (
          <Button onClick={() => navigate('/dashboard/events/new')} className="shadow-sm rounded-xl h-10 px-5 gap-2 font-bold">
            <Plus className="h-4 w-4" /> Create Event
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <Card className="card-telemetry-elevated sticky top-[62px] z-10 border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events by name or venue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 rounded-xl pl-10 bg-background/80 text-sm border-border/60"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 rounded-xl w-full sm:w-56 text-sm">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Event Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => {
          const regState = getRegistrationState(event);
          const isRegOpen = regState.status === 'OPEN';

          return (
            <Card
              key={event.id}
              className="card-telemetry-elevated cursor-pointer group flex flex-col justify-between overflow-hidden border-border/60 hover:border-primary/50 transition-all shadow-sm hover:shadow-md"
              onClick={() => navigate(`/dashboard/events/${event.id}`)}
            >
              <CardHeader className="p-6 pb-3 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Badge variant="outline" className={`text-xs px-2.5 py-0.5 font-bold uppercase ${statusBadgeStyles[event.status] || ''}`}>
                    {event.status || 'UPCOMING'}
                  </Badge>
                  
                  <Badge variant="outline" className={`text-[11px] font-semibold px-2 py-0.5 ${regState.style}`}>
                    {regState.label}
                  </Badge>
                </div>
                
                <div>
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1" title={event.name}>
                    {event.name || 'Unnamed Event'}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium flex items-center gap-1.5 truncate">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{event.venue || 'Venue TBA'}</span>
                  </p>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-4 flex-1 flex flex-col justify-between">
                {event.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {event.description}
                  </p>
                )}

                {/* Dates Section: Registration Window & Event Dates */}
                <div className="space-y-2.5 text-xs pt-3 border-t border-border/40 bg-muted/10 p-3 rounded-xl border">
                  {/* 1. Registration Date */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                      <Users className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      Registration:
                    </span>
                    <span className="font-semibold text-foreground text-right">
                      {event.registrationStartDate || 'TBD'} to {event.registrationEndDate || 'TBD'}
                    </span>
                  </div>

                  {/* 2. Starting Date / Event Duration */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                      <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" />
                      Event Dates:
                    </span>
                    <span className="font-semibold text-foreground text-right">
                      {event.eventStartDate || 'TBD'} to {event.eventEndDate || 'TBD'}
                    </span>
                  </div>
                </div>

                {/* Organization & Detail Link */}
                <div className="text-[11px] text-muted-foreground pt-1 flex justify-between items-center">
                  <span className="font-semibold text-foreground/80">{event.organizationName || 'Host Organization'}</span>
                  <span className="text-primary font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Details <ArrowRight className="h-3 w-3" />
                  </span>
                </div>

                {/* Org Admin Lifecycle Controls */}
                {isOrgAdmin && (
                  <div className="pt-3 border-t border-border/50 space-y-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      {/* Registration Control Button */}
                      {isRegOpen ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs font-semibold rounded-lg border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 gap-1.5 flex-1"
                          onClick={(e) => handleEndRegistration(e, event.id)}
                          disabled={isActionPending}
                        >
                          <UserX className="h-3.5 w-3.5" /> End Registrations
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs font-semibold rounded-lg border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1.5 flex-1"
                          onClick={(e) => handleStartRegistration(e, event.id)}
                          disabled={isActionPending || event.status === 'COMPLETED' || event.status === 'CANCELLED'}
                        >
                          <UserCheck className="h-3.5 w-3.5" /> Start Registrations
                        </Button>
                      )}

                      {/* Event Lifecycle Control Button */}
                      {event.status === 'UPCOMING' && (
                        <Button
                          size="sm"
                          className="h-8 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 flex-1 shadow-xs"
                          onClick={(e) => handleStartEvent(e, event.id)}
                          disabled={isActionPending}
                        >
                          <Play className="h-3.5 w-3.5 fill-current" /> Start Event
                        </Button>
                      )}
                      {event.status === 'ACTIVE' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 text-xs font-bold rounded-lg gap-1.5 flex-1 shadow-xs"
                          onClick={(e) => handleEndEvent(e, event.id)}
                          disabled={isActionPending}
                        >
                          <StopCircle className="h-3.5 w-3.5" /> End Event
                        </Button>
                      )}
                      {event.status === 'COMPLETED' && (
                        <div className="h-8 text-xs font-semibold rounded-lg bg-gray-500/10 text-gray-500 border border-gray-500/20 flex-1 flex items-center justify-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              icon={CalendarDays}
              title="No events found"
              description="Try adjusting your filters, or create a new event."
              actionLabel="Create Event"
              onAction={() => navigate('/dashboard/events/new')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
