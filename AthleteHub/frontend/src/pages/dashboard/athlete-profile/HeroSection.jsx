import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, Calendar, ArrowLeft, Edit } from 'lucide-react';

const statusColors = {
  Active: 'bg-green-100 text-green-800 border-green-200',
  Injured: 'bg-red-100 text-red-800 border-red-200',
  Inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  Suspended: 'bg-orange-100 text-orange-800 border-orange-200',
};

const medicalColors = {
  Fit: 'bg-green-100 text-green-800 border-green-200',
  'Under Review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Restricted: 'bg-red-100 text-red-800 border-red-200',
  Recovering: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function HeroSection({ athlete }) {
  const navigate = useNavigate();
  
  if (!athlete) return null;

  return (
    <div className="space-y-6">
      {/* Back + Title */}
      <div className="flex items-center gap-5">
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => navigate('/dashboard/athletes')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{athlete.name}</h1>
          <p className="text-muted-foreground mt-1">{athlete.athleteCode || `ATH-${athlete.id}`} · {athlete.sport}</p>
        </div>
        <Button onClick={() => navigate(`/dashboard/athletes/${athlete.id}/edit`)} className="gap-2 h-11 px-6 rounded-xl">
          <Edit className="h-4 w-4" />
          Edit Athlete
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="card-telemetry-elevated relative overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent border-b border-border/40" />
        <CardContent className="p-8 pt-0 -mt-6 flex flex-col md:flex-row items-start gap-6 relative z-10">
          <Avatar className="h-24 w-24 border-4 border-card shadow-lg">
            <AvatarImage src={athlete.profilePhotoUrl} />
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              {athlete.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4 mt-6 md:mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-extrabold text-foreground">{athlete.name}</h2>
                <Badge variant="outline" className={`text-xs px-2.5 py-0.5 font-semibold ${statusColors[athlete.status] || 'bg-muted text-muted-foreground'}`}>
                  {athlete.status}
                </Badge>
                <Badge variant="outline" className={`text-xs px-2.5 py-0.5 font-semibold ${medicalColors[athlete.medicalStatus] || 'bg-muted text-muted-foreground'}`}>
                  {athlete.medicalStatus}
                </Badge>
              </div>

              {athlete.performanceRating && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground label-caps">Telemetry Index</span>
                  <span className="font-mono-telemetry font-bold text-lg text-primary">{athlete.performanceRating}/100</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground pt-3 border-t border-border/40">
              <div className="flex items-center gap-2.5"><Mail className="h-4 w-4 text-primary shrink-0" /> <span className="truncate">{athlete.email}</span></div>
              <div className="flex items-center gap-2.5"><Phone className="h-4 w-4 text-primary shrink-0" /> <span className="truncate">{athlete.phone}</span></div>
              <div className="flex items-center gap-2.5"><User className="h-4 w-4 text-primary shrink-0" /> {athlete.gender}, {athlete.age} yrs</div>
              <div className="flex items-center gap-2.5"><Calendar className="h-4 w-4 text-primary shrink-0" /> Registered {athlete.joinDate}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
