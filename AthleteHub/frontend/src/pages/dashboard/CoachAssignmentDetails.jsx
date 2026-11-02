import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coachAssignmentApi } from '../../api/coachAssignmentApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { Calendar, User, Users, FileText, CheckCircle, Edit, Trash2, Building } from 'lucide-react';
import { toast } from 'sonner';

export default function CoachAssignmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['coachAssignment', id],
    queryFn: () => coachAssignmentApi.getAssignmentById(id),
    enabled: !!id
  });

  const cancelMutation = useMutation({
    mutationFn: coachAssignmentApi.cancelAssignment,
    onSuccess: () => {
      toast.success('Assignment cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['coachAssignments'] });
      navigate('/dashboard/coach-assignments');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to cancel assignment');
    }
  });

  const handleCancel = () => {
    if (!window.confirm("Are you sure you want to cancel this assignment? This requires Admin permissions.")) return;
    cancelMutation.mutate(id);
  };

  if (isLoading) return <LoadingSpinner text="Loading details..." />;
  if (error) return <div className="text-destructive p-4">{error.response?.data?.message || error.message || 'Failed to load assignment details'}</div>;
  
  const assignment = response?.data;
  if (!assignment) return <div className="p-4">Assignment not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-h2 m-0">Assignment Details</h1>
            <StatusBadge status={assignment.status || 'UNKNOWN'} />
          </div>
          <div className="text-muted-foreground font-mono text-sm">Code: {assignment.assignmentCode || 'N/A'}</div>
        </div>
        
        <div className="flex gap-2">
          <Link to={`/dashboard/coach-assignments/${id}/edit`} className="btn btn-outline py-2 px-4 text-sm flex items-center gap-2">
            <Edit size={16} /> Edit
          </Link>
          {assignment.status !== 'CANCELLED' && (
             <button onClick={handleCancel} disabled={cancelMutation.isPending} className="btn bg-destructive/10 text-destructive border border-red-500/30 hover:bg-red-500 hover:text-foreground py-2 px-4 text-sm flex items-center gap-2 transition-colors">
              <Trash2 size={16} /> {cancelMutation.isPending ? 'Processing...' : 'Cancel'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Timeline / Duration */}
        <div className="card lg:col-span-3 bg-card border border-primary/20 flex flex-col md:flex-row justify-around py-6 text-center">
          <div className="flex flex-col items-center">
            <div className="bg-primary/10 p-3 rounded-full text-primary mb-2">
              <Calendar size={24} />
            </div>
            <div className="text-muted-foreground text-xs font-bold uppercase tracking-wide">Created</div>
            <div className="font-medium text-foreground mt-1">{assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString() : 'N/A'}</div>
          </div>
          
          <div className="hidden md:flex flex-col justify-center flex-1 max-w-[200px]">
            <div className="h-0.5 w-full bg-border relative">
              <div className="absolute right-0 -top-1 w-2 h-2 rounded-full bg-primary"></div>
            </div>
          </div>

          <div className="flex flex-col items-center mt-6 md:mt-0">
             <div className="bg-green-500/10 p-3 rounded-full text-green-500 mb-2">
              <CheckCircle size={24} />
            </div>
            <div className="text-muted-foreground text-xs font-bold uppercase tracking-wide">Start Date</div>
            <div className="font-medium text-foreground mt-1">{assignment.startDate ? new Date(assignment.startDate).toLocaleDateString() : 'N/A'}</div>
          </div>

           <div className="hidden md:flex flex-col justify-center flex-1 max-w-[200px]">
            <div className="h-0.5 w-full bg-border relative">
               <div className={`absolute right-0 -top-1 w-2 h-2 rounded-full ${assignment.endDate ? 'bg-red-500' : 'bg-gray-500'}`}></div>
            </div>
          </div>

          <div className="flex flex-col items-center mt-6 md:mt-0">
             <div className={`p-3 rounded-full mb-2 ${assignment.endDate ? 'bg-destructive/10 text-destructive' : 'bg-gray-500/10 text-gray-500'}`}>
              <Calendar size={24} />
            </div>
            <div className="text-muted-foreground text-xs font-bold uppercase tracking-wide">End Date</div>
            <div className="font-medium text-foreground mt-1">{assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : 'Active/Indefinite'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coach Summary */}
        <div className="card">
          <h2 className="text-lg font-bold mb-4 text-primary border-b border-white/10 pb-2 flex items-center gap-2">
             <User size={18} /> Assigned Coach
          </h2>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Name</div>
              <div className="font-medium text-lg">{assignment.coachName || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Coach Code</div>
              <div className="font-mono text-primary">{assignment.coachCode || 'N/A'}</div>
            </div>
             <Link to={`/dashboard/coaches/${assignment.coachId}`} className="text-sm text-primary hover:underline mt-2 inline-block">
                View Coach Profile &rarr;
             </Link>
          </div>
        </div>

        {/* Athlete Summary */}
        <div className="card">
          <h2 className="text-lg font-bold mb-4 text-blue-400 border-b border-white/10 pb-2 flex items-center gap-2">
             <Users size={18} /> Assigned Athlete
          </h2>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Name</div>
              <div className="font-medium text-lg">{assignment.athleteName || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Athlete Code</div>
              <div className="font-mono text-blue-400">{assignment.athleteCode || 'N/A'}</div>
            </div>
             <Link to={`/dashboard/athletes/${assignment.athleteId}`} className="text-sm text-blue-400 hover:underline mt-2 inline-block">
                View Athlete Profile &rarr;
             </Link>
          </div>
        </div>

        {/* Org & Remarks */}
        <div className="card md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-bold mb-4 text-foreground border-b border-white/10 pb-2 flex items-center gap-2">
                 <Building size={18} /> Organization
              </h2>
              <div className="font-medium text-lg">{assignment.organizationName || 'N/A'}</div>
            </div>
            <div>
              <h2 className="text-lg font-bold mb-4 text-foreground border-b border-white/10 pb-2 flex items-center gap-2">
                 <FileText size={18} /> Remarks
              </h2>
              <div className="text-muted-foreground bg-card/5 p-4 rounded-lg min-h-[100px] whitespace-pre-wrap">
                {assignment.remarks || 'No remarks provided.'}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
