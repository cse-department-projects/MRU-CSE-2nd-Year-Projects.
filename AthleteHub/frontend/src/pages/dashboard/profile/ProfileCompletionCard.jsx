import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle } from 'lucide-react';

export function ProfileCompletionCard({ user }) {
  // Dynamically calculate completion
  const completionData = useMemo(() => {
    const fields = [
      { key: 'name', label: 'Basic Information', value: user?.name },
      { key: 'email', label: 'Email Address', value: user?.email },
      { key: 'phone', label: 'Phone Number', value: user?.phone },
      { key: 'address', label: 'Home Address', value: user?.address },
      { key: 'emergencyContact', label: 'Emergency Contact', value: user?.emergencyContact?.name },
      { key: 'biography', label: 'Biography', value: user?.biography }
    ];

    const completed = fields.filter(f => !!f.value).length;
    const total = fields.length;
    const percentage = Math.round((completed / total) * 100);

    return { fields, percentage };
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Profile Completion</CardTitle>
        <CardDescription>Complete your profile to get the most out of AthleteHub.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold">{completionData.percentage}%</span>
          <span className="text-sm text-muted-foreground">Setup</span>
        </div>
        <Progress value={completionData.percentage} className="h-2 mb-6" />
        
        <div className="space-y-3 mb-6">
          {completionData.fields.map((field) => (
            <div key={field.key} className="flex items-center gap-3 text-sm">
              {field.value ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              <span className={field.value ? "text-foreground" : "text-muted-foreground"}>
                {field.label}
              </span>
            </div>
          ))}
        </div>
        
        {completionData.percentage < 100 && (
          <Button variant="outline" className="w-full">Complete Profile</Button>
        )}
      </CardContent>
    </Card>
  );
}
