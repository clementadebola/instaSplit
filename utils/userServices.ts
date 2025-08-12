import { 
  doc, 
  getDoc, 
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy
} from 'firebase/firestore';
import { auth } from "../utils/firebaseConfig";
import { db } from '../utils/firebaseConfig';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  totalOwed: number;
  totalOwing: number;
}

export interface SimpleBill {
  id: string;
  title: string;
  amount: number;
  groupName: string;
  status: 'pending' | 'settled';
}

export interface Friend {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: Date;
}

export interface Group {
  id: string;
  title: string;
  icon: string; // URL or default icon identifier
  date: string; // Creation date formatted
  members: number;
  amount: string; // Total amount formatted
  status: 'owed' | 'owes';
  owedAmount: string;
  recentActivity: string;
  participantIds: string[];
  createdBy: string;
  createdAt: Date;
}

class UserService {
  // Get or create user profile - STEP 1
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        return { uid: userId, ...userDoc.data() } as UserProfile;
      } else {
        // Create new user with empty data
        const newUser: Omit<UserProfile, 'uid'> = {
          email: auth.currentUser?.email || '',
          displayName: auth.currentUser?.displayName || 'User',
          photoURL: auth.currentUser?.photoURL || undefined,
          totalOwed: 0,
          totalOwing: 0
        };
        
        await setDoc(doc(db, 'users', userId), newUser);
        return { uid: userId, ...newUser };
      }
    } catch (error) {
      console.error('Error with user profile:', error);
      return null;
    }
  }

  // Get user's bills from groups - Simple approach
  async getUserBills(userId: string): Promise<SimpleBill[]> {
    try {
      console.log('Fetching bills from groups for user:', userId);
      
      // Fetch groups where user is a participant
      const groupsQuery = query(
        collection(db, 'groups'),
        where('participantIds', 'array-contains', userId)
      );
      
      const groupsSnapshot = await getDocs(groupsQuery);
      const bills: SimpleBill[] = [];
      
      console.log('Groups snapshot size:', groupsSnapshot.size);
      
      groupsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Group data:', data);
        
        // Convert each group to a "bill" for the pending bills section
        // Only show groups that have pending amounts
        const userBalance = data.userBalances?.[userId] || 0;
        const totalAmount = data.totalAmount || 0;
        
        if (totalAmount > 0) { // Only show groups with expenses
          bills.push({
            id: doc.id,
            title: data.title || 'Group Expenses',
            amount: Math.abs(userBalance), // Show absolute amount
            groupName: data.title || 'Unnamed Group',
            status: 'pending'
          });
        }
      });
      
      console.log('Bills from groups:', bills);
      return bills;
    } catch (error) {
      console.error('Error fetching bills from groups:', error);
      return [];
    }
  }

  // Get sample bills (fallback for testing)
  private getSampleBills(userId: string): SimpleBill[] {
    return [
      {
        id: 'sample1',
        title: 'Restaurant Dinner',
        amount: 85.50,
        groupName: 'Friends Group',
        status: 'pending'
      },
      {
        id: 'sample2',
        title: 'Movie Tickets',
        amount: 45.00,
        groupName: 'Weekend Plans',
        status: 'pending'
      }
    ];
  }

  // Get user's friends - NEW FUNCTIONALITY
  async getUserFriends(userId: string): Promise<Friend[]> {
    try {
      console.log('Fetching friends for user:', userId);
      
      // Try to fetch from friends subcollection first
      try {
        const friendsCollection = collection(db, 'users', userId, 'friends');
        const friendsQuery = query(
          friendsCollection, 
          orderBy('createdAt', 'desc')
        );
        const friendsSnapshot = await getDocs(friendsQuery);
        
        const friends: Friend[] = [];
        friendsSnapshot.forEach((doc) => {
          const data = doc.data();
          friends.push({
            id: doc.id,
            name: data.name || data.displayName || 'Unknown',
            email: data.email || '',
            avatar: data.avatar || data.photoURL,
            createdAt: data.createdAt?.toDate() || new Date()
          });
        });
        
        if (friends.length > 0) {
          console.log(`Found ${friends.length} friends in subcollection`);
          return friends;
        }
      } catch (error) {
        console.log('Friends subcollection not accessible, trying friendships...');
      }
      
      // Alternative: try friendships collection
      try {
        const friendshipsQuery = query(
          collection(db, 'friendships'),
          where('users', 'array-contains', userId),
          where('status', '==', 'accepted')
        );
        const friendshipsSnapshot = await getDocs(friendshipsQuery);
        
        const friends: Friend[] = [];
        
        for (const docSnapshot of friendshipsSnapshot.docs) {
          const data = docSnapshot.data();
          // Get the other user's ID (not the current user)
          const friendId = data.users.find((id: string) => id !== userId);
          
          if (friendId) {
            // Fetch friend's profile
            const friendProfile = await this.getUserProfile(friendId);
            if (friendProfile) {
              friends.push({
                id: friendId,
                name: friendProfile.displayName,
                email: friendProfile.email,
                avatar: friendProfile.photoURL,
                createdAt: data.createdAt?.toDate() || new Date()
              });
            }
          }
        }
        
        if (friends.length > 0) {
          console.log(`Found ${friends.length} friends from friendships`);
          return friends;
        }
      } catch (error) {
        console.log('Friendships collection not accessible');
      }
      
      // Fallback: return sample friends for testing
      console.log('No friends found, returning sample data');
      return this.getSampleFriends();
      
    } catch (error) {
      console.error('Error fetching friends:', error);
      return this.getSampleFriends();
    }
  }

  // Get sample friends (fallback for testing)
  private getSampleFriends(): Friend[] {
    return [
      {
        id: 'friend1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: undefined,
        createdAt: new Date()
      },
      {
        id: 'friend2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        avatar: undefined,
        createdAt: new Date()
      },
      {
        id: 'friend3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        avatar: undefined,
        createdAt: new Date()
      }
    ];
  }

  // Get user's groups
  async getUserGroups(userId: string): Promise<Group[]> {
    try {
      console.log('Fetching groups for user:', userId);
      
      const groupsQuery = query(
        collection(db, 'groups'),
        where('participantIds', 'array-contains', userId)
      );
      
      const groupsSnapshot = await getDocs(groupsQuery);
      const groups: Group[] = [];
      
      console.log('Groups snapshot size:', groupsSnapshot.size);
      
      for (const docSnapshot of groupsSnapshot.docs) {
        const data = docSnapshot.data();
        console.log('Group data:', data);
        
        // Calculate group stats (you can enhance this logic)
        const totalAmount = data.totalAmount || 0;
        const userOwed = data.userBalances?.[userId] || 0;
        
        // Format the group data
        const group: Group = {
          id: docSnapshot.id,
          title: data.title || 'Unnamed Group',
          icon: data.icon || 'https://via.placeholder.com/50', // Default icon
          date: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : new Date().toLocaleDateString(),
          members: data.participantIds?.length || 0,
          amount: `$${totalAmount.toFixed(2)}`,
          status: userOwed >= 0 ? 'owed' : 'owes',
          owedAmount: `$${Math.abs(userOwed).toFixed(2)}`,
          recentActivity: data.recentActivity || 'No recent activity',
          participantIds: data.participantIds || [],
          createdBy: data.createdBy || '',
          createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date()
        };
        
        groups.push(group);
      }
      
      // Sort by creation date (newest first)
      groups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      console.log('Final groups array:', groups);
      return groups;
    } catch (error) {
      console.error('Error fetching groups:', error);
      return [];
    }
  }

  // Refresh all user data at once - simplified
  async refreshAllUserData(userId: string) {
    try {
      console.log('Refreshing all user data for:', userId);
      
      // First update the balance from groups
      await this.calculateAndUpdateBalance(userId);
      
      // Then fetch the updated data
      const [profile, bills] = await Promise.all([
        this.getUserProfile(userId),
        this.getUserBills(userId)
      ]);
      
      return {
        profile,
        bills
      };
    } catch (error) {
      console.error('Error refreshing all user data:', error);
      throw error;
    }
  }

  // Add a friend to user's friends list
  async addFriend(userId: string, friendData: Omit<Friend, 'id' | 'createdAt'>) {
    try {
      const friendDoc = {
        ...friendData,
        createdAt: new Date()
      };
      
      const friendsCollection = collection(db, 'users', userId, 'friends');
      const docRef = await addDoc(friendsCollection, friendDoc);
      console.log('Friend added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding friend:', error);
      return null;
    }
  }

  // Create a sample group (for testing)
  async createSampleGroup(userId: string) {
    try {
      const sampleGroup = {
        title: "Weekend Trip",
        icon: "https://via.placeholder.com/50",
        participantIds: [userId],
        createdBy: userId,
        createdAt: new Date(),
        totalAmount: 150.00,
        userBalances: {
          [userId]: 75.00 // User is owed $75
        },
        recentActivity: "Created group",
        description: "Trip expenses"
      };
      
      const docRef = await addDoc(collection(db, 'groups'), sampleGroup);
      console.log('Sample group created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating sample group:', error);
      return null;
    }
  }

  // Create sample bill (for testing)
  async createSampleBill(userId: string) {
    try {
      const sampleBill = {
        title: "Test Restaurant Bill",
        amount: 85.50,
        groupName: "Friends Group",
        status: "pending",
        participants: [userId],
        createdBy: userId,
        createdAt: new Date(),
        date: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'bills'), sampleBill);
      console.log('Sample bill created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating sample bill:', error);
      return null;
    }
  }

  // Create sample friends (for testing)
  async createSampleFriends(userId: string) {
    try {
      const sampleFriends = [
        { name: 'Alice Cooper', email: 'alice@example.com' },
        { name: 'Bob Wilson', email: 'bob@example.com' },
        { name: 'Carol Davis', email: 'carol@example.com' }
      ];

      const friendIds = [];
      for (const friend of sampleFriends) {
        const friendId = await this.addFriend(userId, friend);
        if (friendId) friendIds.push(friendId);
      }
      
      console.log('Sample friends created:', friendIds);
      return friendIds;
    } catch (error) {
      console.error('Error creating sample friends:', error);
      return [];
    }
  }

  // Calculate and update user balance from groups
  async calculateAndUpdateBalance(userId: string): Promise<void> {
    try {
      console.log('Calculating balance for user:', userId);
      
      // Fetch all groups the user participates in
      const groupsQuery = query(
        collection(db, 'groups'),
        where('participantIds', 'array-contains', userId)
      );
      
      const groupsSnapshot = await getDocs(groupsQuery);
      
      let totalOwed = 0; // How much user owes to others
      let totalOwing = 0; // How much others owe to user
      
      groupsSnapshot.forEach((doc) => {
        const data = doc.data();
        const userBalance = data.userBalances?.[userId] || 0;
        
        if (userBalance > 0) {
          totalOwing += userBalance; // Others owe this to user
        } else if (userBalance < 0) {
          totalOwed += Math.abs(userBalance); // User owes this to others
        }
      });
      
      console.log('Calculated totals - Owed:', totalOwed, 'Owing:', totalOwing);
      
      // Update user profile with new balance
      await updateDoc(doc(db, 'users', userId), {
        totalOwed,
        totalOwing,
        lastUpdated: new Date()
      });
      
      console.log('Balance updated successfully');
    } catch (error) {
      console.error('Error calculating balance:', error);
    }
  }
}

export const userService = new UserService();