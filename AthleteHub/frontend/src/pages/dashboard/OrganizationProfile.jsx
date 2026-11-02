import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationApi } from '../../api/organizationApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, MapPin, Calendar, Users, Trophy, Shield, Mail, Phone, Plus, UserCheck, AlertCircle, Trash2 } from 'lucide-react';

const typeColors = {
  Club: 'bg-blue-100 text-blue-800 border-blue-200',
  Academy: 'bg-purple-100 text-purple-800 border-purple-200',
  Association: 'bg-green-100 text-green-800 border-green-200',
  University: 'bg-orange-100 text-orange-800 border-orange-200',
};

const statusColors = {
  Active: 'bg-green-100 text-green-800 border-green-200',
  Injured: 'bg-red-100 text-red-800 border-red-200',
  Inactive: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function OrganizationProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isRole, ROLES } = usePermissions();
  const isSuperAdmin = isRole(ROLES.SUPER_ADMIN);

  const [showAssignForm, setShowAssignForm] = React.useState(false);
  const [assignMode, setAssignMode] = React.useState('existing'); // 'existing' or 'new'
  
  // Existing Admin Assignment Form State
  const [selectedAdminId, setSelectedAdminId] = React.useState('');
  
  // New Admin Account Form State
  const [newAdminName, setNewAdminName] = React.useState('');
  const [newAdminEmail, setNewAdminEmail] = React.useState('');
  const [newAdminPassword, setNewAdminPassword] = React.useState('');
  const [newAdminPhone, setNewAdminPhone] = React.useState('');

  const [formError, setFormError] = React.useState('');
  const [formSuccess, setFormSuccess] = React.useState('');

  const { data: orgData, isLoading } = useQuery({
    queryKey: ['organization', id],
    queryFn: () => organizationApi.getOrganizationById(id),
  });

  const { data: athletesData } = useQuery({
    queryKey: ['organizationAthletes', id],
    queryFn: () => organizationApi.getOrganizationAthletes(id),
  });

  const { data: coachesData } = useQuery({
    queryKey: ['organizationCoaches', id],
    queryFn: () => organizationApi.getOrganizationCoaches(id),
  });

  const { data: adminData } = useQuery({
    queryKey: ['organizationAdmin', id],
    queryFn: () => organizationApi.getOrganizationAdmin(id),
  });

  const { data: unassignedAdminsData } = useQuery({
    queryKey: ['unassignedAdmins'],
    queryFn: () => organizationApi.getUnassignedAdmins(),
    enabled: showAssignForm && assignMode === 'existing' && isSuperAdmin,
  });

  const assignMutation = useMutation({
    mutationFn: (payload) => organizationApi.assignOrganizationAdmin(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationAdmin', id] });
      queryClient.invalidateQueries({ queryKey: ['unassignedAdmins'] });
      setShowAssignForm(false);
      setFormSuccess('Administrator assigned successfully!');
      setSelectedAdminId('');
      setNewAdminEmail('');
      setNewAdminName('');
      setNewAdminPassword('');
      setNewAdminPhone('');
      setFormError('');
      setTimeout(() => setFormSuccess(''), 3000);
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || err.message || 'Failed to assign administrator');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => organizationApi.deleteOrganization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      navigate('/dashboard/organizations');
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || err.message || 'Failed to remove organization');
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading organization...</div>;
  }

  const org = orgData?.data;
  if (!org) {
    return <div className="p-8 text-center">Organization not found.</div>;
  }

  const athletes = athletesData?.data || [];
  const coaches = coachesData?.data || [];
  const admin = adminData?.data;
  const unassignedAdmins = unassignedAdminsData?.data || [];
  const orgTypeName = org.organization_type?.name || org.organizationTypeName || 'N/A';

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    
    if (assignMode === 'existing') {
      if (!selectedAdminId) {
        setFormError('Please select an administrator.');
        return;
      }
      assignMutation.mutate({ userId: parseInt(selectedAdminId) });
    } else {
      if (!newAdminName || !newAdminEmail || !newAdminPassword) {
        setFormError('Name, email, and password are required.');
        return;
      }
      assignMutation.mutate({
        fullName: newAdminName,
        email: newAdminEmail,
        password: newAdminPassword,
        phone: newAdminPhone
      });
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Remove ${org.name}? This hides the organization from the platform; related records are retained.`)) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-5">
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => navigate('/dashboard/organizations')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Organization</p>
          <h1 className="text-2xl font-bold tracking-tight">{org.name || 'N/A'}</h1>
          <p className="text-muted-foreground mt-1">{org.sportName || 'N/A'} · {orgTypeName}</p>
        </div>
        {isSuperAdmin && (
          <Button
            variant="destructive"
            className="rounded-xl gap-2"
            disabled={deleteMutation.isPending}
            onClick={handleDelete}
          >
            <Trash2 size={16} />
            {deleteMutation.isPending ? 'Removing…' : 'Remove Organization'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="card-premium">
            <CardContent className="p-10">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-xl font-bold bg-muted">
                    {org.name ? org.name.substring(0, 2).toUpperCase() : 'NA'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold">{org.name || 'N/A'}</h2>
                    <Badge variant="outline" className={typeColors[orgTypeName] || typeColors['Club']}>
                      {orgTypeName}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{org.description || 'No description provided.'}</p>
                  <Separator />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{[org.address?.city, org.address?.state].filter(Boolean).join(', ') || org.city || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{athletes.length} Athletes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Trophy className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{coaches.length} Coaches</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="athletes" className="space-y-8">
            <div className="flex justify-between items-center">
              <TabsList className="h-11 rounded-xl p-1">
                <TabsTrigger value="athletes" className="h-9 px-6 rounded-lg">
                  Athletes ({athletes.length})
                </TabsTrigger>
                <TabsTrigger value="coaches" className="h-9 px-6 rounded-lg">
                  Coaches ({coaches.length})
                </TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2">
                <TabsContent value="athletes" className="m-0">
                  <Button onClick={() => navigate(`/dashboard/athletes/new?organizationId=${id}`)} className="rounded-xl flex items-center gap-2">
                    <Plus size={16} /> Add Athlete
                  </Button>
                </TabsContent>
                <TabsContent value="coaches" className="m-0">
                  <Button onClick={() => navigate(`/dashboard/coaches/new?organizationId=${id}`)} className="rounded-xl flex items-center gap-2">
                    <Plus size={16} /> Add Coach
                  </Button>
                </TabsContent>
              </div>
            </div>

            <TabsContent value="athletes" className="space-y-8">
              <Card className="card-premium">
                <CardContent className="p-0">
                  <div className="p-8 pb-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Registered Athletes
                    </h3>
                  </div>
                  <Table className="table-spacious">
                    <TableHeader>
                      <TableRow className="border-b">
                        <TableHead>Name</TableHead>
                        <TableHead>Sport</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {athletes.map((athlete) => (
                        <TableRow
                          key={athlete.id}
                          className="cursor-pointer group animate-fade-in"
                          onClick={() => navigate(`/dashboard/athletes/${athlete.id}`)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
                                  {athlete.firstName?.[0] || ''}{athlete.lastName?.[0] || ''}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold">{athlete.firstName || 'N/A'} {athlete.lastName || ''}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Code: {athlete.athleteCode}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{athlete.sportName || athlete.sport?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColors[athlete.status] || 'bg-gray-100 text-gray-800 border-gray-200'}>
                              {athlete.status || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-lg"
                                onClick={() => navigate(`/dashboard/athletes/${athlete.id}`)}
                              >
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-lg"
                                onClick={() => navigate(`/dashboard/athletes/${athlete.id}/edit`)}
                              >
                                Edit
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {athletes.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center p-8 text-muted-foreground">No athletes found.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="coaches" className="space-y-8">
              <Card className="card-premium">
                <CardContent className="p-0">
                  <div className="p-8 pb-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Registered Coaches
                    </h3>
                  </div>
                  <Table className="table-spacious">
                    <TableHeader>
                      <TableRow className="border-b">
                        <TableHead>Name</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coaches.map((coach) => (
                        <TableRow
                          key={coach.id}
                          className="cursor-pointer group animate-fade-in"
                          onClick={() => navigate(`/dashboard/coaches/${coach.id}`)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
                                  {coach.firstName?.[0] || ''}{coach.lastName?.[0] || ''}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold">{coach.firstName || 'N/A'} {coach.lastName || ''}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Code: {coach.coachCode}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{coach.specialization || 'N/A'}</TableCell>
                          <TableCell>{coach.experienceYears || 0} Years</TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-lg"
                                onClick={() => navigate(`/dashboard/coaches/${coach.id}`)}
                              >
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-lg"
                                onClick={() => navigate(`/dashboard/coaches/${coach.id}/edit`)}
                              >
                                Edit
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {coaches.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center p-8 text-muted-foreground">No coaches found.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Admin / Metadata Info */}
        <div className="space-y-8">
          <Card className="card-premium">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <Shield size={18} className="text-primary" />
                Administrator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formSuccess && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-xl text-xs">
                  {formSuccess}
                </div>
              )}
              {formError && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive p-3 rounded-xl text-xs flex items-center gap-1.5">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {admin ? (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Admin Name</p>
                    <p className="font-semibold text-foreground">{admin.fullName}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail size={14} />
                    <span>{admin.email}</span>
                  </div>
                  {admin.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone size={14} />
                      <span>{admin.phone}</span>
                    </div>
                  )}

                  {isSuperAdmin && (
                    <Button variant="outline" className="w-full mt-2" onClick={() => { setShowAssignForm(!showAssignForm); setFormError(''); }}>
                      Change Administrator
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4 text-center py-6 border border-dashed border-border rounded-xl">
                  <p className="text-muted-foreground text-sm">No administrator assigned.</p>
                  {isSuperAdmin && (
                    <Button size="sm" onClick={() => { setShowAssignForm(true); setFormError(''); }} className="mt-2 flex items-center gap-1 mx-auto">
                      <UserCheck size={14} /> Assign Admin
                    </Button>
                  )}
                </div>
              )}

              {showAssignForm && isSuperAdmin && (
                <div className="mt-6 border-t pt-6 space-y-4 animate-slide-up">
                  <div className="flex rounded-lg border border-border p-0.5 bg-muted">
                    <button
                      onClick={() => { setAssignMode('existing'); setFormError(''); }}
                      className={`flex-1 py-1 text-xs rounded font-medium transition-all ${assignMode === 'existing' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                    >
                      Assign Existing
                    </button>
                    <button
                      onClick={() => { setAssignMode('new'); setFormError(''); }}
                      className={`flex-1 py-1 text-xs rounded font-medium transition-all ${assignMode === 'new' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                    >
                      Create New Account
                    </button>
                  </div>

                  <form onSubmit={handleAssignSubmit} className="space-y-4">
                    {assignMode === 'existing' ? (
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">Select Admin User</label>
                        <select
                          value={selectedAdminId}
                          onChange={(e) => setSelectedAdminId(e.target.value)}
                          className="input py-2 text-sm w-full bg-background"
                        >
                          <option value="">-- Choose unassigned administrator --</option>
                          {unassignedAdmins.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.fullName} ({u.email})
                            </option>
                          ))}
                        </select>
                        {unassignedAdmins.length === 0 && (
                          <p className="text-[11px] text-amber-500">No unassigned administrators available. Choose 'Create New' to register a new user.</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Full Name *</label>
                          <input
                            type="text"
                            value={newAdminName}
                            onChange={(e) => setNewAdminName(e.target.value)}
                            className="input py-2 text-sm w-full bg-background"
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Email Address *</label>
                          <input
                            type="email"
                            value={newAdminEmail}
                            onChange={(e) => setNewAdminEmail(e.target.value)}
                            className="input py-2 text-sm w-full bg-background"
                            placeholder="john@organization.com"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Password *</label>
                          <input
                            type="password"
                            value={newAdminPassword}
                            onChange={(e) => setNewAdminPassword(e.target.value)}
                            className="input py-2 text-sm w-full bg-background"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                          <input
                            type="text"
                            value={newAdminPhone}
                            onChange={(e) => setNewAdminPhone(e.target.value)}
                            className="input py-2 text-sm w-full bg-background"
                            placeholder="+1 555-555-5555"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        type="submit"
                        disabled={assignMutation.isPending}
                        className="flex-1 text-xs"
                      >
                        {assignMutation.isPending ? 'Saving...' : 'Save Assignment'}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowAssignForm(false)}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
