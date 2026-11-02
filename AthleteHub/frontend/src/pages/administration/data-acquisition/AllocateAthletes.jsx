import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Share2, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Database,
  ArrowRight,
  Filter,
  Search,
  Trophy,
  Globe,
  UserCheck,
  CheckSquare,
  Square,
  Sparkles
} from 'lucide-react';
import { organizationApi } from '@/api/organizationApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AllocateAthletes() {
  const [allocationMode, setAllocationMode] = useState('criteria'); // 'criteria' | 'individual'
  const [organizations, setOrganizations] = useState([]);
  const [targetOrgId, setTargetOrgId] = useState('');
  const [poolFilters, setPoolFilters] = useState({ sports: [], countries: [], genders: [], totalUnassigned: 0 });
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Criteria mode state
  const [selectedSportId, setSelectedSportId] = useState('ALL');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [allocateCount, setAllocateCount] = useState('');

  // Individual selection state
  const [searchTerm, setSearchTerm] = useState('');
  const [athletesList, setAthletesList] = useState([]);
  const [totalAthletes, setTotalAthletes] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [selectedAthleteIds, setSelectedAthleteIds] = useState(new Set());
  const [loadingAthletes, setLoadingAthletes] = useState(false);

  // Load initial orgs & filter options
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      const [matrixRes, filtersRes] = await Promise.all([
        organizationApi.getOverviewMatrix(),
        organizationApi.getPoolFilters()
      ]);

      if (matrixRes && matrixRes.data) {
        setOrganizations(matrixRes.data.organizations || []);
        if (matrixRes.data.organizations?.length > 0 && !targetOrgId) {
          setTargetOrgId(String(matrixRes.data.organizations[0].id));
        }
      }

      if (filtersRes && filtersRes.data) {
        setPoolFilters(filtersRes.data);
      }
    } catch (err) {
      setError('Failed to load allocation data. Please refresh.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Fetch unassigned athletes for individual selection or criteria preview
  const fetchAthletes = async () => {
    try {
      setLoadingAthletes(true);
      const params = {
        page,
        pageSize,
        search: searchTerm || undefined,
        sportId: selectedSportId !== 'ALL' ? selectedSportId : undefined,
        country: selectedCountry !== 'ALL' ? selectedCountry : undefined,
        gender: selectedGender !== 'ALL' ? selectedGender : undefined,
      };
      const res = await organizationApi.getUnassignedAthletes(params);
      if (res && res.data) {
        setAthletesList(res.data.items || []);
        setTotalAthletes(res.data.totalRecords || 0);
      }
    } catch (err) {
      console.error('Failed to query unassigned athletes', err);
    } finally {
      setLoadingAthletes(false);
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, [page, searchTerm, selectedSportId, selectedCountry, selectedGender]);

  // Checkbox handlers
  const handleToggleAthlete = (id) => {
    setSelectedAthleteIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllCurrentPage = () => {
    const pageIds = athletesList.map(a => a.id);
    const allSelected = pageIds.every(id => selectedAthleteIds.has(id));

    setSelectedAthleteIds(prev => {
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach(id => next.delete(id));
      } else {
        pageIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  // Execution handler
  const handleExecuteAllocation = async (e) => {
    e.preventDefault();
    if (!targetOrgId) {
      setError('Please select a target organization.');
      return;
    }

    try {
      setAllocating(true);
      setError('');
      setResult(null);

      let payload = {
        targetOrganizationId: parseInt(targetOrgId, 10),
      };

      if (allocationMode === 'individual') {
        if (selectedAthleteIds.size === 0) {
          setError('Please select at least one athlete from the table.');
          setAllocating(false);
          return;
        }
        payload.athleteIds = Array.from(selectedAthleteIds);
      } else {
        // Criteria mode
        if (selectedSportId !== 'ALL') {
          payload.sportId = parseInt(selectedSportId, 10);
        }
        if (selectedCountry !== 'ALL') {
          payload.country = selectedCountry;
        }
        if (selectedGender !== 'ALL') {
          payload.gender = selectedGender;
        }
        if (allocateCount && parseInt(allocateCount, 10) > 0) {
          payload.count = parseInt(allocateCount, 10);
        }
      }

      const res = await organizationApi.allocateAthletes(payload);
      
      const targetOrg = organizations.find(o => String(o.id) === String(targetOrgId));
      setResult({
        status: 'success',
        message: res.message || `Successfully allocated ${res.allocatedCount} athletes.`,
        allocatedCount: res.allocatedCount,
        orgName: targetOrg?.name || 'Organization'
      });

      // Clear selections and reload
      setSelectedAthleteIds(new Set());
      setAllocateCount('');
      await loadInitialData();
      await fetchAthletes();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Allocation failed.');
    } finally {
      setAllocating(false);
    }
  };

  const selectedOrg = organizations.find(o => String(o.id) === String(targetOrgId));
  const pageIds = athletesList.map(a => a.id);
  const isPageAllSelected = pageIds.length > 0 && pageIds.every(id => selectedAthleteIds.has(id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Real-World Data Allocation</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Assign imported athletes to organizations matching their sports discipline, nationality, or direct selection.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => { loadInitialData(); fetchAthletes(); }} 
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Pool
        </Button>
      </div>

      {/* Target Organization Selector Bar */}
      <Card className="border-primary/20 bg-muted/20">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Target Organization
              </label>
              <Select value={targetOrgId} onValueChange={setTargetOrgId}>
                <SelectTrigger className="h-10 text-sm font-medium bg-background">
                  <SelectValue placeholder="Choose organization to receive athletes" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map(org => (
                    <SelectItem key={org.id} value={String(org.id)}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{org.name}</span>
                        {org.organizationCode && (
                          <span className="text-xs text-muted-foreground">({org.organizationCode})</span>
                        )}
                        <span className="text-xs text-muted-foreground">· {[org.city, org.country].filter(Boolean).join(', ')}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedOrg && (
              <div className="flex items-center gap-4 border-l pl-4 shrink-0 text-xs text-muted-foreground">
                <div>
                  <span className="block font-bold text-foreground text-sm">
                    {selectedOrg.counts?.athletes || 0}
                  </span>
                  <span>Athletes in Org</span>
                </div>
                <div>
                  <span className="block font-bold text-foreground text-sm">
                    {selectedOrg.counts?.coaches || 0}
                  </span>
                  <span>Coaches</span>
                </div>
                <div>
                  <span className="block font-bold text-foreground text-sm">
                    {selectedOrg.orgAdmin?.name || 'Unassigned'}
                  </span>
                  <span>Org Admin</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mode Switcher Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setAllocationMode('criteria')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            allocationMode === 'criteria'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Filter className="h-4 w-4" />
          Criteria-Based Allocation (Sport, Country, Gender)
        </button>
        <button
          onClick={() => setAllocationMode('individual')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            allocationMode === 'individual'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <CheckSquare className="h-4 w-4" />
          Browse & Select Specific Athletes ({selectedAthleteIds.size} selected)
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="p-4 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold">{result.message}</p>
              <p className="text-xs text-muted-foreground">
                Assigned to <strong>{result.orgName}</strong>.
              </p>
            </div>
          </div>
          <Button size="xs" variant="outline" onClick={() => setResult(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* MODE 1: Criteria-Based Allocation */}
      {allocationMode === 'criteria' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Targeted Criteria Filters
            </CardTitle>
            <CardDescription className="text-xs">
              Distribute athletes matching a specific sport discipline, nationality, or gender into <strong>{selectedOrg?.name || 'the organization'}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Sport Selector */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
                  Sport / Discipline
                </label>
                <Select value={selectedSportId} onValueChange={setSelectedSportId}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="All Sports" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem value="ALL">All Sports ({poolFilters.totalUnassigned})</SelectItem>
                    {poolFilters.sports.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name} ({s.count} available)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Country Selector */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  Country / Nationality
                </label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem value="ALL">All Countries</SelectItem>
                    {poolFilters.countries.slice(0, 30).map(c => (
                      <SelectItem key={c.name} value={c.name}>
                        {c.name} ({c.count} available)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Gender Selector */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  Gender
                </label>
                <Select value={selectedGender} onValueChange={setSelectedGender}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="All Genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Genders</SelectItem>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Matching Pool Preview & Allocation Control */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Matching Unassigned Pool
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-foreground">{totalAthletes}</span>
                  <span className="text-xs text-muted-foreground">
                    athletes match current criteria
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-36">
                  <Input
                    type="number"
                    min="1"
                    max={totalAthletes || 1000}
                    placeholder={`All (${totalAthletes})`}
                    value={allocateCount}
                    onChange={(e) => setAllocateCount(e.target.value)}
                    className="h-9 text-xs bg-background"
                  />
                </div>

                <Button
                  onClick={handleExecuteAllocation}
                  disabled={allocating || totalAthletes === 0 || !targetOrgId}
                  className="gap-2 shrink-0"
                >
                  {allocating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Allocating...
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      Allocate {allocateCount ? `${allocateCount} Athletes` : `All (${totalAthletes})`}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Preview of matching athletes */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                Live Sample of Matching Athletes:
              </p>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 border-b">
                    <tr>
                      <th className="px-3 py-2">Athlete Code</th>
                      <th className="px-3 py-2">Full Name</th>
                      <th className="px-3 py-2">Sport</th>
                      <th className="px-3 py-2">Country</th>
                      <th className="px-3 py-2">Gender</th>
                      <th className="px-3 py-2">Age</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loadingAthletes ? (
                      <tr>
                        <td colSpan="6" className="p-4 text-center text-muted-foreground">
                          Querying matching athletes...
                        </td>
                      </tr>
                    ) : athletesList.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-4 text-center text-muted-foreground">
                          No unassigned athletes match the specified criteria.
                        </td>
                      </tr>
                    ) : (
                      athletesList.slice(0, 5).map(athlete => (
                        <tr key={athlete.id} className="hover:bg-muted/20">
                          <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{athlete.athleteCode}</td>
                          <td className="px-3 py-2 font-medium">{athlete.fullName}</td>
                          <td className="px-3 py-2">
                            <Badge variant="outline" className="text-[10px] bg-primary/5">
                              {athlete.sportName}
                            </Badge>
                          </td>
                          <td className="px-3 py-2">{athlete.country}</td>
                          <td className="px-3 py-2 capitalize">{athlete.gender?.toLowerCase()}</td>
                          <td className="px-3 py-2">{athlete.age ? `${athlete.age} yrs` : 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODE 2: Individual Selection Table */}
      {allocationMode === 'individual' && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <CardTitle className="text-base font-semibold">
                  Browse & Select Candidate Athletes
                </CardTitle>
                <CardDescription className="text-xs">
                  Check individual athletes to allocate to <strong>{selectedOrg?.name || 'target organization'}</strong>.
                </CardDescription>
              </div>

              {/* Search & Filter */}
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search name, code, or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="border-b bg-muted/30 uppercase text-[11px] font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 w-10">
                      <button
                        type="button"
                        onClick={handleSelectAllCurrentPage}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {isPageAllSelected ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-2.5">Athlete</th>
                    <th className="px-4 py-2.5">Sport</th>
                    <th className="px-4 py-2.5">Country</th>
                    <th className="px-4 py-2.5">Gender</th>
                    <th className="px-4 py-2.5">DOB / Age</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {loadingAthletes ? (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-muted-foreground">
                        Loading athletes pool...
                      </td>
                    </tr>
                  ) : athletesList.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-muted-foreground">
                        No unassigned athletes found.
                      </td>
                    </tr>
                  ) : (
                    athletesList.map(a => {
                      const isSelected = selectedAthleteIds.has(a.id);
                      return (
                        <tr 
                          key={a.id} 
                          onClick={() => handleToggleAthlete(a.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary/10' : 'hover:bg-muted/20'
                          }`}
                        >
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleToggleAthlete(a.id)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {isSelected ? (
                                <CheckSquare className="h-4 w-4 text-primary" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-foreground text-sm block">
                              {a.fullName}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {a.athleteCode}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-xs font-medium bg-primary/5 text-primary">
                              {a.sportName}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <span>{a.country || 'N/A'}</span>
                            {a.city && <span className="text-muted-foreground text-[11px] block">{a.city}</span>}
                          </td>
                          <td className="px-4 py-3 capitalize">{a.gender?.toLowerCase() || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <span>{a.dateOfBirth || 'N/A'}</span>
                            {a.age && <span className="text-muted-foreground text-[11px] block">({a.age} yrs)</span>}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination & Sticky Allocation Bar */}
            <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  Showing page {page} of {Math.ceil(totalAthletes / pageSize) || 1} ({totalAthletes} total records)
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= Math.ceil(totalAthletes / pageSize)}
                  >
                    Next
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold">
                  {selectedAthleteIds.size} athletes selected
                </span>
                <Button
                  onClick={handleExecuteAllocation}
                  disabled={allocating || selectedAthleteIds.size === 0 || !targetOrgId}
                  className="gap-2"
                >
                  {allocating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Allocating...
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      Allocate {selectedAthleteIds.size} Selected to {selectedOrg?.name || 'Organization'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
