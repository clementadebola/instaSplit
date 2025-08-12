import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((step) => (
        <View key={step} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            currentStep >= step ? styles.activeStep : styles.inactiveStep
          ]}>
            <Text style={[
              styles.stepText,
              currentStep >= step ? styles.activeStepText : styles.inactiveStepText
            ]}>
              {step}
            </Text>
          </View>
          {step < 4 && (
            <View style={[
              styles.stepLine,
              currentStep > step ? styles.activeStepLine : styles.inactiveStepLine
            ]} />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'white',
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
  },
  activeStep: {
    backgroundColor: '#007AFF',
  },
  inactiveStep: {
    backgroundColor: '#e9ecef',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeStepText: {
    color: 'white',
  },
  inactiveStepText: {
    color: '#6c757d',
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  activeStepLine: {
    backgroundColor: '#007AFF',
  },
  inactiveStepLine: {
    backgroundColor: '#e9ecef',
  },
});