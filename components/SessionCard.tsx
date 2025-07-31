/**
 * SessionCard Component
 * Displays a session card with session information and details
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Calendar, Clock, MapPin, User } from 'lucide-react-native';
import { Session } from '@/types';
import { TYPE_COLORS, DYNAMIC_COLORS } from '@/utils/constants';
import { formatDate, formatTime, formatDuration } from '@/utils/helpers';

interface SessionCardProps {
  session: Session;
  onPress: () => void;
  fullWidth?: boolean;
}

// Cache for dynamically assigned colors
const dynamicTypeColors: Record<string, { bg: string; text: string }> = {};

/**
 * Get the appropriate color scheme for a session type
 * @param type - Session type
 * @returns Color scheme object
 */
function getTypeColor(type: string): { bg: string; text: string } {
  // Check predefined colors first
  if (TYPE_COLORS[type]) {
    return TYPE_COLORS[type];
  }

  // Check if we already assigned a color to this type
  if (dynamicTypeColors[type]) {
    return dynamicTypeColors[type];
  }

  // Assign a new color from the dynamic palette
  const colorIndex = Object.keys(dynamicTypeColors).length % DYNAMIC_COLORS.length;
  const newColor = DYNAMIC_COLORS[colorIndex];
  dynamicTypeColors[type] = newColor;

  return newColor;
}

/**
 * Get the mentor count display text
 * @param mentorIds - Array of mentor IDs
 * @returns Formatted mentor count text
 */
function getMentorCountText(mentorIds?: string[]): string {
  const count = mentorIds ? mentorIds.length : 0;
  return `${count} mentor${count !== 1 ? 's' : ''}`;
}

export function SessionCard({ session, onPress, fullWidth = false }: SessionCardProps) {
  const [pressed, setPressed] = useState(false);
  const typeColor = getTypeColor(session.type);
  const mentorCountText = getMentorCountText(session.mentorIds);

  return (
    <Pressable
      style={({ pressed: isPressed }) => [
        styles.card,
        { marginHorizontal: fullWidth ? 0 : 16 },
        (pressed || isPressed) && styles.cardPressed,
      ]}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{session.name}</Text>
        <View style={[styles.typeTag, { backgroundColor: typeColor.bg }]}>
          <Text style={[styles.typeText, { color: typeColor.text }]}>{session.type}</Text>
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
          <User size={16} color="#000" />
          <Text style={styles.detailText}>{mentorCountText}</Text>
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
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