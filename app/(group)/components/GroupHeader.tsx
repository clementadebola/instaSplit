// components/GroupHeader.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from "../../../theme/themeContext";

interface GroupDetails {
  id: string;
  title: string;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  description?: string;
  initialAmount?: number;
}

interface GroupHeaderProps {
  group: GroupDetails | null;
  totalAmount: number;
  memberCount: number;
  amountPerMember: number;
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({
  group,
  totalAmount,
  memberCount,
  amountPerMember,
}) => {
  const { theme, darkMode } = useTheme();
  
  if (!group) return null;

  // Create themed styles
  const themedStyles = StyleSheet.create({
    infoCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      padding: 24,
      marginBottom: 20,
      shadowColor: darkMode ? "rgba(139, 92, 246, 0.3)" : "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: darkMode ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 5,
      borderWidth: darkMode ? 1 : 0,
      borderColor: theme.colors.border,
    },
    groupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    groupIcon: {
      width: 70,
      height: 70,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 18,
      shadowColor: group.categoryColor || theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: darkMode ? 2 : 0,
      borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    },
    groupIconText: {
      fontSize: 32,
    },
    groupInfo: {
      flex: 1,
    },
    groupTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.text,
      marginBottom: 6,
      letterSpacing: 0.5,
    },
    groupCategory: {
      fontSize: 15,
      color: theme.colors.secondaryText,
      marginBottom: 4,
      fontWeight: '600',
      opacity: 0.8,
    },
    groupMembers: {
      fontSize: 13,
      color: theme.colors.secondaryText,
      marginBottom: 4,
      fontWeight: '500',
      opacity: 0.7,
    },
    groupTotalAmount: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    splitSummary: {
      flexDirection: 'row',
      backgroundColor: darkMode 
        ? 'rgba(139, 92, 246, 0.1)' 
        : 'rgba(111, 43, 212, 0.05)',
      borderRadius: 16,
      padding: 20,
      marginBottom: 18,
      borderWidth: darkMode ? 1 : 0,
      borderColor: theme.colors.border,
    },
    splitItem: {
      flex: 1,
      alignItems: 'center',
    },
    splitDivider: {
      width: 1,
      backgroundColor: theme.colors.border,
      marginHorizontal: 16,
      opacity: 0.6,
    },
    splitLabel: {
      fontSize: 12,
      color: theme.colors.secondaryText,
      marginBottom: 6,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    splitValue: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: 0.3,
    },
    groupDescription: {
      fontSize: 15,
      color: theme.colors.secondaryText,
      lineHeight: 22,
      backgroundColor: darkMode 
        ? 'rgba(139, 92, 246, 0.08)' 
        : 'rgba(111, 43, 212, 0.03)',
      padding: 16,
      borderRadius: 12,
      borderWidth: darkMode ? 1 : 0,
      borderColor: theme.colors.border,
      fontWeight: '500',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 16,
      letterSpacing: 0.5,
    },
    statusIndicator: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.colors.success,
      shadowColor: theme.colors.success,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 2,
    },
    categoryBadge: {
      backgroundColor: darkMode 
        ? 'rgba(139, 92, 246, 0.2)' 
        : 'rgba(111, 43, 212, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
      marginBottom: 4,
      borderWidth: darkMode ? 1 : 0,
      borderColor: theme.colors.border,
    },
    categoryBadgeText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    memberCountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    memberCountDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.secondaryText,
      marginRight: 6,
      opacity: 0.6,
    },
  });

  return (
    <View style={themedStyles.infoCard}>
      <Text style={themedStyles.sectionTitle}>Group Information</Text>
      
      <View style={themedStyles.groupHeader}>
        <View style={[themedStyles.groupIcon, { backgroundColor: group.categoryColor || theme.colors.primary }]}>
          <Text style={themedStyles.groupIconText}>{group.categoryIcon}</Text>
          <View style={themedStyles.statusIndicator} />
        </View>
        
        <View style={themedStyles.groupInfo}>
          <Text style={themedStyles.groupTitle} numberOfLines={2}>
            {group.title}
          </Text>
          
          <View style={themedStyles.categoryBadge}>
            <Text style={themedStyles.categoryBadgeText}>{group.category}</Text>
          </View>
          
          <View style={themedStyles.memberCountContainer}>
            <View style={themedStyles.memberCountDot} />
            <Text style={themedStyles.groupMembers}>
              {memberCount} member{memberCount !== 1 ? 's' : ''}
            </Text>
          </View>
          
          <Text style={themedStyles.groupTotalAmount}>
            Total: ${totalAmount.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Split Amount Summary */}
      <View style={themedStyles.splitSummary}>
        {group.initialAmount && group.initialAmount > 0 && (
          <>
            <View style={themedStyles.splitItem}>
              <Text style={themedStyles.splitLabel}>Initial Amount</Text>
              <Text style={[themedStyles.splitValue, { color: theme.colors.primary }]}>
                ${group.initialAmount.toFixed(2)}
              </Text>
            </View>
            <View style={themedStyles.splitDivider} />
          </>
        )}
        
        <View style={themedStyles.splitItem}>
          <Text style={themedStyles.splitLabel}>Total Amount</Text>
          <Text style={[themedStyles.splitValue, { color: theme.colors.text }]}>
            ${totalAmount.toFixed(2)}
          </Text>
        </View>
        
        <View style={themedStyles.splitDivider} />
        
        <View style={themedStyles.splitItem}>
          <Text style={themedStyles.splitLabel}>Per Member</Text>
          <Text style={[themedStyles.splitValue, { color: theme.colors.secondary }]}>
            ${amountPerMember.toFixed(2)}
          </Text>
        </View>
      </View>

      {group.description && (
        <Text style={themedStyles.groupDescription}>{group.description}</Text>
      )}
    </View>
  );
};