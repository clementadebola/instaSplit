import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

import { auth, db } from '../../utils/firebaseConfig';
import { useTheme } from '../../theme/themeContext';
import { GroupHeader } from './components/GroupHeader';
import { BalanceOverview } from './components/BalanceOverview';
import { QuickActions } from './components/QuickActions';
import { ExpensesList } from './components/ExpensesList';
import { MembersList } from './components/MembersList';

interface Bill {
  id: string;
  name: string;
  amount: number;
  date: string;
  paidBy: string;
}

interface GroupDetails {
  id: string;
  title: string;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  admin: string;
  adminName: string;
  membersList: Array<{
    id: string;
    name: string;
    email?: string;
  }>;
  totalAmount: number;
  amount: number; // Main group amount from Firebase
  bills: Bill[]; // Bills array from Firebase
  isActive: boolean;
  createdAt: any;
  description?: string;
  recentActivity: string;
}

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

interface MemberBalance {
  id: string;
  name: string;
  email?: string;
  balance: number;
  isAdmin: boolean;
  amountOwed: number;
  amountOwing: number;
}

interface UserBalance {
  owes: number;
  owed: number;
  netBalance: number;
}

export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { theme, darkMode } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'members'>('overview');

  // Get unique members list with enhanced member fetching
  const uniqueMembers = useMemo(() => {
    if (!group) return [];
    
    const membersMap = new Map<string, MemberBalance>();
    
    // Add admin first
    if (group.admin) {
      membersMap.set(group.admin, {
        id: group.admin,
        name: group.adminName || 'Admin',
        email: '',
        balance: 0,
        isAdmin: true,
        amountOwed: 0,
        amountOwing: 0,
      });
    }
    
    // Add other members from membersList
    group.membersList?.forEach(member => {
      if (!membersMap.has(member.id)) {
        membersMap.set(member.id, {
          id: member.id,
          name: member.name,
          email: member.email,
          balance: 0,
          isAdmin: false,
          amountOwed: 0,
          amountOwing: 0,
        });
      }
    });
    
    return Array.from(membersMap.values());
  }, [group]);

  // Calculate total amount from group amount + bills + expenses
  const totalAmount = useMemo(() => {
    if (!group) return 0;
    
    // Main group amount
    const groupAmount = Number(group.amount) || 0;
    
    // Sum of all bills
    const billsTotal = group.bills?.reduce((sum, bill) => {
      return sum + (Number(bill.amount) || 0);
    }, 0) || 0;
    
    // Sum of pending expenses
    const expensesTotal = expenses
      .filter((expense) => expense.status === 'pending')
      .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
    
    return groupAmount + billsTotal + expensesTotal;
  }, [group, expenses]);

  // Calculate amount each member should contribute
  const amountPerMember = useMemo(() => {
    if (totalAmount === 0 || uniqueMembers.length === 0) return 0;
    return Number((totalAmount / uniqueMembers.length).toFixed(2));
  }, [totalAmount, uniqueMembers.length]);

  // Calculate member balances including bills and expenses
  const memberBalances = useMemo(() => {
    const balances = new Map<string, number>();
    const amountOwedMap = new Map<string, number>();
    const amountOwingMap = new Map<string, number>();
    
    // Initialize all members with equal share of total amount (what they owe)
    uniqueMembers.forEach(member => {
      balances.set(member.id, -amountPerMember);
      amountOwingMap.set(member.id, amountPerMember);
      amountOwedMap.set(member.id, 0);
    });

    // Handle group amount - admin paid this upfront
    const groupAmount = Number(group?.amount) || 0;
    if (groupAmount > 0 && group?.admin) {
      const adminCurrentBalance = balances.get(group.admin) || 0;
      balances.set(group.admin, adminCurrentBalance + groupAmount);
      
      const adminOwed = amountOwedMap.get(group.admin) || 0;
      amountOwedMap.set(group.admin, adminOwed + groupAmount);
    }

    // Handle bills - person who paid is owed money
    group?.bills?.forEach(bill => {
      const payerId = bill.paidBy;
      const amount = Number(bill.amount) || 0;
      
      if (payerId && amount > 0) {
        const payerCurrentBalance = balances.get(payerId) || 0;
        balances.set(payerId, payerCurrentBalance + amount);
        
        const payerOwed = amountOwedMap.get(payerId) || 0;
        amountOwedMap.set(payerId, payerOwed + amount);
      }
    });

    // Handle expenses - same logic as before
    expenses.forEach(expense => {
      if (expense.status === 'settled') return;

      const creatorId = expense.createdBy;
      const creatorBalance = balances.get(creatorId) || 0;
      const amount = Number(expense.amount) || 0;

      // Creator paid the expense, so they are owed money
      balances.set(creatorId, creatorBalance + amount);
      
      const creatorOwed = amountOwedMap.get(creatorId) || 0;
      amountOwedMap.set(creatorId, creatorOwed + amount);

      // Distribute the expense among participants
      expense.participants.forEach(participant => {
        const participantId = participant.id;
        const participantAmount = Number(participant.amount) || 0;

        if (participantId === creatorId) {
          return; // Creator doesn't owe themselves
        }

        // Participant owes money
        const participantBalance = balances.get(participantId) || 0;
        balances.set(participantId, participantBalance - participantAmount);
        
        const participantOwing = amountOwingMap.get(participantId) || 0;
        amountOwingMap.set(participantId, participantOwing + participantAmount);
      });
    });

    // Update member objects with calculated balances
    return uniqueMembers.map(member => ({
      ...member,
      balance: Number((balances.get(member.id) || 0).toFixed(2)),
      amountOwed: Number((amountOwedMap.get(member.id) || 0).toFixed(2)),
      amountOwing: Number((amountOwingMap.get(member.id) || 0).toFixed(2)),
    }));
  }, [uniqueMembers, expenses, group?.amount, group?.bills, group?.admin, amountPerMember]);

  // Calculate current user's balance
  const userBalance = useMemo((): UserBalance => {
    if (!user) return { owes: 0, owed: 0, netBalance: 0 };

    const userMember = memberBalances.find(member => member.id === user.uid);
    if (!userMember) return { owes: 0, owed: 0, netBalance: 0 };

    const balance = userMember.balance;
    
    return {
      owes: balance < 0 ? Math.abs(balance) : 0,
      owed: balance > 0 ? balance : 0,
      netBalance: balance,
    };
  }, [user, memberBalances]);

  // Enhanced fetch group details function
  const fetchGroupDetails = useCallback(async (groupId: string) => {
    try {
      const groupRef = doc(db, 'groups', groupId);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) {
        throw new Error('Group not found');
      }

      const groupData = groupSnap.data() || {};
      console.log('Raw group data:', groupData); // Debug log

      // Fetch admin name
      let adminName = 'Admin';
      try {
        if (groupData.admin) {
          const adminRef = doc(db, 'users', groupData.admin);
          const adminSnap = await getDoc(adminRef);
          if (adminSnap.exists()) {
            const userData = adminSnap.data() || {};
            adminName = (userData.displayName || userData.name || userData.email?.split('@')[0] || 'Admin') as string;
          }
        }
      } catch (err) {
        console.log('Could not fetch admin name:', err);
      }

      // Process bills array
      let bills: Bill[] = [];
      if (groupData.bills && Array.isArray(groupData.bills)) {
        bills = groupData.bills.map((bill: any, index: number) => ({
          id: bill.id || `bill-${index}`,
          name: bill.name || 'Unnamed Bill',
          amount: Number(bill.amount) || 0,
          date: bill.date || new Date().toISOString(),
          paidBy: bill.paidBy || groupData.admin || '',
        }));
      }

      // Process members list - ensure we have proper member data
      let membersList = groupData.membersList || [];
      if (!Array.isArray(membersList)) {
        membersList = [];
      }

      const processedGroup: GroupDetails = {
        id: groupSnap.id,
        title: groupData.title || 'Untitled Group',
        category: groupData.category || 'General',
        categoryIcon: groupData.categoryIcon || '💰',
        categoryColor: groupData.categoryColor || theme.colors.primary,
        admin: groupData.admin || '',
        adminName,
        membersList,
        totalAmount: 0, // Will be calculated
        amount: Number(groupData.amount) || 0, // Main group amount
        bills,
        isActive: groupData.isActive !== false,
        createdAt: groupData.createdAt,
        description: groupData.description,
        recentActivity: groupData.recentActivity || 'No recent activity',
      };

      console.log('Processed group:', processedGroup); // Debug log
      return processedGroup;
    } catch (error) {
      console.error('Error fetching group details:', error);
      throw error;
    }
  }, [theme.colors.primary]);

  const fetchGroupExpenses = useCallback(async (groupId: string) => {
    try {
      const expensesRef = collection(db, 'expenses');
      const expensesQuery = query(expensesRef, where('groupId', '==', groupId));
      const expensesSnap = await getDocs(expensesQuery);

      const groupExpenses: Expense[] = [];
      expensesSnap.forEach((docSnap) => {
        const data = docSnap.data() as any;
        groupExpenses.push({
          id: docSnap.id,
          title: data.title || 'Untitled Expense',
          amount: Number(data.amount) || 0,
          createdBy: data.createdBy,
          createdByName: data.createdByName || 'Unknown',
          participants: Array.isArray(data.participants) ? data.participants.map((p: any) => ({
            id: p.id,
            name: p.name,
            amount: Number(p.amount) || 0,
          })) : [],
          createdAt: data.createdAt,
          category: data.category || 'General',
          description: data.description,
          status: data.status || 'pending',
        });
      });

      // Sort by creation date (newest first)
      groupExpenses.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return (b.createdAt.seconds || 0) - (a.createdAt.seconds || 0);
        }
        return 0;
      });

      console.log('Fetched expenses:', groupExpenses); // Debug log
      return groupExpenses;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }
  }, []);

  const fetchData = useCallback(async (groupId: string) => {
    try {
      setLoading(true);
      const [groupDetails, groupExpenses] = await Promise.all([
        fetchGroupDetails(groupId),
        fetchGroupExpenses(groupId),
      ]);

      setGroup(groupDetails);
      setExpenses(groupExpenses);
      
      console.log('Final group state:', groupDetails);
      console.log('Final expenses state:', groupExpenses);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load group details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [fetchGroupDetails, fetchGroupExpenses]);

  const onRefresh = useCallback(async () => {
    if (!id) return;
    setRefreshing(true);
    await fetchData(id as string);
    setRefreshing(false);
  }, [id, fetchData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);

      if (authUser && id) {
        await fetchData(id as string);
      } else if (!authUser) {
        Alert.alert('Authentication Required', 'Please log in to view group details');
        router.back();
      }
    });

    return () => unsubscribe();
  }, [id, fetchData]);

  // Create themed styles
  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.primary,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      color: '#fff',
      marginTop: 10,
      fontSize: 16,
      fontWeight: '500',
    },
    errorText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
    },
    backButton: {
      backgroundColor: theme.colors.card,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 20,
      marginTop: 20,
      shadowColor: darkMode ? "rgba(139, 92, 246, 0.3)" : "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 5,
    },
    backButtonText: {
      color: theme.colors.primary,
      fontWeight: '700',
      fontSize: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 40,
      paddingBottom: 20,
      justifyContent: 'space-between',
    },
    backBtn: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerTitle: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '700',
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 20,
    },
    menuBtn: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    tabNavigation: {
      flexDirection: 'row',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      marginHorizontal: 20,
      borderRadius: 20,
      padding: 4,
      marginBottom: 20,
      shadowColor: darkMode ? "rgba(139, 92, 246, 0.3)" : "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 16,
      alignItems: 'center',
    },
    activeTab: {
      backgroundColor: theme.colors.card,
      shadowColor: darkMode ? "rgba(139, 92, 246, 0.3)" : "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    tabText: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontWeight: '500',
      fontSize: 14,
    },
    activeTabText: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    content: {
      flex: 1,
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
    },
    tabContent: {
      padding: 20,
    },
    sectionTitle: {
      color: darkMode ? theme.colors.text : "#000",
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 16,
    },
    debugContainer: {
      backgroundColor: theme.colors.card,
      padding: 20,
      borderRadius: 20,
      marginTop: 20,
      shadowColor: darkMode ? "rgba(139, 92, 246, 0.3)" : "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    debugTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 12,
      color: theme.colors.text,
    },
    debugText: {
      fontSize: 15,
      color: theme.colors.secondaryText,
      marginBottom: 8,
      fontWeight: '500',
    },
    overviewCard: {
      backgroundColor: theme.colors.card,
      padding: 20,
      borderRadius: 20,
      marginBottom: 16,
      shadowColor: darkMode ? "rgba(139, 92, 246, 0.3)" : "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    cardTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: '700',
    },
    cardSubtitle: {
      color: theme.colors.secondaryText,
      fontSize: 14,
      fontWeight: '500',
    },
    amount: {
      color: theme.colors.text,
      fontSize: 28,
      fontWeight: '800',
    },
    smallAmount: {
      color: theme.colors.secondaryText,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  // Render functions
  const renderOverviewTab = () => (
    <View style={themedStyles.tabContent}>
      <Text style={themedStyles.sectionTitle}>Group Overview</Text>
      
      <View style={themedStyles.overviewCard}>
        <View style={themedStyles.cardHeader}>
          <View>
            <Text style={themedStyles.cardTitle}>Total Amount</Text>
            <Text style={themedStyles.cardSubtitle}>{uniqueMembers.length} members</Text>
          </View>
          <Text style={themedStyles.amount}>${totalAmount.toFixed(2)}</Text>
        </View>
        <View style={themedStyles.cardHeader}>
          <Text style={themedStyles.cardSubtitle}>Amount per member</Text>
          <Text style={themedStyles.smallAmount}>${amountPerMember.toFixed(2)}</Text>
        </View>
      </View>

      <GroupHeader 
        group={group} 
        totalAmount={totalAmount}
        memberCount={uniqueMembers.length}
        amountPerMember={amountPerMember}
      />
      
      <BalanceOverview userBalance={userBalance} />
      
      <QuickActions groupId={group?.id} />
      
      {/* Debug Information - Remove in production */}
      <View style={themedStyles.debugContainer}>
        <Text style={themedStyles.debugTitle}>Debug Information</Text>
        <Text style={themedStyles.debugText}>Group Amount: ${group?.amount || 0}</Text>
        <Text style={themedStyles.debugText}>Bills Total: ${group?.bills?.reduce((sum, bill) => sum + Number(bill.amount), 0) || 0}</Text>
        <Text style={themedStyles.debugText}>Expenses Total: ${expenses.reduce((sum, exp) => sum + Number(exp.amount), 0)}</Text>
        <Text style={themedStyles.debugText}>Total Amount: ${totalAmount}</Text>
        <Text style={themedStyles.debugText}>Amount Per Member: ${amountPerMember}</Text>
        <Text style={themedStyles.debugText}>Members Count: {uniqueMembers.length}</Text>
      </View>
    </View>
  );

  const renderExpensesTab = () => (
    <View style={themedStyles.tabContent}>
      <ExpensesList 
        expenses={expenses} 
        groupId={group?.id}
        initialAmount={group?.amount}
        memberCount={uniqueMembers.length}
      />
    </View>
  );

  const renderMembersTab = () => (
    <View style={themedStyles.tabContent}>
      <MembersList members={memberBalances} />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[themedStyles.container, themedStyles.centered]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={themedStyles.loadingText}>Loading group details...</Text>
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView style={[themedStyles.container, themedStyles.centered]}>
        <Text style={themedStyles.errorText}>Group not found</Text>
        <TouchableOpacity style={themedStyles.backButton} onPress={() => router.back()}>
          <Text style={themedStyles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={themedStyles.container}>
      {/* Header */}
      <View style={themedStyles.header}>
        <TouchableOpacity onPress={() => router.back()} style={themedStyles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={themedStyles.headerTitle} numberOfLines={1}>
          {group.title}
        </Text>
        <TouchableOpacity style={themedStyles.menuBtn}>
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={themedStyles.tabNavigation}>
        <TouchableOpacity
          style={[themedStyles.tab, activeTab === 'overview' && themedStyles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[themedStyles.tabText, activeTab === 'overview' && themedStyles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[themedStyles.tab, activeTab === 'expenses' && themedStyles.activeTab]}
          onPress={() => setActiveTab('expenses')}
        >
          <Text style={[themedStyles.tabText, activeTab === 'expenses' && themedStyles.activeTabText]}>
            Expenses ({expenses.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[themedStyles.tab, activeTab === 'members' && themedStyles.activeTab]}
          onPress={() => setActiveTab('members')}
        >
          <Text style={[themedStyles.tabText, activeTab === 'members' && themedStyles.activeTabText]}>
            Members ({uniqueMembers.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={themedStyles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'expenses' && renderExpensesTab()}
        {activeTab === 'members' && renderMembersTab()}
      </ScrollView>
    </SafeAreaView>
  );
}