import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Building2,
  Clock,
  Send,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Award,
  AlertCircle,
  MapPin,
  Mail,
  UserCheck,
  Phone,
  Shield,
  KeyRound,
  GraduationCap,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { organizationApi } from '@/api/organizationApi';
import { referenceApi } from '@/api/referenceApi';
import { toast } from 'sonner';

export default function AthleteJoinOrganization({ onAffiliated }) {
  const { currentUser, refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [joiningByCode, setJoiningByCode] = useState(false);

  const [activeRequest, setActiveRequest] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [sports, setSports] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loadingCoaches, setLoadingCoaches] = useState(false);

  // Form State
  const [selectedSportId, setSelectedSportId] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [selectedCoachId, setSelectedCoachId] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [orgCodeInput, setOrgCodeInput] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [activeReqRes, orgsRes, sportsRes] = await Promise.allSettled([
        organizationApi.getMyActiveRequest(),
        organizationApi.getAvailableOrganizations(),
        referenceApi.getSports()
      ]);

      if (activeReqRes.status === 'fulfilled' && activeReqRes.value?.data) {
        setActiveRequest(activeReqRes.value.data);
      } else {
        setActiveRequest(null);
      }

      if (orgsRes.status === 'fulfilled') {
        const orgs = orgsRes.value?.data || orgsRes.value || [];
        setOrganizations(Array.isArray(orgs) ? orgs : []);
      }

      if (sportsRes.status === 'fulfilled') {
        const sList = sportsRes.value || [];
        setSports(Array.isArray(sList) ? sList : []);
      }
    } catch (err) {
      console.error("Error loading athlete join data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch coaches when an organization is selected
  useEffect(() => {
    if (!selectedOrgId) {
      setCoaches([]);
      setSelectedCoachId('');
      return;
    }

    const fetchCoaches = async () => {
      try {
        setLoadingCoaches(true);
        const res = await organizationApi.getOrgCoachesForJoin(selectedOrgId, selectedSportId || undefined);
        const coachList = res?.data || [];
        setCoaches(Array.isArray(coachList) ? coachList : []);
      } catch (err) {
        console.error("Failed to load organization coaches:", err);
        setCoaches([]);
      } finally {
        setLoadingCoaches(false);
      }
    };

    fetchCoaches();
  }, [selectedOrgId, selectedSportId]);

  const handleCheckStatus = async () => {
    setCheckingStatus(true);
    try {
      const res = await refreshUser();
      if (res?.success && (res.user?.organizationId || res.user?.organization_id)) {
        toast.success("Congratulations! Your join request was approved.");
        if (onAffiliated) onAffiliated();
        return;
      }

      const reqRes = await organizationApi.getMyActiveRequest();
      if (reqRes?.data) {
        setActiveRequest(reqRes.data);
        toast.info("Your application is currently under review by the Organization Admin.");
      } else {
        setActiveRequest(null);
        toast.info("No active pending request found.");
      }
    } catch (err) {
      toast.error("Failed to refresh status.");
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!activeRequest?.id) return;
    if (!window.confirm("Are you sure you want to withdraw your join request?")) return;

    try {
      setCancelling(true);
      await organizationApi.cancelJoinRequest(activeRequest.id);
      toast.success("Application withdrawn.");
      setActiveRequest(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel request.");
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!selectedOrgId) {
      toast.error("Please select a target organization/club.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        organizationId: parseInt(selectedOrgId, 10),
        sportId: selectedSportId ? parseInt(selectedSportId, 10) : null,
        preferredCoachId: selectedCoachId && selectedCoachId !== 'any' ? parseInt(selectedCoachId, 10) : null,
        specialization: specialization.trim() || null,
        message: message.trim() || null,
        phone: phone.trim() || null
      };

      const res = await organizationApi.submitAthleteJoinRequest(payload);
      toast.success("Application submitted successfully to Organization Administrator!");
      setActiveRequest(res?.data || null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!orgCodeInput.trim()) {
      toast.error("Please enter a valid Organization Invite Code.");
      return;
    }

    try {
      setJoiningByCode(true);
      const res = await organizationApi.joinByOrganizationCode(orgCodeInput.trim());
      toast.success(res?.message || "Successfully affiliated with organization!");
      await refreshUser();
      if (onAffiliated) onAffiliated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid organization code.");
    } finally {
      setJoiningByCode(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Checking affiliation status...</p>
      </div>
    );
  }

  // Active Pending Application View
  if (activeRequest) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 animate-fade-in space-y-6">
        <Card className="border border-border/60 shadow-xl rounded-3xl overflow-hidden bg-card/90 backdrop-blur-md">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-primary p-8 text-white relative">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <Badge className="bg-white/20 text-white hover:bg-white/30 border-white/30 px-3 py-1 font-semibold">
                Application Pending
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-4">Membership Application Submitted</h1>
            <p className="text-emerald-100 text-sm mt-1">
              Welcome, <span className="font-semibold">{currentUser?.full_name || currentUser?.email}</span>! Your join request is currently with the Organization Administrator.
            </p>
          </div>

          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-border/50 bg-muted/20 space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Organization</span>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <p className="font-bold text-foreground text-base">
                    {activeRequest.organization?.name || activeRequest.organizationName || `Organization #${activeRequest.organizationId}`}
                  </p>
                </div>
                {activeRequest.organization?.city && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {activeRequest.organization.city}, {activeRequest.organization.country}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl border border-border/50 bg-muted/20 space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sport & Category</span>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  <p className="font-bold text-foreground text-base">
                    {activeRequest.sportName || "Athletics"}
                  </p>
                </div>
                {activeRequest.specialization && (
                  <p className="text-xs text-muted-foreground">
                    Role/Position: <span className="font-medium text-foreground">{activeRequest.specialization}</span>
                  </p>
                )}
              </div>
            </div>

            {activeRequest.preferredCoachName && (
              <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Requested Preferred Coach</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <strong className="text-primary">{activeRequest.preferredCoachName}</strong>
                    {activeRequest.preferredCoachSpecialization && ` (${activeRequest.preferredCoachSpecialization})`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upon approval by the Org Admin, you will be automatically linked to this coach's training roster.
                  </p>
                </div>
              </div>
            )}

            {activeRequest.message && (
              <div className="p-4 rounded-2xl border border-border/40 bg-muted/30">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Application Note:</span>
                <p className="text-sm text-foreground italic mt-1 font-serif">"{activeRequest.message}"</p>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-sm space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>What happens next?</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The Organization Administrator will review your athletic profile and preferred coach request. Once approved, your athlete dashboard, training sessions, match calendar, and team fixtures will unlock automatically.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/40">
              <Button
                variant="outline"
                onClick={handleCancelRequest}
                disabled={cancelling}
                className="w-full sm:w-auto text-destructive hover:bg-destructive/10 border-destructive/30"
              >
                {cancelling ? "Withdrawing..." : "Withdraw Application"}
              </Button>

              <Button
                onClick={handleCheckStatus}
                disabled={checkingStatus}
                className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                <RefreshCw className={`w-4 h-4 ${checkingStatus ? 'animate-spin' : ''}`} />
                {checkingStatus ? "Checking..." : "Refresh Approval Status"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not Applied Yet View
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-fade-in space-y-8">
      {/* Hero Welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-600 to-primary text-white p-8 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <Badge className="bg-white/20 text-white border-white/20 px-3 py-1 font-semibold flex items-center gap-1.5 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Free Agent Athlete
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Connect With Your Sports Organization
          </h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            Welcome to AthleteHub, <strong className="text-white">{currentUser?.full_name || currentUser?.email}</strong>!
            To unlock your personalized training schedule, attendance tracking, team rosters, and tournament match calendar, join your club or academy below.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Application Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border/60 shadow-lg rounded-3xl overflow-hidden bg-card">
            <div className="p-6 border-b border-border/50 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Apply to Join an Organization</h2>
                  <p className="text-xs text-muted-foreground">Submit your application to the Organization Administrator</p>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <form onSubmit={handleSubmitRequest} className="space-y-5">
                {/* Sport Category */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-primary" /> Sport Category
                  </label>
                  <Select value={selectedSportId} onValueChange={(val) => { setSelectedSportId(val); setSelectedCoachId(''); }}>
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue placeholder="Select your sport..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {sports.map(s => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name} {s.category ? `(${s.category})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Target Organization */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-primary" /> Select Club / Academy / University <span className="text-destructive">*</span>
                  </label>
                  <Select value={selectedOrgId} onValueChange={(val) => { setSelectedOrgId(val); setSelectedCoachId(''); }}>
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue placeholder="Choose an organization to join..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {organizations.map(org => (
                        <SelectItem key={org.id} value={String(org.id)}>
                          {org.name} {org.city ? `• ${org.city}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    Only verified active organizations on AthleteHub are listed.
                  </p>
                </div>

                {/* Preferred Coach Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-primary" /> Preferred Coach (Optional)
                    </span>
                    {loadingCoaches && <span className="text-xs text-muted-foreground animate-pulse">Loading coaches...</span>}
                  </label>
                  <Select
                    value={selectedCoachId}
                    onValueChange={setSelectedCoachId}
                    disabled={!selectedOrgId || loadingCoaches}
                  >
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue placeholder={
                        !selectedOrgId
                          ? "Select an organization first..."
                          : coaches.length === 0
                            ? "No specific coaches listed (Admin will assign)"
                            : "Choose a coach (or select 'Any Coach')"
                      } />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="any">Any Available Coach (Admin's Choice)</SelectItem>
                      {coaches.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.fullName} {c.specialization ? `(${c.specialization})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    You can request to train specifically under a selected coach. The Org Admin reviews this preference upon approval.
                  </p>
                </div>

                {/* Playing Position / Specialization */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Playing Position / Specialty
                  </label>
                  <Input
                    placeholder="e.g. Center Forward, Point Guard, 100m Sprint, Goal Keeper..."
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="rounded-xl h-11"
                  />
                </div>

                {/* Contact Phone */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary" /> Contact Phone
                  </label>
                  <Input
                    placeholder="Your contact number..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl h-11"
                  />
                </div>

                {/* Pitch / Message */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Note to Organization Administrator
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Introduce yourself, mention your achievements, recent tournaments, or why you want to train with this club..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-xl p-3 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting || !selectedOrgId}
                  className="w-full h-12 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-lg shadow-primary/20"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Application to Org Admin
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Quick Join By Code Card */}
        <div className="space-y-6">
          <Card className="border border-primary/20 shadow-lg rounded-3xl overflow-hidden bg-card relative">
            <div className="p-6 bg-gradient-to-br from-primary/10 via-background to-muted/20 border-b border-border/50">
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-3 shadow-md">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Have a Club Invite Code?</h3>
              <p className="text-xs text-muted-foreground mt-1">
                If your coach or academy provided an invite code, enter it below to join instantly without waiting for approval.
              </p>
            </div>

            <CardContent className="p-6">
              <form onSubmit={handleJoinByCode} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Organization Code
                  </label>
                  <Input
                    placeholder="e.g. ORG0001"
                    value={orgCodeInput}
                    onChange={(e) => setOrgCodeInput(e.target.value.toUpperCase())}
                    className="rounded-xl h-11 font-mono uppercase tracking-widest text-center text-base"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="default"
                  disabled={joiningByCode || !orgCodeInput.trim()}
                  className="w-full h-11 rounded-xl text-sm font-semibold gap-2"
                >
                  {joiningByCode ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Join Instantly
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Help Card */}
          <div className="p-5 rounded-3xl border border-border/50 bg-muted/20 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <Shield className="w-4 h-4 text-primary" />
              <span>Athlete Platform Guide</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-primary font-bold">•</span>
                <span><strong>Coach Preferences:</strong> Org Admins will match you with your requested coach whenever roster capacity allows.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-primary font-bold">•</span>
                <span><strong>Events & Tournaments:</strong> You can view upcoming championship fixtures; your Coach & Admin officially register your tournament squad.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-primary font-bold">•</span>
                <span><strong>Match Calendar:</strong> Track live schedules, venue timings, and match day countdowns.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
