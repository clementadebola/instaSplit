// components/QuickActions.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from "../../../theme/themeContext";

interface QuickActionsProps {
  groupId?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ groupId }) => {
  const router = useRouter();
  const { theme, darkMode } = useTheme();
  
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
      color: theme.colors.primary,
      route: `/add-expense/${encodeURIComponent(groupId)}`,
    },
    {
      id: 'settle-up',
      title: 'Settle Up',
      subtitle: 'Record a payment',
      iconType: 'MaterialIcons',
      iconName: 'account-balance-wallet',
      color: theme.colors.success,
      route: `/(group)/screen/settleUp?groupId=${encodeURIComponent(groupId)}`,
    },
    {
      id: 'view-balances',
      title: 'View All Balances',
      subtitle: 'See who owes what',
      iconType: 'Ionicons',
      iconName: 'analytics-outline',
      color: theme.colors.secondary,
      route: `/balances/${encodeURIComponent(groupId)}`,
    },
  ];

  // Create themed styles
  const themedStyles = StyleSheet.create({
    actionsCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
      shadowColor: darkMode ? "rgba(139, 92, 246, 0.3)" : "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: darkMode ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 5,
      borderWidth: darkMode ? 1 : 0,
      borderColor: theme.colors.border,
    },
    actionsTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 20,
      letterSpacing: 0.5,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: darkMode ? 'rgba(139, 92, 246, 0.05)' : 'rgba(111, 43, 212, 0.02)',
      // Remove border from last item
    },
    lastActionButton: {
      borderBottomWidth: 0,
      marginBottom: 0,
    },
    actionIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      shadowColor: darkMode ? "rgba(139, 92, 246, 0.3)" : "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    actionContent: {
      flex: 1,
    },
    actionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
      letterSpacing: 0.2,
    },
    actionSubtitle: {
      fontSize: 14,
      color: theme.colors.secondaryText,
      fontWeight: '400',
      opacity: 0.8,
    },
    actionArrow: {
      marginLeft: 8,
      opacity: 0.6,
    },
  });

  return (
    <View style={themedStyles.actionsCard}>
      <Text style={themedStyles.actionsTitle}>Quick Actions</Text>
      {actions.map((action, index) => (
        <TouchableOpacity
          key={action.id}
          style={[
            themedStyles.actionButton,
            index === actions.length - 1 && themedStyles.lastActionButton
          ]}
          onPress={() => handleActionPress(action.route)}
          activeOpacity={0.7}
        >
          <View 
            style={[
              themedStyles.actionIcon, 
              { 
                backgroundColor: `${action.color}${darkMode ? '25' : '15'}`,
                borderWidth: darkMode ? 1 : 0,
                borderColor: `${action.color}${darkMode ? '40' : '00'}`,
              }
            ]}
          >
            {action.iconType === 'Ionicons' ? (
              <Ionicons name={action.iconName as any} size={24} color={action.color} />
            ) : (
              <MaterialIcons name={action.iconName as any} size={24} color={action.color} />
            )}
          </View>
          <View style={themedStyles.actionContent}>
            <Text style={themedStyles.actionTitle}>{action.title}</Text>
            <Text style={themedStyles.actionSubtitle}>{action.subtitle}</Text>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={theme.colors.secondaryText} 
            style={themedStyles.actionArrow}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};