import { User } from '@/types';
import { fetchUserByEmail, fetchUsers } from './dataService';
import { supabase } from './supabaseClient';

class AuthService {
  private currentUser: User | null = null;

  async login(email: string, password: string): Promise<User | null> {
    // Fetch user from Supabase
    const user = await fetchUserByEmail(email);
    if (user && user.password === password) {
      // Map snake_case to camelCase
      const mapped = {
        ...user,
        firstName: user.first_name,
        lastName: user.last_name,
        companyName: user.company_name,
        companyUID: user.company_uid,
        linkedinUrl: user.linkedin_url,
        createdAt: user.created_at,
        cohort: user.cohort, // <-- Add this line
      };
      this.currentUser = mapped;
      return mapped;
    }
    return null;
  }

  async signup(userData: Omit<User, 'id' | 'createdAt'>): Promise<User | null> {
    // Check if email already exists
    const existing = await fetchUserByEmail(userData.email).catch(() => null);
    if (existing) {
      throw new Error('Email already exists');
    }
    const newUser = {
      ...userData,
      first_name: userData.firstName,
      last_name: userData.lastName,
      company_name: userData.companyName,
      company_uid: userData.companyUID,
      linkedin_url: userData.linkedinUrl,
      created_at: new Date().toISOString(),
      cohort: userData.cohort, // <-- Add this line
    };
    // Remove camelCase fields
    delete (newUser as any).firstName;
    delete (newUser as any).lastName;
    delete (newUser as any).companyName;
    delete (newUser as any).companyUID;
    delete (newUser as any).linkedinUrl;
    const { data, error } = await supabase.from('users').insert([newUser]).select().single();
    if (error) throw error;
    // Map snake_case to camelCase
    const mapped = {
      ...data,
      firstName: data.first_name,
      lastName: data.last_name,
      companyName: data.company_name,
      companyUID: data.company_uid,
      linkedinUrl: data.linkedin_url,
      createdAt: data.created_at,
      cohort: data.cohort, // <-- Add this line
    };
    this.currentUser = mapped;
    return mapped;
  }

  logout(): void {
    this.currentUser = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async getAllUsers(): Promise<User[]> {
    const users = await fetchUsers();
    return (users || []).map(user => ({
      ...user,
      firstName: user.first_name,
      lastName: user.last_name,
      companyName: user.company_name,
      companyUID: user.company_uid,
      linkedinUrl: user.linkedin_url,
      createdAt: user.created_at,
      cohort: user.cohort, // <-- Add this line
    }));
  }
}

export const authService = new AuthService();