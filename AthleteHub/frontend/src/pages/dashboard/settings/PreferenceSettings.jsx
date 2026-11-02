import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export function PreferenceSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Preferences</h2>
        <p className="text-sm text-muted-foreground">Customize your workflow and dashboard behavior.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dashboard Layout</CardTitle>
          <CardDescription>Adjust how information is displayed in the main views.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Default View</Label>
            <Select defaultValue="overview">
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select default view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="calendar">Calendar</SelectItem>
                <SelectItem value="athletes">Athletes List</SelectItem>
                <SelectItem value="tasks">My Tasks</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Items Per Page (Tables)</Label>
            <Select defaultValue="25">
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 items</SelectItem>
                <SelectItem value="25">25 items</SelectItem>
                <SelectItem value="50">50 items</SelectItem>
                <SelectItem value="100">100 items</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="space-y-0.5">
              <Label>Collapse Sidebar by Default</Label>
              <p className="text-sm text-muted-foreground">Start with the navigation sidebar collapsed to save space.</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="space-y-0.5">
              <Label>Enable Animations</Label>
              <p className="text-sm text-muted-foreground">Show smooth transitions and UI animations.</p>
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
