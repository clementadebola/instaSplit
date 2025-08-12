import {
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomScrollView from "@/components/CustomScrollView";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useCallback } from "react";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../utils/firebaseConfig";
import { router } from "expo-router";

interface UserStats {
  totalGroups: number;
  totalExpenses: number;
  totalAmountSplit: number;
  joinDate: Date;
  lastActive: Date;
  streakDays: number;
  totalTransactions: number;
  balance: number;
  pendingBills: number;
  totalOwed: number;
  totalOwing: number;
}

interface UserPreferences {
  notifications: boolean;
  emailUpdates: boolean;
  darkMode: boolean;
  autoSplit: boolean;
}

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    totalGroups: 0,
    totalExpenses: 0,
    totalAmountSplit: 0,
    joinDate: new Date(),
    lastActive: new Date(),
    streakDays: 0,
    totalTransactions: 0,
    balance: 0,
    pendingBills: 0,
    totalOwed: 0,
    totalOwing: 0,
  });
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: true,
    emailUpdates: false,
    darkMode: false,
    autoSplit: false,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Enhanced color scheme
  const theme = {
    primary: preferences.darkMode ? "#8B5CF6" : "#6F2BD4",
    secondary: preferences.darkMode ? "#A78BFA" : "#9333EA",
    background: preferences.darkMode ? "#0F0F23" : "#F8FAFC",
    cardBackground: preferences.darkMode ? "#1E1B4B" : "#FFFFFF",
    text: preferences.darkMode ? "#F1F5F9" : "#1E293B",
    secondaryText: preferences.darkMode ? "#94A3B8" : "#64748B",
    border: preferences.darkMode
      ? "rgba(139, 92, 246, 0.2)"
      : "rgba(111, 43, 212, 0.1)",
    danger: "#EF4444",
    success: "#10B981",
    warning: "#F59E0B",
  };

  // Calculate user stats from Firebase data
  const calculateUserStats = async (userId: string): Promise<UserStats> => {
    try {
      console.log("Calculating stats for user:", userId);
      
      // Fetch user groups
      const groupsRef = collection(db, "groups");
      const userGroupsQuery = query(
        groupsRef,
        where("admin", "==", userId)
      );
      
      const allGroupsQuery = query(groupsRef);
      const allGroupsSnapshot = await getDocs(allGroupsQuery);
      
      const adminGroupsSnapshot = await getDocs(userGroupsQuery);
      
      // Get all groups where user is member or admin
      const userGroups: any[] = [];
      const processedIds = new Set<string>();
      
      // Add admin groups
      adminGroupsSnapshot.forEach((doc) => {
        userGroups.push({ id: doc.id, ...doc.data() });
        processedIds.add(doc.id);
      });
      
      // Add member groups
      allGroupsSnapshot.forEach((doc) => {
        if (!processedIds.has(doc.id)) {
          const data = doc.data();
          const isMember = data.membersList?.some((member: any) => member.id === userId);
          if (isMember) {
            userGroups.push({ id: doc.id, ...data });
            processedIds.add(doc.id);
          }
        }
      });

      console.log("User groups found:", userGroups.length);

      // Calculate stats
      let totalAmountSplit = 0;
      let totalExpenses = 0;
      let totalOwed = 0;
      let totalOwing = 0;
      let totalTransactions = 0;

      userGroups.forEach((group) => {
        if (group.bills && Array.isArray(group.bills)) {
          totalExpenses += group.bills.length;
          totalTransactions += group.bills.length;
          
          group.bills.forEach((bill: any) => {
            totalAmountSplit += bill.amount || 0;
          });
        }

        // Calculate what user owes or is owed
        const userMember = group.membersList?.find((member: any) => member.id === userId);
        if (userMember && userMember.amount) {
          if (group.admin === userId) {
            // User is admin, they are owed money
            totalOwed += userMember.amount;
          } else {
            // User is member, they owe money
            totalOwing += userMember.amount;
          }
        }
      });

      const balance = totalOwed - totalOwing;
      const pendingBills = userGroups.filter(group => 
        group.status === 'active' || group.status === 'owing'
      ).length;

      // Get user creation date
      let joinDate = new Date();
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          joinDate = userData.createdAt?.toDate() || new Date();
        }
      } catch (error) {
        console.log("No user doc found, using current date");
      }

      const stats: UserStats = {
        totalGroups: userGroups.length,
        totalExpenses,
        totalAmountSplit,
        joinDate,
        lastActive: new Date(),
        streakDays: Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24)) || 1,
        totalTransactions,
        balance,
        pendingBills,
        totalOwed,
        totalOwing,
      };

      console.log("Calculated stats:", stats);
      return stats;

    } catch (error) {
      console.error("Error calculating user stats:", error);
      return {
        totalGroups: 0,
        totalExpenses: 0,
        totalAmountSplit: 0,
        joinDate: new Date(),
        lastActive: new Date(),
        streakDays: 0,
        totalTransactions: 0,
        balance: 0,
        pendingBills: 0,
        totalOwed: 0,
        totalOwing: 0,
      };
    }
  };

  // Fetch user data and stats
  const fetchUserData = async (userId: string) => {
    try {
      console.log("Fetching user data for:", userId);
      
      // Fetch user preferences and basic info
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setPreferences({
          notifications: userData.preferences?.notifications ?? true,
          emailUpdates: userData.preferences?.emailUpdates ?? false,
          darkMode: userData.preferences?.darkMode ?? false,
          autoSplit: userData.preferences?.autoSplit ?? false,
        });
      }

      // Calculate and set user stats
      const calculatedStats = await calculateUserStats(userId);
      setUserStats(calculatedStats);

    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load user data. Please try again.");
    }
  };

  // Handle refresh
  const onRefresh = useCallback(async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      await fetchUserData(user.uid);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  // Auth listener and initial data fetch
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        setDisplayName(authUser.displayName || "User");
        await fetchUserData(authUser.uid);
      } else {
        setUser(null);
        router.replace("/(auth)/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateUserPreferences = async (
    newPreferences: Partial<UserPreferences>
  ) => {
    if (!user) return;

    setUpdating(true);
    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      await updateDoc(doc(db, "users", user.uid), {
        preferences: updatedPreferences,
        lastUpdated: new Date(),
      });
      setPreferences(updatedPreferences);
    } catch (error) {
      console.error("Error updating preferences:", error);
      Alert.alert("Error", "Failed to update preferences");
    } finally {
      setUpdating(false);
    }
  };

  const updateDisplayName = async () => {
    if (!user || displayName.trim() === "") return;

    setUpdating(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: displayName.trim(),
        lastUpdated: new Date(),
      });
      setIsEditingName(false);
    } catch (error) {
      console.error("Error updating display name:", error);
      Alert.alert("Error", "Failed to update name");
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            router.replace("/(auth)/signup");
          } catch (error) {
            console.error("Error signing out:", error);
            Alert.alert("Error", "Failed to sign out");
          }
        },
      },
    ]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.background },
          styles.centered,
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Loading profile...
        </Text>
      </SafeAreaView>
    );
  }

  return (
   
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        {/* Header Section */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.profileSection}>
            <Image
              source={require("../../assets/images/Perss.jpg")}
              style={styles.profileImg}
            />
            <View style={styles.profileBadge}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={theme.success}
              />
            </View>
          </View>

          <View style={styles.nameContainer}>
            {isEditingName ? (
              <View style={styles.nameEditContainer}>
                <TextInput
                  style={[
                    styles.nameInput,
                    { color: theme.text, borderBottomColor: theme.primary },
                  ]}
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoFocus
                  onSubmitEditing={updateDisplayName}
                  placeholder="Enter your name"
                  placeholderTextColor={theme.secondaryText}
                />
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={updateDisplayName}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.nameDisplayContainer}>
                <Text style={[styles.nameText, { color: theme.text }]}>
                  {displayName}
                </Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setIsEditingName(true)}
                >
                  <Ionicons name="pencil" size={16} color={theme.primary} />
                </TouchableOpacity>
              </View>
            )}

            <Text style={[styles.emailText, { color: theme.secondaryText }]}>
              {user?.email}
            </Text>
            <Text style={[styles.joinDate, { color: theme.secondaryText }]}>
              Member since {formatDate(userStats.joinDate)}
            </Text>
          </View>
        </View>


 <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
    >

        {/* Balance Overview */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>
            Financial Overview
          </Text>

          <View style={styles.balanceGrid}>
            <View
              style={[
                styles.balanceItem,
                { 
                  backgroundColor: userStats.balance >= 0 ? `${theme.success}15` : `${theme.danger}15`
                },
              ]}
            >
              <Text style={[
                styles.balanceAmount, 
                { color: userStats.balance >= 0 ? theme.success : theme.danger }
              ]}>
                {formatCurrency(userStats.balance)}
              </Text>
              <Text style={[styles.balanceLabel, { color: theme.secondaryText }]}>
                Net Balance
              </Text>
            </View>

            <View
              style={[
                styles.balanceItem,
                { backgroundColor: `${theme.warning}15` },
              ]}
            >
              <Text style={[styles.balanceAmount, { color: theme.warning }]}>
                {userStats.pendingBills}
              </Text>
              <Text style={[styles.balanceLabel, { color: theme.secondaryText }]}>
                Pending Bills
              </Text>
            </View>
          </View>

          <View style={styles.balanceDetails}>
            <View style={styles.balanceDetailItem}>
              <Text style={[styles.balanceDetailLabel, { color: theme.secondaryText }]}>
                You are owed:
              </Text>
              <Text style={[styles.balanceDetailAmount, { color: theme.success }]}>
                {formatCurrency(userStats.totalOwed)}
              </Text>
            </View>
            <View style={styles.balanceDetailItem}>
              <Text style={[styles.balanceDetailLabel, { color: theme.secondaryText }]}>
                You owe:
              </Text>
              <Text style={[styles.balanceDetailAmount, { color: theme.danger }]}>
                {formatCurrency(userStats.totalOwing)}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>
            Your Activity
          </Text>

          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statItem,
                { backgroundColor: `${theme.primary}15` },
              ]}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: theme.primary },
                ]}
              >
                <Ionicons name="people" size={20} color="#fff" />
              </View>
              <Text style={[styles.statNumber, { color: theme.primary }]}>
                {userStats.totalGroups}
              </Text>
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
                Groups
              </Text>
            </View>

            <View
              style={[
                styles.statItem,
                { backgroundColor: `${theme.success}15` },
              ]}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: theme.success },
                ]}
              >
                <Ionicons name="receipt" size={20} color="#fff" />
              </View>
              <Text style={[styles.statNumber, { color: theme.success }]}>
                {userStats.totalExpenses}
              </Text>
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
                Expenses
              </Text>
            </View>

            <View
              style={[
                styles.statItem,
                { backgroundColor: `${theme.warning}15` },
              ]}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: theme.warning },
                ]}
              >
                <Ionicons name="trending-up" size={20} color="#fff" />
              </View>
              <Text style={[styles.statNumber, { color: theme.warning }]}>
                {userStats.streakDays}
              </Text>
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
                Day Streak
              </Text>
            </View>

            <View
              style={[
                styles.statItem,
                { backgroundColor: `${theme.secondary}15` },
              ]}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: theme.secondary },
                ]}
              >
                <Ionicons name="cash" size={20} color="#fff" />
              </View>
              <Text style={[styles.statNumber, { color: theme.secondary }]}>
                {formatCurrency(userStats.totalAmountSplit)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
                Total Split
              </Text>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>
            Preferences
          </Text>

          <View
            style={[styles.optionItem, { borderBottomColor: theme.border }]}
          >
            <View
              style={[
                styles.optionIconContainer,
                { backgroundColor: `${theme.primary}15` },
              ]}
            >
              <Ionicons name="notifications" size={20} color={theme.primary} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionText, { color: theme.text }]}>
                Push Notifications
              </Text>
              <Text
                style={[styles.optionSubtext, { color: theme.secondaryText }]}
              >
                Get notified about new expenses
              </Text>
            </View>
            <Switch
              value={preferences.notifications}
              onValueChange={(value) =>
                updateUserPreferences({ notifications: value })
              }
              thumbColor={preferences.notifications ? theme.primary : "#f4f3f4"}
              trackColor={{ false: "#767577", true: `${theme.primary}50` }}
              disabled={updating}
            />
          </View>

          <View
            style={[styles.optionItem, { borderBottomColor: theme.border }]}
          >
            <View
              style={[
                styles.optionIconContainer,
                { backgroundColor: `${theme.success}15` },
              ]}
            >
              <Ionicons name="mail" size={20} color={theme.success} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionText, { color: theme.text }]}>
                Email Updates
              </Text>
              <Text
                style={[styles.optionSubtext, { color: theme.secondaryText }]}
              >
                Weekly summary emails
              </Text>
            </View>
            <Switch
              value={preferences.emailUpdates}
              onValueChange={(value) =>
                updateUserPreferences({ emailUpdates: value })
              }
              thumbColor={preferences.emailUpdates ? theme.success : "#f4f3f4"}
              trackColor={{ false: "#767577", true: `${theme.success}50` }}
              disabled={updating}
            />
          </View>

          <View
            style={[styles.optionItem, { borderBottomColor: theme.border }]}
          >
            <View
              style={[
                styles.optionIconContainer,
                { backgroundColor: `${theme.warning}15` },
              ]}
            >
              <Ionicons name="flash" size={20} color={theme.warning} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionText, { color: theme.text }]}>
                Auto Split
              </Text>
              <Text
                style={[styles.optionSubtext, { color: theme.secondaryText }]}
              >
                Automatically split equal amounts
              </Text>
            </View>
            <Switch
              value={preferences.autoSplit}
              onValueChange={(value) =>
                updateUserPreferences({ autoSplit: value })
              }
              thumbColor={preferences.autoSplit ? theme.warning : "#f4f3f4"}
              trackColor={{ false: "#767577", true: `${theme.warning}50` }}
              disabled={updating}
            />
          </View>

          <View style={styles.optionItem}>
            <View
              style={[
                styles.optionIconContainer,
                { backgroundColor: `${theme.secondary}15` },
              ]}
            >
              <Ionicons
                name={preferences.darkMode ? "sunny" : "moon"}
                size={20}
                color={theme.secondary}
              />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionText, { color: theme.text }]}>
                Dark Mode
              </Text>
              <Text
                style={[styles.optionSubtext, { color: theme.secondaryText }]}
              >
                Switch to dark theme
              </Text>
            </View>
            <Switch
              value={preferences.darkMode}
              onValueChange={(value) =>
                updateUserPreferences({ darkMode: value })
              }
              thumbColor={preferences.darkMode ? theme.secondary : "#f4f3f4"}
              trackColor={{ false: "#767577", true: `${theme.secondary}50` }}
              disabled={updating}
            />
          </View>
        </View>

        {/* Account Actions */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>
            Account
          </Text>

          <TouchableOpacity style={[styles.optionItem, styles.dangerOption]}>
            <View
              style={[
                styles.optionIconContainer,
                { backgroundColor: `${theme.danger}15` },
              ]}
            >
              <Ionicons name="help-circle" size={20} color={theme.danger} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionText, { color: theme.text }]}>
                Help & Support
              </Text>
              <Text
                style={[styles.optionSubtext, { color: theme.secondaryText }]}
              >
                Get help or report issues
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.secondaryText}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionItem, styles.dangerOption]}
            onPress={handleSignOut}
          >
            <View
              style={[
                styles.optionIconContainer,
                { backgroundColor: `${theme.danger}15` },
              ]}
            >
              <Ionicons name="log-out" size={20} color={theme.danger} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionText, { color: theme.danger }]}>
                Sign Out
              </Text>
              <Text
                style={[styles.optionSubtext, { color: theme.secondaryText }]}
              >
                Sign out of your account
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appVersion, { color: theme.secondaryText }]}>
            InstaSplit v1.0.0
          </Text>
        </View>
         </ScrollView>
      </SafeAreaView>
   
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  profileSection: {
    position: "relative",
    marginRight: 15,
  },
  profileImg: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  profileBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 2,
  },
  nameContainer: {
    flex: 1,
  },
  nameEditContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
    borderBottomWidth: 2,
    paddingVertical: 5,
  },
  saveButton: {
    padding: 8,
    borderRadius: 20,
  },
  nameDisplayContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nameText: {
    fontSize: 20,
    fontWeight: "700",
  },
  editButton: {
    padding: 6,
  },
  emailText: {
    fontSize: 14,
    marginTop: 4,
  },
  joinDate: {
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  balanceGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  balanceItem: {
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    flex: 1,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  balanceDetails: {
    gap: 8,
  },
  balanceDetailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceDetailLabel: {
    fontSize: 14,
  },
  balanceDetailAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  statItem: {
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    width: "48%",
    position: "relative",
  },
  statIconContainer: {
    padding: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  optionIconContainer: {
    padding: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  optionSubtext: {
    fontSize: 12,
  },
  dangerOption: {
    borderBottomWidth: 0,
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: 20,
  },
  appVersion: {
    fontSize: 12,
  },
});
