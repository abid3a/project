export interface User {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  companyUID: string;
  email: string;
  password: string;
  profileImage?: string;
  role: 'Admin' | 'User';
  createdAt: Date;
  linkedinUrl?: string;
  cohort?: string;
}

export interface Session {
  id: string;
  name: string;
  date: Date;
  duration: number; // minutes
  type: string;
  location: string;
  description: string;
  companyUID: string;
  mentorIds: string[];
  cohort?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: Date;
  duration: number; // minutes
  type: string;
  location: string;
  description: string;
  companyUID: string;
  attendeeIds: string[];
  organizerId: string;
}

export interface Connection {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  type: string;
  organization: string;
  bio: string;
  profileImage?: string;
  companyUID: string;
  linkedSessionIds: string[];
  linkedMeetingIds: string[];
  isFavorite: boolean;
  linkedinUrl?: string;
}

export interface Note {
  id: string;
  connectionId: string;
  topic: string; // Added topic field
  content: string;
  createdAt: Date;
  companyUID: string;
  deleted?: boolean;
}

export interface Report {
  id: string;
  title: string;
  type: string;
  date: Date;
  pdfUrl: string;
  companyUID: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}