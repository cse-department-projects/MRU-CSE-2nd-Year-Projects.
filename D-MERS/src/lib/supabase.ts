import { createClient } from '@supabase/supabase-js';
import { 
  UserProfile, 
  IncidentReport, 
  TimelineEvent, 
  Shelter, 
  VolunteerTask, 
  RecoveryResource, 
  EmergencyAlert, 
  MissingPerson,
  UserRole,
  DisasterType,
  SeverityLevel,
  IncidentStatus
} from '../types';
import { calculatePriorityScore } from '../utils/priorityEngine';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_anon_key';

// Warn in console (never print actual key values) if credentials look corrupted
if (typeof supabaseAnonKey === 'string' && supabaseAnonKey !== 'placeholder_anon_key') {
  const publishableParts = supabaseAnonKey.split('sb_publishable_').filter(Boolean);
  if (publishableParts.length > 1) {
    console.error(
      '[D-MERS] CONFIGURATION ERROR: VITE_SUPABASE_ANON_KEY appears to contain multiple ' +
      'concatenated keys. Open your Supabase project → Settings → API, copy the single ' +
      '"anon public" key, and replace the value in your .env file.'
    );
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Explicit implicit flow: Google OAuth returns #access_token= in the URL hash.
    // The Supabase JS client must parse that hash and call setSession with those tokens.
    flowType: 'implicit',
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'dmers-auth-token',
  },
});

// isMockMode: true only when real credentials are NOT configured
const isMockMode =
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('your-supabase') ||
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder.supabase.co') ||
  !import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY === 'placeholder_anon_key';

// ----------------------------------------------------
// INITIAL SEED DATA FOR IMMEDIATE DEMO FUNCTIONALITY
// ----------------------------------------------------
const SEED_PROFILES: UserProfile[] = [
  {
    id: 'user-admin-1',
    email: 'admin@dmers.gov.in',
    full_name: 'Dr. Rajesh Verma',
    phone: '+91 98765 43210',
    role: 'admin',
    location: 'Central Control Room, Hyderabad',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'user-rescue-1',
    email: 'rescue1@ndrf.gov.in',
    full_name: 'Commandant Vikram Singh',
    agency_name: 'NDRF Battalion 04',
    phone: '+91 98111 22233',
    role: 'rescue_team',
    location: 'District 3 Operational Zone',
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'user-volunteer-1',
    email: 'priya.vol@dmers.org',
    full_name: 'Priya Sharma',
    phone: '+91 99887 76655',
    role: 'volunteer',
    skills: ['First Aid', 'Search & Rescue', 'Logistics', 'Driving'],
    is_available: true,
    location: 'Secunderabad Sector 4',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'user-citizen-1',
    email: 'citizen.rahul@gmail.com',
    full_name: 'Rahul Kumar',
    phone: '+91 91234 56789',
    role: 'citizen',
    location: 'LB Nagar Main Road',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];

const SEED_INCIDENTS: IncidentReport[] = [
  {
    id: 'inc-101',
    report_number: 'DM-2026-0891',
    citizen_id: 'user-citizen-1',
    citizen_name: 'Rahul Kumar',
    citizen_phone: '+91 91234 56789',
    disaster_type: 'flood',
    title: 'Severe Urban Inundation near Metro Station',
    location_name: 'Sector 5 Low-lying Colony, LB Nagar',
    latitude: 17.368,
    longitude: 78.552,
    description: 'Water levels rising rapidly (approx 4 feet). 8 family members stranded on rooftop with no electricity.',
    severity: 'critical',
    people_affected: 12,
    people_needing_help: 8,
    has_elderly_children: true,
    has_medical_emergency: true,
    is_trapped: true,
    status: 'dispatched',
    priority_score: 94,
    assigned_rescue_team_id: 'user-rescue-1',
    assigned_rescue_team_name: 'NDRF Battalion 04',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'inc-102',
    report_number: 'DM-2026-0892',
    citizen_id: 'user-citizen-1',
    citizen_name: 'Sunita Rao',
    citizen_phone: '+91 98444 11223',
    disaster_type: 'fire',
    title: 'Commercial Building Electrical Fire',
    location_name: 'Complex Plaza, Madhapur',
    latitude: 17.448,
    longitude: 78.391,
    description: 'Smoke filling 3rd floor office. Fire response en route, medical assistance needed for smoke inhalation.',
    severity: 'high',
    people_affected: 25,
    people_needing_help: 5,
    has_elderly_children: false,
    has_medical_emergency: true,
    is_trapped: false,
    status: 'on_scene',
    priority_score: 82,
    assigned_rescue_team_id: 'user-rescue-1',
    assigned_rescue_team_name: 'NDRF Battalion 04',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 'inc-103',
    report_number: 'DM-2026-0893',
    citizen_id: 'user-citizen-1',
    citizen_name: 'Amit Patel',
    citizen_phone: '+91 97777 55443',
    disaster_type: 'building_collapse',
    title: 'Old Structure Wall Collapse',
    location_name: 'Old City Lane 4, Charminar',
    latitude: 17.361,
    longitude: 78.474,
    description: 'Heavy rainfall collapsed outer structural boundary wall blocking evacuation pathway.',
    severity: 'medium',
    people_affected: 6,
    people_needing_help: 2,
    has_elderly_children: true,
    has_medical_emergency: false,
    is_trapped: false,
    status: 'reported',
    priority_score: 52,
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  }
];

const SEED_TIMELINE: TimelineEvent[] = [
  {
    id: 'tl-1',
    incident_id: 'inc-101',
    status: 'reported',
    note: 'Emergency report logged via D-MERS Portal. Priority score initialized to 94.',
    updated_by_name: 'Rahul Kumar',
    updated_by_role: 'citizen',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'tl-2',
    incident_id: 'inc-101',
    status: 'triaged',
    note: 'Command Center reviewed incident. High priority dispatch flagged for water rescue boat unit.',
    updated_by_name: 'Dr. Rajesh Verma',
    updated_by_role: 'admin',
    created_at: new Date(Date.now() - 3600000 * 2.5).toISOString(),
  },
  {
    id: 'tl-3',
    incident_id: 'inc-101',
    status: 'dispatched',
    note: 'NDRF Battalion 04 unit dispatched with inflatable rescue raft and medical squad.',
    updated_by_name: 'Commandant Vikram Singh',
    updated_by_role: 'rescue_team',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  }
];

const SEED_SHELTERS: Shelter[] = [
  {
    id: 'sh-1',
    name: 'Government Model High School Relief Center',
    location: 'Road No. 12, Banjara Hills',
    latitude: 17.415,
    longitude: 78.438,
    capacity: 350,
    current_occupancy: 210,
    contact_person: 'Ramesh Reddy (MRO)',
    contact_phone: '+91 94400 12345',
    amenities: ['Clean Water', 'Medical Doctor', 'Hot Meals', 'Blankets', 'Power Backup', 'Sanitation'],
    status: 'available',
    distance_km: 2.4,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sh-2',
    name: 'Community Indoor Sports Complex Shelter',
    location: 'Near Metro Station, LB Nagar',
    latitude: 17.365,
    longitude: 78.548,
    capacity: 500,
    current_occupancy: 465,
    contact_person: 'Sita Laxmi',
    contact_phone: '+91 94400 67890',
    amenities: ['Emergency Kits', 'Infant Care', 'CCTV Security', 'Dry Rations', 'First Aid'],
    status: 'high_occupancy',
    distance_km: 1.1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sh-3',
    name: 'St. Marks Exhibition Hall Relief Hub',
    location: 'Abids Road, Nampally',
    latitude: 17.388,
    longitude: 78.472,
    capacity: 200,
    current_occupancy: 200,
    contact_person: 'K. V. Rao',
    contact_phone: '+91 94400 99887',
    amenities: ['Medical Triage', 'Water Purifier', 'Generator'],
    status: 'full',
    distance_km: 4.8,
    created_at: new Date().toISOString(),
  }
];

const SEED_TASKS: VolunteerTask[] = [
  {
    id: 'vt-1',
    title: 'Relief Pack Distribution & Sorting',
    description: 'Assist in packing food rations, water bottles, and hygiene kits at Central Warehouse.',
    disaster_type: 'flood',
    location: 'Central Relief Warehouse, Begumpet',
    required_skills: ['Logistics', 'First Aid'],
    status: 'open',
    priority: 'high',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'vt-2',
    title: 'Shelter Desk Registration Assistant',
    description: 'Help check in displaced citizens, maintain emergency roster, and coordinate blanket allocation.',
    disaster_type: 'flood',
    location: 'Govt High School Shelter, Banjara Hills',
    required_skills: ['Communication', 'Logistics'],
    status: 'open',
    priority: 'medium',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'vt-3',
    title: 'First Aid Support Squad',
    description: 'Assist paramedical team in dressing minor injuries and taking vital signs at relief station.',
    disaster_type: 'fire',
    location: 'Madhapur Emergency Station',
    required_skills: ['First Aid', 'Medical'],
    status: 'assigned',
    assigned_volunteer_id: 'user-volunteer-1',
    assigned_volunteer_name: 'Priya Sharma',
    priority: 'high',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  }
];

const SEED_RECOVERY: RecoveryResource[] = [
  {
    id: 'rec-1',
    type: 'request',
    category: 'water',
    title: 'Urgent Drinking Water Bottled Packs Required',
    description: 'Need 100 crates of drinking water bottles for displaced flood victims at Sector 5 camp.',
    quantity: '100 Crates',
    location: 'LB Nagar Relief Camp',
    contact_name: 'Anil Deshmukh',
    contact_phone: '+91 98222 33344',
    status: 'open',
    user_id: 'user-citizen-1',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'rec-2',
    type: 'offer',
    category: 'clothing',
    title: 'Donating 50 Heavy Woolen Blankets & Tarpaulins',
    description: 'Fresh clean blankets and plastic tarpaulins available for pickup or delivery.',
    quantity: '50 Sets',
    location: 'Secunderabad Club Hub',
    contact_name: 'Rotary Club South',
    contact_phone: '+91 98555 11122',
    status: 'open',
    user_id: 'user-volunteer-1',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  }
];

const SEED_ALERTS: EmergencyAlert[] = [
  {
    id: 'alt-1',
    title: 'HEAVY RAINFALL RED ALERT',
    message: 'IMD issues Red Warning for Hyderabad Metro Region. Move to high ground immediately if in low-lying zones.',
    severity: 'danger',
    affected_area: 'LB Nagar, Dilsukhnagar, Uppal, Malakpet',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    is_active: true,
  },
  {
    id: 'alt-2',
    title: 'Emergency Relief Camps Operational',
    message: 'Free hot meals and safe drinking water available at Govt Model High School Shelter.',
    severity: 'info',
    affected_area: 'Banjara Hills & Jubilee Hills Zone',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    is_active: true,
  }
];

const SEED_MISSING: MissingPerson[] = [
  {
    id: 'mp-1',
    full_name: 'Venkatesh Rao',
    age: 68,
    gender: 'Male',
    last_seen_location: 'Near Old Bus Stand, LB Nagar',
    last_seen_date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    description: 'Wearing blue shirt and grey trousers. Suffers from slight memory disorientation.',
    reporter_name: 'Rahul Kumar (Son)',
    reporter_phone: '+91 91234 56789',
    status: 'missing',
    created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
  }
];

// Helper for localStorage engine
function getStorage<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(`dmers_${key}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Local storage read error', e);
  }
  return defaultVal;
}

function setStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(`dmers_${key}`, JSON.stringify(val));
  } catch (e) {
    console.error('Local storage write error', e);
  }
}

// Data Store initialization
let localProfiles = getStorage<UserProfile[]>('profiles', SEED_PROFILES);
let localIncidents = getStorage<IncidentReport[]>('incidents', SEED_INCIDENTS);
let localTimeline = getStorage<TimelineEvent[]>('timeline', SEED_TIMELINE);
let localShelters = getStorage<Shelter[]>('shelters', SEED_SHELTERS);
let localTasks = getStorage<VolunteerTask[]>('tasks', SEED_TASKS);
let localRecovery = getStorage<RecoveryResource[]>('recovery', SEED_RECOVERY);
let localAlerts = getStorage<EmergencyAlert[]>('alerts', SEED_ALERTS);
let localMissing = getStorage<MissingPerson[]>('missing', SEED_MISSING);

let currentUser: UserProfile | null = getStorage<UserProfile | null>('currentUser', null); // Default to null for real auth flow

// ----------------------------------------------------
// DB / AUTH API DATA PROVIDER METHODS
// ----------------------------------------------------

export const DataProvider = {
  // Auth & Profile
  getCurrentUser(): UserProfile | null {
    return currentUser;
  },

  setCurrentUser(user: UserProfile | null) {
    currentUser = user;
    setStorage('currentUser', user);
  },

  async login(email: string, role?: UserRole): Promise<UserProfile> {
    let found = localProfiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      found = {
        id: `user-${Date.now()}`,
        email,
        full_name: email.split('@')[0].toUpperCase(),
        phone: '+91 98000 00000',
        role: role || 'citizen',
        created_at: new Date().toISOString(),
      };
      localProfiles.push(found);
      setStorage('profiles', localProfiles);
    }
    currentUser = found;
    setStorage('currentUser', currentUser);
    return found;
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!isMockMode) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
          .select()
          .maybeSingle();

        if (data && !error) {
          currentUser = { ...(currentUser || {}), ...data } as UserProfile;
          setStorage('currentUser', currentUser);
          return currentUser;
        }
      } catch (err) {
      }
    }

    const idx = localProfiles.findIndex(p => p.id === userId);
    if (idx !== -1) {
      localProfiles[idx] = { ...localProfiles[idx], ...updates };
      setStorage('profiles', localProfiles);
      if (currentUser && currentUser.id === userId) {
        currentUser = localProfiles[idx];
        setStorage('currentUser', currentUser);
      }
      return localProfiles[idx];
    }
    if (currentUser && currentUser.id === userId) {
      currentUser = { ...currentUser, ...updates };
      setStorage('currentUser', currentUser);
      return currentUser;
    }
    throw new Error('User profile not found');
  },

  async logout() {
    currentUser = null;
    localStorage.removeItem('dmers_currentUser');
    try {
      sessionStorage.removeItem('dmers_activeTab');
    } catch (_) {}
    if (!isMockMode) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
      }
    }
  },

  // ── Real Google OAuth (only when Supabase is configured) ──────────────────
  async signInWithGoogle(): Promise<void> {
    if (isMockMode) {
      throw new Error('Google Sign-In requires a configured Supabase backend. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    }

    // Determine if running inside the Electron desktop application
    const isDesktopApp = typeof window !== 'undefined' && (
      (window as any).electronAPI?.isElectron ||
      window.location.protocol === 'file:' ||
      navigator.userAgent.includes('Electron')
    );

    // Desktop app redirects to registered OS protocol dmers://auth/callback
    // Web app redirects to current browser origin (e.g. http://localhost:3000/)
    const redirectTo = isDesktopApp
      ? 'dmers://auth/callback'
      : `${window.location.origin}${window.location.pathname}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    if (error) throw error;
  },

  // ── Resolves Supabase Auth user with the public.profiles database table ───
  async resolveUserProfile(supaUser: any): Promise<UserProfile> {
    const email = supaUser.email || '';
    const fullName =
      supaUser.user_metadata?.full_name ||
      supaUser.user_metadata?.name ||
      (email ? email.split('@')[0] : 'Citizen User');
    const avatarUrl = supaUser.user_metadata?.avatar_url || '';

    if (isMockMode) {
      let found = localProfiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (!found) {
        found = {
          id: supaUser.id || `user-${Date.now()}`,
          email,
          full_name: fullName,
          phone: '',
          role: 'citizen',
          avatar_url: avatarUrl,
          created_at: new Date().toISOString(),
        };
        localProfiles.push(found);
        setStorage('profiles', localProfiles);
      }
      currentUser = found;
      setStorage('currentUser', currentUser);
      return found;
    }

    try {
      // 1. Check if a profile exists in the Supabase public.profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supaUser.id)
        .maybeSingle();

      if (profile && !error) {
        const resolved: UserProfile = {
          id: profile.id,
          email: profile.email || email,
          full_name: profile.full_name || fullName,
          phone: profile.phone || '',
          role: (profile.role as UserRole) || 'citizen',
          avatar_url: profile.avatar_url || avatarUrl,
          location: profile.location || '',
          agency_name: profile.agency_name || '',
          skills: profile.skills || [],
          is_available: profile.is_available ?? true,
          created_at: profile.created_at || new Date().toISOString(),
        };
        currentUser = resolved;
        setStorage('currentUser', currentUser);
        return resolved;
      }

      if (error) {
      }

      // 2. If profile does not exist, insert it into public.profiles
      const newProfilePayload = {
        id: supaUser.id,
        email: email,
        full_name: fullName,
        role: 'citizen',
        avatar_url: avatarUrl,
        phone: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: created, error: insertError } = await supabase
        .from('profiles')
        .insert(newProfilePayload)
        .select()
        .maybeSingle();

      if (insertError) {
        // Retry query in case database trigger on auth.users inserted it concurrently
        const { data: retryProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supaUser.id)
          .maybeSingle();

        if (retryProfile) {
          const resolved: UserProfile = {
            id: retryProfile.id,
            email: retryProfile.email || email,
            full_name: retryProfile.full_name || fullName,
            phone: retryProfile.phone || '',
            role: (retryProfile.role as UserRole) || 'citizen',
            avatar_url: retryProfile.avatar_url || avatarUrl,
            location: retryProfile.location || '',
            agency_name: retryProfile.agency_name || '',
            skills: retryProfile.skills || [],
            is_available: retryProfile.is_available ?? true,
            created_at: retryProfile.created_at || new Date().toISOString(),
          };
          currentUser = resolved;
          setStorage('currentUser', currentUser);
          return resolved;
        }
      }

      const resolved: UserProfile = created
        ? {
            id: created.id,
            email: created.email,
            full_name: created.full_name || fullName,
            phone: created.phone || '',
            role: (created.role as UserRole) || 'citizen',
            avatar_url: created.avatar_url || avatarUrl,
            location: created.location || '',
            agency_name: created.agency_name || '',
            skills: created.skills || [],
            is_available: created.is_available ?? true,
            created_at: created.created_at || new Date().toISOString(),
          }
        : {
            id: supaUser.id,
            email,
            full_name: fullName,
            phone: '',
            role: 'citizen',
            avatar_url: avatarUrl,
            created_at: new Date().toISOString(),
          };
      currentUser = resolved;
      setStorage('currentUser', currentUser);
      return resolved;
    } catch (err) {
      console.error('[D-MERS Auth] Profile resolution exception:', err);
      const fallback: UserProfile = {
        id: supaUser.id,
        email,
        full_name: fullName,
        phone: '',
        role: 'citizen',
        avatar_url: avatarUrl,
        created_at: new Date().toISOString(),
      };
      currentUser = fallback;
      setStorage('currentUser', currentUser);
      return fallback;
    }
  },

  // ── Called on app startup or auth change to restore Supabase session ──────
  async handleOAuthCallback(passedSession?: any): Promise<UserProfile | null> {
    if (isMockMode) return currentUser;

    let user = passedSession?.user;
    if (!user) {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) return null;
      user = session.user;
    }

    return await this.resolveUserProfile(user);
  },

  // Incidents
  async getIncidents(): Promise<IncidentReport[]> {
    if (!isMockMode) {
      try {
        const { data, error } = await supabase
          .from('disaster_reports')
          .select('*')
          .order('priority_score', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as IncidentReport[];
        }
      } catch (_) {}
    }
    return [...localIncidents].sort((a, b) => b.priority_score - a.priority_score);
  },

  async createIncident(data: Omit<IncidentReport, 'id' | 'report_number' | 'status' | 'priority_score' | 'created_at' | 'updated_at'>): Promise<IncidentReport> {
    const priorityBreakdown = calculatePriorityScore({
      severity: data.severity,
      peopleAffected: data.people_affected,
      peopleNeedingHelp: data.people_needing_help,
      disasterType: data.disaster_type,
      hasElderlyChildren: data.has_elderly_children,
      hasMedicalEmergency: data.has_medical_emergency,
      isTrapped: data.is_trapped,
    });

    const now = new Date().toISOString();
    const reportNumber = `DM-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const incidentPayload = {
      ...data,
      report_number: reportNumber,
      status: 'reported' as IncidentStatus,
      priority_score: priorityBreakdown.score,
      created_at: now,
      updated_at: now,
    };

    let createdIncident: IncidentReport = {
      ...incidentPayload,
      id: `inc-${Date.now()}`,
    };

    if (!isMockMode) {
      try {
        const { data: dbData, error } = await supabase
          .from('disaster_reports')
          .insert(incidentPayload)
          .select()
          .maybeSingle();

        if (!error && dbData) {
          createdIncident = dbData as IncidentReport;
        }

        await supabase
          .from('emergency_timeline')
          .insert({
            incident_id: createdIncident.id,
            status: 'reported',
            note: `Incident reported by ${createdIncident.citizen_name}. Smart Priority Score computed as ${createdIncident.priority_score}.`,
            updated_by_name: createdIncident.citizen_name,
            updated_by_role: 'citizen',
            created_at: now,
          });
      } catch (_) {}
    }

    localIncidents.unshift(createdIncident);
    setStorage('incidents', localIncidents);

    const initTimeline: TimelineEvent = {
      id: `tl-${Date.now()}`,
      incident_id: createdIncident.id,
      status: 'reported',
      note: `Incident reported by ${createdIncident.citizen_name}. Smart Priority Score computed as ${createdIncident.priority_score}.`,
      updated_by_name: createdIncident.citizen_name,
      updated_by_role: 'citizen',
      created_at: now,
    };
    localTimeline.unshift(initTimeline);
    setStorage('timeline', localTimeline);

    return createdIncident;
  },

  async updateIncidentStatus(
    incidentId: string, 
    newStatus: IncidentStatus, 
    updaterName: string, 
    updaterRole: UserRole, 
    note: string,
    rescueTeamId?: string,
    rescueTeamName?: string
  ): Promise<IncidentReport> {
    const now = new Date().toISOString();

    if (!isMockMode) {
      try {
        const updatePayload: any = {
          status: newStatus,
          updated_at: now,
        };
        if (rescueTeamId) updatePayload.assigned_rescue_team_id = rescueTeamId;
        if (rescueTeamName) updatePayload.assigned_rescue_team_name = rescueTeamName;

        await supabase
          .from('disaster_reports')
          .update(updatePayload)
          .eq('id', incidentId);

        await supabase
          .from('emergency_timeline')
          .insert({
            incident_id: incidentId,
            status: newStatus,
            note,
            updated_by_name: updaterName,
            updated_by_role: updaterRole,
            created_at: now,
          });
      } catch (_) {}
    }

    const idx = localIncidents.findIndex(i => i.id === incidentId);
    if (idx !== -1) {
      localIncidents[idx] = {
        ...localIncidents[idx],
        status: newStatus,
        updated_at: now,
        ...(rescueTeamId ? { assigned_rescue_team_id: rescueTeamId } : {}),
        ...(rescueTeamName ? { assigned_rescue_team_name: rescueTeamName } : {}),
      };
      setStorage('incidents', localIncidents);
    }

    const timelineEvent: TimelineEvent = {
      id: `tl-${Date.now()}`,
      incident_id: incidentId,
      status: newStatus,
      note,
      updated_by_name: updaterName,
      updated_by_role: updaterRole,
      created_at: now,
    };
    localTimeline.unshift(timelineEvent);
    setStorage('timeline', localTimeline);

    return idx !== -1 ? localIncidents[idx] : ({ id: incidentId, status: newStatus } as any);
  },

  // Timeline
  async getTimelineEvents(incidentId: string): Promise<TimelineEvent[]> {
    if (!isMockMode) {
      try {
        const { data, error } = await supabase
          .from('emergency_timeline')
          .select('*')
          .eq('incident_id', incidentId)
          .order('created_at', { ascending: true });
        if (!error && data && data.length > 0) {
          return data as TimelineEvent[];
        }
      } catch (_) {}
    }
    return localTimeline.filter(t => t.incident_id === incidentId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },

  // Shelters
  async getShelters(): Promise<Shelter[]> {
    if (!isMockMode) {
      try {
        const { data, error } = await supabase
          .from('shelters')
          .select('*')
          .order('name');
        if (!error && data && data.length > 0) {
          return data as Shelter[];
        }
      } catch (_) {}
    }
    return [...localShelters];
  },

  async updateShelterOccupancy(shelterId: string, newOccupancy: number): Promise<Shelter> {
    const idx = localShelters.findIndex(s => s.id === shelterId);
    const cap = idx !== -1 ? localShelters[idx].capacity : 350;
    const ratio = newOccupancy / cap;
    let status: 'available' | 'high_occupancy' | 'full' = 'available';
    if (ratio >= 1) status = 'full';
    else if (ratio >= 0.85) status = 'high_occupancy';

    if (!isMockMode) {
      try {
        await supabase
          .from('shelters')
          .update({
            current_occupancy: newOccupancy,
            status,
            updated_at: new Date().toISOString()
          })
          .eq('id', shelterId);
      } catch (_) {}
    }

    if (idx !== -1) {
      localShelters[idx] = {
        ...localShelters[idx],
        current_occupancy: newOccupancy,
        status,
      };
      setStorage('shelters', localShelters);
      return localShelters[idx];
    }
    return { id: shelterId, current_occupancy: newOccupancy, status } as any;
  },

  // Volunteer Tasks
  async getVolunteerTasks(): Promise<VolunteerTask[]> {
    if (!isMockMode) {
      try {
        const { data, error } = await supabase
          .from('volunteer_tasks')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as VolunteerTask[];
        }
      } catch (_) {}
    }
    return [...localTasks];
  },

  async assignVolunteerTask(taskId: string, volunteerId: string, volunteerName: string): Promise<VolunteerTask> {
    if (!isMockMode) {
      try {
        await supabase
          .from('volunteer_tasks')
          .update({
            status: 'assigned',
            assigned_volunteer_id: volunteerId,
            assigned_volunteer_name: volunteerName,
            updated_at: new Date().toISOString()
          })
          .eq('id', taskId);
      } catch (_) {}
    }

    const idx = localTasks.findIndex(t => t.id === taskId);
    if (idx !== -1) {
      localTasks[idx] = {
        ...localTasks[idx],
        status: 'assigned',
        assigned_volunteer_id: volunteerId,
        assigned_volunteer_name: volunteerName,
      };
      setStorage('tasks', localTasks);
      return localTasks[idx];
    }
    return { id: taskId, status: 'assigned', assigned_volunteer_id: volunteerId, assigned_volunteer_name: volunteerName } as any;
  },

  async completeVolunteerTask(taskId: string): Promise<VolunteerTask> {
    if (!isMockMode) {
      try {
        await supabase
          .from('volunteer_tasks')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', taskId);
      } catch (_) {}
    }

    const idx = localTasks.findIndex(t => t.id === taskId);
    if (idx !== -1) {
      localTasks[idx] = {
        ...localTasks[idx],
        status: 'completed',
      };
      setStorage('tasks', localTasks);
      return localTasks[idx];
    }
    return { id: taskId, status: 'completed' } as any;
  },

  // Recovery Hub
  async getRecoveryResources(): Promise<RecoveryResource[]> {
    if (!isMockMode) {
      try {
        const { data, error } = await supabase
          .from('recovery_resources')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as RecoveryResource[];
        }
      } catch (_) {}
    }
    return [...localRecovery].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async createRecoveryResource(data: Omit<RecoveryResource, 'id' | 'created_at' | 'status'>): Promise<RecoveryResource> {
    const now = new Date().toISOString();
    let newRes: RecoveryResource = {
      ...data,
      id: `rec-${Date.now()}`,
      status: 'open',
      created_at: now,
    };

    if (!isMockMode) {
      try {
        const { data: dbData, error } = await supabase
          .from('recovery_resources')
          .insert({
            ...data,
            status: 'open',
            created_at: now,
          })
          .select()
          .maybeSingle();
        if (!error && dbData) {
          newRes = dbData as RecoveryResource;
        }
      } catch (_) {}
    }

    localRecovery.unshift(newRes);
    setStorage('recovery', localRecovery);
    return newRes;
  },

  async fulfillRecoveryResource(id: string): Promise<RecoveryResource> {
    if (!isMockMode) {
      try {
        await supabase
          .from('recovery_resources')
          .update({ status: 'fulfilled' })
          .eq('id', id);
      } catch (_) {}
    }

    const idx = localRecovery.findIndex(r => r.id === id);
    if (idx !== -1) {
      localRecovery[idx].status = 'fulfilled';
      setStorage('recovery', localRecovery);
      return localRecovery[idx];
    }
    return { id, status: 'fulfilled' } as any;
  },

  // Alerts
  async getAlerts(): Promise<EmergencyAlert[]> {
    if (!isMockMode) {
      try {
        const { data, error } = await supabase
          .from('emergency_alerts')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as EmergencyAlert[];
        }
      } catch (_) {}
    }
    return localAlerts.filter(a => a.is_active);
  },

  async createAlert(alert: Omit<EmergencyAlert, 'id' | 'created_at' | 'is_active'>): Promise<EmergencyAlert> {
    const now = new Date().toISOString();
    let newAlert: EmergencyAlert = {
      ...alert,
      id: `alt-${Date.now()}`,
      created_at: now,
      is_active: true,
    };

    if (!isMockMode) {
      try {
        const { data: dbData, error } = await supabase
          .from('emergency_alerts')
          .insert({
            ...alert,
            is_active: true,
            created_at: now,
          })
          .select()
          .maybeSingle();
        if (!error && dbData) {
          newAlert = dbData as EmergencyAlert;
        }
      } catch (_) {}
    }

    localAlerts.unshift(newAlert);
    setStorage('alerts', localAlerts);
    return newAlert;
  },

  // Missing Persons
  async getMissingPersons(): Promise<MissingPerson[]> {
    if (!isMockMode) {
      try {
        const { data, error } = await supabase
          .from('missing_persons')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as MissingPerson[];
        }
      } catch (_) {}
    }
    return [...localMissing].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async createMissingPerson(data: Omit<MissingPerson, 'id' | 'created_at' | 'status'>): Promise<MissingPerson> {
    const now = new Date().toISOString();
    let newPerson: MissingPerson = {
      ...data,
      id: `mp-${Date.now()}`,
      status: 'missing',
      created_at: now,
    };

    if (!isMockMode) {
      try {
        const { data: dbData, error } = await supabase
          .from('missing_persons')
          .insert({
            ...data,
            status: 'missing',
            created_at: now,
          })
          .select()
          .maybeSingle();
        if (!error && dbData) {
          newPerson = dbData as MissingPerson;
        }
      } catch (_) {}
    }

    localMissing.unshift(newPerson);
    setStorage('missing', localMissing);
    return newPerson;
  },

  async markMissingPersonFound(id: string): Promise<MissingPerson> {
    if (!isMockMode) {
      try {
        await supabase
          .from('missing_persons')
          .update({
            status: 'found',
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
      } catch (_) {}
    }

    const idx = localMissing.findIndex(m => m.id === id);
    if (idx !== -1) {
      localMissing[idx].status = 'found';
      setStorage('missing', localMissing);
      return localMissing[idx];
    }
    return { id, status: 'found' } as any;
  }
};
