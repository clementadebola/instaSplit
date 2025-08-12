// components/GroupHeader.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
  if (!group) return null;

  return (
    <View style={styles.infoCard}>
      <View style={styles.groupHeader}>
        <View style={[styles.groupIcon, { backgroundColor: group.categoryColor }]}>
          <Text style={styles.groupIconText}>{group.categoryIcon}</Text>
        </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          <Text style={styles.groupCategory}>{group.category}</Text>
          <Text style={styles.groupMembers}>{memberCount} members</Text>
          <Text style={styles.groupTotalAmount}>
            Total: ${totalAmount.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Split Amount Summary */}
      <View style={styles.splitSummary}>
        {group.initialAmount && group.initialAmount > 0 && (
          <>
            <View style={styles.splitItem}>
              <Text style={styles.splitLabel}>Initial Amount</Text>
              <Text style={styles.splitValue}>${group.initialAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.splitDivider} />
          </>
        )}
        <View style={styles.splitItem}>
          <Text style={styles.splitLabel}>Total Amount</Text>
          <Text style={styles.splitValue}>${totalAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.splitDivider} />
        <View style={styles.splitItem}>
          <Text style={styles.splitLabel}>Per Member</Text>
          <Text style={styles.splitValue}>${amountPerMember.toFixed(2)}</Text>
        </View>
      </View>

      {group.description && (
        <Text style={styles.groupDescription}>{group.description}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  groupIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  groupIconText: {
    fontSize: 28,
  },
  groupInfo: {
    flex: 1,
  },
  groupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  groupCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  groupMembers: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  groupTotalAmount: {
    fontSize: 12,
    color: '#6F2BD4FF',
    fontWeight: '600',
  },
  splitSummary: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
  },
  splitItem: {
    flex: 1,
    alignItems: 'center',
  },
  splitDivider: {
    width: 1,
    backgroundColor: '#dee2e6',
    marginHorizontal: 16,
  },
  splitLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  splitValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  groupDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});