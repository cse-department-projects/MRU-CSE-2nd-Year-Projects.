import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { athleteApi } from '@/api/athleteApi';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

import HeroSection from './athlete-profile/HeroSection';
import OverviewTab from './athlete-profile/OverviewTab';
import CompetitionsTab from './athlete-profile/CompetitionsTab';
import TrainingTab from './athlete-profile/TrainingTab';
import AchievementsTab from './athlete-profile/AchievementsTab';

export default function AthleteProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: rawAthlete, isLoading, isError, error } = useQuery({
    queryKey: ['athlete', id],
    queryFn: () => athleteApi.getAthleteById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-10">
        <div className="flex items-center gap-5">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
        <Card className="card-premium">
          <CardContent className="p-10 flex gap-8">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-1/4" />
              <div className="grid grid-cols-4 gap-6">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !rawAthlete) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-red-500 font-medium mb-4">Error loading athlete profile</p>
        <p className="text-muted-foreground text-sm mb-6">{error?.message || 'Athlete not found'}</p>
        <Button onClick={() => navigate('/dashboard/athletes')} variant="outline">Back to Athletes</Button>
      </div>
    );
  }

  // Map backend DTO to UI expected model without artificial defaults
  const athlete = {
    id: String(rawAthlete.id),
    athleteCode: rawAthlete.athleteCode,
    name: rawAthlete.fullName || `${rawAthlete.firstName || ''} ${rawAthlete.lastName || ''}`.trim() || 'N/A',
    sport: rawAthlete.sport ? rawAthlete.sport.name : 'Not Assigned',
    organization: rawAthlete.organizationName || 'Not Assigned',
    organizationId: rawAthlete.organizationId,
    status: rawAthlete.status || 'N/A',
    medicalStatus: rawAthlete.medicalStatus || 'N/A',
    performanceRating: rawAthlete.performanceRating, // allow null
    email: rawAthlete.email || 'N/A',
    phone: rawAthlete.phone || 'N/A',
    gender: rawAthlete.gender || 'N/A',
    age: rawAthlete.age || 'N/A',
    height: rawAthlete.height,
    weight: rawAthlete.weight,
    bloodGroup: rawAthlete.bloodGroup,
    joinDate: rawAthlete.createdAt ? new Date(rawAthlete.createdAt).toLocaleDateString() : 'N/A',
    assignedCoachName: rawAthlete.assignedCoachName || 'Not Assigned',
    injuries: rawAthlete.injuries || [],
    achievements: rawAthlete.achievements || [],
    profilePhotoUrl: rawAthlete.profilePhotoUrl,
  };

  return (
    <div className="space-y-10 page-enter">
      <HeroSection athlete={athlete} />

      {/* Tabs — generous spacing */}
      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="h-11 rounded-xl p-1 bg-muted/50 border overflow-x-auto flex flex-nowrap w-full justify-start md:justify-center">
          <TabsTrigger value="overview" className="h-9 px-6 rounded-lg whitespace-nowrap">Overview</TabsTrigger>
          <TabsTrigger value="competitions" className="h-9 px-6 rounded-lg whitespace-nowrap">Competitions</TabsTrigger>
          <TabsTrigger value="training" className="h-9 px-6 rounded-lg whitespace-nowrap">Training</TabsTrigger>
          <TabsTrigger value="achievements" className="h-9 px-6 rounded-lg whitespace-nowrap">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 outline-none">
          <OverviewTab athlete={athlete} />
        </TabsContent>

        <TabsContent value="competitions" className="space-y-8 outline-none">
          <CompetitionsTab athleteId={athlete.id} />
        </TabsContent>

        <TabsContent value="training" className="space-y-8 outline-none">
          <TrainingTab athleteId={athlete.id} />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-8 outline-none">
          <AchievementsTab athlete={athlete} />
        </TabsContent>
      </Tabs>
    </div>
  );
}


