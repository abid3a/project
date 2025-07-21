import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, Calendar, Clock, MapPin, Users } from 'lucide-react-native';
import { ConnectionCard } from '@/components/ConnectionCard';
import { useConnections } from '@/contexts/ConnectionsContext';
import { fetchSessions, fetchConnections, fetchSessionMentors, fetchMentorConnections, fetchSessionCountForConnection, fetchMeetingCountForConnection } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import { Session, Connection } from '@/types';
import { StatusBar } from 'expo-status-bar';

const predefinedTypeColors: Record<string, { bg: string; text: string }> = {
  Workshop: { bg: '#e8f4fd', text: '#1976d2' },
  Seminar: { bg: '#fff3e0', text: '#f57c00' },
  Lecture: { bg: '#f3e5f5', text: '#7b1fa2' },
  Discussion: { bg: '#e8f5e8', text: '#388e3c' },
  Training: { bg: '#fff8e1', text: '#f9a825' },
};

const defaultColor = { bg: '#eeeeee', text: '#424242' };

// Dynamic color palette for new types
const dynamicColors = [
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

// Cache for dynamically assigned colors
const dynamicTypeColors: Record<string, { bg: string; text: string }> = {};

function getTypeColor(type: string): { bg: string; text: string } {
  // Check predefined colors first
  if (predefinedTypeColors[type]) {
    return predefinedTypeColors[type];
  }
  
  // Check if we already assigned a color to this type
  if (dynamicTypeColors[type]) {
    return dynamicTypeColors[type];
  }
  
  // Assign a new color from the dynamic palette
  const colorIndex = Object.keys(dynamicTypeColors).length % dynamicColors.length;
  const newColor = dynamicColors[colorIndex];
  dynamicTypeColors[type] = newColor;
  
  return newColor;
}

export default function SessionDetailsScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { connections, toggleFavorite } = useConnections();
  const { user } = useAuth();
  
  const [session, setSession] = useState<Session | null>(null);
  const [mentors, setMentors] = useState<Connection[]>([]);
  const [mentorCounts, setMentorCounts] = useState<Record<string, { sessions: number; meetings: number }>>({});

  useEffect(() => {
    const loadSessionAndMentors = async () => {
      if (!sessionId || !user || !user.cohort) return;
      try {
        const normalizedCohort = user.cohort.trim().toLowerCase();
        const sessions = await fetchSessions(normalizedCohort);
        const foundSession = (sessions || []).find((s: any) => s.id === sessionId);
        if (foundSession) {
          const mappedSession = {
            ...foundSession,
            id: foundSession.id,
            name: foundSession.name,
            date: foundSession.date ? new Date(foundSession.date) : new Date(),
            duration: foundSession.duration,
            type: foundSession.type,
            location: foundSession.location,
            description: foundSession.description,
            companyUID: foundSession.company_uid,
            cohort: foundSession.cohort, // <-- Add this line
          };
          setSession(mappedSession);
          // Fetch mentor IDs from join table, then fetch mentor details
          const mentorIds = await fetchSessionMentors(foundSession.id);
          const mentorConnections = await fetchMentorConnections(mentorIds);
          setMentors(mentorConnections || []);
        } else {
          setSession(null);
          setMentors([]);
        }
      } catch (e) {
        setSession(null);
        setMentors([]);
      }
    };
    loadSessionAndMentors();
  }, [sessionId, user]);

  useEffect(() => {
    // Fetch session and meeting counts for mentors
    async function fetchCounts() {
      const counts: Record<string, { sessions: number; meetings: number }> = {};
      await Promise.all(mentors.map(async (conn) => {
        const [sessions, meetings] = await Promise.all([
          fetchSessionCountForConnection(conn.id),
          fetchMeetingCountForConnection(conn.id),
        ]);
        counts[conn.id] = { sessions, meetings };
      }));
      setMentorCounts(counts);
    }
    if (mentors.length > 0) {
      fetchCounts();
    } else {
      setMentorCounts({});
    }
  }, [mentors]);

  const handleConnectionPress = (connection: Connection) => {
    router.push({
      pathname: '/connection-details',
      params: { connectionId: connection.id }
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Add a helper to format duration
  function formatDuration(duration: number | string): string {
    if (typeof duration === 'number') {
      if (duration >= 1) {
        return `${duration} hour${duration !== 1 ? 's' : ''}`;
      } else if (duration > 0) {
        return `${Math.round(duration * 60)} min`;
      } else {
        return '0 min';
      }
    } else if (typeof duration === 'string') {
      const [hours, minutes] = duration.split(':').map(Number);
      if (hours && hours > 0 && (!minutes || minutes === 0)) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
      } else if (hours && hours > 0 && minutes && minutes > 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} min`;
      } else if ((!hours || hours === 0) && minutes && minutes > 0) {
        return `${minutes} min`;
      } else {
        return '0 min';
      }
    }
    return '';
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <X size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Session Not Found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Session Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, styles.cardFirst]}>
          <Text style={styles.sessionTitle} selectable={true}>{session.name}</Text>
          <View style={[styles.typeTag, { backgroundColor: getTypeColor(session.type).bg }]}>
            <Text style={[styles.typeText, { color: getTypeColor(session.type).text }]} selectable={true}>{session.type}</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle} selectable={true}>About</Text>
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Calendar size={20} color="#000" />
              <Text style={styles.detailText} selectable={true}>{formatDate(session.date)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Clock size={20} color="#000" />
              <Text style={styles.detailText} selectable={true}>
                {formatTime(session.date)} • {formatDuration(session.duration)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <MapPin size={20} color="#000" />
              <Text style={styles.detailText} selectable={true}>{session.location}</Text>
            </View>
          </View>
          {session.description ? (
            <>
              <Text style={styles.sectionTitle} selectable={true}>Description</Text>
              <Text style={styles.description} selectable={true}>{session.description}</Text>
            </>
          ) : null}
          {mentors.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text style={styles.sectionTitle} selectable={true}>
                Mentor{mentors.length !== 1 ? 's' : ''} ({mentors.length})
              </Text>
              {mentors.map((mentor) => {
                const liveMentor = connections.find(c => c.id === mentor.id) || mentor;
                return (
                  <ConnectionCard
                    key={mentor.id}
                    connection={liveMentor}
                    sessionCount={mentorCounts[mentor.id]?.sessions}
                    meetingCount={mentorCounts[mentor.id]?.meetings}
                    onPress={() => handleConnectionPress(mentor)}
                    showFavoriteButton={true}
                    onToggleFavorite={() => toggleFavorite(mentor.id)}
                  />
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
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
  sessionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  details: {
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#c0c0c0',
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  descriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
}); 