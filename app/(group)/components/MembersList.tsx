// components/MembersList.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

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
  const getBalanceColor = (balance: number) => {
    if (balance > 0) return '#28A745'; // Green for owed money
    if (balance < 0) return '#DC3545'; // Red for owing money
    return '#6c757d'; // Gray for settled
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Members ({members.length})</Text>
        <TouchableOpacity style={styles.summaryButton}>
          <MaterialIcons name="info-outline" size={20} color="#6F2BD4FF" />
        </TouchableOpacity>
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>${totalOwed.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Total Owed</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>${totalOwing.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Total Owing</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{settledCount}</Text>
            <Text style={styles.summaryLabel}>Settled</Text>
          </View>
        </View>
      </View>

      {/* Members List */}
      <View style={styles.membersList}>
        {sortedMembers.map((member) => (
          <TouchableOpacity key={member.id} style={styles.memberCard}>
            <View style={styles.memberInfo}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberInitial}>
                  {getInitials(member.name)}
                </Text>
              </View>
              <View style={styles.memberDetails}>
                <View style={styles.memberNameRow}>
                  <Text style={styles.memberName} numberOfLines={1}>
                    {member.name}
                  </Text>
                  {member.isAdmin && (
                    <View style={styles.adminBadge}>
                      <Text style={styles.adminBadgeText}>Admin</Text>
                    </View>
                  )}
                </View>
                {member.email && (
                  <Text style={styles.memberEmail} numberOfLines={1}>
                    {member.email}
                  </Text>
                )}
                <Text style={styles.balanceStatus}>
                  {getBalanceText(member.balance)}
                </Text>
              </View>
            </View>

            <View style={styles.balanceInfo}>
              <Text
                style={[
                  styles.balanceAmount,
                  { color: getBalanceColor(member.balance) }
                ]}
              >
                {member.balance > 0 ? '+' : ''}
                ${Math.abs(member.balance).toFixed(2)}
              </Text>
              
              {/* Balance indicator */}
              <View
                style={[
                  styles.balanceIndicator,
                  { backgroundColor: getBalanceColor(member.balance) }
                ]}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Settlement Options */}
      {totalOwing > 0 && (
        <View style={styles.settlementCard}>
          <Text style={styles.settlementTitle}>Quick Settlement</Text>
          <Text style={styles.settlementText}>
            Simplify payments between members
          </Text>
          <TouchableOpacity style={styles.settlementButton}>
            <MaterialIcons name="account-balance-wallet" size={20} color="#fff" />
            <Text style={styles.settlementButtonText}>Settle All Debts</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  summaryButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    padding: 8,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: '#dee2e6',
    marginHorizontal: 12,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  membersList: {
    marginBottom: 20,
  },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6F2BD4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberDetails: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
    flex: 1,
  },
  adminBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  memberEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  balanceStatus: {
    fontSize: 11,
    color: '#999',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  balanceInfo: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  settlementCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settlementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  settlementText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  settlementButton: {
    backgroundColor: '#6F2BD4FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  settlementButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});