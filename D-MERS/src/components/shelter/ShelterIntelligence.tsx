import React, { useEffect, useState } from 'react';
import { Shelter, UserProfile } from '../../types';
import { DataProvider } from '../../lib/supabase';
import { Home, Users, Phone, MapPin, Droplets, Stethoscope, Utensils, Zap, Shield } from 'lucide-react';

interface ShelterIntelligenceProps {
  currentUser: UserProfile;
}

export const ShelterIntelligence: React.FC<ShelterIntelligenceProps> = ({ currentUser }) => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingShelter, setEditingShelter] = useState<string | null>(null);
  const [newOccupancy, setNewOccupancy] = useState<number>(0);

  const loadData = async () => {
    setLoading(true);
    const data = await DataProvider.getShelters();
    setShelters(data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleUpdateOccupancy = async (shelterId: string) => {
    await DataProvider.updateShelterOccupancy(shelterId, newOccupancy);
    setEditingShelter(null);
    loadData();
  };

  const isAdmin = currentUser.role === 'admin';
  const totalCapacity = shelters.reduce((sum, s) => sum + s.capacity, 0);
  const totalOccupied = shelters.reduce((sum, s) => sum + s.current_occupancy, 0);
  const availableCount = shelters.filter(s => s.status === 'available').length;

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('water')) return <Droplets className="w-3.5 h-3.5" />;
    if (lower.includes('medical') || lower.includes('doctor')) return <Stethoscope className="w-3.5 h-3.5" />;
    if (lower.includes('meal') || lower.includes('food') || lower.includes('ration')) return <Utensils className="w-3.5 h-3.5" />;
    if (lower.includes('power') || lower.includes('generator')) return <Zap className="w-3.5 h-3.5" />;
    return <Shield className="w-3.5 h-3.5" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/15 rounded-2xl border border-white/25">
              <Home className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold">Shelter Capacity Intelligence</h2>
              <p className="text-purple-200 text-sm">Real-time Occupancy Monitoring & Amenity Tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-black">{availableCount}</div>
              <div className="text-xs text-purple-200">Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black">{totalCapacity - totalOccupied}</div>
              <div className="text-xs text-purple-200">Free Beds</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black">{totalOccupied}</div>
              <div className="text-xs text-purple-200">Occupied</div>
            </div>
          </div>
        </div>

        {/* System-wide occupancy bar */}
        <div className="mt-5 pt-4 border-t border-purple-600/50">
          <div className="flex justify-between text-xs text-purple-200 mb-1.5">
            <span>System-wide Shelter Occupancy</span>
            <span className="font-bold">{totalOccupied} / {totalCapacity} ({Math.round(totalOccupied / totalCapacity * 100)}%)</span>
          </div>
          <div className="w-full h-3 bg-purple-900/50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-purple-300 transition-all duration-700"
              style={{ width: `${totalCapacity > 0 ? Math.min(totalOccupied / totalCapacity * 100, 100) : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Shelter Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading shelter data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {shelters.map(sh => {
            const ratio = sh.current_occupancy / sh.capacity;
            const pct = Math.round(ratio * 100);

            return (
              <div key={sh.id} className="bg-white rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover transition overflow-hidden">
                {/* Status Top Bar */}
                <div className={`h-2 ${sh.status === 'available' ? 'bg-emerald-500' : sh.status === 'high_occupancy' ? 'bg-amber-500' : 'bg-red-500'}`} />

                <div className="p-5 space-y-4">
                  {/* Name & Status */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{sh.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-purple-500" /> {sh.location}
                      </div>
                    </div>
                    <span className={`shrink-0 text-[10px] font-extrabold px-2.5 py-1 rounded-xl border ${
                      sh.status === 'available' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      sh.status === 'high_occupancy' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                      'bg-red-100 text-red-800 border-red-300'
                    }`}>
                      {sh.status === 'available' ? '✓ OPEN' : sh.status === 'high_occupancy' ? '⚠ HIGH OCC.' : '✗ FULL'}
                    </span>
                  </div>

                  {/* Occupancy Visual */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <Users className="w-3.5 h-3.5 text-purple-600" /> Occupancy
                      </div>
                      <span className="font-extrabold text-slate-900">{sh.current_occupancy} / {sh.capacity}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${ratio >= 1 ? 'bg-red-500' : ratio >= 0.85 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <div className="text-right text-[11px] text-slate-400 mt-0.5">{pct}% occupied • {sh.capacity - sh.current_occupancy} beds available</div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Available Facilities</div>
                    <div className="flex flex-wrap gap-1.5">
                      {sh.amenities.map((a, i) => (
                        <span key={i} className="flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-1 rounded-lg">
                          {getAmenityIcon(a)} {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="text-xs text-slate-600 flex items-center gap-1.5 pt-2 border-t border-slate-100">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sh.contact_person}: <strong>{sh.contact_phone}</strong></span>
                  </div>

                  {/* Admin Occupancy Update */}
                  {isAdmin && (
                    editingShelter === sh.id ? (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="text-[11px] font-bold text-slate-700">Update Current Occupancy</div>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min={0}
                            max={sh.capacity}
                            value={newOccupancy}
                            onChange={e => setNewOccupancy(Number(e.target.value))}
                            className="flex-1 px-3 py-2 text-xs rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <button
                            onClick={() => handleUpdateOccupancy(sh.id)}
                            className="px-3 py-2 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingShelter(null)}
                            className="px-3 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingShelter(sh.id); setNewOccupancy(sh.current_occupancy); }}
                        className="w-full py-2 rounded-2xl border border-purple-300 text-purple-700 font-bold text-xs hover:bg-purple-50 transition"
                      >
                        Update Occupancy Count
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
