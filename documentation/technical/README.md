# TBDC Horizon Mobile App - Technical Documentation

## Overview
TBDC Horizon is a cross-platform mobile application built with Expo Router, React Native, and Supabase. The app provides business networking functionality with role-based access control, featuring sessions, meetings, connections, and administrative capabilities.

## Table of Contents
- [Architecture Overview](./architecture.md)
- [Technology Stack](./technology-stack.md)
- [Database Schema](./database-schema.md)
- [API Documentation](./api-documentation.md)
- [Authentication System](./authentication.md)
- [State Management](./state-management.md)
- [Navigation Structure](./navigation.md)
- [Component Architecture](./component-architecture.md)
- [Development Setup](./development-setup.md)
- [Deployment Guide](./deployment.md)
- [Testing Strategy](./testing.md)
- [Performance Optimization](./performance.md)
- [Security Considerations](./security.md)

## Quick Start
1. Install dependencies: `npm install`
2. Set up environment variables for Supabase
3. Run development server: `npm run dev`
4. Build for production: `npm run build:web`

## Key Technical Features
- **Cross-platform**: Built with Expo for iOS, Android, and Web
- **Type-safe**: Full TypeScript implementation
- **Real-time**: Supabase integration for real-time data
- **Role-based**: Admin and User role management
- **Responsive**: Adaptive UI for different screen sizes
- **Offline-capable**: Local state management with sync capabilities

## Project Structure
```
project/
├── app/                    # Expo Router app directory
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tabbed interface
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── contexts/              # React Context providers
├── services/              # API and data services
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
└── assets/                # Static assets
```

## Environment Variables
Required environment variables:
- `EXPO_PUBLIC_SUPABASE_URL`: Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key

## Demo Accounts
- **Admin**: abid@tbdc.com / admin123
- **User**: john@acme.com / user123 