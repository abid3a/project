import { Session, Meeting, Connection, Note, Report } from '@/types';
import { supabase } from './supabaseClient';

// Remove DataService and all mock data usage

// Fetch all connections from Supabase
export async function fetchConnections() {
  const { data, error } = await supabase
    .from('connections')
    .select('*');
  if (error) throw error;
  return data;
}

// Fetch all notes for a given company_uid from Supabase
export async function fetchNotes(companyUID: string) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('company_uid', companyUID);
  if (error) throw error;
  return (data || []).map(mapNoteFromSupabase);
}

// Fetch all meetings for a given company_uid from Supabase
export async function fetchMeetings(companyUID: string) {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('company_uid', companyUID);
  if (error) throw error;
  return data;
}

// Fetch all users from Supabase
export async function fetchUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  if (error) throw error;
  return data;
}

// Fetch a user by email from Supabase
export async function fetchUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  if (error) throw error;
  return data;
}

// Fetch all favorite connection IDs for a company_uid from Supabase
export async function fetchFavoriteConnectionIds(companyUID: string) {
  const { data, error } = await supabase
    .from('favourites')
    .select('connection_id')
    .eq('company_uid', companyUID);
  if (error) throw error;
  return (data || []).map(row => row.connection_id);
}

// Add a favorite (insert into favourites)
export async function addFavorite(companyUID: string, connectionId: string) {
  const { error } = await supabase
    .from('favourites')
    .insert([{ company_uid: companyUID, connection_id: connectionId }]);
  if (error) throw error;
}

// Remove a favorite (delete from favourites)
export async function removeFavorite(companyUID: string, connectionId: string) {
  const { error } = await supabase
    .from('favourites')
    .delete()
    .eq('company_uid', companyUID)
    .eq('connection_id', connectionId);
  if (error) throw error;
}

// Fetch all reports for a given company_uid from Supabase
export async function fetchReports(companyUID: string) {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('company_uid', companyUID);
  if (error) throw error;
  return data;
}

// Add a new report for a company
export async function addReport(report: { title: string; type: string; date: string; pdf_url: string; company_uid: string }) {
  const { data, error } = await supabase
    .from('reports')
    .insert([report])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Fetch all notes for a given company_uid and connection_id from Supabase
export async function fetchNotesForConnection(companyUID: string, connectionId: string) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('company_uid', companyUID)
    .eq('connection_id', connectionId);
  if (error) throw error;
  return (data || []).map(mapNoteFromSupabase);
}

// Add a new note for a connection and company (id is now auto-generated)
export async function addNote({ topic, content, company_uid, connection_id }: { topic: string; content: string; company_uid: string; connection_id: string }) {
  const { data, error } = await supabase
    .from('notes')
    .insert([{ topic, content, company_uid, connection_id, deleted: false }])
    .select()
    .single();
  if (error) throw error;
  return mapNoteFromSupabase(data);
}

// Edit a note by id
export async function editNote(noteId: string, updates: { topic?: string; content?: string }) {
  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', noteId)
    .select()
    .single();
  if (error) throw error;
  return mapNoteFromSupabase(data);
}

// Delete a note by id (soft delete: set deleted=true)
export async function deleteNote(noteId: string) {
  const { data, error } = await supabase
    .from('notes')
    .update({ deleted: true })
    .eq('id', noteId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Fetch all connection IDs for a given meeting from meeting_attendees
export async function fetchMeetingAttendees(meetingId: string) {
  const { data, error } = await supabase
    .from('meeting_attendees')
    .select('connection_id')
    .eq('meeting_id', meetingId);
  if (error) throw error;
  return (data || []).map(row => row.connection_id);
}

// Fetch all meeting IDs for a given connection from meeting_attendees
export async function fetchMeetingsForConnection(connectionId: string) {
  const { data, error } = await supabase
    .from('meeting_attendees')
    .select('meeting_id')
    .eq('connection_id', connectionId);
  if (error) throw error;
  return (data || []).map(row => row.meeting_id);
}

// Fetch all sessions for a given cohort from Supabase
export async function fetchSessions(cohort: string) {
  const normalizedCohort = cohort.trim().toLowerCase();
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .ilike('cohort', normalizedCohort);
  if (error) throw error;
  return data;
}

// Fetch all connection IDs for a given session from session_attendees
export async function fetchSessionAttendees(sessionId: string) {
  const { data, error } = await supabase
    .from('session_attendees')
    .select('connection_id')
    .eq('session_id', sessionId);
  if (error) throw error;
  return (data || []).map(row => row.connection_id);
}

// Fetch all session IDs for a given connection from session_attendees
export async function fetchSessionsAttendingForConnection(connectionId: string) {
  const { data, error } = await supabase
    .from('session_mentors')
    .select('session_id')
    .eq('connection_id', connectionId);
  if (error) throw error;
  return (data || []).map(row => row.session_id);
}

// Fetch all session IDs for a given connection from session_mentors
export async function fetchSessionsForConnection(connectionId: string) {
  const { data, error } = await supabase
    .from('session_mentors')
    .select('session_id')
    .eq('connection_id', connectionId);
  if (error) throw error;
  return (data || []).map(row => row.session_id);
}

// Fetch all mentor connection IDs for a given session from session_mentors
export async function fetchSessionMentors(sessionId: string) {
  const { data, error } = await supabase
    .from('session_mentors')
    .select('connection_id')
    .eq('session_id', sessionId);
  if (error) throw error;
  return (data || []).map(row => row.connection_id);
}

// Helper to map Supabase connection row to Connection type
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

// Helper to map Supabase session row to Session type
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
    cohort: row.cohort, // <-- Add this line
  };
}

// Helper to map Supabase note row to Note type
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

// Fetch connection details for a list of connection IDs
export async function fetchMentorConnections(connectionIds: string[]) {
  if (!connectionIds.length) return [];
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .in('id', connectionIds);
  if (error) throw error;
  return (data || []).map(mapConnectionFromSupabase);
}

// Fetch the number of sessions for a given connection from session_mentors
export async function fetchSessionCountForConnection(connectionId: string) {
  const { count, error } = await supabase
    .from('session_mentors')
    .select('session_id', { count: 'exact', head: true })
    .eq('connection_id', connectionId);
  if (error) throw error;
  return count || 0;
}

// Fetch the number of meetings for a given connection from meeting_attendees
export async function fetchMeetingCountForConnection(connectionId: string) {
  const { count, error } = await supabase
    .from('meeting_attendees')
    .select('meeting_id', { count: 'exact', head: true })
    .eq('connection_id', connectionId);
  if (error) throw error;
  return count || 0;
}

// Fetch the number of sessions for a given connection and cohort
export async function fetchSessionCountForConnectionAndCohort(connectionId: string, cohort: string) {
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
}

// Utility: Get unique types from a list of items
export function getUniqueTypes(items: { type: string }[]): string[] {
  const types = items.map(item => item.type);
  return Array.from(new Set(types));
}

// Utility: Filter items by type
export function filterByType<T extends { type: string }>(items: T[], type: string): T[] {
  return items.filter(item => item.type === type);
}

// Fetch all sessions for admins (no cohort filter)
export async function fetchAllSessions() {
  const { data, error } = await supabase
    .from('sessions')
    .select('*');
  if (error) throw error;
  return data;
}

// Fetch all meetings for admins (no company filter)
export async function fetchAllMeetings() {
  const { data, error } = await supabase
    .from('meetings')
    .select('*');
  if (error) throw error;
  return data;
}

// Fetch all connections for admins (no company filter)
export async function fetchAllConnections() {
  const { data, error } = await supabase
    .from('connections')
    .select('*');
  if (error) throw error;
  return data;
}

// Get unique cohorts from sessions for admin filtering
export async function getUniqueCohorts() {
  const { data, error } = await supabase
    .from('sessions')
    .select('cohort')
    .not('cohort', 'is', null);
  if (error) throw error;
  
  const cohorts = [...new Set((data || []).map(row => row.cohort).filter(Boolean))];
  return cohorts.sort();
}

// Get unique company UIDs from meetings for admin filtering
export async function getUniqueCompanyUIDs() {
  const { data, error } = await supabase
    .from('meetings')
    .select('company_uid')
    .not('company_uid', 'is', null);
  if (error) throw error;
  
  const companyUIDs = [...new Set((data || []).map(row => row.company_uid).filter(Boolean))];
  return companyUIDs.sort();
}