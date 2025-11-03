-- Event Management Platform - Database Schema
-- Generated for Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USER PROFILES TABLE
-- =====================================================
-- Note: Supabase Auth handles the base users table
-- This extends it with role-specific information

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('attendee', 'organizer', 'speaker', 'vendor', 'administrator')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROLE-SPECIFIC TABLES
-- =====================================================

-- Event Organizers
CREATE TABLE event_organizers (
    id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
    company_name TEXT,
    events_managing TEXT[] DEFAULT '{}',
    venues_managing TEXT[] DEFAULT '{}'
);

-- Attendees
CREATE TABLE attendees (
    id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
    registrations TEXT[] DEFAULT '{}',
    tickets TEXT[] DEFAULT '{}'
);

-- Speakers
CREATE TABLE speakers (
    id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
    bio TEXT,
    expertise TEXT[] DEFAULT '{}',
    speaking_sessions TEXT[] DEFAULT '{}',
    company TEXT,
    website TEXT
);

-- Vendors
CREATE TABLE vendors (
    id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
    vendor_location TEXT NOT NULL,
    company_name TEXT,
    events_participating TEXT[] DEFAULT '{}'
);

-- Administrators
CREATE TABLE administrators (
    id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
    access_level TEXT NOT NULL CHECK (access_level IN ('super', 'standard')),
    permissions TEXT[] DEFAULT '{}'
);

-- =====================================================
-- VENUE TABLE
-- =====================================================

CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    amenities TEXT[] DEFAULT '{}',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EVENT TABLE
-- =====================================================

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    event_organizer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    capacity INTEGER NOT NULL,
    tickets_sold INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SCHEDULE TABLE
-- =====================================================

CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    session_name TEXT NOT NULL,
    category TEXT NOT NULL,
    speaker_id UUID REFERENCES speakers(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- REGISTRATION TABLE
-- =====================================================

CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    attendee_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    ticket_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    ticket_id UUID,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, attendee_id)
);

-- =====================================================
-- TICKET TABLE
-- =====================================================

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    attendee_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    ticket_type TEXT NOT NULL,
    price INTEGER NOT NULL, -- in cents
    qr_code TEXT NOT NULL UNIQUE,
    is_checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PAYMENT TABLE
-- =====================================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount INTEGER NOT NULL, -- in cents
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'cash', 'other')),
    stripe_payment_intent_id TEXT,
    attendee_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    ticket_ids TEXT[] DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- =====================================================
-- TRANSACTION TABLE
-- =====================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- in cents
    type TEXT NOT NULL CHECK (type IN ('charge', 'refund')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    metadata JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATION TABLE
-- =====================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('event_update', 'schedule_change', 'venue_change', 'ticket_purchased', 'check_in', 'general')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EMAIL ALERT TABLE
-- =====================================================

CREATE TABLE email_alerts (
    id UUID PRIMARY KEY REFERENCES notifications(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    email_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMPTZ
);

-- =====================================================
-- PUSH NOTIFICATION TABLE
-- =====================================================

CREATE TABLE push_notifications (
    id UUID PRIMARY KEY REFERENCES notifications(id) ON DELETE CASCADE,
    device_token TEXT NOT NULL,
    pushed BOOLEAN DEFAULT FALSE,
    pushed_at TIMESTAMPTZ,
    click_action TEXT
);

-- =====================================================
-- ANALYTICS TABLE
-- =====================================================

CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
    total_tickets_sold INTEGER DEFAULT 0,
    total_revenue INTEGER DEFAULT 0, -- in cents
    total_attendees INTEGER DEFAULT 0,
    checked_in_count INTEGER DEFAULT 0,
    attendance_rate DECIMAL(5,2) DEFAULT 0,
    ticket_type_breakdown JSONB DEFAULT '{}',
    revenue_by_ticket_type JSONB DEFAULT '{}',
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- REPORT TABLE
-- =====================================================

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('sales', 'attendance', 'revenue', 'comprehensive')),
    data JSONB NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- VENDOR PRODUCTS TABLE
-- =====================================================

CREATE TABLE vendor_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    product_price INTEGER NOT NULL, -- in cents
    product_quantity INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User profiles
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- Events
CREATE INDEX idx_events_organizer ON events(event_organizer_id);
CREATE INDEX idx_events_venue ON events(venue_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_end_time ON events(end_time);

-- Registrations
CREATE INDEX idx_registrations_event ON registrations(event_id);
CREATE INDEX idx_registrations_attendee ON registrations(attendee_id);
CREATE INDEX idx_registrations_status ON registrations(status);

-- Tickets
CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_attendee ON tickets(attendee_id);
CREATE INDEX idx_tickets_qr_code ON tickets(qr_code);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_checked_in ON tickets(is_checked_in);

-- Payments
CREATE INDEX idx_payments_attendee ON payments(attendee_id);
CREATE INDEX idx_payments_event ON payments(event_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_intent ON payments(stripe_payment_intent_id);

-- Transactions
CREATE INDEX idx_transactions_payment ON transactions(payment_id);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_event ON notifications(event_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Schedules
CREATE INDEX idx_schedules_event ON schedules(event_id);
CREATE INDEX idx_schedules_speaker ON schedules(speaker_id);

-- Vendor Products
CREATE INDEX idx_vendor_products_vendor ON vendor_products(vendor_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_products ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Events: Everyone can view, organizers can create/update their own
CREATE POLICY "Events are viewable by everyone" ON events
    FOR SELECT USING (true);

CREATE POLICY "Organizers can create events" ON events
    FOR INSERT WITH CHECK (
        auth.uid() = event_organizer_id
    );

CREATE POLICY "Organizers can update their own events" ON events
    FOR UPDATE USING (
        auth.uid() = event_organizer_id
    );

CREATE POLICY "Organizers can delete their own events" ON events
    FOR DELETE USING (
        auth.uid() = event_organizer_id
    );

-- Registrations: Users can view their own, organizers can view for their events
CREATE POLICY "Users can view their own registrations" ON registrations
    FOR SELECT USING (
        auth.uid() = attendee_id OR
        auth.uid() IN (SELECT event_organizer_id FROM events WHERE id = event_id)
    );

CREATE POLICY "Users can create registrations" ON registrations
    FOR INSERT WITH CHECK (auth.uid() = attendee_id);

CREATE POLICY "Users can update their own registrations" ON registrations
    FOR UPDATE USING (auth.uid() = attendee_id);

-- Tickets: Users can view their own, organizers can view for their events
CREATE POLICY "Users can view their own tickets" ON tickets
    FOR SELECT USING (
        auth.uid() = attendee_id OR
        auth.uid() IN (SELECT event_organizer_id FROM events WHERE id = event_id)
    );

CREATE POLICY "System can create tickets" ON tickets
    FOR INSERT WITH CHECK (true); -- Handled by backend logic

CREATE POLICY "Users can update their own tickets (check-in)" ON tickets
    FOR UPDATE USING (
        auth.uid() = attendee_id OR
        auth.uid() IN (SELECT event_organizer_id FROM events WHERE id = event_id)
    );

-- Payments: Users can view their own payments
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (auth.uid() = attendee_id);

CREATE POLICY "Users can create payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = attendee_id);

-- Notifications: Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Venues: Everyone can view
CREATE POLICY "Venues are viewable by everyone" ON venues
    FOR SELECT USING (true);

-- Analytics: Event organizers can view analytics for their events
CREATE POLICY "Organizers can view analytics for their events" ON analytics
    FOR SELECT USING (
        auth.uid() IN (SELECT event_organizer_id FROM events WHERE id = event_id)
    );

-- Schedules: Everyone can view
CREATE POLICY "Schedules are viewable by everyone" ON schedules
    FOR SELECT USING (true);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venues_updated_at
    BEFORE UPDATE ON venues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment tickets_sold when ticket is created
CREATE OR REPLACE FUNCTION increment_tickets_sold()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE events
    SET tickets_sold = tickets_sold + 1
    WHERE id = NEW.event_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_ticket_created
    AFTER INSERT ON tickets
    FOR EACH ROW EXECUTE FUNCTION increment_tickets_sold();

-- Function to update analytics when ticket is checked in
CREATE OR REPLACE FUNCTION update_analytics_on_checkin()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_checked_in = TRUE AND OLD.is_checked_in = FALSE THEN
        UPDATE analytics
        SET
            checked_in_count = checked_in_count + 1,
            attendance_rate = (checked_in_count + 1) * 100.0 / NULLIF(total_attendees, 0),
            last_updated = NOW()
        WHERE event_id = NEW.event_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_ticket_checkin
    AFTER UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_analytics_on_checkin();

-- =====================================================
-- ENABLE REALTIME FOR KEY TABLES
-- =====================================================

-- Enable realtime replication for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE analytics;

-- =====================================================
-- SEED DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Insert a test venue
-- INSERT INTO venues (name, address, city, state, zip_code, capacity, description)
-- VALUES ('Tech Conference Center', '123 Main St', 'San Francisco', 'CA', '94105', 500, 'Modern conference facility');

-- =====================================================
-- NOTES
-- =====================================================

-- To run this schema:
-- 1. Open Supabase Dashboard
-- 2. Go to SQL Editor
-- 3. Paste this entire file
-- 4. Click "Run"

-- After running:
-- - All tables will be created
-- - Indexes will be added for performance
-- - RLS policies will be enabled (secure by default)
-- - Triggers will auto-update timestamps and analytics
-- - Realtime will be enabled for key tables
