import React, { useState } from "react";
import { PageLayout } from "../../components/ui/PageLayout";
import api from "../../api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import { List, Plus, Users, User, X, Check, Target, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function ShortlistsManagement() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newShortlistName, setNewShortlistName] = useState("");
  const [selectedShortlist, setSelectedShortlist] = useState(null);
  const [showAddAthleteModal, setShowAddAthleteModal] = useState(false);
  const [selectedAthleteId, setSelectedAthleteId] = useState("");

  const { data: shortlists = [], isLoading: loading, error } = useQuery({
    queryKey: ["shortlists"],
    queryFn: async () => {
      const res = await api.get("/recruitment/shortlists");
      return res.data.data || [];
    }
  });

  const { data: availableAthletes = [] } = useQuery({
    queryKey: ["discoveryAthletesForShortlist"],
    queryFn: async () => {
      const res = await api.get("/recruitment/discover");
      return res.data.data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (name) => {
      await api.post("/recruitment/shortlists", { name });
    },
    onSuccess: () => {
      toast.success("Shortlist created successfully");
      setShowCreateModal(false);
      setNewShortlistName("");
      queryClient.invalidateQueries(["shortlists"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create shortlist");
    }
  });

  const addAthleteMutation = useMutation({
    mutationFn: async ({ shortlistId, athleteId }) => {
      await api.post(`/recruitment/shortlists/${shortlistId}/athletes?athleteId=${athleteId}`);
    },
    onSuccess: () => {
      toast.success("Athlete added to shortlist & recruitment pipeline");
      setShowAddAthleteModal(false);
      setSelectedAthleteId("");
      queryClient.invalidateQueries(["shortlists"]);
      queryClient.invalidateQueries(["prospects"]);
      queryClient.invalidateQueries(["recruitmentDashboard"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add athlete to shortlist");
    }
  });

  const removeAthleteMutation = useMutation({
    mutationFn: async ({ shortlistId, athleteId }) => {
      await api.delete(`/recruitment/shortlists/${shortlistId}/athletes/${athleteId}`);
    },
    onSuccess: () => {
      toast.success("Athlete removed from shortlist");
      queryClient.invalidateQueries(["shortlists"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to remove athlete from shortlist");
    }
  });

  const handleRemoveAthlete = (shortlistId, athleteId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to remove this athlete from this shortlist?")) {
      removeAthleteMutation.mutate({ shortlistId, athleteId });
    }
  };

  const handleAddAthlete = (e) => {
    e.preventDefault();
    if (!selectedAthleteId || !selectedShortlist) {
      toast.error("Please select an athlete");
      return;
    }
    addAthleteMutation.mutate({
      shortlistId: selectedShortlist.id,
      athleteId: parseInt(selectedAthleteId, 10)
    });
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newShortlistName.trim()) {
      toast.error("Please enter a shortlist name");
      return;
    }
    createMutation.mutate(newShortlistName.trim());
  };

  if (loading) {
    return (
      <PageLayout title="Shortlists Management">
        <LoadingSpinner />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Shortlists Management">
        <ErrorState message="Failed to load shortlists" />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Shortlists Management">
      <div className="p-6 md:p-10 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Targeted Talent Shortlists</h2>
              <span className="font-mono-telemetry text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {shortlists.length} Shortlists
              </span>
            </div>
            <p className="text-muted-foreground text-sm mt-1">Organize scout campaigns, prioritize targets, and group recruits by sport or graduating class.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/dashboard/recruitment/discover">
              <Button variant="outline" className="rounded-xl font-semibold gap-2 border-border/60">
                <Users className="h-4 w-4" /> Discover Talent
              </Button>
            </Link>
            <Button onClick={() => setShowCreateModal(true)} className="rounded-xl font-bold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
              <Plus className="h-4 w-4" /> Create Shortlist
            </Button>
          </div>
        </div>

        {/* Modal: Create Shortlist */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Create New Shortlist</h3>
                    <p className="text-xs text-muted-foreground">Group recruits for a targeted tryout or season</p>
                  </div>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="rounded-full p-1 text-muted-foreground hover:bg-muted">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shortlistName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Shortlist Name</Label>
                  <Input
                    id="shortlistName"
                    placeholder="e.g. 2026 Freshmen Basketball Prospects"
                    value={newShortlistName}
                    onChange={(e) => setNewShortlistName(e.target.value)}
                    className="rounded-xl h-11 text-sm"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="rounded-xl px-5">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} className="rounded-xl px-6 font-bold">
                    {createMutation.isPending ? "Creating..." : "Save Shortlist"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Add Athlete to Shortlist */}
        {showAddAthleteModal && selectedShortlist && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Add Athlete to Shortlist</h3>
                    <p className="text-xs text-muted-foreground">Adding to <strong className="text-primary">{selectedShortlist.name}</strong></p>
                  </div>
                </div>
                <button onClick={() => setShowAddAthleteModal(false)} className="rounded-full p-1 text-muted-foreground hover:bg-muted">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddAthlete} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="athleteSelect" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Select Talent / Prospect <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="athleteSelect"
                    value={selectedAthleteId}
                    onChange={(e) => setSelectedAthleteId(e.target.value)}
                    className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  >
                    <option value="">Choose an athlete from the scout pool...</option>
                    {availableAthletes.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.fullName || `${a.firstName} ${a.lastName}`} ({a.athleteCode || `ATH-${a.id}`}) • {a.sport?.name || 'General'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddAthleteModal(false)} className="rounded-xl px-5">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addAthleteMutation.isPending} className="rounded-xl px-6 font-bold">
                    {addAthleteMutation.isPending ? "Adding..." : "Add to Shortlist"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Shortlists Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {shortlists.length === 0 ? (
            <div className="col-span-full">
              <EmptyState 
                icon={List} 
                title="No Shortlists Created" 
                description="Create a shortlist to start grouping high-potential recruits from the talent pool." 
              />
            </div>
          ) : (
            shortlists.map(s => (
              <div key={s.id} className="card-telemetry-elevated rounded-3xl border border-border/60 p-6 flex flex-col justify-between space-y-5 bg-card">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground tracking-tight">{s.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Created {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "Recently"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono-telemetry text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                        {s.athletes?.length || 0} Athletes
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedShortlist(s);
                          setShowAddAthleteModal(true);
                        }}
                        className="rounded-xl h-8 px-3 text-xs font-semibold gap-1.5 border-border/60 hover:bg-primary/10 hover:text-primary"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Athlete
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/40 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Shortlisted Athletes</p>
                    {s.athletes?.map(a => (
                      <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40 hover:border-primary/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {a.fullName || (a.firstName ? `${a.firstName} ${a.lastName}` : "Prospect Athlete")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {a.sport?.name || a.sportName || "Athletics"} • {a.athleteCode || `ATH-${a.id}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold text-primary">Enrolled</span>
                          <button
                            onClick={(e) => handleRemoveAthlete(s.id, a.id, e)}
                            title="Remove from shortlist"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!s.athletes || s.athletes.length === 0) && (
                      <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-2xl">
                        No athletes added yet. Add athletes from Discover Talent or by setting their pipeline stage to Shortlisted.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageLayout>
  );
}




