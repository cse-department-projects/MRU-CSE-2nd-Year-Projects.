export type UserRole = 'citizen' | 'rescue_team' | 'volunteer' | 'admin';

export type DisasterType = 
  | 'flood' 
  | 'earthquake' 
  | 'fire' 
  | 'cyclone' 
  | 'landslide' 
  | 'building_collapse' 
  | 'other';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus = 
  | 'reported' 
  | 'triaged' 
  | 'dispatched' 
  | 'on_scene' 
  | 'rescued' 
  | 'closed';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  avatar_url?: string;
  location?: string;
  created_at: string;
  // Role specific extra attributes
  agency_name?: string; // for rescue team
  skills?: string[];    // for volunteers
  is_available?: boolean;
}

export interface IncidentReport {
  id: string;
  report_number: string;
  citizen_id: string;
  citizen_name: string;
  citizen_phone: string;
  disaster_type: DisasterType;
  title: string;
  location_name: string;
  latitude: number;
  longitude: number;
  description: string;
  severity: SeverityLevel;
  people_affected: number;
  people_needing_help: number;
  has_elderly_children: boolean;
  has_medical_emergency: boolean;
  is_trapped: boolean;
  image_url?: string;
  status: IncidentStatus;
  priority_score: number;
  assigned_rescue_team_id?: string;
  assigned_rescue_team_name?: string;
  created_at: string;
  updated_at: string;
}

export interface TimelineEvent {
  id: string;
  incident_id: string;
  status: IncidentStatus;
  note: string;
  updated_by_name: string;
  updated_by_role: UserRole;
  created_at: string;
}

export interface Shelter {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  capacity: number;
  current_occupancy: number;
  contact_person: string;
  contact_phone: string;
  amenities: string[];
  status: 'available' | 'high_occupancy' | 'full';
  distance_km?: number;
  created_at: string;
}

export interface VolunteerTask {
  id: string;
  title: string;
  description: string;
  disaster_type: DisasterType;
  location: string;
  required_skills: string[];
  status: 'open' | 'assigned' | 'completed';
  assigned_volunteer_id?: string;
  assigned_volunteer_name?: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface RecoveryResource {
  id: string;
  type: 'request' | 'offer';
  category: 'food' | 'water' | 'medical' | 'shelter' | 'clothing' | 'tools' | 'other';
  title: string;
  description: string;
  quantity: string;
  location: string;
  contact_name: string;
  contact_phone: string;
  status: 'open' | 'fulfilled';
  user_id: string;
  created_at: string;
}

export interface EmergencyAlert {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'danger';
  affected_area: string;
  created_at: string;
  is_active: boolean;
}

export interface MissingPerson {
  id: string;
  full_name: string;
  age: number;
  gender: string;
  last_seen_location: string;
  last_seen_date: string;
  description: string;
  reporter_name: string;
  reporter_phone: string;
  status: 'missing' | 'found';
  photo_url?: string;
  created_at: string;
}
