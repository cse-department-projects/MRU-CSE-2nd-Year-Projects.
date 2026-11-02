import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coachAssignmentApi } from '@/api/coachAssignmentApi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Users,
  Search,
  CheckCircle2,
  Calendar,
  Sparkles,
  Trophy,
  Filter,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

export default function AssignAthletesModal({ coachId, isOpen, onClose, onAssigned }) {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedSport, setSelectedSport] = useState('MATCHING'); // 'MATCHING', 'ALL', or specific sport
  const [selectedAthleteIds, setSelectedAthleteIds] = useState(new Set());
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('Primary Sport Coach');

  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ['assignmentCandidates', coachId],
    queryFn: () => coachAssignmentApi.getCandidates(coachId),
    enabled: isOpen && !!coachId,
  });

  const coach = response?.data?.coach;
  const candidates = response?.data?.candidates || [];
  const uniqueSports = response?.data?.uniqueSports || [];

  // Reset selections when modal opens for a new coach
  useEffect(() => {
    if (isOpen) {
      setSelectedSport('MATCHING');
      setSearch('');
      setSelectedAthleteIds(new Set());
      setStartDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, coachId]);

  // Pre-select matching unassigned athletes by default once candidates load
  useEffect(() => {
    if (candidates.length > 0) {
      const matchingUnassigned = candidates
        .filter(c => c.matchesCoachSport && !c.isAlreadyAssigned)
        .map(c => c.id);
      setSelectedAthleteIds(new Set(matchingUnassigned));
    }
  }, [candidates]);

  // Filter candidates based on sport tab and search
  const filteredCandidates = candidates.filter(candidate => {
    // Sport match
    if (selectedSport === 'MATCHING' && !candidate.matchesCoachSport) {
      return false;
    }
    if (selectedSport !== 'MATCHING' && selectedSport !== 'ALL' && candidate.sportName !== selectedSport) {
      return false;
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = candidate.fullName?.toLowerCase().includes(q);
      const matchCode = candidate.athleteCode?.toLowerCase().includes(q);
      const matchSport = candidate.sportName?.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchSport) return false;
    }

    return true;
  });

  const matchingCount = candidates.filter(c => c.matchesCoachSport).length;
  const assignableFiltered = filteredCandidates.filter(c => !c.isAlreadyAssigned);

  const isAllFilteredSelected =
    assignableFiltered.length > 0 &&
    assignableFiltered.every(c => selectedAthleteIds.has(c.id));

  const toggleSelectAllFiltered = () => {
    const next = new Set(selectedAthleteIds);
    if (isAllFilteredSelected) {
      assignableFiltered.forEach(c => next.delete(c.id));
    } else {
      assignableFiltered.forEach(c => next.add(c.id));
    }
    setSelectedAthleteIds(next);
  };

  const toggleSelectAthlete = (id) => {
    const next = new Set(selectedAthleteIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedAthleteIds(next);
  };

  const assignMutation = useMutation({
    mutationFn: (payload) => coachAssignmentApi.createBulkAssignments(payload),
    onSuccess: (res) => {
      const count = res.data?.assignedCount || selectedAthleteIds.size;
      toast.success(`Successfully assigned ${count} athletes to Coach ${coach?.fullName}!`);
      queryClient.invalidateQueries(['coachAssignments']);
      queryClient.invalidateQueries(['recentCoachAssignments']);
      queryClient.invalidateQueries(['coachesLookup']);
      queryClient.invalidateQueries(['athletesLookup']);
      if (onAssigned) onAssigned();
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to complete athlete assignments.');
    }
  });

  const handleAssign = () => {
    if (selectedAthleteIds.size === 0) {
      toast.error('Please select at least one athlete to assign.');
      return;
    }

    assignMutation.mutate({
      coachId,
      athleteIds: Array.from(selectedAthleteIds),
      startDate,
      remarks: remarks.trim() || 'Primary Sport Coach'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-3xl border border-border/80">
        {/* Header */}
        <DialogHeader className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/60">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="font-mono text-xs bg-primary/10 text-primary border-primary/20">
                  {coach?.coachCode || 'COACH'}
                </Badge>
                <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0 text-xs">
                  {coach?.specialization || 'Athletics'}
                </Badge>
              </div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Assign Athletes to {coach?.fullName || 'Coach'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Automatically matches athletes in your organization based on the coach's sport specialization.
              </DialogDescription>
            </div>
            <div className="hidden sm:flex flex-col items-end text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{coach?.experienceYears || 0} Years Exp</span>
              <span>Sport: {coach?.specialization || 'General'}</span>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <Users className="w-8 h-8 animate-pulse text-primary mx-auto" />
              <p className="text-xs text-muted-foreground">Scanning organization athletes & matching sports...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
              <h4 className="font-bold text-foreground text-sm">No Athletes Found in Organization</h4>
              <p className="text-xs text-muted-foreground">
                Your organization doesn't have any athletes registered yet. Add or import athletes first.
              </p>
            </div>
          ) : (
            <>
              {/* Sport Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-muted/40 border border-border/50 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedSport('MATCHING')}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                    selectedSport === 'MATCHING'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Matching Sport ({matchingCount})
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSport('ALL')}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                    selectedSport === 'ALL'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All Athletes ({candidates.length})
                </button>

                {uniqueSports.map((sp) => (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => setSelectedSport(sp)}
                    className={`px-2.5 py-1.5 rounded-xl font-medium transition-all ${
                      selectedSport === sp
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {sp}
                  </button>
                ))}
              </div>

              {/* Search & Bulk Select Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    size="sm"
                    placeholder="Search by athlete name or code..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-9 text-xs rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer select-none">
                    <Checkbox
                      checked={isAllFilteredSelected}
                      onCheckedChange={toggleSelectAllFiltered}
                      disabled={assignableFiltered.length === 0}
                    />
                    <span>Select All Filtered ({assignableFiltered.length})</span>
                  </label>
                  <span className="text-xs font-mono text-primary font-bold">
                    {selectedAthleteIds.size} Selected
                  </span>
                </div>
              </div>

              {/* Candidates List */}
              <div className="border border-border/60 rounded-2xl overflow-hidden divide-y divide-border/40 max-h-72 overflow-y-auto">
                {filteredCandidates.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No athletes match the current filter or search criteria.
                  </div>
                ) : (
                  filteredCandidates.map((candidate) => {
                    const isSelected = selectedAthleteIds.has(candidate.id);
                    const isAssigned = candidate.isAlreadyAssigned;

                    return (
                      <div
                        key={candidate.id}
                        onClick={() => {
                          if (!isAssigned) toggleSelectAthlete(candidate.id);
                        }}
                        className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                          isAssigned
                            ? 'bg-muted/20 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-primary/5 cursor-pointer'
                            : 'hover:bg-muted/30 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Checkbox
                            checked={isSelected}
                            disabled={isAssigned}
                            onCheckedChange={() => toggleSelectAthlete(candidate.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-foreground truncate">
                                {candidate.fullName}
                              </span>
                              <span className="text-[11px] font-mono text-muted-foreground">
                                {candidate.athleteCode}
                              </span>
                              {candidate.matchesCoachSport && (
                                <Badge className="text-[10px] h-4 px-1.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                  Sport Match
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              <span className="font-medium text-foreground">{candidate.sportName}</span>
                              {candidate.gender && <span>• {candidate.gender}</span>}
                              {candidate.age && <span>• {candidate.age} yrs</span>}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          {isAssigned ? (
                            <Badge variant="outline" className="text-[11px] font-medium bg-muted/60 text-muted-foreground">
                              Already Assigned
                            </Badge>
                          ) : isSelected ? (
                            <Badge className="text-[11px] font-medium bg-primary text-primary-foreground">
                              Selected
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground hover:text-primary">
                              Click to select
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Assignment Configuration Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    Assignment Start Date
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-primary" />
                    Role & Remarks
                  </label>
                  <Input
                    placeholder="e.g. Primary Sport Coach, Specialist"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 bg-muted/20 border-t border-border/60 flex flex-row items-center justify-between sm:justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            <strong className="text-foreground">{selectedAthleteIds.size}</strong> athlete(s) will be assigned
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAssign}
              disabled={selectedAthleteIds.size === 0 || assignMutation.isPending}
              className="rounded-xl text-xs gap-1.5 font-semibold"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {assignMutation.isPending ? 'Assigning...' : `Assign ${selectedAthleteIds.size} Athletes`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
