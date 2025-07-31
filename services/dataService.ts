/**
 * Data service for handling all database operations
 * Provides functions for fetching, creating, updating, and deleting data from Supabase
 */

import { Session, Meeting, Connection, Note, Report } from '@/types';
import { supabase } from './supabaseClient';
import { ERROR_MESSAGES } from '@/utils/constants';

// ============================================================================
// CONNECTION OPERATIONS
// ============================================================================

/**
 * Fetch all connections from Supabase
 * @returns Array of connections
 */
export async function fetchConnections(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('connections')
      .select('*');
    
    if (error) {
      console.error('Error fetching connections:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    return data || [];
  } catch (error) {
    console.error('Fetch connections error:', error);
    throw error;
  }
}

/**
 * Fetch all connections for admins (no company filter)
 * @returns Array of all connections
 */
export async function fetchAllConnections(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('connections')
      .select('*');
    
    if (error) {
      console.error('Error fetching all connections:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    return data || [];
  } catch (error) {
    console.error('Fetch all connections error:', error);
    throw error;
  }
}

/**
 * Fetch all favorite connection IDs for a company
 * @param companyUID - Company UID
 * @returns Array of favorite connection IDs
 */
export async function fetchFavoriteConnectionIds(companyUID: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('favourites')
      .select('connection_id')
      .eq('company_uid', companyUID);
    
    if (error) {
      console.error('Error fetching favorite connection IDs:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    return (data || []).map(row => row.connection_id);
  } catch (error) {
    console.error('Fetch favorite connection IDs error:', error);
    throw error;
  }
}

/**
 * Add a connection to favorites
 * @param companyUID - Company UID
 * @param connectionId - Connection ID to add to favorites
 */
export async function addFavorite(companyUID: string, connectionId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('favourites')
      .insert([{ company_uid: companyUID, connection_id: connectionId }]);
    
    if (error) {
      console.error('Error adding favorite:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  } catch (error) {
    console.error('Add favorite error:', error);
    throw error;
  }
}

/**
 * Remove a connection from favorites
 * @param companyUID - Company UID
 * @param connectionId - Connection ID to remove from favorites
 */
export async function removeFavorite(companyUID: string, connectionId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('favourites')
      .delete()
      .eq('company_uid', companyUID)
      .eq('connection_id', connectionId);
    
    if (error) {
      console.error('Error removing favorite:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  } catch (error) {
    console.error('Remove favorite error:', error);
    throw error;
  }
}

// ============================================================================
// USER OPERATIONS
// ============================================================================

/**
 * Fetch all users from Supabase
 * @returns Array of users
 */
export async function fetchUsers(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('Error fetching users:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    return data || [];
  } catch (error) {
    console.error('Fetch users error:', error);
    throw error;
  }
}

/**
 * Fetch a user by email from Supabase
 * @param email - User's email address
 * @returns User object or null if not found
 */
export async function fetchUserByEmail(email: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('Error fetching user by email:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    return data;
  } catch (error) {
    console.error('Fetch user by email error:', error);
    throw error;
  }
}

// ============================================================================
// SESSION OPERATIONS
// ============================================================================

/**
 * Fetch all sessions for a given cohort
 * @param cohort - Cohort name
 * @returns Array of sessions
 */
export async function fetchSessions(cohort: string): Promise<any[]> {
  try {
    const normalizedCohort = cohort.trim().toLowerCase();
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .ilike('cohort', normalizedCohort);
    
    if (error) {
      console.error('Error fetching sessions:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    return data || [];
  } catch (error) {
    console.error('Fetch sessions error:', error);
    throw error;
  }
}

/**
 * Fetch all sessions for admins (no cohort filter)
 * @returns Array of all sessions
 */
export async function fetchAllSessions(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*');
    
    if (error) {
      console.error('Error fetching all sessions:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    return data || [];
  } catch (error) {
    console.error('Fetch all sessions error:', error);
    throw error;
  }
}

/**
 * Fetch all session IDs for a given connection from session_mentors
 * @param connectionId - Connection ID
 * @returns Array of session IDs
 */
export async function fetchSessionsForConnection(connectionId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('session_mentors')
      .select('session_id')
      .eq('connection_id', connectionId);
    
    if (error) {
      console.error('Error fetching sessions for connection:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    return (data || []).map(row => row.session_id);
  } catch (error) {
    console.error('Fetch sessions for connection error:', error);
    throw error;
  }
}

/**
 * Fetch all mentor connection IDs for a given session
 * @param sessionId - Session ID
 * @returns Array of connection IDs
 */
export async function fetchSessionMentors(sessionId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('session_mentors')
      .select('connection_id')
      .eq('session_id', sessionId);
    
    if (error) {
      console.error('Error fetching session mentors:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    return (data || []).map(row => row.connection_id);
  } catch (error) {
    console.error('Fetch session mentors error:', error);
    throw error;
  }
}

/**
 * Fetch all session IDs for a given connection from session_attendees
 * @param connectionId - Connection ID
 * @returns Array of session IDs
 */
export async function fetchSessionsAttendingForConnection(connectionId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('session_mentors')
      .select('session_id')
      .eq('connection_id', connectionId);
    
    if (error) {
      console.error('Error fetching sessions attending for connection:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    return (data || []).map(row => row.session_id);
  } catch (error) {
    console.error('Fetch sessions attending for connection error:', error);
    throw error;
  }
}

// ============================================================================
// MEETING OPERATIONS
// ============================================================================

/**
 * Fetch all meetings for a given company
 * @param companyUID - Company UID
 * @returns Array of meetings
 */
export async function fetchMeetings(companyUID: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('company_uid', companyUID);
    
    if (error) {
      console.error('Error fetching meetings:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    return data || [];
  } catch (error) {
    console.error('Fetch meetings error:', error);
    throw error;
  }
}

/**
 * Fetch all meetings for admins (no company filter)
 * @returns Array of all meetings
 */
export async function fetchAllMeetings(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('*');
    
    if (error) {
      console.error('Error fetching all meetings:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    return data || [];
  } catch (error) {
    console.error('Fetch all meetings error:', error);
    throw error;
  }
}

/**
 * Fetch all connection IDs for a given meeting
 * @param meetingId - Meeting ID
 * @returns Array of connection IDs
 */
export async function fetchMeetingAttendees(meetingId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('meeting_attendees')
      .select('connection_id')
      .eq('meeting_id', meetingId);
    
    if (error) {
      console.error('Error fetching meeting attendees:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    return (data || []).map(row => row.connection_id);
  } catch (error) {
    console.error('Fetch meeting attendees error:', error);
    throw error;
  }
}

/**
 * Fetch all meeting IDs for a given connection
 * @param connectionId - Connection ID
 * @returns Array of meeting IDs
 */
export async function fetchMeetingsForConnection(connectionId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('meeting_attendees')
      .select('meeting_id')
      .eq('connection_id', connectionId);
    
    if (error) {
      console.error('Error fetching meetings for connection:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    return (data || []).map(row => row.meeting_id);
  } catch (error) {
    console.error('Fetch meetings for connection error:', error);
    throw error;
  }
}

// ============================================================================
// NOTE OPERATIONS
// ============================================================================

/**
 * Fetch all notes for a given company
 * @param companyUID - Company UID
 * @returns Array of notes
 */
export async function fetchNotes(companyUID: string): Promise<Note[]> {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('company_uid', companyUID);
    
    if (error) {
      console.error('Error fetching notes:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    return (data || []).map(mapNoteFromSupabase);
  } catch (error) {
    console.error('Fetch notes error:', error);
    throw error;
  }
}

/**
 * Fetch all notes for a given company and connection
 * @param companyUID - Company UID
 * @param connectionId - Connection ID
 * @returns Array of notes
 */
export async function fetchNotesForConnection(companyUID: string, connectionId: string): Promise<Note[]> {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('company_uid', companyUID)
      .eq('connection_id', connectionId);
    
    if (error) {
      console.error('Error fetching notes for connection:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    return (data || []).map(mapNoteFromSupabase);
  } catch (error) {
    console.error('Fetch notes for connection error:', error);
    throw error;
  }
}

/**
 * Add a new note for a connection and company
 * @param noteData - Note data
 * @returns Created note
 */
export async function addNote({
  topic,
  content,
  company_uid,
  connection_id,
}: {
  topic: string;
  content: string;
  company_uid: string;
  connection_id: string;
}): Promise<Note> {
  try {
    const { data, error } = await supabase
      .from('notes')
      .insert([{ topic, content, company_uid, connection_id, deleted: false }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding note:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    return mapNoteFromSupabase(data);
  } catch (error) {
    console.error('Add note error:', error);
    throw error;
  }
}

/**
 * Edit a note by ID
 * @param noteId - Note ID
 * @param updates - Note updates
 * @returns Updated note
 */
export async function editNote(noteId: string, updates: { topic?: string; content?: string }): Promise<Note> {
  try {
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', noteId)
      .select()
      .single();
    
    if (error) {
      console.error('Error editing note:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    return mapNoteFromSupabase(data);
  } catch (error) {
    console.error('Edit note error:', error);
    throw error;
  }
}

/**
 * Delete a note by ID (soft delete)
 * @param noteId - Note ID
 * @returns Deleted note
 */
export async function deleteNote(noteId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('notes')
      .update({ deleted: true })
      .eq('id', noteId)
      .select()
      .single();
    
    if (error) {
      console.error('Error deleting note:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    return data;
  } catch (error) {
    console.error('Delete note error:', error);
    throw error;
  }
}

// ============================================================================
// REPORT OPERATIONS
// ============================================================================

/**
 * Fetch all reports for a given company
 * @param companyUID - Company UID
 * @returns Array of reports
 */
export async function fetchReports(companyUID: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('company_uid', companyUID);
    
    if (error) {
      console.error('Error fetching reports:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    return data || [];
  } catch (error) {
    console.error('Fetch reports error:', error);
    throw error;
  }
}

/**
 * Add a new report for a company
 * @param report - Report data
 * @returns Created report
 */
export async function addReport(report: {
  title: string;
  type: string;
  date: string;
  pdf_url: string;
  company_uid: string;
}): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .insert([report])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding report:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    return data;
  } catch (error) {
    console.error('Add report error:', error);
    throw error;
  }
}

// ============================================================================
// COUNTING OPERATIONS
// ============================================================================

/**
 * Fetch the number of sessions for a given connection
 * @param connectionId - Connection ID
 * @returns Number of sessions
 */
export async function fetchSessionCountForConnection(connectionId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('session_mentors')
      .select('session_id', { count: 'exact', head: true })
      .eq('connection_id', connectionId);
    
    if (error) {
      console.error('Error fetching session count for connection:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    return count || 0;
  } catch (error) {
    console.error('Fetch session count for connection error:', error);
    throw error;
  }
}

/**
 * Fetch the number of meetings for a given connection
 * @param connectionId - Connection ID
 * @returns Number of meetings
 */
export async function fetchMeetingCountForConnection(connectionId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('meeting_attendees')
      .select('meeting_id', { count: 'exact', head: true })
      .eq('connection_id', connectionId);
    
    if (error) {
      console.error('Error fetching meeting count for connection:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    return count || 0;
  } catch (error) {
    console.error('Fetch meeting count for connection error:', error);
    throw error;
  }
}

/**
 * Fetch the number of sessions for a given connection and cohort
 * @param connectionId - Connection ID
 * @param cohort - Cohort name
 * @returns Number of sessions
 */
export async function fetchSessionCountForConnectionAndCohort(connectionId: string, cohort: string): Promise<number> {
  try {
    // 1. Fetch all sessions for the cohort
    const sessions = await fetchSessions(cohort);
    if (!sessions || sessions.length === 0) return 0;
    const cohortSessionIds = sessions.map((s: any) => String(s.id));

    // 2. Fetch all session IDs for the connection (as mentor)
    const connectionSessionIds = await fetchSessionsForConnection(connectionId);
    if (!connectionSessionIds || connectionSessionIds.length === 0) return 0;

    // 3. Count intersection
    const count = connectionSessionIds.filter((id: string) => cohortSessionIds.includes(String(id))).length;
    return count;
  } catch (error) {
    console.error('Fetch session count for connection and cohort error:', error);
    throw error;
  }
}

/**
 * Fetch the number of meetings for a given connection and company
 * @param connectionId - Connection ID
 * @param companyUID - Company UID
 * @returns Number of meetings
 */
export async function fetchMeetingCountForConnectionAndCompany(connectionId: string, companyUID: string): Promise<number> {
  try {
    // 1. Fetch all meetings for the company
    const meetings = await fetchMeetings(companyUID);
    if (!meetings || meetings.length === 0) return 0;
    const companyMeetingIds = meetings.map((m: any) => String(m.id));

    // 2. Fetch all meeting IDs for the connection (as attendee)
    const connectionMeetingIds = await fetchMeetingsForConnection(connectionId);
    if (!connectionMeetingIds || connectionMeetingIds.length === 0) return 0;

    // 3. Count intersection
    const count = connectionMeetingIds.filter((id: string) => companyMeetingIds.includes(String(id))).length;
    return count;
  } catch (error) {
    console.error('Fetch meeting count for connection and company error:', error);
    throw error;
  }
}

// ============================================================================
// MENTOR OPERATIONS
// ============================================================================

/**
 * Fetch connection details for a list of connection IDs
 * @param connectionIds - Array of connection IDs
 * @returns Array of connections
 */
export async function fetchMentorConnections(connectionIds: string[]): Promise<Connection[]> {
  try {
    if (!connectionIds.length) return [];
    
    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .in('id', connectionIds);
    
    if (error) {
      console.error('Error fetching mentor connections:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    return (data || []).map(mapConnectionFromSupabase);
  } catch (error) {
    console.error('Fetch mentor connections error:', error);
    throw error;
  }
}

// ============================================================================
// ADMIN UTILITY OPERATIONS
// ============================================================================

/**
 * Get unique cohorts from sessions for admin filtering
 * @returns Array of unique cohort names
 */
export async function getUniqueCohorts(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('cohort')
      .not('cohort', 'is', null);
    
    if (error) {
      console.error('Error fetching unique cohorts:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    const cohorts = [...new Set((data || []).map(row => row.cohort).filter(Boolean))];
    return cohorts.sort();
  } catch (error) {
    console.error('Get unique cohorts error:', error);
    throw error;
  }
}

/**
 * Get unique company UIDs from meetings for admin filtering
 * @returns Array of unique company UIDs
 */
export async function getUniqueCompanyUIDs(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('company_uid')
      .not('company_uid', 'is', null);
    
    if (error) {
      console.error('Error fetching unique company UIDs:', error);
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
    
    const companyUIDs = [...new Set((data || []).map(row => row.company_uid).filter(Boolean))];
    return companyUIDs.sort();
  } catch (error) {
    console.error('Get unique company UIDs error:', error);
    throw error;
  }
}

// ============================================================================
// MAPPING FUNCTIONS
// ============================================================================

/**
 * Helper to map Supabase connection row to Connection type
 * @param row - Supabase connection row
 * @returns Mapped Connection object
 */
export function mapConnectionFromSupabase(row: any): Connection {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    type: row.type,
    organization: row.organization,
    bio: row.bio,
    profileImage: row.profile_image,
    companyUID: row.company_uid,
    linkedSessionIds: row.linked_session_ids || [],
    linkedMeetingIds: row.linked_meeting_ids || [],
    isFavorite: row.is_favorite ?? false,
    linkedinUrl: row.linkedin_url,
  };
}

/**
 * Helper to map Supabase session row to Session type
 * @param row - Supabase session row
 * @returns Mapped Session object
 */
export function mapSessionFromSupabase(row: any): Session {
  // Parse duration: if string like '3:00', use the hours part as a number
  let duration = row.duration;
  if (typeof duration === 'string' && duration.includes(':')) {
    const [hours] = duration.split(':');
    duration = parseInt(hours, 10);
  }
  
  return {
    id: row.id,
    name: row.name,
    date: row.date ? new Date(row.date) : new Date(),
    duration,
    type: row.type,
    location: row.location,
    description: row.description,
    companyUID: row.company_uid,
    mentorIds: [], // Not used, but required by type
    cohort: row.cohort,
  };
}

/**
 * Helper to map Supabase note row to Note type
 * @param row - Supabase note row
 * @returns Mapped Note object
 */
export function mapNoteFromSupabase(row: any): Note {
  return {
    id: row.id,
    connectionId: row.connection_id,
    topic: row.topic,
    content: row.content,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    companyUID: row.company_uid,
    deleted: row.deleted,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get unique types from a list of items
 * @param items - Array of items with type property
 * @returns Array of unique types
 */
export function getUniqueTypes(items: { type: string }[]): string[] {
  const types = items.map(item => item.type);
  return Array.from(new Set(types));
}

/**
 * Filter items by type
 * @param items - Array of items with type property
 * @param type - Type to filter by
 * @returns Filtered array
 */
export function filterByType<T extends { type: string }>(items: T[], type: string): T[] {
  return items.filter(item => item.type === type);
}