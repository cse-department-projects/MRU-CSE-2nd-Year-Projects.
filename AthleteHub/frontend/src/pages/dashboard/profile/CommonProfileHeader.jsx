import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Camera } from 'lucide-react';

export function CommonProfileHeader({ user, role }) {
  return (
    <div className="relative card-telemetry-elevated overflow-hidden mb-8">
      <div className="h-28 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent border-b border-border/40" />
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-10 sm:-mt-12 mb-4">
          <div className="relative">
            <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-card shadow-xl">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {user?.name?.substring(0, 2).toUpperCase() || 'AH'}
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-1 right-1 p-2 bg-card border border-border/60 shadow-sm rounded-xl hover:bg-muted transition-colors text-muted-foreground">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 space-y-1.5 sm:pb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">{user?.name || 'User'}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <Badge variant="outline" className="font-mono uppercase text-[10px] px-2 py-0.5 bg-primary/10 text-primary border-primary/20">{role?.replace('_', ' ') || 'User'}</Badge>
              <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary" /> {user?.address || 'Location not set'}</div>
              <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" /> Joined {new Date(user?.memberSince || Date.now()).toLocaleDateString()}</div>
            </div>
          </div>
          <div className="flex gap-3 sm:pb-1 w-full sm:w-auto">
            <Button className="flex-1 sm:flex-none shadow-sm rounded-xl h-9 px-4 text-xs font-semibold">Edit Profile</Button>
          </div>
        </div>
        {user?.biography && <p className="text-xs text-muted-foreground mt-3 max-w-3xl leading-relaxed">{user.biography}</p>}
      </div>
    </div>
  );
}
