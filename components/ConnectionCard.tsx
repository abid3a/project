import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Building, Heart, User, Calendar, Users } from 'lucide-react-native';
import { Connection } from '@/types';

interface ConnectionCardProps {
  connection: Connection;
  onPress: () => void;
  onToggleFavorite?: () => void;
  showFavoriteButton?: boolean;
  sessionCount?: number | undefined;
  meetingCount?: number;
}

const typeColors: Record<string, { bg: string; text: string }> = {
  Mentor: { bg: '#c8e6c9', text: '#1b5e20' }, // deeper pastel green, stronger text
  Customer: { bg: '#fff9c4', text: '#f57c00' }, // deeper pastel yellow, stronger text
  EIR: { bg: '#bbdefb', text: '#0d47a1' }, // deeper pastel blue, stronger text
  Meeting: { bg: '#e1bee7', text: '#6a1b9a' }, // deeper pastel purple, stronger text
  Admin: { bg: '#ffccbc', text: '#bf360c' }, // deeper pastel orange, stronger text
  Default: { bg: '#eeeeee', text: '#424242' },
};

// Map for local banner images
const bannerMap: Record<string, any> = {
  'banners/1.png': require('@/assets/images/banners/1.png'),
  'banners/2.png': require('@/assets/images/banners/2.png'),
  'banners/3.png': require('@/assets/images/banners/3.png'),
  'banners/4.png': require('@/assets/images/banners/4.png'),
  'banners/5.png': require('@/assets/images/banners/5.png'),
};
const defaultAvatar = require('@/assets/images/icon.png');

export function ConnectionCard({ 
  connection, 
  onPress, 
  onToggleFavorite,
  showFavoriteButton = true,
  sessionCount,
  meetingCount
}: ConnectionCardProps) {
  const [pressed, setPressed] = useState(false);
  const typeColor = typeColors[connection.type] || typeColors.Default;
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
      {/* Header row: avatar (if any), name/role/company, heart icon */}
      <View style={styles.headerRow}>
        {connection.profileImage && (
          <Image
            source={
              typeof connection.profileImage === 'number'
                ? connection.profileImage
                : bannerMap[connection.profileImage] || { uri: connection.profileImage }
            }
            style={styles.avatarImg}
          />
        )}
        <View style={styles.headerTextColWithAvatar}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.name} numberOfLines={1}>
              {connection.firstName} {connection.lastName}
            </Text>
            <View style={[styles.typeTag, { backgroundColor: typeColor.bg, marginLeft: 8, alignSelf: 'center' }]}> 
              <Text style={[styles.typeText, { color: typeColor.text }]}>{connection.type}</Text>
            </View>
          </View>
          {/* Conditional role/company line */}
          {connection.role && connection.organization ? (
            <Text style={styles.role} numberOfLines={1}>
              {connection.role} | {connection.organization}
            </Text>
          ) : connection.role ? (
            <Text style={styles.role} numberOfLines={1}>
              {connection.role}
            </Text>
          ) : connection.organization ? (
            <Text style={styles.role} numberOfLines={1}>
              {connection.organization}
            </Text>
          ) : null}
        </View>
        {showFavoriteButton && (
          <Pressable
            style={styles.favoriteButton}
            onPress={onToggleFavorite}
            hitSlop={16}
            accessibilityLabel={connection.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            accessibilityRole="button"
          >
            <Heart
              size={22}
              color={connection.isFavorite ? "#1976d2" : "#bdbdbd"}
              fill={connection.isFavorite ? "#1976d2" : "none"}
              strokeWidth={2}
            />
          </Pressable>
        )}
      </View>
      {/* Stats row: sessions and meetings */}
      <View style={styles.statsRow}>
        <Text style={styles.statText}>
          {typeof sessionCount === 'number' ? sessionCount : 0} session{sessionCount === 1 ? '' : 's'}
        </Text>
        <Text style={styles.statDivider}>/</Text>
        <Text style={styles.statText}>
          {typeof meetingCount === 'number' ? meetingCount : (connection.linkedMeetingIds || []).length} meeting{(typeof meetingCount === 'number' ? meetingCount : (connection.linkedMeetingIds || []).length) === 1 ? '' : 's'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e3e8ef',
    padding: 18,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.96,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerTextCol: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  headerTextColWithAvatar: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  role: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  favoriteButton: {
    padding: 8,
    borderRadius: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 8,
  },
  statText: {
    fontSize: 13,
    color: '#1976d2',
    fontWeight: '600',
  },
  statDivider: {
    fontSize: 13,
    color: '#bbb',
    marginHorizontal: 6,
    fontWeight: '600',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 8, // changed from 24 for rounded rectangle
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 8, // changed from 24 for rounded rectangle
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
    minWidth: 0,
  },
  roleOrgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  typeTag: {
    borderRadius: 16, // pill shape
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 0,
    flexShrink: 0,
    alignSelf: 'flex-end',
    minWidth: 60,
    alignItems: 'center',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  orgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    marginTop: 2,
    gap: 4,
  },
  orgIcon: {
    marginRight: 4,
    alignSelf: 'center',
  },
  organization: {
    fontSize: 12,
    color: '#000',
    marginLeft: 4,
    maxWidth: 120,
  },
  bio: {
    display: 'none',
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4fa',
    borderRadius: 16, // pill shape
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 0,
    minWidth: 80,
    justifyContent: 'center',
  },
  chipIcon: {
    marginRight: 6,
    alignSelf: 'center',
  },
  chipLabel: {
    fontSize: 13,
    color: '#1976d2',
    fontWeight: '600',
    textAlignVertical: 'center',
  },
});