import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Bill } from '../utils/constants';
import { useTheme } from '../../../theme/themeContext';

interface AddBillsStepProps {
  bills: Bill[];
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>;
  currentUserId: string;
}

export default function AddBillsStep({
  bills,
  setBills,
  currentUserId
}: AddBillsStepProps) {
  const [newBillName, setNewBillName] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');
  const { theme } = useTheme();

  const addBill = () => {
    if (!newBillName.trim()) {
      Alert.alert('Error', 'Please enter a bill name');
      return;
    }
    
    const amount = parseFloat(newBillAmount.trim());
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const bill: Bill = {
      id: Date.now().toString(),
      name: newBillName.trim(),
      amount: amount,
      paidBy: currentUserId,
      date: new Date().toISOString()
    };
    
    setBills(prev => [...prev, bill]);
    setNewBillName('');
    setNewBillAmount('');
  };

  const removeBill = (billId: string) => {
    setBills(prev => prev.filter(bill => bill.id !== billId));
  };

  const getTotalBillAmount = () => bills.reduce((sum, bill) => sum + bill.amount, 0);

  const styles = createStyles(theme);

  return (
    <View style={[styles.stepContent, { backgroundColor: theme.colors.background }]}>
      <Text style={styles.stepTitle}>💰 Add Bills</Text>
      <Text style={styles.stepDescription}>Add the expenses you want to split</Text>
      
      {/* Add New Bill Form */}
      <View style={styles.addBillCard}>
        <View style={styles.addBillHeader}>
          <Text style={styles.addBillTitle}>Add New Bill</Text>
          <Text style={styles.addBillSubtitle}>Enter bill details below</Text>
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bill Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Dinner, Uber, Groceries..."
              value={newBillName}
              onChangeText={setNewBillName}
              maxLength={30}
              placeholderTextColor={theme.colors.secondaryText}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={[styles.input, styles.amountInput]}
                placeholder="0.00"
                value={newBillAmount}
                onChangeText={setNewBillAmount}
                keyboardType="decimal-pad"
                placeholderTextColor={theme.colors.secondaryText}
              />
            </View>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.addButton,
              (!newBillName.trim() || !newBillAmount.trim()) && styles.disabledButton
            ]} 
            onPress={addBill}
            disabled={!newBillName.trim() || !newBillAmount.trim()}
          >
            <Feather name="plus" size={20} color="white" />
            <Text style={styles.addButtonText}>Add Bill</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bills List */}
      {bills.length > 0 && (
        <View style={styles.billsSection}>
          <View style={styles.billsHeader}>
            <Text style={styles.billsListTitle}>Added Bills ({bills.length})</Text>
            <Text style={styles.billsSubtitle}>Tap trash icon to remove</Text>
          </View>
          
          <View style={styles.billsContainer}>
            {bills.map((bill, index) => (
              <View key={bill.id} style={[
                styles.billCard,
                index === bills.length - 1 && styles.lastBillCard
              ]}>
                <View style={styles.billIcon}>
                  <Text style={styles.billIconText}>💰</Text>
                </View>
                
                <View style={styles.billInfo}>
                  <Text style={styles.billName}>{bill.name}</Text>
                  <Text style={styles.billDate}>
                    Added {new Date(bill.date).toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.billAmountContainer}>
                  <Text style={styles.billAmount}>${bill.amount.toFixed(2)}</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.deleteBillButton}
                  onPress={() => removeBill(bill.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="trash-2" size={18} color={theme.colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          {/* Total Summary */}
          <View style={styles.totalCard}>
            <View style={styles.totalContent}>
              <View style={styles.totalIcon}>
                <Feather name="phone" size={20} color="white" />
              </View>
              <View style={styles.totalInfo}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalAmount}>${getTotalBillAmount().toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Empty State */}
      {bills.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📝</Text>
          <Text style={styles.emptyStateTitle}>No bills added yet</Text>
          <Text style={styles.emptyStateDescription}>
            Add your first bill above to get started with splitting expenses
          </Text>
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
  
  // Add Bill Form Styles
  addBillCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.dark ? 'rgba(139, 92, 246, 0.3)' : '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: theme.dark ? 0.3 : 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addBillHeader: {
    marginBottom: 20,
  },
  addBillTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  addBillSubtitle: {
    fontSize: 14,
    color: theme.colors.secondaryText,
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: theme.dark ? 'rgba(139, 92, 246, 0.1)' : '#f8f9fa',
    color: theme.colors.text,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.dark ? 'rgba(139, 92, 246, 0.1)' : '#f8f9fa',
    paddingLeft: 16,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: theme.colors.secondaryText,
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  
  // Bills List Styles
  billsSection: {
    marginBottom: 20,
  },
  billsHeader: {
    marginBottom: 16,
  },
  billsListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  billsSubtitle: {
    fontSize: 14,
    color: theme.colors.secondaryText,
  },
  billsContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  billCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  lastBillCard: {
    borderBottomWidth: 0,
  },
  billIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.dark ? 'rgba(139, 92, 246, 0.2)' : '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  billIconText: {
    fontSize: 18,
  },
  billInfo: {
    flex: 1,
  },
  billName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  billDate: {
    fontSize: 12,
    color: theme.colors.secondaryText,
  },
  billAmountContainer: {
    marginRight: 12,
  },
  billAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  deleteBillButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.dark ? 'rgba(239, 68, 68, 0.2)' : '#ffebee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Total Card Styles
  totalCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  totalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  totalInfo: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  
  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
  },
});