// components/BalanceOverview.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface UserBalance {
  owes: number;
  owed: number;
  netBalance: number;
}

interface BalanceOverviewProps {
  userBalance: UserBalance;
}

export const BalanceOverview: React.FC<BalanceOverviewProps> = ({ userBalance }) => {
  const getBalanceStatus = (balance: number) => {
    if (balance > 0) return { 
      text: 'You are owed money', 
      color: '#28A745',
      icon: '💰'
    };
    if (balance < 0) return { 
      text: 'You owe money', 
      color: '#DC3545',
      icon: '💸'
    };
    return { 
      text: 'You are settled up', 
      color: '#6c757d',
      icon: '✅'
    };
  };

  const balanceStatus = getBalanceStatus(userBalance.netBalance);

  // Check if this is likely the initial state (no payments made yet)
  const isInitialState = userBalance.owes > 0 && userBalance.owed === 0;

  return (
    <View style={styles.container}>
      {/* Individual Balance Cards */}
      <View style={styles.balanceContainer}>
        <View style={styles.balanceCard}>
          <Text style={[styles.balanceAmount, { color: '#DC3545' }]}>
            ${userBalance.owes.toFixed(2)}
          </Text>
          <Text style={styles.balanceLabel}>You Owe</Text>
        </View>
        <View style={styles.balanceCard}>
          <Text style={[styles.balanceAmount, { color: '#28A745' }]}>
            ${userBalance.owed.toFixed(2)}
          </Text>
          <Text style={styles.balanceLabel}>You're Owed</Text>
        </View>
      </View>

      {/* Net Balance Summary */}
      <View style={styles.netBalanceCard}>
        <View style={styles.netBalanceHeader}>
          <Text style={styles.balanceIcon}>{balanceStatus.icon}</Text>
          <Text style={styles.netBalanceTitle}>Your Balance</Text>
        </View>
        <Text
          style={[
            styles.netBalanceAmount,
            { color: balanceStatus.color }
          ]}
        >
          {userBalance.netBalance > 0 ? '+' : ''}
          ${Math.abs(userBalance.netBalance).toFixed(2)}
        </Text>
        <Text style={[styles.netBalanceSubtext, { color: balanceStatus.color }]}>
          {balanceStatus.text}
        </Text>
        
        {/* Payment Status */}
        {isInitialState && (
          <View style={styles.paymentStatus}>
            <Text style={styles.paymentStatusText}>
              💡 No payments made yet. You owe your share of the group expenses.
            </Text>
          </View>
        )}
        
        {/* Balance Breakdown */}
        {(userBalance.owes > 0 || userBalance.owed > 0) && (
          <View style={styles.breakdownContainer}>
            <Text style={styles.breakdownTitle}>Breakdown:</Text>
            {userBalance.owed > 0 && (
              <Text style={styles.breakdownItem}>
                • Others owe you: ${userBalance.owed.toFixed(2)}
              </Text>
            )}
            {userBalance.owes > 0 && (
              <Text style={styles.breakdownItem}>
                • You owe: ${userBalance.owes.toFixed(2)}
              </Text>
            )}
            {isInitialState && (
              <Text style={styles.breakdownItem}>
                • This includes your share of the initial group amount
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: (width - 55) / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  netBalanceCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  netBalanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  netBalanceTitle: {
    fontSize: 14,
    color: '#666',
  },
  netBalanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  netBalanceSubtext: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
  },
  paymentStatus: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    alignSelf: 'stretch',
  },
  paymentStatusText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 16,
  },
  breakdownContainer: {
    alignSelf: 'stretch',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  breakdownTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 6,
  },
  breakdownItem: {
    fontSize: 12,
    color: '#555',
    marginBottom: 2,
  },
});