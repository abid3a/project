import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Calendar, Clock, MapPin, Users } from 'lucide-react-native';
import { Meeting } from '@/types';

interface MeetingCardProps {
  meeting: Meeting;
  onPress: () => void;
}

export function MeetingCard({ meeting, onPress }: MeetingCardProps) {
  const [pressed, setPressed] = useState(false);
  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

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
        <Text style={styles.title}>{meeting.title}</Text>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{meeting.type}</Text>
        </View>
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Calendar size={16} color="#000" />
          <Text style={styles.detailText}>{formatDate(meeting.date)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Clock size={16} color="#000" />
          <Text style={styles.detailText}>
            {formatTime(meeting.date)} • {meeting.duration}min
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <MapPin size={16} color="#000" />
          <Text style={styles.detailText}>{meeting.location}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Users size={16} color="#000" />
          <Text style={styles.detailText}>
            {(meeting.attendeeIds || []).length} attendee{(meeting.attendeeIds || []).length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>
        {meeting.description}
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
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
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
    lineHeight: 24,
  },
});