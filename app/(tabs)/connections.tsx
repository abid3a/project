import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Heart, Search } from 'lucide-react-native';
import { ConnectionCard } from '@/components/ConnectionCard';
import FilterBar from '@/components/FilterBar';
import { useAuth } from '@/contexts/AuthContext';
import { useConnections } from '@/contexts/ConnectionsContext';
import { fetchSessionCountForConnection, fetchMeetingCountForConnection, getUniqueTypes, filterByType } from '@/services/dataService';
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
  const [connectionCounts, setConnectionCounts] = useState<Record<string, { sessions: number; meetings: number }>>({});
  const insets = useSafeAreaInsets();

  useEffect(() => {
    filterAndSearchConnections();
  }, [connections, showFavorites, searchQuery, selectedType]);

  useEffect(() => {
    // Fetch session and meeting counts for filtered connections
    async function fetchCounts() {
      const counts: Record<string, { sessions: number; meetings: number }> = {};
      await Promise.all(filteredConnections.map(async (conn) => {
        const [sessions, meetings] = await Promise.all([
          fetchSessionCountForConnection(conn.id),
          fetchMeetingCountForConnection(conn.id),
        ]);
        counts[conn.id] = { sessions, meetings };
      }));
      setConnectionCounts(counts);
    }
    if (filteredConnections.length > 0) {
      fetchCounts();
    } else {
      setConnectionCounts({});
    }
  }, [filteredConnections]);

  const filterAndSearchConnections = () => {
    let filtered = showFavorites 
      ? connections.filter(c => c.isFavorite)
      : connections;
    
    // Apply type filter
    if (selectedType) {
      filtered = filterByType(filtered, selectedType);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(connection =>
        `${connection.firstName} ${connection.lastName}`.toLowerCase().includes(query) ||
        connection.role.toLowerCase().includes(query) ||
        connection.type.toLowerCase().includes(query) ||
        connection.organization.toLowerCase().includes(query) ||
        connection.bio.toLowerCase().includes(query)
      );
    }

    // Sort alphabetically by firstName, then lastName
    filtered = filtered.slice().sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
    
    setFilteredConnections(filtered);
  };

  const handleConnectionPress = (connection: Connection) => {
    router.push({
      pathname: '/connection-details',
      params: { connectionId: connection.id }
    });
  };

  const handleToggleFavorite = (connectionId: string) => {
    toggleFavorite(connectionId);
  };

  const favoriteCount = connections.filter(c => c.isFavorite).length;
  const types = getUniqueTypes(connections);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top, backgroundColor: '#fff' }]}> 
      <StatusBar style="dark" backgroundColor="#fff" />
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{showFavorites ? 'Favorite Connections' : 'Connections'}</Text>
          <Text style={styles.subtitle}>
            {showFavorites 
              ? `${filteredConnections.length} favorite connection${filteredConnections.length !== 1 ? 's' : ''}`
              : `${filteredConnections.length} connection${filteredConnections.length !== 1 ? 's' : ''}`
            }
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.favoriteButton, showFavorites && styles.favoriteButtonActive]}
          onPress={() => setShowFavorites(!showFavorites)}
        >
          <Heart 
            size={32}
            color="#1976d2"
            fill={showFavorites ? "#1976d2" : "none"}
          />
          {favoriteCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{favoriteCount}</Text>
            </View>
          )}
        </TouchableOpacity>
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
            placeholder={showFavorites ? "Search favorites..." : "Search connections..."}
            placeholderTextColor="#000"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>
      {filteredConnections.length === 0 ? (
        <View style={styles.emptyState}>
          <Heart size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>
            {searchQuery.trim() 
              ? 'No Results Found'
              : showFavorites ? 'No Favorites Yet' : 'No Connections'
            }
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery.trim()
              ? 'Try adjusting your search terms'
              : showFavorites 
                ? 'Tap the heart icon on connections to add them to your favorites'
                : 'Connections will appear here when available'
            }
          </Text>
          {showFavorites && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowFavorites(false)}
            >
              <Text style={styles.backButtonText}>View All Connections</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView
          style={{ backgroundColor: '#f5f7fa' }}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
          showsVerticalScrollIndicator={false}
        >
          {filteredConnections.map((item) => (
            <ConnectionCard
              key={item.id}
              connection={item}
              sessionCount={connectionCounts[item.id]?.sessions}
              meetingCount={connectionCounts[item.id]?.meetings}
              onPress={() => handleConnectionPress(item)}
              onToggleFavorite={() => handleToggleFavorite(item.id)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa', // always light grey
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 2,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  favoriteButton: {
    position: 'relative',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonActive: {},
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#1976d2',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listWrapper: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  listContent: {
    paddingBottom: 20,
    backgroundColor: '#f5f7fa', // always light grey
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
  backButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

});