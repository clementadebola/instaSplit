import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Contact, Bill } from '../utils/constants';
import { useTheme } from '../../../theme/themeContext';

interface SplitOptionsStepProps {
  splitType: 'equal' | 'percentage';
  setSplitType: (type: 'equal' | 'percentage') => void;
  selectedContacts: Contact[];
  customPercentages: { [key: string]: number };
  setCustomPercentages: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
  bills: Bill[];
}

export default function SplitOptionsStep({
  splitType,
  setSplitType,
  selectedContacts,
  customPercentages,
  setCustomPercentages,
  bills
}: SplitOptionsStepProps) {
  const { theme } = useTheme();

  const updatePercentage = (contactId: string, percentage: string) => {
    const numPercentage = parseFloat(percentage) || 0;
    setCustomPercentages(prev => ({
      ...prev,
      [contactId]: Math.min(100, Math.max(0, numPercentage))
    }));
  };

  const getTotalBillAmount = () => bills.reduce((sum, bill) => sum + bill.amount, 0);

  const styles = createStyles(theme);

  return (
    <View style={[styles.stepContent, { backgroundColor: theme.colors.background }]}>
      <Text style={styles.stepTitle}>⚖️ Split Options</Text>
      <Text style={styles.stepDescription}>Choose how to divide the expenses</Text>
      
      <View style={styles.splitTypeContainer}>
        <TouchableOpacity
          style={[
            styles.splitTypeCard,
            splitType === 'equal' && styles.selectedSplitCard
          ]}
          onPress={() => setSplitType('equal')}
        >
          <MaterialIcons 
            name="equalizer" 
            size={24} 
            color={splitType === 'equal' ? 'white' : theme.colors.primary} 
          />
          <Text style={[
            styles.splitTypeTitle,
            splitType === 'equal' && styles.selectedSplitTitle
          ]}>
            Equal Split
          </Text>
          <Text style={[
            styles.splitTypeDescription,
            splitType === 'equal' && styles.selectedSplitDescription
          ]}>
            Everyone pays the same amount
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.splitTypeCard,
            splitType === 'percentage' && styles.selectedSplitCard
          ]}
          onPress={() => setSplitType('percentage')}
        >
          <MaterialIcons 
            name="pie-chart" 
            size={24} 
            color={splitType === 'percentage' ? 'white' : theme.colors.primary} 
          />
          <Text style={[
            styles.splitTypeTitle,
            splitType === 'percentage' && styles.selectedSplitTitle
          ]}>
            Custom Split
          </Text>
          <Text style={[
            styles.splitTypeDescription,
            splitType === 'percentage' && styles.selectedSplitDescription
          ]}>
            Set custom percentages
          </Text>
        </TouchableOpacity>
      </View>

      {splitType === 'percentage' && selectedContacts.length > 0 && (
        <View style={styles.percentageContainer}>
          <Text style={styles.percentageTitle}>Set Custom Percentages</Text>
          {selectedContacts.map((contact) => (
            <View key={contact.id} style={styles.percentageRow}>
              <Text style={styles.percentageName}>{contact.name}</Text>
              <View style={styles.percentageInputContainer}>
                <TextInput
                  style={styles.percentageInput}
                  placeholder="0"
                  value={customPercentages[contact.id]?.toString() || ''}
                  onChangeText={(text) => updatePercentage(contact.id, text)}
                  keyboardType="numeric"
                  maxLength={3}
                  placeholderTextColor={theme.colors.secondaryText}
                />
                <Text style={styles.percentageSymbol}>%</Text>
              </View>
            </View>
          ))}
          <View style={styles.remainingPercentage}>
            <Text style={styles.remainingText}>
              Your share: {100 - Object.values(customPercentages).reduce((sum, p) => sum + p, 0)}%
            </Text>
          </View>
        </View>
      )}

      {bills.length > 0 && (
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>💸 Split Preview</Text>
          <View style={styles.previewContent}>
            <Text style={styles.previewTotal}>Total: ${getTotalBillAmount().toFixed(2)}</Text>
            {splitType === 'equal' ? (
              <Text style={styles.previewAmount}>
                Per person: ${(getTotalBillAmount() / (selectedContacts.length + 1)).toFixed(2)}
              </Text>
            ) : (
              <View>
                {selectedContacts.map((contact) => {
                  const percentage = customPercentages[contact.id] || 0;
                  const amount = (getTotalBillAmount() * percentage) / 100;
                  return (
                    <Text key={contact.id} style={styles.previewAmount}>
                      {contact.name}: ${amount.toFixed(2)} ({percentage}%)
                    </Text>
                  );
                })}
                <Text style={styles.previewAmount}>
                  You: ${((getTotalBillAmount() * (100 - Object.values(customPercentages).reduce((sum, p) => sum + p, 0))) / 100).toFixed(2)} ({100 - Object.values(customPercentages).reduce((sum, p) => sum + p, 0)}%)
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
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
  splitTypeContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  splitTypeCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    shadowColor: theme.dark ? 'rgba(139, 92, 246, 0.2)' : '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: theme.dark ? 0.3 : 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedSplitCard: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
  },
  splitTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  selectedSplitTitle: {
    color: 'white',
  },
  splitTypeDescription: {
    fontSize: 12,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedSplitDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  percentageContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.dark ? 'rgba(139, 92, 246, 0.2)' : '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: theme.dark ? 0.3 : 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  percentageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  percentageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  percentageName: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  percentageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentageInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 8,
    width: 60,
    textAlign: 'center',
    fontSize: 16,
    backgroundColor: theme.dark ? 'rgba(139, 92, 246, 0.1)' : '#f8f9fa',
    color: theme.colors.text,
  },
  percentageSymbol: {
    fontSize: 16,
    color: theme.colors.secondaryText,
    marginLeft: 8,
  },
  remainingPercentage: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  remainingText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  previewCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.dark ? 'rgba(139, 92, 246, 0.2)' : '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: theme.dark ? 0.3 : 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  previewContent: {
    alignItems: 'center',
  },
  previewTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  previewAmount: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
});