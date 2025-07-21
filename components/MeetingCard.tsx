import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Calendar, Clock, MapPin, User } from 'lucide-react-native';
import { Meeting } from '@/types';

const predefinedTypeColors: Record<string, { bg: string; text: string }> = {
  One_on_One: { bg: '#e8f4fd', text: '#1976d2' },
  Group: { bg: '#fff3e0', text: '#f57c00' },
  Team: { bg: '#f3e5f5', text: '#7b1fa2' },
  Client: { bg: '#e8f5e8', text: '#388e3c' },
  Internal: { bg: '#fff8e1', text: '#f9a825' },
};

const defaultColor = { bg: '#eeeeee', text: '#424242' };

// Dynamic color palette for new types
const dynamicColors = [
  { bg: '#e3f2fd', text: '#1565c0' }, // Light blue
  { bg: '#fce4ec', text: '#c2185b' }, // Light pink
  { bg: '#e0f2f1', text: '#00695c' }, // Light teal
  { bg: '#fff3e0', text: '#ef6c00' }, // Light orange
  { bg: '#f3e5f5', text: '#7b1fa2' }, // Light purple
  { bg: '#e8f5e8', text: '#2e7d32' }, // Light green
  { bg: '#fff8e1', text: '#f57f17' }, // Light amber
  { bg: '#fce4ec', text: '#ad1457' }, // Light rose
  { bg: '#e0f7fa', text: '#00838f' }, // Light cyan
  { bg: '#f1f8e9', text: '#558b2f' }, // Light lime
];

// Cache for dynamically assigned colors
const dynamicTypeColors: Record<string, { bg: string; text: string }> = {};

function getTypeColor(type: string): { bg: string; text: string } {
  // Check predefined colors first
  if (predefinedTypeColors[type]) {
    return predefinedTypeColors[type];
  }
  
  // Check if we already assigned a color to this type
  if (dynamicTypeColors[type]) {
    return dynamicTypeColors[type];
  }
  
  // Assign a new color from the dynamic palette
  const colorIndex = Object.keys(dynamicTypeColors).length % dynamicColors.length;
  const newColor = dynamicColors[colorIndex];
  dynamicTypeColors[type] = newColor;
  
  return newColor;
}

interface MeetingCardProps {
  meeting: Meeting;
  onPress: () => void;
}

export function MeetingCard({ meeting, onPress }: MeetingCardProps) {
  const [pressed, setPressed] = useState(false);
  const typeColor = getTypeColor(meeting.type);
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

  // Add a helper to format duration like in meeting-details and session-details
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
        <Text style={styles.title}>{meeting.title}</Text>
        <View style={[styles.typeTag, { backgroundColor: typeColor.bg }]}>
          <Text style={[styles.typeText, { color: typeColor.text }]}>{meeting.type}</Text>
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
            {formatTime(meeting.date)} • {formatDuration(meeting.duration)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <MapPin size={16} color="#000" />
          <Text style={styles.detailText}>{meeting.location}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <User size={16} color="#000" />
          <Text style={styles.detailText}>
            {(meeting.attendeeIds || []).length} attendee{(meeting.attendeeIds || []).length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
      
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  details: {
    marginBottom: 0,
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