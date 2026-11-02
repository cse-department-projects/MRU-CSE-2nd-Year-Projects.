import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { coachAssignmentApi } from '@/api/coachAssignmentApi';
import { Users, ArrowRight, ShieldCheck, Dumbbell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const categoryColorMap = {
  'Track and Field': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'Team Sport': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Racket Sport': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'Water Sport': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  'Contact Sport': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
};

export default function CoachAssignmentsWidget() {
  const navigate = useNavigate();

  const { data: response, isLoading } = useQuery({
    queryKey: ['recentCoachAssignments'],
    queryFn: () => coachAssignmentApi.getAssignments({ page: 1, page_size: 5 }),
  });

  const assignments = response?.data || [];
  const total = response?.pagination?.total_records || assignments.length;

  return (
    <div className="p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">Coach Assignments</h3>
              <p className="text-xs text-muted-foreground">{total} athlete-coach links active</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-mono bg-primary/5 text-primary border-primary/20">
            {total} Active
          </Badge>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 rounded-xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No coach assignments registered yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {assignments.map(asg => {
              const catStyle = categoryColorMap[asg.sportCategory] || 'bg-primary/10 text-primary border-primary/20';
              return (
                <div 
                  key={asg.id}
                  onClick={() => navigate('/dashboard/coach-assignments')}
                  className="p-3 rounded-xl border border-border/40 bg-background/50 hover:bg-primary/5 transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground truncate">{asg.coachName}</span>
                      <span className="text-muted-foreground text-xs">→</span>
                      <span className="font-semibold text-xs text-primary truncate">{asg.athleteName}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {asg.sportName} • {asg.coachSpecialization || 'Coach'}
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${catStyle}`}>
                    {asg.sportCategory || 'Sport'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-border/40">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/dashboard/coach-assignments')}
          className="w-full text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 gap-1.5"
        >
          View All Coach Assignments <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
