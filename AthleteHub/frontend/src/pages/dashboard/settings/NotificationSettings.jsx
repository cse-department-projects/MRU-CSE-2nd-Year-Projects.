import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export function NotificationSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Notifications</h2>
        <p className="text-sm text-muted-foreground">Choose what updates you want to receive.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Email Notifications</CardTitle>
          <CardDescription>Select the types of emails you would like to receive.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>System Announcements</Label>
              <p className="text-sm text-muted-foreground">Platform updates, maintenance, and new features.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="space-y-0.5">
              <Label>Event & Tournament Updates</Label>
              <p className="text-sm text-muted-foreground">Notifications about events you are involved in.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="space-y-0.5">
              <Label>Training Reminders</Label>
              <p className="text-sm text-muted-foreground">Reminders for upcoming training sessions.</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">In-App Notifications</CardTitle>
          <CardDescription>Manage notifications shown inside the AthleteHub platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Direct Messages</Label>
              <p className="text-sm text-muted-foreground">When someone sends you a message.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="space-y-0.5">
              <Label>Mentions</Label>
              <p className="text-sm text-muted-foreground">When you are mentioned in a comment or post.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="space-y-0.5">
              <Label>Task Assignments</Label>
              <p className="text-sm text-muted-foreground">When a new task is assigned to you.</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline">Reset to defaults</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
