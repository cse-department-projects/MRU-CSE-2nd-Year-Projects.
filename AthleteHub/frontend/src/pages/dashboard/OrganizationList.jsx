import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { organizationApi } from '../../api/organizationApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, Users, Building, Plus, Eye, Search, Building2 } from 'lucide-react';
import { CardSkeleton } from '@/components/ui/skeleton-loaders';
import EmptyState from '@/components/ui/EmptyState';
import { usePermissions } from '@/hooks/usePermissions';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';

const typeColors = {
  Club: 'bg-blue-50 text-blue-700 border-blue-200',
  Academy: 'bg-purple-50 text-purple-700 border-purple-200',
  'Sports Academy': 'bg-purple-50 text-purple-700 border-purple-200',
  Association: 'bg-green-50 text-green-700 border-green-200',
  'State Association': 'bg-green-50 text-green-700 border-green-200',
  University: 'bg-orange-50 text-orange-700 border-orange-200',
  School: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'High School': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Federation: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Government Sports Center': 'bg-teal-50 text-teal-700 border-teal-200',
  'Private Training Center': 'bg-rose-50 text-rose-700 border-rose-200',
  Other: 'bg-gray-50 text-gray-700 border-gray-200',
};

export default function OrganizationList() {
  const navigate = useNavigate();
  const { isRole, ROLES } = usePermissions();
  const isSuperAdmin = isRole(ROLES.SUPER_ADMIN);
  const isOrgAdmin = isRole(ROLES.ORG_ADMIN);
  const isAuthorized = isSuperAdmin;

  React.useEffect(() => {
    if (isOrgAdmin && !isSuperAdmin) {
      navigate('/dashboard/my-organization', { replace: true });
    }
  }, [isOrgAdmin, isSuperAdmin, navigate]);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { data: orgResponse, isLoading } = useQuery({
    queryKey: ['organizations', searchTerm, typeFilter, page],
    queryFn: () => organizationApi.getOrganizations({
      search: searchTerm || undefined,
      organization_type_id: typeFilter !== 'all' ? typeFilter : undefined,
      page,
      page_size: 10,
    }),
    enabled: isAuthorized,
  });

  const organizations = orgResponse?.data || [];
  const pagination = orgResponse?.pagination || { total_records: 0 };
  const totalPages = Math.ceil((pagination.total_records || 0) / 10);

  const { data: orgTypesRes } = useQuery({
    queryKey: ['organizationTypes'],
    queryFn: () => organizationApi.getOrganizationTypes(),
    enabled: isAuthorized,
  });
  const orgTypes = orgTypesRes?.data || [];

  if (!isAuthorized) {
    return (
      <div className="space-y-8 page-enter max-w-7xl mx-auto">
        <EmptyState 
          icon={Building2}
          title="Access Restricted" 
          description="Organization directory and management is restricted to authorized platform administrators."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 page-enter max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-up stagger-1">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              {isOrgAdmin ? 'Organization Profile' : 'Sports Organizations'}
            </h1>
            {pagination.total_records > 0 && (
              <Badge variant="secondary" className="font-mono-telemetry font-bold px-2.5 py-0.5 text-xs">
                {isOrgAdmin ? '1 Organization' : `${pagination.total_records} Registered`}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {isOrgAdmin 
              ? 'Manage and review your organization profile, facilities, and staff.' 
              : 'Directory of affiliated sports clubs, state associations, and training academies.'}
          </p>
        </div>
        {isSuperAdmin && (
          <Button onClick={() => navigate('/dashboard/organizations/new')} className="shadow-sm rounded-xl h-10 px-4 gap-2">
            <Plus className="h-4 w-4" /> Add Organization
          </Button>
        )}
      </div>

      <Card className="card-telemetry-elevated">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
              <Input
                placeholder="Search by organization name, sport, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 rounded-xl text-sm bg-background/80 border-border/60"
              />
            </div>
            {!isOrgAdmin && (
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48 h-10 rounded-xl text-sm">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {orgTypes.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton className="h-64 rounded-2xl" /><CardSkeleton className="h-64 rounded-2xl" /><CardSkeleton className="h-64 rounded-2xl" />
        </div>
      ) : organizations.length === 0 ? (
        <EmptyState 
          icon={Building2}
          title="No organizations found" 
          description="Try adjusting your search or filters, or register a new organization."
          actionLabel={isSuperAdmin ? 'Register Organization' : null}
          onAction={isSuperAdmin ? () => navigate('/dashboard/organizations/new') : undefined}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => {
            const orgTypeName = org.organization_type?.name || 'Other';
            const orgCity = org.address?.city || org.city;
            const orgState = org.address?.state || org.state;
            const locationText = [orgCity, orgState].filter(Boolean).join(', ');
            return (
              <Card key={org.id} className="card-telemetry-elevated overflow-hidden group flex flex-col justify-between">
                <CardHeader className="p-6 pb-3">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <Avatar className="h-11 w-11 border border-border/50 shadow-xs">
                      <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                        {org.name ? org.name.substring(0, 2).toUpperCase() : 'NA'}
                      </AvatarFallback>
                    </Avatar>
                    <Badge variant="outline" className={`text-xs px-2.5 py-0.5 font-semibold ${typeColors[orgTypeName] || 'bg-muted text-muted-foreground'}`}>
                      {orgTypeName}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">{org.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{org.sportName || 'General Athletics'}</p>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5 text-xs text-muted-foreground pt-2 border-t border-border/40">
                    {locationText && (
                    <div className="flex items-center gap-2.5">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate">{locationText}</span>
                    </div>
                    )}
                    <div className="flex items-center gap-2.5">
                      <Users className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-mono-telemetry font-bold text-foreground">{org.athlete_count || org.athleteCount || 0}</span>
                      <span>Enrolled Athletes</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {org.description || 'No additional organization description provided.'}
                  </p>
                  <div className="flex items-center gap-2 pt-3 border-t border-border/40">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-3 rounded-xl text-xs flex-1 font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => navigate(`/dashboard/organizations/${org.id}`)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Full Dossier
                    </Button>
                    {isSuperAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 rounded-xl text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => navigate(`/dashboard/organizations/${org.id}/edit`)}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
            </PaginationItem>
            <PaginationItem>
              <span className="text-sm text-muted-foreground px-4">
                Page {page} of {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
