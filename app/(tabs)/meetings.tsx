import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, SafeAreaView, FlatList } from 'react-native';
import { GestureHandlerRootView , PanGestureHandler, State } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { X, Calendar, Clock, MapPin, Users, User, Search, ChevronDown, ChevronRight, Filter } from 'lucide-react-native';
import { MeetingCard } from '@/components/MeetingCard';
import FilterBar from '@/components/FilterBar';
import { ConnectionCard } from '@/components/ConnectionCard';
import { useAuth } from '@/contexts/AuthContext';
import { useConnections } from '@/contexts/ConnectionsContext';
import { fetchMeetings, fetchAllMeetings, fetchMeetingAttendees, getUniqueTypes, filterByType, getUniqueCompanyUIDs, fetchUsers } from '@/services/dataService';
import { Meeting, Connection } from '@/types';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MeetingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { connections, toggleFavorite } = useConnections();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCompanyUID, setSelectedCompanyUID] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPast, setShowPast] = useState(true);
  const [showToday, setShowToday] = useState(true);
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [attendeeCounts, setAttendeeCounts] = useState<Record<string, number>>({});
  const [availableCompanyUIDs, setAvailableCompanyUIDs] = useState<string[]>([]);
  const [showCompanyFilter, setShowCompanyFilter] = useState(false);
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<string | null>(null);
  const [showAttendeeFilter, setShowAttendeeFilter] = useState(false);
  const [availableAttendees, setAvailableAttendees] = useState<any[]>([]); // Adjust type as needed
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadMeetings();
    if (user?.role === 'Admin') {
      loadCompanyUIDs();
    }
  }, [user]);

  useEffect(() => {
    filterAndSearchMeetings();
  }, [meetings, selectedType, searchQuery, selectedAttendeeId, selectedCompanyUID]);

  useEffect(() => {
    // Fetch attendee counts for filtered meetings
    async function fetchCounts() {
      const counts: Record<string, number> = {};
      await Promise.all(filteredMeetings.map(async (meeting) => {
        const attendeeIds = await fetchMeetingAttendees(meeting.id);
        counts[meeting.id] = attendeeIds.length;
      }));
      setAttendeeCounts(counts);
    }
    if (filteredMeetings.length > 0) {
      fetchCounts();
    } else {
      setAttendeeCounts({});
    }
  }, [filteredMeetings]);

  const loadMeetings = async () => {
    if (!user) {
      setMeetings([]);
      return;
    }
    
    try {
      let data;
      if (user.role === 'Admin') {
        // Admin can see all meetings
        data = await fetchAllMeetings();
      } else {
        // Regular users see only their company meetings
        const companyUID = user.companyUID;
        if (!companyUID) {
          setMeetings([]);
          return;
        }
        data = await fetchMeetings(companyUID);
      }
      
      // Map snake_case to camelCase and parse date
      const mapped = (data || []).map((meeting: any) => ({
        ...meeting,
        id: meeting.id,
        title: meeting.title,
        date: meeting.date ? new Date(meeting.date) : new Date(),
        duration: meeting.duration,
        type: meeting.type,
        location: meeting.location,
        description: meeting.description,
        companyUID: meeting.company_uid,
        attendeeIds: meeting.attendee_ids || [],
        organizerId: meeting.organizer_id,
      }));
      setMeetings(mapped);
    } catch (error) {
      setMeetings([]);
    }
  };

  const loadCompanyUIDs = async () => {
    try {
      const companyUIDs = await getUniqueCompanyUIDs();
      setAvailableCompanyUIDs(companyUIDs);
    } catch (error) {
      setAvailableCompanyUIDs([]);
    }
  };

  const filterAndSearchMeetings = () => {
    let filtered = meetings;
    
    // Apply company filter (admin only)
    if (user?.role === 'Admin' && selectedCompanyUID) {
      filtered = filtered.filter(meeting => 
        meeting.companyUID === selectedCompanyUID
      );
    }
    
    // Apply attendee filter (admin only)
    if (user?.role === 'Admin' && selectedAttendeeId) {
      filtered = filtered.filter(meeting => meeting.attendeeIds && meeting.attendeeIds.includes(selectedAttendeeId));
    }
    
    // Apply type filter
    if (selectedType) {
      filtered = filterByType(filtered, selectedType);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(meeting =>
        meeting.title.toLowerCase().includes(query) ||
        meeting.description.toLowerCase().includes(query) ||
        meeting.type.toLowerCase().includes(query) ||
        meeting.location.toLowerCase().includes(query)
      );
    }
    
    // Sort by date ascending, then by time ascending for same date
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      // First compare dates
      const dateComparison = dateA.getTime() - dateB.getTime();
      if (dateComparison !== 0) {
        return dateComparison;
      }
      
      // If dates are the same, compare times
      return dateA.getTime() - dateB.getTime();
    });
    
    setFilteredMeetings(filtered);
  };

  const handleMeetingPress = (meeting: Meeting) => {
    router.push({
      pathname: '/meeting-details',
      params: { meetingId: meeting.id }
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

  const types = getUniqueTypes(meetings).filter(t => t && t.trim() !== '');

  // Section meetings
  const today = new Date();
  today.setHours(0,0,0,0);
  const pastMeetings = filteredMeetings.filter(m => m.date < today);
  const todayMeetings = filteredMeetings.filter(m => {
    const meetingDate = new Date(m.date);
    return meetingDate >= today && meetingDate < new Date(today.getTime() + 24*60*60*1000);
  });
  const upcomingMeetings = filteredMeetings.filter(m => m.date > new Date(today.getTime() + 24*60*60*1000 - 1));

  // Example: Optimistic update for RSVP (pseudo-code, extend as needed)
  // const rsvpMeeting = async (meetingId: string, attending: boolean) => {
  //   setMeetings(prevMeetings =>
  //     prevMeetings.map(meeting =>
  //       meeting.id === meetingId ? { ...meeting, attending } : meeting
  //     )
  //   );
  //   try {
  //     // await api.rsvpMeeting(meetingId, attending);
  //   } catch (e) {
  //     setMeetings(prevMeetings =>
  //       prevMeetings.map(meeting =>
  //         meeting.id === meetingId ? { ...meeting, attending: !attending } : meeting
  //       )
  //     );
  //   }
  // };

  function getAttendeeName(id: string) {
    const attendee = connections.find(a => a.id === id);
    return attendee ? `${attendee.firstName} ${attendee.lastName}` : id;
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top, backgroundColor: '#fff' }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Meetings</Text>
        <Text style={styles.subtitle}>
          {filteredMeetings.length} meeting{filteredMeetings.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FilterBar
        types={types}
        selectedType={selectedType}
        onTypeSelect={setSelectedType}
      />

      {/* Admin Company & Attendee Filter */}
      {user?.role === 'Admin' && (
        <View style={styles.adminFilterContainer}>
          {/* Filter tags */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {selectedCompanyUID && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>Company: {selectedCompanyUID}</Text>
                <TouchableOpacity onPress={() => setSelectedCompanyUID(null)} style={styles.filterTagClose}>
                  <X size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
            {selectedAttendeeId && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>Attendee: {getAttendeeName(selectedAttendeeId)}</Text>
                <TouchableOpacity onPress={() => setSelectedAttendeeId(null)} style={styles.filterTagClose}>
                  <X size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={styles.companyFilterButton}
              onPress={() => setShowCompanyFilter(true)}
            >
              <Filter size={20} color="#000" />
              <Text style={styles.companyFilterText}>
                {selectedCompanyUID ? `Company: ${selectedCompanyUID}` : 'Filter by Company'}
              </Text>
              <ChevronDown size={16} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.companyFilterButton}
              onPress={() => setShowAttendeeFilter(true)}
            >
              <Users size={20} color="#000" />
              <Text style={styles.companyFilterText}>
                {selectedAttendeeId ? `Attendee: ${getAttendeeName(selectedAttendeeId)}` : 'Filter by Attendee'}
              </Text>
              <ChevronDown size={16} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#000" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search meetings..."
            placeholderTextColor="#000"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Sectioned meeting list */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} style={{ backgroundColor: '#f5f7fa' }}>
        {pastMeetings.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: 16, marginBottom: 12}} onPress={() => setShowPast(v => !v)}>
              {showPast ? <ChevronDown size={18} color="#1a1a1a" style={{marginTop: 2}} /> : <ChevronRight size={18} color="#1a1a1a" style={{marginTop: 2}} />}
              <Text style={[styles.sectionTitle, {marginHorizontal: 0, marginLeft: 8}]}>Past</Text>
            </TouchableOpacity>
            {showPast && pastMeetings.map(item => (
              <MeetingCard key={item.id} meeting={{ ...item, attendeeIds: Array(attendeeCounts[item.id] || 0).fill('') }} onPress={() => handleMeetingPress(item)} />
            ))}
          </View>
        )}
        {todayMeetings.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: 16, marginBottom: 12}} onPress={() => setShowToday(v => !v)}>
              {showToday ? <ChevronDown size={18} color="#1a1a1a" style={{marginTop: 2}} /> : <ChevronRight size={18} color="#1a1a1a" style={{marginTop: 2}} />}
              <Text style={[styles.sectionTitle, {marginHorizontal: 0, marginLeft: 8}]}>Today</Text>
            </TouchableOpacity>
            {showToday && todayMeetings.map(item => (
              <MeetingCard key={item.id} meeting={{ ...item, attendeeIds: Array(attendeeCounts[item.id] || 0).fill('') }} onPress={() => handleMeetingPress(item)} />
            ))}
          </View>
        )}
        {upcomingMeetings.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: 16, marginBottom: 12}} onPress={() => setShowUpcoming(v => !v)}>
              {showUpcoming ? <ChevronDown size={18} color="#1a1a1a" style={{marginTop: 2}} /> : <ChevronRight size={18} color="#1a1a1a" style={{marginTop: 2}} />}
              <Text style={[styles.sectionTitle, {marginHorizontal: 0, marginLeft: 8}]}>Upcoming</Text>
            </TouchableOpacity>
            {showUpcoming && upcomingMeetings.map(item => (
              <MeetingCard key={item.id} meeting={{ ...item, attendeeIds: Array(attendeeCounts[item.id] || 0).fill('') }} onPress={() => handleMeetingPress(item)} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Company Filter Modal */}
      <Modal
        visible={showCompanyFilter}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCompanyFilter(false)}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaView style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Filter by Company</Text>
              <TouchableOpacity style={[styles.closeModalButton, { position: 'absolute', right: 20, top: 20 }]} onPress={() => setShowCompanyFilter(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.companyItem, { backgroundColor: '#f5f7fa', borderBottomWidth: 0 }]}
              onPress={() => {
                setSelectedCompanyUID(null);
                setShowCompanyFilter(false);
              }}
            >
              <Text style={[styles.companyItemText, { color: '#1976d2', fontWeight: 'bold' }]}>Reset Filter</Text>
            </TouchableOpacity>
            <FlatList
              data={availableCompanyUIDs}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.companyItem,
                    selectedCompanyUID === item && styles.selectedCompanyItem
                  ]}
                  onPress={() => {
                    setSelectedCompanyUID(selectedCompanyUID === item ? null : item);
                    setShowCompanyFilter(false);
                  }}
                >
                  <Text style={[
                    styles.companyItemText,
                    selectedCompanyUID === item && styles.selectedCompanyItemText
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

      {/* Attendee Filter Modal */}
      <Modal
        visible={showAttendeeFilter}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAttendeeFilter(false)}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaView style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Filter by Attendee</Text>
              <TouchableOpacity style={[styles.closeModalButton, { position: 'absolute', right: 20, top: 20 }]} onPress={() => setShowAttendeeFilter(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.companyItem, { backgroundColor: '#f5f7fa', borderBottomWidth: 0 }]}
              onPress={() => {
                setSelectedAttendeeId(null);
                setShowAttendeeFilter(false);
              }}
            >
              <Text style={[styles.companyItemText, { color: '#1976d2', fontWeight: 'bold' }]}>Reset Filter</Text>
            </TouchableOpacity>
            <FlatList
              data={[...connections].sort((a, b) => {
                const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
                const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
                return nameA.localeCompare(nameB);
              })}
              keyExtractor={(item) => item.id}
              renderItem={useCallback(({ item }: { item: Connection }) => (
                <TouchableOpacity
                  style={[
                    styles.companyItem,
                    selectedAttendeeId === item.id && styles.selectedCompanyItem
                  ]}
                  onPress={() => {
                    const newValue = selectedAttendeeId === item.id ? null : item.id;
                    setSelectedAttendeeId(newValue);
                    setShowAttendeeFilter(false);
                  }}
                >
                  <Text style={[
                    styles.companyItemText,
                    selectedAttendeeId === item.id && styles.selectedCompanyItemText
                  ]}>
                    {item.firstName} {item.lastName}
                  </Text>
                </TouchableOpacity>
              ), [selectedAttendeeId])}
              getItemLayout={(_, index) => ({ length: 56, offset: 56 * index, index })}
              initialNumToRender={20}
              maxToRenderPerBatch={30}
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
  meetingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  meetingDetails: {
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
  companyFilterButton: {
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
  companyFilterText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  closeModalButton: {
    padding: 8,
  },
  companyItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  selectedCompanyItem: {
    backgroundColor: '#1976d2',
  },
  companyItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedCompanyItemText: {
    color: '#fff',
    fontWeight: '600',
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976d2',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  filterTagText: {
    color: '#fff',
    fontSize: 13,
    marginRight: 4,
  },
  filterTagClose: {
    marginLeft: 2,
    padding: 2,
    borderRadius: 10,
    backgroundColor: '#1565c0',
  },
});