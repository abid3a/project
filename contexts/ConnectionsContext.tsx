import React, { createContext, useContext, useState, useEffect } from 'react';
import { Connection } from '@/types';
import { fetchConnections, fetchAllConnections, fetchFavoriteConnectionIds, addFavorite, removeFavorite } from '@/services/dataService';
import { useAuth } from './AuthContext';

interface ConnectionsContextType {
  connections: Connection[];
  setConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
  toggleFavorite: (connectionId: string) => void;
  reloadConnections: () => void;
}

const ConnectionsContext = createContext<ConnectionsContextType | undefined>(undefined);

export function ConnectionsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const reloadConnections = async () => {
    if (!user) {
      setConnections([]);
      setFavoriteIds([]);
      return;
    }
    
    try {
      let data;
      let favIds: string[] = [];
      
      if (user.role === 'Admin') {
        // Admin can see all connections
        data = await fetchAllConnections();
        // For admin, we'll show all connections but favorites will be company-specific
        favIds = await fetchFavoriteConnectionIds(user.companyUID);
      } else {
        // Regular users see all connections (as per current implementation)
        data = await fetchConnections();
        favIds = await fetchFavoriteConnectionIds(user.companyUID);
      }
      
      // Map snake_case to camelCase for frontend compatibility
      const mapped = (data || []).map(conn => ({
        ...conn,
        firstName: conn.first_name,
        lastName: conn.last_name,
        companyUID: conn.company_uid,
        profileImage: conn.profile_image,
        linkedinUrl: conn.linkedin_url,
        isFavorite: favIds.includes(conn.id),
      }));
      setConnections(mapped);
      setFavoriteIds(favIds);
    } catch (error) {
      setConnections([]);
      setFavoriteIds([]);
    }
  };

  useEffect(() => {
    reloadConnections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const toggleFavorite = async (connectionId: string) => {
    if (!user) return;
    const companyUID = user.companyUID;
    const isFav = favoriteIds.includes(connectionId);
    try {
      if (isFav) {
        await removeFavorite(companyUID, connectionId);
      } else {
        await addFavorite(companyUID, connectionId);
      }
      await reloadConnections();
    } catch (e) {
      // Optionally handle error
    }
  };

  return (
    <ConnectionsContext.Provider value={{ connections, setConnections, toggleFavorite, reloadConnections }}>
      {children}
    </ConnectionsContext.Provider>
  );
}

export function useConnections() {
  const context = useContext(ConnectionsContext);
  if (context === undefined) {
    throw new Error('useConnections must be used within a ConnectionsProvider');
  }
  return context;
} 