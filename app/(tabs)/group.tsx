import {
  Image,
  StyleSheet,
  Platform,
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
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

import { Ionicons, FontAwesome, AntDesign } from "@expo/vector-icons";
import { auth, db } from "../../utils/firebaseConfig";
import CreateGroupModal from "@/components/createGroupModal/CreateGroupModal";
import { useTheme } from "../../theme/themeContext";

const { width, height } = Dimensions.get("window");

// Define Group interface
interface Group {
  id: string;
  title: string;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  date: string;
  members: number;
  amount: string;
  status: 'active' | 'owed' | 'owing';
  owedAmount: string;
  recentActivity: string;
  admin: string;
  membersList: any[];
  totalAmount: number;
  isActive: boolean;
  icon?: string; // For backward compatibility
}

export default function GroupScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);
  const { theme, darkMode } = useTheme();

  // Improved fetch groups function with better error handling
  const fetchGroups = async (userId: string) => {
    try {
      console.log("Fetching groups for user:", userId);
      
      const groupsRef = collection(db, "groups");
      const userGroups: Group[] = [];
      
      // Try to get groups where user is admin first (simpler query)
      try {
        console.log("Querying admin groups...");
        const adminQuery = query(
          groupsRef, 
          where("admin", "==", userId)
        );
        
        const adminSnapshot = await getDocs(adminQuery);
        console.log("Admin groups found:", adminSnapshot.size);
        
        adminSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log("Processing admin group:", { id: doc.id, title: data.title });
          
          // Format the group data properly
          const groupData: Group = {
            id: doc.id,
            title: data.title || 'Untitled Group',
            category: data.category || 'General',
            categoryIcon: data.categoryIcon || '📝',
            categoryColor: data.categoryColor || theme.colors.primary,
            date: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : new Date().toLocaleDateString(),
            members: (data.membersList?.length || 0) + 1, // +1 for admin
            amount: `${(data.totalAmount || 0).toFixed(2)}`,
            status: 'owed', // Admin is owed money
            owedAmount: `${(data.totalAmount || 0).toFixed(2)}`,
            recentActivity: data.recentActivity || 'No recent activity',
            admin: data.admin,
            membersList: data.membersList || [],
            totalAmount: data.totalAmount || 0,
            isActive: data.isActive !== false,
            icon: data.categoryIcon || '📝',
          };
          
          userGroups.push(groupData);
        });
        
      } catch (adminError) {
        console.error("Error fetching admin groups:", adminError);
      }

      // If we don't have permission for complex queries, try a simpler approach
      if (userGroups.length === 0) {
        try {
          console.log("Trying simpler query...");
          const simpleQuery = query(groupsRef);
          const allSnapshot = await getDocs(simpleQuery);
          console.log("Total groups in database:", allSnapshot.size);
          
          allSnapshot.forEach((doc) => {
            const data = doc.data();
            // Check if user is admin or member
            const isAdmin = data.admin === userId;
            const isMember = data.membersList?.some((member: any) => member.id === userId);
            
            if (isAdmin || isMember) {
              console.log("Found user group:", { id: doc.id, title: data.title, isAdmin, isMember });
              
              const groupData: Group = {
                id: doc.id,
                title: data.title || 'Untitled Group',
                category: data.category || 'General',
                categoryIcon: data.categoryIcon || '📝',
                categoryColor: data.categoryColor || theme.colors.primary,
                date: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : new Date().toLocaleDateString(),
                members: (data.membersList?.length || 0) + 1,
                amount: `${(data.totalAmount || 0).toFixed(2)}`,
                status: isAdmin ? 'owed' : 'owing',
                owedAmount: `${(data.totalAmount || 0).toFixed(2)}`,
                recentActivity: data.recentActivity || 'No recent activity',
                admin: data.admin,
                membersList: data.membersList || [],
                totalAmount: data.totalAmount || 0,
                isActive: data.isActive !== false,
                icon: data.categoryIcon || '📝',
              };
              
              userGroups.push(groupData);
            }
          });
          
        } catch (simpleError) {
          console.error("Error with simple query:", simpleError);
          throw simpleError;
        }
      }
      
      console.log("Final user groups found:", userGroups.length);
      setGroups(userGroups);
      
    } catch (error) {
      console.error('Error fetching groups:', error);
      
      // Check if it's a permissions error
      if (error instanceof Error && error.message.includes('permissions')) {
        Alert.alert(
          "Permission Error", 
          "Unable to access groups data. Please check your Firebase security rules or try logging in again.",
          [
            {
              text: "Retry",
              onPress: () => {
                if (user) fetchGroups(user.uid);
              }
            },
            { text: "OK" }
          ]
        );
      } else {
        Alert.alert(
          "Error", 
          "Failed to load groups. Please check your internet connection and try again."
        );
      }
    }
  };

  // Handle refresh
  const onRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await fetchGroups(user.uid);
    setRefreshing(false);
  };

  // Auth listener and initial data fetch
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        console.log("User authenticated:", authUser.uid);
        setUser(authUser);
        await fetchGroups(authUser.uid);
      } else {
        console.log("User not authenticated");
        setUser(null);
        setGroups([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Improved navigation to group details
  const handleGroupPress = (groupId: string) => {
    console.log("Navigating to group details:", groupId);
    // Navigate to the group details screen
    // router.push(`/(group)/details/${groupId}`);
    router.push(`/(group)/${groupId}`);
    // router.push(``);
  };

  const handleGroupCreated = async () => {
    console.log("Group created callback triggered");
    if (user) {
      // Add a small delay to ensure Firebase has processed the write
      setTimeout(async () => {
        await fetchGroups(user.uid);
      }, 1000);
    }
  };

  const renderGroupCard = (group: Group) => {
    // Determine status and colors
    let statusText = "";
    let statusColor = "";
    let statusBgColor = "";
    
    if (group.admin === user?.uid) {
      statusText = `You are owed ${group.owedAmount}`;
      statusColor = theme.colors.success;
      statusBgColor = darkMode ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.1)";
    } else {
      statusText = `You owe ${group.owedAmount}`;
      statusColor = theme.colors.danger;
      statusBgColor = darkMode ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.1)";
    }

    return (
      <TouchableOpacity
        key={group.id}
        style={[styles.groupCard, { backgroundColor: theme.colors.card }]}
        onPress={() => handleGroupPress(group.id)}
        activeOpacity={0.7}
      >
        <View style={styles.groupHeader}>
          <View style={styles.groupLeft}>
            <View style={[styles.groupIconContainer, { backgroundColor: group.categoryColor || theme.colors.primary }]}>
              <Text style={styles.groupIconText}>{group.categoryIcon || "📝"}</Text>
            </View>
            <View style={styles.groupInfo}>
              <Text style={[styles.groupTitle, { color: theme.colors.text }]} numberOfLines={1}>{group.title}</Text>
              <Text style={[styles.groupCategory, { color: theme.colors.secondaryText }]}>{group.category}</Text>
              <Text style={[styles.groupDate, { color: theme.colors.secondaryText }]}>{group.date}</Text>
              <Text style={[styles.groupMembers, { color: theme.colors.secondaryText }]}>{group.members} members</Text>
            </View>
          </View>
          <View style={styles.groupRight}>
            <Text style={[styles.groupAmount, { color: theme.colors.primary }]}>{group.amount}</Text>
            <AntDesign name="right" size={16} color={theme.colors.secondaryText} />
          </View>
        </View>

        <View style={[styles.statusTag, { backgroundColor: statusBgColor }]}>
          <Text style={{ color: statusColor, fontWeight: "500" }}>
            {statusText}
          </Text>
        </View>

        <View style={[styles.recentActivity, { borderTopColor: theme.colors.border }]}>
          <View style={styles.activityRow}>
            <AntDesign name="clockcircleo" size={12} color={theme.colors.secondaryText} />
            <Text style={[styles.recentActivityText, { color: theme.colors.secondaryText }]} numberOfLines={1}>
              {group.recentActivity}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={[styles.emptyStateCard, { backgroundColor: theme.colors.card }]}>
        <Ionicons name="people-outline" size={60} color={theme.colors.secondaryText} />
        <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>No groups yet</Text>
        <Text style={[styles.emptyStateSubtext, { color: theme.colors.secondaryText }]}>
          Create your first group to start splitting expenses with friends
        </Text>
        <TouchableOpacity 
          style={[styles.createFirstGroupBtn, { backgroundColor: theme.colors.primary }]}
          onPress={openModal}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.createFirstGroupText}>Create Your First Group</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading groups...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headTextWrap}>
          <Text style={[styles.headTitle, {color: theme.colors.text}]}>Groups</Text>
          <Text style={[styles.headSubtitle, {color: theme.colors.secondaryText}]}>
            You are in {groups.length} group{groups.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.notificationBtn, { backgroundColor: theme.colors.border }]}>
            <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              source={require("../../assets/images/Perss.jpg")}
              style={[styles.avatar, { borderColor: theme.colors.border }]}
            />
          </TouchableOpacity>
        </View>
      </View>

     <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={styles.groupsection}>
          {groups.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {groups.map((group) => renderGroupCard(group))}
              
              <TouchableOpacity style={[styles.addGroupBtn, { backgroundColor: theme.colors.card }]} onPress={openModal}>
                <AntDesign name="plus" color={theme.colors.primary} size={23} />
                <Text style={[styles.addGroupText, { color: theme.colors.primary }]}>Create new group</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <CreateGroupModal
          visible={isModalVisible}
          onClose={closeModal}
          onGroupCreated={handleGroupCreated}
          currentUserId={user?.uid || ""}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headTextWrap: {
    flexDirection: "column",
  },
  headTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headSubtitle: {
    textAlign: "left",
    fontSize: 14,
    marginTop: 5,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  notificationBtn: {
    padding: 8,
    borderRadius: 20,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
  },

  // group card section
  groupsection: {
    marginTop: 10,
  },

  groupCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  groupLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  groupIconContainer: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupIconText: {
    fontSize: 26,
  },
  groupInfo: {
    flex: 1,
  },
  groupTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 4,
  },
  groupCategory: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  groupDate: {
    fontSize: 12,
    marginBottom: 2,
  },
  groupMembers: {
    fontSize: 12,
  },
  groupRight: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 8,
  },
  groupAmount: {
    fontWeight: "bold",
    fontSize: 18,
  },
  statusTag: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  recentActivity: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentActivityText: {
    fontSize: 12,
    fontStyle: "italic",
    marginLeft: 6,
    flex: 1,
  },

  addGroupBtn: {
    padding: 20,
    borderRadius: 20,
    marginTop: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  addGroupText: {
    fontWeight: "bold",
    fontSize: 16,
  },

  // Empty state styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  createFirstGroupBtn: {
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#6F2BD4FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createFirstGroupText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});