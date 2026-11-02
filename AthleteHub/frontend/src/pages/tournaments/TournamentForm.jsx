import React, { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tournamentApi } from '../../api/tournamentApi';
import { eventApi } from '../../api/eventApi';
import { referenceApi } from '../../api/referenceApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Activity, ArrowLeft, Save, Trophy, CalendarDays, MapPin, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  eventId: z.coerce.number().min(1, "Parent Event is required"),
  sportId: z.coerce.number().min(1, "Sport Discipline is required"),
  name: z.string().min(2, "Tournament Name must be at least 2 characters"),
  genderCategory: z.string().min(1, "Required"),
  ageCategory: z.string().optional().nullable(),
  maxParticipants: z.coerce.number().optional().nullable(),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().min(1, "End Date is required"),
  status: z.string().optional()
});

export default function TournamentForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);
  const paramEventId = searchParams.get('eventId');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventId: paramEventId ? Number(paramEventId) : '',
      sportId: '',
      name: '',
      genderCategory: 'ANY',
      ageCategory: 'OPEN',
      maxParticipants: null,
      startDate: '',
      endDate: '',
      status: 'UPCOMING'
    }
  });

  const selectedEventId = watch('eventId');

  // Fetch Events
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['events-selector'],
    queryFn: async () => {
      const response = await eventApi.getEvents({ pageSize: 100 });
      return response?.data?.items || response?.items || [];
    }
  });

  // Fetch Sports
  const { data: sportsData, isLoading: sportsLoading } = useQuery({
    queryKey: ['sports-selector'],
    queryFn: async () => {
      const sports = await referenceApi.getSports();
      return Array.isArray(sports) ? sports : (sports?.data || []);
    }
  });

  const eventsList = Array.isArray(eventsData) ? eventsData : [];
  const sportsList = Array.isArray(sportsData) ? sportsData : [];

  // Find the selected event object to showcase its name
  const currentEvent = eventsList.find(e => String(e.id) === String(selectedEventId || paramEventId));

  const { data: tournament, isLoading: tournamentLoading } = useQuery({
    queryKey: ['tournament', id],
    queryFn: async () => {
      const response = await tournamentApi.getTournamentById(id);
      return response.data?.data || response.data;
    },
    enabled: isEditMode
  });

  useEffect(() => {
    if (tournament) {
      setValue('name', tournament.name || '');
      setValue('eventId', tournament.eventId || tournament.event?.id || '');
      setValue('sportId', tournament.sportId || tournament.sport?.id || '');
      setValue('genderCategory', tournament.genderCategory || 'ANY');
      setValue('ageCategory', tournament.ageCategory || 'OPEN');
      setValue('maxParticipants', tournament.maxParticipants || null);
      setValue('startDate', tournament.startDate || '');
      setValue('endDate', tournament.endDate || '');
      setValue('status', tournament.status || 'UPCOMING');
    } else if (paramEventId) {
      setValue('eventId', Number(paramEventId));
    }
  }, [tournament, paramEventId, setValue]);

  // When event is selected and tournament dates are empty, automatically sync with event dates
  useEffect(() => {
    if (currentEvent && !isEditMode) {
      if (currentEvent.eventStartDate) setValue('startDate', currentEvent.eventStartDate);
      if (currentEvent.eventEndDate) setValue('endDate', currentEvent.eventEndDate);
    }
  }, [currentEvent, isEditMode, setValue]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEditMode) {
        return await tournamentApi.updateTournament(id, data);
      }
      return await tournamentApi.createTournament(data);
    },
    onSuccess: () => {
      toast.success(isEditMode ? 'Tournament updated successfully!' : 'Tournament created successfully!');
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      navigate('/dashboard/tournaments');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to save tournament');
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (isEditMode && tournamentLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-3">
        <Activity className="animate-spin text-primary h-8 w-8" />
        <p className="text-sm font-medium text-muted-foreground">Loading tournament details...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 page-enter">
      {/* Top Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/dashboard/tournaments')} 
          className="rounded-full h-10 w-10 border border-border/60 hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {isEditMode ? 'Edit Tournament' : 'Create Tournament'}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Setup a sport division, define categories, and link it under a parent event.
          </p>
        </div>
      </div>

      {mutation.isError && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-xl text-sm font-medium">
          {mutation.error?.response?.data?.message || mutation.error.message}
        </div>
      )}

      {/* Warning if no Events exist yet */}
      {!eventsLoading && eventsList.length === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 shrink-0" />
            <div>
              <p className="font-bold text-sm">No Active Events Found</p>
              <p className="text-xs opacity-90 mt-0.5">Tournaments must belong to an Event meet. Please create an Event first.</p>
            </div>
          </div>
          <Link to="/dashboard/events/new">
            <Button size="sm" className="rounded-xl gap-1.5 font-bold shrink-0">
              <Plus className="h-4 w-4" /> Create Event First
            </Button>
          </Link>
        </div>
      )}

      <Card className="card-premium rounded-2xl border-border/50 shadow-md">
        <CardHeader className="bg-muted/20 border-b border-border/50 pb-6">
          <CardTitle className="text-lg font-bold">Tournament Configuration</CardTitle>
          <CardDescription>Select the parent event and sport discipline to create brackets.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Row 1: Parent Event (Named Display & Selection) */}
            <div className="space-y-2">
              <Label htmlFor="eventId" className="text-sm font-bold text-foreground flex items-center justify-between">
                <span>Parent Event <span className="text-destructive">*</span></span>
                {currentEvent && (
                  <span className="text-xs text-muted-foreground font-normal">
                    Dates: {currentEvent.eventStartDate} to {currentEvent.eventEndDate || 'TBD'}
                  </span>
                )}
              </Label>
              
              {paramEventId && currentEvent ? (
                /* Showcase Event Name prominently when navigated from an event */
                <div className="flex h-12 w-full items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-2">
                  <div className="flex items-center gap-2.5 truncate">
                    <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-bold text-sm text-foreground truncate">{currentEvent.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 shrink-0">
                    Linked Event
                  </Badge>
                </div>
              ) : (
                /* Clean Event Selector with Event Names */
                <select
                  id="eventId"
                  {...register('eventId')}
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">-- Choose Host Event --</option>
                  {eventsList.map(ev => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} {ev.venue ? `(${ev.venue})` : ''} • {ev.eventStartDate ? `${ev.eventStartDate}` : ''}
                    </option>
                  ))}
                </select>
              )}
              {errors.eventId && <p className="text-xs text-destructive mt-1">{errors.eventId.message}</p>}
            </div>

            {/* Row 2: Tournament Name & Sport Discipline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-bold text-foreground">
                  Tournament Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="e.g. Men's Badminton Singles Championship"
                  className="h-11 rounded-xl"
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sportId" className="text-sm font-bold text-foreground">
                  Sport Discipline <span className="text-destructive">*</span>
                </Label>
                <select
                  id="sportId"
                  {...register('sportId')}
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">-- Choose Sport --</option>
                  {sportsList.map(sp => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name} {sp.category ? `• ${sp.category}` : ''}
                    </option>
                  ))}
                </select>
                {errors.sportId && <p className="text-xs text-destructive mt-1">{errors.sportId.message}</p>}
              </div>
            </div>

            {/* Row 3: Division Categories (Gender & Age) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="genderCategory" className="text-sm font-bold text-foreground">
                  Gender Division
                </Label>
                <select
                  id="genderCategory"
                  {...register('genderCategory')}
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="ANY">Open / Any</option>
                  <option value="MEN">Men</option>
                  <option value="WOMEN">Women</option>
                  <option value="MIXED">Mixed</option>
                </select>
                {errors.genderCategory && <p className="text-xs text-destructive mt-1">{errors.genderCategory.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ageCategory" className="text-sm font-bold text-foreground">
                  Age Category
                </Label>
                <select
                  id="ageCategory"
                  {...register('ageCategory')}
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="OPEN">Open (All Ages)</option>
                  <option value="UNDER_19">Under-19 (Junior)</option>
                  <option value="UNDER_23">Under-23 (Collegiate)</option>
                  <option value="SENIOR">Senior / Professional</option>
                </select>
              </div>
            </div>

            {/* Row 4: Capacity & Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="maxParticipants" className="text-sm font-bold text-foreground">
                  Max Capacity / Participant Limit
                </Label>
                <Input
                  type="number"
                  id="maxParticipants"
                  {...register('maxParticipants')}
                  placeholder="Leave empty for unlimited"
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-bold text-foreground">
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  id="startDate"
                  {...register('startDate')}
                  className="h-11 rounded-xl"
                />
                {errors.startDate && <p className="text-xs text-destructive mt-1">{errors.startDate.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-bold text-foreground">
                  End Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  id="endDate"
                  {...register('endDate')}
                  className="h-11 rounded-xl"
                />
                {errors.endDate && <p className="text-xs text-destructive mt-1">{errors.endDate.message}</p>}
              </div>
            </div>

            {/* Edit Mode Status */}
            {isEditMode && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="status" className="text-sm font-bold text-foreground">
                  Tournament Status
                </Label>
                <select
                  id="status"
                  {...register('status')}
                  className="flex h-11 w-full max-w-xs items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="UPCOMING">Upcoming</option>
                  <option value="ACTIVE">Active / Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/50">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/dashboard/tournaments')} 
                className="rounded-xl h-11 px-6 font-semibold"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={mutation.isPending} 
                className="rounded-xl h-11 px-8 font-bold gap-2 shadow-sm"
              >
                {mutation.isPending ? <Activity className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                {isEditMode ? 'Save Changes' : 'Create Tournament'}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
