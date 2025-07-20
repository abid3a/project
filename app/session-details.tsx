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

export default function SessionDetailsScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { connections } = useConnections();
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
          <Text style={styles.sessionTitle}>{session.name}</Text>
          <View style={styles.typeTag}>
            <Text style={styles.typeText}>{session.type}</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Calendar size={20} color="#000" />
              <Text style={styles.detailText}>{formatDate(session.date)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Clock size={20} color="#000" />
              <Text style={styles.detailText}>
                {formatTime(session.date)} • {formatDuration(session.duration)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <MapPin size={20} color="#000" />
              <Text style={styles.detailText}>{session.location}</Text>
            </View>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{session.description}</Text>
        </View>
        {mentors.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Mentor{mentors.length !== 1 ? 's' : ''} ({mentors.length})
            </Text>
            {mentors.map((mentor) => (
              <ConnectionCard
                key={mentor.id}
                connection={mentor}
                sessionCount={mentorCounts[mentor.id]?.sessions}
                meetingCount={mentorCounts[mentor.id]?.meetings}
                onPress={() => handleConnectionPress(mentor)}
                showFavoriteButton={false}
              />
            ))}
          </View>
        )}
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
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1976d2',
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