import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { ArrowLeft, Edit, Trash2, Calendar, MapPin, AlignLeft, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';
import RoleGate from '../../components/auth/RoleGate';
import { PERMISSIONS } from '../../lib/permissions';

export default function TrainingSessionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSession();
  }, [id]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/training-sessions/${id}`);
      setSession(response.data?.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch session details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await api.delete(`/training-sessions/${id}`);
        toast.success('Session deleted successfully');
        navigate('/dashboard/training');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete session');
      }
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      const payload = {
        trainingPlanId: session.trainingPlanId,
        coachAssignmentId: session.coachAssignmentId,
        title: session.title,
        description: session.description,
        sessionType: session.sessionType,
        intensity: session.intensity || 'MEDIUM',
        sessionDate: session.sessionDate,
        startTime: session.startTime,
        endTime: session.endTime,
        venue: session.venue,
        status: newStatus,
        remarks: session.remarks
      };
      await api.put(`/training-sessions/${id}`, payload);
      setSession({ ...session, status: newStatus });
      toast.success(`Session status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return <LoadingSpinner text="Loading session details..." />;
  if (error) return <div className="text-destructive p-4">{error}</div>;
  if (!session) return <div className="text-muted-foreground p-4">Session not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/training" className="p-2 hover:bg-background rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-h2">Session Details</h1>
        </div>
        <div className="flex gap-3">
          <Link to={`/dashboard/training-sessions/${id}/attendance`} className="btn bg-primary hover:bg-blue-700 text-foreground flex items-center gap-2">
            <Users size={18} /> Attendance
          </Link>
          <RoleGate permission={PERMISSIONS.TRAINING_UPDATE}>
            <Link to={`/dashboard/training-sessions/${id}/edit`} className="btn btn-outline flex items-center gap-2">
              <Edit size={18} /> Edit
            </Link>
          </RoleGate>
          <RoleGate permission={PERMISSIONS.TRAINING_DELETE}>
            <button onClick={handleDelete} className="btn border border-destructive/30 text-destructive hover:bg-destructive/10 flex items-center gap-2">
              <Trash2 size={18} /> Delete
            </button>
          </RoleGate>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{session.title || `Session #${session.id}`}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">{session.sessionType || 'GENERAL'}</span>
              <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded text-xs">Intensity: {session.intensity || 'MEDIUM'}</span>
              {session.teamName && (
                <span className="bg-blue-500/10 text-blue-500 px-2 py-1 rounded text-xs font-semibold">Team: {session.teamName}</span>
              )}
              {session.athleteName && !session.teamName && (
                <span className="bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded text-xs">Athlete: {session.athleteName}</span>
              )}
              {session.trainingPlanTitle && (
                <Link to={`/dashboard/training-plans/${session.trainingPlanId}`} className="hover:text-primary">
                  Plan: {session.trainingPlanTitle}
                </Link>
              )}
            </div>
          </div>
          <StatusBadge status={session.status} />
        </div>

        {/* Timeline representation */}
        <div className="my-8 px-4">
          <div className="relative mt-8 mb-12 hidden md:block">
            <div className="absolute left-0 top-1/2 w-full h-1 bg-border -z-10 -translate-y-1/2 rounded-full"></div>
            
            <div className="flex justify-between relative">
              <div className={`flex flex-col items-center ${['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(session.status) ? 'text-primary' : 'text-gray-500'}`}>
                <div className={`w-6 h-6 rounded-full border-4 border-[#0b0c10] ${['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(session.status) ? 'bg-primary' : 'bg-gray-600'}`}></div>
                <span className="text-xs mt-2 font-medium">Scheduled</span>
              </div>
              
              <div className={`flex flex-col items-center ${['IN_PROGRESS', 'COMPLETED'].includes(session.status) ? 'text-primary' : 'text-gray-500'}`}>
                <div className={`w-6 h-6 rounded-full border-4 border-[#0b0c10] ${['IN_PROGRESS', 'COMPLETED'].includes(session.status) ? 'bg-primary' : 'bg-gray-600'}`}></div>
                <span className="text-xs mt-2 font-medium">In Progress</span>
              </div>

              <div className={`flex flex-col items-center ${session.status === 'COMPLETED' ? 'text-green-500' : session.status === 'CANCELLED' ? 'text-destructive' : 'text-gray-500'}`}>
                <div className={`w-6 h-6 rounded-full border-4 border-[#0b0c10] ${session.status === 'COMPLETED' ? 'bg-green-500' : session.status === 'CANCELLED' ? 'bg-red-500' : 'bg-gray-600'}`}></div>
                <span className="text-xs mt-2 font-medium">{session.status === 'CANCELLED' ? 'Cancelled' : 'Completed'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center gap-4 mt-8">
            {session.status === 'SCHEDULED' && (
              <button onClick={() => updateStatus('IN_PROGRESS')} className="btn btn-primary btn-sm">Start Session</button>
            )}
            {session.status === 'IN_PROGRESS' && (
              <button onClick={() => updateStatus('COMPLETED')} className="btn bg-green-600 hover:bg-green-700 text-foreground btn-sm">Mark Completed</button>
            )}
            {['SCHEDULED', 'IN_PROGRESS'].includes(session.status) && (
              <button onClick={() => updateStatus('CANCELLED')} className="btn border border-destructive/30 text-destructive hover:bg-destructive/10 btn-sm">Cancel Session</button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-t border-white/10 mb-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <Calendar size={16} /> Date
              </h3>
              <p className="text-foreground">{session.sessionDate ? new Date(session.sessionDate).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <Clock size={16} /> Time
              </h3>
              <p className="text-foreground">
                {session.startTime ? session.startTime.substring(0, 5) : 'N/A'} - {session.endTime ? session.endTime.substring(0, 5) : 'N/A'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <MapPin size={16} /> Venue
              </h3>
              <p className="text-foreground">{session.venue || 'N/A'}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <AlignLeft size={16} /> Description
              </h3>
              <p className="text-foreground whitespace-pre-wrap">{session.description || 'No description.'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                <AlignLeft size={16} /> Remarks
              </h3>
              <p className="text-foreground whitespace-pre-wrap">{session.remarks || 'No remarks.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
