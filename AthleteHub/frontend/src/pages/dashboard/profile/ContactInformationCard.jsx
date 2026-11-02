import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

export function ContactInformationCard({ user }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">{user?.email || 'Not provided'}</p>
            <p className="text-xs text-muted-foreground">Primary Email</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">{user?.phone || 'Not provided'}</p>
            <p className="text-xs text-muted-foreground">Mobile Phone</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">{user?.address || 'Not provided'}</p>
            <p className="text-xs text-muted-foreground">Home Address</p>
          </div>
        </div>
        {user?.website && (
          <div className="flex items-start gap-3">
            <Globe className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-500 hover:underline cursor-pointer">{user.website}</p>
              <p className="text-xs text-muted-foreground">Website</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
