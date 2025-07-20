import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView , useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const banners = [
  require('@/assets/images/banners/1.png'),
  require('@/assets/images/banners/2.png'),
  require('@/assets/images/banners/3.png'),
  require('@/assets/images/banners/4.png'),
  require('@/assets/images/banners/5.png'),
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

function getDateString() {
  const today = new Date();
  return today.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

export default function HomeScreen() {
  const [bannerIndex, setBannerIndex] = useState(0);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const headerHeight = 110; // Adjust if needed
  const navHeight = 70; // Adjust if needed
  const bannerHeight = height - insets.top - insets.bottom - headerHeight - navHeight;

  const handleScroll = (event: any) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / width);
    setBannerIndex(slide);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {/* Add empty space to preserve layout */}
      <View style={{ height: 66 }} />
      <View style={styles.bannerSection}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={[styles.bannerScrollView, { height: bannerHeight }]}
        >
          {banners.map((img, idx) => (
            <View
              key={idx}
              style={{ width, height: bannerHeight, borderRadius: 20, overflow: 'hidden', alignSelf: 'center' }}
            >
              <Image
                source={img}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
          ))}
        </ScrollView>
        <View style={styles.dotsRow}>
          {banners.map((_, idx) => (
            <View
              key={idx}
              style={[styles.dot, bannerIndex === idx && styles.dotActive]}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  dateText: {
    color: '#aaa',
    fontSize: 16,
    marginLeft: 24,
    marginTop: 16,
    marginBottom: 2,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginLeft: 24,
    marginBottom: 24,
  },
  emoji: {
    fontSize: 24,
  },
  bannerSection: {
    flex: 1,
    justifyContent: 'center',
  },
  bannerScrollView: {
    width: '100%',
  },
  bannerImage: {
    borderRadius: 20,
    marginHorizontal: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    paddingBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#1976d2',
  },
}); 