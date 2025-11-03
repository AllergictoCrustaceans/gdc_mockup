# Supabase Schema Setup Guide

## Quick Start

### 1. Run the Schema

1. Open your Supabase Dashboard (local or hosted)
2. Navigate to **SQL Editor**
3. Copy the entire contents of `schema.sql`
4. Paste and click **Run**

That's it! All tables, indexes, RLS policies, and triggers will be created.

---

## Database Structure Overview

### Core Tables

#### **Users & Roles**
- `user_profiles` - Base profile for all users (links to Supabase Auth)
- `event_organizers` - Organizers who create events
- `attendees` - People who attend events
- `speakers` - People who present at events
- `vendors` - Vendors who participate in events
- `administrators` - Platform admins

#### **Event Management**
- `events` - Main events table
- `venues` - Physical locations for events
- `schedules` - Event session schedules
- `registrations` - User registrations for events
- `tickets` - Generated tickets after payment

#### **Payments**
- `payments` - Payment records (Stripe integration)
- `transactions` - Individual charge/refund transactions

#### **Notifications**
- `notifications` - Base notification table
- `email_alerts` - Email-specific notifications
- `push_notifications` - Push notification records

#### **Analytics**
- `analytics` - Per-event analytics data
- `reports` - Generated reports

#### **Vendor**
- `vendor_products` - Products offered by vendors

---

## Key Features

### ✅ Row Level Security (RLS)
All tables have RLS enabled with sensible defaults:
- Users can only see/edit their own data
- Event organizers can manage their own events
- Public data (events, venues) is readable by all
- Admins have elevated permissions

### ✅ Automatic Triggers
- `updated_at` columns auto-update on changes
- `tickets_sold` increments when tickets are created
- `analytics` updates when tickets are checked in

### ✅ Real-time Enabled
These tables have real-time subscriptions enabled:
- `events` - Live event updates
- `tickets` - Check-in tracking
- `registrations` - Registration status
- `notifications` - Live notifications
- `analytics` - Live analytics updates

### ✅ Indexes
Performance indexes on:
- Foreign keys
- Frequently queried fields (status, dates)
- Search fields (email, QR codes)

---

## Table Relationships

```
user_profiles
├── event_organizers (1:1)
├── attendees (1:1)
├── speakers (1:1)
├── vendors (1:1)
└── administrators (1:1)

events
├── venue (N:1)
├── event_organizer (N:1)
├── registrations (1:N)
├── tickets (1:N)
├── schedules (1:N)
├── analytics (1:1)
└── reports (1:N)

registrations
├── event (N:1)
├── attendee (N:1)
└── ticket (1:1, optional)

tickets
├── event (N:1)
└── attendee (N:1)

payments
├── attendee (N:1)
├── event (N:1)
└── transactions (1:N)

notifications
├── user (N:1)
├── event (N:1, optional)
├── email_alert (1:1, optional)
└── push_notification (1:1, optional)
```

---

## Important Fields

### Enums (CHECK constraints)

**User Roles:**
- `attendee`, `organizer`, `speaker`, `vendor`, `administrator`

**Registration Status:**
- `pending`, `confirmed`, `cancelled`

**Ticket Status:**
- `active`, `cancelled`, `refunded`

**Payment Status:**
- `pending`, `processing`, `completed`, `failed`, `refunded`

**Payment Method:**
- `card`, `cash`, `other`

**Notification Type:**
- `event_update`, `schedule_change`, `venue_change`, `ticket_purchased`, `check_in`, `general`

**Notification Priority:**
- `low`, `medium`, `high`, `urgent`

**Report Type:**
- `sales`, `attendance`, `revenue`, `comprehensive`

### Price Fields
All monetary values are stored in **cents** (INTEGER):
- `payments.amount` - e.g., 5000 = $50.00
- `tickets.price` - e.g., 2500 = $25.00
- `vendor_products.product_price`

---

## Usage Examples

### Create a User Profile

```sql
-- This happens automatically via Supabase Auth
-- Then create the profile:
INSERT INTO user_profiles (id, name, email, role)
VALUES (
  auth.uid(),
  'John Doe',
  'john@example.com',
  'attendee'
);

-- Create attendee-specific record
INSERT INTO attendees (id)
VALUES (auth.uid());
```

### Create an Event

```sql
INSERT INTO events (
  title,
  description,
  start_time,
  end_time,
  event_organizer_id,
  venue_id,
  capacity
) VALUES (
  'Tech Conference 2024',
  'Annual tech conference',
  '2024-12-01 09:00:00',
  '2024-12-01 18:00:00',
  'organizer-uuid-here',
  'venue-uuid-here',
  500
);
```

### Create a Registration

```sql
INSERT INTO registrations (
  event_id,
  attendee_id,
  ticket_type,
  status
) VALUES (
  'event-uuid-here',
  'attendee-uuid-here',
  'general_admission',
  'pending'
);
```

### Check In a Ticket

```sql
UPDATE tickets
SET
  is_checked_in = TRUE,
  checked_in_at = NOW()
WHERE qr_code = 'TICKET-123-456';

-- Analytics will auto-update via trigger!
```

---

## Real-time Subscriptions (Client-side)

### Listen to Event Updates

```typescript
const channel = supabase
  .channel('event-updates')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'events',
      filter: 'id=eq.EVENT_UUID'
    },
    (payload) => {
      console.log('Event updated!', payload);
    }
  )
  .subscribe();
```

### Listen to Check-ins

```typescript
const channel = supabase
  .channel('ticket-checkins')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'tickets',
      filter: 'event_id=eq.EVENT_UUID'
    },
    (payload) => {
      if (payload.new.is_checked_in) {
        console.log('Ticket checked in!', payload.new);
      }
    }
  )
  .subscribe();
```

---

## Testing the Schema

### Verify Tables

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Check RLS Policies

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Check Realtime Publications

```sql
SELECT
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
```

---

## Troubleshooting

### Issue: RLS blocking queries

**Solution:** Make sure you're authenticated:
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});
```

### Issue: Foreign key errors

**Solution:** Create records in order:
1. `user_profiles` first
2. Then role-specific tables (`attendees`, `event_organizers`, etc.)
3. Then `venues`
4. Then `events`
5. Then `registrations`, `tickets`, etc.

### Issue: Realtime not working

**Solution:**
1. Check that table is added to publication:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE table_name;
   ```
2. Enable replication:
   ```sql
   ALTER TABLE table_name REPLICA IDENTITY FULL;
   ```

---

## Next Steps

After running the schema:

1. ✅ **Create your first user** via Supabase Auth
2. ✅ **Add a user profile** to `user_profiles`
3. ✅ **Create a test venue**
4. ✅ **Create a test event**
5. ✅ **Test registration flow**
6. ✅ **Test payment flow** (with Stripe test keys)
7. ✅ **Test QR code check-in**
8. ✅ **Test real-time updates** in your UI

---

## Security Notes

⚠️ **Important Security Considerations:**

1. **Service Role Key** - Never expose in client code! Only use in API routes/server-side
2. **Anon Key** - Safe to use in client code (respects RLS)
3. **RLS Policies** - Review and customize based on your exact needs
4. **Stripe Keys** - Use test keys (`sk_test_*` and `pk_test_*`) for development

---

## Schema Modifications

To modify the schema later:

### Add a Column
```sql
ALTER TABLE table_name
ADD COLUMN new_column_name TYPE;
```

### Add an Index
```sql
CREATE INDEX idx_name ON table_name(column_name);
```

### Modify RLS Policy
```sql
DROP POLICY "policy_name" ON table_name;

CREATE POLICY "new_policy_name" ON table_name
  FOR SELECT USING (your_condition);
```

---

## Questions?

If you encounter any issues:
1. Check the Supabase logs in Dashboard > Logs
2. Verify RLS policies aren't blocking your queries
3. Ensure foreign key relationships are correct
4. Test with the SQL Editor in Supabase Dashboard

Good luck with your Event Management Platform! 🚀
