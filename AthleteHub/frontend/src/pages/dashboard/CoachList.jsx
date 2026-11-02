import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { coachApi } from '../../api/coachApi';
import { referenceApi } from '../../api/referenceApi';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';
import CoachJoinRequestsWidget from '@/components/dashboard/widgets/CoachJoinRequestsWidget';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GraduationCap, Search, Eye, Layers, Plus, UserSquare, Users } from 'lucide-react';
import AssignAthletesModal from '@/components/coaches/AssignAthletesModal';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import EmptyState from '@/components/ui/EmptyState';

const statusStyles = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  INACTIVE: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  DELETED: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
  SUSPENDED: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
};

export default function CoachList() {
  const navigate = useNavigate();
  const { isRole, can } = usePermissions();
  const { currentUser } = useAuth();
  const orgId = currentUser?.organizationId || currentUser?.organization_id;
  const canManageCoaches = isRole('SUPER_ADMIN') || isRole('ORG_ADMIN') || can('coach.assign');

  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [assignModalCoachId, setAssignModalCoachId] = useState(null);
  const pageSize = 10;

  // Fetch dynamic sports from referenceApi
  const { data: sports = [] } = useQuery({
    queryKey: ['sports'],
    queryFn: referenceApi.getSports,
    staleTime: 5 * 60 * 1000,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['coaches', { 
      page, 
      pageSize, 
      search: searchTerm, 
      sport_id: sportFilter === 'all' ? undefined : sportFilter, 
      status: statusFilter === 'all' ? undefined : statusFilter 
    }],
    queryFn: () => coachApi.getCoaches({ 
      page, 
      page_size: pageSize, 
      search: searchTerm,
      sport_id: sportFilter === 'all' ? undefined : sportFilter,
      status: statusFilter === 'all' ? undefined : statusFilter
    }),
    keepPreviousData: true,
  });

  const coaches = data?.data || [];
  const pagination = data?.pagination || { total_pages: 1, page: 1 };

  return (
    <div className="space-y-6 page-enter">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Coaches</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Directory of all coaches on the platform.</p>
        </div>
        {canManageCoaches && (
          <Button onClick={() => navigate('/dashboard/coaches/new')} className="h-9">
            Add Coach
          </Button>
        )}
      </div>

      {/* Incoming Coach Join Requests for Managers */}
      {canManageCoaches && (
        <CoachJoinRequestsWidget organizationId={orgId} />
      )}

      {/* Sticky Filter Toolbar */}
      <div className="sticky top-[62px] z-10">
        <Card className="card-premium border border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search coaches by name, sport, or organization..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="pl-9 h-9 rounded-lg text-sm bg-background border-border/60 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Select value={sportFilter} onValueChange={(val) => { setSportFilter(val); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[180px] h-9 rounded-lg text-sm bg-background border-border/60 text-foreground">
                  <SelectValue placeholder="Filter by sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  {Array.isArray(sports) && sports.map((sport) => (
                    <SelectItem key={sport.id} value={String(sport.id)}>
                      {sport.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[160px] h-9 rounded-lg text-sm bg-background border-border/60 text-foreground">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coach Directory Table */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-xl mb-6 text-sm font-medium">
          Failed to load coaches: {error?.message || 'Access denied or server error.'}
        </div>
      )}

      {isLoading ? (
        <TableSkeleton columns={6} rows={5} />
      ) : coaches.length === 0 ? (
        <EmptyState 
          icon={UserSquare}
          title="No coaches found" 
          description="Try adjusting your search or filters, or register a new coach."
          actionLabel={canManageCoaches ? "Register Coach" : undefined}
          onAction={canManageCoaches ? () => navigate('/dashboard/coaches/new') : undefined}
        />
      ) : (
        <Card className="card-premium border border-border/60 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table className="table-spacious">
              <TableHeader>
                <TableRow className="border-b border-border/60 bg-muted/20 hover:bg-muted/20">
                  <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Name</TableHead>
                  <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Specialization</TableHead>
                  <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Organization</TableHead>
                  <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Experience</TableHead>
                  <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-muted-foreground uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coaches.map((coach) => {
                  const fullName = [coach.firstName, coach.lastName].filter(Boolean).join(' ') || coach.fullName || coach.name || coach.email || `Coach #${coach.id}`;
                  const initials = (coach.firstName?.[0] || '') + (coach.lastName?.[0] || '') || fullName.substring(0, 2).toUpperCase() || 'CO';

                  return (
                    <TableRow
                      key={coach.id}
                      className="cursor-pointer border-b border-border/50 hover:bg-muted/40 transition-colors"
                      onClick={() => navigate(`/dashboard/coaches/${coach.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border/60">
                            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-semibold text-sm text-foreground block">{fullName}</span>
                            <span className="text-[11px] font-mono text-muted-foreground">{coach.coachCode || `COA-${coach.id}`}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-sm text-muted-foreground">{coach.specialization || 'N/A'}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{coach.organizationName || 'N/A'}</TableCell>
                      <TableCell>
                        <span className="font-medium text-sm text-muted-foreground">{coach.experienceYears ? `${coach.experienceYears} yrs` : 'N/A'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusStyles[coach.status] || 'bg-muted text-muted-foreground border-border'}`}
                        >
                          {coach.status || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canManageCoaches && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2.5 rounded-lg text-xs font-medium border-primary/30 text-primary hover:bg-primary/10 transition-colors gap-1.5"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAssignModalCoachId(coach.id);
                              }}
                            >
                              <Users className="h-3.5 w-3.5" />
                              Assign Athletes
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 rounded-lg text-xs font-medium text-foreground hover:bg-muted hover:text-primary transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dashboard/coaches/${coach.id}`);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {coaches.length > 0 && pagination.total_pages > 1 && (
              <div className="p-4 border-t border-border/60">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <span className="text-sm text-muted-foreground mx-4">
                        Page {page} of {pagination.total_pages}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                        disabled={page === pagination.total_pages}
                        className={page === pagination.total_pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sport-Based Athlete Assignment Modal */}
      <AssignAthletesModal
        coachId={assignModalCoachId}
        isOpen={!!assignModalCoachId}
        onClose={() => setAssignModalCoachId(null)}
      />
    </div>
  );
}
