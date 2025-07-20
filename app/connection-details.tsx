import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, KeyboardAvoidingView, Modal, TouchableWithoutFeedback, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, User, Building, Calendar, Users, Plus, CreditCard as Edit, Trash2, Heart, MoveVertical as MoreVertical, ChevronDown, ChevronUp } from 'lucide-react-native';
import { SessionCard } from '@/components/SessionCard';
import { MeetingCard } from '@/components/MeetingCard';
import { useAuth } from '@/contexts/AuthContext';
import { useConnections } from '@/contexts/ConnectionsContext';
import { fetchNotesForConnection, addNote as addNoteSupabase, editNote as editNoteSupabase, deleteNote as deleteNoteSupabase, fetchMeetingsForConnection, fetchSessionsForConnection, fetchSessions, mapSessionFromSupabase, fetchSessionMentors, fetchMeetingAttendees, fetchSessionsAttendingForConnection } from '@/services/dataService';
import { supabase } from '@/services/supabaseClient';
import { Connection, Session, Meeting, Note } from '@/types';
import { StatusBar } from 'expo-status-bar';
import LinkedinWhiteIcon from '@/components/LinkedinWhiteIcon';
const linkedinLogo = require('@/assets/images/linkedin_logo.png');
const defaultAvatar = require('@/assets/images/icon.png');

// Map for local banner images (same as in ConnectionCard)
const bannerMap: Record<string, any> = {
  'banners/1.png': require('@/assets/images/banners/1.png'),
  'banners/2.png': require('@/assets/images/banners/2.png'),
  'banners/3.png': require('@/assets/images/banners/3.png'),
  'banners/4.png': require('@/assets/images/banners/4.png'),
  'banners/5.png': require('@/assets/images/banners/5.png'),
};

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
  const [bioExpanded, setBioExpanded] = useState(false);
  const [bioNeedsExpand, setBioNeedsExpand] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  useEffect(() => {
    if (connectionId && user) {
      const foundConnection = connections.find(c => c.id === connectionId);
      if (foundConnection) {
        setConnection(foundConnection);
        // --- SESSIONS: Fetch as mentor and attendee ---
        Promise.all([
          fetchSessionsForConnection(foundConnection.id), // mentor
          fetchSessionsAttendingForConnection(foundConnection.id) // attendee
        ]).then(async ([mentorSessionIds, attendeeSessionIds]) => {
          const allSessionIds = Array.from(new Set([...mentorSessionIds, ...attendeeSessionIds].map(String)));
          if (!allSessionIds.length || !user.cohort) {
            setLinkedSessions([]);
            return;
          }
          const normalizedCohort = user.cohort.trim().toLowerCase();
          const allSessions = await fetchSessions(normalizedCohort);
          const mapped = (allSessions || []).map(mapSessionFromSupabase);
          const filteredSessions = mapped.filter((s: any) => allSessionIds.includes(String(s.id)));
          // Fetch mentorIds for each session
          const sessionsWithMentors = await Promise.all(
            filteredSessions.map(async (session: any) => {
              const mentorIds = await fetchSessionMentors(session.id);
              return { ...session, mentorIds };
            })
          );
          setLinkedSessions(sessionsWithMentors);
        }).catch(() => setLinkedSessions([]));
        // --- MEETINGS: Only as attendee (no organizerId in Supabase) ---
        fetchMeetingsForConnection(foundConnection.id)
          .then(async (attendeeMeetingIds: string[]) => {
            const allMeetingIds = attendeeMeetingIds.map(String);
            if (!allMeetingIds.length) {
              setLinkedMeetings([]);
              return;
            }
            const { data, error } = await supabase
              .from('meetings')
              .select('*')
              .in('id', allMeetingIds);
            if (error || !data) {
              setLinkedMeetings([]);
              return;
            }
            const filteredMeetings = data.filter((m: any) => allMeetingIds.includes(String(m.id)));
            // Fetch attendeeIds for each meeting
            const meetingsWithAttendees = await Promise.all(
              filteredMeetings.map(async (meeting: any) => {
                const attendeeIds = await fetchMeetingAttendees(meeting.id);
                return { ...meeting, attendeeIds };
              })
            );
            setLinkedMeetings(meetingsWithAttendees);
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

  const handleImagePress = () => {
    setImageModalVisible(true);
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
        <StatusBar style="dark" />
        <View style={styles.header}>
                  <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#000" />
        </TouchableOpacity>
          <Text style={styles.title}>Connection Not Found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#f5f7fa' }]}> 
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#000" />
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
                style={styles.linkedinLogoButton}
                onPress={async () => {
                  const url = connection.linkedinUrl!;
                  try {
                    const supported = await Linking.canOpenURL('linkedin://');
                    if (supported) {
                      const username = url.replace('https://www.linkedin.com/in/', '').replace(/\/$/, '');
                      // Try to open in LinkedIn app
                      await Linking.openURL(`linkedin://in/${username}`);
                    } else {
                      // Open in external browser
                      await Linking.openURL(url);
                    }
                  } catch (e) {
                    // Fallback: open in external browser
                    await Linking.openURL(url);
                  }
                }}
                activeOpacity={0.7}
                accessibilityLabel="Open LinkedIn profile"
              >
                <Image source={linkedinLogo} style={styles.linkedinLogo} />
              </TouchableOpacity>
            ) : null}
            <View style={styles.profileSection}>
              <TouchableOpacity style={styles.avatarSquare} onPress={handleImagePress} activeOpacity={0.8}>
                {connection.profileImage ? (
                  typeof connection.profileImage === 'number' ? (
                    <Image source={connection.profileImage} style={{ width: 64, height: 64, borderRadius: 12 }} />
                  ) : bannerMap[connection.profileImage] ? (
                    <Image source={bannerMap[connection.profileImage]} style={{ width: 64, height: 64, borderRadius: 12 }} />
                  ) : (
                    <Image 
                      source={{ uri: connection.profileImage }} 
                      style={{ width: 64, height: 64, borderRadius: 12 }} 
                      defaultSource={defaultAvatar} 
                    />
                  )
                ) : (
                  <View style={styles.avatarFallbackSquare}>
                    <User size={32} color="#000" />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.connectionName}>
                {connection.firstName} {connection.lastName}
              </Text>
              {connection.role && connection.organization ? (
                <Text style={styles.connectionRoleCompany}>
                  {connection.role} | {connection.organization}
                </Text>
              ) : connection.role ? (
                <Text style={styles.connectionRoleCompany}>{connection.role}</Text>
              ) : connection.organization ? (
                <Text style={styles.connectionRoleCompany}>{connection.organization}</Text>
              ) : null}
              {connection.bio ? (
                <View style={{ alignItems: 'center', width: '100%', minHeight: 0 }}>
                  <Text
                    style={styles.bio}
                    numberOfLines={bioExpanded ? undefined : 2}
                    ellipsizeMode="tail"
                    onTextLayout={e => {
                      if (e.nativeEvent.lines.length > 2 && !bioNeedsExpand) setBioNeedsExpand(true);
                    }}
                  >
                    {connection.bio}
                  </Text>
                  {bioNeedsExpand && (
                    <TouchableOpacity onPress={() => setBioExpanded(exp => !exp)} style={{ marginTop: 2, marginBottom: 2 }}>
                      {bioExpanded ? (
                        <ChevronUp size={20} color="#1976d2" />
                      ) : (
                        <ChevronDown size={20} color="#1976d2" />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              ) : null}
            </View>
          </View>
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
            <Text style={styles.sectionTitle}>Notes ({notes.filter(note => note.deleted !== true && String(note.deleted).toLowerCase() !== 'true').length})</Text>
            <TouchableOpacity style={styles.addNoteButton} onPress={() => setAddNoteModalVisible(true)}>
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          {notes
            .filter(note => note.deleted !== true && String(note.deleted).toLowerCase() !== 'true')
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((note) => (
              <TouchableOpacity key={note.id} style={styles.noteCard} onPress={() => openEditNoteModal(note)}>
                <View style={styles.noteCardHeader}>
                  <Text style={styles.noteTopic}>{note.topic}</Text>
                  <Text style={styles.noteDate}>{note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'N/A'}</Text>
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
                    <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => {
                      Alert.alert(
                        'Delete Note',
                        'Are you sure you want to delete this note?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', style: 'destructive', onPress: handleDeleteNote },
                        ]
                      );
                    }}>
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

      {/* Full Screen Image Modal */}
      <Modal
        visible={imageModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setImageModalVisible(false)}>
          <View style={styles.imageModalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.imageModalContent}>
                {connection?.profileImage ? (
                  typeof connection.profileImage === 'number' ? (
                    <Image 
                      source={connection.profileImage} 
                      style={styles.fullScreenImage}
                      resizeMode="contain"
                    />
                  ) : bannerMap[connection.profileImage] ? (
                    <Image 
                      source={bannerMap[connection.profileImage]} 
                      style={styles.fullScreenImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Image 
                      source={{ uri: connection.profileImage }} 
                      style={styles.fullScreenImage}
                      resizeMode="contain"
                      defaultSource={defaultAvatar}
                    />
                  )
                ) : (
                  <View style={styles.fullScreenFallback}>
                    <User size={120} color="#000" />
                    <Text style={styles.fullScreenFallbackText}>No Image Available</Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.closeImageButton} 
                  onPress={() => setImageModalVisible(false)}
                >
                  <X size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
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
    paddingTop: 24, // Keep top padding for visual balance
    paddingBottom: 8, // Smaller bottom padding for compactness
    paddingLeft: 24, // Match left padding to right
    paddingRight: 24, // Match right padding to left
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
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSquare: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarFallbackSquare: {
    width: 64,
    height: 64,
    borderRadius: 12,
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
    paddingRight: 0,
    minHeight: 32,
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
    marginLeft: 'auto',
    marginRight: 0,
    alignSelf: 'center',
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
  linkedinLogoButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 2,
    padding: 4,
  },
  linkedinLogo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  fullScreenFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    padding: 40,
  },
  fullScreenFallbackText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  closeImageButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
}); 