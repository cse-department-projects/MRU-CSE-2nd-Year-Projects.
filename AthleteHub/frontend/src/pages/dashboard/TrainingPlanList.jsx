import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import SearchBar from '../../components/ui/SearchBar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import EmptyState from '@/components/ui/EmptyState';
import { CalendarDays, BookOpen, Clock, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import TrainingNav from '../../components/training/TrainingNav';
import { Card, CardContent } from '../../components/ui/card';
import RoleGate from '../../components/auth/RoleGate';
import { PERMISSIONS, ROLES } from '../../lib/permissions';
import { usePermissions } from '../../hooks/usePermissions';

export default function TrainingPlanList() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isRole, can } = usePermissions();
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchPlans();
  }, [page, statusFilter]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/training-plans', {
        // Spring Data uses zero-based page indexes and the `size` parameter.
        // Sending `page` directly skipped the first page, making recently created
        // plans appear to be missing.
        params: { page: page - 1, size: 10, search, status: statusFilter }
      });
      
      const result = response.data?.data || {};
      setPlans(result.items || []);
      setTotalPages(result.total_pages || 1);
      setTotalRecords(result.total_records || 0);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch training plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPlans();
  };

  return (
    <div className="p-6 md:p-8 space-y-6 page-enter max-w-7xl mx-auto">
      {/* 1. Module Header & Subtitle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Training Center</h1>
          <p className="text-muted-foreground mt-2 text-lg">Plan, organise, monitor and evaluate all athlete training activities.</p>
        </div>
        
        {/* Context-Aware Actions for Plans */}
        <div className="flex gap-3">
           <RoleGate permission={PERMISSIONS.TRAINING_UPDATE}>
             <Button variant="outline" className="shadow-sm">
               Export Plans
             </Button>
           </RoleGate>
           <RoleGate permission={PERMISSIONS.TRAINING_CREATE}>
             <Button className="shadow-sm" asChild>
               <Link to="/dashboard/training-plans/new">
                 New Plan
               </Link>
             </Button>
           </RoleGate>
        </div>
      </div>

      {/* 2. Premium Segmented Navigation */}
      <TrainingNav />

      {/* 3. Context-Aware Statistics (Plans) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-2">
          <Card className="card-premium border-border/50 group overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4 relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <FileText className="h-16 w-16 text-primary" />
              </div>
              <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0 z-10 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <div className="z-10">
                <p className="text-muted-foreground text-sm font-medium">Total Plans</p>
                <p className="text-3xl font-bold mt-1 tracking-tight">{totalRecords || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-premium border-border/50 group overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4 relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <BookOpen className="h-16 w-16 text-emerald-500" />
              </div>
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 z-10 group-hover:scale-110 transition-transform">
                <BookOpen size={24} />
              </div>
              <div className="z-10">
                <p className="text-muted-foreground text-sm font-medium">Active</p>
                <p className="text-3xl font-bold mt-1 tracking-tight">{plans.filter(p => p.status === 'ACTIVE').length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium border-border/50 group overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4 relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Clock className="h-16 w-16 text-amber-500" />
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 shrink-0 z-10 group-hover:scale-110 transition-transform">
                <Clock size={24} />
              </div>
              <div className="z-10">
                <p className="text-muted-foreground text-sm font-medium">Drafts</p>
                <p className="text-3xl font-bold mt-1 tracking-tight">{plans.filter(p => p.status === 'DRAFT' || !p.status).length}</p>
              </div>
            </CardContent>
          </Card>
      </div>

      <div className="bg-card border border-border/50 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="flex-1 w-full">
          <SearchBar 
            search={search} 
            setSearch={setSearch} 
            onSearch={handleSearch} 
            placeholder="Search by plan name, coach..." 
          />
        </div>
        <div className="w-full md:w-48">
          <select 
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-xl mb-6 flex items-center gap-3">
          <span>⚠️</span> {error}
        </div>
      )}

      {loading ? (
        <TableSkeleton columns={6} rows={5} />
      ) : plans.length === 0 ? (
        <EmptyState 
          icon={CalendarDays}
          title={isRole(ROLES.ATHLETE) ? "No assigned training plans" : "No training plans found"}
          description={
            isRole(ROLES.ATHLETE) ? "Your coach hasn't assigned any training plans to you yet." :
            isRole(ROLES.COACH) ? "Create your first training plan to structure your athletes' development." :
            "No training plans have been created yet."
          }
          actionLabel={can(PERMISSIONS.TRAINING_CREATE) ? "Create Plan" : null}
          onAction={can(PERMISSIONS.TRAINING_CREATE) ? () => navigate('/dashboard/training-plans/new') : undefined}
        />
      ) : (
        <Table className="mb-6 shadow-md card-premium rounded-xl overflow-hidden">
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>Name</TableHead>
              <TableHead>Coach</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map(plan => (
              <TableRow key={plan.id} className="hover:bg-muted/50 transition-colors">
                <TableCell>
                  <span className="font-semibold text-foreground">{plan.title}</span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">{plan.creatorName || plan.coachName || 'N/A'}</span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">{plan.durationWeeks ? `${plan.durationWeeks} Weeks` : 'N/A'}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    plan.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    plan.status === 'ARCHIVED' ? 'bg-muted text-muted-foreground' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }>
                    {plan.status || 'DRAFT'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/dashboard/training-plans/${plan.id}`}>View</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/dashboard/training-plans/${plan.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      
      {!loading && plans.length > 0 && totalPages > 1 && (
        <div className="p-4 border-t border-white/10 mt-4">
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
                  Page {page} of {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}


