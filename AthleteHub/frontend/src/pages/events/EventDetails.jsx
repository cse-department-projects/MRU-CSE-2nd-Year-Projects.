import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventApi } from '../../api/eventApi';
import api from '../../api/axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Trophy, 
  Users, 
  CalendarDays, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  UserPlus, 
  XCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isRole, ROLES } = usePermissions();
  const { currentUser } = useAuth();

  const isAthlete = currentUser?.role === 'ROLE_ATHLETE';
  const canManageEvent = isRole(ROLES.ORG_ADMIN) || isRole(ROLES.SUPER_ADMIN);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinRemarks, setJoinRemarks] = useState('');
  const [registering, setRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventApi.getEventById(id).then((res) => res.data?.data || res.data),
  });

  // Current athlete profile if logged in
  const { data: myAthleteProfile } = useQuery({
    queryKey: ['myAthleteProfile'],
    queryFn: async () => {
      try {
        const res = await api.get('/athletes/me');
        return res.data?.data || res.data;
      } catch (e) {
        return null;
      }
    },
    enabled: isAthlete
  });

  // Fetch current athlete's registration for this event
  const { data: myEventRegistration, refetch: refetchMyReg } = useQuery({
    queryKey: ['myEventRegistration', id],
    queryFn: async () => {
      try {
        const res = await eventApi.getMyEventRegistration(id);
        return res.data || null;
      } catch (e) {
        return null;
      }
    },
    enabled: isAthlete
  });

  // Fetch all registrations for this event
  const { data: registrationsData, refetch: refetchRegistrations } = useQuery({
    queryKey: ['eventRegistrations', id],
    queryFn: async () => {
      try {
        const res = await eventApi.getEventRegistrations(id, { pageSize: 100 });
        return res.data?.items || res.items || res.data || [];
      } catch (e) {
        return [];
      }
    }
  });

  const registrations = Array.isArray(registrationsData) ? registrationsData : [];

  const deleteMutation = useMutation({
    mutationFn: () => eventApi.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('/dashboard/events');
    },
  });

  const startMutation = useMutation({
    mutationFn: () => eventApi.startEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success("Event started successfully!");
    },
  });

  const endMutation = useMutation({
    mutationFn: () => eventApi.endEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success("Event completed successfully!");
    },
  });

  const startRegMutation = useMutation({
    mutationFn: () => eventApi.startRegistration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success("Registrations opened for this event!");
    },
  });

  const endRegMutation = useMutation({
    mutationFn: () => eventApi.endRegistration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success("Registrations closed for this event.");
    },
  });

  // Athlete joins event
  const handleJoinEvent = async (e) => {
    e.preventDefault();
    setRegistering(true);
    try {
      await eventApi.registerForEvent(id, {
        remarks: joinRemarks || 'Athlete joined event via portal'
      });
      toast.success("Congratulations! You have joined this event successfully.");
      setShowJoinModal(false);
      setJoinRemarks('');
      refetchMyReg();
      refetchRegistrations();
      queryClient.invalidateQueries({ queryKey: ['myEventRegistration', id] });
      queryClient.invalidateQueries({ queryKey: ['eventRegistrations', id] });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to join event");
    } finally {
      setRegistering(false);
    }
  };

  // Athlete withdraws
  const handleWithdrawEvent = async (regId) => {
    if (!window.confirm("Are you sure you want to withdraw from this event?")) return;
    try {
      await eventApi.withdrawEventRegistration(regId);
      toast.success("You have withdrawn from this event.");
      refetchMyReg();
      refetchRegistrations();
      queryClient.invalidateQueries({ queryKey: ['myEventRegistration', id] });
      queryClient.invalidateQueries({ queryKey: ['eventRegistrations', id] });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to withdraw");
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground font-semibold">Loading Event Details...</div>;
  if (error) return <div className="p-8 text-red-500 font-bold">Error: {error.message}</div>;
  if (!event) return <div className="p-8 text-center font-bold">Event not found.</div>;

  const canStartEvent = canManageEvent && event.status === 'UPCOMING';
  const canEndEvent = canManageEvent && event.status === 'ACTIVE';

  const todayStr = new Date().toISOString().split('T')[0];
  const isRegOpen = event.registrationStartDate && event.registrationEndDate 
    && todayStr >= event.registrationStartDate && todayStr <= event.registrationEndDate;

  const isEventClosed = event.status === 'COMPLETED' || event.status === 'ARCHIVED';

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 page-enter pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">{event.name || 'N/A'}</h1>
            <Badge variant="outline" className="font-bold text-xs uppercase px-2.5 py-0.5 border-primary/40 text-primary">
              {event.status || 'UPCOMING'}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <span>Host Organization: <strong className="text-foreground">{event.organizationName || 'AthleteHub'}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" /> {event.venue || 'Main Stadium'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Athlete Join Event Button */}
          {isAthlete && !myEventRegistration && !isEventClosed && (
            <Button
              onClick={() => setShowJoinModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl gap-2 shadow-md px-5 h-10"
            >
              <UserPlus className="h-4 w-4" /> Join Event
            </Button>
          )}

          {canManageEvent && (
            <>
              {isRegOpen ? (
                <Button
                  variant="outline"
                  className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10 rounded-xl"
                  onClick={() => endRegMutation.mutate()}
                  disabled={endRegMutation.isPending}
                >
                  {endRegMutation.isPending ? 'Closing...' : 'End Registrations'}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 rounded-xl"
                  onClick={() => startRegMutation.mutate()}
                  disabled={startRegMutation.isPending || isEventClosed}
                >
                  {startRegMutation.isPending ? 'Opening...' : 'Start Registrations'}
                </Button>
              )}

              {canStartEvent && (
                <Button
                  onClick={() => startMutation.mutate()}
                  disabled={startMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  {startMutation.isPending ? 'Starting...' : 'Start Event'}
                </Button>
              )}

              {canEndEvent && (
                <Button
                  variant="destructive"
                  onClick={() => endMutation.mutate()}
                  disabled={endMutation.isPending}
                  className="rounded-xl"
                >
                  {endMutation.isPending ? 'Ending...' : 'End Event'}
                </Button>
              )}

              <Link to={`/dashboard/events/${event.id}/edit`}>
                <Button variant="outline" className="rounded-xl">Edit Event</Button>
              </Link>
              <Button variant="destructive" className="rounded-xl" onClick={() => {
                if (window.confirm('Are you sure you want to delete this event?')) {
                  deleteMutation.mutate();
                }
              }} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Event'}
              </Button>
            </>
          )}

          <Link to="/dashboard/events">
            <Button variant="secondary" className="rounded-xl">Back to List</Button>
          </Link>
        </div>
      </div>

      {/* Athlete Event Participation Banner */}
      {isAthlete && (
        <Card className={`rounded-2xl border ${myEventRegistration ? 'border-primary/40 bg-primary/5' : 'border-border/60 bg-muted/20'} p-5 shadow-sm`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl ${myEventRegistration ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-foreground text-base">Your Event Participation</h3>
                  {myEventRegistration ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 font-bold text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1 inline" /> {myEventRegistration.status || 'REGISTERED'}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground">Not Registered</Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {myEventRegistration 
                    ? "🎉 You are officially registered for this event! You can participate in open track events and trials, or join a team for tournaments." 
                    : "Individual athletes can register directly to participate in this event and represent their organization."}
                </p>
                {myEventRegistration?.registrationCode && (
                  <p className="text-xs font-mono font-bold text-primary">Registration ID: {myEventRegistration.registrationCode}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {myEventRegistration ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleWithdrawEvent(myEventRegistration.id)}
                  className="rounded-xl text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  Withdraw Entry
                </Button>
              ) : !isEventClosed ? (
                <Button
                  onClick={() => setShowJoinModal(true)}
                  className="rounded-xl font-bold bg-primary text-primary-foreground gap-1.5 shadow-sm"
                >
                  <UserPlus className="h-4 w-4" /> Join Event Now
                </Button>
              ) : null}
            </div>
          </div>
        </Card>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/60 p-5 bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider">
            <span>Event Status</span>
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xl font-extrabold text-foreground mt-2">{event.status || 'UPCOMING'}</p>
          <p className="text-xs text-muted-foreground mt-1">{isRegOpen ? '🟢 Registrations Open' : '⚪ Registrations Closed'}</p>
        </Card>

        <Card className="rounded-2xl border-border/60 p-5 bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider">
            <span>Registered Athletes</span>
            <Users className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-2">{registrations.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Confirmed participants</p>
        </Card>

        <Card className="rounded-2xl border-border/60 p-5 bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider">
            <span>Registration Dates</span>
            <CalendarDays className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-sm font-bold text-foreground mt-2">{event.registrationStartDate || 'Open'}</p>
          <p className="text-xs text-muted-foreground">to {event.registrationEndDate || 'TBD'}</p>
        </Card>

        <Card className="rounded-2xl border-border/60 p-5 bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold uppercase tracking-wider">
            <span>Event Dates</span>
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-sm font-bold text-foreground mt-2">{event.eventStartDate || 'TBD'}</p>
          <p className="text-xs text-muted-foreground">to {event.eventEndDate || 'TBD'}</p>
        </Card>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('overview')}
          className="rounded-xl font-bold text-xs"
        >
          Event Overview
        </Button>
        <Button
          variant={activeTab === 'athletes' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('athletes')}
          className="rounded-xl font-bold text-xs flex items-center gap-2"
        >
          <Users className="h-3.5 w-3.5" /> Registered Athletes ({registrations.length})
        </Button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-card shadow-sm border border-border/60 rounded-3xl p-6">
            <h2 className="text-lg font-bold mb-4">Event Details & Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div><p className="text-muted-foreground text-xs font-bold uppercase">Event Code</p><p className="font-semibold text-foreground mt-1">{event.eventCode || 'N/A'}</p></div>
              <div><p className="text-muted-foreground text-xs font-bold uppercase">Event Type</p><p className="font-semibold text-foreground mt-1">{event.eventType || 'Open Championship'}</p></div>
              <div><p className="text-muted-foreground text-xs font-bold uppercase">Organization</p><p className="font-semibold text-foreground mt-1">{event.organizationName || 'N/A'}</p></div>
              <div><p className="text-muted-foreground text-xs font-bold uppercase">Venue / Stadium</p><p className="font-semibold text-foreground mt-1">{event.venue || 'Main Arena / Ground'}</p></div>
              <div><p className="text-muted-foreground text-xs font-bold uppercase">City & State</p><p className="font-semibold text-foreground mt-1">{event.city ? `${event.city}, ${event.state || ''}` : 'Location TBA'}</p></div>
              <div><p className="text-muted-foreground text-xs font-bold uppercase">Country</p><p className="font-semibold text-foreground mt-1">{event.country || 'Global'}</p></div>
            </div>
            {event.description && (
              <div className="mt-6 pt-6 border-t border-border/50">
                <p className="text-muted-foreground text-xs font-bold uppercase mb-2">Description</p>
                <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">{event.description}</p>
              </div>
            )}
          </div>

          {/* Tournaments banner */}
          <div className="bg-card shadow-sm border border-border/60 rounded-3xl p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">Tournaments & Team Brackets</h2>
                <p className="text-muted-foreground text-xs mt-1">Tournaments under this event are team-based competitions managed by coaches.</p>
              </div>
              <div className="flex items-center gap-2">
                {canManageEvent && (
                  <Link to={`/dashboard/tournaments/new?eventId=${event.id}`}>
                    <Button size="sm" className="rounded-xl font-bold">
                      Add Tournament
                    </Button>
                  </Link>
                )}
                <Link to={`/dashboard/tournaments?eventId=${event.id}`}>
                  <Button size="sm" variant="outline" className="rounded-xl gap-1">
                    View Tournaments <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Registered Athletes */}
      {activeTab === 'athletes' && (
        <Card className="rounded-3xl border border-border/60 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/50 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg font-bold">Registered Athletes</CardTitle>
              <CardDescription>Individual athletes registered to participate in this event</CardDescription>
            </div>
            {isAthlete && !myEventRegistration && !isEventClosed && (
              <Button onClick={() => setShowJoinModal(true)} size="sm" className="rounded-xl font-bold gap-2">
                <UserPlus className="h-4 w-4" /> Join Event
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {registrations.length === 0 ? (
              <div className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center">
                <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="font-bold text-foreground text-base">No Athletes Registered Yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Athletes can click "Join Event" to enroll and participate.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 border-b border-border/50 text-xs font-bold text-muted-foreground uppercase">
                    <tr>
                      <th className="py-3 px-4">Reg Code</th>
                      <th className="py-3 px-4">Athlete</th>
                      <th className="py-3 px-4">Gender & Age</th>
                      <th className="py-3 px-4">Sport</th>
                      <th className="py-3 px-4">Registration Date</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {registrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs font-bold text-primary">
                          {reg.registrationCode || `EVREG-${reg.id}`}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-foreground">{reg.athleteName || `Athlete #${reg.athleteId}`}</div>
                          {reg.athleteCode && <div className="text-xs text-muted-foreground">{reg.athleteCode}</div>}
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {reg.gender || 'N/A'}{reg.age ? ` • ${reg.age}y` : ''}
                        </td>
                        <td className="py-3 px-4 text-xs font-medium text-foreground">
                          {reg.primarySport || 'General'}
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {reg.registrationDate ? reg.registrationDate.split('T')[0] : 'Recent'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 font-semibold text-xs">
                            {reg.status || 'APPROVED'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Join Event Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <Card className="w-full max-w-lg rounded-3xl border border-border shadow-2xl p-6 sm:p-8 space-y-6 bg-card">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                  <UserPlus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Join Event</h3>
                  <p className="text-xs text-muted-foreground">Register your athlete profile for this event</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowJoinModal(false)} className="rounded-full">
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleJoinEvent} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Athlete Profile</Label>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-sm font-semibold text-foreground flex items-center justify-between">
                  <span>{myAthleteProfile ? `${myAthleteProfile.firstName} ${myAthleteProfile.lastName} (${myAthleteProfile.athleteCode || `ATH-${myAthleteProfile.id}`})` : currentUser?.full_name}</span>
                  {myAthleteProfile?.gender && (
                    <Badge variant="outline" className="text-xs">{myAthleteProfile.gender}</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Participation Notes / Events of Interest</Label>
                <Textarea
                  id="remarks"
                  placeholder="e.g. 100m sprint, trial participation, coach notes..."
                  value={joinRemarks}
                  onChange={(e) => setJoinRemarks(e.target.value)}
                  className="rounded-2xl min-h-[90px] text-sm"
                />
              </div>

              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">Event Terms:</p>
                <p>By joining, you will be confirmed on the official roster for this host organization event.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowJoinModal(false)} className="rounded-xl px-5">
                  Cancel
                </Button>
                <Button type="submit" disabled={registering} className="rounded-xl px-6 font-bold">
                  {registering ? 'Joining...' : 'Confirm Registration'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
