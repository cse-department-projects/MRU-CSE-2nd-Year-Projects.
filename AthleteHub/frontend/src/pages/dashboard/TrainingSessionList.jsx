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
import { Plus, CheckCircle, Activity, Calendar, PlayCircle, Dumbbell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import TrainingNav from '../../components/training/TrainingNav';
import { Card, CardContent } from '../../components/ui/card';
import RoleGate from '../../components/auth/RoleGate';
import { PERMISSIONS, ROLES } from '../../lib/permissions';
import { usePermissions } from '../../hooks/usePermissions';

export default function TrainingSessionList() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isRole, can } = usePermissions();
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchSessions();
  }, [page, statusFilter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/training-sessions', {
        params: { page, page_size: 10, search, status: statusFilter }
      });
      
      const result = response.data?.data || response.data || {};
      setSessions(result.items || []);
      setTotalPages(result.total_pages || 1);
      setTotalRecords(result.total_records || 0);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch training sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSessions();
  };

  return (
    <div className="p-6 md:p-8 space-y-6 page-enter max-w-7xl mx-auto">
      {/* 1. Module Header & Subtitle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Training Center</h1>
          <p className="text-muted-foreground mt-2 text-lg">Plan, organise, monitor and evaluate all athlete training activities.</p>
        </div>
        
        {/* Context-Aware Actions for Sessions */}
        <div className="flex gap-3">
           <RoleGate permission={PERMISSIONS.TRAINING_UPDATE}>
             <Button variant="outline" className="shadow-sm">
               Export Sessions
             </Button>
           </RoleGate>
           <RoleGate permission={PERMISSIONS.TRAINING_CREATE}>
             <Button className="shadow-sm" asChild>
               <Link to="/dashboard/training-sessions/new">
                 New Session
               </Link>
             </Button>
           </RoleGate>
        </div>
      </div>

      {/* 2. Premium Segmented Navigation */}
      <TrainingNav />

      {/* 3. Context-Aware Statistics (Sessions) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-2">
          <Card className="card-premium border-border/50 group overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4 relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Dumbbell className="h-16 w-16 text-primary" />
              </div>
              <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0 z-10 group-hover:scale-110 transition-transform">
                <Dumbbell size={24} />
              </div>
              <div className="z-10">
                <p className="text-muted-foreground text-sm font-medium">Total Sessions</p>
                <p className="text-3xl font-bold mt-1 tracking-tight">{totalRecords || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-premium border-border/50 group overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4 relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Calendar className="h-16 w-16 text-blue-500" />
              </div>
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 shrink-0 z-10 group-hover:scale-110 transition-transform">
                <Calendar size={24} />
              </div>
              <div className="z-10">
                <p className="text-muted-foreground text-sm font-medium">Scheduled</p>
                <p className="text-3xl font-bold mt-1 tracking-tight">{sessions.filter(s => s.status === 'SCHEDULED').length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium border-border/50 group overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4 relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <PlayCircle className="h-16 w-16 text-amber-500" />
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 shrink-0 z-10 group-hover:scale-110 transition-transform">
                <PlayCircle size={24} />
              </div>
              <div className="z-10">
                <p className="text-muted-foreground text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold mt-1 tracking-tight">{sessions.filter(s => s.status === 'IN_PROGRESS').length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium border-border/50 group overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4 relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <CheckCircle className="h-16 w-16 text-emerald-500" />
              </div>
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 z-10 group-hover:scale-110 transition-transform">
                <CheckCircle size={24} />
              </div>
              <div className="z-10">
                <p className="text-muted-foreground text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold mt-1 tracking-tight">{sessions.filter(s => s.status === 'COMPLETED').length}</p>
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
            placeholder="Search by session name, location..." 
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
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <TableSkeleton columns={6} rows={5} />
      ) : sessions.length === 0 ? (
        <EmptyState 
          icon={Activity}
          title={isRole(ROLES.ATHLETE) ? "No upcoming training sessions" : "No training sessions found"}
          description={
            isRole(ROLES.ATHLETE) ? "Your coach hasn't scheduled any upcoming training sessions for you." :
            isRole(ROLES.COACH) ? "Create your first training session for your athletes." :
            "No training sessions have been scheduled yet."
          }
          actionLabel={can(PERMISSIONS.TRAINING_CREATE) ? "Create Session" : null}
          onAction={can(PERMISSIONS.TRAINING_CREATE) ? () => navigate('/dashboard/training-sessions/new') : undefined}
        />
      ) : (
        <Table className="mb-6 shadow-md card-premium rounded-xl overflow-hidden">
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>Session</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date/Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map(session => (
              <TableRow key={session.id} className="hover:bg-muted/50 transition-colors">
                <TableCell>
                  <div className="font-semibold text-foreground">{session.title || `Session #${session.id}`}</div>
                  <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-1 mt-0.5">
                    {session.teamName ? (
                      <span className="font-medium text-primary">{session.teamName}</span>
                    ) : session.athleteName ? (
                      <span>{session.athleteName}</span>
                    ) : null}
                    {session.trainingPlanTitle && (
                      <span className="opacity-70">&bull; {session.trainingPlanTitle}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">{session.sessionType || 'N/A'}</span>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="text-foreground">{session.sessionDate ? new Date(session.sessionDate).toLocaleDateString() : 'N/A'}</div>
                    <div className="text-muted-foreground text-xs">
                      {session.startTime ? session.startTime.substring(0, 5) : ''} - {session.endTime ? session.endTime.substring(0, 5) : ''}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">{session.venue || 'N/A'}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    session.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    session.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    session.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-muted text-muted-foreground'
                  }>
                    {session.status || 'SCHEDULED'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-2">
                    {can(PERMISSIONS.TRAINING_UPDATE) && (
                      <Button variant="outline" size="sm" asChild className="rounded-full gap-1.5 text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 h-8 px-3">
                        <Link to={`/dashboard/training-sessions/${session.id}/attendance`}>
                          <CheckCircle className="w-3.5 h-3.5" /> Attendance
                        </Link>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" asChild className="rounded-full h-8 px-3">
                      <Link to={`/dashboard/training-sessions/${session.id}`}>View</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}  
          {totalPages > 1 && (
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


