import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { coachApi } from '../../api/coachApi';
import api from '../../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const coachSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  specialization: z.string().optional(),
  qualification: z.string().optional(),
  experienceYears: z.coerce.number().min(0).optional(),
  certifications: z.string().optional(),
  organizationId: z.preprocess((val) => (val === '' ? null : Number(val)), z.number().nullable().optional()),
});

export default function CoachForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, currentRole } = useAuth();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const [orgs, setOrgs] = useState([]);

  useEffect(() => {
    api.get('/organizations', { params: { page_size: 100 } })
      .then(res => setOrgs(res.data.items || res.data.data || []))
      .catch(console.error);
  }, []);

  const { data: coachData, isLoading: isCoachLoading } = useQuery({
    queryKey: ['coach', id],
    queryFn: () => coachApi.getCoachById(id),
    enabled: isEdit,
  });

  const orgParam = searchParams.get('organizationId');
  const defaultOrgId = (currentUser && currentRole === 'ROLE_ORG_ADMIN' && currentUser.organizationId)
    ? currentUser.organizationId
    : (orgParam ? parseInt(orgParam) : null);

  const form = useForm({
    resolver: zodResolver(coachSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: 'MALE',
      dateOfBirth: '',
      phone: '',
      email: '',
      specialization: '',
      qualification: '',
      experienceYears: 0,
      certifications: '',
      organizationId: defaultOrgId,
    },
  });

  useEffect(() => {
    if (coachData?.data) {
      const coach = coachData.data;
      form.reset({
        firstName: coach.firstName || '',
        lastName: coach.lastName || '',
        gender: coach.gender || 'MALE',
        dateOfBirth: coach.dateOfBirth || '',
        phone: coach.phone || '',
        email: coach.email || '',
        specialization: coach.specialization || '',
        qualification: coach.qualification || '',
        experienceYears: coach.experienceYears || 0,
        certifications: coach.certifications || '',
        organizationId: coach.organizationId || null,
      });
    } else if (defaultOrgId) {
      form.setValue('organizationId', defaultOrgId);
    }
  }, [coachData, form, defaultOrgId]);

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? coachApi.updateCoach({ id, data }) : coachApi.createCoach(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaches'] });
      navigate('/dashboard/coaches');
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (isEdit && isCoachLoading) {
    return <LoadingSpinner text="Loading coach details..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 page-enter">
      <div className="flex items-center gap-6">
        <Button
          variant="outline"
          className="h-10 px-4"
          onClick={() => navigate('/dashboard/coaches')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? 'Edit Coach' : 'Add Coach'}</h1>
          <p className="text-muted-foreground">{isEdit ? 'Update coach profile details' : 'Create a new coach profile'}</p>
        </div>
      </div>

      {mutation.isError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl mb-6">
          {mutation.error?.message || 'Operation failed'}
        </div>
      )}

      <Card className="card-premium">
        <CardContent className="p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name *</label>
                <Input {...form.register('firstName')} />
                {form.formState.errors.firstName && <p className="text-red-500 text-xs">{form.formState.errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name *</label>
                <Input {...form.register('lastName')} />
                {form.formState.errors.lastName && <p className="text-red-500 text-xs">{form.formState.errors.lastName.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" {...form.register('email')} />
                {form.formState.errors.email && <p className="text-red-500 text-xs">{form.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input type="tel" {...form.register('phone')} placeholder="e.g. +91 98765 43210" />
                {form.formState.errors.phone && <p className="text-red-500 text-xs">{form.formState.errors.phone.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth *</label>
                <Input type="date" {...form.register('dateOfBirth')} />
                {form.formState.errors.dateOfBirth && <p className="text-red-500 text-xs">{form.formState.errors.dateOfBirth.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender *</label>
                <select {...form.register('gender')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                {form.formState.errors.gender && <p className="text-red-500 text-xs">{form.formState.errors.gender.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Specialization</label>
                <Input {...form.register('specialization')} placeholder="e.g. Strength & Conditioning" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Experience (Years)</label>
                <Input type="number" min="0" {...form.register('experienceYears')} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Qualification</label>
              <Input {...form.register('qualification')} placeholder="e.g. B.S. Sports Science" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Certifications (Comma separated)</label>
              <Input {...form.register('certifications')} placeholder="e.g. CSCS, CPR/AED" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Organization</label>
              {currentRole === 'ROLE_ORG_ADMIN' ? (
                <div className="h-10 px-3 flex items-center rounded-md border border-input bg-muted/50 text-sm font-semibold text-foreground">
                  {currentUser?.organization?.name || orgs.find(o => o.id === defaultOrgId)?.name || 'My Organization'}
                </div>
              ) : (
                <select {...form.register('organizationId')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option value="">-- None --</option>
                  {orgs.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={mutation.isPending} className="min-w-[150px]">
                {mutation.isPending ? 'Saving...' : 'Save Coach'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
