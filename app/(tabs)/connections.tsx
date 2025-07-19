```tsx
// connections.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const { connections, toggleFavorite, reloadConnections } = useConnections();
  const [filteredConnections, setFilteredConnections] = useState<Connection[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [connectionCounts, setConnectionCounts] = useState<
    Record<string, { sessions: number; meetings: number }>
  >({});
  const insets = useSafeAreaInsets();

  // re-filter whenever dependencies change
  useEffect(() => {
    filterAndSearchConnections();
  }, [connections, showFavorites, searchQuery, selectedType]);

  // fetch counts for sessions & meetings
  useEffect(() => {
    async function fetchCounts() {
      const counts: Record<string, { sessions: number; meetings: number }> = {};
      await Promise.all(
        filteredConnections.map(async (conn) => {
          let sessions = 0;
          if (user && user.cohort) {
            const result = await fetchSessionCountForConnectionAndCohort(
              conn.id,
              user.cohort
            );
            sessions = typeof result === 'number' ? result : 0;
          }
          const meetings = await fetchMeetingCountForConnection(conn.id);
          counts[conn.id] = { sessions, meetings };
        })
      );
      setConnectionCounts(counts);
    }
    if (filteredConnections.length > 0) {
      fetchCounts();
    } else {
      setConnectionCounts({});
    }
  }, [filteredConnections, user]);

  function filterAndSearchConnections() {
    let filtered = showFavorites
      ? connections.filter((c) => c.isFavorite)
      : connections;

    if (selectedType) {
      filtered = filterByType(filtered, selectedType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((c) =>
        `${c.firstName} ${c.lastName}`
          .toLowerCase()
          .includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.organization.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q)
      );
    }

    filtered = filtered.slice().sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
    });

    setFilteredConnections(filtered);
  }

  const handleConnectionPress = (conn: Connection) => {
    router.push({
      pathname: '/connection-details',
      params: { connectionId: conn.id }
    });
  };

  const favoriteCount = connections.filter((c) => c.isFavorite).length;
  const types = getUniqueTypes(connections);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: '#fff' }
      ]}
    >
      <StatusBar style="dark" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.title}>Connections</Text>
        <Text style={styles.subtitle}>
          {filteredConnections.length} connection
          {filteredConnections.length !== 1 ? 's' : ''}
        </Text>
      </View>

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
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: '#f5f7fa' }}
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
          filteredConnections.map((item) => (
            <ConnectionCard
              key={item.id}
              connection={item}
              sessionCount={connectionCounts[item.id]?.sessions ?? 0}
              meetingCount={connectionCounts[item.id]?.meetings ?? 0}
              onPress={() => handleConnectionPress(item)}
              onToggleFavorite={() => toggleFavorite(item.id)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 2,
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 16,
    color: '#666'
  },
  searchContainer: {
    backgroundColor: '#f5f7fa',
    paddingHorizontal: 16,
    paddingBottom: 12
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
    elevation: 2
  },
  searchIcon: {
    marginRight: 12
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333'
  },
  listContent: {
    paddingBottom: 20
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24
  }
});
```
