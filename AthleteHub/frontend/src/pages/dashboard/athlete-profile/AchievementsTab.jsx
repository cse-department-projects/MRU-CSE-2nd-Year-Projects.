import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

export default function AchievementsTab({ athlete }) {
  if (!athlete) return null;

  return (
    <div className="space-y-8">
      <Card className="card-premium">
        <CardContent className="p-10">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-8">Achievements & Awards</h3>
          {athlete.achievements && athlete.achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {athlete.achievements.map((achievement, i) => (
                <div key={i} className="flex items-center gap-4 p-6 bg-amber-50 border border-amber-200 rounded-xl hover:shadow-sm transition-shadow">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 shrink-0 border border-amber-200">
                    <Trophy className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-900">{achievement}</p>
                    <p className="text-sm text-amber-700 mt-0.5">Career Achievement</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 border-2 border-dashed rounded-xl border-muted">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto mb-4">
                <Trophy className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="text-lg font-medium text-foreground mb-2">No achievements yet</h4>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Achievements and awards will appear here once they are added to the athlete's profile.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
