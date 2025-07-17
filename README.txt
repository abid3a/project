TBDC Horizon Mobile App
========================

## Overview
A cross-platform mobile app built with Expo Router featuring authentication, role-based access, and comprehensive business networking functionality.

## Component Structure

### Authentication
- `/app/(auth)/` - Authentication screens
  - `login.tsx` - Login form
  - `signup.tsx` - Registration form
  - `_layout.tsx` - Auth stack layout

### Main App
- `/app/(tabs)/` - Main tabbed interface
  - `sessions.tsx` - Sessions list and details
  - `meetings.tsx` - Meetings list and details  
  - `connections.tsx` - Connections list and details
  - `reports.tsx` - Reports list
  - `favorites.tsx` - Favorited items
  - `profile.tsx` - User profile
  - `admin.tsx` - Admin-only user management

### Components
- `/components/` - Reusable UI components
  - `SessionCard.tsx` - Session display card
  - `MeetingCard.tsx` - Meeting display card
  - `ConnectionCard.tsx` - Connection profile card
  - `FilterBar.tsx` - Dynamic filter component
  - `AuthForm.tsx` - Reusable form component

### Data & Services
- `/services/` - Mock data and authentication
  - `mockData.ts` - All mock data definitions
  - `authService.ts` - Authentication logic
  - `dataService.ts` - Data filtering and CRUD operations

### Types
- `/types/` - TypeScript definitions
  - `index.ts` - All app type definitions

## Navigation Flow
1. App starts with authentication check
2. Unauthenticated users see login/signup
3. Authenticated users enter main tabbed interface
4. Role-based access controls admin features
5. Deep linking between list views and detail screens

## Mock Data Location
All mock data is stored in `/services/mockData.ts` including:
- Pre-seeded admin user (abid@tbdc.com)
- Sample ACME company data
- 3 sessions, 3 meetings, 4 connections, 2 reports, 2 notes, 1 favorite

## Key Features
- Role-based UI (Admin vs User)
- Company_UID filtering for users
- Dynamic filter generation from data types
- In-memory data persistence during session
- Responsive card-based layouts
- Cross-platform compatibility

## Color Palette
Based on TBDC branding with professional blue/orange theme.