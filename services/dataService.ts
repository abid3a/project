import { Session, Meeting, Connection, Note, Report } from '@/types';
import { mockSessions, mockMeetings, mockConnections, mockNotes, mockReports } from './mockData';
import { supabase } from './supabaseClient';

class DataService {
  private sessions: Session[] = [...mockSessions];
  private meetings: Meeting[] = [...mockMeetings];
  private connections: Connection[] = [...mockConnections];
  private notes: Note[] = [...mockNotes];
  private reports: Report[] = [...mockReports];

  // Sessions
  getSessions(companyUID?: string): Session[] {
    if (companyUID) {
      return this.sessions.filter(s => s.companyUID === companyUID);
    }
    return this.sessions;
  }

  getSessionById(id: string): Session | undefined {
    return this.sessions.find(s => s.id === id);
  }

  // Meetings
  getMeetings(companyUID?: string): Meeting[] {
    if (companyUID) {
      return this.meetings.filter(m => m.companyUID === companyUID);
    }
    return this.meetings;
  }

  getMeetingById(id: string): Meeting | undefined {
    return this.meetings.find(m => m.id === id);
  }

  // Connections
  getConnections(companyUID?: string): Connection[] {
    if (companyUID) {
      return this.connections.filter(c => c.companyUID === companyUID);
    }
    return this.connections;
  }

  getConnectionById(id: string): Connection | undefined {
    return this.connections.find(c => c.id === id);
  }

  toggleConnectionFavorite(id: string): void {
    const connection = this.connections.find(c => c.id === id);
    if (connection) {
      connection.isFavorite = !connection.isFavorite;
    }
  }

  // Notes
  getNotes(companyUID?: string): Note[] {
    if (companyUID) {
      return this.notes.filter(n => n.companyUID === companyUID);
    }
    return this.notes;
  }

  getNotesByConnectionId(connectionId: string): Note[] {
    return this.notes.filter(n => n.connectionId === connectionId);
  }

  addNote(note: Omit<Note, 'id' | 'createdAt'>): Note {
    const newNote: Note = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: new Date(),
    };
    this.notes.push(newNote);
    return newNote;
  }

  editNote(noteId: string, updates: Partial<Omit<Note, 'id' | 'connectionId' | 'companyUID' | 'createdAt'>>): Note | undefined {
    const note = this.notes.find(n => n.id === noteId);
    if (note) {
      if (updates.topic !== undefined) note.topic = updates.topic;
      if (updates.content !== undefined) note.content = updates.content;
      // Only topic and content are editable
    }
    return note;
  }

  deleteNote(noteId: string): boolean {
    const index = this.notes.findIndex(n => n.id === noteId);
    if (index !== -1) {
      this.notes.splice(index, 1);
      return true;
    }
    return false;
  }

  // Reports
  getReports(companyUID?: string): Report[] {
    if (companyUID) {
      return this.reports.filter(r => r.companyUID === companyUID);
    }
    return this.reports;
  }

  // Favorites
  getFavorites(companyUID?: string): Connection[] {
    return this.getConnections(companyUID).filter(c => c.isFavorite);
  }

  // Filter helpers
  getUniqueTypes(items: (Session | Meeting | Connection)[]): string[] {
    const types = items.map(item => item.type);
    return Array.from(new Set(types));
  }

  filterByType<T extends Session | Meeting | Connection>(items: T[], type: string): T[] {
    return items.filter(item => item.type === type);
  }
}

export const dataService = new DataService();

// Fetch all connections for a given company_uid from Supabase
export async function fetchConnections(companyUID: string) {
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .eq('company_uid', companyUID);
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
  return data;
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
  return data;
}

// Add a new note for a connection and company (id is now auto-generated)
export async function addNote({ topic, content, company_uid, connection_id }: { topic: string; content: string; company_uid: string; connection_id: string }) {
  const { data, error } = await supabase
    .from('notes')
    .insert([{ topic, content, company_uid, connection_id, deleted: false }])
    .select()
    .single();
  if (error) throw error;
  return data;
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
  return data;
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

// Fetch all sessions for a given company_uid from Supabase
export async function fetchSessions(companyUID: string) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('company_uid', companyUID);
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
function mapConnectionFromSupabase(row: any): Connection {
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
  return {
    id: row.id,
    name: row.name,
    date: row.date ? new Date(row.date) : new Date(),
    duration: row.duration,
    type: row.type,
    location: row.location,
    description: row.description,
    companyUID: row.company_uid,
    mentorIds: [], // Not used, but required by type
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