import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface FilterBarProps {
  types: string[];
  selectedType: string | null;
  onTypeSelect: (type: string | null) => void;
}

export default function FilterBar({ types, selectedType, onTypeSelect }: FilterBarProps) {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedType === null && styles.selectedChip
          ]}
          onPress={() => onTypeSelect(null)}
        >
          <Text style={[
            styles.filterText,
            selectedType === null && styles.selectedText
          ]}>
            All
          </Text>
        </TouchableOpacity>
        
        {types.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterChip,
              selectedType === type && styles.selectedChip
            ]}
            onPress={() => onTypeSelect(type)}
          >
            <Text style={[
              styles.filterText,
              selectedType === type && styles.selectedText
            ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  filterChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedChip: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  selectedText: {
    color: '#fff',
  },
});