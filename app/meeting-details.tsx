import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, Calendar, Clock, MapPin, User } from 'lucide-react-native';
import { ConnectionCard } from '@/components/ConnectionCard';
import { useConnections } from '@/contexts/ConnectionsContext';
import { Meeting, Connection } from '@/types';
import { fetchMeetingAttendees , fetchSessionCountForConnection, fetchMeetingCountForConnection , fetchMeetings } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';

export default function MeetingDetailsScreen() {
  const router = useRouter();
  const { meetingId } = useLocalSearchParams<{ meetingId: string }>();
  const { connections } = useConnections();
  const { user } = useAuth();
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [attendees, setAttendees] = useState<Connection[]>([]);
  const [attendeeCounts, setAttendeeCounts] = useState<Record<string, { sessions: number; meetings: number }>>({});

  useEffect(() => {
    if (meetingId && user) {
      // Fetch all meetings for the user's company from Supabase
      fetchMeetings(user.companyUID)
        .then((meetings) => {
          const foundMeeting = (meetings || []).find((m: any) => m.id === meetingId);
          if (foundMeeting) {
            // Ensure date is a Date object
            if (foundMeeting.date && typeof foundMeeting.date === 'string') {
              foundMeeting.date = new Date(foundMeeting.date);
            }
            setMeeting(foundMeeting);
            // Load attendees for this meeting from Supabase join table
            fetchMeetingAttendees(meetingId)
              .then(attendeeIds => {
                const meetingAttendees = attendeeIds
                  .map(id => connections.find(c => c.id === id))
                  .filter(Boolean) as Connection[];
                setAttendees(meetingAttendees);
              })
              .catch(() => setAttendees([]));
          } else {
            setMeeting(null);
            setAttendees([]);
          }
        })
        .catch(() => {
          setMeeting(null);
          setAttendees([]);
        });
    }
  }, [meetingId, connections, user]);

  useEffect(() => {
    // Fetch session and meeting counts for attendees
    async function fetchCounts() {
      const counts: Record<string, { sessions: number; meetings: number }> = {};
      await Promise.all(attendees.map(async (conn) => {
        const [sessions, meetings] = await Promise.all([
          fetchSessionCountForConnection(conn.id),
          fetchMeetingCountForConnection(conn.id),
        ]);
        counts[conn.id] = { sessions, meetings };
      }));
      setAttendeeCounts(counts);
    }
    if (attendees.length > 0) {
      fetchCounts();
    } else {
      setAttendeeCounts({});
    }
  }, [attendees]);

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

  if (!meeting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <X size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.title}>Meeting Not Found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.title}>Meeting Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, styles.cardFirst]}>
          <Text style={styles.meetingTitle}>{meeting.title}</Text>
          <View style={styles.typeTag}>
            <Text style={styles.typeText}>{meeting.type}</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Calendar size={20} color="#666" />
              <Text style={styles.detailText}>{formatDate(meeting.date)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Clock size={20} color="#666" />
              <Text style={styles.detailText}>
                {formatTime(meeting.date)} • {meeting.duration} minutes
              </Text>
            </View>
            <View style={styles.detailRow}>
              <MapPin size={20} color="#666" />
              <Text style={styles.detailText}>{meeting.location}</Text>
            </View>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{meeting.description}</Text>
        </View>
        {attendees.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Attendee{attendees.length !== 1 ? 's' : ''} ({attendees.length})
            </Text>
            {attendees.map((attendee) => (
              <ConnectionCard
                key={attendee.id}
                connection={attendee}
                sessionCount={attendeeCounts[attendee.id]?.sessions}
                meetingCount={attendeeCounts[attendee.id]?.meetings}
                onPress={() => handleConnectionPress(attendee)}
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
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardFirst: {
    marginTop: 16, // Add margin to the first card
  },
  meetingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  typeTag: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f57c00',
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