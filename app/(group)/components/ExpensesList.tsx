// components/ExpensesList.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

interface Expense {
  id: string;
  title: string;
  amount: number;
  createdBy: string;
  createdByName: string;
  participants: Array<{
    id: string;
    name?: string;
    amount: number;
  }>;
  createdAt: any;
  category: string;
  description?: string;
  status: 'pending' | 'settled';
}

interface ExpensesListProps {
  expenses: Expense[];
  groupId?: string;
  initialAmount?: number;
  memberCount?: number;
}

export const ExpensesList: React.FC<ExpensesListProps> = ({ 
  expenses, 
  groupId, 
  initialAmount = 0, 
  memberCount = 0 
}) => {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Food & Dining': '🍕',
      'Transportation': '🚗',
      'Shopping': '🛍️',
      'Entertainment': '🎬',
      'Bills & Utilities': '💡',
      'Travel': '✈️',
      'Healthcare': '🏥',
      'Education': '📚',
      'General': '💰',
    };
    return icons[category] || '💰';
  };

  if (expenses.length === 0) {
    return (
      <View style={styles.container}>
        {/* Show initial amount if exists */}
        {initialAmount > 0 && (
          <View style={styles.initialAmountCard}>
            <View style={styles.initialAmountHeader}>
              <Text style={styles.initialAmountIcon}>🎯</Text>
              <Text style={styles.initialAmountTitle}>Initial Group Amount</Text>
            </View>
            <Text style={styles.initialAmountValue}>${initialAmount.toFixed(2)}</Text>
            <Text style={styles.initialAmountDescription}>
              Set by group admin • Each member owes ${memberCount > 0 ? (initialAmount / memberCount).toFixed(2) : '0.00'}
            </Text>
            <View style={styles.initialAmountFooter}>
              <Text style={styles.initialAmountFooterText}>
                💡 This amount is already included in your balance calculations
              </Text>
            </View>
          </View>
        )}

        <View style={styles.emptyState}>
          <MaterialIcons name="receipt-long" size={60} color="#ccc" />
          <Text style={styles.emptyStateTitle}>
            {initialAmount > 0 ? 'No additional expenses yet' : 'No expenses yet'}
          </Text>
          <Text style={styles.emptyStateText}>
            {initialAmount > 0 
              ? 'Start adding shared expenses on top of the initial amount'
              : 'Start adding expenses to split with your group'
            }
          </Text>
          <TouchableOpacity
            style={styles.addExpenseBtn}
            onPress={() => router.push(`/add-expense/${groupId}`)}
          >
            <Text style={styles.addExpenseBtnText}>
              {initialAmount > 0 ? 'Add Expense' : 'Add First Expense'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Group expenses by date
  const groupedExpenses = expenses.reduce((groups: Record<string, Expense[]>, expense) => {
    const dateKey = formatDate(expense.createdAt);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(expense);
    return groups;
  }, {});

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses ({expenses.length})</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push(`/add-expense/${groupId}`)}
        >
          <MaterialIcons name="add" size={24} color="#6F2BD4FF" />
        </TouchableOpacity>
      </View>

      {Object.entries(groupedExpenses).map(([dateGroup, groupExpenses]) => (
        <View key={dateGroup} style={styles.dateGroup}>
          <Text style={styles.dateHeader}>{dateGroup}</Text>
          {groupExpenses.map((expense) => (
            <TouchableOpacity
              key={expense.id}
              style={styles.expenseCard}
              onPress={() => router.push(`/expense/${expense.id}`)}
            >
              <View style={styles.expenseHeader}>
                <View style={styles.expenseMainInfo}>
                  <View style={styles.categoryIcon}>
                    <Text style={styles.categoryEmoji}>
                      {getCategoryIcon(expense.category)}
                    </Text>
                  </View>
                  <View style={styles.expenseDetails}>
                    <Text style={styles.expenseTitle} numberOfLines={1}>
                      {expense.title}
                    </Text>
                    <Text style={styles.expenseCreator}>
                      Paid by {expense.createdByName}
                    </Text>
                  </View>
                </View>
                <View style={styles.expenseAmount}>
                  <Text style={styles.amountText}>${expense.amount.toFixed(2)}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          expense.status === 'settled' ? '#d4edda' : '#fff3cd',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            expense.status === 'settled' ? '#155724' : '#856404',
                        },
                      ]}
                    >
                      {expense.status}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.expenseFooter}>
                <Text style={styles.participantCount}>
                  {expense.participants.length} participant{expense.participants.length !== 1 ? 's' : ''}
                </Text>
                <View style={styles.splitInfo}>
                  <Text style={styles.splitText}>
                    Your share: ${(
                      expense.participants.find(p => p.id === 'current-user')?.amount || 0
                    ).toFixed(2)}
                  </Text>
                </View>
              </View>

              {expense.description && (
                <Text style={styles.expenseDescription} numberOfLines={2}>
                  {expense.description}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  initialAmountCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#6F2BD4FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  initialAmountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  initialAmountIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  initialAmountTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  initialAmountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6F2BD4FF',
    marginBottom: 8,
  },
  initialAmountDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  initialAmountFooter: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
  },
  initialAmountFooterText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    padding: 8,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  expenseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  expenseMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  expenseCreator: {
    fontSize: 12,
    color: '#666',
  },
  expenseAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6F2BD4FF',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantCount: {
    fontSize: 12,
    color: '#666',
  },
  splitInfo: {
    alignItems: 'flex-end',
  },
  splitText: {
    fontSize: 12,
    color: '#6F2BD4FF',
    fontWeight: '500',
  },
  expenseDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  addExpenseBtn: {
    backgroundColor: '#6F2BD4FF',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addExpenseBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});