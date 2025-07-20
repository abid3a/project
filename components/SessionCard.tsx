import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Calendar, Clock, MapPin, Users } from 'lucide-react-native';
import { Session } from '@/types';

interface SessionCardProps {
  session: Session;
  onPress: () => void;
}

export function SessionCard({ session, onPress }: SessionCardProps) {
  const [pressed, setPressed] = useState(false);
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
      // Handle 'H:MM' or 'M:SS' format
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

  return (
    <Pressable
      style={({ pressed: isPressed }) => [
        styles.card,
        (pressed || isPressed) && styles.cardPressed,
      ]}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{session.name}</Text>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{session.type}</Text>
        </View>
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Calendar size={16} color="#000" />
          <Text style={styles.detailText}>{formatDate(session.date)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Clock size={16} color="#000" />
          <Text style={styles.detailText}>
            {formatTime(session.date)} • {formatDuration(session.duration)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <MapPin size={16} color="#000" />
          <Text style={styles.detailText}>{session.location}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Users size={16} color="#000" />
          <Text style={styles.detailText}>
            {session.mentorIds.length} mentor{session.mentorIds.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>
        {session.description}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardPressed: {
    backgroundColor: '#f0f4f8', // subtle pressed effect
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  typeTag: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1976d2',
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
});