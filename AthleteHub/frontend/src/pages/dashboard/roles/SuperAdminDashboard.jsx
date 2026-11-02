import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  GraduationCap, 
  Trophy, 
  Download, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  ExternalLink, 
  Share2, 
  AlertCircle, 
  CheckCircle2, 
  Settings, 
  MapPin,
  Database,
  RefreshCw,
  UserCheck,
  UserX
} from 'lucide-react';
import { organizationApi } from '@/api/organizationApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChartSkeleton } from '@/components/ui/skeleton-loaders';
import EmptyState from '@/components/ui/EmptyState';

export default function SuperAdminDashboard({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [matrixData, setMatrixData] = useState({ summary: {}, organizations: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Allocation Dialog state
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [targetOrgId, setTargetOrgId] = useState('');
  const [modalSportId, setModalSportId] = useState('ALL');
  const [modalCountry, setModalCountry] = useState('ALL');
  const [modalGender, setModalGender] = useState('ALL');
  const [allocateCount, setAllocateCount] = useState(25);
  const [allocating, setAllocating] = useState(false);
  const [allocateMessage, setAllocateMessage] = useState({ type: '', text: '' });
  const [poolFilters, setPoolFilters] = useState({ sports: [], countries: [], genders: [], totalUnassigned: 0 });

  const fetchMatrix = async () => {
    try {
      setLoading(true);
      const [res, filtersRes] = await Promise.all([
        organizationApi.getOverviewMatrix(),
        organizationApi.getPoolFilters()
      ]);
      if (res && res.data) {
        setMatrixData(res.data);
      }
      if (filtersRes && filtersRes.data) {
        setPoolFilters(filtersRes.data);
      }
    } catch (err) {
      console.error('Failed to load overview matrix', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  const summary = matrixData.summary || {};
  const organizations = matrixData.organizations || [];

  const filteredOrganizations = useMemo(() => {
    return organizations.filter(org => {
      const matchesSearch = 
        !searchTerm ||
        org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.organizationCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.orgAdmin?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.orgAdmin?.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === 'ALL' || 
        org.status?.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [organizations, searchTerm, statusFilter]);

  const openAllocateModal = (orgId = '') => {
    setTargetOrgId(orgId ? String(orgId) : (organizations.length > 0 ? String(organizations[0].id) : ''));
    setModalSportId('ALL');
    setModalCountry('ALL');
    setModalGender('ALL');
    setAllocateCount(25);
    setAllocateMessage({ type: '', text: '' });
    setIsAllocateOpen(true);
  };

  const handleExecuteAllocation = async (e) => {
    e.preventDefault();
    if (!targetOrgId) {
      setAllocateMessage({ type: 'error', text: 'Please select an organization.' });
      return;
    }
    const count = parseInt(allocateCount, 10);
    if (!count || count <= 0) {
      setAllocateMessage({ type: 'error', text: 'Please enter a valid count of athletes.' });
      return;
    }

    try {
      setAllocating(true);
      setAllocateMessage({ type: '', text: '' });
      
      const payload = {
        targetOrganizationId: parseInt(targetOrgId, 10),
        count
      };
      if (modalSportId !== 'ALL') payload.sportId = parseInt(modalSportId, 10);
      if (modalCountry !== 'ALL') payload.country = modalCountry;
      if (modalGender !== 'ALL') payload.gender = modalGender;

      const res = await organizationApi.allocateAthletes(payload);
      setAllocateMessage({ 
        type: 'success', 
        text: res.message || `Successfully allocated ${res.allocatedCount || count} athletes to organization.` 
      });
      // Refresh matrix
      fetchMatrix();
      setTimeout(() => {
        setIsAllocateOpen(false);
      }, 1800);
    } catch (err) {
      setAllocateMessage({ 
        type: 'error', 
        text: err.response?.data?.message || err.message || 'Failed to allocate athletes.' 
      });
    } finally {
      setAllocating(false);
    }
  };

  return (
    <div className="space-y-8 page-enter max-w-7xl mx-auto pb-12">
      {/* Platform Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in-up stagger-1">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Platform Console</h1>
            <Badge variant="outline" className="font-mono text-xs px-2.5 py-0.5 bg-primary/10 text-primary border-primary/20">
              Super Admin
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Cross-organization overview, user role distribution, and dataset allocation control.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchMatrix}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button 
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/imports')}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Import & Allocate
          </Button>

          <Button 
            size="sm"
            onClick={() => navigate('/dashboard/organizations/new')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Organization
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {loading && !matrixData.summary?.totalOrganizations ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <ChartSkeleton className="h-28" />
          <ChartSkeleton className="h-28" />
          <ChartSkeleton className="h-28" />
          <ChartSkeleton className="h-28" />
          <ChartSkeleton className="h-28" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="shadow-xs hover:border-primary/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Organizations</span>
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                  <Building2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {summary.totalOrganizations ?? 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-emerald-600 font-medium">{summary.activeOrganizations ?? 0}</span> active
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xs hover:border-primary/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Platform Users</span>
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {summary.totalPlatformUsers ?? 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all organizations
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xs hover:border-primary/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Org Admins</span>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {summary.totalOrgAdmins ?? 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Designated club heads
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xs hover:border-primary/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Coaches</span>
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                  <GraduationCap className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {summary.totalCoaches ?? 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Team coaches
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xs hover:border-primary/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Athletes Pool</span>
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600">
                  <Trophy className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {summary.totalAthletes ?? 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-amber-600 font-medium">{summary.unassignedAthletes ?? 0}</span> in unassigned pool
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Unassigned Pool Quick Action Banner */}
      {Number(summary.unassignedAthletes || 0) > 0 && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {summary.unassignedAthletes} Athletes in Global Import Pool
              </p>
              <p className="text-xs text-muted-foreground">
                Imported athletes are waiting for organization assignment. You can allocate batches directly to any organization.
              </p>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={() => openAllocateModal()}
            className="shrink-0 gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5" />
            Allocate to Organization
          </Button>
        </div>
      )}

      {/* Cross-Organization Overview Matrix */}
      <Card className="shadow-xs border-border/80">
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold tracking-tight">
                Cross-Organization Directory & Role Matrix
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Overview of all registered organizations with Org Admin contact details and breakdown of users by role.
              </CardDescription>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-[220px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search organization or admin..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9 text-xs"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] h-9 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Loading cross-organization matrix...
            </div>
          ) : filteredOrganizations.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={Building2}
                title="No organizations found"
                description={searchTerm ? "No organizations match your search query." : "No organizations registered yet."}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-5 py-3">Organization</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Org Admin Contact</th>
                    <th className="px-4 py-3">User Roles Distribution</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredOrganizations.map((org) => {
                    const admin = org.orgAdmin;
                    const counts = org.counts || {};
                    return (
                      <tr key={org.id} className="hover:bg-muted/20 transition-colors">
                        {/* Organization details */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground text-sm hover:text-primary cursor-pointer"
                                onClick={() => navigate(`/dashboard/organizations/${org.id}`)}
                              >
                                {org.name}
                              </span>
                              {org.organizationCode && (
                                <span className="font-mono text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                  {org.organizationCode}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span>
                                {[org.city, org.state, org.country].filter(Boolean).join(', ') || 'Location unset'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              org.status === 'Active' 
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' 
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {org.status || 'Active'}
                          </Badge>
                        </td>

                        {/* Org Admin details */}
                        <td className="px-4 py-4">
                          {admin ? (
                            <div className="flex items-start gap-2.5">
                              <Avatar className="h-8 w-8 text-xs font-bold border shrink-0">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {admin.name?.charAt(0) || 'A'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-medium text-xs text-foreground truncate">
                                    {admin.name}
                                  </span>
                                  <UserCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                                </div>
                                {admin.email && (
                                  <a 
                                    href={`mailto:${admin.email}`} 
                                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary mt-0.5 truncate"
                                  >
                                    <Mail className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{admin.email}</span>
                                  </a>
                                )}
                                {admin.phone && (
                                  <a 
                                    href={`tel:${admin.phone}`} 
                                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary mt-0.5"
                                  >
                                    <Phone className="h-3 w-3 shrink-0" />
                                    <span>{admin.phone}</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                <UserX className="h-3 w-3" />
                                No Admin Assigned
                              </span>
                              <Button
                                variant="ghost"
                                size="xs"
                                className="text-xs text-primary h-6 px-2 hover:bg-primary/10"
                                onClick={() => navigate(`/dashboard/organizations/${org.id}`)}
                              >
                                Assign
                              </Button>
                            </div>
                          )}
                        </td>

                        {/* User Roles Breakdown */}
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              title="Organization Administrators"
                            >
                              <ShieldCheck className="h-3 w-3" />
                              {counts.orgAdmins ?? 0} Admins
                            </span>

                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                              title="Coaches in Organization"
                            >
                              <GraduationCap className="h-3 w-3" />
                              {counts.coaches ?? 0} Coaches
                            </span>

                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800"
                              title="Athletes assigned to this organization"
                            >
                              <Trophy className="h-3 w-3" />
                              {counts.athletes ?? 0} Athletes
                            </span>

                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-muted text-foreground"
                              title="Total registered user accounts"
                            >
                              {counts.totalUsers ?? 0} Total
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="xs"
                              className="h-7 text-xs gap-1"
                              onClick={() => openAllocateModal(org.id)}
                            >
                              <Share2 className="h-3 w-3" />
                              Allocate Data
                            </Button>

                            <Button
                              variant="ghost"
                              size="xs"
                              className="h-7 text-xs gap-1"
                              onClick={() => navigate(`/dashboard/organizations/${org.id}`)}
                            >
                              <ExternalLink className="h-3 w-3" />
                              Manage
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Allocate Modal */}
      <Dialog open={isAllocateOpen} onOpenChange={setIsAllocateOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              Allocate Athletes to Organization
            </DialogTitle>
            <DialogDescription className="text-xs">
              Distribute unassigned athletes from the imported dataset pool directly into an organization.
            </DialogDescription>
          </DialogHeader>

          {allocateMessage.text && (
            <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
              allocateMessage.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                : 'bg-destructive/10 text-destructive border border-destructive/20'
            }`}>
              {allocateMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{allocateMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleExecuteAllocation} className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Target Organization
              </label>
              <Select value={targetOrgId} onValueChange={setTargetOrgId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select target organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map(o => (
                    <SelectItem key={o.id} value={String(o.id)}>
                      {o.name} {o.organizationCode ? `(${o.organizationCode})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Sport / Discipline
                </label>
                <Select value={modalSportId} onValueChange={setModalSportId}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All Sports" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="ALL">All Sports</SelectItem>
                    {poolFilters.sports.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name} ({s.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Country / Nationality
                </label>
                <Select value={modalCountry} onValueChange={setModalCountry}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="ALL">All Countries</SelectItem>
                    {poolFilters.countries.slice(0, 25).map(c => (
                      <SelectItem key={c.name} value={c.name}>
                        {c.name} ({c.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-foreground">
                  Number of Athletes to Allocate
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Pool: <strong className="text-foreground">{summary.unassignedAthletes ?? 0}</strong>
                </span>
              </div>
              <Input
                type="number"
                min="1"
                max={summary.unassignedAthletes || 5000}
                value={allocateCount}
                onChange={(e) => setAllocateCount(e.target.value)}
                className="h-8 text-xs"
              />
              <div className="flex items-center gap-1.5 mt-2">
                {[10, 25, 50, 100].map(cnt => (
                  <Button
                    key={cnt}
                    type="button"
                    variant="outline"
                    size="xs"
                    className="h-6 text-[10px] px-2"
                    onClick={() => setAllocateCount(cnt)}
                  >
                    +{cnt}
                  </Button>
                ))}
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsAllocateOpen(false);
                  navigate('/dashboard/imports');
                }}
                className="text-[11px] text-primary hover:underline"
              >
                Need to browse and hand-pick individual athletes? Open Data Hub →
              </button>
            </div>

            <DialogFooter className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setIsAllocateOpen(false)}
                disabled={allocating}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="sm"
                disabled={allocating || !targetOrgId || Number(summary.unassignedAthletes || 0) === 0}
                className="gap-2"
              >
                {allocating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Allocating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Confirm Allocation
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
