import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, SafeAreaView, FlatList } from 'react-native';
import { GestureHandlerRootView , PanGestureHandler, State } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { X, Calendar, Clock, MapPin, Users, Search, ChevronDown, ChevronRight, Filter } from 'lucide-react-native';
import { SessionCard } from '@/components/SessionCard';
import FilterBar from '@/components/FilterBar';
import { ConnectionCard } from '@/components/ConnectionCard';
import { useAuth } from '@/contexts/AuthContext';
import { useConnections } from '@/contexts/ConnectionsContext';
import { fetchSessions, fetchAllSessions, fetchSessionMentors, getUniqueTypes, filterByType, getUniqueCohorts } from '@/services/dataService';
import { Session, Connection } from '@/types';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SessionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { connections, toggleFavorite } = useConnections();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPast, setShowPast] = useState(true);
  const [showToday, setShowToday] = useState(true);
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [mentorCounts, setMentorCounts] = useState<Record<string, number>>({});
  const [availableCohorts, setAvailableCohorts] = useState<string[]>([]);
  const [showCohortFilter, setShowCohortFilter] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadSessions();
    if (user?.role === 'Admin') {
      loadCohorts();
    }
  }, [user]);

  useEffect(() => {
    filterAndSearchSessions();
  }, [sessions, selectedType, selectedCohort, searchQuery]);

  useEffect(() => {
    // Fetch mentor counts for filtered sessions
    async function fetchCounts() {
      const counts: Record<string, number> = {};
      await Promise.all(filteredSessions.map(async (session) => {
        const mentorIds = await fetchSessionMentors(session.id);
        counts[session.id] = mentorIds.length;
      }));
      setMentorCounts(counts);
    }
    if (filteredSessions.length > 0) {
      fetchCounts();
    } else {
      setMentorCounts({});
    }
  }, [filteredSessions]);

  const loadSessions = async () => {
    if (!user) {
      setSessions([]);
      return;
    }
    
    try {
      let data;
      if (user.role === 'Admin') {
        // Admin can see all sessions
        data = await fetchAllSessions();
      } else {
        // Regular users see only their cohort sessions
        const cohort = user.cohort;
        if (!cohort) {
          setSessions([]);
          return;
        }
        const normalizedCohort = cohort.trim().toLowerCase();
        data = await fetchSessions(normalizedCohort);
      }
      
      // Map snake_case to camelCase and parse date
      const mapped = (data || []).map((session: any) => ({
        ...session,
        id: session.id,
        name: session.name,
        date: session.date ? new Date(session.date) : new Date(),
        duration: session.duration,
        type: session.type,
        location: session.location,
        description: session.description,
        companyUID: session.company_uid,
        mentorIds: session.mentor_ids || [],
        cohort: session.cohort,
      }));
      setSessions(mapped);
    } catch (error) {
      setSessions([]);
    }
  };

  const loadCohorts = async () => {
    try {
      const cohorts = await getUniqueCohorts();
      setAvailableCohorts(cohorts);
    } catch (error) {
      setAvailableCohorts([]);
    }
  };

  const filterAndSearchSessions = () => {
    let filtered = sessions;
    
    // Apply cohort filter (admin only)
    if (user?.role === 'Admin' && selectedCohort) {
      filtered = filtered.filter(session => 
        session.cohort?.toLowerCase() === selectedCohort.toLowerCase()
      );
    }
    
    // Apply type filter
    if (selectedType) {
      filtered = filterByType(filtered, selectedType);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(session =>
        session.name.toLowerCase().includes(query) ||
        session.description.toLowerCase().includes(query) ||
        session.type.toLowerCase().includes(query) ||
        session.location.toLowerCase().includes(query)
      );
    }
    
    setFilteredSessions(filtered);
  };

  const handleSessionPress = (session: Session) => {
    router.push({
      pathname: '/session-details',
      params: { sessionId: session.id }
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

  // When computing types for the FilterBar, filter out empty types
  const types = getUniqueTypes(sessions).filter(t => t && t.trim() !== '');

  // Section sessions
  const today = new Date();
  today.setHours(0,0,0,0);
  const pastSessions = filteredSessions.filter(s => s.date < today);
  const todaySessions = filteredSessions.filter(s => {
    const sessionDate = new Date(s.date);
    return sessionDate >= today && sessionDate < new Date(today.getTime() + 24*60*60*1000);
  });
  const upcomingSessions = filteredSessions.filter(s => s.date > new Date(today.getTime() + 24*60*60*1000 - 1));

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top, backgroundColor: '#fff' }]}>
      <StatusBar style="dark" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.title}>Sessions</Text>
        <Text style={styles.subtitle}>
          {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
          {user?.role === 'Admin' && selectedCohort && ` (${selectedCohort})`}
        </Text>
      </View>

      <FilterBar
        types={types}
        selectedType={selectedType}
        onTypeSelect={setSelectedType}
      />

      {/* Admin Cohort Filter */}
      {user?.role === 'Admin' && (
        <View style={styles.adminFilterContainer}>
          <TouchableOpacity
            style={styles.cohortFilterButton}
            onPress={() => setShowCohortFilter(true)}
          >
            <Filter size={20} color="#000" />
            <Text style={styles.cohortFilterText}>
              {selectedCohort ? `Cohort: ${selectedCohort}` : 'Filter by Cohort'}
            </Text>
            <ChevronDown size={16} color="#000" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#000" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search sessions..."
            placeholderTextColor="#000"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Sectioned session list */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} style={{ backgroundColor: '#f5f7fa' }}>
        {pastSessions.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: 16, marginBottom: 12}} onPress={() => setShowPast(v => !v)}>
              {showPast ? <ChevronDown size={18} color="#1a1a1a" style={{marginTop: 2}} /> : <ChevronRight size={18} color="#1a1a1a" style={{marginTop: 2}} />}
              <Text style={[styles.sectionTitle, {marginHorizontal: 0, marginLeft: 8}]}>Past</Text>
            </TouchableOpacity>
            {showPast && pastSessions.map(item => (
              <SessionCard key={item.id} session={{ ...item, mentorIds: Array(mentorCounts[item.id] || 0).fill('') }} onPress={() => handleSessionPress(item)} />
            ))}
          </View>
        )}
        {todaySessions.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: 16, marginBottom: 12}} onPress={() => setShowToday(v => !v)}>
              {showToday ? <ChevronDown size={18} color="#1a1a1a" style={{marginTop: 2}} /> : <ChevronRight size={18} color="#1a1a1a" style={{marginTop: 2}} />}
              <Text style={[styles.sectionTitle, {marginHorizontal: 0, marginLeft: 8}]}>Today</Text>
            </TouchableOpacity>
            {showToday && todaySessions.map(item => (
              <SessionCard key={item.id} session={{ ...item, mentorIds: Array(mentorCounts[item.id] || 0).fill('') }} onPress={() => handleSessionPress(item)} />
            ))}
          </View>
        )}
        {upcomingSessions.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: 16, marginBottom: 12}} onPress={() => setShowUpcoming(v => !v)}>
              {showUpcoming ? <ChevronDown size={18} color="#1a1a1a" style={{marginTop: 2}} /> : <ChevronRight size={18} color="#1a1a1a" style={{marginTop: 2}} />}
              <Text style={[styles.sectionTitle, {marginHorizontal: 0, marginLeft: 8}]}>Upcoming</Text>
            </TouchableOpacity>
            {showUpcoming && upcomingSessions.map(item => (
              <SessionCard key={item.id} session={{ ...item, mentorIds: Array(mentorCounts[item.id] || 0).fill('') }} onPress={() => handleSessionPress(item)} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Cohort Filter Modal */}
      <Modal
        visible={showCohortFilter}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCohortFilter(false)}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaView style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Filter by Cohort</Text>
              <TouchableOpacity style={styles.closeModalButton} onPress={() => setShowCohortFilter(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={availableCohorts}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.cohortItem,
                    selectedCohort === item && styles.selectedCohortItem
                  ]}
                  onPress={() => {
                    setSelectedCohort(selectedCohort === item ? null : item);
                    setShowCohortFilter(false);
                  }}
                >
                  <Text style={[
                    styles.cohortItemText,
                    selectedCohort === item && styles.selectedCohortItemText
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </SafeAreaView>
        </GestureHandlerRootView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#000',
  },
  listContent: {
    paddingBottom: 20,
    backgroundColor: '#f5f7fa',
  },
  searchContainer: {
    backgroundColor: '#f5f7fa',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  sessionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  sessionDetails: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginLeft: 8,
  },
  sectionContent: {
    paddingTop: 4,
  },
  description: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  adminFilterContainer: {
    backgroundColor: '#f5f7fa',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  cohortFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cohortFilterText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  closeModalButton: {
    padding: 8,
  },
  cohortItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  selectedCohortItem: {
    backgroundColor: '#1976d2',
  },
  cohortItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedCohortItemText: {
    color: '#fff',
    fontWeight: '600',
  },
});