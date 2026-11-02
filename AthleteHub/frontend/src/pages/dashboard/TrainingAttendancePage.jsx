import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { teamApi } from '@/api/teamApi';
import TrainingNav from '../../components/training/TrainingNav';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  Layers,
  Search,
  ChevronDown,
  ChevronUp,
  Activity,
  UserCheck,
  Edit,
  ArrowRight,
  Filter,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../lib/permissions';
import { useAuth } from '@/contexts/AuthContext';

const STATUS_CONFIG = {
  PRESENT: {
    label: 'Present',
    badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    icon: CheckCircle2
  },
  LATE: {
    label: 'Late',
    badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    icon: Clock
  },
  EXCUSED: {
    label: 'Excused',
    badge: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    icon: Activity
  },
  ABSENT: {
    label: 'Absent',
    badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    icon: XCircle
  }
};

export default function TrainingAttendancePage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { can } = usePermissions();
  const isCoach = currentUser?.role === 'ROLE_COACH';
  const isOrgAdmin = currentUser?.role === 'ROLE_ORG_ADMIN' || currentUser?.role === 'ROLE_SUPER_ADMIN';
  const isAthlete = currentUser?.role === 'ROLE_ATHLETE';
  const canEdit = (isCoach || isOrgAdmin) && can(PERMISSIONS.TRAINING_UPDATE);

  const [sessions, setSessions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [attendanceFilter, setAttendanceFilter] = useState('ALL'); // ALL, RECORDED, PENDING

  // Expanded session IDs for quick-roster preview
  const [expandedSessions, setExpandedSessions] = useState(new Set());
  const [updatingRecordId, setUpdatingRecordId] = useState(null);

  useEffect(() => {
    fetchOverview();
    fetchTeams();
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/training-attendance/sessions-overview', {
        params: { page: 0, size: 50 }
      });
      const data = res.data?.data?.content || res.data?.data || [];
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load session attendance overview', err);
      setError(err.response?.data?.message || 'Failed to load session attendance overview');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const data = await teamApi.getTeams();
      setTeams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load teams filter list', err);
    }
  };

  const toggleExpand = (sessionId) => {
    setExpandedSessions(prev => {
      const next = new Set(prev);
      if (next.has(sessionId)) {
        next.delete(sessionId);
      } else {
        next.add(sessionId);
      }
      return next;
    });
  };

  const handleInlineStatusChange = async (sessionId, recordId, newStatus) => {
    try {
      setUpdatingRecordId(recordId);
      const targetSession = sessions.find(s => s.sessionId === sessionId);
      const targetRecord = targetSession?.records?.find(r => r.id === recordId);
      if (!targetRecord) return;

      const payload = {
        trainingSessionId: sessionId,
        athleteId: targetRecord.athleteId,
        attendanceStatus: newStatus,
        coachNotes: targetRecord.coachNotes || ''
      };

      await api.put(`/training-attendance/${recordId}`, payload);
      toast.success(`Updated status to ${newStatus}`);

      // Update in state locally
      setSessions(prev => prev.map(s => {
        if (s.sessionId !== sessionId) return s;
        const updatedRecords = s.records.map(r => r.id === recordId ? { ...r, attendanceStatus: newStatus } : r);
        const present = updatedRecords.filter(r => r.attendanceStatus === 'PRESENT').length;
        const late = updatedRecords.filter(r => r.attendanceStatus === 'LATE').length;
        const excused = updatedRecords.filter(r => r.attendanceStatus === 'EXCUSED').length;
        const absent = updatedRecords.filter(r => r.attendanceStatus === 'ABSENT').length;
        const total = updatedRecords.length;
        return {
          ...s,
          records: updatedRecords,
          presentCount: present,
          lateCount: late,
          excusedCount: excused,
          absentCount: absent,
          attendanceRate: total > 0 ? (((present + late) / total) * 100) : 0
        };
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update attendance status');
    } finally {
      setUpdatingRecordId(null);
    }
  };

  // Filtered Sessions
  const filteredSessions = sessions.filter(session => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      session.title?.toLowerCase().includes(q) ||
      session.sessionCode?.toLowerCase().includes(q) ||
      session.venue?.toLowerCase().includes(q) ||
      session.teamName?.toLowerCase().includes(q);

    const matchesTeam = selectedTeam === 'ALL' || String(session.teamId) === String(selectedTeam);
    const matchesStatus = selectedStatus === 'ALL' || session.status === selectedStatus;
    
    let matchesAttendance = true;
    if (attendanceFilter === 'RECORDED') {
      matchesAttendance = session.totalRecorded > 0;
    } else if (attendanceFilter === 'PENDING') {
      matchesAttendance = session.totalRecorded === 0;
    }

    return matchesSearch && matchesTeam && matchesStatus && matchesAttendance;
  });

  // Aggregated Counters
  const totalSessions = sessions.length;
  const totalRecordedAthletes = sessions.reduce((acc, s) => acc + (s.totalRecorded || 0), 0);
  const totalPresent = sessions.reduce((acc, s) => acc + (s.presentCount || 0), 0);
  const totalLate = sessions.reduce((acc, s) => acc + (s.lateCount || 0), 0);
  const totalExcused = sessions.reduce((acc, s) => acc + (s.excusedCount || 0), 0);
  const totalAbsent = sessions.reduce((acc, s) => acc + (s.absentCount || 0), 0);

  const overallRate = totalRecordedAthletes > 0 
    ? (((totalPresent + totalLate) / totalRecordedAthletes) * 100).toFixed(1)
    : 0;

  return (
    <div className="p-6 md:p-8 space-y-8 page-enter max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Session Attendance Hub</h1>
            <span className="font-mono-telemetry text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Roster & Records
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Track, review, and record athlete and squad attendance across training sessions.
          </p>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchOverview} 
            disabled={loading}
            className="shadow-sm gap-2 rounded-xl"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          {!isAthlete && (
            <Button className="shadow-sm gap-2 rounded-xl" asChild>
              <Link to="/dashboard/training-sessions/new">
                <Calendar className="h-4 w-4" /> Schedule Session
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Segmented Navigation */}
      <TrainingNav />

      {/* 3. Error Banner */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4. Aggregated Attendance Telemetry */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Sessions Tracked</span>
          <span className="text-2xl font-black text-foreground font-mono-telemetry mt-1">{totalSessions}</span>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Total Attendance Rate</span>
          <span className="text-2xl font-black text-primary font-mono-telemetry mt-1">{overallRate}%</span>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Present</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono-telemetry mt-1">{totalPresent}</span>
        </div>
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Late</span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono-telemetry mt-1">{totalLate}</span>
        </div>
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Excused</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono-telemetry mt-1">{totalExcused}</span>
        </div>
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Absent</span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono-telemetry mt-1">{totalAbsent}</span>
        </div>
      </div>

      {/* 5. Filters Bar */}
      <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              type="text"
              placeholder="Search by session title, code, venue, or squad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-background"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="ALL">All Squads & Teams</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="ALL">All Session Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="ALL">All Records</option>
              <option value="RECORDED">Attendance Taken</option>
              <option value="PENDING">Pending Submission</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6. Sessions & Attendance List */}
      {loading ? (
        <LoadingSpinner text="Loading sessions and attendance data..." />
      ) : filteredSessions.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-muted/20 border border-dashed border-border/60">
          <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">No Training Sessions Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {searchQuery || selectedTeam !== 'ALL' || selectedStatus !== 'ALL'
              ? 'No sessions matched your filter criteria. Try adjusting your search filters.'
              : 'Schedule a team training session to start taking and monitoring squad attendance.'}
          </p>
          <Button
            size="sm"
            onClick={() => navigate('/dashboard/training-sessions/new')}
            className="mt-4 rounded-full gap-2"
          >
            <Calendar className="w-4 h-4" /> Schedule New Session
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const isExpanded = expandedSessions.has(session.sessionId);
            const hasRecords = session.totalRecorded > 0;
            const records = session.records || [];

            return (
              <Card 
                key={session.sessionId}
                className="card-telemetry-elevated rounded-2xl border border-border/60 overflow-hidden hover:border-border transition-all shadow-sm"
              >
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Top Row: Session Title, Status & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">
                          {session.sessionCode || `#${session.sessionId}`}
                        </span>
                        <h2 className="text-lg font-bold text-foreground tracking-tight">
                          {session.title}
                        </h2>
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] font-semibold uppercase ${
                            session.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                            session.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                            session.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                            'bg-blue-500/10 text-blue-600 border-blue-500/20'
                          }`}
                        >
                          {session.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {session.teamName ? (
                          <span className="flex items-center gap-1 font-semibold text-primary">
                            <Shield className="w-3.5 h-3.5" /> {session.teamName}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Users className="w-3.5 h-3.5" /> Individual Assignment
                          </span>
                        )}

                        {session.trainingPlanTitle && (
                          <span className="flex items-center gap-1 opacity-80">
                            <Layers className="w-3.5 h-3.5" /> {session.trainingPlanTitle}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      {canEdit && (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/dashboard/training-sessions/${session.sessionId}/attendance`)}
                          className="rounded-full text-xs h-9 px-4 gap-1.5 shadow-sm"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{hasRecords ? 'Manage Attendance' : 'Take Attendance'}</span>
                        </Button>
                      )}

                      {hasRecords && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleExpand(session.sessionId)}
                          className="rounded-full text-xs h-9 px-3 gap-1 border-border/60 hover:bg-muted"
                          title="Quick View Roster"
                        >
                          <span>Roster ({session.totalRecorded})</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Middle Row: Schedule Info & Attendance Status Pills */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/40 text-xs">
                    <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {session.sessionDate || 'Scheduled Date'}
                      </span>
                      {(session.startTime || session.endTime) && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          {session.startTime?.substring(0, 5)} - {session.endTime?.substring(0, 5)}
                        </span>
                      )}
                      {session.venue && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                          {session.venue}
                        </span>
                      )}
                    </div>

                    {/* Attendance Metric Pills */}
                    <div className="flex flex-wrap items-center md:justify-end gap-1.5">
                      {hasRecords ? (
                        <>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {session.presentCount} Present
                          </span>
                          {session.lateCount > 0 && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {session.lateCount} Late
                            </span>
                          )}
                          {session.excusedCount > 0 && (
                            <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                              <Activity className="w-3 h-3" /> {session.excusedCount} Excused
                            </span>
                          )}
                          {session.absentCount > 0 && (
                            <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> {session.absentCount} Absent
                            </span>
                          )}
                          <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold font-mono">
                            {session.attendanceRate?.toFixed(0)}% Rate
                          </span>
                        </>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground font-medium flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                          No attendance recorded yet
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expandable Quick Attendance Roster */}
                  {isExpanded && records.length > 0 && (
                    <div className="pt-3 border-t border-border/40 space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-xs font-bold text-foreground">Session Roster Attendance:</span>
                        {canEdit && (
                          <Link 
                            to={`/dashboard/training-sessions/${session.sessionId}/attendance`}
                            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                          >
                            Full Attendance Sheet <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {records.map((record) => {
                          const config = STATUS_CONFIG[record.attendanceStatus] || STATUS_CONFIG.PRESENT;
                          const Icon = config.icon;

                          return (
                            <div 
                              key={record.id}
                              className="p-3 rounded-xl bg-background border border-border/50 flex flex-col justify-between gap-2 shadow-2xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="truncate">
                                  <p className="font-bold text-foreground text-xs truncate">
                                    {record.athleteName || `Athlete #${record.athleteId}`}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground font-mono">
                                    ID: #{record.athleteId}
                                  </p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${config.badge}`}>
                                  <Icon className="w-3 h-3" /> {config.label}
                                </span>
                              </div>

                              {record.coachNotes && (
                                <p className="text-[11px] text-muted-foreground line-clamp-1 italic bg-muted/40 px-2 py-1 rounded-md">
                                  "{record.coachNotes}"
                                </p>
                              )}

                              {/* In-line Quick Toggles if coach has edit permission */}
                              {canEdit && (
                                <div className="flex items-center gap-1 pt-1 border-t border-border/30">
                                  {Object.keys(STATUS_CONFIG).map((st) => (
                                    <button
                                      key={st}
                                      type="button"
                                      disabled={updatingRecordId === record.id}
                                      onClick={() => handleInlineStatusChange(session.sessionId, record.id, st)}
                                      className={`flex-1 py-1 text-[10px] rounded-md font-semibold transition-all ${
                                        record.attendanceStatus === st 
                                          ? 'bg-primary text-primary-foreground shadow-xs' 
                                          : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                                      }`}
                                    >
                                      {st.charAt(0)}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
