/**
 * ConnectionCard Component
 * Displays a connection card with user information, type, and interaction buttons
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Building, Heart, User, Calendar, Users } from 'lucide-react-native';
import { Connection } from '@/types';
import { TYPE_COLORS, BANNER_IMAGES, DEFAULT_IMAGES } from '@/utils/constants';

interface ConnectionCardProps {
  connection: Connection;
  onPress: () => void;
  onToggleFavorite?: () => void;
  showFavoriteButton?: boolean;
  sessionCount?: number | undefined;
  meetingCount?: number;
  fullWidth?: boolean;
  isAdmin?: boolean;
}

/**
 * Get the appropriate color scheme for a connection type
 * @param type - Connection type
 * @returns Color scheme object
 */
function getTypeColor(type: string): { bg: string; text: string } {
  return TYPE_COLORS[type] || TYPE_COLORS.Default;
}

/**
 * Get the appropriate image source for a profile image
 * @param profileImage - Profile image path or URI
 * @returns Image source object
 */
function getImageSource(profileImage?: string): any {
  if (!profileImage) {
    return DEFAULT_IMAGES.avatar;
  }

  // Check if it's a local banner image
  if (BANNER_IMAGES[profileImage as keyof typeof BANNER_IMAGES]) {
    return BANNER_IMAGES[profileImage as keyof typeof BANNER_IMAGES];
  }

  // Check if it's a number (local require)
  if (typeof profileImage === 'number') {
    return profileImage;
  }

  // Return as URI
  return { uri: profileImage };
}

/**
 * Format the role and organization display text
 * @param role - User role
 * @param organization - Organization name
 * @returns Formatted display text
 */
function formatRoleAndOrganization(role?: string, organization?: string): string | null {
  if (role && organization) {
    return `${role} | ${organization}`;
  } else if (role) {
    return role;
  } else if (organization) {
    return organization;
  }
  return null;
}

/**
 * Get the session count display text
 * @param sessionCount - Number of sessions
 * @returns Formatted session count text
 */
function getSessionCountText(sessionCount?: number): string {
  const count = typeof sessionCount === 'number' ? sessionCount : 0;
  return `${count} session${count === 1 ? '' : 's'}`;
}

/**
 * Get the meeting count display text
 * @param meetingCount - Number of meetings
 * @param linkedMeetingIds - Array of linked meeting IDs
 * @returns Formatted meeting count text
 */
function getMeetingCountText(meetingCount?: number, linkedMeetingIds?: string[]): string {
  const count = typeof meetingCount === 'number' ? meetingCount : (linkedMeetingIds || []).length;
  return `${count} meeting${count === 1 ? '' : 's'}`;
}

export function ConnectionCard({
  connection,
  onPress,
  onToggleFavorite,
  showFavoriteButton = true,
  sessionCount,
  meetingCount,
  fullWidth = false,
  isAdmin = false,
}: ConnectionCardProps) {
  const [pressed, setPressed] = useState(false);
  const typeColor = getTypeColor(connection.type);
  const imageSource = getImageSource(connection.profileImage);
  const roleOrgText = formatRoleAndOrganization(connection.role, connection.organization);
  const sessionCountText = getSessionCountText(sessionCount);
  const meetingCountText = getMeetingCountText(meetingCount, connection.linkedMeetingIds);

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
      {/* Heart button positioned absolutely in top right */}
      {showFavoriteButton && !isAdmin && (
        <Pressable
          style={styles.favoriteButton}
          onPress={onToggleFavorite}
          hitSlop={16}
          accessibilityLabel={connection.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          accessibilityRole="button"
        >
          <Heart
            size={22}
            color={connection.isFavorite ? '#1976d2' : '#bdbdbd'}
            fill={connection.isFavorite ? '#1976d2' : 'none'}
            strokeWidth={2}
          />
        </Pressable>
      )}

      {/* Header row: avatar and name/role/company */}
      <View style={styles.headerRow}>
        {connection.profileImage ? (
          <Image
            source={imageSource}
            style={styles.avatarImg}
            defaultSource={DEFAULT_IMAGES.avatar}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <User size={20} color="#666" />
          </View>
        )}
        <View style={styles.headerTextColWithAvatar}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.name} numberOfLines={1}>
              {connection.firstName} {connection.lastName}
            </Text>
            <View style={[styles.typeTag, { backgroundColor: typeColor.bg, marginLeft: 8, alignSelf: 'flex-start' }]}>
              <Text style={[styles.typeText, { color: '#000' }]}>{connection.type}</Text>
            </View>
          </View>
          {/* Conditional role/company line */}
          {roleOrgText && (
            <Text style={styles.role} numberOfLines={1}>
              {roleOrgText}
            </Text>
          )}
        </View>
      </View>

      {/* Stats row: sessions and meetings */}
      <View style={styles.statsRow}>
        <Text style={styles.statText}>{sessionCountText}</Text>
        <Text style={styles.statDivider}>/</Text>
        <Text style={styles.statText}>{meetingCountText}</Text>
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
    position: 'relative',
  },
  cardPressed: {
    opacity: 0.96,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  role: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
    borderRadius: 16,
    zIndex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 8,
  },
  statText: {
    fontSize: 14,
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
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
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
    color: '#000',
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