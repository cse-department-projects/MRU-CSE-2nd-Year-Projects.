import { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Shield, Edit3, Camera, Save, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Profile state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [avatarUrl, setAvatarUrl] = useState('/src/assets/ai_avatar_3d.png');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [allergies, setAllergies] = useState('');
  const [address, setAddress] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, phone, date_of_birth, gender, blood_group, avatar_url, height_cm, weight_kg, allergies, address, last_name, email')
          .eq('id', user.id)
          .single();
          
        if (data) {
          if (data.full_name) {
            const parts = data.full_name.split(' ');
            setFirstName(parts[0] || '');
            setLastName(data.last_name || (parts.length > 1 ? parts.slice(1).join(' ') : ''));
          }
          if (data.phone) setPhone(data.phone);
          if (data.date_of_birth) setDateOfBirth(data.date_of_birth);
          if (data.gender) setGender(data.gender);
          if (data.blood_group) setBloodGroup(data.blood_group);
          if (data.allergies) {
            setAllergies(data.allergies);
          }
          if (data.address) setAddress(data.address);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    
    const fullName = `${firstName} ${lastName}`.trim();
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          last_name: lastName,
          email: user.email,
          phone: phone || null,
          date_of_birth: dateOfBirth ? dateOfBirth : null,
          gender,
          blood_group: bloodGroup,
          height_cm: height ? parseInt(height) : null,
          weight_kg: weight ? parseFloat(weight) : null,
          allergies: allergies.trim() ? allergies.trim() : null,
          address: address || null,
          avatar_url: avatarUrl
        }, { onConflict: 'id' });
        
      if (error) throw error;
      
      await refreshUser();
      setIsEditing(false);
    } catch (err: any) {
      console.error('Profile update error:', err);
      alert(`Failed to update profile: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const file = event.target.files?.[0];
      if (!file || !user) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload image
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(avatarUrl);
      await refreshUser();
    } catch (uploadError) {
      console.error('Image upload error:', uploadError);
      alert("Error uploading image!");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const email = user?.email || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'User';

  return (
    <div className="max-w-5xl mx-auto space-y-10 font-inter pb-12">
      <div>
        <h1 className="text-3xl sm:text-4xl font-poppins font-bold text-slate-900 tracking-tight">Identity Profile</h1>
        <p className="text-slate-500 mt-2 font-medium">Manage your personal information and health details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-gray-100 p-8 rounded-[32px] flex flex-col items-center text-center relative overflow-hidden shadow-sm">
             <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-slate-900 to-slate-800"></div>
             
             <div className="relative mt-8 w-36 h-36 rounded-full border-4 border-white shadow-xl bg-white overflow-hidden group">
                {isUploading ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                
                <div 
                  className="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-8 h-8 text-white mb-1" />
                  <span className="text-white text-xs font-bold uppercase tracking-wider">Upload</span>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/jpeg, image/png, image/webp" 
                  className="hidden" 
                />
             </div>
             
             <h2 className="mt-6 text-2xl font-poppins font-bold text-slate-900">{fullName}</h2>
             <span className="mt-1 px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold uppercase tracking-wider">Premium Member</span>
             
             <div className="w-full mt-8 pt-8 border-t border-gray-100 space-y-4">
               <div className="flex items-center text-sm text-slate-600 font-medium break-all">
                 <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mr-3 flex-shrink-0">
                   <Mail className="w-4 h-4 text-slate-400" />
                 </div>
                 {email}
               </div>
               <div className="flex items-center text-sm text-slate-600 font-medium">
                 <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mr-3 flex-shrink-0">
                   <Phone className="w-4 h-4 text-slate-400" />
                 </div>
                 {phone || 'Not set'}
               </div>
               <div className="flex items-center text-sm text-slate-600 font-medium">
                 <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mr-3 flex-shrink-0">
                   <MapPin className="w-4 h-4 text-slate-400" />
                 </div>
                 {address || 'Not set'}
               </div>
             </div>
          </div>
        </div>

        {/* Right Column: Forms & Details */}
        <div className="md:col-span-2 space-y-8">
          {/* Personal Information */}
          <div className="bg-white border border-gray-100 p-8 rounded-[32px] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[40px] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h3 className="font-poppins font-bold text-xl text-slate-900 flex items-center">
                <User className="w-5 h-5 mr-3 text-primary" /> Personal Details
              </h3>
              
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-sm font-bold text-slate-500 hover:text-primary hover:bg-slate-50 px-4 py-2 rounded-xl transition-colors flex items-center"
                >
                  <Edit3 className="w-4 h-4 mr-2" /> Edit
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="text-sm font-bold text-slate-500 hover:text-rose-500 hover:bg-rose-50 px-4 py-2 rounded-xl transition-colors flex items-center"
                  >
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="text-sm font-bold text-white bg-primary hover:bg-blue-600 px-5 py-2 rounded-xl transition-colors flex items-center disabled:opacity-70 shadow-md shadow-primary/20"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">First Name</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="w-full text-[15px] font-semibold text-slate-900 bg-white px-5 py-3.5 rounded-2xl border border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                  />
                ) : (
                  <div className="text-[15px] font-semibold text-slate-900 bg-slate-50/50 px-5 py-3.5 rounded-2xl border border-gray-100">{firstName || 'Not set'}</div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Last Name</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="w-full text-[15px] font-semibold text-slate-900 bg-white px-5 py-3.5 rounded-2xl border border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                  />
                ) : (
                  <div className="text-[15px] font-semibold text-slate-900 bg-slate-50/50 px-5 py-3.5 rounded-2xl border border-gray-100">{lastName || 'Not set'}</div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                {isEditing ? (
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full text-[15px] font-semibold text-slate-900 bg-white px-5 py-3.5 rounded-2xl border border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                  />
                ) : (
                  <div className="text-[15px] font-semibold text-slate-900 bg-slate-50/50 px-5 py-3.5 rounded-2xl border border-gray-100">{phone || 'Not set'}</div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Date of Birth</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={dateOfBirth} 
                    onChange={e => setDateOfBirth(e.target.value)}
                    placeholder="e.g. March 14, 1990"
                    className="w-full text-[15px] font-semibold text-slate-900 bg-white px-5 py-3.5 rounded-2xl border border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                  />
                ) : (
                  <div className="text-[15px] font-semibold text-slate-900 bg-slate-50/50 px-5 py-3.5 rounded-2xl border border-gray-100">{dateOfBirth || 'Not set'}</div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Gender</label>
                {isEditing ? (
                  <select 
                    value={gender} 
                    onChange={e => setGender(e.target.value)}
                    className="w-full text-[15px] font-semibold text-slate-900 bg-white px-5 py-3.5 rounded-2xl border border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                ) : (
                  <div className="text-[15px] font-semibold text-slate-900 bg-slate-50/50 px-5 py-3.5 rounded-2xl border border-gray-100">{gender || 'Not set'}</div>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Address</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={address} 
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Address, City"
                    className="w-full text-[15px] font-semibold text-slate-900 bg-white px-5 py-3.5 rounded-2xl border border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                  />
                ) : (
                   <div className="text-[15px] font-semibold text-slate-900 bg-slate-50/50 px-5 py-3.5 rounded-2xl border border-gray-100">{address || 'Not set'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Health Information */}
          <div className="bg-white border border-gray-100 p-8 rounded-[32px] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-[40px] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="flex justify-between items-center mb-8 relative z-10">
              <h3 className="font-poppins font-bold text-xl text-slate-900 flex items-center">
                <Shield className="w-5 h-5 mr-3 text-emerald-500" /> Medical Identity
              </h3>
              
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-sm font-bold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-xl transition-colors flex items-center"
                >
                  <Edit3 className="w-4 h-4 mr-2" /> Edit
                </button>
              ) : null}
            </div>
            
            <div className="grid grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Blood Group</label>
                <div className="flex items-center space-x-2 h-[46px]">
                  {isEditing ? (
                    <select 
                      value={bloodGroup} 
                      onChange={e => setBloodGroup(e.target.value)}
                      className="w-full text-[15px] font-bold text-rose-600 bg-rose-50 px-4 py-2.5 rounded-2xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all shadow-sm h-full"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  ) : (
                    <span className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2 rounded-xl font-bold text-sm inline-flex items-center justify-center h-full">{bloodGroup || 'Not set'}</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Biometrics</label>
                {isEditing ? (
                  <div className="flex space-x-2 h-[46px]">
                    <input 
                      type="text" 
                      value={height} 
                      onChange={e => setHeight(e.target.value)}
                      placeholder="Height (cm)"
                      className="w-1/2 text-[14px] font-semibold text-slate-900 bg-white px-3 py-2 rounded-2xl border border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm h-full"
                    />
                    <input 
                      type="text" 
                      value={weight} 
                      onChange={e => setWeight(e.target.value)}
                      placeholder="Weight (kg)"
                      className="w-1/2 text-[14px] font-semibold text-slate-900 bg-white px-3 py-2 rounded-2xl border border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm h-full"
                    />
                  </div>
                ) : (
                  <div className="h-[46px] flex items-center">
                    <p className="text-[15px] font-semibold text-slate-900">
                      {height ? `${height} cm` : '-- cm'} / {weight ? `${weight} kg` : '-- kg'}
                    </p>
                  </div>
                )}
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Allergies (Comma separated)</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={allergies} 
                    onChange={e => setAllergies(e.target.value)}
                    placeholder="e.g. Penicillin, Peanuts"
                    className="w-full text-[15px] font-semibold text-slate-900 bg-white px-5 py-3.5 rounded-2xl border border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2 mt-1 min-h-[36px]">
                    {allergies ? allergies.split(',').map((allergy, i) => (
                      <span key={i} className="bg-amber-50 border border-amber-100 text-amber-700 px-4 py-2 rounded-xl text-sm font-bold">
                        {allergy.trim()}
                      </span>
                    )) : <span className="text-sm font-medium text-slate-400">No allergies recorded</span>}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
