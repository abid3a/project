import { User } from '@/types';
import { fetchUserByEmail, fetchUsers } from './dataService';
import { supabase } from './supabaseClient';

function generateRandomId(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

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
      id: generateRandomId(),
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

  async updateUserRole(userId: string, newRole: 'Admin' | 'User'): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId);
    if (error) throw error;
  }

  async updateUserInfo(userId: string, updates: { firstName: string; lastName: string; companyName: string; companyUID: string; cohort: string; role: 'Admin' | 'User'; }): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({
        first_name: updates.firstName,
        last_name: updates.lastName,
        company_name: updates.companyName,
        company_uid: updates.companyUID,
        cohort: updates.cohort,
        role: updates.role,
      })
      .eq('id', userId);
    if (error) throw error;
  }

  async deleteUser(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    if (error) throw error;
  }
}

export const authService = new AuthService();