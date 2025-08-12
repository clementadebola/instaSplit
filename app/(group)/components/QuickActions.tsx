// components/QuickActions.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

interface QuickActionsProps {
  groupId?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ groupId }) => {
  const router = useRouter();

  if (!groupId) return null;

  const handleActionPress = (route: string) => {
    try {
      router.push(route as any);
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  };

  const actions = [
    {
      id: 'add-expense',
      title: 'Add Expense',
      subtitle: 'Split a new bill',
      iconType: 'Ionicons',
      iconName: 'add-circle-outline',
      color: '#6F2BD4FF',
      route: `/add-expense/${encodeURIComponent(groupId)}`,
    },
    {
      id: 'settle-up',
      title: 'Settle Up',
      subtitle: 'Record a payment',
      iconType: 'MaterialIcons',
      iconName: 'account-balance-wallet',
      color: '#28A745',
      route: `/(group)/screen/settleUp?groupId=${encodeURIComponent(groupId)}`,
    },
    {
      id: 'view-balances',
      title: 'View All Balances',
      subtitle: 'See who owes what',
      iconType: 'Ionicons',
      iconName: 'analytics-outline',
      color: '#17A2B8',
      route: `/balances/${encodeURIComponent(groupId)}`,
    },
  ];

  return (
    <View style={styles.actionsCard}>
      <Text style={styles.actionsTitle}>Quick Actions</Text>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={styles.actionButton}
          onPress={() => handleActionPress(action.route)}
        >
          <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
            {action.iconType === 'Ionicons' ? (
              <Ionicons name={action.iconName as any} size={24} color={action.color} />
            ) : (
              <MaterialIcons name={action.iconName as any} size={24} color={action.color} />
            )}
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  actionsCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
});