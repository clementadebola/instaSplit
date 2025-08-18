import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/themeContext';

interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const { theme, darkMode } = useTheme();

  // Create theme-aware styles
  const themedStyles = StyleSheet.create({
    stepIndicator: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 20,
      backgroundColor: theme.colors.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    stepContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    stepCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    activeStep: {
      backgroundColor: theme.colors.primary,
      transform: [{ scale: 1.1 }],
      shadowOpacity: 0.3,
      shadowColor: theme.colors.primary,
    },
    inactiveStep: {
      backgroundColor: darkMode 
        ? 'rgba(148, 163, 184, 0.2)' 
        : 'rgba(148, 163, 184, 0.3)',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    stepText: {
      fontSize: 14,
      fontWeight: '600',
    },
    activeStepText: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    inactiveStepText: {
      color: theme.colors.secondaryText,
    },
    stepLine: {
      width: 40,
      height: 3,
      marginHorizontal: 8,
      borderRadius: 1.5,
    },
    activeStepLine: {
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 1,
    },
    inactiveStepLine: {
      backgroundColor: darkMode 
        ? 'rgba(148, 163, 184, 0.2)' 
        : 'rgba(148, 163, 184, 0.3)',
    },
  });

  return (
    <View style={themedStyles.stepIndicator}>
      {[1, 2, 3, 4].map((step) => (
        <View key={step} style={themedStyles.stepContainer}>
          <View style={[
            themedStyles.stepCircle,
            currentStep >= step ? themedStyles.activeStep : themedStyles.inactiveStep
          ]}>
            <Text style={[
              themedStyles.stepText,
              currentStep >= step ? themedStyles.activeStepText : themedStyles.inactiveStepText
            ]}>
              {step}
            </Text>
          </View>
          {step < 4 && (
            <View style={[
              themedStyles.stepLine,
              currentStep > step ? themedStyles.activeStepLine : themedStyles.inactiveStepLine
            ]} />
          )}
        </View>
      ))}
    </View>
  );
}