import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, Shield, UserCircle, Target, CalendarDays, Trophy, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import { Link } from 'react-router-dom';

export function ActivityTimeline() {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['profile-recent-activity'],
    queryFn: async () => {
      const list = [];
      try {
        const [trainingRes, eventRes] = await Promise.allSettled([
          api.get('/training-sessions', { params: { pageSize: 3, page: 1, sortDir: 'desc' } }),
          api.get('/events', { params: { pageSize: 3, page: 1, sortDir: 'desc' } })
        ]);

        if (trainingRes.status === 'fulfilled') {
          const sessions = trainingRes.value.data?.data?.items || trainingRes.value.data?.items || [];
          sessions.forEach((s) => {
            list.push({
              id: `training-${s.id}`,
              type: 'training',
              title: s.title || s.description || 'Training Session',
              date: s.sessionDate || 'Scheduled',
              status: s.status || 'Active',
              icon: Target,
              color: 'text-indigo-500 bg-indigo-500/10'
            });
          });
        }

        if (eventRes.status === 'fulfilled') {
          const events = eventRes.value.data?.data?.items || eventRes.value.data?.items || [];
          events.forEach((ev) => {
            list.push({
              id: `event-${ev.id}`,
              type: 'event',
              title: ev.name || 'Tournament Event',
              date: ev.startDate ? new Date(ev.startDate).toLocaleDateString() : 'Upcoming',
              status: ev.status || 'Active',
              icon: Trophy,
              color: 'text-amber-500 bg-amber-500/10'
            });
          });
        }
      } catch (err) {
        console.warn('Could not load profile activities', err);
      }
      return list;
    }
  });

  return (
    <Card className="card-premium">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" /> Recent Activity
        </CardTitle>
        <CardDescription>Your latest schedule, matches, and system actions.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-6"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/40">
                  <div className={`p-2 rounded-lg ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.date} · {item.status}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
            <Activity className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm font-medium">No recent activities recorded</p>
            <p className="text-xs mt-1">Activities will appear as sessions and events are scheduled.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
