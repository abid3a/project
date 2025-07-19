// app/(tabs)/connections.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Heart, Search } from 'lucide-react-native';
import { ConnectionCard } from '@/components/ConnectionCard';
import FilterBar from '@/components/FilterBar';
import { useAuth } from '@/contexts/AuthContext';
import { useConnections } from '@/contexts/ConnectionsContext';
import {
  fetchSessionCountForConnectionAndCohort,
  fetchMeetingCountForConnection,
  getUniqueTypes,
  filterByType
} from '@/services/dataService';
import { Connection } from '@/types';
import { StatusBar } from 'expo-status-bar';

export default function ConnectionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { connections, toggleFavorite } = useConnections();

  const [filteredConnections, setFilteredConnections] = useState<Connection[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [connectionCounts, setConnectionCounts] = useState<
    Record<string, { sessions: number; meetings: number }>
  >({});

  // 1) Filter & search
  useEffect(() => {
    let filtered = showFavorites
      ? connections.filter(c => c.isFavorite)
      : connections;

    if (selectedType) {
      filtered = filterByType(filtered, selectedType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(c => {
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
        return (
          fullName.includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.type.toLowerCase().includes(q) ||
          c.organization.toLowerCase().includes(q) ||
          c.bio.toLowerCase().includes(q)
        );
      });
    }

    // sort
    filtered = filtered.slice().sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
    });

    setFilteredConnections(filtered);
  }, [connections, showFavorites, searchQuery, selectedType]);

  // 2) Fetch counts
  useEffect(() => {
    async function fetchCounts() {
      const counts: Record<string, { sessions: number; meetings: number }> = {};
      await Promise.all(
        filteredConnections.map(async (conn) => {
          let sessions = 0;
          if (user?.cohort) {
            const r = await fetchSessionCountForConnectionAndCohort(conn.id, user.cohort);
            sessions = typeof r === 'number' ? r : 0;
          }
          const meetings = await fetchMeetingCountForConnection(conn.id);
          counts[conn.id] = { sessions, meetings };
        })
      );
      setConnectionCounts(counts);
    }

    if (filteredConnections.length) {
      fetchCounts();
    } else {
      setConnectionCounts({});
    }
  }, [filteredConnections, user]);

  const types = getUniqueTypes(connections).filter(t => t && t.trim() !== '');

  return (
    <>
      {/* top-safe-area only for the header */}
      <SafeAreaView edges={['top']} style={styles.safeTop}>
        <StatusBar style="dark" backgroundColor="#fff" />
        <View style={styles.header}>
          <Text style={styles.title}>Connections</Text>
          <Text style={styles.subtitle}>
            {filteredConnections.length} connection
            {filteredConnections.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </SafeAreaView>

      {/* rest of app, fills to bottom */}
      <View style={styles.container}>
        <FilterBar
          types={types}
          selectedType={selectedType}
          onTypeSelect={setSelectedType}
        />

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search connections..."
              placeholderTextColor="#000"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <ScrollView
          style={styles.listScroll}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredConnections.length === 0 ? (
            <View style={styles.emptyState}>
              <Heart size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>
                {searchQuery.trim() ? 'No Results Found' : 'No Connections'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery.trim()
                  ? 'Try adjusting your search terms'
                  : 'Connections will appear here when available'}
              </Text>
            </View>
          ) : (
            filteredConnections.map(conn => (
              <ConnectionCard
                key={conn.id}
                connection={conn}
                sessionCount={connectionCounts[conn.id]?.sessions ?? 0}
                meetingCount={connectionCounts[conn.id]?.meetings ?? 0}
                onPress={() =>
                  router.push({
                    pathname: '/connection-details',
                    params: { connectionId: conn.id }
                  })
                }
                onToggleFavorite={() => toggleFavorite(conn.id)}
              />
            ))
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safeTop: {
    backgroundColor: '#fff',
  },
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
    color: '#666',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#f5f7fa',
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
  listScroll: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 20, // adjust as you like
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
});
