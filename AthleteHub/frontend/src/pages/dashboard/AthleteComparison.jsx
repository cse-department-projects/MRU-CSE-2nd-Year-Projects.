import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { athleteApi } from '@/api/athleteApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Search, X, Users, Activity, Heart, Trophy, User, 
  Plus, Award, Scale, ArrowRight, ShieldCheck, Sparkles, 
  RotateCcw, ExternalLink, Zap
} from 'lucide-react';
import { toast } from 'sonner';

export default function AthleteComparison() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  
  // Parse initial athlete IDs from URL query params (?ids=1,2 or ?athletes=1,2)
  const initialIds = useMemo(() => {
    const rawIds = searchParams.get('ids') || searchParams.get('athletes');
    if (rawIds) {
      return rawIds
        .split(',')
        .map(id => parseInt(id.trim(), 10))
        .filter(id => !isNaN(id) && id > 0)
        .slice(0, 4);
    }
    return [];
  }, [searchParams]);

  const [selectedAthleteIds, setSelectedAthleteIds] = useState(initialIds);

  // Sync state to URL search parameters
  const updateUrlParams = (newIds) => {
    if (newIds.length > 0) {
      setSearchParams({ ids: newIds.join(',') }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  // Fetch available athletes from the organization roster (for instant pick & pre-population)
  const { 
    data: rosterResponse, 
    isLoading: isLoadingRoster 
  } = useQuery({
    queryKey: ['athletes-roster-for-comparison'],
    queryFn: () => athleteApi.getAthletes({ pageSize: 30, forComparison: true }),
    staleTime: 60 * 1000,
  });

  const rosterAthletes = rosterResponse?.data || [];

  // If user opened page without URL params and hasn't picked athletes yet, auto-select first 2 from roster
  useEffect(() => {
    if (selectedAthleteIds.length === 0 && rosterAthletes.length > 0 && !searchParams.get('ids') && !searchParams.get('athletes')) {
      const autoPick = rosterAthletes.slice(0, Math.min(2, rosterAthletes.length)).map(a => a.id);
      if (autoPick.length > 0) {
        setSelectedAthleteIds(autoPick);
        updateUrlParams(autoPick);
      }
    }
  }, [rosterAthletes, selectedAthleteIds.length, searchParams]);

  // Fetch search results if typing
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['athletes-search-comparison', searchQuery],
    queryFn: () => athleteApi.getAthletes({ search: searchQuery, pageSize: 8, forComparison: true }),
    enabled: searchQuery.trim().length >= 1,
  });

  // Fetch full details for selected athletes
  const { data: athletesData = [], isLoading: isLoadingAthletes } = useQuery({
    queryKey: ['athletes-comparison-details', selectedAthleteIds],
    queryFn: async () => {
      const promises = selectedAthleteIds.map(async (id) => {
        try {
          return await athleteApi.getAthleteById(id);
        } catch (err) {
          console.error(`Failed to load athlete ${id}:`, err);
          return null;
        }
      });
      const results = await Promise.all(promises);
      return results.filter(Boolean);
    },
    enabled: selectedAthleteIds.length > 0,
  });

  const handleAddAthlete = (athlete) => {
    if (selectedAthleteIds.length >= 4) {
      toast.warning('You can compare a maximum of 4 athletes.');
      return;
    }
    if (!selectedAthleteIds.includes(athlete.id)) {
      const updated = [...selectedAthleteIds, athlete.id];
      setSelectedAthleteIds(updated);
      updateUrlParams(updated);
      toast.success(`Added ${athlete.fullName || athlete.firstName || 'Athlete'} to comparison.`);
    }
    setSearchQuery('');
  };

  const handleRemoveAthlete = (id) => {
    const updated = selectedAthleteIds.filter(aId => aId !== id);
    setSelectedAthleteIds(updated);
    updateUrlParams(updated);
  };

  const handleClearAll = () => {
    setSelectedAthleteIds([]);
    updateUrlParams([]);
  };

  const handleAutoCompareTop = () => {
    if (rosterAthletes.length === 0) return;
    const sorted = [...rosterAthletes].sort((a, b) => (b.performanceRating || 0) - (a.performanceRating || 0));
    const topPick = sorted.slice(0, Math.min(3, sorted.length)).map(a => a.id);
    setSelectedAthleteIds(topPick);
    updateUrlParams(topPick);
    toast.success('Selected top performing athletes for comparison.');
  };

  // Calculate BMI helper
  const calculateBMI = (heightCm, weightKg) => {
    if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return null;
    const heightM = heightCm / 100;
    const bmi = (weightKg / (heightM * heightM)).toFixed(1);
    let category = 'Normal';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi >= 25 && bmi < 30) category = 'Overweight';
    else if (bmi >= 30) category = 'Obese';
    return { value: bmi, category };
  };

  // Determine highest rating among selected
  const highestRating = useMemo(() => {
    if (!athletesData || athletesData.length === 0) return null;
    const ratings = athletesData.map(a => a.performanceRating || 0);
    const max = Math.max(...ratings);
    return max > 0 ? max : null;
  }, [athletesData]);

  const compareFields = [
    { label: 'Basic Info', isHeader: true },
    { label: 'Athlete Code', key: (a) => <span className="font-mono text-xs text-muted-foreground">{a.athleteCode || `ATH-${a.id}`}</span> },
    { label: 'Sport', key: (a) => (
      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
        {a.sport?.name || 'Not Assigned'}
      </Badge>
    ) },
    { label: 'Organization', key: (a) => a.organizationName || 'N/A' },
    { label: 'Assigned Coach', key: (a) => a.assignedCoachName || <span className="text-muted-foreground italic">None</span> },
    
    { label: 'Physical Profile', isHeader: true },
    { label: 'Age / Gender', key: (a) => `${a.age || '—'} yrs / ${a.gender || '—'}` },
    { label: 'Height', key: (a) => a.height ? `${a.height} cm` : '—' },
    { label: 'Weight', key: (a) => a.weight ? `${a.weight} kg` : '—' },
    { label: 'Calculated BMI', key: (a) => {
      const bmi = calculateBMI(a.height, a.weight);
      if (!bmi) return '—';
      return (
        <div className="flex items-center gap-1.5">
          <span className="font-semibold">{bmi.value}</span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{bmi.category}</Badge>
        </div>
      );
    } },
    { label: 'Blood Group', key: (a) => a.bloodGroup ? <span className="font-semibold">{a.bloodGroup}</span> : '—' },

    { label: 'Telemetry & Readiness', isHeader: true },
    { label: 'Medical Status', key: (a) => {
      const isFit = a.medicalStatus === 'Fit';
      const isInjured = a.medicalStatus === 'Injured' || a.medicalStatus === 'Restricted';
      return (
        <Badge variant="outline" className={
          isFit ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 
          isInjured ? 'bg-destructive/10 text-destructive border-destructive/20' : 
          'bg-amber-500/10 text-amber-600 border-amber-500/20'
        }>
          {a.medicalStatus || 'Unknown'}
        </Badge>
      );
    } },
    { label: 'Performance Rating', key: (a) => {
      const rating = a.performanceRating ?? 0;
      const isTop = highestRating && rating === highestRating;
      return (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold font-mono ${isTop ? 'text-primary' : 'text-foreground'}`}>
              {rating}
            </span>
            <span className="text-muted-foreground text-xs font-normal">/ 100</span>
            {isTop && (
              <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px] px-1.5 py-0 flex items-center gap-1">
                <Trophy className="h-3 w-3" /> Top
              </Badge>
            )}
          </div>
          <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                rating >= 80 ? 'bg-emerald-500' : rating >= 50 ? 'bg-primary' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, rating))}%` }}
            />
          </div>
        </div>
      );
    } },
    { label: 'System Status', key: (a) => (
      <Badge variant="outline" className={a.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : ''}>
        {a.status || 'Active'}
      </Badge>
    ) },
    { label: 'Achievements', key: (a) => {
      const count = Array.isArray(a.achievements) ? a.achievements.length : 0;
      return (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Award className="h-3.5 w-3.5 text-amber-500" />
          <span>{count} recorded</span>
        </div>
      );
    } },
    { label: 'Action', key: (a) => (
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-7 px-2 text-xs text-primary hover:bg-primary/10 gap-1"
        onClick={() => navigate(`/dashboard/athletes/${a.id}`)}
      >
        View Profile <ExternalLink className="h-3 w-3" />
      </Button>
    ) }
  ];

  return (
    <div className="space-y-8 page-enter pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up stagger-1">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
              <Zap className="h-3 w-3 mr-1" /> Performance Analytics
            </Badge>
            <span className="text-xs text-muted-foreground">Side-by-Side Telemetry Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3 text-gradient-primary">
            <div className="p-2.5 bg-primary/10 rounded-2xl border border-primary/20 shadow-sm">
              <Users className="h-7 w-7 text-primary" />
            </div>
            Athlete Comparison
          </h1>
          <p className="text-muted-foreground mt-2 text-base font-normal max-w-2xl">
            Compare up to 4 athletes on biometric stats, telemetry, medical readiness, and performance ratings side-by-side.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {selectedAthleteIds.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearAll}
              className="rounded-xl h-9 text-xs gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear All ({selectedAthleteIds.length})
            </Button>
          )}
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleAutoCompareTop}
            className="rounded-xl h-9 text-xs gap-1.5 font-semibold shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Compare Top Rated
          </Button>
        </div>
      </div>

      {/* Athlete Search & Selection Bar */}
      <Card className="card-premium overflow-visible border-border/80 shadow-md">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Type athlete name, sport, or code to search and add..." 
                  className="pl-10 h-11 bg-background/80 rounded-xl text-sm border-border/60 focus-visible:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg" 
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}

                {/* Instant Search Dropdown Popover */}
                {searchQuery.trim().length >= 1 && (
                  <div className="absolute top-12 left-0 right-0 bg-popover/95 backdrop-blur-md border border-border/80 shadow-xl rounded-xl overflow-hidden z-50 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                    {isSearching ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">Searching athletes...</div>
                    ) : searchResults?.data?.length > 0 ? (
                      <div className="py-2 divide-y divide-border/40">
                        {searchResults.data.map((athlete) => {
                          const isAlreadySelected = selectedAthleteIds.includes(athlete.id);
                          return (
                            <div 
                              key={athlete.id} 
                              className={`px-4 py-2.5 hover:bg-muted/60 transition-colors flex items-center justify-between cursor-pointer ${
                                isAlreadySelected ? 'opacity-60 bg-muted/20' : ''
                              }`}
                              onClick={() => !isAlreadySelected && handleAddAthlete(athlete)}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border border-border/60">
                                  <AvatarImage src={athlete.profilePhotoUrl} />
                                  <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                                    {(athlete.fullName || athlete.firstName || '?').substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-sm text-foreground">
                                    {athlete.fullName || `${athlete.firstName} ${athlete.lastName}`}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {athlete.sport?.name || 'All-Round'} · Rating: <span className="font-semibold text-foreground">{athlete.performanceRating ?? '—'}</span>
                                  </p>
                                </div>
                              </div>
                              {isAlreadySelected ? (
                                <Badge variant="secondary" className="text-xs">Selected</Badge>
                              ) : (
                                <Button size="sm" variant="default" className="h-7 px-3 text-xs rounded-lg gap-1">
                                  <Plus className="h-3 w-3" /> Add
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No athletes found matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Comparing <strong className="text-foreground">{selectedAthleteIds.length}</strong> of 4 athletes</span>
              </div>
            </div>

            {/* Quick-Pick Roster Tray */}
            {rosterAthletes.length > 0 && (
              <div className="pt-3 border-t border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Quick Select from Roster:
                </p>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {rosterAthletes.slice(0, 12).map((athlete) => {
                    const isSelected = selectedAthleteIds.includes(athlete.id);
                    return (
                      <button
                        key={athlete.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            handleRemoveAthlete(athlete.id);
                          } else {
                            handleAddAthlete(athlete);
                          }
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all shrink-0 ${
                          isSelected 
                            ? 'bg-primary text-primary-foreground border-primary shadow-xs' 
                            : 'bg-muted/40 hover:bg-muted/80 text-foreground border-border/60'
                        }`}
                      >
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[10px] font-bold">
                            {(athlete.fullName || athlete.firstName || '?').substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate max-w-[110px]">{athlete.fullName || athlete.firstName}</span>
                        {isSelected ? (
                          <X className="h-3 w-3 ml-0.5 opacity-80" />
                        ) : (
                          <Plus className="h-3 w-3 ml-0.5 opacity-60" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Side-by-Side Comparison Area */}
      {selectedAthleteIds.length > 0 ? (
        <div className="space-y-6">
          {isLoadingAthletes ? (
            <Card className="card-telemetry-elevated p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-sm text-muted-foreground font-medium">Loading telemetry and athlete comparison data...</p>
            </Card>
          ) : (
            <div className="overflow-x-auto pb-4 rounded-2xl shadow-xl border border-border/60 bg-card/90 backdrop-blur-xl">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/60">
                    <th className="p-5 text-left font-bold text-xs uppercase tracking-wider text-muted-foreground/90 w-52 shrink-0">
                      Metric / Attribute
                    </th>
                    {athletesData.map((athlete) => (
                      <th key={athlete.id} className="p-6 text-left border-l border-border/60 min-w-[260px] relative align-top">
                        {/* Remove Athlete Button */}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-3 right-3 h-7 w-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          onClick={() => handleRemoveAthlete(athlete.id)}
                          title="Remove from comparison"
                        >
                          <X className="h-4 w-4" />
                        </Button>

                        {/* Athlete Header Card */}
                        <div className="flex flex-col items-center text-center space-y-3 pt-1">
                          <Avatar className="h-20 w-20 border-2 border-primary/30 shadow-md">
                            <AvatarImage src={athlete.profilePhotoUrl} />
                            <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                              {(athlete.fullName || athlete.firstName || '?').substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-base text-foreground">
                              {athlete.fullName || `${athlete.firstName} ${athlete.lastName}`}
                            </p>
                            <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                              {athlete.athleteCode || `ATH-${athlete.id}`}
                            </p>
                            <Badge variant="outline" className="mt-2 text-xs bg-muted/60">
                              {athlete.sport?.name || 'All-Round'}
                            </Badge>
                          </div>
                        </div>
                      </th>
                    ))}

                    {/* Empty Slots to complete 4-column layout */}
                    {Array.from({ length: Math.max(0, 4 - athletesData.length) }).map((_, i) => (
                      <th key={`empty-slot-${i}`} className="p-6 border-l border-border/60 min-w-[260px] bg-muted/10">
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground/60 space-y-3 py-8">
                          <div className="h-14 w-14 rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-muted/20">
                            <User className="h-6 w-6 opacity-40" />
                          </div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Empty Slot</span>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs rounded-xl gap-1 mt-1 border-dashed"
                            onClick={() => {
                              searchInputRef.current?.focus();
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                          >
                            <Plus className="h-3 w-3" /> Select Athlete
                          </Button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {compareFields.map((field, index) => (
                    field.isHeader ? (
                      <tr key={`header-${index}`} className="bg-muted/30 border-b border-border/60">
                        <td colSpan={5} className="p-3 px-5 font-bold text-xs uppercase tracking-wider text-primary">
                          {field.label}
                        </td>
                      </tr>
                    ) : (
                      <tr key={`row-${index}`} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                        <td className="p-4 px-5 font-medium text-xs uppercase tracking-wider text-muted-foreground/80 shrink-0">
                          {field.label}
                        </td>
                        {athletesData.map((athlete) => (
                          <td key={`${athlete.id}-${index}`} className="p-4 border-l border-border/40 font-medium text-sm">
                            {field.key(athlete)}
                          </td>
                        ))}
                        {Array.from({ length: Math.max(0, 4 - athletesData.length) }).map((_, i) => (
                          <td key={`empty-td-${i}-${index}`} className="p-4 border-l border-border/40 bg-muted/5 text-center text-muted-foreground/40 text-xs">
                            —
                          </td>
                        ))}
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Empty State Card if user removed all athletes */
        <Card className="card-telemetry-elevated border-dashed">
          <CardContent className="p-16 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Athletes Currently Selected</h3>
            <p className="text-muted-foreground text-sm max-w-md mb-6">
              Pick athletes from your organization roster above or use the search bar to compare up to 4 athletes.
            </p>
            <div className="flex items-center gap-3">
              <Button onClick={handleAutoCompareTop} className="gap-2 rounded-xl">
                <Sparkles className="h-4 w-4" /> Compare Top Athletes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
