import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Clock, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function PendingOrgActivation() {
  const { currentUser, logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-fade-in">
      <Card className="border border-border/60 shadow-xl rounded-3xl overflow-hidden bg-card/80 backdrop-blur-sm">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-primary p-8 text-white relative">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Organization Setup Pending</h1>
          <p className="text-blue-100 text-sm mt-1">
            Welcome, <span className="font-semibold">{currentUser?.full_name || currentUser?.email}</span>!
          </p>
        </div>

        <CardContent className="p-8 space-y-6">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
            <Clock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <h3 className="font-semibold text-base mb-1">Awaiting Super Admin Provisioning</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your Organization Administrator account is successfully registered. Your organization workspace is currently being provisioned by the Platform Super Admin.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">What happens next:</h4>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border/40 bg-muted/30">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm text-foreground">Super Admin confirms your organization onboarding & details.</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border/40 bg-muted/30">
                <ArrowRight className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm text-foreground">Your account is linked to your organization profile.</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border/40 bg-muted/30">
                <Building2 className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm text-foreground">Full access to manage Athletes, Coaches, Training, and Events is unlocked.</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="w-4 h-4 text-primary" />
              <span>Contact root admin: <strong className="text-foreground">admin@athletehub.local</strong></span>
            </div>
            <button
              onClick={() => logout()}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              Sign out / Switch account
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
