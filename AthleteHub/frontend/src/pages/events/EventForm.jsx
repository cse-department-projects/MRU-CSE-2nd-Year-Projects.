import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventApi } from '../../api/eventApi';
import { referenceApi } from '../../api/referenceApi';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Save, Building2, Calendar, MapPin, Activity, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const eventSchema = z.object({
  name: z.string().min(2, 'Event Name must be at least 2 characters'),
  description: z.string().optional().nullable(),
  organizationId: z.coerce.number().min(1, 'Host Organization is required'),
  venue: z.string().min(1, 'Venue / Location is required'),
  registrationStartDate: z.string().min(1, 'Registration Start Date is required'),
  registrationEndDate: z.string().min(1, 'Registration End Date is required'),
  eventStartDate: z.string().min(1, 'Event Start Date is required'),
  eventEndDate: z.string().min(1, 'Event End Date is required'),
  status: z.string().optional().nullable(),
});

export default function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const queryClient = useQueryClient();
  const { currentUser, currentRole } = useAuth();

  const userOrgId = currentUser?.organizationId || currentUser?.organization?.id;
  const isOrgAdmin = ['ROLE_ORG_ADMIN', 'ROLE_SUPER_ADMIN'].includes(currentRole || currentUser?.role);

  useEffect(() => {
    if (!isOrgAdmin) {
      toast.error('Only organization administrators can create or edit events.');
      navigate('/dashboard/events', { replace: true });
    }
  }, [isOrgAdmin, navigate]);

  const { data: orgsData } = useQuery({
    queryKey: ['organizations-selector'],
    queryFn: async () => {
      const orgs = await referenceApi.getOrganizations();
      return Array.isArray(orgs) ? orgs : (orgs?.data || []);
    }
  });

  const organizations = Array.isArray(orgsData) ? orgsData : [];
  const currentOrg = organizations.find(o => o.id === userOrgId) || currentUser?.organization;

  const { data: eventData, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventApi.getEventById(id).then((res) => res.data?.data || res.data),
    enabled: isEditMode,
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: '',
      description: '',
      organizationId: userOrgId ? Number(userOrgId) : '',
      venue: '',
      registrationStartDate: '',
      registrationEndDate: '',
      eventStartDate: '',
      eventEndDate: '',
      status: 'UPCOMING'
    }
  });

  useEffect(() => {
    if (eventData) {
      reset({
        name: eventData.name || '',
        description: eventData.description || '',
        organizationId: eventData.organization?.id || eventData.organizationId || (userOrgId ? Number(userOrgId) : ''),
        venue: eventData.venue || '',
        registrationStartDate: eventData.registrationStartDate || '',
        registrationEndDate: eventData.registrationEndDate || '',
        eventStartDate: eventData.eventStartDate || '',
        eventEndDate: eventData.eventEndDate || '',
        status: eventData.status || 'UPCOMING'
      });
    } else if (userOrgId) {
      setValue('organizationId', Number(userOrgId));
    }
  }, [eventData, userOrgId, reset, setValue]);

  const mutation = useMutation({
    mutationFn: (data) => isEditMode ? eventApi.updateEvent(id, data) : eventApi.createEvent(data),
    onSuccess: () => {
      toast.success(isEditMode ? 'Event updated successfully!' : 'Event created successfully!');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('/dashboard/events');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to save event');
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (isEditMode && isLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-3">
        <Activity className="animate-spin text-primary h-8 w-8" />
        <p className="text-sm font-medium text-muted-foreground">Loading event details...</p>
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
          onClick={() => navigate('/dashboard/events')} 
          className="rounded-full h-10 w-10 border border-border/60 hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {isEditMode ? 'Edit Event' : 'Create New Event'}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Configure the championship, meet, or tournament festival for your organization.
          </p>
        </div>
      </div>

      {mutation.isError && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-xl text-sm font-medium">
          {mutation.error?.response?.data?.message || mutation.error.message}
        </div>
      )}

      <Card className="card-premium rounded-2xl border-border/50 shadow-md">
        <CardHeader className="bg-muted/20 border-b border-border/50 pb-6">
          <CardTitle className="text-lg font-bold">Event Setup</CardTitle>
          <CardDescription>Primary tournament meet information and schedule.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Row 1: Event Name & Host Organization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-bold text-foreground">
                  Event Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="e.g. Annual Inter-University Sports Fest 2026"
                  className="h-11 rounded-xl"
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationId" className="text-sm font-bold text-foreground">
                  Host Organization <span className="text-destructive">*</span>
                </Label>
                {isOrgAdmin ? (
                  <div className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-muted/40 px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 font-semibold text-foreground">
                      <Building2 className="h-4 w-4 text-primary" />
                      {currentOrg?.name || currentUser?.organization?.name || 'Your Organization'}
                    </span>
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                      Host
                    </Badge>
                  </div>
                ) : (
                  <select
                    id="organizationId"
                    {...register('organizationId')}
                    className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">-- Select Host Organization --</option>
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>
                        {org.name} {org.type ? `(${org.type})` : ''}
                      </option>
                    ))}
                  </select>
                )}
                {errors.organizationId && <p className="text-xs text-destructive mt-1">{errors.organizationId.message}</p>}
              </div>
            </div>

            {/* Row 2: Venue / Location */}
            <div className="space-y-2">
              <Label htmlFor="venue" className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" /> Venue / Location <span className="text-destructive">*</span>
              </Label>
              <Input
                id="venue"
                {...register('venue')}
                placeholder="e.g. University Main Sports Arena / Ground, Campus Track"
                className="h-11 rounded-xl"
              />
              {errors.venue && <p className="text-xs text-destructive mt-1">{errors.venue.message}</p>}
            </div>

            {/* Row 3: Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-bold text-foreground">
                Description / Overview Notes
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                rows={3}
                placeholder="Brief guidelines, tournament schedule guidelines, or participation eligibility..."
                className="rounded-xl text-sm"
              />
            </div>

            {/* Row 4: Dates Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Registration Window Card */}
              <div className="p-4 rounded-2xl border border-border/60 bg-muted/10 space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Registration Window</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground font-semibold">Start Date *</Label>
                    <Input type="date" {...register('registrationStartDate')} className="h-10 rounded-lg text-xs" />
                    {errors.registrationStartDate && <p className="text-[11px] text-destructive">{errors.registrationStartDate.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground font-semibold">End Date *</Label>
                    <Input type="date" {...register('registrationEndDate')} className="h-10 rounded-lg text-xs" />
                    {errors.registrationEndDate && <p className="text-[11px] text-destructive">{errors.registrationEndDate.message}</p>}
                  </div>
                </div>
              </div>

              {/* Event Duration Card */}
              <div className="p-4 rounded-2xl border border-border/60 bg-muted/10 space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Event Duration</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground font-semibold">Event Start Date *</Label>
                    <Input type="date" {...register('eventStartDate')} className="h-10 rounded-lg text-xs" />
                    {errors.eventStartDate && <p className="text-[11px] text-destructive">{errors.eventStartDate.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground font-semibold">Event End Date *</Label>
                    <Input type="date" {...register('eventEndDate')} className="h-10 rounded-lg text-xs" />
                    {errors.eventEndDate && <p className="text-[11px] text-destructive">{errors.eventEndDate.message}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 5: Status (Edit Mode) */}
            {isEditMode && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="status" className="text-sm font-bold text-foreground">
                  Event Status
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

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/50">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/dashboard/events')} 
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
                {isEditMode ? 'Save Changes' : 'Create Event'}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
