import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { ArrowLeft, Edit, Trash2, Calendar, User, AlignLeft, Dumbbell, Sparkles, Layers, Clock, MapPin, ChevronRight, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import RoleGate from '../../components/auth/RoleGate';
import { PERMISSIONS } from '../../lib/permissions';

export default function TrainingPlanDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlan();
    fetchSessions();
  }, [id]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/training-plans/${id}`);
      setPlan(response.data?.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch plan details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await api.get('/training-sessions', {
        params: { trainingPlanId: id, page: 0, size: 50 }
      });
      const data = response.data?.data || response.data || {};
      setSessions(data.items || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.warn('Failed to load linked sessions', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this training plan?')) {
      try {
        await api.delete(`/training-plans/${id}`);
        toast.success('Training plan deleted successfully');
        navigate('/dashboard/training-plans');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete plan');
      }
    }
  };

  if (loading) return <LoadingSpinner text="Loading plan details..." />;
  if (error) return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-2xl">
        {error}
      </div>
    </div>
  );
  if (!plan) return <div className="text-muted-foreground p-6 text-center">Plan not found</div>;

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
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{plan.title || plan.name}</h1>
              <Badge variant="outline" className="text-xs uppercase font-semibold text-primary border-primary/30">
                {plan.difficultyLevel || 'STANDARD'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Curriculum ID: <span className="font-mono text-foreground font-semibold">#{plan.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <RoleGate permission={PERMISSIONS.TRAINING_UPDATE}>
            <Button 
              variant="outline"
              onClick={() => navigate(`/dashboard/training-plans/${id}/edit`)} 
              className="rounded-full gap-2 border-border/60 hover:bg-muted h-10 px-5"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Plan</span>
            </Button>
          </RoleGate>
          <RoleGate permission={PERMISSIONS.TRAINING_DELETE}>
            <Button 
              variant="destructive"
              onClick={handleDelete} 
              className="rounded-full gap-2 h-10 px-5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </Button>
          </RoleGate>
        </div>
      </div>

      {/* Main Details Card */}
      <Card className="card-premium rounded-3xl border border-border/60 shadow-xl overflow-hidden">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/50">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan Overview</span>
              <h2 className="text-2xl font-bold text-foreground mt-1">{plan.title || plan.name}</h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-primary" /> Lead Coach: <strong className="text-foreground">{plan.creatorName || plan.createdBy || 'Assigned'}</strong></span>
                <span className="flex items-center gap-1.5"><Dumbbell className="w-4 h-4 text-primary" /> Sport: <strong className="text-foreground">{plan.sportName || plan.sport?.name || 'All Sports'}</strong></span>
              </div>
            </div>
            <div>
              <StatusBadge status={plan.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-primary" /> Description & Curriculum
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 p-4 rounded-2xl border border-border/40">
                {plan.description || 'No detailed description provided for this plan.'}
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Plan Parameters
              </h3>
              <div className="space-y-2.5 text-sm bg-muted/30 p-4 rounded-2xl border border-border/40">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Difficulty Level:</span>
                  <Badge variant="outline" className="font-semibold">{plan.difficultyLevel || 'N/A'}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Program Duration:</span>
                  <strong className="text-foreground">{plan.durationWeeks ? `${plan.durationWeeks} Weeks` : 'N/A'}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Organization:</span>
                  <span className="text-foreground font-medium">{plan.organizationName || 'Global Platform'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-bold text-foreground capitalize">{plan.status?.toLowerCase()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" /> Linked Training Sessions
                  {sessions.length > 0 && (
                    <Badge variant="secondary" className="text-xs rounded-full px-2">
                      {sessions.length}
                    </Badge>
                  )}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Sessions scheduled under this training curriculum</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/dashboard/training-sessions/new?planId=${plan.id}`)}
                className="rounded-full gap-2 border-primary/30 text-primary hover:bg-primary/10 self-start sm:self-auto"
              >
                <Calendar className="w-4 h-4" />
                <span>Add Session</span>
              </Button>
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-2xl bg-muted/20 border border-dashed border-border/60">
                <Layers className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">No sessions scheduled yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Build out this training plan by scheduling drills, conditioning workouts, and tactical sessions for your athletes.
                </p>
                <Button
                  size="sm"
                  onClick={() => navigate(`/dashboard/training-sessions/new?planId=${plan.id}`)}
                  className="mt-4 rounded-full gap-2"
                >
                  <Calendar className="w-4 h-4" /> Schedule First Session
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map(s => (
                  <div 
                    key={s.id}
                    onClick={() => navigate(`/dashboard/training-sessions/${s.id}`)}
                    className="p-4 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/60 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-primary">{s.sessionCode || `#${s.id}`}</span>
                        <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{s.title}</h4>
                        <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                          {s.intensity || 'MEDIUM'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {s.sessionDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-primary" /> {s.sessionDate}
                          </span>
                        )}
                        {(s.startTime || s.endTime) && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-primary" /> {s.startTime ? s.startTime.substring(0, 5) : ''} - {s.endTime ? s.endTime.substring(0, 5) : ''}
                          </span>
                        )}
                        {s.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-primary" /> {s.venue}
                          </span>
                        )}
                        {s.teamName ? (
                          <span className="flex items-center gap-1 font-semibold text-primary">
                            <Shield className="w-3.5 h-3.5" /> Team: {s.teamName}
                          </span>
                        ) : s.athleteName ? (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-primary" /> Athlete: {s.athleteName}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/training-sessions/${s.id}/attendance`);
                        }}
                        className="rounded-full gap-1.5 text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 h-8 px-3"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Attendance
                      </Button>
                      <StatusBadge status={s.status} />
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


