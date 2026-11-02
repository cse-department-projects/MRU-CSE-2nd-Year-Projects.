import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  Clock, 
  Edit3, 
  CheckCircle2, 
  RefreshCw,
  Award
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/api/axios';
import { organizationApi } from '@/api/organizationApi';

export default function ProfilePage() {
  const { currentUser, currentRole, refreshUser } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  // Load organization details if affiliated
  useEffect(() => {
    if (currentUser?.organizationId) {
      organizationApi.getOrganizationById(currentUser.organizationId)
        .then(res => {
          if (res?.data) {
            setOrganization(res.data);
          }
        })
        .catch(err => console.warn('Could not load user organization details', err));
    }
  }, [currentUser?.organizationId]);

  if (!currentUser) {
    return (
      <div className="p-12 flex justify-center items-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const openEditDialog = () => {
    setFullName(currentUser.full_name || currentUser.name || '');
    setPhone(currentUser.phone || '');
    setIsEditOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Full name is required.');
      return;
    }

    try {
      setSaving(true);
      await api.put('/auth/profile', {
        full_name: fullName.trim(),
        phone: phone.trim() || null
      });

      await refreshUser();
      toast.success('Profile updated successfully.');
      setIsEditOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const roleDisplay = (currentRole || currentUser.role || 'USER')
    .replace('ROLE_', '')
    .replace(/_/g, ' ');

  const displayName = currentUser.full_name || currentUser.name || 'User';
  const displayEmail = currentUser.email || 'Not provided';
  const displayPhone = currentUser.phone || 'Not provided';
  const memberSince = currentUser.created_at 
    ? new Date(currentUser.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Active Member';
  const lastLogin = currentUser.last_login 
    ? new Date(currentUser.last_login).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : 'Recent';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Profile Header Banner */}
      <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
        <div className="h-28 bg-gradient-to-r from-primary/20 via-primary/10 to-muted border-b" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end -mt-12 mb-4">
            <Avatar className="w-24 h-24 border-4 border-card shadow-md">
              <AvatarImage src={currentUser.profile_photo || currentUser.avatar} alt={displayName} />
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {displayName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{displayName}</h1>
                <Badge variant="outline" className="text-xs px-2.5 py-0.5 bg-primary/10 text-primary border-primary/20 font-semibold uppercase">
                  {roleDisplay}
                </Badge>
                <Badge variant="outline" className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  {currentUser.status || 'Active'}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {displayEmail}
                </span>
                {organization && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    {organization.name}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined {memberSince}
                </span>
              </div>
            </div>

            <Button 
              size="sm" 
              onClick={openEditDialog}
              className="gap-2 shrink-0 h-9"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Main Profile Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account & Contact Details */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Personal & Contact Information
            </CardTitle>
            <CardDescription className="text-xs">
              Primary identity and contact information associated with your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="flex items-start justify-between py-2 border-b">
              <div>
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{displayName}</p>
              </div>
              <Button variant="ghost" size="xs" onClick={openEditDialog} className="text-xs text-primary">
                Edit
              </Button>
            </div>

            <div className="flex items-start justify-between py-2 border-b">
              <div>
                <p className="text-xs text-muted-foreground">Email Address</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm font-semibold text-foreground">{displayEmail}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start justify-between py-2 border-b">
              <div>
                <p className="text-xs text-muted-foreground">Phone Number</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{displayPhone}</p>
              </div>
              <Button variant="ghost" size="xs" onClick={openEditDialog} className="text-xs text-primary">
                Edit
              </Button>
            </div>

            <div className="flex items-start justify-between py-2">
              <div>
                <p className="text-xs text-muted-foreground">Last Login</p>
                <div className="flex items-center gap-1.5 text-xs text-foreground font-medium mt-0.5">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  {lastLogin}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role & Organization Affiliation */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Role & Platform Permissions
            </CardTitle>
            <CardDescription className="text-xs">
              System access level and organizational assignment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="py-2 border-b">
              <p className="text-xs text-muted-foreground">Account Role</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="font-semibold text-xs px-2.5 py-0.5 bg-primary text-primary-foreground">
                  {roleDisplay}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Account ID: #{currentUser.id}
                </span>
              </div>
            </div>

            <div className="py-2 border-b">
              <p className="text-xs text-muted-foreground">Organization Affiliation</p>
              {organization ? (
                <div className="mt-1">
                  <p className="text-sm font-bold text-foreground">{organization.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Code: {organization.organizationCode || 'N/A'} · {[organization.city, organization.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              ) : (
                <p className="text-sm font-medium text-muted-foreground mt-1">
                  {roleDisplay.includes('SUPER ADMIN') 
                    ? 'Global Platform Administrator (Unrestricted Root Scope)'
                    : 'Independent / Unaffiliated'}
                </p>
              )}
            </div>

            <div className="py-2">
              <p className="text-xs text-muted-foreground mb-1.5">Operational Scope</p>
              <div className="p-3 rounded-lg bg-muted/30 border text-xs text-muted-foreground leading-relaxed">
                {roleDisplay.includes('SUPER ADMIN') && (
                  <p>Full platform governance, organization lifecycle management, cross-organization directory, and global data acquisition.</p>
                )}
                {roleDisplay.includes('ORG ADMIN') && (
                  <p>Club management, sports staff & coach assignments, athlete recruitment pipeline, and organization operations.</p>
                )}
                {roleDisplay.includes('COACH') && (
                  <p>Squad coaching, training plans & session scheduling, live attendance marking, and tactical playbooks.</p>
                )}
                {roleDisplay.includes('ATHLETE') && (
                  <p>Player training schedule, session attendance check-ins, medical & fitness monitoring, and match competition calendar.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-primary" />
              Edit Profile Information
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update your primary display name and mobile phone number.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Full Name
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                className="h-9 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Phone Number
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1-555-0199"
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Email Address
              </label>
              <Input
                value={currentUser.email || ''}
                disabled
                className="h-9 text-xs bg-muted opacity-80 cursor-not-allowed"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Email address is managed by platform security and cannot be changed here.
              </p>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
