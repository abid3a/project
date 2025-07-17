import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, KeyboardAvoidingView, Modal, TouchableWithoutFeedback, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, User, Building, Calendar, Users, Plus, CreditCard as Edit, Trash2, Heart, MoveVertical as MoreVertical } from 'lucide-react-native';
import { SessionCard } from '@/components/SessionCard';
import { MeetingCard } from '@/components/MeetingCard';
import { useAuth } from '@/contexts/AuthContext';
import { useConnections } from '@/contexts/ConnectionsContext';
import { dataService, fetchNotesForConnection, addNote as addNoteSupabase, editNote as editNoteSupabase, deleteNote as deleteNoteSupabase, fetchMeetingsForConnection, fetchSessionsForConnection, fetchSessions } from '@/services/dataService';
import { supabase } from '@/services/supabaseClient';
import { Connection, Session, Meeting, Note } from '@/types';
import { StatusBar } from 'expo-status-bar';
import LinkedinWhiteIcon from '@/components/LinkedinWhiteIcon';
import { mapSessionFromSupabase } from '@/services/dataService';

export default function ConnectionDetailsScreen() {
  const router = useRouter();
  const { connectionId } = useLocalSearchParams<{ connectionId: string }>();
  const { user } = useAuth();
  const { connections, toggleFavorite } = useConnections();
  
  const [connection, setConnection] = useState<Connection | null>(null);
  const [linkedSessions, setLinkedSessions] = useState<Session[]>([]);
  const [linkedMeetings, setLinkedMeetings] = useState<Meeting[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [addNoteModalVisible, setAddNoteModalVisible] = useState(false);
  const [editNoteModalVisible, setEditNoteModalVisible] = useState(false);
  const [newNoteTopic, setNewNoteTopic] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editNoteTopic, setEditNoteTopic] = useState('');
  const [editNoteContent, setEditNoteContent] = useState('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (connectionId && user) {
      const foundConnection = connections.find(c => c.id === connectionId);
      if (foundConnection) {
        setConnection(foundConnection);
        
        // Load linked sessions from Supabase join table
        fetchSessionsForConnection(foundConnection.id)
          .then(async sessionIds => {
            if (!sessionIds.length) {
              setLinkedSessions([]);
              return;
            }
            // Fetch all sessions for these IDs from Supabase
            const allSessions = await fetchSessions(user.companyUID);
            const mapped = (allSessions || []).map(mapSessionFromSupabase);
            setLinkedSessions(mapped.filter((s: any) => sessionIds.includes(s.id)));
          })
          .catch(() => setLinkedSessions([]));
        
        // Load linked meetings from Supabase join table
        fetchMeetingsForConnection(foundConnection.id)
          .then(meetingIds => {
            // Fetch all meetings for these IDs from Supabase
            supabase
              .from('meetings')
              .select('*')
              .in('id', meetingIds)
              .then(({ data, error }) => {
                if (error) setLinkedMeetings([]);
                else setLinkedMeetings(data || []);
              });
          })
          .catch(() => setLinkedMeetings([]));
        
        // Load notes for this connection from Supabase
        fetchNotesForConnection(user.companyUID, foundConnection.id)
          .then(setNotes)
          .catch(() => setNotes([]));
      }
    }
  }, [connectionId, connections, user]);

  const handleToggleFavorite = () => {
    if (connection) {
      toggleFavorite(connection.id);
      setConnection({ ...connection, isFavorite: !connection.isFavorite });
    }
  };

  const handleSessionPress = (session: Session) => {
    router.push({
      pathname: '/session-details',
      params: { sessionId: session.id }
    });
  };

  const handleMeetingPress = (meeting: Meeting) => {
    router.push({
      pathname: '/meeting-details',
      params: { meetingId: meeting.id }
    });
  };

  const handleAddNote = async () => {
    if (!newNoteTopic.trim() || !newNoteContent.trim() || !connection || !user) return;
    try {
      const note = await addNoteSupabase({
        topic: newNoteTopic.trim(),
        content: newNoteContent.trim(),
        company_uid: user.companyUID,
        connection_id: connection.id,
      });
      setNotes([...notes, note]);
      setNewNoteTopic('');
      setNewNoteContent('');
      setAddNoteModalVisible(false);
      Alert.alert('Success', 'Note added successfully');
    } catch (e) {
      Alert.alert('Error', 'Failed to add note');
    }
  };

  const openEditNoteModal = (note: Note) => {
    setSelectedNote(note);
    setEditNoteTopic(note.topic);
    setEditNoteContent(note.content);
    setEditNoteModalVisible(true);
    setEditMode(true);
  };

  const handleEditNote = async () => {
    if (!selectedNote || !editNoteTopic.trim() || !editNoteContent.trim()) return;
    try {
      const updated = await editNoteSupabase(selectedNote.id, {
        topic: editNoteTopic.trim(),
        content: editNoteContent.trim(),
      });
      setNotes(notes.map(n => n.id === updated.id ? { ...n, topic: updated.topic, content: updated.content } : n));
      setEditNoteModalVisible(false);
      setSelectedNote(null);
      Alert.alert('Success', 'Note updated successfully');
    } catch (e) {
      Alert.alert('Error', 'Failed to update note');
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;
    try {
      await deleteNoteSupabase(selectedNote.id);
      setNotes(notes.filter(n => n.id !== selectedNote.id));
      setEditNoteModalVisible(false);
      setSelectedNote(null);
      Alert.alert('Deleted', 'Note deleted successfully');
    } catch (e) {
      Alert.alert('Error', 'Failed to delete note');
    }
  };

  if (!connection) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#fff' }]}> 
        <StatusBar style="dark" backgroundColor="#fff" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <X size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>Connection Not Found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#f5f7fa' }]}> 
      <StatusBar style="dark" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.title}>Connection Details</Text>
        <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
          <Heart
            size={28}
            color="#1976d2"
            fill={connection.isFavorite ? '#1976d2' : 'none'}
          />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, styles.cardFirst]}>
          <View style={{ position: 'relative' }}>
            {connection.linkedinUrl ? (
              <TouchableOpacity
                style={styles.linkedinButton}
                onPress={async () => {
                  const url = connection.linkedinUrl!;
                  try {
                    const supported = await Linking.canOpenURL('linkedin://');
                    if (supported) {
                      const username = url.replace('https://www.linkedin.com/in/', '').replace(/\/$/, '');
                      await Linking.openURL(`linkedin://in/${username}`);
                    } else {
                      await Linking.openURL(url);
                    }
                  } catch (e) {
                    await Linking.openURL(url);
                  }
                }}
                activeOpacity={0.7}
              >
                <LinkedinWhiteIcon size={32} />
              </TouchableOpacity>
            ) : null}
            <View style={styles.profileSection}>
              <View style={styles.avatar}>
                <User size={32} color="#666" />
              </View>
              <Text style={styles.connectionName}>
                {connection.firstName} {connection.lastName}
              </Text>
              <Text style={styles.connectionRoleCompany}>
                {connection.role} • {connection.organization}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <Text style={styles.bio}>{connection.bio}</Text>
        </View>
        {linkedSessions.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Sessions ({linkedSessions.length})
              </Text>
            </View>
            {linkedSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onPress={() => handleSessionPress(session)}
              />
            ))}
          </View>
        )}
        {linkedMeetings.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Meetings ({linkedMeetings.length})
              </Text>
            </View>
            {linkedMeetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onPress={() => handleMeetingPress(meeting)}
              />
            ))}
          </View>
        )}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notes ({notes.length})</Text>
            <TouchableOpacity style={styles.addNoteButton} onPress={() => setAddNoteModalVisible(true)}>
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          {notes.length === 0 && (
            <Text style={styles.emptyText}>No notes yet.</Text>
          )}
          {notes
            .slice()
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((note) => (
              <TouchableOpacity key={note.id} style={styles.noteCard} onPress={() => openEditNoteModal(note)}>
                <View style={styles.noteCardHeader}>
                  <Text style={styles.noteTopic}>{note.topic}</Text>
                  <Text style={styles.noteDate}>{note.created_at ? new Date(note.created_at).toLocaleDateString() : 'N/A'}</Text>
                </View>
                <Text style={styles.noteContent} numberOfLines={2}>{note.content}</Text>
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>

      {/* Add Note Modal */}
      <Modal
        visible={addNoteModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setAddNoteModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setAddNoteModalVisible(false)}>
          <View style={styles.popupOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ width: '100%', alignItems: 'center' }}
            >
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.popupCard}>
                  <Text style={styles.modalTitle}>Add Note</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Topic"
                    value={newNoteTopic}
                    onChangeText={setNewNoteTopic}
                    placeholderTextColor="#888"
                  />
                  <TextInput
                    style={[styles.input, { height: 80 }]}
                    placeholder="Content"
                    value={newNoteContent}
                    onChangeText={setNewNoteContent}
                    placeholderTextColor="#888"
                    multiline
                  />
                  <View style={styles.modalButtonRow}>
                    <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleAddNote} disabled={!newNoteTopic.trim() || !newNoteContent.trim()}>
                      <Text style={styles.buttonText}>SAVE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Edit Note Modal */}
      <Modal
        visible={editNoteModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setEditNoteModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setEditNoteModalVisible(false)}>
          <View style={styles.popupOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ width: '100%', alignItems: 'center' }}
            >
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.popupCard}>
                  <View style={styles.editModalHeader}>
                    <Text style={styles.modalTitle}>Note</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Topic"
                    value={editNoteTopic}
                    onChangeText={setEditNoteTopic}
                    placeholderTextColor="#888"
                    editable={editMode}
                  />
                  <TextInput
                    style={[styles.input, { height: 80 }]}
                    placeholder="Content"
                    value={editNoteContent}
                    onChangeText={setEditNoteContent}
                    placeholderTextColor="#888"
                    multiline
                    editable={editMode}
                  />
                  <View style={styles.modalButtonRow}>
                    <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteNote}>
                      <Text style={styles.buttonText}>DELETE</Text>
                    </TouchableOpacity>
                    {editMode ? (
                      <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={() => { handleEditNote(); setEditMode(false); }} disabled={!editNoteTopic.trim() || !editNoteContent.trim()}>
                        <Text style={styles.buttonText}>SAVE</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  favoriteText: {
    fontSize: 20,
  },
  favoriteButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20, // Add some padding at the bottom for the last card
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardFirst: {
    marginTop: 16, // Add some top margin for the first card
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 12, // Space between profile and bio
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  connectionName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  connectionRole: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  connectionRoleCompany: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  organizationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organization: {
    fontSize: 14,
    color: '#888',
    marginLeft: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  addNoteButton: {
    backgroundColor: '#1976d2',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginRight: 16,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 12,
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 0,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // match MeetingCard/SessionCard
  },
  noteTopic: {
    fontSize: 18, // match MeetingCard/SessionCard title
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#888',
  },
  noteContent: {
    fontSize: 14, // match MeetingCard/SessionCard description
    color: '#888',
    lineHeight: 20,
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editButton: {
    padding: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#1976d2',
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  linkedinButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'transparent',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  linkedinIconContainer: {
    width: 40, // Increased size for the icon
    height: 40, // Increased size for the icon
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0077b5', // LinkedIn blue background
    borderRadius: 20,
  },
  linkedinImage: {
    width: 36,
    height: 36,
    opacity: 1, // Ensure full opacity
  },
}); 