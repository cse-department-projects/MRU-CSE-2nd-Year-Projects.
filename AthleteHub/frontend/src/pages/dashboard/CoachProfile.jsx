import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { coachApi } from '../../api/coachApi';
import { coachAssignmentApi } from '../../api/coachAssignmentApi';
import { usePermissions } from '../../hooks/usePermissions';
import AssignAthletesModal from '@/components/coaches/AssignAthletesModal';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  GraduationCap,
  ArrowLeft,
  Mail,
  Phone,
  Award,
  Users,
  ShieldCheck,
  Star,
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const statusStyles = {
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  INACTIVE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  DELETED: 'bg-red-100 text-red-800 border-red-200',
  SUSPENDED: 'bg-orange-100 text-orange-800 border-orange-200',
};

export default function CoachProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isRole, can } = usePermissions();
  const canManageCoaches = isRole('SUPER_ADMIN') || isRole('ORG_ADMIN') || can('coach.assign');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['coach', id],
    queryFn: () => coachApi.getCoachById(id),
    enabled: !!id,
  });

  const { data: assignmentsRes, refetch: refetchAssignments } = useQuery({
    queryKey: ['coachAssignments', id],
    queryFn: () => coachAssignmentApi.getByCoach(id),
    enabled: !!id,
  });

  if (isLoading) {
    return <LoadingSpinner text="Loading coach details..." />;
  }

  if (error || !data) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl mb-6">
        {error?.message || 'Failed to load coach details'}
      </div>
    );
  }

  const coach = data.data;
  const assignments = Array.isArray(assignmentsRes?.data) ? assignmentsRes.data : (Array.isArray(assignmentsRes) ? assignmentsRes : []);

  // Split comma separated strings into arrays for UI
  const specializations = coach.specialization ? coach.specialization.split(',').map(s => s.trim()) : [];
  const certifications = coach.certifications ? coach.certifications.split(',').map(c => c.trim()) : [];

  return (
    <div className="space-y-10 page-enter">
      {/* Page Header */}
      <div className="flex items-center gap-6">
        <Button
          variant="outline"
          className="h-11 rounded-xl px-6 bg-transparent border-white/10 hover:bg-white/5"
          onClick={() => navigate('/dashboard/coaches')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{coach.firstName} {coach.lastName}</h1>
          <p className="text-muted-foreground">
            {coach.specialization || 'General'} Coach — {coach.organizationName || 'Independent'}
          </p>
        </div>
        {canManageCoaches && (
          <Button
            variant="outline"
            className="h-11 rounded-xl px-5 border-primary/30 text-primary hover:bg-primary/10 gap-2 font-medium"
            onClick={() => setIsAssignModalOpen(true)}
          >
            <Users className="h-4 w-4" />
            Assign Athletes by Sport
          </Button>
        )}
        <Button
          variant="default"
          className="h-11 rounded-xl px-6"
          onClick={() => navigate(`/dashboard/coaches/${coach.id}/edit`)}
        >
          Edit Profile
        </Button>
      </div>

      {/* Header Card */}
      <Card className="card-premium border border-border/60 shadow-sm">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <Avatar className="h-16 w-16 border border-border/60">
              <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                {(coach.firstName?.[0] || '') + (coach.lastName?.[0] || '') || 'CO'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">{[coach.firstName, coach.lastName].filter(Boolean).join(' ') || coach.fullName || 'Coach Profile'}</h2>
                <Badge
                  variant="outline"
                  className={`rounded-full px-3 py-0.5 text-xs font-semibold ${statusStyles[coach.status] || 'bg-muted text-muted-foreground border-border'}`}
                >
                  {coach.status || 'N/A'}
                </Badge>
              </div>

              <Separator className="bg-border/60" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{coach.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{coach.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{coach.experienceYears || 0} years experience</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{assignments.length} assigned {assignments.length === 1 ? 'athlete' : 'athletes'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="specializations" className="space-y-8">
        <TabsList className="bg-muted/40 border border-border/60 p-1">
          <TabsTrigger value="specializations">Specializations</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="athletes">Assigned Athletes</TabsTrigger>
        </TabsList>

        {/* Specializations Tab */}
        <TabsContent value="specializations" className="space-y-8">
          <Card className="card-premium border border-border/60 shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Award className="h-5 w-5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Coaching Specializations
                </span>
              </div>
              <div className="space-y-4">
                {specializations.length > 0 ? specializations.map((spec, i) => (
                  <div
                    key={i}
                    className="p-4 bg-muted/30 border border-border/40 rounded-xl flex items-center gap-4"
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary text-sm font-bold"
                    >
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-sm text-foreground">{spec}</span>
                  </div>
                )) : (
                  <p className="text-muted-foreground text-sm">No specializations listed.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-8">
          <Card className="card-premium border border-border/60 shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Professional Certifications
                </span>
              </div>
              <div className="space-y-4">
                {certifications.length > 0 ? certifications.map((cert, i) => (
                  <div
                    key={i}
                    className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <Star className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <p className="font-semibold text-sm text-emerald-700 dark:text-emerald-300">{cert}</p>
                    </div>
                    <p className="text-xs text-emerald-600/80">Verified and active</p>
                  </div>
                )) : (
                  <p className="text-muted-foreground text-sm">No certifications listed.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assigned Athletes Tab */}
        <TabsContent value="athletes" className="space-y-8">
          <Card className="card-premium border border-border/60 shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-indigo-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Assigned Athletes
                  </span>
                  <Badge variant="secondary" className="rounded-full px-2 text-xs">
                    {assignments.length}
                  </Badge>
                </div>
                {canManageCoaches && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-xl px-3 border-primary/30 text-primary hover:bg-primary/10 gap-1.5 text-xs font-semibold"
                    onClick={() => setIsAssignModalOpen(true)}
                  >
                    <Users className="h-3.5 w-3.5" />
                    Assign Athletes by Sport
                  </Button>
                )}
              </div>

              {assignments.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Athlete</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-semibold text-foreground">
                            <Link to={`/dashboard/athletes/${assignment.athleteId}`} className="hover:text-primary transition-colors">
                              {assignment.athleteName || assignment.athlete?.name || `Athlete #${assignment.athleteId}`}
                            </Link>
                          </TableCell>
                          <TableCell>{assignment.startDate || 'N/A'}</TableCell>
                          <TableCell>{assignment.endDate || 'Ongoing'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs font-semibold">
                              {assignment.status || 'Active'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" asChild>
                              <Link to={`/dashboard/coach-assignments/${assignment.id}`}>View Assignment</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    No athletes currently assigned.
                  </p>
                  {canManageCoaches ? (
                    <Button size="sm" variant="outline" className="mt-4 gap-1.5" onClick={() => setIsAssignModalOpen(true)}>
                      <Users className="h-3.5 w-3.5" />
                      Assign Athletes by Sport
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="mt-4" asChild>
                      <Link to="/dashboard/coach-assignments/new">Assign Athlete</Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sport-Based Athlete Assignment Modal */}
      <AssignAthletesModal
        coachId={coach.id}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssigned={() => refetchAssignments()}
      />
    </div>
  );
}
