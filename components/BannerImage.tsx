import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Animated } from 'react-native';

interface BannerImageProps {
  source: any;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  height?: number;
}

export const BannerImage: React.FC<BannerImageProps> = ({ 
  source, 
  style, 
  resizeMode = 'cover',
  height = 250
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const handleLoad = () => {
    setIsLoading(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  useEffect(() => {
    // Reset state when source changes
    setIsLoading(true);
    setHasError(false);
    fadeAnim.setValue(0);
  }, [source, fadeAnim]);

  return (
    <View style={[styles.container, { height }, style]}>
      <Animated.Image
        source={source}
        style={[styles.image, { opacity: fadeAnim }]}
        resizeMode={resizeMode}
        onLoad={handleLoad}
        onError={handleError}
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
        </View>
      )}
      {hasError && (
        <View style={styles.errorContainer}>
          <View style={styles.errorPlaceholder} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorPlaceholder: {
    width: '80%',
    height: '80%',
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
  },
}); 