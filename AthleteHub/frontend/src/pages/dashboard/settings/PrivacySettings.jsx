import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Trash2 } from 'lucide-react';

export function PrivacySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Privacy</h2>
        <p className="text-sm text-muted-foreground">Manage your privacy settings and data.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Visibility</CardTitle>
          <CardDescription>Control who can see your profile and contact information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Profile Visibility</Label>
            <Select defaultValue="organization">
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public (Everyone)</SelectItem>
                <SelectItem value="organization">Organization Only</SelectItem>
                <SelectItem value="private">Private (Only me)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="space-y-0.5">
              <Label>Show Contact Information</Label>
              <p className="text-sm text-muted-foreground">Allow others to see your email and phone number.</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="space-y-0.5">
              <Label>Activity Status</Label>
              <p className="text-sm text-muted-foreground">Show when you are currently active on the platform.</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data & Account</CardTitle>
          <CardDescription>Export your data or permanently delete your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium text-sm">Export Data</p>
              <p className="text-xs text-muted-foreground">Download a copy of all your data on AthleteHub.</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2"><Download className="w-4 h-4" /> Export CSV</Button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-sm text-red-600">Delete Account</p>
              <p className="text-xs text-muted-foreground">Permanently remove your account and all associated data.</p>
            </div>
            <Button variant="destructive" size="sm" className="gap-2"><Trash2 className="w-4 h-4" /> Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
