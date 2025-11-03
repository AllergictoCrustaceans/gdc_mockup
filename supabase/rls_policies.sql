-- RLS Policies for Event Management Platform
-- Run this in your Supabase SQL Editor

-- =====================================================
-- DISABLE RLS FOR DEVELOPMENT (Quick Fix)
-- =====================================================
-- WARNING: This disables security. Use only for development/testing!
-- For production, you should create proper policies instead.

ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE venues DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- OR USE PROPER RLS POLICIES (Recommended for Production)
-- =====================================================
-- Uncomment the sections below if you want proper security

/*
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- USER_PROFILES POLICIES
-- Allow users to read all profiles
CREATE POLICY "Allow read access to all user profiles" ON user_profiles
  FOR SELECT USING (true);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Allow users to insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- EVENTS POLICIES
-- Allow anyone to read events
CREATE POLICY "Allow read access to all events" ON events
  FOR SELECT USING (true);

-- Allow authenticated users to create events
CREATE POLICY "Allow authenticated users to create events" ON events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow organizers to update their own events
CREATE POLICY "Allow organizers to update own events" ON events
  FOR UPDATE USING (auth.uid() = organizer_id);

-- Allow organizers to delete their own events
CREATE POLICY "Allow organizers to delete own events" ON events
  FOR DELETE USING (auth.uid() = organizer_id);

-- REGISTRATIONS POLICIES
-- Allow users to read their own registrations
CREATE POLICY "Allow users to read own registrations" ON registrations
  FOR SELECT USING (auth.uid() = attendee_id);

-- Allow users to create their own registrations
CREATE POLICY "Allow users to create registrations" ON registrations
  FOR INSERT WITH CHECK (auth.uid() = attendee_id);

-- Allow users to update their own registrations
CREATE POLICY "Allow users to update own registrations" ON registrations
  FOR UPDATE USING (auth.uid() = attendee_id);

-- Allow users to delete their own registrations
CREATE POLICY "Allow users to delete own registrations" ON registrations
  FOR DELETE USING (auth.uid() = attendee_id);

-- TICKETS POLICIES
-- Allow users to read their own tickets
CREATE POLICY "Allow users to read own tickets" ON tickets
  FOR SELECT USING (auth.uid() = attendee_id);

-- Allow authenticated users to create tickets
CREATE POLICY "Allow authenticated users to create tickets" ON tickets
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- PAYMENTS POLICIES
-- Allow users to read their own payments
CREATE POLICY "Allow users to read own payments" ON payments
  FOR SELECT USING (auth.uid() = attendee_id);

-- Allow users to create their own payments
CREATE POLICY "Allow users to create payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = attendee_id);

-- Allow users to update their own payments
CREATE POLICY "Allow users to update own payments" ON payments
  FOR UPDATE USING (auth.uid() = attendee_id);

-- VENUES POLICIES
-- Allow anyone to read venues
CREATE POLICY "Allow read access to all venues" ON venues
  FOR SELECT USING (true);

-- Allow authenticated users to create venues
CREATE POLICY "Allow authenticated users to create venues" ON venues
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
*/