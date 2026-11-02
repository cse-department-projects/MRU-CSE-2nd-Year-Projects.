import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Security</h2>
        <p className="text-sm text-muted-foreground">Manage your password and security preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-w-sm">
            <Label>Current Password</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2 max-w-sm">
            <Label>New Password</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2 max-w-sm">
            <Label>Confirm New Password</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <Button>Update Password</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">Two-Factor Authentication <Badge variant="outline">Recommended</Badge></CardTitle>
          <CardDescription>Add an extra layer of security to your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Authenticator App</Label>
              <p className="text-sm text-muted-foreground">Use an app like Google Authenticator to generate codes.</p>
            </div>
            <Button variant="outline">Enable 2FA</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Sessions</CardTitle>
          <CardDescription>Manage the devices where you are currently logged in.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-sm">MacBook Pro - Chrome</p>
                <p className="text-xs text-muted-foreground">New York, US • Active now</p>
              </div>
              <Badge>Current Session</Badge>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-sm">iPhone 13 - Safari</p>
                <p className="text-xs text-muted-foreground">New York, US • 2 hours ago</p>
              </div>
              <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">Revoke</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
