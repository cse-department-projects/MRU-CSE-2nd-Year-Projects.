import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationApi } from '@/api/organizationApi';
import {
  UserPlus,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
  Award,
  Mail,
  Phone,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AssignAthletesModal from '@/components/coaches/AssignAthletesModal';
import { toast } from 'sonner';

export default function CoachJoinRequestsWidget({ organizationId }) {
  const queryClient = useQueryClient();
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [assignedCoachId, setAssignedCoachId] = useState(null);
  const [roleFilter, setRoleFilter] = useState('ALL'); // ALL, ROLE_COACH, ROLE_ATHLETE

  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ['coachJoinRequests', organizationId],
    queryFn: () => organizationApi.getOrgJoinRequests({ status: 'PENDING' }),
  });

  const allRequests = response?.data || [];
  const requests = allRequests.filter(req => {
    if (roleFilter === 'ALL') return true;
    return (req.role || 'ROLE_COACH').toUpperCase() === roleFilter;
  });

  const approveMutation = useMutation({
    mutationFn: (id) => organizationApi.approveJoinRequest(id),
    onSuccess: (res, id) => {
      const coachId = res.data?.coachId;
      toast.success("Join request approved successfully!");
      queryClient.invalidateQueries(['coachJoinRequests']);
      queryClient.invalidateQueries(['coaches']);
      queryClient.invalidateQueries(['athletes']);
      queryClient.invalidateQueries(['dashboardStats']);
      if (coachId) {
        setAssignedCoachId(coachId);
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to approve request.");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => organizationApi.rejectJoinRequest(id, { reason }),
    onSuccess: () => {
      toast.success("Join request rejected.");
      setRejectingId(null);
      setRejectReason('');
      queryClient.invalidateQueries(['coachJoinRequests']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to reject request.");
    }
  });

  const handleApprove = (req) => {
    const isAthlete = (req.role || '').toUpperCase() === 'ROLE_ATHLETE';
    const applicantName = req.user?.fullName || req.userName || req.userEmail;
    const coachMsg = req.preferredCoachName ? ` and assign to Coach ${req.preferredCoachName}` : '';
    const confirmPrompt = isAthlete
      ? `Approve Athlete ${applicantName} into your organization${coachMsg}?`
      : `Approve Coach ${applicantName} into your organization?`;

    if (window.confirm(confirmPrompt)) {
      approveMutation.mutate(req.id);
    }
  };

  const handleConfirmReject = (id) => {
    rejectMutation.mutate({ id, reason: rejectReason.trim() || 'Application declined by organization administrator.' });
  };

  if (isLoading) {
    return (
      <div className="p-6 card-premium rounded-3xl space-y-4">
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="font-bold text-foreground">Coach Join Applications</h3>
        </div>
        <div className="h-20 rounded-2xl bg-muted/40 animate-pulse" />
      </div>
    );
  }

  if (allRequests.length === 0) {
    return null; // Return null when no pending requests so it doesn't clutter the dashboard
  }

  const athleteCount = allRequests.filter(r => (r.role || '').toUpperCase() === 'ROLE_ATHLETE').length;
  const coachCount = allRequests.filter(r => (r.role || 'ROLE_COACH').toUpperCase() === 'ROLE_COACH').length;

  return (
    <div className="p-6 card-premium rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-base">Incoming Membership Applications</h3>
            <p className="text-xs text-muted-foreground">Athletes and coaches requesting to join your organization</p>
          </div>
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl border border-border/40">
          <button
            onClick={() => setRoleFilter('ALL')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${roleFilter === 'ALL' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            All ({allRequests.length})
          </button>
          <button
            onClick={() => setRoleFilter('ROLE_ATHLETE')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${roleFilter === 'ROLE_ATHLETE' ? 'bg-background shadow-xs text-emerald-600 dark:text-emerald-400 font-bold' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Athletes ({athleteCount})
          </button>
          <button
            onClick={() => setRoleFilter('ROLE_COACH')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${roleFilter === 'ROLE_COACH' ? 'bg-background shadow-xs text-blue-600 dark:text-blue-400 font-bold' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Coaches ({coachCount})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {requests.map((req) => {
          const isAthlete = (req.role || '').toUpperCase() === 'ROLE_ATHLETE';
          const applicantName = req.user?.fullName || req.userName || req.userEmail;

          return (
            <div
              key={req.id}
              className="p-4 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm space-y-3 transition-all hover:border-primary/40 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                    {applicantName}
                    <Badge className={isAthlete ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px]" : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[11px]"}>
                      {isAthlete ? "Athlete" : "Coach"}
                    </Badge>
                    <Badge variant="outline" className="text-[11px] font-medium bg-muted/50">
                      {req.sportName || req.specialization || 'General Athletics'}
                    </Badge>
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {req.user?.email || req.userEmail}
                    </span>
                    {(req.user?.phone || req.userPhone) && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {req.user?.phone || req.userPhone}
                      </span>
                    )}
                    {!isAthlete && req.experienceYears != null && (
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <Briefcase className="w-3.5 h-3.5" />
                        {req.experienceYears} Years Exp
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {rejectingId !== req.id && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(req)}
                      disabled={approveMutation.isPending}
                      className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 rounded-xl shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve & Affiliate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRejectingId(req.id);
                        setRejectReason('');
                      }}
                      disabled={approveMutation.isPending}
                      className="h-8 px-3 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 rounded-xl"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>

              {/* Preferred Coach Box for Athletes */}
              {isAthlete && (
                <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">
                      Requested Coach: <strong className="text-foreground">{req.preferredCoachName || "No coach specified (Admin assigns)"}</strong>
                      {req.preferredCoachSpecialization && ` (${req.preferredCoachSpecialization})`}
                    </span>
                  </div>
                  {req.preferredCoachName && (
                    <Badge variant="outline" className="text-[10px] bg-background text-primary border-primary/30">
                      Auto-assigns on approve
                    </Badge>
                  )}
                </div>
              )}

              {/* Additional Information / Vitals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {isAthlete && req.athleteVitals && (
                  <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/30 px-2.5 py-1.5 rounded-lg col-span-1 sm:col-span-2">
                    <span className="font-semibold text-foreground">Vitals:</span>
                    <span>
                      {req.athleteVitals.gender || ''}
                      {req.athleteVitals.height ? ` • ${req.athleteVitals.height} cm` : ''}
                      {req.athleteVitals.weight ? ` • ${req.athleteVitals.weight} kg` : ''}
                      {req.athleteVitals.medicalStatus ? ` • Medical: ${req.athleteVitals.medicalStatus}` : ''}
                    </span>
                  </div>
                )}
                {!isAthlete && req.qualification && (
                  <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/30 px-2.5 py-1.5 rounded-lg">
                    <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate"><strong>Qualification:</strong> {req.qualification}</span>
                  </div>
                )}
                {req.createdAt && (
                  <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/30 px-2.5 py-1.5 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span><strong>Applied:</strong> {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

            {req.message && (
              <div className="p-2.5 rounded-xl bg-muted/20 border border-border/40 text-xs text-muted-foreground italic">
                "{req.message}"
              </div>
            )}

            {/* Reject Confirmation Inline Box */}
            {rejectingId === req.id && (
              <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 space-y-2 animate-fade-in">
                <span className="text-xs font-semibold text-destructive block">
                  Provide reason for rejection (optional):
                </span>
                <div className="flex gap-2">
                  <Input
                    size="sm"
                    placeholder="e.g. Credentials do not match current openings"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="h-8 text-xs rounded-lg"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleConfirmReject(req.id)}
                    disabled={rejectMutation.isPending}
                    className="h-8 text-xs px-3 rounded-lg shrink-0"
                  >
                    Confirm Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setRejectingId(null)}
                    className="h-8 text-xs px-2 rounded-lg shrink-0"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            </div>
          );
        })}
      </div>

      {/* Sport-Based Athlete Assignment Modal for Newly Approved Coach */}
      <AssignAthletesModal
        coachId={assignedCoachId}
        isOpen={!!assignedCoachId}
        onClose={() => setAssignedCoachId(null)}
      />
    </div>
  );
}
