import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { CATEGORIES } from '../utils/constants';


interface GroupDetailsStepProps {
  groupName: string;
  setGroupName: (name: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  customCategory: string;
  setCustomCategory: (category: string) => void;
}

export default function GroupDetailsStep({
  groupName,
  setGroupName,
  selectedCategory,
  setSelectedCategory,
  customCategory,
  setCustomCategory
}: GroupDetailsStepProps) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>📝 Group Details</Text>
      <Text style={styles.stepDescription}>
        Let's start by naming your group and choosing a category
      </Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Group Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Weekend Trip, House Expenses..."
          value={groupName}
          onChangeText={setGroupName}
          maxLength={50}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category *</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoriesScrollContainer}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.name}
              style={[
                styles.categoryCard,
                selectedCategory === category.name && styles.selectedCategoryCard
              ]}
              onPress={() => {
                setSelectedCategory(category.name);
                setCustomCategory('');
              }}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryText,
                selectedCategory === category.name && styles.selectedCategoryText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <TextInput
          style={[styles.input, { marginTop: 12 }]}
          placeholder="Or enter a custom category"
          value={customCategory}
          onChangeText={(text) => {
            setCustomCategory(text);
            if (text) setSelectedCategory('');
          }}
          maxLength={30}
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 24,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#212529',
  },
  categoriesScrollContainer: {
    paddingRight: 20,
  },
  categoryCard: {
    alignItems: 'center',
    padding: 16,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#dee2e6',
    minWidth: 100,
  },
  selectedCategoryCard: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#495057',
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: 'white',
  },
});