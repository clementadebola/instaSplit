import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/themeContext';
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
  const { theme, darkMode } = useTheme();

  // Create theme-aware styles
  const themedStyles = StyleSheet.create({
    stepContent: {
      padding: 20,
    },
    stepTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 8,
    },
    stepDescription: {
      fontSize: 16,
      color: theme.colors.secondaryText,
      marginBottom: 24,
      lineHeight: 22,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      backgroundColor: theme.colors.card,
      color: theme.colors.text,
      // Add focus state styling
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    categoriesScrollContainer: {
      paddingRight: 20,
    },
    categoryCard: {
      alignItems: 'center',
      padding: 16,
      marginRight: 12,
      borderRadius: 12,
      backgroundColor: theme.colors.card,
      borderWidth: 2,
      borderColor: theme.colors.border,
      minWidth: 100,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    selectedCategoryCard: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
      transform: [{ scale: 1.02 }],
    },
    categoryIcon: {
      fontSize: 24,
      marginBottom: 8,
    },
    categoryText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.text,
      textAlign: 'center',
    },
    selectedCategoryText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    customInput: {
      borderWidth: 1,
      borderColor: customCategory ? theme.colors.primary : theme.colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      backgroundColor: theme.colors.card,
      color: theme.colors.text,
      marginTop: 12,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: customCategory ? 0.2 : 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
  });

  return (
    <View style={themedStyles.stepContent}>
      <Text style={themedStyles.stepTitle}>📝 Group Details</Text>
      <Text style={themedStyles.stepDescription}>
        Let's start by naming your group and choosing a category
      </Text>
      
      <View style={themedStyles.section}>
        <Text style={themedStyles.sectionTitle}>Group Name *</Text>
        <TextInput
          style={[
            themedStyles.input,
            groupName && { 
              borderColor: theme.colors.primary,
              shadowOpacity: 0.2
            }
          ]}
          placeholder="Weekend Trip, House Expenses..."
          value={groupName}
          onChangeText={setGroupName}
          maxLength={50}
          placeholderTextColor={theme.colors.secondaryText}
        />
      </View>

      <View style={themedStyles.section}>
        <Text style={themedStyles.sectionTitle}>Category *</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={themedStyles.categoriesScrollContainer}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.name}
              style={[
                themedStyles.categoryCard,
                selectedCategory === category.name && themedStyles.selectedCategoryCard
              ]}
              onPress={() => {
                setSelectedCategory(category.name);
                setCustomCategory('');
              }}
              activeOpacity={0.8}
            >
              <Text style={themedStyles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                themedStyles.categoryText,
                selectedCategory === category.name && themedStyles.selectedCategoryText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <TextInput
          style={themedStyles.customInput}
          placeholder="Or enter a custom category"
          value={customCategory}
          onChangeText={(text) => {
            setCustomCategory(text);
            if (text) setSelectedCategory('');
          }}
          maxLength={30}
          placeholderTextColor={theme.colors.secondaryText}
        />
      </View>
    </View>
  );
}