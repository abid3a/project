import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Building, Heart, User } from 'lucide-react-native';
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
  Mentor: { bg: '#e8f5e9', text: '#388e3c' },
  Customer: { bg: '#fffde7', text: '#fbc02d' },
  EIR: { bg: '#e3f2fd', text: '#1976d2' },
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
  const typeColor = typeColors[connection.type] || { bg: '#f5f5f5', text: '#888' };
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
      <View style={styles.topRow}>
        <View style={styles.avatarWrapper}>
          {connection.profileImage ? (
            typeof connection.profileImage === 'number' ? (
              <Image source={connection.profileImage} style={styles.avatarImg} />
            ) : bannerMap[connection.profileImage] ? (
              <Image source={bannerMap[connection.profileImage]} style={styles.avatarImg} />
            ) : (
              <Image 
                source={{ uri: connection.profileImage }} 
                style={styles.avatarImg} 
                onError={() => {}} 
                defaultSource={defaultAvatar} 
              />
            )
          ) : (
            <View style={styles.avatarFallback}>
              <User size={24} color="#666" />
            </View>
          )}
        </View>
        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {connection.firstName} {connection.lastName}
            </Text>
            {showFavoriteButton && (
              <Pressable 
                style={styles.favoriteButton}
                onPress={onToggleFavorite}
                hitSlop={10}
              >
                <Heart 
                  size={22} 
                  color={connection.isFavorite ? "#1976d2" : "#bdbdbd"}
                  fill={connection.isFavorite ? "#1976d2" : "none"}
                />
              </Pressable>
            )}
          </View>
          <View style={styles.roleRow}>
            <Text style={styles.role} numberOfLines={1}>{connection.role}</Text>
            <View style={[styles.typeTag, { backgroundColor: typeColor.bg }]}> 
              <Text style={[styles.typeText, { color: typeColor.text }]}>{connection.type}</Text>
            </View>
          </View>
          <View style={styles.orgRow}>
            <Building size={13} color="#bdbdbd" />
            <Text style={styles.organization} numberOfLines={1}>{connection.organization}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.bio} numberOfLines={2}>{connection.bio}</Text>
      <View style={styles.statsRow}>
        {typeof sessionCount === 'number' && (
          <Text style={styles.statText}>{sessionCount} session{sessionCount !== 1 ? 's' : ''}</Text>
        )}
        {typeof sessionCount === 'number' && <Text style={styles.statDot}>·</Text>}
        <Text style={styles.statText}>{typeof meetingCount === 'number' ? meetingCount : (connection.linkedMeetingIds || []).length} meeting{(typeof meetingCount === 'number' ? meetingCount : (connection.linkedMeetingIds || []).length) !== 1 ? 's' : ''}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e3e8ef',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.96, // Subtle feedback
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    resizeMode: 'cover',
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    flexShrink: 1,
    marginRight: 8,
  },
  favoriteButton: {
    marginLeft: 8,
    padding: 4,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    justifyContent: 'space-between',
  },
  role: {
    fontSize: 13,
    color: '#000',
    marginRight: 8,
    flexShrink: 1,
    flexGrow: 1,
  },
  typeTag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 0,
    flexShrink: 0,
    alignSelf: 'flex-end',
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  orgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  organization: {
    fontSize: 12,
    color: '#000',
    marginLeft: 4,
    maxWidth: 120,
  },
  bio: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
  },
  statDot: {
    fontSize: 14,
    color: '#000',
    marginHorizontal: 6,
    fontWeight: 'bold',
  },
});