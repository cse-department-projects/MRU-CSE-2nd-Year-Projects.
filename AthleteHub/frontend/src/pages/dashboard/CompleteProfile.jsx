import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { currentUser, refreshUser } = useAuth();
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    date_of_birth: '',
    gender: '',
    phone: '',
    nationality: '',
    height_cm: '',
    weight_kg: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    sport_id: '',
  });

  useEffect(() => {
    // If auth state already indicates profile exists, redirect to dashboard
    if (currentUser?.has_profile) {
      navigate('/dashboard');
      return;
    }

    // Always re-verify profile status with backend to avoid stale cache trap
    api.get('/auth/me').then(res => {
      if (res.data?.data?.has_profile) {
        refreshUser();
        navigate('/dashboard');
      }
    }).catch(err => console.warn("Failed to check /auth/me", err));

    const fetchSports = async () => {
      try {
        const response = await api.get('/sports');
        setSports(response.data.data || []);
      } catch (err) {
        console.error("Failed to load sports", err);
      }
    };
    fetchSports();
  }, [currentUser, navigate, refreshUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const nameParts = (currentUser?.full_name || currentUser?.name || '').trim().split(/\s+/);
      const firstName = currentUser?.first_name || nameParts[0] || 'Athlete';
      const lastName = currentUser?.last_name || nameParts.slice(1).join(' ') || 'User';

      const payload = {
        firstName,
        lastName,
        dateOfBirth: formData.date_of_birth,
        gender: formData.gender,
        phone: formData.phone,
        nationality: formData.nationality,
        height: formData.height_cm ? parseFloat(formData.height_cm) : null,
        weight: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        emergencyContactName: formData.emergency_contact_name,
        emergencyContactNumber: formData.emergency_contact_phone,
        sportId: formData.sport_id ? parseInt(formData.sport_id, 10) : null,
      };

      await api.post('/athletes', payload);
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || '';
      if (errorMsg.toLowerCase().includes('already exists')) {
        await refreshUser();
        navigate('/dashboard');
        return;
      }
      setError(errorMsg || 'Failed to complete profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Complete Your Profile</h1>
        <p className="text-muted-foreground mt-2">
          Welcome! Before you can access the dashboard, we need a few details about you to set up your athlete profile.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      <Card className="shadow-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>Enter your basic information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth <span className="text-destructive">*</span></Label>
                <Input type="date" id="date_of_birth" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender <span className="text-destructive">*</span></Label>
                <select 
                  id="gender" 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleChange} 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input type="text" id="nationality" name="nationality" value={formData.nationality} onChange={handleChange} />
              </div>
            </div>

            <div className="border-t border-border pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Physical Attributes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="height_cm">Height (cm)</Label>
                  <Input type="number" step="0.1" id="height_cm" name="height_cm" value={formData.height_cm} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight_kg">Weight (kg)</Label>
                  <Input type="number" step="0.1" id="weight_kg" name="weight_kg" value={formData.weight_kg} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Sport & Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="sport_id">Primary Sport <span className="text-destructive">*</span></Label>
                  <select 
                    id="sport_id" 
                    name="sport_id" 
                    value={formData.sport_id} 
                    onChange={handleChange} 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">Select a Sport</option>
                    {sports.map(sport => (
                      <option key={sport.id} value={sport.id}>{sport.name} ({sport.category})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                  <Input type="text" id="emergency_contact_name" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                  <Input type="tel" id="emergency_contact_phone" name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange} />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-border pt-6">
            <Button type="submit" disabled={loading} size="lg" className="px-8">
              {loading ? 'Saving...' : 'Complete Profile & Continue'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
