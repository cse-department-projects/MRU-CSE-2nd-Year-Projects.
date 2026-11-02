import React, { useState } from "react";
import { PageLayout } from "../../components/ui/PageLayout";
import api from "../../api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorState from "@/components/ui/ErrorState";
import { Plus, CheckSquare, Clock, AlertCircle, X, Calendar, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const priorityStyles = {
  HIGH: "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300",
  MEDIUM: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300",
  LOW: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300"
};

const statusStyles = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300",
  COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300"
};

export default function RecruitmentTasks() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "MEDIUM",
    prospectId: ""
  });

  const { data: tasks = [], isLoading: loading, error } = useQuery({
    queryKey: ["recruitmentTasks"],
    queryFn: async () => {
      const res = await api.get("/recruitment/tasks");
      return res.data.data || [];
    }
  });

  const { data: prospects = [] } = useQuery({
    queryKey: ["recruitmentProspects"],
    queryFn: async () => {
      const res = await api.get("/recruitment/prospects");
      return res.data.data || [];
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: async (payload) => {
      await api.post("/recruitment/tasks", payload);
    },
    onSuccess: () => {
      toast.success("Scouting task scheduled successfully");
      setShowCreateModal(false);
      setTaskForm({
        title: "",
        description: "",
        dueDate: "",
        priority: "MEDIUM",
        prospectId: ""
      });
      queryClient.invalidateQueries(["recruitmentTasks"]);
      queryClient.invalidateQueries(["recruitmentDashboard"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create task");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      toast.error("Please enter a task title");
      return;
    }
    const payload = {
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      dueDate: taskForm.dueDate || null,
      priority: taskForm.priority,
      status: "PENDING",
      prospectId: taskForm.prospectId ? parseInt(taskForm.prospectId, 10) : null
    };
    createTaskMutation.mutate(payload);
  };

  if (loading) {
    return (
      <PageLayout title="Recruitment Tasks">
        <LoadingSpinner />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Recruitment Tasks">
        <ErrorState message="Failed to load tasks" />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Recruitment Tasks">
      <div className="p-6 md:p-10 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Scouting & Recruitment Tasks</h2>
              <span className="font-mono-telemetry text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {tasks.length} Tasks
              </span>
            </div>
            <p className="text-muted-foreground text-sm mt-1">Manage recruit outreach, tryout coordination, and scout evaluation checklists.</p>
          </div>

          <Button onClick={() => setShowCreateModal(true)} className="rounded-xl font-bold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
            <Plus className="h-4 w-4" /> Schedule Task
          </Button>
        </div>

        {/* Modal: Schedule Task */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <CheckSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Schedule Scouting Task</h3>
                    <p className="text-xs text-muted-foreground">Assign follow-ups, trial bookings, and athlete reviews</p>
                  </div>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="rounded-full p-1 text-muted-foreground hover:bg-muted">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="taskTitle" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Task Title <span className="text-destructive">*</span></Label>
                  <Input
                    id="taskTitle"
                    placeholder="e.g. Call athlete coach for match film"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="rounded-xl h-11 text-sm"
                    required
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prospectSelect" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Linked Prospect</Label>
                    <select
                      id="prospectSelect"
                      value={taskForm.prospectId}
                      onChange={(e) => setTaskForm({ ...taskForm, prospectId: e.target.value })}
                      className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">General Task (No Prospect)</option>
                      {prospects.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.athlete?.fullName || (p.athlete?.firstName ? `${p.athlete.firstName} ${p.athlete.lastName}` : `Prospect #${p.id}`)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taskPriority" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Priority</Label>
                    <select
                      id="taskPriority"
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                      className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="HIGH">High Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="LOW">Low Priority</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="rounded-xl h-11 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taskDesc" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description / Action Notes</Label>
                  <Textarea
                    id="taskDesc"
                    placeholder="Details about trials, coach feedback, or requirements..."
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    className="rounded-2xl min-h-[90px] text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="rounded-xl px-5">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTaskMutation.isPending} className="rounded-xl px-6 font-bold">
                    {createTaskMutation.isPending ? "Scheduling..." : "Schedule Task"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tasks Table */}
        <div className="card-telemetry-elevated rounded-3xl border border-border/60 overflow-hidden shadow-sm bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b border-border/60 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Task Details</th>
                  <th className="px-6 py-4">Linked Prospect</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-muted-foreground">
                      <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="font-bold text-foreground">No tasks scheduled</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Click Schedule Task above to create scout follow-ups.</p>
                    </td>
                  </tr>
                ) : (
                  tasks.map(t => (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-foreground text-sm">{t.title}</p>
                        {t.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 max-w-md line-clamp-1">{t.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-foreground">
                        {t.prospectName ? (
                          <span className="font-semibold text-primary">{t.prospectName}</span>
                        ) : (
                          <span className="text-muted-foreground">General Task</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {t.dueDate ? (
                          <span className="flex items-center gap-1.5 font-medium">
                            <Calendar className="h-3.5 w-3.5 text-primary" /> {t.dueDate}
                          </span>
                        ) : (
                          "No deadline"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`text-xs font-bold px-2 py-0.5 uppercase ${priorityStyles[t.priority] || priorityStyles.MEDIUM}`}>
                          {t.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`text-xs font-bold px-2 py-0.5 uppercase ${statusStyles[t.status] || statusStyles.PENDING}`}>
                          {t.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}




