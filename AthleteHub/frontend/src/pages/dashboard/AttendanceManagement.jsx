import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { teamApi } from '@/api/teamApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { 
  ArrowLeft, 
  Save, 
  Check, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  Building2, 
  Calendar, 
  MapPin, 
  Activity,
  ShieldAlert,
  Sparkles,
  Shield
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../lib/permissions';

const STATUS_CONFIG = {
  PRESENT: {
    label: 'Present',
    color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25',
    activeColor: 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/30',
    icon: CheckCircle2
  },
  LATE: {
    label: 'Late',
    color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/25',
    activeColor: 'bg-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-500/30',
    icon: Clock
  },
  EXCUSED: {
    label: 'Excused',
    color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/25',
    activeColor: 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/30',
    icon: Activity
  },
  ABSENT: {
    label: 'Absent',
    color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/25',
    activeColor: 'bg-rose-600 text-white border-rose-600 shadow-sm ring-2 ring-rose-500/30',
    icon: XCircle
  }
};

export default function AttendanceManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const canEdit = can(PERMISSIONS.TRAINING_UPDATE);

  const [session, setSession] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Fetch session details
      const sessionRes = await api.get(`/training-sessions/${id}`);
      const sessionData = sessionRes.data?.data || sessionRes.data;
      setSession(sessionData);

      // 2. Fetch attendance records for this session
      const attendanceRes = await api.get(`/training-attendance/session/${id}`);
      const rawRecords = attendanceRes.data?.data?.content || attendanceRes.data?.data || [];
      const records = Array.isArray(rawRecords) ? rawRecords : [];

      if (sessionData?.teamId) {
        // Fetch squad roster for this team session
        try {
          const members = await teamApi.getTeamMembers(sessionData.teamId);
          const memberList = Array.isArray(members) ? members : [];

          const existingMap = new Map();
          records.forEach(r => {
            if (r.athleteId) existingMap.set(r.athleteId, r);
          });

          const roster = memberList.map(m => {
            if (existingMap.has(m.athleteId)) {
              const existingRec = existingMap.get(m.athleteId);
              return {
                ...existingRec,
                athleteName: m.athleteName || existingRec.athleteName,
                jerseyNumber: m.jerseyNumber,
                position: m.position,
                role: m.role
              };
            } else {
              return {
                id: `new-${m.athleteId}`,
                isNew: true,
                trainingSessionId: sessionData.id,
                athleteId: m.athleteId,
                athleteName: m.athleteName || `Athlete #${m.athleteId}`,
                athleteCode: m.athleteCode,
                jerseyNumber: m.jerseyNumber,
                position: m.position,
                role: m.role,
                attendanceStatus: 'PRESENT',
                coachNotes: '',
                athleteFeedback: '',
                injuryReport: ''
              };
            }
          });

          // Also keep any records that might have been saved outside current team roster
          records.forEach(r => {
            if (!memberList.some(m => m.athleteId === r.athleteId)) {
              roster.push(r);
            }
          });

          setAttendanceRecords(roster);
        } catch (memberErr) {
          console.error('Failed to load team members for attendance', memberErr);
          setAttendanceRecords(records);
        }
      } else if (records.length > 0) {
        setAttendanceRecords(records);
      } else if (sessionData?.athleteId) {
        // Auto-initialize attendance roster row from session's assigned athlete
        setAttendanceRecords([{
          id: `new-${sessionData.athleteId}`,
          isNew: true,
          trainingSessionId: sessionData.id,
          athleteId: sessionData.athleteId,
          athleteName: sessionData.athleteName || `Athlete #${sessionData.athleteId}`,
          attendanceStatus: 'PRESENT',
          coachNotes: '',
          athleteFeedback: '',
          injuryReport: ''
        }]);
      } else {
        setAttendanceRecords([]);
      }
      
    } catch (err) {
      console.error('Failed to load attendance data', err);
      setError(err.response?.data?.message || 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (recordId, newStatus) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.id === recordId ? { ...record, attendanceStatus: newStatus } : record
      )
    );
  };

  const handleNotesChange = (recordId, coachNotes) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.id === recordId ? { ...record, coachNotes } : record
      )
    );
  };

  const handleMarkAll = (status) => {
    setAttendanceRecords(prev => 
      prev.map(record => ({ ...record, attendanceStatus: status }))
    );
    toast.info(`Marked all athletes as ${status.toLowerCase()}`);
  };

  const handleSaveAll = async () => {
    if (attendanceRecords.length === 0) return;
    try {
      setSaving(true);
      setError(null);
      
      await Promise.all(attendanceRecords.map(record => {
        const payload = {
          trainingSessionId: record.trainingSessionId || session.id,
          athleteId: record.athleteId,
          attendanceStatus: record.attendanceStatus || 'PRESENT',
          coachNotes: record.coachNotes || '',
          athleteFeedback: record.athleteFeedback || '',
          injuryReport: record.injuryReport || ''
        };

        if (record.isNew) {
          return api.post('/training-attendance', payload);
        } else {
          return api.put(`/training-attendance/${record.id}`, payload);
        }
      }));
      
      toast.success('Attendance recorded and saved successfully!');
      await fetchData();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to save attendance records';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading attendance roster..." />;
  if (error && !session) return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-2xl">
        {error}
      </div>
    </div>
  );

  const presentCount = attendanceRecords.filter(r => r.attendanceStatus === 'PRESENT').length;
  const lateCount = attendanceRecords.filter(r => r.attendanceStatus === 'LATE').length;
  const absentCount = attendanceRecords.filter(r => r.attendanceStatus === 'ABSENT').length;
  const excusedCount = attendanceRecords.filter(r => r.attendanceStatus === 'EXCUSED').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 page-enter pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline"
            size="icon"
            onClick={() => navigate(`/dashboard/training-sessions/${id}`)} 
            className="rounded-full h-10 w-10 shrink-0 border-border/60 hover:bg-muted"
            title="Back to Session"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Session Attendance</h1>
              <Badge variant="outline" className="text-xs uppercase font-semibold text-primary border-primary/30">
                {session?.sessionCode || `#${id}`}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {session?.title} &bull; {session?.sessionDate ? new Date(session.sessionDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'Scheduled Date'}
            </p>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              onClick={handleSaveAll}
              disabled={saving || attendanceRecords.length === 0}
              className="rounded-full gap-2 px-6 h-10 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Session Metadata Banner */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${session?.teamName ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-3 p-4 rounded-2xl bg-muted/40 border border-border/50 text-xs`}>
        {session?.teamName && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-foreground text-sm truncate max-w-[150px]">
                {session?.teamName}
              </div>
              <div className="text-muted-foreground text-[11px]">
                Team / Athletic Squad
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm">
              {session?.sessionDate || 'N/A'}
            </div>
            <div className="text-muted-foreground text-[11px]">
              {session?.startTime?.substring(0, 5)} - {session?.endTime?.substring(0, 5)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm truncate max-w-[150px]">
              {session?.venue || 'Session Venue'}
            </div>
            <div className="text-muted-foreground text-[11px]">
              Intensity: <span className="font-medium text-foreground">{session?.intensity || 'MEDIUM'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm truncate max-w-[150px]">
              Coach {session?.coachName || 'Assigned'}
            </div>
            <div className="text-muted-foreground text-[11px]">
              Supervising Coach
            </div>
          </div>
        </div>
      </div>

      {/* Summary Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Present</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{presentCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col justify-between">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Late</span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{lateCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col justify-between">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Excused</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{excusedCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col justify-between">
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Absent</span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{absentCount}</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-2xl flex items-start gap-3 animate-fade-in shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* Main Roster Card */}
      <Card className="card-premium rounded-3xl border border-border/60 shadow-xl overflow-hidden">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
            <div>
              <h2 className="text-lg font-bold text-foreground">Athlete Attendance Roster</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Mark attendance status and record coaching observations</p>
            </div>

            {canEdit && attendanceRecords.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAll('PRESENT')}
                  className="rounded-full text-xs h-8 gap-1.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark All Present
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAll('ABSENT')}
                  className="rounded-full text-xs h-8 gap-1.5 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                >
                  <XCircle className="w-3.5 h-3.5" /> Mark All Absent
                </Button>
              </div>
            )}
          </div>

          {attendanceRecords.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-muted/20 border border-dashed border-border/60">
              <UserCheck className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-base font-bold text-foreground">No Athletes Assigned to this Session</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto leading-relaxed">
                Ensure this training session is linked to an active coach-athlete assignment or a team squad so athletes appear on the attendance roster.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {attendanceRecords.map((record, index) => {
                const currentStatus = record.attendanceStatus || 'PRESENT';

                return (
                  <div 
                    key={record.id || index}
                    className="p-5 rounded-2xl bg-muted/30 border border-border/50 space-y-4 hover:border-border/80 transition-all shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0">
                          {record.athleteName?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-base">
                            {record.athleteName || `Athlete #${record.athleteId}`}
                          </h3>
                          <p className="text-xs text-muted-foreground font-mono flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span>#{record.athleteCode || record.athleteId}</span>
                            {record.jerseyNumber && (
                              <span className="font-semibold text-foreground/80">&bull; No. {record.jerseyNumber}</span>
                            )}
                            {record.position && (
                              <span className="text-muted-foreground font-sans">&bull; {record.position}</span>
                            )}
                            {record.isNew && (
                              <span className="text-primary font-sans font-medium">&bull; New Session Member</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Status Selector Pills */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                          const isSelected = currentStatus === key;
                          const Icon = config.icon;
                          return (
                            <button
                              key={key}
                              type="button"
                              disabled={!canEdit}
                              onClick={() => handleStatusChange(record.id, key)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                                isSelected ? config.activeColor : config.color
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span>{config.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Coach Notes */}
                    {canEdit ? (
                      <div className="space-y-1.5 pt-1">
                        <Input
                          placeholder="Coach notes & performance feedback (e.g. Excellent sprint form, high workload stamina)..."
                          value={record.coachNotes || ''}
                          onChange={(e) => handleNotesChange(record.id, e.target.value)}
                          className="h-10 text-xs rounded-xl bg-background/80"
                        />
                      </div>
                    ) : (
                      record.coachNotes && (
                        <p className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border/40">
                          <strong className="text-foreground">Coach Notes:</strong> {record.coachNotes}
                        </p>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {canEdit && attendanceRecords.length > 0 && (
            <div className="pt-4 border-t border-border/50 flex justify-end">
              <Button
                onClick={handleSaveAll}
                disabled={saving}
                className="rounded-full gap-2 px-8 h-11 text-sm font-semibold shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Submit Attendance'}</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
