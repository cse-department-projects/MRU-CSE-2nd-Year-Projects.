import React, { useState } from "react";
import { PageLayout } from "../../components/ui/PageLayout";
import api from "../../api/axios";
import { List, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorState from "@/components/ui/ErrorState";
import { toast } from "sonner";

const STAGES = [
  { id: "NEW_PROSPECT", label: "New Prospect", color: "border-blue-500 text-blue-500" },
  { id: "UNDER_REVIEW", label: "Under Review", color: "border-purple-500 text-purple-500" },
  { id: "SHORTLISTED", label: "Shortlisted", color: "border-indigo-500 text-indigo-500" },
  { id: "CONTACTED", label: "Contacted", color: "border-amber-500 text-amber-500" },
  { id: "TRIAL_INVITED", label: "Trial Invited", color: "border-orange-500 text-orange-500" },
  { id: "TRIAL_COMPLETED", label: "Trial Completed", color: "border-teal-500 text-teal-500" },
  { id: "SELECTED", label: "Selected", color: "border-green-500 text-green-500" },
  { id: "REJECTED", label: "Rejected", color: "border-red-500 text-red-500" }
];

export default function RecruitmentPipeline() {
  const [view, setView] = useState("kanban"); // kanban or table
  const queryClient = useQueryClient();

  const { data: prospects = [], isLoading: loading, error } = useQuery({
    queryKey: ["prospects"],
    queryFn: async () => {
      const res = await api.get("/recruitment/prospects");
      return res.data.data;
    }
  });

  const mutation = useMutation({
    mutationFn: async ({ prospectId, newStage }) => {
      await api.put(`/recruitment/prospects/${prospectId}/stage?stage=${newStage}`);
    },
    onSuccess: () => {
      toast.success("Stage updated successfully");
      queryClient.invalidateQueries(["prospects"]);
    },
    onError: () => {
      toast.error("Failed to update stage");
    }
  });

  const updateStage = (prospectId, newStage) => {
    mutation.mutate({ prospectId, newStage });
  };

  if (loading) {
    return (
      <PageLayout title="Pipeline">
        <LoadingSpinner />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Pipeline">
        <ErrorState message="Failed to load prospects" />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Recruitment Pipeline">
      <div className="p-6 md:p-10 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Active Talent Pipeline</h2>
              <span className="font-mono-telemetry text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {prospects.length} Total Prospects
              </span>
            </div>
            <p className="text-muted-foreground text-sm mt-1">Manage recruitment stages, scout reviews, trials, and selection status.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/dashboard/recruitment/discover" className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
              Discover Talent
            </Link>
            <div className="flex gap-1 rounded-xl bg-muted/60 p-1 border border-border/50">
              <button 
                onClick={() => setView("kanban")} 
                className={`rounded-lg p-2 transition-colors ${view === "kanban" ? "bg-card text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                title="Kanban Board"
              >
                <LayoutDashboard size={16} />
              </button>
              <button 
                onClick={() => setView("table")} 
                className={`rounded-lg p-2 transition-colors ${view === "table" ? "bg-card text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                title="Table View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {view === "kanban" ? (
          <div className="flex gap-5 overflow-x-auto pb-6 pt-2 custom-scrollbar">
            {STAGES.map(stage => {
              const stageProspects = prospects.filter(p => p.stage === stage.id);
              return (
                <div key={stage.id} className="min-w-[310px] w-[310px] shrink-0 card-telemetry-elevated flex flex-col max-h-[calc(100vh-280px)]">
                  <div className={`p-4 border-b border-border/50 flex items-center justify-between bg-muted/20 ${stage.color}`}>
                    <span className="font-bold text-xs uppercase tracking-wider label-caps">{stage.label}</span>
                    <span className="font-mono-telemetry font-bold text-xs px-2 py-0.5 rounded-md bg-background/80 border border-border/60">
                      {stageProspects.length}
                    </span>
                  </div>
                  
                  <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-3">
                    {stageProspects.length > 0 ? (
                      stageProspects.map(p => (
                        <div key={p.id} className="p-4 rounded-xl border border-border/50 bg-background/90 hover:border-primary/50 transition-all shadow-xs space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <Link to={`/dashboard/recruitment/prospects/${p.id}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-1">
                              {p.athlete.fullName || (p.athlete.firstName ? `${p.athlete.firstName} ${p.athlete.lastName}` : `Athlete #${p.athleteId}`)}
                            </Link>
                            <span className="font-mono-telemetry text-xs font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
                              {p.rating ? `${p.rating}/10` : 'N/A'}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">{p.athlete.sport?.name || 'General Sport'}</span>
                            <span className="text-[10px] font-mono">{p.athlete.athleteCode || ''}</span>
                          </div>

                          {/* Requirement-related details (Vitals & Medical) */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/30 p-2 rounded-lg">
                            {p.athlete.age && <span>{p.athlete.age} yrs</span>}
                            {p.athlete.gender && <span>• {p.athlete.gender}</span>}
                            {p.athlete.height && <span>• {p.athlete.height}cm</span>}
                            {p.athlete.weight && <span>• {p.athlete.weight}kg</span>}
                            {p.athlete.medicalStatus && (
                              <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                {p.athlete.medicalStatus}
                              </span>
                            )}
                          </div>
                          
                          <div className="pt-2 border-t border-border/40">
                            <select 
                              className="w-full rounded-lg bg-muted/60 px-2.5 py-1.5 text-xs text-foreground border border-border/60 font-medium focus:ring-1 focus:ring-primary focus:outline-none"
                              value={p.stage}
                              onChange={(e) => updateStage(p.id, e.target.value)}
                            >
                              {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-10 text-center text-muted-foreground text-xs border border-dashed border-border/50 rounded-xl">
                        No athletes in {stage.label.toLowerCase()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card-telemetry-elevated overflow-hidden">
            <table className="table-telemetry">
              <thead>
                <tr>
                  <th>Athlete</th>
                  <th>Sport</th>
                  <th>Requirements / Vitals</th>
                  <th>Rating</th>
                  <th>Current Stage</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prospects.map(p => (
                  <tr key={p.id}>
                    <td className="font-semibold text-foreground">
                      <div>
                        <p>{p.athlete.fullName || (p.athlete.firstName ? `${p.athlete.firstName} ${p.athlete.lastName}` : `Athlete #${p.athleteId}`)}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{p.athlete.athleteCode}</p>
                      </div>
                    </td>
                    <td className="text-muted-foreground">{p.athlete.sport?.name || 'N/A'}</td>
                    <td className="text-xs text-muted-foreground">
                      <span>{p.athlete.age ? `${p.athlete.age}y` : '—'} • {p.athlete.gender || ''}</span>
                      {(p.athlete.height || p.athlete.weight) && (
                        <span className="block text-[11px] text-muted-foreground/80">
                          {p.athlete.height ? `${p.athlete.height}cm` : ''} {p.athlete.weight ? `• ${p.athlete.weight}kg` : ''}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="font-bold font-mono-telemetry text-primary">{p.rating ? `${p.rating}/10` : '—'}</span>
                    </td>
                    <td>
                      <select 
                        className="rounded-lg bg-muted/60 px-2.5 py-1.5 text-xs text-foreground border border-border/60 font-medium"
                        value={p.stage}
                        onChange={(e) => updateStage(p.id, e.target.value)}
                      >
                        {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className="text-right">
                      <Link to={`/dashboard/recruitment/prospects/${p.id}`} className="text-xs font-semibold text-primary hover:underline">
                        View Dossier
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageLayout>
  );
}




