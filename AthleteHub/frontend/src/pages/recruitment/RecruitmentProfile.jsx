import React, { useState } from "react";
import { PageLayout } from "../../components/ui/PageLayout";
import api from "../../api/axios";
import { useParams, Link } from "react-router-dom";
import { User, Calendar, MapPin, Activity, List as ListIcon, Plus, Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorState from "@/components/ui/ErrorState";
import { toast } from "sonner";

export default function RecruitmentProfile() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState("");

  const { data, isLoading: loading, error } = useQuery({
    queryKey: ["prospect", id],
    queryFn: async () => {
      // In a real app we might need a dedicated GET /prospects/{id} endpoint
      // For now we get all and filter
      const res = await api.get(`/recruitment/prospects`);
      const p = res.data.data.find(x => x.id === parseInt(id));

      if (!p) return null;

      const timeRes = await api.get(`/recruitment/prospects/${id}/timeline`);
      const notesRes = await api.get(`/recruitment/prospects/${id}/notes`);

      return {
        prospect: p,
        timeline: timeRes.data.data,
        notes: notesRes.data.data
      };
    }
  });

  const mutation = useMutation({
    mutationFn: async (noteText) => {
      await api.post(`/recruitment/prospects/${id}/notes`, { noteText, rating: 5 });
    },
    onSuccess: () => {
      setNewNote("");
      toast.success("Note added successfully");
      queryClient.invalidateQueries(["prospect", id]);
    },
    onError: () => {
      toast.error("Failed to add note");
    }
  });

  const addNote = () => {
    if (!newNote) return;
    mutation.mutate(newNote);
  };

  if (loading) {
    return (
      <PageLayout title="Profile">
        <LoadingSpinner />
      </PageLayout>
    );
  }

  if (error || !data?.prospect) {
    return (
      <PageLayout title="Profile">
        <ErrorState message="Prospect not found or failed to load" />
      </PageLayout>
    );
  }

  const { prospect, timeline, notes } = data;

  return (
    <PageLayout title="Recruitment Profile">
      <div className="p-6">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-6">
            <img src={prospect.athlete.profilePhotoUrl || "https://ui-avatars.com/api/?name="+(prospect.athlete.fullName ? prospect.athlete.fullName.replace(' ', '+') : (prospect.athlete.firstName+"+"+prospect.athlete.lastName))} alt="Profile" className="h-24 w-24 rounded-full border-4 border-muted object-cover shadow-lg" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">{prospect.athlete.fullName || (prospect.athlete.firstName ? `${prospect.athlete.firstName} ${prospect.athlete.lastName}` : "Unknown Athlete")}</h1>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Activity size={16} /> {prospect.athlete.sport?.name}</span>
                <span className="flex items-center gap-1"><MapPin size={16} /> {prospect.athlete.city}, {prospect.athlete.country}</span>
                <span className="flex items-center gap-1"><User size={16} /> Code: {prospect.athlete.athleteCode}</span>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  {prospect.stage.replace("_", " ")}
                </span>
                <span className="text-sm font-medium text-foreground">Rating: {prospect.rating}/10</span>
              </div>
            </div>
          </div>
          <Link to={`/dashboard/athletes/${prospect.athlete.id}`} className="rounded-xl border border-border bg-muted px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/80">
            View Core Profile
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="glass-panel rounded-2xl border border-border bg-muted/50 p-6">
              <h3 className="mb-4 text-lg font-bold text-foreground">Recruiter Notes</h3>
              <div className="mb-4 flex gap-2">
                <input 
                  type="text" 
                  value={newNote} 
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Add a private note..." 
                  className="flex-1 rounded-xl border border-border bg-muted px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                />
                <button onClick={addNote} disabled={mutation.isPending} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  <Save size={18} /> Save
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {notes.map(note => (
                  <div key={note.id} className="rounded-xl border border-border bg-muted/30 p-4">
                    <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                      <span>{note.recruiterName}</span>
                      <span>{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-foreground">{note.noteText}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="glass-panel rounded-2xl border border-border bg-muted/50 p-6">
            <h3 className="mb-4 text-lg font-bold text-foreground">Activity Timeline</h3>
            <div className="relative border-l border-border pl-6">
              {timeline.map((event) => (
                <div key={event.id} className="mb-6 last:mb-0">
                  <div className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                  <div className="text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleString()}</div>
                  <div className="mt-1 font-semibold text-foreground">{event.actionType.replace("_", " ")}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{event.details}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}




