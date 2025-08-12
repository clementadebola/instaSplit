import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Contact, Bill } from '../utils/constants';

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
  const updatePercentage = (contactId: string, percentage: string) => {
    const numPercentage = parseFloat(percentage) || 0;
    setCustomPercentages(prev => ({
      ...prev,
      [contactId]: Math.min(100, Math.max(0, numPercentage))
    }));
  };

  const getTotalBillAmount = () => bills.reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <View style={styles.stepContent}>
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
            color={splitType === 'equal' ? 'white' : '#007AFF'} 
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
            color={splitType === 'percentage' ? 'white' : '#007AFF'} 
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
                  placeholderTextColor="#999"
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
  splitTypeContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  splitTypeCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#dee2e6',
  },
  selectedSplitCard: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  splitTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginTop: 8,
    marginBottom: 4,
  },
  selectedSplitTitle: {
    color: 'white',
  },
  splitTypeDescription: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  selectedSplitDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  percentageContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  percentageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
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
    color: '#495057',
    flex: 1,
  },
  percentageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentageInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 8,
    width: 60,
    textAlign: 'center',
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  percentageSymbol: {
    fontSize: 16,
    color: '#6c757d',
    marginLeft: 8,
  },
  remainingPercentage: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
  },
  remainingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  previewCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
    textAlign: 'center',
  },
  previewContent: {
    alignItems: 'center',
  },
  previewTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  previewAmount: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 4,
  },
});