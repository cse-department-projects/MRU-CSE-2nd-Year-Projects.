import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Trophy, Globe, MessageCircle } from 'lucide-react';

export function AboutSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">About AthleteHub</h2>
        <p className="text-sm text-muted-foreground">Version information and resources.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg mb-2">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">AthleteHub Enterprise</h3>
              <p className="text-sm text-muted-foreground mt-1">The ultimate sports management platform.</p>
            </div>
            <div className="flex items-center gap-2 text-sm bg-muted px-3 py-1 rounded-full">
              <span className="font-semibold text-foreground">Version:</span>
              <span className="text-muted-foreground">2.4.1 (Build 8902)</span>
            </div>
            <p className="text-xs text-muted-foreground">Released on: July 20, 2026</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-between">
              Documentation <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" className="w-full justify-between">
              API Reference <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" className="w-full justify-between">
              Release Notes <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Legal & Social</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-between">
              Terms of Service <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" className="w-full justify-between">
              Privacy Policy <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" size="icon" className="flex-1 border"><Globe className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="flex-1 border"><MessageCircle className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
