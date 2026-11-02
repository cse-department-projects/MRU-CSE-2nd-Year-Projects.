import React, { useState } from "react";
import { PageLayout } from "../../components/ui/PageLayout";
import api from "../../api/axios";
import { referenceApi } from "../../api/referenceApi";
import { Search, Plus, Filter, Activity, MapPin, Trophy, ShieldCheck } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { toast } from "sonner";

export default function AthleteDiscovery() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    sportId: "",
    minAge: "",
    maxAge: "",
    minRating: ""
  });
  const navigate = useNavigate();

  const { data: sportsList = [] } = useQuery({
    queryKey: ["sports-discovery"],
    queryFn: async () => {
      const res = await referenceApi.getSports();
      return Array.isArray(res) ? res : (res?.data || []);
    }
  });

  const { data: athletes = [], isLoading: loading, error } = useQuery({
    queryKey: ["discoverAthletes", filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters.sportId) queryParams.append('sportId', filters.sportId);
      if (filters.minAge) queryParams.append('minAge', filters.minAge);
      if (filters.maxAge) queryParams.append('maxAge', filters.maxAge);
      if (filters.minRating) queryParams.append('minRating', filters.minRating);
      
      const res = await api.get(`/recruitment/discover?${queryParams.toString()}`);
      return res.data.data || [];
    }
  });

  const addToPipeline = async (athlete) => {
    try {
      const res = await api.post(`/recruitment/prospects?athleteId=${athlete.id}`);
      toast.success("Added to pipeline");
      navigate(`/dashboard/recruitment/prospects/${res.data.data.id}`);
    } catch (err) {
      console.error("Failed to add to pipeline", err);
      toast.error("Error adding to pipeline. May already exist.");
    }
  };

  const filtered = athletes.filter(a => {
    const name = a.fullName || (a.firstName ? `${a.firstName} ${a.lastName}` : "");
    return name.toLowerCase().includes(search.toLowerCase()) ||
           a.athleteCode?.toLowerCase().includes(search.toLowerCase());
  });

  if (error) {
    return (
      <PageLayout title="Scout Engine">
        <ErrorState message="Failed to load athletes" />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Scout Engine">
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Athlete Discovery</h1>
            <p className="text-muted-foreground mt-1">Search, filter, and recruit top verified talent from around the world.</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50 shadow-sm backdrop-blur-sm">
          <div className="relative md:col-span-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or code..." 
              className="w-full rounded-xl border border-border/50 bg-background py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-12"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="md:col-span-3">
            <select
              value={filters.sportId}
              onChange={(e) => setFilters({...filters, sportId: e.target.value})}
              className="w-full rounded-xl border border-border/50 bg-background px-4 text-foreground focus:border-primary focus:outline-none h-12 text-sm"
            >
              <option value="">All Sports</option>
              {sportsList.map(sport => (
                <option key={sport.id} value={sport.id}>{sport.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <input 
              type="number" 
              placeholder="Min Age" 
              className="w-full rounded-xl border border-border/50 bg-background py-3 px-4 text-foreground focus:border-primary focus:outline-none h-12 text-sm"
              value={filters.minAge}
              onChange={(e) => setFilters({...filters, minAge: e.target.value})}
            />
          </div>
          <div className="md:col-span-3">
            <input 
              type="number" 
              placeholder="Min Rating (0-100)" 
              className="w-full rounded-xl border border-border/50 bg-background py-3 px-4 text-foreground focus:border-primary focus:outline-none h-12 text-sm"
              value={filters.minRating}
              onChange={(e) => setFilters({...filters, minRating: e.target.value})}
            />
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState 
            icon={Filter} 
            title="No athletes found" 
            description="Try adjusting your search criteria" 
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(a => (
              <div key={a.id} className="card-telemetry-elevated group relative overflow-hidden flex flex-col justify-between">
                <div className="h-20 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border-b border-border/40"></div>
                
                <div className="px-6 pb-6 relative flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="relative -mt-10 mb-3">
                        <div className="h-20 w-20 rounded-2xl border-4 border-card bg-muted flex items-center justify-center overflow-hidden shadow-md">
                          {a.profilePhotoUrl ? (
                            <img src={a.profilePhotoUrl} alt="profile" className="object-cover w-full h-full" />
                          ) : (
                            <span className="text-xl font-bold text-primary">{a.firstName?.charAt(0)}{a.lastName?.charAt(0)}</span>
                          )}
                        </div>
                        {a.performanceRating > 80 && (
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-card shadow-sm" title="Highly Rated">
                            <ShieldCheck size={14} />
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3">
                        <Badge variant="outline" className="font-mono text-[11px] font-semibold bg-background px-2 py-0.5">{a.athleteCode}</Badge>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-foreground line-clamp-1">{a.fullName || `${a.firstName} ${a.lastName}`}</h3>
                    
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                      <MapPin size={13} className="text-primary/70" />
                      <span>{a.city || 'Location'}, {a.country || 'Global'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-5">
                      <div className="bg-muted/40 p-3 rounded-xl border border-border/50 text-center">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground/80 label-caps mb-1">Sport</p>
                        <p className="font-semibold text-xs truncate text-foreground">{a.sport?.name || 'General'}</p>
                      </div>
                      <div className="bg-muted/40 p-3 rounded-xl border border-border/50 text-center">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground/80 label-caps mb-1">Rating</p>
                        <p className="font-bold text-sm font-mono-telemetry text-primary flex items-center justify-center gap-1">
                          <Trophy size={13} />
                          {a.performanceRating || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2 pt-2 border-t border-border/40">
                    <Button 
                      variant="outline"
                      onClick={() => navigate(`/dashboard/athletes/${a.id}`)}
                      className="flex-1 h-10 rounded-xl text-xs font-semibold shadow-xs"
                    >
                      Profile
                    </Button>
                    <Button 
                      onClick={() => addToPipeline(a)}
                      className="flex-1 h-10 rounded-xl text-xs font-semibold shadow-sm gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Pipeline
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
