# Database Schema

## Overview

The TBDC Horizon app uses Supabase (PostgreSQL) as its backend database with a well-structured schema designed for business networking and event management.

## Database Tables

### 1. **users** Table

**Purpose**: Stores user authentication and profile information

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  company_uid VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'User' CHECK (role IN ('Admin', 'User')),
  profile_image VARCHAR(500),
  linkedin_url VARCHAR(500),
  cohort VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields**:
- `id`: Unique identifier (UUID)
- `first_name`: User's first name
- `last_name`: User's last name
- `email`: Unique email address
- `password`: Hashed password
- `company_name`: User's company name
- `company_uid`: Company identifier for data isolation
- `role`: User role (Admin/User)
- `profile_image`: URL to profile image
- `linkedin_url`: LinkedIn profile URL
- `cohort`: User's cohort/group
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

**Indexes**:
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_uid ON users(company_uid);
CREATE INDEX idx_users_role ON users(role);
```

### 2. **sessions** Table

**Purpose**: Stores mentorship and training sessions

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  type VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  company_uid VARCHAR(255) NOT NULL,
  cohort VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields**:
- `id`: Unique identifier (UUID)
- `name`: Session name/title
- `date`: Session date and time
- `duration`: Duration in minutes
- `type`: Session type (Workshop, Seminar, etc.)
- `location`: Session location
- `description`: Session description
- `company_uid`: Company identifier
- `cohort`: Associated cohort
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Indexes**:
```sql
CREATE INDEX idx_sessions_company_uid ON sessions(company_uid);
CREATE INDEX idx_sessions_cohort ON sessions(cohort);
CREATE INDEX idx_sessions_date ON sessions(date);
CREATE INDEX idx_sessions_type ON sessions(type);
```

### 3. **meetings** Table

**Purpose**: Stores business meetings and appointments

```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  type VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  company_uid VARCHAR(255) NOT NULL,
  organizer_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields**:
- `id`: Unique identifier (UUID)
- `title`: Meeting title
- `date`: Meeting date and time
- `duration`: Duration in minutes
- `type`: Meeting type
- `location`: Meeting location
- `description`: Meeting description
- `company_uid`: Company identifier
- `organizer_id`: Meeting organizer (FK to users)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Indexes**:
```sql
CREATE INDEX idx_meetings_company_uid ON meetings(company_uid);
CREATE INDEX idx_meetings_organizer_id ON meetings(organizer_id);
CREATE INDEX idx_meetings_date ON meetings(date);
```

### 4. **connections** Table

**Purpose**: Stores business connections and contacts

```sql
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  bio TEXT,
  profile_image VARCHAR(500),
  company_uid VARCHAR(255) NOT NULL,
  linkedin_url VARCHAR(500),
  linked_session_ids UUID[],
  linked_meeting_ids UUID[],
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields**:
- `id`: Unique identifier (UUID)
- `first_name`: Connection's first name
- `last_name`: Connection's last name
- `role`: Connection's role/title
- `type`: Connection type
- `organization`: Connection's organization
- `bio`: Connection's bio/description
- `profile_image`: Profile image URL
- `company_uid`: Company identifier
- `linkedin_url`: LinkedIn profile URL
- `linked_session_ids`: Array of linked session IDs
- `linked_meeting_ids`: Array of linked meeting IDs
- `is_favorite`: Favorite status
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Indexes**:
```sql
CREATE INDEX idx_connections_company_uid ON connections(company_uid);
CREATE INDEX idx_connections_type ON connections(type);
CREATE INDEX idx_connections_is_favorite ON connections(is_favorite);
```

### 5. **notes** Table

**Purpose**: Stores notes about connections

```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,
  topic VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  company_uid VARCHAR(255) NOT NULL,
  deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields**:
- `id`: Unique identifier (UUID)
- `connection_id`: Associated connection (FK)
- `topic`: Note topic/title
- `content`: Note content
- `company_uid`: Company identifier
- `deleted`: Soft delete flag
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Indexes**:
```sql
CREATE INDEX idx_notes_connection_id ON notes(connection_id);
CREATE INDEX idx_notes_company_uid ON notes(company_uid);
CREATE INDEX idx_notes_deleted ON notes(deleted);
```

### 6. **reports** Table

**Purpose**: Stores business reports and documents

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  pdf_url VARCHAR(500) NOT NULL,
  company_uid VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields**:
- `id`: Unique identifier (UUID)
- `title`: Report title
- `type`: Report type
- `date`: Report date
- `pdf_url`: PDF file URL
- `company_uid`: Company identifier
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Indexes**:
```sql
CREATE INDEX idx_reports_company_uid ON reports(company_uid);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_date ON reports(date);
```

### 7. **favourites** Table

**Purpose**: Stores user favorites for connections

```sql
CREATE TABLE favourites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_uid VARCHAR(255) NOT NULL,
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_uid, connection_id)
);
```

**Fields**:
- `id`: Unique identifier (UUID)
- `company_uid`: Company identifier
- `connection_id`: Favorited connection (FK)
- `created_at`: Creation timestamp

**Indexes**:
```sql
CREATE INDEX idx_favourites_company_uid ON favourites(company_uid);
CREATE INDEX idx_favourites_connection_id ON favourites(connection_id);
```

### 8. **session_mentors** Table

**Purpose**: Links sessions to mentor connections

```sql
CREATE TABLE session_mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, connection_id)
);
```

**Fields**:
- `id`: Unique identifier (UUID)
- `session_id`: Session (FK)
- `connection_id`: Mentor connection (FK)
- `created_at`: Creation timestamp

**Indexes**:
```sql
CREATE INDEX idx_session_mentors_session_id ON session_mentors(session_id);
CREATE INDEX idx_session_mentors_connection_id ON session_mentors(connection_id);
```

### 9. **session_attendees** Table

**Purpose**: Links sessions to attendee connections

```sql
CREATE TABLE session_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, connection_id)
);
```

**Fields**:
- `id`: Unique identifier (UUID)
- `session_id`: Session (FK)
- `connection_id`: Attendee connection (FK)
- `created_at`: Creation timestamp

**Indexes**:
```sql
CREATE INDEX idx_session_attendees_session_id ON session_attendees(session_id);
CREATE INDEX idx_session_attendees_connection_id ON session_attendees(connection_id);
```

### 10. **meeting_attendees** Table

**Purpose**: Links meetings to attendee connections

```sql
CREATE TABLE meeting_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meeting_id, connection_id)
);
```

**Fields**:
- `id`: Unique identifier (UUID)
- `meeting_id`: Meeting (FK)
- `connection_id`: Attendee connection (FK)
- `created_at`: Creation timestamp

**Indexes**:
```sql
CREATE INDEX idx_meeting_attendees_meeting_id ON meeting_attendees(meeting_id);
CREATE INDEX idx_meeting_attendees_connection_id ON meeting_attendees(connection_id);
```

## Relationships

### Entity Relationship Diagram

```
users (1) ──── (1) meetings (organizer)
  │
  └─── (1) ──── (1) sessions (company_uid)
       │
       └─── (1) ──── (1) connections (company_uid)
            │
            ├─── (1) ──── (M) notes
            ├─── (1) ──── (M) favourites
            ├─── (M) ──── (M) sessions (via session_mentors)
            ├─── (M) ──── (M) sessions (via session_attendees)
            └─── (M) ──── (M) meetings (via meeting_attendees)
```

### Key Relationships

1. **Users → Meetings**: One-to-many (organizer)
2. **Users → Sessions**: One-to-many (company_uid)
3. **Users → Connections**: One-to-many (company_uid)
4. **Connections → Notes**: One-to-many
5. **Connections → Favourites**: One-to-many
6. **Sessions ↔ Connections**: Many-to-many (via session_mentors/session_attendees)
7. **Meetings ↔ Connections**: Many-to-many (via meeting_attendees)

## Row Level Security (RLS)

### Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Company-based access for business data
CREATE POLICY "Company access for sessions" ON sessions
  FOR ALL USING (company_uid = (SELECT company_uid FROM users WHERE id = auth.uid()::uuid));

CREATE POLICY "Company access for meetings" ON meetings
  FOR ALL USING (company_uid = (SELECT company_uid FROM users WHERE id = auth.uid()::uuid));

CREATE POLICY "Company access for connections" ON connections
  FOR ALL USING (company_uid = (SELECT company_uid FROM users WHERE id = auth.uid()::uuid));

-- Admin access for all data
CREATE POLICY "Admin access" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::uuid AND role = 'Admin'
    )
  );
```

## Data Types and Constraints

### Enums

```sql
-- User roles
CREATE TYPE user_role AS ENUM ('Admin', 'User');

-- Session types
CREATE TYPE session_type AS ENUM (
  'Workshop', 'Seminar', 'Lecture', 'Discussion', 'Training'
);

-- Meeting types
CREATE TYPE meeting_type AS ENUM (
  'Business', 'Networking', 'Mentorship', 'Presentation'
);

-- Connection types
CREATE TYPE connection_type AS ENUM (
  'Mentor', 'Colleague', 'Client', 'Partner', 'Investor'
);
```

### Constraints

```sql
-- Email validation
ALTER TABLE users ADD CONSTRAINT valid_email 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Duration validation
ALTER TABLE sessions ADD CONSTRAINT valid_duration 
  CHECK (duration > 0 AND duration <= 480); -- Max 8 hours

ALTER TABLE meetings ADD CONSTRAINT valid_duration 
  CHECK (duration > 0 AND duration <= 480);

-- Date validation
ALTER TABLE sessions ADD CONSTRAINT valid_session_date 
  CHECK (date >= NOW());

ALTER TABLE meetings ADD CONSTRAINT valid_meeting_date 
  CHECK (date >= NOW());
```

## Triggers and Functions

### Updated At Trigger

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Backup and Recovery

### Backup Strategy

```sql
-- Daily automated backups
-- Weekly full backups
-- Point-in-time recovery enabled
-- Cross-region replication for disaster recovery
```

### Data Retention

```sql
-- Soft delete for user data
-- 30-day retention for deleted records
-- Archive old sessions and meetings after 2 years
-- Permanent retention for reports and notes
``` 