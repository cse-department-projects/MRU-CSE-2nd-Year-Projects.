import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationApi } from '../../api/organizationApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, UserCheck, AlertCircle } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'Organization Name is required'),
  organization_type_id: z.coerce.number().min(1, 'Organization Type is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Invalid phone number (minimum 7 digits)').max(20),
  website: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  address_line: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
});

export default function OrganizationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);
  const [selectedAdminId, setSelectedAdminId] = React.useState('none');
  const [apiError, setApiError] = React.useState(null);

  const { data: orgData, isLoading } = useQuery({
    queryKey: ['organization', id],
    queryFn: () => organizationApi.getOrganizationById(id),
    enabled: isEdit,
  });

  const { data: orgTypesRes } = useQuery({
    queryKey: ['organizationTypes'],
    queryFn: () => organizationApi.getOrganizationTypes(),
  });
  const orgTypes = orgTypesRes?.data || [];

  const { data: unassignedAdminsRes } = useQuery({
    queryKey: ['unassignedAdmins'],
    queryFn: () => organizationApi.getUnassignedAdmins(),
    enabled: !isEdit,
  });
  const unassignedAdmins = unassignedAdminsRes?.data || [];

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      organization_type_id: '',
      email: '',
      phone: '',
      website: '',
      description: '',
      address_line: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
    },
  });

  useEffect(() => {
    if (orgData?.data) {
      const org = orgData.data;
      form.reset({
        name: org.name || '',
        organization_type_id: org.organization_type?.id || '',
        email: org.email || '',
        phone: org.phone || '',
        website: org.website || '',
        description: org.description || '',
        address_line: org.address?.line || '',
        city: org.address?.city || '',
        state: org.address?.state || '',
        country: org.address?.country || '',
        postal_code: org.address?.postal_code || '',
      });
    }
  }, [orgData, form]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) {
        return organizationApi.updateOrganization(id, data);
      } else {
        const res = await organizationApi.createOrganization(data);
        const newOrg = res?.data || res;
        const newOrgId = newOrg?.id;
        if (selectedAdminId && selectedAdminId !== 'none' && newOrgId) {
          try {
            await organizationApi.assignOrganizationAdmin(newOrgId, { userId: Number(selectedAdminId) });
          } catch (e) {
            console.error('Failed to link administrator during creation', e);
          }
        }
        return res;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['unassignedAdmins'] });
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ['organization', id] });
      }
      navigate('/dashboard/organizations');
    },
    onError: (error) => {
      console.error('Failed to save organization', error);
      const serverMsg = error.response?.data?.message;
      const errorList = error.response?.data?.errors;
      if (errorList && Array.isArray(errorList) && errorList.length > 0) {
        setApiError(errorList.join(', '));
      } else if (serverMsg) {
        setApiError(serverMsg);
      } else {
        setApiError(error.message || 'An error occurred while saving the organization.');
      }
    },
  });

  const onSubmit = (data) => {
    setApiError(null);
    let formattedWebsite = data.website?.trim() || undefined;
    if (formattedWebsite && !/^https?:\/\//i.test(formattedWebsite)) {
      formattedWebsite = `https://${formattedWebsite}`;
    }
    const payload = {
      ...data,
      organization_type_id: Number(data.organization_type_id),
      website: formattedWebsite,
      description: data.description?.trim() || undefined,
    };
    mutation.mutate(payload);
  };

  const onInvalid = (errors) => {
    const errorFields = Object.keys(errors);
    if (errorFields.length > 0) {
      setApiError('Please resolve the highlighted validation errors before submitting.');
    }
  };

  if (isEdit && isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading organization...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-5">
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => navigate('/dashboard/organizations')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isEdit ? 'Edit Organization' : 'Create Organization'}</h1>
          <p className="text-muted-foreground mt-1">Fill out the details below to {isEdit ? 'update' : 'create'} an organization.</p>
        </div>
      </div>

      {apiError && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-destructive" />
          <span className="font-medium">{apiError}</span>
        </div>
      )}

      <Card className="card-premium">
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name *</Label>
                <Input id="name" {...form.register('name')} placeholder="Enter organization name" />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization_type_id">Organization Type *</Label>
                <Select
                  value={form.watch('organization_type_id') ? String(form.watch('organization_type_id')) : ''}
                  onValueChange={(val) => form.setValue('organization_type_id', Number(val), { shouldValidate: true })}
                >
                  <SelectTrigger id="organization_type_id">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {orgTypes.length > 0 ? (
                      orgTypes.map((type) => (
                        <SelectItem key={type.id} value={String(type.id)}>
                          {type.name}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="1">University</SelectItem>
                        <SelectItem value="2">Sports Academy</SelectItem>
                        <SelectItem value="3">School</SelectItem>
                        <SelectItem value="4">Club</SelectItem>
                        <SelectItem value="5">Federation</SelectItem>
                        <SelectItem value="6">State Association</SelectItem>
                        <SelectItem value="7">Government Sports Center</SelectItem>
                        <SelectItem value="8">Private Training Center</SelectItem>
                        <SelectItem value="9">Other</SelectItem>
                        <SelectItem value="10">High School</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                {form.formState.errors.organization_type_id && (
                  <p className="text-sm text-destructive">{form.formState.errors.organization_type_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" type="email" {...form.register('email')} placeholder="contact@organization.com" />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" {...form.register('phone')} placeholder="+91 98765 43210" />
                {form.formState.errors.phone && (
                  <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input id="website" {...form.register('website')} placeholder="www.example.com" />
                {form.formState.errors.website && (
                  <p className="text-sm text-destructive">{form.formState.errors.website.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea id="description" {...form.register('description')} rows={3} placeholder="Brief summary of the organization..." />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Address Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address_line">Address Line *</Label>
                  <Input id="address_line" {...form.register('address_line')} placeholder="Street address / area" />
                  {form.formState.errors.address_line && (
                    <p className="text-sm text-destructive">{form.formState.errors.address_line.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" {...form.register('city')} placeholder="Enter city" />
                  {form.formState.errors.city && (
                    <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" {...form.register('state')} placeholder="Enter state" />
                  {form.formState.errors.state && (
                    <p className="text-sm text-destructive">{form.formState.errors.state.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input id="country" {...form.register('country')} placeholder="Enter country" />
                  {form.formState.errors.country && (
                    <p className="text-sm text-destructive">{form.formState.errors.country.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code *</Label>
                  <Input id="postal_code" {...form.register('postal_code')} placeholder="Enter postal code" />
                  {form.formState.errors.postal_code && (
                    <p className="text-sm text-destructive">{form.formState.errors.postal_code.message}</p>
                  )}
                </div>
              </div>
            </div>

            {!isEdit && (
              <div className="space-y-3 p-5 rounded-2xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Assign Organization Administrator (Optional)</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Select a registered account to immediately appoint as this organization's administrator upon creation.
                </p>
                <Select value={selectedAdminId} onValueChange={setSelectedAdminId}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="-- Select Unassigned Org Admin (Optional) --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- None / Assign Later --</SelectItem>
                    {unassignedAdmins.map((admin) => (
                      <SelectItem key={admin.id} value={String(admin.id)}>
                        {admin.fullName || admin.email} ({admin.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard/organizations')}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving Organization...' : isEdit ? 'Update Organization' : 'Create Organization'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
