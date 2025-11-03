# Games Developers Conference 2026 - Event Management System

A comprehensive mockup website of the Games Developers Conference 2026 event management platform built with Next.js 16, TypeScript, and Supabase.

## 🎥 Demo Videos

See the platform in action from different user perspectives:

- [**Admin's Perspective**](https://youtu.be/4RPMYboud-U) - User management, analytics, and event oversight
- [**Attendee's Perspective**](https://youtu.be/tF9IZpIMXIU) - Event browsing, registration, and ticket management
- [**Event Organizer's Perspective**](https://youtu.be/jRlprlYoKTg) - Event creation and management

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Dependencies](#dependencies)
- [Database Setup](#database-setup)
- [Routes & Authentication](#routes--authentication)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

## Features

### For Attendees

- Browse and search available events
- Register for events with different ticket types (General, VIP, Student)
- View and manage event registrations
- Access digital tickets with QR codes
- Track ticket check-in status

### For Event Organizers

- Create and manage events
- Set event details (title, description, location, dates)
- Configure ticket types and pricing
- View event analytics and registration data

### For Administrators

- Manage all users across the platform
- Delete user accounts (with proper authentication)
- View system-wide analytics
- Access all events and registrations

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React, TypeScript
- **Styling**: Tailwind CSS (minimal, clean design)
- **Backend**: Supabase (PostgreSQL database + Authentication)
- **State Management**: Zustand
- **QR Code Generation**: qrcode.react

## Prerequisites

- **Node.js** 18+ and npm
- **Supabase account** (database is hosted remotely - no local database setup required)
- **Git** for cloning the repository

## Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd gdc_mockup
```

### Step 2: Install Dependencies

Install all required npm packages:

```bash
npm install
```

This will install all dependencies listed in `package.json` (see [Dependencies](#dependencies) section below).

### Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://kjlineyenvpzioinskcq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Required for admin operations (deleting users)
# Get this from your Supabase project settings > API > service_role key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Important**: Contact **ME** for the Supabase API keys. The database is already set up and hosted remotely on Supabase, so you don't need to create your own database.

### Step 4: Run the Development Server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000).

### Step 5: Access the Application

Open your browser and navigate to `http://localhost:3000`. You should see the landing page with **Signup** and **Login** buttons.

## Dependencies

This project uses the following key dependencies:

### Core Framework & Runtime

- **next** (16.0.0) - React framework with App Router for server-side rendering and routing
- **react** (19.2.0) - UI library for building component-based interfaces
- **react-dom** (19.2.0) - React rendering for web browsers
- **typescript** (^5) - Type-safe JavaScript for better development experience

### Backend & Database

- **@supabase/supabase-js** (^2.76.1) - Supabase client for database operations and authentication
- **@supabase/ssr** (^0.7.0) - Server-side rendering support for Supabase Auth

### State Management

- **zustand** (^5.0.8) - Lightweight state management library for React
  - Used for: user store, event store, ticket store, registration store

### QR Code Generation

- **qrcode.react** (^4.2.0) - React component for generating QR codes
- **qrcode** (^1.5.4) - QR code generation library
- **react-qr-code** (^2.0.18) - Alternative QR code component

### Payment Processing (Mock)

- **stripe** (^19.1.0) - Payment processing (currently used for mock payments)
- **@stripe/stripe-js** (^8.2.0) - Stripe JavaScript SDK

### Styling

- **tailwindcss** (^4) - Utility-first CSS framework for minimal styling
- **@tailwindcss/postcss** (^4) - PostCSS integration for Tailwind

### Development Tools

- **eslint** (^9) - Code linting for consistent code quality
- **eslint-config-next** (16.0.0) - Next.js specific ESLint rules
- **@types/node**, **@types/react**, **@types/react-dom** - TypeScript type definitions

## Project Structure

```
gdc_mockup/
├── src/app/                    # Next.js app directory
│   ├── components/             # Shared React components
│   │   ├── Navbar.tsx
│   │   ├── EventCard.tsx
│   │   ├── TicketCard.tsx
│   │   └── RegistrationCard.tsx
│   ├── api/                    # API routes
│   │   ├── admin/              # Admin operations
│   │   └── user/               # User operations
│   ├── dashboard/              # Dashboard page
│   ├── events/                 # Event pages
│   ├── my-tickets/             # User tickets page
│   ├── my-registrations/       # User registrations page
│   ├── profile/                # User profile page
│   ├── admin/                  # Admin pages
│   │   ├── events/
│   │   ├── analytics/
│   │   └── users/
│   ├── login/                  # Authentication pages
│   └── signup/
├── lib/                        # Business logic
│   ├── models/                 # Domain models
│   │   ├── event/
│   │   └── user/
│   ├── services/               # Data access layer
│   └── stores/                 # Zustand state stores
├── utils/                      # Utilities
│   └── supabase/               # Supabase clients
└── middleware.ts               # Authentication middleware
```

## Database Setup

The database is hosted remotely on Supabase and is already configured. **You do not need to set up a local database.**

### Database Schema

The complete database schema is available in `supabase/schema.sql`. This file contains:

- Table definitions
- Indexes for performance optimization
- Row Level Security (RLS) policies
- Triggers and functions
- Realtime subscriptions

### Main Tables

| Table           | Description                        | Key Fields                                                                   |
| --------------- | ---------------------------------- | ---------------------------------------------------------------------------- |
| `user_profiles` | User account information and roles | `id`, `name`, `email`, `role`                                                |
| `events`        | Event details and metadata         | `id`, `title`, `description`, `start_time`, `end_time`, `event_organizer_id` |
| `registrations` | Links attendees to events          | `id`, `event_id`, `attendee_id`, `ticket_type`, `status`, `ticket_id`        |
| `tickets`       | Digital tickets with QR codes      | `id`, `event_id`, `attendee_id`, `qr_code`, `is_checked_in`, `price`         |
| `payments`      | Payment records (mock for demo)    | `id`, `amount`, `status`, `attendee_id`, `event_id`                          |
| `analytics`     | Event-level analytics data         | `event_id`, `total_tickets_sold`, `total_revenue`, `attendance_rate`         |

### Recreating the Database (Optional)

If you need to set up your own Supabase instance:

1. Create a new project at [supabase.com](https://supabase.com)
2. Navigate to the SQL Editor in your Supabase dashboard
3. Copy the contents of `supabase/schema.sql`
4. Paste and run the SQL in the editor
5. Verify all tables were created successfully
6. Update your `.env.local` with the new project's API keys

### Row Level Security (RLS)

The database uses RLS policies to ensure data security:

- **Users** can view all profiles but only update their own
- **Events** are publicly viewable; organizers can create/update their own events
- **Tickets** are only visible to the ticket owner and event organizer
- **Registrations** are private to the attendee and event organizer
- **Admin role** has elevated permissions for user management

### Database Relationships

```
user_profiles --- events [as organizer] (1 - to - Many)
user_profiles --- registrations [as attendee] (1 - to - Many)
user_profiles --- tickets [as attendee] (1 - to - Many)
events --- registrations (1 -to - Many)
events --- tickets (1 - to - Many)
events --- analytics (1 - to - 1)
registrations --- tickets (Many - to - 1)
```

## Routes & Authentication

### Public Routes (No Authentication Required)

| Route     | Description                            |
| --------- | -------------------------------------- |
| `/`       | Landing page with signup/login buttons |
| `/signup` | User registration page                 |
| `/login`  | User authentication page               |

### Protected Routes (Authentication Required)

All routes below require user authentication. Middleware (`middleware.ts`) checks for valid session and redirects to `/login` if not authenticated.

#### General User Routes

| Route               | Access Level            | Description                                  |
| ------------------- | ----------------------- | -------------------------------------------- |
| `/dashboard`        | All authenticated users | Main dashboard with role-based navigation    |
| `/events`           | All users               | Browse all available events                  |
| `/events/[id]`      | All users               | View event details and register              |
| `/my-registrations` | Attendees               | View user's event registrations              |
| `/my-tickets`       | Attendees               | View and manage user's tickets with QR codes |
| `/profile`          | All users               | Update profile, delete account               |

#### Organizer Routes

| Route           | Access Level       | Description                    |
| --------------- | ------------------ | ------------------------------ |
| `/create-event` | Organizers, Admins | Create new events              |
| `/my-events`    | Organizers, Admins | View and manage created events |

#### Administrator Routes

| Route              | Access Level        | Description                       |
| ------------------ | ------------------- | --------------------------------- |
| `/admin/users`     | Administrators only | Manage all users, delete accounts |
| `/admin/events`    | Administrators only | View and manage all events        |
| `/admin/analytics` | Administrators only | System-wide analytics dashboard   |

### API Routes

All API routes are server-side and include authentication/authorization checks.

| Endpoint                   | Method | Auth Required      | Description                                             |
| -------------------------- | ------ | ------------------ | ------------------------------------------------------- |
| `/api/admin/delete-user`   | DELETE | Admin only         | Delete user from both `user_profiles` and Supabase Auth |
| `/api/user/delete-account` | DELETE | Authenticated user | Delete own account (profile + auth)                     |

### Authentication Flow

1. **Signup** (`/signup`):

   - User provides name, email, password, and role
   - Creates Supabase Auth user
   - Creates corresponding `user_profiles` entry
   - Redirects to `/dashboard`

2. **Login** (`/login`):

   - User provides email and password
   - Supabase Auth validates credentials
   - Session cookie is set
   - Redirects to `/dashboard`

3. **Session Management**:

   - Middleware refreshes session on each request
   - Uses Supabase SSR for server-side session handling
   - Client-side: Zustand stores manage user state

4. **Authorization**:
   - Role-based checks in page components
   - Redirect to `/dashboard` if insufficient permissions
   - RLS policies enforce database-level security

### Middleware Configuration

The middleware (`middleware.ts`) runs on all routes except:

- Static files (`_next/static`)
- Images (`_next/image`, `*.svg`, `*.png`, etc.)
- `favicon.ico`

It performs:

- Session validation and refresh
- Cookie management for authentication
- Automatic redirection for expired sessions

## Testing

The application includes unit tests for core functionality. Tests are located in the `__tests__/` directory.

### Test 1: Authentication & Role-Based Access Control

**File**: `__tests__/auth.test.ts`

**Purpose**: Verify user registration validation and role-based permissions

**Test Cases**:

1. **Registration Validation**

   - Tests that email field is required
   - Tests that email format must be valid
   - Tests that valid user data passes validation

2. **Role-Based Permissions**
   - Attendees: Can browse events, cannot create events or delete users
   - Organizers: Can browse and create events, cannot delete users
   - Administrators: Full access to all features including user deletion

**Expected Results**:

```typescript
// Attendee permissions
expect(canBrowseEvents(attendee)).toBe(true);
expect(canCreateEvent(attendee)).toBe(false);
expect(canDeleteUsers(attendee)).toBe(false);

// Organizer permissions
expect(canBrowseEvents(organizer)).toBe(true);
expect(canCreateEvent(organizer)).toBe(true);
expect(canDeleteUsers(organizer)).toBe(false);

// Admin permissions
expect(canBrowseEvents(admin)).toBe(true);
expect(canCreateEvent(admin)).toBe(true);
expect(canDeleteUsers(admin)).toBe(true);
```

### Test 2: Ticket Management & QR Code Generation

**File**: `__tests__/ticket.test.ts`

**Purpose**: Verify ticket creation, unique QR code generation, and check-in process

**Test Cases**:

1. **QR Code Generation**

   - Each ticket receives a unique QR code
   - QR code contains the ticket ID
   - QR code format is consistent (prefix: `QR-`)

2. **Check-In Process**

   - Initial ticket state: `isCheckedIn = false`
   - First check-in: succeeds, sets timestamp
   - Second check-in: fails with error "Ticket already checked in"

3. **Ticket Pricing**
   - All Access tickets: $50.00 (5000 cents)
   - Core tickets: $15.00 (1500 cents)
   - Exhibitor tickets: $25.00 (2500 cents)
   - Speaker tickets: $30.00 (3000 cents)
   - Vendor tickets: $20.00 (2000 cents)
   - Event Organizer tickets: $75.00 (7500 cents)
   - Administrator tickets: $100.00 (10000 cents)

**Expected Results**:

```typescript
// QR code uniqueness
expect(ticket1.qrCode).not.toBe(ticket2.qrCode);
expect(ticket1.qrCode).toContain(ticket1.id);

// Check-in validation
expect(firstCheckIn.success).toBe(true);
expect(firstCheckIn.ticket?.isCheckedIn).toBe(true);
expect(secondCheckIn.success).toBe(false);
expect(secondCheckIn.error).toBe("Ticket already checked in");

// Pricing validation
expect(allAccessTicket.price).toBe(5000);
expect(coreTicket.price).toBe(1500);
expect(exhibitorTicket.price).toBe(2500);
expect(speakerTicket.price).toBe(3000);
expect(vendorTicket.price).toBe(2000);
expect(eventOrganizerTicket.price).toBe(7500);
expect(administratorTicket.price).toBe(10000);
```

### Running Tests

To run the tests (when test framework is configured):

```bash
npm test                 # Run all tests
npm test auth.test       # Run authentication tests only
npm test ticket.test     # Run ticket tests only
```

**Note**: The test files are currently set up with mock data and test logic. To run them, you would need to install and configure Jest or Vitest:

```bash
npm install --save-dev jest @types/jest ts-jest
```
