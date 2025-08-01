# TBDC Horizon - React Native App (UI Branch)

A comprehensive React Native application built with Expo for managing connections, sessions, and meetings in a mentorship platform. 

## 🚀 Features

- **Authentication System**: Secure login and signup with role-based access
- **Connection Management**: View and manage professional connections with favorites
- **Session Tracking**: Monitor mentorship sessions and events
- **Meeting Management**: Schedule and track meetings with connections
- **Admin Dashboard**: Administrative tools for user and data management
- **Real-time Data**: Supabase integration for real-time data synchronization

## 🛠 Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom auth with Supabase
- **UI Components**: Custom components with Lucide React Native icons
- **State Management**: React Context API
- **TypeScript**: Full TypeScript support
- **Styling**: React Native StyleSheet

## 📁 Project Structure

```
project/
├── app/                    # Expo Router app directory
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry point
├── components/            # Reusable UI components
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── services/              # API and data services
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions and constants
├── assets/                # Images and static assets
└── documentation/         # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 📱 App Structure

### Authentication Flow
- **Login Screen**: Email/password authentication
- **Signup Screen**: New user registration
- **Role-based Access**: Admin and User roles

### Main Navigation (Tabs)
- **Home**: Dashboard with featured sessions and upcoming meetings
- **Connections**: Browse and manage professional connections
- **Sessions**: View and track mentorship sessions
- **Meetings**: Schedule and manage meetings
- **Profile**: User profile and settings

### Key Components

#### ConnectionCard
Displays connection information with:
- Profile image and name
- Role and organization
- Type indicator (Mentor, Customer, EIR, etc.)
- Session and meeting counts
- Favorite toggle functionality

#### SessionCard
Shows session details including:
- Session name and type
- Date, time, and duration
- Location information
- Mentor count
- Description preview

#### MeetingCard
Displays meeting information with:
- Meeting title and type
- Date, time, and duration
- Location and description
- Attendee information

## 🔧 Development Guidelines

### Code Organization

#### 1. File Naming
- Use PascalCase for components: `ConnectionCard.tsx`
- Use camelCase for utilities: `helpers.ts`
- Use kebab-case for routes: `connection-details.tsx`

#### 2. Component Structure
```typescript
/**
 * Component Description
 * Brief explanation of component purpose
 */

import React from 'react';
// ... other imports

interface ComponentProps {
  // Props interface
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Component logic
  return (
    // JSX
  );
}
```

#### 3. Helper Functions
- Place common utilities in `utils/helpers.ts`
- Use descriptive function names
- Add JSDoc comments for complex functions
- Export constants from `utils/constants.ts`

### State Management

#### Context Usage
```typescript
// Create context
const MyContext = createContext<MyContextType | undefined>(undefined);

// Provider component
export function MyProvider({ children }: { children: React.ReactNode }) {
  // State and logic
  return (
    <MyContext.Provider value={contextValue}>
      {children}
    </MyContext.Provider>
  );
}

// Custom hook
export function useMyContext() {
  const context = useContext(MyContext);
  if (context === undefined) {
    throw new Error('useMyContext must be used within a MyProvider');
  }
  return context;
}
```

### Error Handling

#### Service Layer
```typescript
export async function fetchData(): Promise<Data[]> {
  try {
    const { data, error } = await supabase.from('table').select('*');
    
    if (error) {
      console.error('Error fetching data:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    return data || [];
  } catch (error) {
    console.error('Fetch data error:', error);
    throw error;
  }
}
```

### Styling Guidelines

#### StyleSheet Organization
```typescript
const styles = StyleSheet.create({
  // Layout
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  
  // Typography
  title: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
  
  // Spacing
  section: { marginTop: 24 },
  
  // Interactive elements
  button: { padding: 16, borderRadius: 8, backgroundColor: '#1976d2' },
});
```

## 🗄 Database Schema

### Key Tables

#### users
- `id`: Primary key
- `first_name`, `last_name`: User names
- `email`, `password`: Authentication
- `company_name`, `company_uid`: Organization info
- `role`: Admin or User
- `cohort`: User cohort assignment

#### connections
- `id`: Primary key
- `first_name`, `last_name`: Connection names
- `role`, `organization`: Professional info
- `type`: Connection type (Mentor, Customer, etc.)
- `bio`: Description
- `linkedin_url`: Social profile

#### sessions
- `id`: Primary key
- `name`, `description`: Session details
- `date`, `duration`: Timing
- `type`, `location`: Session info
- `cohort`: Associated cohort

#### meetings
- `id`: Primary key
- `title`, `description`: Meeting details
- `date`, `duration`: Timing
- `type`, `location`: Meeting info
- `company_uid`: Associated company

## 🧪 Testing

### Running Tests
```bash
npm run test
```

### Linting
```bash
npm run lint
```

## 📦 Build & Deploy

### Web Build
```bash
npm run build:web
```

### Mobile Build
```bash
expo build:android
expo build:ios
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes following the coding guidelines
4. Add tests if applicable
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 🆘 Support

For support and questions:
- Check the documentation in `/documentation`
- Review existing issues
- Create a new issue with detailed information

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Authentication system
- Connection management
- Session and meeting tracking
- Admin dashboard
- Supabase integration
