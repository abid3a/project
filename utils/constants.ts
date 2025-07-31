/**
 * Application constants
 * Centralized location for all constants used throughout the app
 */

// Type colors for different connection and session types
export const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  // Connection types
  Mentor: { bg: '#c8e6c9', text: '#1b5e20' },
  Customer: { bg: '#fff9c4', text: '#f57c00' },
  EIR: { bg: '#bbdefb', text: '#0d47a1' },
  Meeting: { bg: '#e1bee7', text: '#6a1b9a' },
  Admin: { bg: '#ffccbc', text: '#bf360c' },
  
  // Session types
  Workshop: { bg: '#e8f4fd', text: '#1976d2' },
  Seminar: { bg: '#fff3e0', text: '#f57c00' },
  Lecture: { bg: '#f3e5f5', text: '#7b1fa2' },
  Discussion: { bg: '#e8f5e8', text: '#388e3c' },
  Training: { bg: '#fff8e1', text: '#f9a825' },
  
  // Default
  Default: { bg: '#eeeeee', text: '#424242' },
};

// Dynamic color palette for new types
export const DYNAMIC_COLORS = [
  { bg: '#e3f2fd', text: '#1565c0' }, // Light blue
  { bg: '#fce4ec', text: '#c2185b' }, // Light pink
  { bg: '#e0f2f1', text: '#00695c' }, // Light teal
  { bg: '#fff3e0', text: '#ef6c00' }, // Light orange
  { bg: '#f3e5f5', text: '#7b1fa2' }, // Light purple
  { bg: '#e8f5e8', text: '#2e7d32' }, // Light green
  { bg: '#fff8e1', text: '#f57f17' }, // Light amber
  { bg: '#fce4ec', text: '#ad1457' }, // Light rose
  { bg: '#e0f7fa', text: '#00838f' }, // Light cyan
  { bg: '#f1f8e9', text: '#558b2f' }, // Light lime
];

// Banner images mapping
export const BANNER_IMAGES = {
  'banners/1.png': require('@/assets/images/banners/1.png'),
  'banners/2.png': require('@/assets/images/banners/2.png'),
  'banners/3.png': require('@/assets/images/banners/3.png'),
  'banners/4.png': require('@/assets/images/banners/4.png'),
  'banners/5.png': require('@/assets/images/banners/5.png'),
};

// Default images
export const DEFAULT_IMAGES = {
  avatar: require('@/assets/images/icon.png'),
  favicon: require('@/assets/images/favicon.png'),
  logo: require('@/assets/images/horizon_logo.png'),
  linkedin: require('@/assets/images/linkedin.png'),
  linkedinLogo: require('@/assets/images/linkedin_logo.png'),
};

// User roles
export const USER_ROLES = {
  ADMIN: 'Admin',
  USER: 'User',
} as const;

// API endpoints (if needed for future use)
export const API_ENDPOINTS = {
  AUTH: '/auth',
  USERS: '/users',
  CONNECTIONS: '/connections',
  SESSIONS: '/sessions',
  MEETINGS: '/meetings',
  NOTES: '/notes',
  REPORTS: '/reports',
} as const;

// Navigation routes
export const ROUTES = {
  HOME: '/(tabs)/home',
  CONNECTIONS: '/(tabs)/connections',
  SESSIONS: '/(tabs)/sessions',
  MEETINGS: '/(tabs)/meetings',
  PROFILE: '/(tabs)/profile',
  LOGIN: '/(auth)/login',
  SIGNUP: '/(auth)/signup',
  CONNECTION_DETAILS: '/connection-details',
  SESSION_DETAILS: '/session-details',
  MEETING_DETAILS: '/meeting-details',
} as const;

// Storage keys (for AsyncStorage if needed)
export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_DATA: 'user_data',
  APP_SETTINGS: 'app_settings',
  CACHE_DATA: 'cache_data',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_ERROR: 'Authentication failed. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  EMAIL_EXISTS: 'Email already exists.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  SIGNUP_SUCCESS: 'Account created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  NOTE_SAVED: 'Note saved successfully!',
  FAVORITE_ADDED: 'Added to favorites!',
  FAVORITE_REMOVED: 'Removed from favorites!',
} as const;

// UI constants
export const UI = {
  BORDER_RADIUS: {
    SMALL: 8,
    MEDIUM: 12,
    LARGE: 16,
    PILL: 20,
  },
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
  },
  FONT_SIZES: {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
    XXXL: 28,
  },
  COLORS: {
    PRIMARY: '#1976d2',
    SECONDARY: '#424242',
    SUCCESS: '#4caf50',
    WARNING: '#ff9800',
    ERROR: '#f44336',
    INFO: '#2196f3',
    LIGHT_GRAY: '#f5f5f5',
    GRAY: '#9e9e9e',
    DARK_GRAY: '#424242',
    WHITE: '#ffffff',
    BLACK: '#000000',
  },
} as const;

// Animation durations
export const ANIMATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Cache settings
export const CACHE = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  LONG_TTL: 30 * 60 * 1000, // 30 minutes
  SHORT_TTL: 60 * 1000, // 1 minute
} as const; 