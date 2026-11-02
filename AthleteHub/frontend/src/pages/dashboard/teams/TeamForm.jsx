import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Shield, 
  Dumbbell, 
  Building2, 
  UserCheck, 
  Layers, 
  Sparkles, 
  Check, 
  AlertCircle,
  Users,
  Search
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { teamApi } from '@/api/teamApi';
import { referenceApi } from '@/api/referenceApi';
import api from '@/api/axios';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { checkGenderEligibility, checkAgeEligibility } from '@/utils/eligibility';

const GENDER_OPTIONS = [
  { id: 'COED', label: 'Coed / Mixed', desc: 'Open to all athletes' },
  { id: 'MALE', label: "Men's", desc: "Male athletic roster" },
  { id: 'FEMALE', label: "Women's", desc: "Female athletic roster" },
];

const AGE_GROUPS = [
  'All Ages',
  'Under-14 (U14)',
  'Under-16 (U16)',
  'Under-17 (U17)',
  'Under-18 (U18)',
  'Under-19 (U19)',
  'Under-21 (U21)',
  'Junior Varsity',
  'Senior Varsity',
  'Collegiate Elite'
];

export default function TeamForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isEditMode = !!id;
  const isAthlete = currentUser?.role === 'ROLE_ATHLETE';
  const isCoach = currentUser?.role === 'ROLE_COACH';

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [sports, setSports] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [myAthlete, setMyAthlete] = useState(null);
  const [selectedCoachId, setSelectedCoachId] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [athleteSearch, setAthleteSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sportId: '',
    gender: 'COED',
    ageGroup: 'All Ages',
    status: 'ACTIVE'
  });

  useEffect(() => {
    // Load sports
    referenceApi.getSports().then(data => {
      const list = Array.isArray(data) ? data : (data?.data || []);
      setSports(list);
    }).catch(err => {
      console.error('Failed to load sports:', err);
      setSports([]);
    });

    // Load organization coaches
    api.get('/coaches').then(res => {
      const list = res.data?.data?.items || res.data?.items || res.data?.data || [];
      const coachList = Array.isArray(list) ? list : [];
      setCoaches(coachList);

      // Auto-assign coach ID if logged in as coach
      if (isCoach && !isEditMode) {
        const myCoach = coachList.find(c => 
          c.userId === currentUser?.id || 
          (c.email && c.email.toLowerCase() === currentUser?.email?.toLowerCase())
        );
        if (myCoach) {
          setSelectedCoachId(String(myCoach.id));
        }
      }
    }).catch(err => {
      console.warn('Failed to load coaches:', err);
      setCoaches([]);
    });

    // Load organization athletes to select teammates
    api.get('/athletes', { params: { pageSize: 100, forSquad: true } }).then(res => {
      const list = res.data?.data?.items || res.data?.items || res.data?.data || [];
      setAthletes(Array.isArray(list) ? list : []);
    }).catch(err => {
      console.warn('Failed to load athletes:', err);
      setAthletes([]);
    });

    // Load current athlete profile if logged in as an athlete
    if (isAthlete) {
      api.get('/athletes/me').then(res => {
        setMyAthlete(res.data?.data || res.data || null);
      }).catch(err => {
        console.warn('Failed to load athlete profile:', err);
      });
    }

    if (isEditMode) {
      loadTeam();
    }
  }, [id, isAthlete]);

  // Auto-prune any selected athletes if team gender or age group changes to an incompatible setting
  useEffect(() => {
    if (selectedMemberIds.length === 0 || athletes.length === 0) return;

    const validMemberIds = selectedMemberIds.filter(id => {
      const a = athletes.find(ath => ath.id === id);
      if (!a) return false;
      if (a.assignedTeamName && a.assignedTeamName !== formData.name) return false;
      const gCheck = checkGenderEligibility(formData.gender, a.gender);
      const aCheck = checkAgeEligibility(formData.ageGroup, a.dateOfBirth, a.age);
      return gCheck.eligible && aCheck.eligible;
    });

    if (validMemberIds.length !== selectedMemberIds.length) {
      setSelectedMemberIds(validMemberIds);
      toast.info('Removed incompatible teammates due to changed gender or age category.');
    }
  }, [formData.gender, formData.ageGroup]);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const data = await teamApi.getTeamById(id);
      if (data) {
        setFormData({
          name: data.name || '',
          description: data.description || '',
          sportId: data.sportId ? String(data.sportId) : '',
          gender: data.gender || 'COED',
          ageGroup: data.ageGroup || 'All Ages',
          status: data.status || 'ACTIVE'
        });
        if (data.coachId) {
          setSelectedCoachId(String(data.coachId));
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load team details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleAthlete = (athlete) => {
    const athleteId = athlete.id;
    if (selectedMemberIds.includes(athleteId)) {
      setSelectedMemberIds(prev => prev.filter(x => x !== athleteId));
      return;
    }

    // Check single-team assignment rule
    if (athlete.assignedTeamName && athlete.assignedTeamName !== formData.name) {
      toast.error(`${athlete.fullName || athlete.firstName} is already assigned to team "${athlete.assignedTeamName}". A player cannot belong to multiple teams.`);
      return;
    }

    // Check gender eligibility
    const genderCheck = checkGenderEligibility(formData.gender, athlete.gender);
    if (!genderCheck.eligible) {
      toast.error(`${athlete.fullName || athlete.firstName}: ${genderCheck.reason}`);
      return;
    }

    // Check age eligibility
    const ageCheck = checkAgeEligibility(formData.ageGroup, athlete.dateOfBirth, athlete.age);
    if (!ageCheck.eligible) {
      toast.error(`${athlete.fullName || athlete.firstName}: ${ageCheck.reason}`);
      return;
    }

    setSelectedMemberIds(prev => [...prev, athleteId]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter a team name.");
      return;
    }

    if (isAthlete && !selectedCoachId) {
      toast.error("Please select a coach from your organization to review and approve your team proposal.");
      return;
    }

    if (isAthlete && myAthlete) {
      if (myAthlete.assignedTeamName && myAthlete.assignedTeamName !== formData.name) {
        toast.error(`You are already assigned to team "${myAthlete.assignedTeamName}". A player cannot belong to multiple teams.`);
        return;
      }
      const creatorGenderCheck = checkGenderEligibility(formData.gender, myAthlete.gender);
      if (!creatorGenderCheck.eligible) {
        toast.error(`Squad Creator gender mismatch: ${creatorGenderCheck.reason}`);
        return;
      }
      const creatorAgeCheck = checkAgeEligibility(formData.ageGroup, myAthlete.dateOfBirth, myAthlete.age);
      if (!creatorAgeCheck.eligible) {
        toast.error(`Squad Creator age mismatch: ${creatorAgeCheck.reason}`);
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      let coachIdToSend = selectedCoachId ? parseInt(selectedCoachId) : null;
      if (isCoach && !coachIdToSend) {
        const myCoach = coaches.find(c => 
          c.userId === currentUser?.id || 
          (c.email && c.email.toLowerCase() === currentUser?.email?.toLowerCase())
        );
        if (myCoach) {
          coachIdToSend = myCoach.id;
        }
      }

      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        sportId: formData.sportId ? parseInt(formData.sportId) : null,
        coachId: coachIdToSend,
        gender: formData.gender,
        ageGroup: formData.ageGroup,
        status: isAthlete ? 'PENDING_APPROVAL' : formData.status,
        memberAthleteIds: selectedMemberIds,
      };

      if (isEditMode) {
        await teamApi.updateTeam(id, payload);
        toast.success(`Team "${formData.name}" updated successfully!`);
      } else {
        const created = await teamApi.createTeam(payload);
        if (isAthlete) {
          toast.success(`Squad proposal "${formData.name}" submitted to coach for review!`);
        } else {
          toast.success(`Team "${formData.name}" created successfully!`);
        }
        if (created?.id) {
          navigate(`/dashboard/teams/${created.id}`);
          return;
        }
      }
      navigate('/dashboard/teams');
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to save team.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading team profile..." />;

  const selectStyle = "flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all";

  return (
    <div className="max-w-3xl mx-auto space-y-6 page-enter pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/dashboard/teams')}
            className="rounded-full h-10 w-10 shrink-0 border-border/60 hover:bg-muted"
            title="Back to Teams"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                {isEditMode ? 'Edit Team Squad' : (isAthlete ? 'Propose Athlete Squad' : 'Create New Team')}
              </h1>
              <Badge variant="outline" className="text-xs uppercase font-semibold text-primary border-primary/30">
                {isEditMode ? 'Editing' : (isAthlete ? 'Proposal' : 'New Squad')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditMode 
                ? 'Update team identity, division, and sport focus.'
                : (isAthlete 
                    ? 'Form your own team among fellow athletes and submit it to a coach for official supervision & approval.' 
                    : 'Define a new athletic squad to group athletes for training, match lineups, and roster management.')}
            </p>
          </div>
        </div>
      </div>

      {/* Affiliation Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-muted/40 border border-border/50 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm">
              {currentUser?.organizationName || 'Current Organization'}
            </div>
            <div className="text-muted-foreground text-[11px]">
              Assigned Athletic Organization
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm">
              {isAthlete 
                ? `Athlete ${currentUser?.full_name || currentUser?.fullName || currentUser?.email} (Squad Creator)`
                : (isCoach 
                    ? `Coach ${currentUser?.full_name || currentUser?.fullName || currentUser?.email}` 
                    : (currentUser?.full_name || currentUser?.fullName || currentUser?.email))}
            </div>
            <div className="text-muted-foreground text-[11px]">
              {isAthlete ? 'Proposing Squad Roster' : (isCoach ? 'Managing Head Coach' : 'Organization Management')}
            </div>
          </div>
        </div>
      </div>

      {/* Athlete Instructions Banner */}
      {isAthlete && (
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground space-y-1">
          <p className="font-bold text-foreground flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-primary" />
            Athlete Squad Formation Guidelines:
          </p>
          <p>
            You can assemble a squad by picking fellow athletes from your organization. Select an active coach to supervise the squad. Once submitted, your squad proposal will be marked as <strong className="text-amber-600 dark:text-amber-400">PENDING APPROVAL</strong> until the coach accepts it.
          </p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-2xl flex items-start gap-3 animate-fade-in shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* Main Form */}
      <Card className="card-premium rounded-3xl border border-border/60 shadow-xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 sm:p-8 space-y-8">
            
            {/* Identity & Sport */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/50 pb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Team Identity & Staff</h2>
                  <p className="text-xs text-muted-foreground">Team name, sport focus, and coach supervision</p>
                </div>
              </div>

              <div className="space-y-4 pt-1">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                    Team Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Sprint Acceleration Squad, Varsity Men's Basketball, U19 Football"
                    className="h-11 rounded-xl text-base"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sportId" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Dumbbell className="w-3.5 h-3.5 text-muted-foreground" />
                      Sport Focus
                    </Label>
                    <select
                      id="sportId"
                      name="sportId"
                      value={formData.sportId}
                      onChange={handleChange}
                      className={selectStyle}
                    >
                      <option value="">Select Sport (Optional)</option>
                      {sports.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ageGroup" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                      Division / Age Group
                    </Label>
                    <select
                      id="ageGroup"
                      name="ageGroup"
                      value={formData.ageGroup}
                      onChange={handleChange}
                      className={selectStyle}
                    >
                      {AGE_GROUPS.map(ag => (
                        <option key={ag} value={ag}>{ag}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Coach Selection */}
                {isCoach ? (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                      Assigned Head Coach
                    </Label>
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm font-semibold text-foreground">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">
                            Coach {currentUser?.full_name || currentUser?.fullName || currentUser?.email}
                          </div>
                          <div className="text-xs text-muted-foreground font-normal">
                            You are automatically assigned as the head coach of this team
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-purple-600/20 text-purple-400 border border-purple-500/30 text-xs">
                        Auto-Assigned
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="coachId" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                      {isAthlete ? "Supervisor Coach (To Review & Approve Team)" : "Assigned Head Coach"} {isAthlete && <span className="text-destructive">*</span>}
                    </Label>
                    <select
                      id="coachId"
                      name="coachId"
                      value={selectedCoachId}
                      onChange={(e) => setSelectedCoachId(e.target.value)}
                      className={selectStyle}
                      required={isAthlete}
                    >
                      <option value="">{isAthlete ? "Select a coach to request approval from" : "Select coach"}</option>
                      {coaches.map(c => (
                        <option key={c.id} value={c.id}>
                          Coach {c.firstName} {c.lastName} {c.specialization ? `(${c.specialization})` : ''}
                        </option>
                      ))}
                    </select>
                    {isAthlete && (
                      <p className="text-[11px] text-muted-foreground">
                        This coach will receive your squad proposal and can review your roster to officially activate the team.
                      </p>
                    )}
                  </div>
                )}

                {/* Squad Teammate Multi-Select for Athletes */}
                <div className="space-y-3 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-primary" />
                        Select Squad Teammates
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Pick fellow athletes to include in your proposed squad. {isAthlete && "(You are automatically included as Captain)." }
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono font-bold text-primary">
                      {selectedMemberIds.length + (isAthlete ? 1 : 0)} Players Selected
                    </Badge>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search athletes by name or code..."
                      value={athleteSearch}
                      onChange={(e) => setAthleteSearch(e.target.value)}
                      className="pl-9 h-9 text-xs rounded-xl"
                    />
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-1.5 p-2 rounded-xl border border-border/60 bg-muted/20 custom-scrollbar">
                    {athletes
                      .filter(a => {
                        const name = (a.fullName || `${a.firstName || ''} ${a.lastName || ''}`).toLowerCase();
                        const code = (a.athleteCode || '').toLowerCase();
                        return name.includes(athleteSearch.toLowerCase()) || code.includes(athleteSearch.toLowerCase());
                      })
                      .map(a => {
                        const isSelected = selectedMemberIds.includes(a.id);
                        const isAlreadyAssigned = Boolean(a.assignedTeamName && a.assignedTeamName !== formData.name);
                        const genderCheck = checkGenderEligibility(formData.gender, a.gender);
                        const ageCheck = checkAgeEligibility(formData.ageGroup, a.dateOfBirth, a.age);
                        const isEligible = !isAlreadyAssigned && genderCheck.eligible && ageCheck.eligible;

                        return (
                          <div
                            key={a.id}
                            onClick={() => toggleAthlete(a)}
                            className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                              !isEligible
                                ? 'opacity-65 bg-muted/30 border-border/40 cursor-not-allowed'
                                : isSelected 
                                  ? 'bg-primary/10 border-primary/40 text-foreground cursor-pointer' 
                                  : 'bg-card border-border/40 hover:bg-muted/40 text-muted-foreground cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-5 h-5 rounded flex items-center justify-center border text-xs ${
                                isSelected ? 'bg-primary border-primary text-white' : 'border-border/80'
                              }`}>
                                {isSelected && <Check className="w-3.5 h-3.5" />}
                              </div>
                              <div>
                                <span className="font-semibold text-xs text-foreground block">
                                  {a.fullName || `${a.firstName} ${a.lastName}`}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {a.athleteCode || `ATH-${a.id}`} • {a.sport?.name || a.sportName || 'Athlete'}
                                  {a.age ? ` • ${a.age} yrs` : ''}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap justify-end">
                              {isAlreadyAssigned ? (
                                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                                  In Team: {a.assignedTeamName}
                                </Badge>
                              ) : !genderCheck.eligible ? (
                                <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">
                                  Gender Mismatch ({a.gender})
                                </Badge>
                              ) : !ageCheck.eligible ? (
                                <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">
                                  Exceeds Age ({ageCheck.age} &gt; {ageCheck.maxAge})
                                </Badge>
                              ) : (
                                <>
                                  {a.gender && (
                                    <Badge variant="outline" className="text-[10px]">
                                      {a.gender}
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                                    Eligible
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

              </div>
            </div>

            {/* Category / Gender */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/50 pb-3">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Roster Category</h2>
                  <p className="text-xs text-muted-foreground">Select competition gender bracket</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {GENDER_OPTIONS.map(opt => {
                  const isSelected = formData.gender === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gender: opt.id }))}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        isSelected 
                          ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20 shadow-sm' 
                          : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-bold text-sm text-foreground">{opt.label}</span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description & Mission */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-foreground">
                  Team Focus & Objectives (Optional)
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Outline the team's primary competition targets, training schedule emphasis, or team guidelines..."
                  className="min-h-[110px] rounded-2xl p-4 text-sm"
                />
              </div>
            </div>

          </CardContent>

          {/* Form Actions Footer */}
          <div className="p-6 sm:p-8 border-t border-border/50 bg-muted/20 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/teams')}
              className="w-full sm:w-auto rounded-full px-6 h-11 text-sm font-medium border-border/60 hover:bg-muted"
            >
              Cancel
            </Button>
            
            <Button 
              type="submit" 
              disabled={saving} 
              className="w-full sm:w-auto rounded-full px-8 h-11 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Submitting Proposal...' : (isAthlete ? 'Submit Squad Proposal to Coach' : (isEditMode ? 'Update Team' : 'Create Team & Open Roster'))}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
