import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { referenceApi } from '../../api/referenceApi';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { 
  ArrowLeft, 
  Save, 
  Dumbbell, 
  Calendar, 
  Building2, 
  UserCheck, 
  Sparkles, 
  Clock, 
  Layers, 
  Check, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../lib/permissions';

const DIFFICULTY_CONFIG = [
  {
    id: 'BEGINNER',
    label: 'Beginner',
    desc: 'Foundational conditioning & core athletic mechanics',
    color: 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5 hover:border-emerald-500/60',
    activeColor: 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/30'
  },
  {
    id: 'INTERMEDIATE',
    label: 'Intermediate',
    desc: 'Progressive volume, threshold workloads & sports tactics',
    color: 'border-amber-500/30 text-amber-500 bg-amber-500/5 hover:border-amber-500/60',
    activeColor: 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/30'
  },
  {
    id: 'ADVANCED',
    label: 'Advanced',
    desc: 'High-intensity competition readiness & peak performance',
    color: 'border-purple-500/30 text-purple-500 bg-purple-500/5 hover:border-purple-500/60',
    activeColor: 'border-purple-500 bg-purple-500/15 text-purple-600 dark:text-purple-400 ring-2 ring-purple-500/30'
  }
];

const STATUS_OPTIONS = [
  { id: 'DRAFT', label: 'Draft', color: 'bg-muted text-muted-foreground hover:bg-muted/80' },
  { id: 'ACTIVE', label: 'Active', color: 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-emerald-500/30' },
  { id: 'COMPLETED', label: 'Completed', color: 'bg-blue-500/15 text-blue-500 hover:bg-blue-500/25 border-blue-500/30' },
  { id: 'ARCHIVED', label: 'Archived', color: 'bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 border-amber-500/30' }
];

const QUICK_DURATIONS = [2, 4, 6, 8, 12, 16, 24];

export default function TrainingPlanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { can } = usePermissions();
  const isEditMode = !!id;
  const isSuperAdmin = currentUser?.role === 'ROLE_SUPER_ADMIN' || currentUser?.role === 'SUPER_ADMIN';

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode && !can(PERMISSIONS.TRAINING_UPDATE)) {
      toast.error('You do not have permission to edit training plans.');
      navigate('/dashboard/training-plans', { replace: true });
    } else if (!isEditMode && !can(PERMISSIONS.TRAINING_CREATE)) {
      toast.error('Only coaches can create training plans.');
      navigate('/dashboard/training-plans', { replace: true });
    }
  }, [can, isEditMode, navigate]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sportId: '',
    organizationId: currentUser?.organizationId ? String(currentUser.organizationId) : '',
    difficultyLevel: 'BEGINNER',
    durationWeeks: 4,
    status: 'DRAFT',
    createdBy: '',
  });

  const [coaches, setCoaches] = useState([]);
  const [sports, setSports] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    fetchOptions();
    if (isEditMode) {
      fetchPlan();
    }
  }, [id]);

  const fetchOptions = async () => {
    // 1. Fetch sports independently - vital for all users
    try {
      const sportsRes = await referenceApi.getSports();
      const sportList = Array.isArray(sportsRes) ? sportsRes : (sportsRes?.data || []);
      setSports(sportList);
    } catch (err) {
      console.error('Failed to fetch sports', err);
    }

    // 2. Fetch coaches list for binding/selection
    let coachList = [];
    try {
      const coachesRes = await api.get('/coaches', { params: { page_size: 100 } });
      coachList = coachesRes.data?.data || coachesRes.data || [];
      setCoaches(coachList);
    } catch (err) {
      console.warn('Failed to fetch coaches list', err);
    }

    // 3. Organizations list is only needed for Super Admins
    if (isSuperAdmin) {
      try {
        const orgsRes = await referenceApi.getOrganizations();
        setOrganizations(Array.isArray(orgsRes) ? orgsRes : (orgsRes?.data || []));
      } catch (err) {
        console.warn('Failed to fetch organizations list', err);
      }
    }

    // Auto-bind organization and creator coach for new plans
    if (!isEditMode && currentUser) {
      const userOrgId = currentUser.organizationId || currentUser.organization?.id;
      const matchingCoach = coachList.find(c => c.email === currentUser.email || c.userId === currentUser.id);
      
      setFormData(prev => ({
        ...prev,
        organizationId: userOrgId ? String(userOrgId) : prev.organizationId,
        createdBy: matchingCoach ? String(matchingCoach.id) : prev.createdBy,
      }));
    }
  };

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/training-plans/${id}`);
      const data = response.data?.data || response.data;
      
      setFormData({
        title: data.title || '',
        description: data.description || '',
        sportId: data.sportId || data.sport?.id || '',
        organizationId: data.organizationId || data.organization?.id || '',
        difficultyLevel: data.difficultyLevel || 'BEGINNER',
        durationWeeks: data.durationWeeks || 4,
        status: data.status || 'DRAFT',
        createdBy: data.createdBy || data.creator?.id || ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load plan details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        sportId: formData.sportId ? parseInt(formData.sportId) : null,
        organizationId: formData.organizationId 
          ? parseInt(formData.organizationId) 
          : (currentUser?.organizationId ? parseInt(currentUser.organizationId) : null),
        createdBy: formData.createdBy ? parseInt(formData.createdBy) : null,
        difficultyLevel: formData.difficultyLevel,
        durationWeeks: formData.durationWeeks ? parseInt(formData.durationWeeks) : 4,
        status: formData.status,
      };

      if (isEditMode) {
        await api.put(`/training-plans/${id}`, payload);
        toast.success("Training plan updated successfully!");
      } else {
        await api.post('/training-plans', payload);
        toast.success("Training plan created successfully!");
      }
      navigate('/dashboard/training-plans');
    } catch (err) {
      const errMsg = err.response?.data?.message || (Array.isArray(err.response?.data?.errors) ? err.response.data.errors.join(', ') : null) || err.message || 'Failed to save training plan';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading training plan form..." />;

  const selectStyle = "flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all";

  return (
    <div className="max-w-4xl mx-auto space-y-6 page-enter pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/dashboard/training-plans')}
            className="rounded-full h-10 w-10 shrink-0 border-border/60 hover:bg-muted"
            title="Back to Training Plans"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                {isEditMode ? 'Edit Training Plan' : 'Create Training Plan'}
              </h1>
              <Badge variant="outline" className="text-xs uppercase font-semibold tracking-wider text-primary border-primary/30">
                {isEditMode ? 'Editing' : 'New'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditMode 
                ? 'Update curriculum parameters, targets, and assigned coaching staff.' 
                : 'Configure a structured training regimen with targeted difficulty, duration, and coaches.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge 
            variant="outline"
            className="px-3 py-1 font-medium capitalize text-xs"
          >
            Status: <span className="font-bold ml-1 text-foreground">{formData.status.toLowerCase()}</span>
          </Badge>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-2xl flex items-start gap-3 animate-fade-in shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm font-medium">
            {error}
          </div>
        </div>
      )}

      {/* Affiliation & Author Context Banner */}
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
              Affiliated Organization
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm">
              Coach {currentUser?.fullName || currentUser?.email}
            </div>
            <div className="text-muted-foreground text-[11px]">
              Training Lead & Supervisor
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <Card className="card-premium rounded-3xl border border-border/60 shadow-xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 sm:p-8 space-y-8">
            
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/50 pb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Plan Overview</h2>
                  <p className="text-xs text-muted-foreground">Primary identity and target sport of the training plan</p>
                </div>
              </div>

              <div className="space-y-4 pt-1">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold text-foreground">
                    Plan Title <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="title"
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    placeholder="e.g. Pre-Season Sprint Acceleration & Speed Endurance"
                    className="h-11 rounded-xl"
                    required 
                  />
                </div>

                <div className={`grid grid-cols-1 ${isSuperAdmin ? 'md:grid-cols-2' : ''} gap-6`}>
                  <div className="space-y-2">
                    <Label htmlFor="sportId" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Dumbbell className="w-3.5 h-3.5 text-muted-foreground" />
                      Primary Sport <span className="text-destructive">*</span>
                    </Label>
                    <select 
                      id="sportId"
                      name="sportId" 
                      value={formData.sportId} 
                      onChange={handleChange} 
                      className={selectStyle}
                      required
                    >
                      <option value="">Select a Sport</option>
                      {sports.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} {s.category ? `(${s.category})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isSuperAdmin && (
                    <div className="space-y-2">
                      <Label htmlFor="organizationId" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                        Organization <span className="text-destructive">*</span>
                      </Label>
                      <select 
                        id="organizationId"
                        name="organizationId" 
                        value={formData.organizationId} 
                        onChange={handleChange} 
                        className={selectStyle}
                        required
                      >
                        <option value="">Select Organization</option>
                        {organizations.map(o => (
                          <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Program Parameters */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/50 pb-3">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Program Parameters</h2>
                  <p className="text-xs text-muted-foreground">Difficulty scale and target duration</p>
                </div>
              </div>

              {/* Difficulty Interactive Cards */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">
                  Difficulty Level <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {DIFFICULTY_CONFIG.map(level => {
                    const isSelected = formData.difficultyLevel === level.id;
                    return (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, difficultyLevel: level.id }))}
                        className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                          isSelected ? level.activeColor : `${level.color} border-border/50 hover:bg-muted/40`
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="font-bold text-sm text-foreground">{level.label}</span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{level.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration in Weeks */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="durationWeeks" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    Duration (Weeks) <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-xs font-bold text-primary">{formData.durationWeeks} weeks total</span>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Input 
                    id="durationWeeks"
                    type="number" 
                    name="durationWeeks" 
                    value={formData.durationWeeks} 
                    onChange={handleChange} 
                    className="h-11 sm:w-32 rounded-xl text-center font-bold"
                    min="1"
                    max="52"
                    required 
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-muted-foreground mr-1 hidden sm:inline">Quick pick:</span>
                    {QUICK_DURATIONS.map(weeks => (
                      <Button
                        key={weeks}
                        type="button"
                        variant={Number(formData.durationWeeks) === weeks ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, durationWeeks: weeks }))}
                        className="rounded-full h-8 px-3 text-xs"
                      >
                        {weeks}w
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Coaching Leadership & Lifecycle */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/50 pb-3">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Coaching & Governance</h2>
                  <p className="text-xs text-muted-foreground">Assign coach lead and determine workflow visibility</p>
                </div>
              </div>

              <div className={`grid grid-cols-1 ${isSuperAdmin ? 'md:grid-cols-2' : ''} gap-6`}>
                {isSuperAdmin && (
                  <div className="space-y-2">
                    <Label htmlFor="createdBy" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
                      Lead Coach <span className="text-destructive">*</span>
                    </Label>
                    <select 
                      id="createdBy"
                      name="createdBy" 
                      value={formData.createdBy} 
                      onChange={handleChange} 
                      className={selectStyle}
                      required
                    >
                      <option value="">Select Supervising Coach</option>
                      {coaches.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.firstName} {c.lastName} {c.specialization ? `• ${c.specialization}` : ''} (ID: {c.id})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-semibold text-foreground">
                    Lifecycle Status <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {STATUS_OPTIONS.map(st => {
                      const isSelected = formData.status === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, status: st.id }))}
                          className={`h-10 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                            isSelected 
                              ? `${st.color} border-current ring-2 ring-primary/20`
                              : 'border-border/60 text-muted-foreground hover:bg-muted/40'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 shrink-0" />}
                          <span>{st.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Curriculum Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/50 pb-3">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Curriculum & Objectives</h2>
                  <p className="text-xs text-muted-foreground">Comprehensive overview of target outcomes and routine specifics</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-foreground">
                  Description & Instructions
                </Label>
                <Textarea 
                  id="description"
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  placeholder="Outline the weekly volume progression, core tactical drills, recovery routines, and milestone performance goals for athletes..."
                  className="min-h-[130px] rounded-2xl p-4 text-sm leading-relaxed"
                />
              </div>
            </div>

          </CardContent>

          {/* Form Actions Footer */}
          <div className="p-6 sm:p-8 border-t border-border/50 bg-muted/20 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/training-plans')}
              className="w-full sm:w-auto rounded-full px-6 h-11 text-sm font-medium border-border/60 hover:bg-muted"
            >
              Cancel
            </Button>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button 
                type="submit" 
                disabled={saving} 
                className="w-full sm:w-auto rounded-full px-8 h-11 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Plan...' : (isEditMode ? 'Update Training Plan' : 'Create Training Plan')}</span>
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
