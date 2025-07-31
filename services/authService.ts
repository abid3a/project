/**
 * Authentication service for handling user authentication operations
 * Provides login, signup, logout, and user management functionality
 */

import { User } from '@/types';
import { fetchUserByEmail, fetchUsers } from './dataService';
import { supabase } from './supabaseClient';
import { generateRandomId } from '@/utils/helpers';
import { ERROR_MESSAGES } from '@/utils/constants';

/**
 * Maps a Supabase user object to the frontend User type
 * @param user - Supabase user object
 * @returns Mapped User object
 */
function mapUserFromSupabase(user: any): User {
  return {
    ...user,
    firstName: user.first_name,
    lastName: user.last_name,
    companyName: user.company_name,
    companyUID: user.company_uid,
    linkedinUrl: user.linkedin_url,
    createdAt: user.created_at,
    cohort: user.cohort,
  };
}

/**
 * Maps a frontend User object to Supabase format
 * @param userData - Frontend user data
 * @returns Supabase user object
 */
function mapUserToSupabase(userData: Omit<User, 'id' | 'createdAt'>): any {
  const supabaseUser = {
    id: generateRandomId(),
    ...userData,
    first_name: userData.firstName,
    last_name: userData.lastName,
    company_name: userData.companyName,
    company_uid: userData.companyUID,
    linkedin_url: userData.linkedinUrl,
    created_at: new Date().toISOString(),
    cohort: userData.cohort,
  };

  // Remove camelCase fields to avoid duplication
  delete (supabaseUser as any).firstName;
  delete (supabaseUser as any).lastName;
  delete (supabaseUser as any).companyName;
  delete (supabaseUser as any).companyUID;
  delete (supabaseUser as any).linkedinUrl;

  return supabaseUser;
}

class AuthService {
  private currentUser: User | null = null;

  /**
   * Authenticate a user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @returns User object if authentication successful, null otherwise
   */
  async login(email: string, password: string): Promise<User | null> {
    try {
      // Fetch user from Supabase
      const user = await fetchUserByEmail(email);
      
      if (user && user.password === password) {
        const mappedUser = mapUserFromSupabase(user);
        this.currentUser = mappedUser;
        return mappedUser;
      }
      
      return null;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(ERROR_MESSAGES.AUTH_ERROR);
    }
  }

  /**
   * Register a new user
   * @param userData - User registration data
   * @returns Newly created User object
   */
  async signup(userData: Omit<User, 'id' | 'createdAt'>): Promise<User | null> {
    try {
      // Check if email already exists
      const existing = await fetchUserByEmail(userData.email).catch(() => null);
      if (existing) {
        throw new Error(ERROR_MESSAGES.EMAIL_EXISTS);
      }

      const supabaseUser = mapUserToSupabase(userData);
      
      const { data, error } = await supabase
        .from('users')
        .insert([supabaseUser])
        .select()
        .single();

      if (error) {
        console.error('Signup database error:', error);
        throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
      }

      const mappedUser = mapUserFromSupabase(data);
      this.currentUser = mappedUser;
      return mappedUser;
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  }

  /**
   * Log out the current user
   */
  logout(): void {
    this.currentUser = null;
  }

  /**
   * Get the currently authenticated user
   * @returns Current user or null if not authenticated
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Fetch all users (admin only)
   * @returns Array of all users
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const users = await fetchUsers();
      return (users || []).map(mapUserFromSupabase);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  }

  /**
   * Update a user's role (admin only)
   * @param userId - User ID to update
   * @param newRole - New role to assign
   */
  async updateUserRole(userId: string, newRole: 'Admin' | 'User'): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
      }
    } catch (error) {
      console.error('Update user role error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  }

  /**
   * Update user information
   * @param userId - User ID to update
   * @param updates - User information updates
   */
  async updateUserInfo(
    userId: string,
    updates: {
      firstName: string;
      lastName: string;
      companyName: string;
      companyUID: string;
      cohort: string;
      role: 'Admin' | 'User';
    }
  ): Promise<void> {
    try {
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

      if (error) {
        console.error('Error updating user info:', error);
        throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
      }
    } catch (error) {
      console.error('Update user info error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  }

  /**
   * Delete a user (admin only)
   * @param userId - User ID to delete
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
      }
    } catch (error) {
      console.error('Delete user error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  }
}

// Export singleton instance
export const authService = new AuthService();