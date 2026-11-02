import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useAuth } from '@/contexts/AuthContext';
import { athleteApi } from '@/api/athleteApi';
import { referenceApi } from '@/api/referenceApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Zod schema based strictly on AthleteRequestDTO
const athleteSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.string().min(1, 'Gender is required'),
  phone: z.string().optional().or(z.literal('')),
  sportId: z.string().min(1, 'Sport is required'),
  organizationId: z.string().optional().or(z.literal('')),
  status: z.string().min(1, 'Status is required'),
  medicalStatus: z.string().min(1, 'Medical status is required'),
  notes: z.string().optional().or(z.literal('')),
});

export default function AthleteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, currentRole } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState(null);

  const orgParam = searchParams.get('organizationId');
  const defaultOrgId = (currentUser && currentRole === 'ROLE_ORG_ADMIN' && currentUser.organizationId)
    ? String(currentUser.organizationId)
    : (orgParam || '');

  const form = useForm({
    resolver: zodResolver(athleteSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'Male',
      phone: '',
      sportId: '',
      organizationId: defaultOrgId,
      status: 'Active',
      medicalStatus: 'Fit',
      notes: '',
    },
  });

  // Reference Data
  const { data: sports = [] } = useQuery({
    queryKey: ['sports'],
    queryFn: referenceApi.getSports,
    staleTime: 5 * 60 * 1000,
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: referenceApi.getOrganizations,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch Existing Athlete
  const { data: existingAthlete, isLoading: isLoadingAthlete } = useQuery({
    queryKey: ['athlete', id],
    queryFn: () => athleteApi.getAthleteById(id),
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingAthlete) {
      form.reset({
        firstName: existingAthlete.firstName || '',
        lastName: existingAthlete.lastName || '',
        dateOfBirth: existingAthlete.dateOfBirth || '',
        gender: existingAthlete.gender || 'Male',
        phone: existingAthlete.phone || '',
        sportId: existingAthlete.sport?.id ? String(existingAthlete.sport.id) : '',
        organizationId: existingAthlete.organizationId ? String(existingAthlete.organizationId) : '',
        status: existingAthlete.status || 'Active',
        medicalStatus: existingAthlete.medicalStatus || 'Fit',
        notes: existingAthlete.notes || '',
      });
    } else if (defaultOrgId) {
      form.setValue('organizationId', defaultOrgId);
    }
  }, [existingAthlete, form, defaultOrgId]);

  const mutation = useMutation({
    mutationFn: (data) => isEditing ? athleteApi.updateAthlete(id, data) : athleteApi.createAthlete(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      if (isEditing) queryClient.invalidateQueries({ queryKey: ['athlete', id] });
      
      setSubmitted(true);
      setApiError(null);
      setTimeout(() => navigate('/dashboard/athletes'), 1500);
    },
    onError: (error) => {
      setApiError(error.response?.data?.message || error.message || 'Failed to save athlete.');
    }
  });

  const onSubmit = (values) => {
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      dateOfBirth: values.dateOfBirth || null,
      gender: values.gender,
      phone: values.phone || null,
      sportId: values.sportId ? parseInt(values.sportId, 10) : null,
      organizationId: values.organizationId ? parseInt(values.organizationId, 10) : null,
      status: values.status,
      medicalStatus: values.medicalStatus,
      notes: values.notes || null,
    };
    
    mutation.mutate(payload);
  };

  if (isEditing && isLoadingAthlete) {
    return (
      <div className="space-y-10 max-w-3xl mx-auto">
        <div className="flex items-center gap-5">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
        <Card className="card-premium">
          <CardContent className="p-10 space-y-10">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-3xl mx-auto page-enter">
      {/* Header */}
      <div className="flex items-center gap-5">
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => navigate('/dashboard/athletes')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? `Edit Athlete` : 'Register New Athlete'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? `Update details for ${existingAthlete?.fullName || 'the athlete'}` : 'Fill in the details to register a new athlete.'}
          </p>
        </div>
      </div>

      {submitted && (
        <Card className="border-green-200 bg-green-50 card-premium">
          <CardContent className="p-6 flex items-center gap-4">
            <Badge className="bg-green-600">Success</Badge>
            <p className="text-green-800 font-medium">
              {isEditing ? 'Athlete details updated successfully!' : 'New athlete registered successfully!'}
            </p>
          </CardContent>
        </Card>
      )}

      {apiError && (
        <Card className="border-red-200 bg-red-50 card-premium">
          <CardContent className="p-6">
            <p className="text-red-800 font-medium">Error saving athlete:</p>
            <p className="text-red-700 text-sm mt-1">{apiError}</p>
          </CardContent>
        </Card>
      )}

      <Card className="card-premium">
        <CardContent className="p-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              {/* Personal Information */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} className="h-11 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Last name" {...field} className="h-11 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="h-11 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select gender" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} className="h-11 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Sport & Organization */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">Sport & Organization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="sportId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sport</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select sport" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sports.map((sport) => (
                              <SelectItem key={sport.id} value={String(sport.id)}>{sport.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="organizationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization</FormLabel>
                        {currentRole === 'ROLE_ORG_ADMIN' ? (
                          <div className="h-11 px-4 flex items-center rounded-xl bg-muted/50 border border-border/40 text-sm font-semibold text-foreground">
                            {currentUser?.organization?.name || organizations.find(o => String(o.id) === String(field.value))?.name || 'My Organization'}
                          </div>
                        ) : (
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select organization" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {organizations.map((org) => (
                                <SelectItem key={org.id} value={String(org.id)}>{org.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                            <SelectItem value="Injured">Injured</SelectItem>
                            <SelectItem value="Suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="medicalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Fit">Fit</SelectItem>
                            <SelectItem value="Under Review">Under Review</SelectItem>
                            <SelectItem value="Restricted">Restricted</SelectItem>
                            <SelectItem value="Recovering">Recovering</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Additional Notes */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">Additional Notes</h3>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          placeholder="Add any notes about the athlete (injuries, special requirements, etc.)" 
                          rows={5} 
                          className="rounded-xl" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" className="h-11 px-6 rounded-xl" onClick={() => navigate('/dashboard/athletes')} disabled={mutation.isPending}>
                  Cancel
                </Button>
                <Button type="submit" className="gap-2 h-11 px-6 rounded-xl" disabled={mutation.isPending}>
                  {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isEditing ? 'Save Changes' : 'Register Athlete'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
