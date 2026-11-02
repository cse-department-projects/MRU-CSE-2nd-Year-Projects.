import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { coachAssignmentApi } from '../../api/coachAssignmentApi';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import SearchBar from '../../components/ui/SearchBar';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { Plus, BarChart2, UserCheck, Trophy, Users, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const categoryColorMap = {
  'Track and Field': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'Team Sport': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Racket Sport': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'Water Sport': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  'Contact Sport': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
};

export default function CoachAssignmentList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['coachAssignments', page, search, statusFilter],
    queryFn: () => coachAssignmentApi.getAssignments({ page, page_size: 20, search, status: statusFilter }),
    placeholderData: (prev) => prev
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1); 
  };

  const rawAssignments = response?.data || [];
  const totalPages = response?.pagination?.total_pages || 1;
  const totalRecords = response?.pagination?.total_records || 0;

  // Filter by category if selected
  const assignments = useMemo(() => {
    if (categoryFilter === 'ALL') return rawAssignments;
    return rawAssignments.filter(a => a.sportCategory === categoryFilter);
  }, [rawAssignments, categoryFilter]);

  // Coach breakdown stats
  const coachSummary = useMemo(() => {
    const map = {};
    rawAssignments.forEach(a => {
      const cId = a.coachId || a.coachName;
      if (!map[cId]) {
        map[cId] = {
          name: a.coachName,
          code: a.coachCode,
          specialization: a.coachSpecialization,
          athletes: [],
          categories: new Set(),
          sports: new Set(),
        };
      }
      map[cId].athletes.push(a.athleteName);
      if (a.sportCategory) map[cId].categories.add(a.sportCategory);
      if (a.sportName) map[cId].sports.add(a.sportName);
    });
    return Object.values(map);
  }, [rawAssignments]);

  const uniqueCategories = useMemo(() => {
    const set = new Set();
    rawAssignments.forEach(a => {
      if (a.sportCategory) set.add(a.sportCategory);
    });
    return Array.from(set);
  }, [rawAssignments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Coach & Athlete Assignments</h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {totalRecords} Active Roster
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Track coach allocations, assigned athletes, and sport discipline categories.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/coach-assignments/dashboard" className="btn btn-outline flex items-center gap-2">
            <BarChart2 size={16} /> Stats
          </Link>
          <Link to="/dashboard/coach-assignments/new" className="btn btn-primary flex items-center gap-2">
            <Plus size={16} /> New Assignment
          </Link>
        </div>
      </div>

      {/* Coach Roster Breakdown Cards */}
      {coachSummary.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coachSummary.map((c, i) => (
            <div key={i} className="card-premium p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {c.name ? c.name.charAt(0) : 'C'}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm">{c.name}</h3>
                      <p className="text-[11px] text-muted-foreground">{c.specialization || 'Sports Specialist'}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[11px] font-semibold bg-primary/5 text-primary">
                    {c.athletes.length} Athletes
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {Array.from(c.categories).map(cat => (
                    <span key={cat} className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${categoryColorMap[cat] || 'bg-muted text-muted-foreground'}`}>
                      {cat}
                    </span>
                  ))}
                  {Array.from(c.sports).map(sport => (
                    <span key={sport} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {sport}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-border/40 text-[11px] text-muted-foreground flex justify-between items-center">
                <span>Roster:</span>
                <span className="font-medium text-foreground truncate max-w-[200px]">
                  {c.athletes.slice(0, 3).join(', ')}{c.athletes.length > 3 ? ` +${c.athletes.length - 3} more` : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card-premium p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex-1 w-full">
          <SearchBar 
            search={searchInput} 
            setSearch={setSearchInput} 
            onSearch={handleSearch} 
            placeholder="Search by coach, athlete, sport, or assignment code..." 
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {uniqueCategories.length > 0 && (
            <select 
              className="input text-xs h-10 rounded-xl"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
          <select 
            className="input text-xs h-10 rounded-xl"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-xl">
          {error.response?.data?.message || error.message || 'Failed to fetch assignments'}
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner text="Loading coach-athlete roster..." />
      ) : (
        <div className="card-premium rounded-2xl overflow-hidden border border-border/60">
          {assignments.length === 0 ? (
            <div className="p-12 text-center">
              <EmptyState title="No assignments found" description="No coach-athlete assignments match your filter." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground text-xs uppercase tracking-wider bg-muted/20">
                    <th className="py-3.5 px-4 font-semibold">Code</th>
                    <th className="py-3.5 px-4 font-semibold">Coach & Specialization</th>
                    <th className="py-3.5 px-4 font-semibold">Assigned Athlete</th>
                    <th className="py-3.5 px-4 font-semibold">Sport & Category</th>
                    <th className="py-3.5 px-4 font-semibold">Duration</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-border/40">
                  {assignments.map(assignment => {
                    const catBadgeStyle = categoryColorMap[assignment.sportCategory] || 'bg-primary/10 text-primary border-primary/20';
                    return (
                      <tr key={assignment.id} className="hover:bg-primary/5 transition-colors">
                        <td className="py-4 px-4 font-mono font-semibold text-primary text-xs">
                          {assignment.assignmentCode || 'N/A'}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-foreground flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-primary" />
                            {assignment.coachName || 'N/A'}
                          </div>
                          {assignment.coachSpecialization && (
                            <div className="text-xs text-muted-foreground mt-0.5 pl-5">
                              {assignment.coachSpecialization}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-foreground">
                            {assignment.athleteName || 'N/A'}
                          </div>
                          <div className="text-xs font-mono text-muted-foreground">
                            {assignment.athleteCode || ''}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-foreground">
                            {assignment.sportName || 'Athletics'}
                          </div>
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${catBadgeStyle}`}>
                              {assignment.sportCategory || 'General Category'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-xs text-muted-foreground">
                          <div>
                            {assignment.startDate ? new Date(assignment.startDate).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-[11px]">
                            to {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : 'Present'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status={assignment.status || 'UNKNOWN'} />
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link 
                            to={`/dashboard/coach-assignments/${assignment.id}`} 
                            className="btn btn-outline py-1 px-3 text-xs inline-block rounded-xl hover:bg-primary hover:text-primary-foreground"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="p-4 border-t border-border/40">
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
      )}
    </div>
  );
}
