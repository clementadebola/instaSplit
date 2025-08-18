// components/BalanceOverview.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from "../../../theme/themeContext";

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
  const { theme, darkMode } = useTheme();

  const getBalanceStatus = (balance: number) => {
    if (balance > 0) return { 
      text: 'You are owed money', 
      color: theme.colors.success,
      icon: '💰'
    };
    if (balance < 0) return { 
      text: 'You owe money', 
      color: theme.colors.danger,
      icon: '💸'
    };
    return { 
      text: 'You are settled up', 
      color: theme.colors.secondaryText,
      icon: '✅'
    };
  };

  const balanceStatus = getBalanceStatus(userBalance.netBalance);

  // Check if this is likely the initial state (no payments made yet)
  const isInitialState = userBalance.owes > 0 && userBalance.owed === 0;

  // Create themed styles
  const themedStyles = StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    balanceContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
      gap: 12,
    },
    balanceCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 18,
      padding: 22,
      flex: 1,
      alignItems: 'center',
      shadowColor: darkMode ? "rgba(139, 92, 246, 0.3)" : "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: darkMode ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 5,
      borderWidth: darkMode ? 1 : 0,
      borderColor: theme.colors.border,
    },
    balanceAmount: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 5,
      letterSpacing: 0.5,
    },
    balanceLabel: {
      fontSize: 14,
      color: theme.colors.secondaryText,
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    netBalanceCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      shadowColor: darkMode ? "rgba(139, 92, 246, 0.3)" : "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: darkMode ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 5,
      borderWidth: darkMode ? 1 : 0,
      borderColor: theme.colors.border,
    },
    netBalanceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    balanceIcon: {
      fontSize: 24,
      marginRight: 10,
    },
    netBalanceTitle: {
      fontSize: 14,
      color: theme.colors.secondaryText,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    netBalanceAmount: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    netBalanceSubtext: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 16,
      letterSpacing: 0.2,
    },
    paymentStatus: {
      backgroundColor: darkMode 
        ? 'rgba(245, 158, 11, 0.15)' 
        : 'rgba(245, 158, 11, 0.1)',
      borderRadius: 12,
      padding: 16,
      marginVertical: 12,
      alignSelf: 'stretch',
      borderWidth: 1,
      borderColor: darkMode 
        ? 'rgba(245, 158, 11, 0.3)' 
        : 'rgba(245, 158, 11, 0.2)',
    },
    paymentStatusText: {
      fontSize: 13,
      color: darkMode ? '#FCD34D' : '#D97706',
      textAlign: 'center',
      lineHeight: 18,
      fontWeight: '500',
      letterSpacing: 0.2,
    },
    breakdownContainer: {
      alignSelf: 'stretch',
      backgroundColor: darkMode 
        ? 'rgba(139, 92, 246, 0.1)' 
        : 'rgba(111, 43, 212, 0.05)',
      borderRadius: 12,
      padding: 16,
      marginTop: 12,
      borderWidth: darkMode ? 1 : 0,
      borderColor: theme.colors.border,
    },
    breakdownTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 10,
      letterSpacing: 0.3,
    },
    breakdownItem: {
      fontSize: 13,
      color: theme.colors.secondaryText,
      marginBottom: 4,
      lineHeight: 18,
      fontWeight: '500',
    },
    statusIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginTop: 2,
      shadowColor: balanceStatus.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 16,
      letterSpacing: 0.5,
    },
  });

  return (
    <View style={themedStyles.container}>
      <Text style={themedStyles.sectionTitle}>Your Balance</Text>
      
      {/* Individual Balance Cards */}
      <View style={themedStyles.balanceContainer}>
        <View style={themedStyles.balanceCard}>
          <Text style={[themedStyles.balanceAmount, { color: theme.colors.danger }]}>
            ${userBalance.owes.toFixed(2)}
          </Text>
          <Text style={themedStyles.balanceLabel}>You Owe</Text>
          <View style={[themedStyles.statusIndicator, { backgroundColor: theme.colors.danger }]} />
        </View>
        
        <View style={themedStyles.balanceCard}>
          <Text style={[themedStyles.balanceAmount, { color: theme.colors.success }]}>
            ${userBalance.owed.toFixed(2)}
          </Text>
          <Text style={themedStyles.balanceLabel}>You're Owed</Text>
          <View style={[themedStyles.statusIndicator, { backgroundColor: theme.colors.success }]} />
        </View>
      </View>

      {/* Net Balance Summary */}
      <View style={themedStyles.netBalanceCard}>
        <View style={themedStyles.headerRow}>
          <Text style={themedStyles.balanceIcon}>{balanceStatus.icon}</Text>
          <Text style={themedStyles.netBalanceTitle}>Net Balance</Text>
          <View style={[themedStyles.statusIndicator, { backgroundColor: balanceStatus.color, marginLeft: 8 }]} />
        </View>
        
        <Text
          style={[
            themedStyles.netBalanceAmount,
            { color: balanceStatus.color }
          ]}
        >
          {userBalance.netBalance > 0 ? '+' : ''}
          ${Math.abs(userBalance.netBalance).toFixed(2)}
        </Text>
        
        <Text style={[themedStyles.netBalanceSubtext, { color: balanceStatus.color }]}>
          {balanceStatus.text}
        </Text>
        
        {/* Payment Status */}
        {isInitialState && (
          <View style={themedStyles.paymentStatus}>
            <Text style={themedStyles.paymentStatusText}>
              💡 No payments made yet. You owe your share of the group expenses.
            </Text>
          </View>
        )}
        
        {/* Balance Breakdown */}
        {(userBalance.owes > 0 || userBalance.owed > 0) && (
          <View style={themedStyles.breakdownContainer}>
            <Text style={themedStyles.breakdownTitle}>Breakdown</Text>
            {userBalance.owed > 0 && (
              <Text style={themedStyles.breakdownItem}>
                • Others owe you: ${userBalance.owed.toFixed(2)}
              </Text>
            )}
            {userBalance.owes > 0 && (
              <Text style={themedStyles.breakdownItem}>
                • You owe: ${userBalance.owes.toFixed(2)}
              </Text>
            )}
            {isInitialState && (
              <Text style={themedStyles.breakdownItem}>
                • This includes your share of the initial group amount
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};