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
  Briefcase,
  AlertCircle,
  MapPin,
  Mail,
  UserCheck,
  Phone
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { organizationApi } from '@/api/organizationApi';
import { referenceApi } from '@/api/referenceApi';
import { toast } from 'sonner';

export default function CoachJoinOrganization({ onAffiliated }) {
  const { currentUser, refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const [activeRequest, setActiveRequest] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [sports, setSports] = useState([]);

  // Form State
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [specialization, setSpecialization] = useState('');
  const [customSpecialization, setCustomSpecialization] = useState('');
  const [experienceYears, setExperienceYears] = useState(3);
  const [qualification, setQualification] = useState('');
  const [message, setMessage] = useState('');

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
      console.error("Error loading coach join data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
        toast.info("Request is still pending review by the Organization Admin.");
      } else {
        setActiveRequest(null);
        toast.info("No active pending request found.");
      }
    } catch (err) {
      toast.error("Failed to check status. Please try again.");
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!activeRequest?.id) return;
    if (!window.confirm("Are you sure you want to cancel your pending join request?")) return;

    setCancelling(true);
    try {
      await organizationApi.cancelJoinRequest(activeRequest.id);
      toast.success("Join request cancelled successfully.");
      setActiveRequest(null);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel request.");
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrgId) {
      toast.error("Please select an athletic organization.");
      return;
    }

    const finalSpecialization = specialization === 'OTHER' ? customSpecialization : specialization;
    if (!finalSpecialization) {
      toast.error("Please specify your coaching specialization.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        organizationId: parseInt(selectedOrgId),
        phone: phone.trim() || null,
        specialization: finalSpecialization,
        experienceYears: parseInt(experienceYears) || 0,
        qualification: qualification.trim() || null,
        message: message.trim() || null
      };

      const res = await organizationApi.submitCoachJoinRequest(payload);
      toast.success("Join request submitted! The Organization Admin will review your profile.");
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">Checking organization affiliation status...</p>
      </div>
    );
  }

  // View 1: Coach has an active pending request
  if (activeRequest && activeRequest.status === 'PENDING') {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 animate-fade-in">
        <Card className="border border-border/60 shadow-xl rounded-3xl overflow-hidden bg-card/90 backdrop-blur-sm">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-8 text-white relative">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Join Request Pending Review</h1>
                <p className="text-amber-100 text-sm mt-1">
                  Submitted for coach <span className="font-semibold">{currentUser?.fullName || currentUser?.full_name || currentUser?.email}</span>
                </p>
              </div>
              <Badge className="bg-white/20 hover:bg-white/30 text-white font-mono text-xs px-3 py-1 border-white/30">
                PENDING
              </Badge>
            </div>
          </div>

          <CardContent className="p-8 space-y-6">
            {/* Target Organization Card */}
            <div className="p-5 rounded-2xl bg-muted/40 border border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target Organization</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {activeRequest.organizationCode || 'ORGANIZATION'}
                </Badge>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-foreground">{activeRequest.organizationName}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-1">
                    {activeRequest.organizationCity && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {activeRequest.organizationCity}, {activeRequest.organizationState}
                      </span>
                    )}
                    {activeRequest.organizationEmail && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {activeRequest.organizationEmail}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submitted Application Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border/40 bg-card/60">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-primary" />
                  <span>Specialization & Experience</span>
                </div>
                <div className="font-semibold text-sm text-foreground">
                  {activeRequest.specialization || 'General Athletics'}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {activeRequest.experienceYears} Years Experience
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border/40 bg-card/60">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Award className="w-3.5 h-3.5 text-primary" />
                  <span>Qualification / License</span>
                </div>
                <div className="font-semibold text-sm text-foreground truncate">
                  {activeRequest.qualification || 'Certified Athletic Coach'}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Submitted {new Date(activeRequest.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {activeRequest.message && (
              <div className="p-4 rounded-xl border border-border/40 bg-muted/20 text-xs">
                <span className="font-semibold text-muted-foreground block mb-1">Note to Admin:</span>
                <p className="text-foreground italic">"{activeRequest.message}"</p>
              </div>
            )}

            {/* Info notice */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10 text-xs text-muted-foreground">
              <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span>
                The organization admin has been notified. As soon as they approve your request, your coach dashboard, athlete rosters, and training tools will activate automatically.
              </span>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCheckStatus}
                disabled={checkingStatus}
                className="w-full sm:w-auto gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingStatus ? 'animate-spin' : ''}`} />
                Check Status
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelRequest}
                disabled={cancelling}
                className="w-full sm:w-auto text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                {cancelling ? 'Cancelling...' : 'Cancel Request'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // View 2: Coach needs to submit a Join Request
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-fade-in">
      <Card className="border border-border/60 shadow-xl rounded-3xl overflow-hidden bg-card/90 backdrop-blur-sm">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-primary p-8 text-white relative">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Join an Athletic Organization</h1>
          <p className="text-blue-100 text-sm mt-1">
            Welcome, <span className="font-semibold">{currentUser?.fullName || currentUser?.full_name || currentUser?.email}</span>! Connect with your organization to unlock your coach command center.
          </p>
        </div>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Target Organization Selector */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-primary" />
                Select Organization <span className="text-destructive">*</span>
              </label>
              <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Choose an organization to join..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {organizations.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No active organizations available
                    </SelectItem>
                  ) : (
                    organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{org.name}</span>
                          <span className="text-xs text-muted-foreground">({org.organizationCode || org.city || 'Org'})</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Your request will be delivered directly to this organization's administrator for approval.
              </p>
            </div>

            {/* Contact Phone Number */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-primary" />
                Phone Number <span className="text-destructive">*</span>
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 rounded-xl"
                placeholder="e.g. +91 98765 43210"
                required
              />
              <p className="text-xs text-muted-foreground">
                Organization admins and athletic directors will use this number to contact you.
              </p>
            </div>

            {/* Specialization / Sport */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-primary" />
                  Primary Sport / Specialization <span className="text-destructive">*</span>
                </label>
                <Select
                  value={specialization}
                  onValueChange={(val) => setSpecialization(val)}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select sport..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-52">
                    {sports.map((sp) => (
                      <SelectItem key={sp.id || sp.name} value={sp.name}>
                        {sp.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="Strength & Conditioning">Strength & Conditioning</SelectItem>
                    <SelectItem value="Physiotherapy & Recovery">Physiotherapy & Recovery</SelectItem>
                    <SelectItem value="Multi-Sport Performance">Multi-Sport Performance</SelectItem>
                    <SelectItem value="OTHER">Other / Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-primary" />
                  Experience (Years)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="60"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="h-11 rounded-xl"
                  placeholder="e.g. 5"
                />
              </div>
            </div>

            {specialization === 'OTHER' && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-xs font-semibold text-foreground">Specify Custom Specialization</label>
                <Input
                  value={customSpecialization}
                  onChange={(e) => setCustomSpecialization(e.target.value)}
                  className="h-10 rounded-xl"
                  placeholder="e.g. Biomechanics, High Jump Specialist"
                />
              </div>
            )}

            {/* Qualification / Certifications */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-primary" />
                Certifications & Qualifications (Optional)
              </label>
              <Input
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="h-11 rounded-xl"
                placeholder="e.g. UEFA A License, USATF Level 2, NSCA CSCS"
              />
            </div>

            {/* Note to Org Admin */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Message to Organization Administrator (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Introduce yourself, mention the team/squad you coach or any reference from the club..."
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={submitting || !selectedOrgId}
                className="w-full h-11 rounded-xl gap-2 font-semibold shadow-md"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Join Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
