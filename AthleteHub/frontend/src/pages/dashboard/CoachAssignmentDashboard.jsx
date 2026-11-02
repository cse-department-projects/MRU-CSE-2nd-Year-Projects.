import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { coachAssignmentApi } from '../../api/coachAssignmentApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  ArrowLeft, 
  Trophy, 
  Dumbbell, 
  Layers, 
  CheckCircle2, 
  UserCheck, 
  ExternalLink,
  Search
} from 'lucide-react';

const categoryColorMap = {
  'Track and Field': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'Team Sport': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Racket Sport': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'Water Sport': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  'Contact Sport': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
};

export default function CoachAssignmentDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch overall dashboard stats
  const { data: statsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ['coachAssignmentStats'],
    queryFn: coachAssignmentApi.getDashboardStats,
  });

  // 2. Fetch all assignments so we can group all coaches and athletes together
  const { data: assignmentsResponse, isLoading: assignmentsLoading, error } = useQuery({
    queryKey: ['allCoachAssignmentsGrouped'],
    queryFn: () => coachAssignmentApi.getAssignments({ page: 1, page_size: 100 }),
  });

  const stats = statsResponse?.data || {};
  const assignments = assignmentsResponse?.data || [];
  const isLoading = statsLoading || assignmentsLoading;

  // Group assignments by Coach
  const groupedCoaches = useMemo(() => {
    const map = new Map();
    assignments.forEach((asg) => {
      const cId = asg.coachId || asg.coachName;
      if (!map.has(cId)) {
        map.set(cId, {
          coachId: asg.coachId,
          coachName: asg.coachName,
          coachCode: asg.coachCode,
          coachSpecialization: asg.coachSpecialization,
          organizationName: asg.organizationName,
          athletes: [],
          categories: new Set(),
          sports: new Set(),
        });
      }
      const group = map.get(cId);
      group.athletes.push(asg);
      if (asg.sportCategory) group.categories.add(asg.sportCategory);
      if (asg.sportName) group.sports.add(asg.sportName);
    });

    let result = Array.from(map.values());

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(coach => {
        const matchesCoach = coach.coachName?.toLowerCase().includes(term) || 
                             coach.coachSpecialization?.toLowerCase().includes(term);
        const matchesAthlete = coach.athletes.some(a => 
          a.athleteName?.toLowerCase().includes(term) ||
          a.sportName?.toLowerCase().includes(term) ||
          a.sportCategory?.toLowerCase().includes(term)
        );
        return matchesCoach || matchesAthlete;
      });
    }

    return result;
  }, [assignments, searchTerm]);

  if (isLoading) return <LoadingSpinner text="Loading coach rosters & assigned athletes..." />;
  if (error) {
    return (
      <div className="text-destructive p-4 bg-destructive/10 rounded-2xl border border-destructive/20">
        {error.response?.data?.message || error.message || 'Failed to fetch assignments'}
      </div>
    );
  }

  const totalAssignedAthletes = assignments.length;
  const totalCoachesCount = groupedCoaches.length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => navigate('/dashboard/coach-assignments')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Coach Rosters & Assigned Athletes
            </h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {totalCoachesCount} Coaches • {totalAssignedAthletes} Athletes
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1 pl-12">
            Athletes grouped under their assigned coach according to their shared sport discipline and category.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/dashboard/coach-assignments')} className="rounded-xl text-xs font-semibold">
            Table View
          </Button>
          <Button onClick={() => navigate('/dashboard/coach-assignments/new')} className="rounded-xl text-xs font-semibold">
            + New Assignment
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-premium p-5 rounded-2xl border border-border/60 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Coaches</p>
            <p className="text-3xl font-extrabold text-foreground mt-1">{totalCoachesCount}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">With athlete rosters</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="card-premium p-5 rounded-2xl border border-border/60 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Assigned Athletes</p>
            <p className="text-3xl font-extrabold text-primary mt-1">{totalAssignedAthletes}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Allocated to coaches</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="card-premium p-5 rounded-2xl border border-border/60 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Average Roster</p>
            <p className="text-3xl font-extrabold text-foreground mt-1">
              {totalCoachesCount > 0 ? (totalAssignedAthletes / totalCoachesCount).toFixed(1) : 0}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Athletes per coach</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="card-premium p-5 rounded-2xl border border-border/60 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Sports Covered</p>
            <p className="text-3xl font-extrabold text-foreground mt-1">
              {new Set(assignments.map(a => a.sportName)).size}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Across all categories</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Trophy className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="card-premium p-3.5 rounded-2xl border border-border/60 flex items-center gap-3">
        <Search className="w-4 h-4 text-muted-foreground ml-2" />
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by coach name, athlete name, sport (e.g. Athletics, Basketball), or category..."
          className="bg-transparent border-none text-sm text-foreground focus:outline-none w-full placeholder:text-muted-foreground"
        />
        {searchTerm && (
          <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')} className="h-7 text-xs">
            Clear
          </Button>
        )}
      </div>

      {/* Grouped Coach & Athlete Cards */}
      {groupedCoaches.length === 0 ? (
        <div className="card-premium p-12 text-center rounded-2xl border border-border/60">
          <p className="text-muted-foreground text-sm">No coaches or assignments match your search filter.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedCoaches.map((coachGroup) => (
            <div 
              key={coachGroup.coachId || coachGroup.coachName} 
              className="card-premium rounded-3xl overflow-hidden border border-border/70 shadow-xs"
            >
              {/* Coach Header Row */}
              <div className="p-6 bg-muted/20 border-b border-border/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-extrabold text-lg">
                    {coachGroup.coachName ? coachGroup.coachName.charAt(0) : 'C'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-lg font-bold text-foreground">
                        Coach {coachGroup.coachName}
                      </h2>
                      {coachGroup.coachCode && (
                        <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-background border border-border/60 text-muted-foreground">
                          {coachGroup.coachCode}
                        </span>
                      )}
                      <Badge variant="outline" className="text-xs font-semibold bg-primary/5 text-primary border-primary/20">
                        {coachGroup.coachSpecialization || 'Head Coach'}
                      </Badge>
                    </div>

                    {/* Sports and Category Badges */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs text-muted-foreground">Discipline:</span>
                      {Array.from(coachGroup.categories).map(cat => (
                        <span 
                          key={cat} 
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${categoryColorMap[cat] || 'bg-muted text-muted-foreground'}`}
                        >
                          {cat}
                        </span>
                      ))}
                      {Array.from(coachGroup.sports).map(sport => (
                        <span key={sport} className="text-xs font-medium px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                          {sport}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">Assigned Roster</span>
                    <span className="text-sm font-bold text-foreground">
                      {coachGroup.athletes.length} {coachGroup.athletes.length === 1 ? 'Athlete' : 'Athletes'}
                    </span>
                  </div>
                  <Badge variant="secondary" className="px-3 py-1 text-xs font-bold rounded-xl bg-primary/10 text-primary">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active
                  </Badge>
                </div>
              </div>

              {/* Assigned Athletes List under this Coach */}
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <th className="pb-3 px-3">Athlete</th>
                        <th className="pb-3 px-3">Sport Discipline</th>
                        <th className="pb-3 px-3">Category</th>
                        <th className="pb-3 px-3">Assignment Code</th>
                        <th className="pb-3 px-3">Effective Date</th>
                        <th className="pb-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30 text-sm">
                      {coachGroup.athletes.map((athleteAsg) => {
                        const catStyle = categoryColorMap[athleteAsg.sportCategory] || 'bg-primary/10 text-primary border-primary/20';
                        return (
                          <tr key={athleteAsg.id} className="hover:bg-primary/5 transition-colors">
                            {/* Athlete Name & Code */}
                            <td className="py-3.5 px-3">
                              <div className="font-bold text-foreground">
                                {athleteAsg.athleteName}
                              </div>
                              <div className="text-xs font-mono text-muted-foreground">
                                {athleteAsg.athleteCode || `ID: ${athleteAsg.athleteId}`}
                              </div>
                            </td>

                            {/* Sport */}
                            <td className="py-3.5 px-3">
                              <span className="font-semibold text-foreground">
                                {athleteAsg.sportName || 'Athletics'}
                              </span>
                            </td>

                            {/* Sport Category */}
                            <td className="py-3.5 px-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${catStyle}`}>
                                {athleteAsg.sportCategory || 'General Sport'}
                              </span>
                            </td>

                            {/* Assignment Code */}
                            <td className="py-3.5 px-3 font-mono text-xs text-primary font-semibold">
                              {athleteAsg.assignmentCode || 'N/A'}
                            </td>

                            {/* Duration */}
                            <td className="py-3.5 px-3 text-xs text-muted-foreground">
                              {athleteAsg.startDate ? new Date(athleteAsg.startDate).toLocaleDateString() : 'Active'}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-3 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/dashboard/coach-assignments/${athleteAsg.id}`)}
                                className="h-8 text-xs font-semibold rounded-lg hover:bg-primary/10 hover:text-primary gap-1"
                              >
                                View Details <ExternalLink className="w-3 h-3" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
