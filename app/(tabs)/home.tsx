import {
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

import { Ionicons, AntDesign } from "@expo/vector-icons";
import { auth, db } from "../../utils/firebaseConfig";
import { useTheme } from "../../theme/themeContext";

const { width } = Dimensions.get("window");

// Define interfaces
interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  totalOwed: number;
  totalOwing: number;
}

interface Group {
  id: string;
  title: string;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  admin: string;
  membersList: any[];
  totalAmount: number;
  isActive: boolean;
  owedAmount: string;
  members: number;
  date: string;
  recentActivity: string;
}

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { theme, darkMode } = useTheme();

  // Get display name from email or user profile
  const getDisplayName = (authUser: User, profileData?: any) => {
    // Try profile displayName first
    if (profileData?.displayName) {
      return profileData.displayName;
    }
    
    // Try auth displayName
    if (authUser.displayName) {
      return authUser.displayName;
    }
    
    // Extract name from email (before @)
    if (authUser.email) {
      const emailName = authUser.email.split('@')[0];
      // Capitalize first letter and replace dots/underscores with spaces
      return emailName
        .replace(/[._]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    return 'User';
  };

  // Fetch user profile from Firebase
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      let userData = null;
      if (userDoc.exists()) {
        userData = userDoc.data();
      }

      const displayName = getDisplayName(user!, userData);

      return {
        id: userId,
        displayName,
        email: user?.email || '',
        totalOwed: 0, // Will be calculated
        totalOwing: 0, // Will be calculated
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Return fallback profile
      return {
        id: userId,
        displayName: getDisplayName(user!),
        email: user?.email || '',
        totalOwed: 0,
        totalOwing: 0,
      };
    }
  };

  // Fetch user's groups from Firebase
  const fetchUserGroups = async (userId: string): Promise<Group[]> => {
    try {
      console.log('Fetching groups for user:', userId);
      const groupsRef = collection(db, 'groups');
      const userGroups: Group[] = [];

      try {
        // First try to get groups where user is admin
        const adminQuery = query(groupsRef, where('admin', '==', userId));
        const adminSnapshot = await getDocs(adminQuery);
        
        adminSnapshot.forEach((doc) => {
          const data = doc.data();
          userGroups.push({
            id: doc.id,
            title: data.title || 'Untitled Group',
            category: data.category || 'General',
            categoryIcon: data.categoryIcon || '📝',
            categoryColor: data.categoryColor || theme.colors.primary,
            admin: data.admin || '',
            membersList: data.membersList || [],
            totalAmount: data.totalAmount || 0,
            isActive: data.isActive !== false,
            owedAmount: `$${(data.totalAmount || 0).toFixed(2)}`,
            members: (data.membersList?.length || 0) + 1, // +1 for admin
            date: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
            recentActivity: data.recentActivity || 'No recent activity',
          });
        });

        // Fallback: get all groups and filter client-side
        if (userGroups.length === 0) {
          console.log('Trying all groups...');
          const allGroupsQuery = query(groupsRef);
          const allSnapshot = await getDocs(allGroupsQuery);
          
          allSnapshot.forEach((doc) => {
            const data = doc.data();
            const isAdmin = data.admin === userId;
            const isMember = data.membersList?.some((member: any) => member.id === userId);
            
            if (isAdmin || isMember) {
              userGroups.push({
                id: doc.id,
                title: data.title || 'Untitled Group',
                category: data.category || 'General',
                categoryIcon: data.categoryIcon || '📝',
                categoryColor: data.categoryColor || theme.colors.primary,
                admin: data.admin || '',
                membersList: data.membersList || [],
                totalAmount: data.totalAmount || 0,
                isActive: data.isActive !== false,
                owedAmount: `$${(data.totalAmount || 0).toFixed(2)}`,
                members: (data.membersList?.length || 0) + 1,
                date: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
                recentActivity: data.recentActivity || 'No recent activity',
              });
            }
          });
        }

      } catch (error) {
        console.error('Error fetching groups:', error);
      }

      console.log('Fetched groups:', userGroups.length);
      return userGroups;
    } catch (error) {
      console.error('Error in fetchUserGroups:', error);
      return [];
    }
  };

  // Calculate balance based on groups only (removed bills calculation)
  const calculateBalance = (userGroups: Group[], userId: string) => {
    let totalOwed = 0;   // Amount user owes to others
    let totalOwing = 0;  // Amount others owe to user

    // Calculate from groups
    userGroups.forEach(group => {
      if (group.admin === userId) {
        // User is admin, others owe them based on group's unpaid amounts
        const membersCount = group.members;
        const adminShare = group.totalAmount / membersCount;
        const othersShare = group.totalAmount - adminShare;
        totalOwing += othersShare;
      } else {
        // User is member, they owe their share to admin
        const membersCount = group.members;
        const memberShare = group.totalAmount / membersCount;
        totalOwed += memberShare;
      }
    });

    return { totalOwed, totalOwing };
  };

  // Main fetch function (removed bills fetching)
  const fetchUserData = useCallback(async (authUser: User) => {
    try {
      console.log('Fetching all data for user:', authUser.uid);
      
      // Fetch profile and groups (removed bills)
      const [userProfile, userGroups] = await Promise.all([
        fetchUserProfile(authUser.uid),
        fetchUserGroups(authUser.uid)
      ]);

      console.log('Fetched data:', {
        profile: userProfile?.displayName,
        groups: userGroups?.length
      });

      if (userProfile) {
        // Calculate balance from actual data
        const { totalOwed, totalOwing } = calculateBalance(userGroups || [], authUser.uid);
        
        setProfile({
          ...userProfile,
          totalOwed,
          totalOwing
        });
        setGroups(userGroups || []);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    }
  }, []);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      await fetchUserData(user);
    } finally {
      setRefreshing(false);
    }
  }, [user, fetchUserData]);

  // Improved navigation to group details
  const handleGroupPress = (groupId: string) => {
    console.log("Navigating to group details:", groupId);
    router.push(`/(group)/${groupId}`);
  };

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        await fetchUserData(authUser);
      } else {
        setUser(null);
        setProfile(null);
        setGroups([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserData]);

  // Screen focus refresh
  useFocusEffect(
    useCallback(() => {
      if (user && !loading && !refreshing) {
        fetchUserData(user);
      }
    }, [user, loading, refreshing, fetchUserData])
  );

  // Create theme-aware styles
  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingTop: 40,
      paddingHorizontal: 20,
      paddingBottom: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    appName: {
      color: theme.colors.text,
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 4,
    },
    userName: {
      color: theme.colors.secondaryText ,
      fontSize: 16,
      fontWeight: "500",
    },
    card: {
      backgroundColor: theme.colors.card,
      padding: 20,
      borderRadius: 20,
      width: width * 0.42,
      minHeight: 100,
      justifyContent: "space-between",
      shadowColor: darkMode ? "rgba(139, 92, 246, 0.3)" : "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 5,
    },
    cardLabel: {
      color: theme.colors.secondaryText,
      fontSize: 14,
      fontWeight: "500",
      marginLeft: 8,
    },
    cardAmount: {
      color: theme.colors.text,
      fontSize: 24,
      fontWeight: "800",
    },
    sectionTitle: {
      color: darkMode ? theme.colors.text : "#000",
      fontSize: 20,
      fontWeight: "700",
    },
    viewAll: {
      color: theme.colors.secondaryText,
      fontSize: 14,
      fontWeight: "500",
    },
    groupCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      padding: 20,
      marginRight: 15,
      width: width * 0.75,
      shadowColor: darkMode ? "rgba(139, 92, 246, 0.3)" : "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    groupTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 2,
    },
    groupCategory: {
      fontSize: 13,
      color: theme.colors.secondaryText,
      fontStyle: 'italic',
    },
    groupBadge: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      minWidth: 24,
      alignItems: 'center',
    },
    groupStats: {
      flexDirection: 'row',
      marginBottom: 16,
      backgroundColor: darkMode ? 'rgba(139, 92, 246, 0.1)' : '#f8f9fa',
      borderRadius: 12,
      padding: 12,
    },
    statAmount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 2,
    },
    statDate: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 11,
      color: theme.colors.secondaryText,
      textAlign: 'center',
    },
    divider: {
      width: 1,
      backgroundColor: theme.colors.border,
      marginHorizontal: 12,
    },
    groupFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    groupActivityText: {
      fontSize: 12,
      color: theme.colors.secondaryText,
      marginLeft: 6,
      flex: 1,
    },
    emptyGroupsCard: {
      backgroundColor: theme.colors.card,
      marginHorizontal: 20,
      borderRadius: 20,
      padding: 40,
      alignItems: 'center',
      marginBottom: 10,
      shadowColor: darkMode ? "rgba(139, 92, 246, 0.3)" : "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    emptyGroupsTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyGroupsSubtext: {
      fontSize: 14,
      color: theme.colors.secondaryText,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20,
    },
    createGroupButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 25,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    createGroupButtonText: {
      color: "#FFFFFF",
      fontWeight: '600',
      fontSize: 16,
    },
    viewMoreGroupsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 20,
      marginTop: 15,
      paddingVertical: 12,
    },
    viewMoreGroupsText: {
      color:  theme.colors.secondaryText ,
      fontSize: 14,
      fontWeight: '500',
      marginRight: 8,
    },
    quickActionCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: 20,
      width: (width - 60) / 2,
      alignItems: 'center',
      shadowColor: darkMode ? "rgba(139, 92, 246, 0.3)" : "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    quickActionIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: `${theme.colors.primary}20`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    quickActionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
      textAlign: 'center',
    },
    quickActionSubtext: {
      fontSize: 12,
      color: theme.colors.secondaryText,
      textAlign: 'center',
      lineHeight: 16,
    },
    loadingText: {
      color: darkMode ? theme.colors.text : "#FFFFFF",
      marginTop: 10,
      fontSize: 16,
    },
  });

  // Render available groups as improved cards
  const renderAvailableGroups = () => {
    console.log('Available groups:', groups.length);
    
    if (groups.length === 0) {
      return (
        <View style={themedStyles.emptyGroupsCard}>
          <View style={styles.emptyGroupsContent}>
            <Ionicons name="people-outline" size={48} color={theme.colors.secondaryText} />
            <Text style={themedStyles.emptyGroupsTitle}>No groups yet</Text>
            <Text style={themedStyles.emptyGroupsSubtext}>
              Create your first group to start splitting expenses with friends
            </Text>
            <TouchableOpacity 
              style={themedStyles.createGroupButton}
              onPress={() => router.push("/(tabs)/group")}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={themedStyles.createGroupButtonText}>Create Group</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.groupsScrollContainer}
        >
          {groups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={themedStyles.groupCard}
              onPress={() => handleGroupPress(group.id)}
              activeOpacity={0.8}
            >
              <View style={styles.groupCardHeader}>
                <View style={[styles.groupIcon, { backgroundColor: group.categoryColor }]}>
                  <Text style={styles.groupIconText}>{group.categoryIcon}</Text>
                </View>
                <View style={styles.groupInfo}>
                  <Text style={themedStyles.groupTitle} numberOfLines={1}>{group.title}</Text>
                  <Text style={themedStyles.groupCategory}>{group.category}</Text>
                </View>
                <View style={themedStyles.groupBadge}>
                  <Text style={styles.groupBadgeText}>{group.members}</Text>
                </View>
              </View>
              
              <View style={themedStyles.groupStats}>
                <View style={styles.statItem}>
                  <Text style={themedStyles.statAmount}>{group.owedAmount}</Text>
                  <Text style={themedStyles.statLabel}>
                    {group.admin === user?.uid ? 'You are owed' : 'You owe'}
                  </Text>
                </View>
                <View style={themedStyles.divider} />
                <View style={styles.statItem}>
                  <Text style={themedStyles.statDate}>{group.date}</Text>
                  <Text style={themedStyles.statLabel}>Created</Text>
                </View>
              </View>
              
              <View style={themedStyles.groupFooter}>
                <View style={styles.groupActivity}>
                  <Ionicons name="time-outline" size={12} color={theme.colors.secondaryText} />
                  <Text style={themedStyles.groupActivityText} numberOfLines={1}>
                    {group.recentActivity}
                  </Text>
                </View>
                <AntDesign name="right" size={14} color={theme.colors.secondaryText} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {groups.length > 3 && (
          <TouchableOpacity 
            style={themedStyles.viewMoreGroupsButton}
            onPress={() => router.push("/(tabs)/group")}
          >
            <Text style={themedStyles.viewMoreGroupsText}>
              View all {groups.length} groups
            </Text>
            <AntDesign name="right" size={12} color={theme.colors.secondaryText} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[themedStyles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={themedStyles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={themedStyles.container}>
      <View style={themedStyles.header}>
        <View style={styles.headerLeft}>
          <Text style={themedStyles.appName}>InstaSplit</Text>
          {profile && (
            <Text style={themedStyles.userName}>Hello, {profile.displayName}!</Text>
          )}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="notifications-outline" size={24} color={ theme.colors.text } />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              source={require("../../assets/images/Perss.jpg")}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
            title="Pull to refresh"
            titleColor={theme.colors.text}
          />
        }
      >
        {/* Balance Cards */}
        <View style={styles.balanceContainer}>
          <View style={themedStyles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="arrow-up-circle-outline" size={24} color="#FF6B6B" />
              <Text style={themedStyles.cardLabel}>You Owe</Text>
            </View>
            <Text style={themedStyles.cardAmount}>
              ${profile?.totalOwed.toFixed(2) || '0.00'}
            </Text>
          </View>

          <View style={themedStyles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="arrow-down-circle-outline" size={24} color="#4ECDC4" />
              <Text style={themedStyles.cardLabel}>Owes You</Text>
            </View>
            <Text style={themedStyles.cardAmount}>
              ${profile?.totalOwing.toFixed(2) || '0.00'}
            </Text>
          </View>
        </View>

        {/* Your Groups Section */}
        <View style={styles.sectionHeader}>
          <Text style={themedStyles.sectionTitle}>Pending Bills</Text>
          {groups.length > 0 && (
            <TouchableOpacity onPress={() => router.push("/(tabs)/group")}>
              <Text style={themedStyles.viewAll}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Render Available Groups */}
        {renderAvailableGroups()}

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={themedStyles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={themedStyles.quickActionCard}
              onPress={() => router.push("/(tabs)/group")}
            >
              <View style={themedStyles.quickActionIcon}>
                <Ionicons name="people" size={24} color={theme.colors.primary} />
              </View>
              <Text style={themedStyles.quickActionTitle}>Create Group</Text>
              <Text style={themedStyles.quickActionSubtext}>Start splitting with friends</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={themedStyles.quickActionCard}
              onPress={() => {
                if (groups.length > 0) {
                  router.push("/create-bill");
                } else {
                  Alert.alert("No Groups", "Create a group first to split expenses");
                }
              }}
            >
              <View style={themedStyles.quickActionIcon}>
                <Ionicons name="receipt" size={24} color={theme.colors.primary} />
              </View>
              <Text style={themedStyles.quickActionTitle}>Add Expense</Text>
              <Text style={themedStyles.quickActionSubtext}>Split a new bill</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  headerIconButton: {
    padding: 8,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: "#fff",
  },
  balanceContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  groupsScrollContainer: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  groupCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupIconText: {
    fontSize: 22,
  },
  groupInfo: {
    flex: 1,
  },
  groupBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  groupActivity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emptyGroupsContent: {
    alignItems: 'center',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
});