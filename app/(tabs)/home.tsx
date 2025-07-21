// HomeScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { fetchSessions, fetchMeetings } from '@/services/dataService';
import { Session, Meeting } from '@/types';
import { useRouter } from 'expo-router';
import { SessionCard } from '@/components/SessionCard';
import { MeetingCard } from '@/components/MeetingCard';

const banners = [
  require('@/assets/images/banners/1.png'),
  require('@/assets/images/banners/2.png'),
  require('@/assets/images/banners/3.png'),
  require('@/assets/images/banners/4.png'),
  require('@/assets/images/banners/5.png'),
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

function getDateString() {
  const today = new Date();
  return today.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

export default function HomeScreen() {
  const [bannerIndex, setBannerIndex] = useState(0);
  const [featuredSessions, setFeaturedSessions] = useState<Session[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const router = useRouter();

  // sizing
  const CARD_WIDTH = width * 0.8;
  const CARD_MARGIN = 16;
  const SIDE_PADDING = (width - CARD_WIDTH) / 2;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      if (user?.cohort) {
        const sessions = await fetchSessions(user.cohort);
        const upcoming = sessions
          .filter(s => new Date(s.date) > new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5);
        setFeaturedSessions(upcoming);
      }
      if (user?.companyUID) {
        const meetings = await fetchMeetings(user.companyUID);
        const upcoming = meetings
          .filter(m => new Date(m.date) > new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3);
        setUpcomingMeetings(upcoming);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const slide = Math.round(offsetX / (CARD_WIDTH + CARD_MARGIN));
    setBannerIndex(slide);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>{getGreeting()}, {user?.firstName || 'User'}!</Text>
            <Text style={styles.dateText}>{getDateString()}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={20} color="#333" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Featured Sessions */}
        <View>
          <View style={styles.bannerHeaderRow}>
            <Text style={styles.sectionTitle}>Featured Sessions</Text>
          </View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + CARD_MARGIN}
            snapToAlignment="start"
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingHorizontal: SIDE_PADDING }}
          >
            {banners.map((banner, idx) => (
              <View
                key={idx}
                style={[styles.slideshowCard, { width: CARD_WIDTH, height: 240, marginRight: CARD_MARGIN }]}
              >
                <Image source={banner} style={{ flex: 1, borderRadius: 16 }} resizeMode="cover" />
                <View style={styles.slideshowOverlay}>
                  <View style={[styles.typeTag, { backgroundColor: '#4ECDC4' }]}>
                    <Text style={styles.typeTagText}>Mentorship</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.dotsRow}>
            {banners.map((_, idx) => (
              <View key={idx} style={[styles.dot, bannerIndex === idx && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* Upcoming Sessions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
          </View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + CARD_MARGIN}
            snapToAlignment="start"
            contentContainerStyle={{ paddingHorizontal: SIDE_PADDING }}
          >
            {(featuredSessions.length > 0 ? featuredSessions : [null]).map((session, idx) =>
              session ? (
                <View
                  key={session.id}
                  style={{ width: CARD_WIDTH, marginRight: CARD_MARGIN }}
                >
                  <SessionCard
                    session={session}
                    onPress={() => router.push({ pathname: '/session-details', params: { sessionId: session.id } })}
                    fullWidth
                  />
                </View>
              ) : (
                <View
                  key="empty-session"
                  style={[styles.emptyStateCard, { width: CARD_WIDTH, marginRight: CARD_MARGIN }]}
                >
                  <Ionicons name="calendar-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyStateText}>No upcoming sessions</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Check back later for new opportunities
                  </Text>
                </View>
              )
            )}
          </ScrollView>
        </View>

        {/* Upcoming Meetings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Meetings</Text>
          </View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + CARD_MARGIN}
            snapToAlignment="start"
            contentContainerStyle={{ paddingHorizontal: SIDE_PADDING }}
          >
            {(upcomingMeetings.length > 0 ? upcomingMeetings : [null]).map((meeting, idx) =>
              meeting ? (
                <View
                  key={meeting.id}
                  style={{ width: CARD_WIDTH, marginRight: CARD_MARGIN }}
                >
                  <MeetingCard
                    meeting={meeting}
                    onPress={() => router.push({ pathname: '/meeting-details', params: { meetingId: meeting.id } })}
                    fullWidth
                  />
                </View>
              ) : (
                <View
                  key="empty-meeting"
                  style={[styles.emptyStateCard, { width: CARD_WIDTH, marginRight: CARD_MARGIN }]}
                >
                  <Ionicons name="calendar-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyStateText}>No upcoming meetings</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Schedule your next meeting
                  </Text>
                </View>
              )
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 10
  },
  notificationButton: { padding: 8, position: 'relative' },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B'
  },
  greetingSection: { flex: 1 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  dateText: { fontSize: 16, color: '#666' },
  scrollView: { flex: 1 },

  bannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 8
  },

  section: { marginTop: 24 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20
  },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
  slideshowCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  slideshowOverlay: { position: 'absolute', top: 12, left: 12 },
  typeTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  typeTagText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ddd', marginHorizontal: 4 },
  dotActive: { backgroundColor: '#1976d2' },
  emptyStateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    // no marginRight here
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120
  },
  emptyStateText: { fontSize: 16, color: '#666', marginTop: 12, fontWeight: '500', textAlign: 'center' },
  emptyStateSubtext: { fontSize: 14, color: '#999', marginTop: 4, textAlign: 'center' }
});
