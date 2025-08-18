// components/MembersList.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from "../../../theme/themeContext";

interface MemberBalance {
  id: string;
  name: string;
  email?: string;
  balance: number;
  isAdmin: boolean;
}

interface MembersListProps {
  members: MemberBalance[];
}

export const MembersList: React.FC<MembersListProps> = ({ members }) => {
  const { theme, darkMode } = useTheme();

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return theme.colors.success; // Green for owed money
    if (balance < 0) return theme.colors.danger; // Red for owing money
    return theme.colors.secondaryText; // Gray for settled
  };

  const getBalanceText = (balance: number) => {
    if (balance > 0) return 'Owed';
    if (balance < 0) return 'Owes';
    return 'Settled';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const sortedMembers = [...members].sort((a, b) => {
    // Admin first, then by balance (highest owed first)
    if (a.isAdmin && !b.isAdmin) return -1;
    if (!a.isAdmin && b.isAdmin) return 1;
    return b.balance - a.balance;
  });

  // Calculate summary stats
  const totalOwed = members.reduce((sum, member) => sum + (member.balance > 0 ? member.balance : 0), 0);
  const totalOwing = members.reduce((sum, member) => sum + (member.balance < 0 ? Math.abs(member.balance) : 0), 0);
  const settledCount = members.filter(member => member.balance === 0).length;

  // Create themed styles
  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      letterSpacing: 0.5,
    },
    summaryButton: {
      backgroundColor: darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(111, 43, 212, 0.1)',
      borderRadius: 20,
      padding: 10,
      borderWidth: darkMode ? 1 : 0,
      borderColor: theme.colors.border,
    },
    summaryCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      shadowColor: darkMode ? "rgba(139, 92, 246, 0.3)" : "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: darkMode ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 5,
      borderWidth: darkMode ? 1 : 0,
      borderColor: theme.colors.border,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    summaryItem: {
      flex: 1,
      alignItems: 'center',
    },
    summaryDivider: {
      width: 1,
      backgroundColor: theme.colors.border,
      marginHorizontal: 12,
      opacity: 0.6,
    },
    summaryValue: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.colors.text,
      marginBottom: 6,
      letterSpacing: 0.5,
    },
    summaryLabel: {
      fontSize: 10,
      color: theme.colors.secondaryText,
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    membersList: {
      marginBottom: 20,
    },
    memberCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: 18,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: darkMode ? "rgba(139, 92, 246, 0.2)" : "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: darkMode ? 0.2 : 0.08,
      shadowRadius: 6,
      elevation: 3,
      borderWidth: darkMode ? 1 : 0,
      borderColor: theme.colors.border,
    },
    memberInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    memberAvatar: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    memberInitial: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    memberDetails: {
      flex: 1,
    },
    memberNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    memberName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginRight: 8,
      flex: 1,
      letterSpacing: 0.2,
    },
    adminBadge: {
      backgroundColor: theme.colors.warning,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
      shadowColor: theme.colors.warning,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 1,
    },
    adminBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#fff',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    memberEmail: {
      fontSize: 13,
      color: theme.colors.secondaryText,
      marginBottom: 4,
      opacity: 0.8,
    },
    balanceStatus: {
      fontSize: 11,
      color: theme.colors.secondaryText,
      textTransform: 'uppercase',
      fontWeight: '600',
      letterSpacing: 0.5,
      opacity: 0.7,
    },
    balanceInfo: {
      alignItems: 'flex-end',
    },
    balanceAmount: {
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 6,
      letterSpacing: 0.3,
    },
    balanceIndicator: {
      width: 10,
      height: 10,
      borderRadius: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 1,
    },
    settlementCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      padding: 24,
      alignItems: 'center',
      shadowColor: darkMode ? "rgba(139, 92, 246, 0.3)" : "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: darkMode ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 5,
      borderWidth: darkMode ? 1 : 0,
      borderColor: theme.colors.border,
    },
    settlementTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 6,
      letterSpacing: 0.3,
    },
    settlementText: {
      fontSize: 14,
      color: theme.colors.secondaryText,
      marginBottom: 20,
      textAlign: 'center',
      lineHeight: 20,
    },
    settlementButton: {
      backgroundColor: theme.colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 25,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    settlementButtonText: {
      color: '#fff',
      fontWeight: '700',
      marginLeft: 8,
      fontSize: 15,
      letterSpacing: 0.3,
    },
  });

  return (
    <View style={themedStyles.container}>
      <View style={themedStyles.header}>
        <Text style={themedStyles.title}>Members ({members.length})</Text>
        <TouchableOpacity style={themedStyles.summaryButton}>
          <MaterialIcons name="info-outline" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Summary Stats */}
      <View style={themedStyles.summaryCard}>
        <View style={themedStyles.summaryRow}>
          <View style={themedStyles.summaryItem}>
            <Text style={[themedStyles.summaryValue, { color: theme.colors.success }]}>
              ${totalOwed.toFixed(2)}
            </Text>
            <Text style={themedStyles.summaryLabel}>Total Owed</Text>
          </View>
          <View style={themedStyles.summaryDivider} />
          <View style={themedStyles.summaryItem}>
            <Text style={[themedStyles.summaryValue, { color: theme.colors.danger }]}>
              ${totalOwing.toFixed(2)}
            </Text>
            <Text style={themedStyles.summaryLabel}>Total Owing</Text>
          </View>
          <View style={themedStyles.summaryDivider} />
          <View style={themedStyles.summaryItem}>
            <Text style={[themedStyles.summaryValue, { color: theme.colors.secondaryText }]}>
              {settledCount}
            </Text>
            <Text style={themedStyles.summaryLabel}>Settled</Text>
          </View>
        </View>
      </View>

      {/* Members List */}
      <View style={themedStyles.membersList}>
        {sortedMembers.map((member) => (
          <TouchableOpacity key={member.id} style={themedStyles.memberCard} activeOpacity={0.7}>
            <View style={themedStyles.memberInfo}>
              <View style={themedStyles.memberAvatar}>
                <Text style={themedStyles.memberInitial}>
                  {getInitials(member.name)}
                </Text>
              </View>
              <View style={themedStyles.memberDetails}>
                <View style={themedStyles.memberNameRow}>
                  <Text style={themedStyles.memberName} numberOfLines={1}>
                    {member.name}
                  </Text>
                  {member.isAdmin && (
                    <View style={themedStyles.adminBadge}>
                      <Text style={themedStyles.adminBadgeText}>Admin</Text>
                    </View>
                  )}
                </View>
                {member.email && (
                  <Text style={themedStyles.memberEmail} numberOfLines={1}>
                    {member.email}
                  </Text>
                )}
                <Text style={themedStyles.balanceStatus}>
                  {getBalanceText(member.balance)}
                </Text>
              </View>
            </View>

            <View style={themedStyles.balanceInfo}>
              <Text
                style={[
                  themedStyles.balanceAmount,
                  { color: getBalanceColor(member.balance) }
                ]}
              >
                {member.balance > 0 ? '+' : ''}
                ${Math.abs(member.balance).toFixed(2)}
              </Text>
              
              {/* Balance indicator */}
              <View
                style={[
                  themedStyles.balanceIndicator,
                  { backgroundColor: getBalanceColor(member.balance) }
                ]}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Settlement Options */}
      {totalOwing > 0 && (
        <View style={themedStyles.settlementCard}>
          <Text style={themedStyles.settlementTitle}>Quick Settlement</Text>
          <Text style={themedStyles.settlementText}>
            Simplify payments between members
          </Text>
          <TouchableOpacity style={themedStyles.settlementButton} activeOpacity={0.8}>
            <MaterialIcons name="account-balance-wallet" size={20} color="#fff" />
            <Text style={themedStyles.settlementButtonText}>Settle All Debts</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};