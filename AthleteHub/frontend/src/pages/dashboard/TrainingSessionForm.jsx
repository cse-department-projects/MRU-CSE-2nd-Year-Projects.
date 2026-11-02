import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import { teamApi } from '@/api/teamApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { 
  ArrowLeft, 
  Save, 
  Calendar, 
  Clock, 
  MapPin, 
  Activity, 
  Sparkles, 
  UserCheck, 
  Layers, 
  FileText,
  AlertCircle,
  Shield
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

export default function TrainingSessionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { can } = usePermissions();
  const isEditMode = !!id;
  const planIdParam = searchParams.get('planId');

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode && !can(PERMISSIONS.TRAINING_UPDATE)) {
      toast.error('You do not have permission to edit training sessions.');
      navigate('/dashboard/training-sessions', { replace: true });
    } else if (!isEditMode && !can(PERMISSIONS.TRAINING_CREATE)) {
      toast.error('Only coaches can create training sessions.');
      navigate('/dashboard/training-sessions', { replace: true });
    }
  }, [can, isEditMode, navigate]);

  const [formData, setFormData] = useState({
    trainingPlanId: planIdParam || '',
    teamId: '',
    coachAssignmentId: '',
    title: '',
    description: '',
    sessionType: 'GENERAL',
    intensity: 'MEDIUM',
    sessionDate: '',
    startTime: '',
    endTime: '',
    venue: '',
    status: 'SCHEDULED',
    remarks: ''
  });

  const [plans, setPlans] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetchPlans();
    fetchTeams();
    if (isEditMode) {
      fetchSession();
    }
  }, [id]);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/training-plans', { params: { page: 0, size: 100 } });
      const raw = response.data?.data || response.data || [];
      const planList = Array.isArray(raw) ? raw : (raw.items || []);
      setPlans(planList);
    } catch (err) {
      console.error('Failed to fetch plans', err);
      setPlans([]);
    }
  };

  const fetchTeams = async () => {
    try {
      const data = await teamApi.getTeams();
      const teamList = Array.isArray(data) ? data : [];
      setTeams(teamList);
      if (!isEditMode && teamList.length > 0 && !formData.teamId) {
        setFormData(prev => ({ ...prev, teamId: String(teamList[0].id) }));
      }
    } catch (err) {
      console.warn('Failed to fetch teams', err);
      setTeams([]);
    }
  };

  const fetchSession = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/training-sessions/${id}`);
      const data = response.data?.data || response.data;
      
      setFormData({
        trainingPlanId: data.trainingPlanId || '',
        teamId: data.teamId ? String(data.teamId) : '',
        coachAssignmentId: data.coachAssignmentId || '',
        title: data.title || '',
        description: data.description || '',
        sessionType: data.sessionType || 'GENERAL',
        intensity: data.intensity || 'MEDIUM',
        sessionDate: data.sessionDate ? data.sessionDate.split('T')[0] : '',
        startTime: data.startTime ? data.startTime.substring(0, 5) : '',
        endTime: data.endTime ? data.endTime.substring(0, 5) : '',
        venue: data.venue || '',
        status: data.status || 'SCHEDULED',
        remarks: data.remarks || ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load session details');
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
        trainingPlanId: formData.trainingPlanId ? parseInt(formData.trainingPlanId) : null,
        teamId: formData.teamId ? parseInt(formData.teamId) : null,
        coachAssignmentId: formData.coachAssignmentId ? parseInt(formData.coachAssignmentId) : null,
        title: formData.title,
        description: formData.description,
        sessionType: formData.sessionType,
        intensity: formData.intensity,
        sessionDate: formData.sessionDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        venue: formData.venue,
        status: formData.status,
        remarks: formData.remarks
      };
      
      // format time strings properly if provided (HH:MM:SS)
      if (payload.startTime && payload.startTime.length === 5) payload.startTime += ':00';
      if (payload.endTime && payload.endTime.length === 5) payload.endTime += ':00';

      if (isEditMode) {
        await api.put(`/training-sessions/${id}`, payload);
        toast.success("Training session updated successfully!");
      } else {
        await api.post('/training-sessions', payload);
        toast.success("Training session created successfully!");
      }
      navigate('/dashboard/training-sessions');
    } catch (err) {
      const errMsg = err.response?.data?.message || (Array.isArray(err.response?.data?.errors) ? err.response.data.errors.join(', ') : null) || err.message || 'Failed to save training session';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading training session form..." />;

  const selectStyle = "flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all";

  return (
    <div className="max-w-4xl mx-auto space-y-6 page-enter pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/dashboard/training-sessions')}
            className="rounded-full h-10 w-10 shrink-0 border-border/60 hover:bg-muted"
            title="Back to Training Sessions"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                {isEditMode ? 'Edit Training Session' : 'Schedule Training Session'}
              </h1>
              <Badge variant="outline" className="text-xs uppercase font-semibold tracking-wider text-primary border-primary/30">
                {isEditMode ? 'Editing' : 'New'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditMode 
                ? 'Update session parameters, schedule, coach assignments, and venue.' 
                : 'Plan an individual or squad training workout linked to an active plan.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="outline" className="px-3 py-1 font-medium capitalize text-xs">
            Status: <span className="font-bold ml-1 text-foreground">{formData.status.toLowerCase().replace('_', ' ')}</span>
          </Badge>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-2xl flex items-start gap-3 animate-fade-in shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* Main Form Card */}
      <Card className="card-premium rounded-3xl border border-border/60 shadow-xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 sm:p-8 space-y-8">
            
            {/* Section 1: Overview */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/50 pb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Session Identification</h2>
                  <p className="text-xs text-muted-foreground">Session title and associated training curriculum</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold text-foreground">
                    Session Title <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="title"
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    placeholder="e.g. Block Acceleration & Stride Frequency Drill"
                    className="h-11 rounded-xl"
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trainingPlanId" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                    Training Plan <span className="text-destructive">*</span>
                  </Label>
                  <select 
                    id="trainingPlanId"
                    name="trainingPlanId" 
                    value={formData.trainingPlanId} 
                    onChange={handleChange} 
                    className={selectStyle}
                    required
                  >
                    <option value="">Select Training Plan</option>
                    {(Array.isArray(plans) ? plans : []).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title || p.name} {p.planCode ? `(${p.planCode})` : ''} {p.sportName ? `• ${p.sportName}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Assignment & Type */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/50 pb-3">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Team & Focus</h2>
                  <p className="text-xs text-muted-foreground">Select the team/squad participating in this session</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                <div className="space-y-2">
                  <Label htmlFor="teamId" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                    Target Team / Squad <span className="text-destructive">*</span>
                  </Label>
                  <select 
                    id="teamId"
                    name="teamId" 
                    value={formData.teamId} 
                    onChange={handleChange} 
                    className={selectStyle}
                    required
                  >
                    <option value="">Select Team / Squad</option>
                    {(Array.isArray(teams) ? teams : []).map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name} {team.sportName ? `(${team.sportName})` : ''} {team.ageGroup ? `• ${team.ageGroup}` : ''}
                      </option>
                    ))}
                  </select>
                  {teams.length === 0 && (
                    <p className="text-xs text-amber-500">No teams found. Please create a team first in the Teams tab.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionType" className="text-sm font-semibold text-foreground">
                    Session Type <span className="text-destructive">*</span>
                  </Label>
                  <select 
                    id="sessionType"
                    name="sessionType" 
                    value={formData.sessionType} 
                    onChange={handleChange} 
                    className={selectStyle} 
                    required
                  >
                    <option value="GENERAL">General Fitness</option>
                    <option value="STRENGTH">Strength & Power</option>
                    <option value="CARDIO">Cardio & Aerobic</option>
                    <option value="RECOVERY">Active Recovery</option>
                    <option value="SKILL">Sport-Specific Skill</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Schedule, Timing & Location */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/50 pb-3">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Schedule & Venue</h2>
                  <p className="text-xs text-muted-foreground">Session timing, duration window, and facility</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                <div className="space-y-2">
                  <Label htmlFor="sessionDate" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    Date <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="sessionDate"
                    type="date" 
                    name="sessionDate" 
                    value={formData.sessionDate} 
                    onChange={handleChange} 
                    className="h-11 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    Start Time <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="startTime"
                    type="time" 
                    name="startTime" 
                    value={formData.startTime} 
                    onChange={handleChange} 
                    className="h-11 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    End Time <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="endTime"
                    type="time" 
                    name="endTime" 
                    value={formData.endTime} 
                    onChange={handleChange} 
                    className="h-11 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    Venue / Facility <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="venue"
                    type="text" 
                    name="venue" 
                    value={formData.venue} 
                    onChange={handleChange} 
                    placeholder="Main Track Stadium"
                    className="h-11 rounded-xl"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Intensity & Lifecycle Status */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/50 pb-3">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Workload & Status</h2>
                  <p className="text-xs text-muted-foreground">Prescribed effort load and execution status</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                <div className="space-y-2">
                  <Label htmlFor="intensity" className="text-sm font-semibold text-foreground">
                    Target Intensity <span className="text-destructive">*</span>
                  </Label>
                  <select 
                    id="intensity"
                    name="intensity" 
                    value={formData.intensity} 
                    onChange={handleChange} 
                    className={selectStyle} 
                    required
                  >
                    <option value="LOW">Low (Recovery / Technique)</option>
                    <option value="MEDIUM">Medium (Standard Aerobic / Conditioning)</option>
                    <option value="HIGH">High (Maximal Effort / Sprint)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-semibold text-foreground">
                    Session Status <span className="text-destructive">*</span>
                  </Label>
                  <select 
                    id="status"
                    name="status" 
                    value={formData.status} 
                    onChange={handleChange} 
                    className={selectStyle} 
                    required
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 5: Notes & Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/50 pb-3">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Workout Notes & Remarks</h2>
                  <p className="text-xs text-muted-foreground">Session drill details, equipment needed, and coach remarks</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-foreground">
                    Workout Description
                  </Label>
                  <Textarea 
                    id="description"
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    placeholder="Warm up routine, drill sequence, intervals, reps and sets..."
                    className="min-h-[100px] rounded-2xl p-3 text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="remarks" className="text-sm font-semibold text-foreground">
                    Coach Remarks / Post-Session Notes
                  </Label>
                  <Textarea 
                    id="remarks"
                    name="remarks" 
                    value={formData.remarks} 
                    onChange={handleChange} 
                    placeholder="Observations, athlete fatigue feedback, equipment modifications..."
                    className="min-h-[100px] rounded-2xl p-3 text-sm"
                  />
                </div>
              </div>
            </div>

          </CardContent>

          {/* Form Actions Footer */}
          <div className="p-6 sm:p-8 border-t border-border/50 bg-muted/20 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/training-sessions')}
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
              <span>{saving ? 'Saving Session...' : (isEditMode ? 'Update Session' : 'Save Training Session')}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
