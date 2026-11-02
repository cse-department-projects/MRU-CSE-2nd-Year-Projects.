import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../api/axios';
import { coachAssignmentApi } from '../../api/coachAssignmentApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AssignAthletesModal from '@/components/coaches/AssignAthletesModal';
import { Sparkles, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const assignmentSchema = z.object({
  organizationId: z.coerce.number().min(1, 'Organization is required'),
  coachId: z.coerce.number().min(1, 'Coach is required'),
  athleteId: z.coerce.number().min(1, 'Athlete is required'),
  startDate: z.string().min(1, 'Start Date is required'),
  endDate: z.string().optional().nullable().transform(val => val === '' ? null : val),
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']).default('ACTIVE'),
  remarks: z.string().optional().nullable()
});

export default function CoachAssignmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCoachId = searchParams.get('coachId');
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const { data: assignmentRes, isLoading: initialLoading } = useQuery({
    queryKey: ['coachAssignment', id],
    queryFn: () => coachAssignmentApi.getAssignmentById(id),
    enabled: isEdit
  });

  const assignment = assignmentRes?.data;
  const originalStatus = assignment?.status;
  const isReadOnly = originalStatus === 'COMPLETED' || originalStatus === 'CANCELLED';

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      organizationId: '',
      coachId: initialCoachId || '',
      athleteId: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'ACTIVE',
      remarks: ''
    }
  });

  useEffect(() => {
    if (assignment) {
      reset({
        organizationId: assignment.organizationId || '',
        coachId: assignment.coachId || '',
        athleteId: assignment.athleteId || '',
        startDate: assignment.startDate || '',
        endDate: assignment.endDate || '',
        status: assignment.status || 'ACTIVE',
        remarks: assignment.remarks || ''
      });
    }
  }, [assignment, reset]);

  const { data: coachesRes } = useQuery({
    queryKey: ['coachesLookup'],
    queryFn: () => api.get('/coaches', { params: { page_size: 200, status: 'ACTIVE' } }).then(res => res.data)
  });
  
  const { data: athletesRes } = useQuery({
    queryKey: ['athletesLookup'],
    queryFn: () => api.get('/athletes', { params: { page_size: 200, status: 'Active' } }).then(res => res.data)
  });
  
  const { data: orgsRes } = useQuery({
    queryKey: ['organizationsLookup'],
    queryFn: () => api.get('/organizations', { params: { page_size: 100, status: 'Active' } }).then(res => res.data)
  });

  const coaches = coachesRes?.data || [];
  const athletes = athletesRes?.data || [];
  const organizations = orgsRes?.data || [];

  const createMutation = useMutation({
    mutationFn: coachAssignmentApi.createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coachAssignments'] });
      navigate('/dashboard/coach-assignments');
    }
  });

  const updateMutation = useMutation({
    mutationFn: coachAssignmentApi.updateAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coachAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['coachAssignment', id] });
      navigate('/dashboard/coach-assignments');
    }
  });

  const onSubmit = (data) => {
    if (isEdit) {
      updateMutation.mutate({ id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const selectedOrgId = watch('organizationId');
  const selectedCoachId = watch('coachId');
  const selectedCoach = coaches.find(c => c.id === parseInt(selectedCoachId));

  useEffect(() => {
    if (initialCoachId && coaches.length > 0 && !isEdit) {
      const c = coaches.find(item => item.id === parseInt(initialCoachId));
      if (c && c.organizationId) {
        setValue('organizationId', c.organizationId);
      }
    }
  }, [initialCoachId, coaches, isEdit, setValue]);

  const orgAthletes = athletes.filter(a => !selectedOrgId || a.organizationId === parseInt(selectedOrgId));

  const matchingAthletes = orgAthletes.filter(a => {
    if (!selectedCoach?.specialization) return false;
    const spec = selectedCoach.specialization.toLowerCase();
    const sName = (a.sport?.name || a.sportName || '').toLowerCase();
    const sCat = (a.sport?.category || a.sportCategory || '').toLowerCase();
    return spec.includes(sName) || sName.includes(spec) || spec.includes(sCat) || sCat.includes(spec)
      || (spec.includes('track') && (sName.includes('athletic') || sName.includes('track') || sName.includes('sprint')))
      || (spec.includes('sprint') && (sName.includes('athletic') || sName.includes('track')))
      || (spec.includes('racket') && (sName.includes('tennis') || sName.includes('badminton') || sName.includes('squash')))
      || (spec.includes('team') && (sName.includes('football') || sName.includes('basketball') || sName.includes('cricket')));
  });

  const otherAthletes = orgAthletes.filter(a => !matchingAthletes.some(m => m.id === a.id));

  if (isEdit && initialLoading) return <LoadingSpinner text="Loading assignment..." />;

  const mutationError = createMutation.error || updateMutation.error;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-h2">{isEdit ? 'Edit Assignment' : 'New Assignment'}</h1>
        <button onClick={() => navigate('/dashboard/coach-assignments')} className="text-muted-foreground hover:text-foreground transition-colors">
          Cancel
        </button>
      </div>

      {mutationError && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-xl mb-6">
          {mutationError.response?.data?.message || mutationError.message || 'Operation failed'}
        </div>
      )}
      
      {isReadOnly && (
         <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 p-4 rounded-xl mb-6">
          This assignment is {originalStatus}. Only remarks can be updated.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="card flex flex-col gap-4">
        
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Organization *</label>
          <select {...register('organizationId')} disabled={isEdit} className="input">
            <option value="">-- Select Organization --</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
          {errors.organizationId && <span className="text-xs text-destructive">{errors.organizationId.message}</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Coach *</label>
              {selectedCoach && (
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(true)}
                  className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Assign Multiple by Sport
                </button>
              )}
            </div>
            <select {...register('coachId')} disabled={isEdit} className="input">
              <option value="">-- Select Coach --</option>
              {coaches.filter(c => !selectedOrgId || c.organizationId === parseInt(selectedOrgId)).map(coach => (
                <option key={coach.id} value={coach.id}>
                  {coach.firstName} {coach.lastName} ({coach.coachCode}) — {coach.specialization || 'General'}
                </option>
              ))}
            </select>
            {selectedCoach?.specialization && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                <Award className="w-3 h-3 text-primary" />
                Specialization: <strong className="text-foreground">{selectedCoach.specialization}</strong>
              </span>
            )}
            {errors.coachId && <span className="text-xs text-destructive">{errors.coachId.message}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">Athlete *</label>
            <select {...register('athleteId')} disabled={isEdit} className="input">
              <option value="">-- Select Athlete --</option>
              {matchingAthletes.length > 0 && (
                <optgroup label={`✨ Matching Coach Sport (${matchingAthletes.length})`}>
                  {matchingAthletes.map(athlete => (
                    <option key={athlete.id} value={athlete.id}>
                      {athlete.firstName} {athlete.lastName} ({athlete.athleteCode}) — {athlete.sport?.name || athlete.sportName || 'Sport'}
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label={`All Other Athletes (${otherAthletes.length})`}>
                {otherAthletes.map(athlete => (
                  <option key={athlete.id} value={athlete.id}>
                    {athlete.firstName} {athlete.lastName} ({athlete.athleteCode}) — {athlete.sport?.name || athlete.sportName || 'Sport'}
                  </option>
                ))}
              </optgroup>
            </select>
            {errors.athleteId && <span className="text-xs text-destructive">{errors.athleteId.message}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">Start Date *</label>
            <input type="date" {...register('startDate')} disabled={isReadOnly} className="input" />
            {errors.startDate && <span className="text-xs text-destructive">{errors.startDate.message}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">End Date</label>
            <input type="date" {...register('endDate')} disabled={isReadOnly} className="input" />
            {errors.endDate && <span className="text-xs text-destructive">{errors.endDate.message}</span>}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Status *</label>
          <select {...register('status')} disabled={isReadOnly} className="input">
            <option value="ACTIVE">ACTIVE</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          {errors.status && <span className="text-xs text-destructive">{errors.status.message}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Remarks</label>
          <textarea {...register('remarks')} className="input min-h-[100px]" placeholder="Add any notes about this assignment..."></textarea>
          {errors.remarks && <span className="text-xs text-destructive">{errors.remarks.message}</span>}
        </div>

        <div className="mt-4 flex justify-end">
          <button type="submit" disabled={isSaving} className="btn btn-primary min-w-[150px]">
            {isSaving ? 'Saving...' : 'Save Assignment'}
          </button>
        </div>
      </form>

      {/* Batch Sport Assignment Modal */}
      {selectedCoach && (
        <AssignAthletesModal
          coachId={selectedCoach.id}
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          onAssigned={() => navigate('/dashboard/coach-assignments')}
        />
      )}
    </div>
  );
}
