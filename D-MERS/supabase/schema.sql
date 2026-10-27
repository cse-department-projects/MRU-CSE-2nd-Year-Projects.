-- ================================================================
-- D-MERS: Disaster Management & Emergency Response System
-- Supabase PostgreSQL Schema v1.0
-- Run this in the Supabase SQL Editor to set up your database
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 1. PROFILES TABLE (extends Supabase auth.users)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'rescue_team', 'volunteer', 'admin')),
  avatar_url TEXT,
  location TEXT,
  agency_name TEXT,         -- for rescue teams
  skills TEXT[] DEFAULT '{}', -- for volunteers
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 2. DISASTER REPORTS (Incidents)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.disaster_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_number TEXT UNIQUE NOT NULL,
  citizen_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  citizen_name TEXT NOT NULL,
  citizen_phone TEXT NOT NULL,
  disaster_type TEXT NOT NULL CHECK (disaster_type IN ('flood','earthquake','fire','cyclone','landslide','building_collapse','other')),
  title TEXT NOT NULL,
  location_name TEXT NOT NULL,
  latitude DOUBLE PRECISION DEFAULT 17.385,
  longitude DOUBLE PRECISION DEFAULT 78.486,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  people_affected INTEGER DEFAULT 1,
  people_needing_help INTEGER DEFAULT 1,
  has_elderly_children BOOLEAN DEFAULT false,
  has_medical_emergency BOOLEAN DEFAULT false,
  is_trapped BOOLEAN DEFAULT false,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported','triaged','dispatched','on_scene','rescued','closed')),
  priority_score INTEGER DEFAULT 50 CHECK (priority_score BETWEEN 0 AND 100),
  assigned_rescue_team_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_rescue_team_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 3. EMERGENCY TIMELINE
-- ================================================================
CREATE TABLE IF NOT EXISTS public.emergency_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID NOT NULL REFERENCES public.disaster_reports(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('reported','triaged','dispatched','on_scene','rescued','closed')),
  note TEXT NOT NULL,
  updated_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by_name TEXT NOT NULL,
  updated_by_role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 4. SHELTERS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.shelters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DOUBLE PRECISION DEFAULT 17.385,
  longitude DOUBLE PRECISION DEFAULT 78.486,
  capacity INTEGER NOT NULL DEFAULT 100,
  current_occupancy INTEGER NOT NULL DEFAULT 0 CHECK (current_occupancy >= 0),
  contact_person TEXT,
  contact_phone TEXT,
  amenities TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','high_occupancy','full')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT occupancy_not_exceed_capacity CHECK (current_occupancy <= capacity)
);

-- ================================================================
-- 5. VOLUNTEER TASKS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.volunteer_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  disaster_type TEXT CHECK (disaster_type IN ('flood','earthquake','fire','cyclone','landslide','building_collapse','other')),
  location TEXT,
  required_skills TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','assigned','completed')),
  assigned_volunteer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_volunteer_name TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 6. EMERGENCY ALERTS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.emergency_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','danger')),
  affected_area TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 7. MISSING PERSONS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.missing_persons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  last_seen_location TEXT,
  last_seen_date DATE,
  description TEXT,
  reporter_name TEXT,
  reporter_phone TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'missing' CHECK (status IN ('missing','found')),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 8. RECOVERY RESOURCES
-- ================================================================
CREATE TABLE IF NOT EXISTS public.recovery_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('request','offer')),
  category TEXT NOT NULL CHECK (category IN ('food','water','medical','shelter','clothing','tools','other')),
  title TEXT NOT NULL,
  description TEXT,
  quantity TEXT,
  location TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','fulfilled')),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 9. NOTIFICATIONS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general' CHECK (type IN ('rescue_update','alert','task_assigned','general')),
  is_read BOOLEAN DEFAULT false,
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- AUTO-UPDATE TIMESTAMPS TRIGGER
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER tr_disaster_reports_updated_at
  BEFORE UPDATE ON public.disaster_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER tr_shelters_updated_at
  BEFORE UPDATE ON public.shelters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER tr_volunteer_tasks_updated_at
  BEFORE UPDATE ON public.volunteer_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- AUTO-CREATE PROFILE ON SIGN UP
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- ROW LEVEL SECURITY POLICIES
-- ================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disaster_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missing_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- DISASTER REPORTS policies
CREATE POLICY "Anyone authenticated can view reports" ON public.disaster_reports FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Citizens can create reports" ON public.disaster_reports FOR INSERT WITH CHECK (auth.uid() = citizen_id);
CREATE POLICY "Admins and rescue teams can update reports" ON public.disaster_reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','rescue_team'))
  OR auth.uid() = citizen_id
);

-- EMERGENCY TIMELINE policies
CREATE POLICY "Authenticated users can view timeline" ON public.emergency_timeline FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert timeline" ON public.emergency_timeline FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- SHELTERS policies
CREATE POLICY "Anyone authenticated can view shelters" ON public.shelters FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage shelters" ON public.shelters FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- VOLUNTEER TASKS policies
CREATE POLICY "Authenticated users can view tasks" ON public.volunteer_tasks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can create tasks" ON public.volunteer_tasks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','rescue_team'))
);
CREATE POLICY "Volunteers can update assigned tasks" ON public.volunteer_tasks FOR UPDATE USING (
  auth.uid() = assigned_volunteer_id
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ALERTS policies
CREATE POLICY "Anyone authenticated can view alerts" ON public.emergency_alerts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage alerts" ON public.emergency_alerts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- MISSING PERSONS policies
CREATE POLICY "Anyone authenticated can view missing persons" ON public.missing_persons FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create missing person reports" ON public.missing_persons FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update missing persons" ON public.missing_persons FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RECOVERY RESOURCES policies
CREATE POLICY "Anyone authenticated can view recovery resources" ON public.recovery_resources FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create recovery resources" ON public.recovery_resources FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update recovery resources" ON public.recovery_resources FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- NOTIFICATIONS policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ================================================================
-- SEED DATA — Demo Data for Project Presentation
-- ================================================================

-- Demo shelter data
INSERT INTO public.shelters (name, location, latitude, longitude, capacity, current_occupancy, contact_person, contact_phone, amenities, status)
VALUES
  ('Government Model High School Relief Center', 'Road No. 12, Banjara Hills, Hyderabad', 17.415, 78.438, 350, 210, 'Ramesh Reddy (MRO)', '+91 94400 12345', ARRAY['Clean Water','Medical Doctor','Hot Meals','Blankets','Power Backup','Sanitation'], 'available'),
  ('Community Indoor Sports Complex Shelter', 'Near Metro Station, LB Nagar', 17.365, 78.548, 500, 465, 'Sita Laxmi', '+91 94400 67890', ARRAY['Emergency Kits','Infant Care','CCTV Security','Dry Rations','First Aid'], 'high_occupancy'),
  ('St. Marks Exhibition Hall Relief Hub', 'Abids Road, Nampally, Hyderabad', 17.388, 78.472, 200, 200, 'K. V. Rao', '+91 94400 99887', ARRAY['Medical Triage','Water Purifier','Generator'], 'full')
ON CONFLICT DO NOTHING;

-- Demo alert
INSERT INTO public.emergency_alerts (title, message, severity, affected_area, is_active)
VALUES 
  ('HEAVY RAINFALL RED ALERT', 'IMD issues Red Warning for Hyderabad Metro Region. Move to high ground immediately if in low-lying zones.', 'danger', 'LB Nagar, Dilsukhnagar, Uppal, Malakpet', true),
  ('Emergency Relief Camps Operational', 'Free hot meals and safe drinking water available at Govt Model High School Shelter.', 'info', 'Banjara Hills & Jubilee Hills Zone', true)
ON CONFLICT DO NOTHING;

-- Demo volunteer tasks
INSERT INTO public.volunteer_tasks (title, description, disaster_type, location, required_skills, status, priority)
VALUES
  ('Relief Pack Distribution', 'Assist in packing food rations, water bottles, and hygiene kits at Central Warehouse.', 'flood', 'Central Relief Warehouse, Begumpet', ARRAY['Logistics','First Aid'], 'open', 'high'),
  ('Shelter Desk Registration Assistant', 'Help check in displaced citizens and maintain emergency roster.', 'flood', 'Govt High School Shelter, Banjara Hills', ARRAY['Communication','Logistics'], 'open', 'medium')
ON CONFLICT DO NOTHING;
