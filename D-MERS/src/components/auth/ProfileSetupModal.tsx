import React, { useState } from 'react';
import { User, Phone, MapPin, ShieldCheck, Heart, Users, Check } from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { DataProvider } from '../../lib/supabase';

interface ProfileSetupModalProps {
  isOpen: boolean;
  user: UserProfile;
  onClose: () => void;
  onSave: (updated: UserProfile) => void;
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
  isOpen,
  user,
  onClose,
  onSave,
}) => {
  const [fullName, setFullName] = useState(user.full_name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [location, setLocation] = useState(user.location || '');
  const [role, setRole] = useState<UserRole>(user.role || 'citizen');
  const [agencyName, setAgencyName] = useState(user.agency_name || '');
  const [skills, setSkills] = useState<string[]>(user.skills || ['First Aid']);
  const [skillInput, setSkillInput] = useState('');
  const [isAvailable, setIsAvailable] = useState(user.is_available ?? true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updated = await DataProvider.updateUserProfile(user.id, {
        full_name: fullName,
        phone,
        location,
        role,
        agency_name: role === 'rescue_team' ? agencyName : undefined,
        skills: role === 'volunteer' ? skills : undefined,
        is_available: role === 'volunteer' ? isAvailable : undefined,
      });

      setLoading(false);
      onSave(updated);
      onClose();
    } catch (e) {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-brand-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-white font-bold"
          >
            ✕
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold">Complete Your D-MERS Profile</h3>
              <p className="text-xs text-blue-200">First-Time Setup & Role Assignment</p>
            </div>
          </div>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Phone Number (Emergency)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Primary Zone / Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Banjara Hills, Hyd"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Role Selection Cards */}
          <div>
            <label className="block text-slate-700 font-semibold mb-2">Select Your Role</label>
            <div className="grid grid-cols-3 gap-3">
              <div
                onClick={() => setRole('citizen')}
                className={`p-3 rounded-2xl border-2 cursor-pointer text-center transition ${
                  role === 'citizen' ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <User className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <div className="font-bold text-slate-900">Citizen</div>
                <div className="text-[10px] text-slate-500">Report & Seek Help</div>
              </div>

              <div
                onClick={() => setRole('volunteer')}
                className={`p-3 rounded-2xl border-2 cursor-pointer text-center transition ${
                  role === 'volunteer' ? 'border-emerald-600 bg-emerald-50/50 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Heart className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                <div className="font-bold text-slate-900">Volunteer</div>
                <div className="text-[10px] text-slate-500">Provide Assistance</div>
              </div>

              <div
                onClick={() => setRole('rescue_team')}
                className={`p-3 rounded-2xl border-2 cursor-pointer text-center transition ${
                  role === 'rescue_team' ? 'border-red-600 bg-red-50/50 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Users className="w-5 h-5 mx-auto mb-1 text-red-600" />
                <div className="font-bold text-slate-900">Rescue Team</div>
                <div className="text-[10px] text-slate-500">Official Responder</div>
              </div>
            </div>
          </div>

          {/* Role Specific Extra Details */}
          {role === 'rescue_team' && (
            <div className="p-3 bg-red-50/50 rounded-2xl border border-red-100">
              <label className="block text-red-900 font-semibold mb-1">Rescue Agency / Unit Name</label>
              <input
                type="text"
                placeholder="e.g. NDRF Battalion 04 / Fire Station 12"
                value={agencyName}
                onChange={e => setAgencyName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-red-200 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          )}

          {role === 'volunteer' && (
            <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-emerald-900 font-semibold">Volunteer Skills</label>
                <label className="flex items-center gap-1.5 cursor-pointer text-emerald-800 font-medium">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={e => setIsAvailable(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Active & Ready for Dispatch</span>
                </label>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add skill (e.g. Medical, Driving, Search & Rescue)"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }}}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.map((sk, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                    {sk}
                    <button type="button" onClick={() => handleRemoveSkill(sk)} className="hover:text-red-600 font-bold">×</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-brand-900 text-white font-bold hover:bg-brand-800 transition shadow-md shadow-brand-900/20 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
