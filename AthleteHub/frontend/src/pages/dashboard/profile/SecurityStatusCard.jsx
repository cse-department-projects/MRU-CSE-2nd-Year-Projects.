import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldAlert, Key, Smartphone, Laptop } from 'lucide-react';

export function SecurityStatusCard({ user }) {
  const security = user?.security || {};
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Security Status</CardTitle>
        <CardDescription>Manage your account security and authentication methods.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${security.emailVerified ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
              {security.emailVerified ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-sm font-medium">Email Verification</p>
              <p className="text-xs text-muted-foreground">{security.emailVerified ? 'Verified' : 'Pending Verification'}</p>
            </div>
          </div>
          <Badge variant={security.emailVerified ? 'outline' : 'destructive'}>
            {security.emailVerified ? 'Secure' : 'Action Needed'}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${security.twoFactorEnabled ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">{security.twoFactorEnabled ? 'Enabled' : 'Not configured'}</p>
            </div>
          </div>
          <Badge variant={security.twoFactorEnabled ? 'outline' : 'secondary'}>
            {security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className="text-xs text-muted-foreground">Last changed: {security.lastPasswordChange ? new Date(security.lastPasswordChange).toLocaleDateString() : 'Unknown'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-slate-100 text-slate-600">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Active Sessions</p>
              <p className="text-xs text-muted-foreground">{security.activeSessions || 1} devices currently logged in</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
