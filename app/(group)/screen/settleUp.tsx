// app/groups/settle-up.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

import { auth, db } from '../../../utils/firebaseConfig';

interface MemberBalance {
  id: string;
  name: string;
  email?: string;
  balance: number;
  isAdmin: boolean;
}

interface GroupDetails {
  id: string;
  title: string;
  admin: string;
  membersList: Array<{
    id: string;
    name: string;
    email?: string;
  }>;
  amount: number;
  bills: Array<{
    id: string;
    name: string;
    amount: number;
    paidBy: string;
  }>;
}

export default function SettleUpScreen() {
  const { groupId } = useLocalSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [memberBalances, setMemberBalances] = useState<MemberBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<MemberBalance | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fetchGroupData = useCallback(async () => {
    if (!groupId || !user) {
      console.log('Missing groupId or user:', { groupId, user: !!user });
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching group data for:', groupId, 'User:', user.uid);
      
      const groupRef = doc(db, 'groups', groupId as string);
      const groupSnap = await getDoc(groupRef);
      
      if (!groupSnap.exists()) {
        console.log('Group document does not exist');
        throw new Error('Group not found');
      }

      const groupData = groupSnap.data();
      console.log('Group data:', groupData);

      // Verify user has access to this group
      const userHasAccess = groupData.admin === user.uid || 
                           groupData.membersList?.some((member: any) => member.id === user.uid);
      
      if (!userHasAccess) {
        console.log('User does not have access to this group');
        throw new Error('You do not have permission to access this group');
      }

      const fetchedGroup: GroupDetails = {
        id: groupSnap.id,
        title: groupData.title || 'Untitled Group',
        admin: groupData.admin || '',
        membersList: groupData.membersList || [],
        amount: Number(groupData.amount) || 0,
        bills: groupData.bills || [],
      };

      setGroup(fetchedGroup);

      // Get payments with better error handling
      let payments: any[] = [];
      try {
        const paymentsQuery = query(
          collection(db, 'payments'), 
          where('groupId', '==', groupId)
        );
        const paymentsSnap = await getDocs(paymentsQuery);
        payments = paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Payments fetched:', payments.length);
      } catch (paymentsError) {
        console.log('Error fetching payments (non-critical):', paymentsError);
        // Continue without payments if they can't be fetched
      }

      // Calculate balances
      const allMembers = new Map<string, MemberBalance>();
      
      // Add admin
      if (fetchedGroup.admin) {
        // Get admin name from membersList or use default
        const adminMember = fetchedGroup.membersList.find(m => m.id === fetchedGroup.admin);
        allMembers.set(fetchedGroup.admin, {
          id: fetchedGroup.admin,
          name: adminMember?.name || 'Admin',
          email: adminMember?.email,
          balance: 0,
          isAdmin: true,
        });
      }

      // Add other members
      fetchedGroup.membersList.forEach(member => {
        if (!allMembers.has(member.id)) {
          allMembers.set(member.id, {
            id: member.id,
            name: member.name,
            email: member.email,
            balance: 0,
            isAdmin: member.id === fetchedGroup.admin,
          });
        }
      });

      const members = Array.from(allMembers.values());
      const totalMembers = members.length;

      console.log('Total members:', totalMembers, 'Members:', members.map(m => m.name));

      if (totalMembers === 0) {
        setMemberBalances([]);
        return;
      }

      const calculatedBalances = members.map(member => {
        let paid = 0;
        let owes = 0;

        // Group amount split
        if (fetchedGroup.amount > 0) {
          owes += fetchedGroup.amount / totalMembers;
          if (member.id === fetchedGroup.admin) {
            paid += fetchedGroup.amount;
          }
        }

        // Bills split
        fetchedGroup.bills.forEach(bill => {
          owes += bill.amount / totalMembers;
          if (bill.paidBy === member.id) {
            paid += bill.amount;
          }
        });

        // Payments made/received
        payments.forEach((payment: any) => {
          if (payment.fromUserId === member.id) {
            paid += Number(payment.amount) || 0;
          }
          if (payment.toUserId === member.id) {
            owes -= Number(payment.amount) || 0;
          }
        });

        const balance = Number((paid - owes).toFixed(2));
        
        return {
          ...member,
          balance,
        };
      });

      console.log('Calculated balances:', calculatedBalances);
      setMemberBalances(calculatedBalances);

    } catch (error: any) {
      console.error('Error fetching group data:', error);
      
      let errorMessage = 'Failed to load group data';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'You do not have permission to access this group. Please check with the group admin.';
      } else if (error.code === 'not-found') {
        errorMessage = 'Group not found. It may have been deleted.';
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'Please sign in to access this group.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage, [
        {
          text: 'Go Back',
          onPress: () => router.back(),
        },
        {
          text: 'Retry',
          onPress: () => fetchGroupData(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [groupId, user]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setReceiptImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setReceiptImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const processPayment = async () => {
    if (!selectedMember || !user || !group || !paymentAmount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid payment amount');
      return;
    }

    try {
      setUploading(true);

      const paymentData = {
        groupId,
        fromUserId: user.uid,
        fromUserName: user.displayName || user.email?.split('@')[0] || 'Unknown',
        toUserId: selectedMember.id,
        toUserName: selectedMember.name,
        amount,
        description: paymentDescription || `Payment for ${group.title}`,
        hasReceipt: !!receiptImage,
        status: 'completed',
        createdAt: serverTimestamp(),
        type: 'settlement',
      };

      console.log('Processing payment:', paymentData);
      
      await addDoc(collection(db, 'payments'), paymentData);

      Alert.alert('Payment Confirmed', `Payment of $${amount} recorded successfully.`, [
        {
          text: 'OK',
          onPress: () => {
            setShowPaymentModal(false);
            setSelectedMember(null);
            setPaymentAmount('');
            setPaymentDescription('');
            setReceiptImage(null);
            fetchGroupData();
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error processing payment:', error);
      
      let errorMessage = 'Failed to process payment. Please try again.';
      if (error.code === 'permission-denied') {
        errorMessage = 'You do not have permission to record payments for this group.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      console.log('Auth state changed:', !!authUser);
      setUser(authUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchGroupData();
    }
  }, [user, fetchGroupData]);

  const renderMemberItem = (member: MemberBalance) => {
    if (member.id === user?.uid) return null;

    const youOwe = member.balance > 0;
    const theyOwe = member.balance < 0;
    const isSettled = Math.abs(member.balance) < 0.01;

    return (
      <TouchableOpacity
        key={member.id}
        style={styles.memberItem}
        onPress={() => {
          if (isSettled) {
            Alert.alert('Info', 'No balance to settle with this member');
            return;
          }
          
          if (!youOwe) {
            Alert.alert('Info', `${member.name} owes you $${Math.abs(member.balance).toFixed(2)}`);
            return;
          }
          
          setSelectedMember(member);
          setPaymentAmount(Math.abs(member.balance).toString());
          setShowPaymentModal(true);
        }}
      >
        <View style={styles.memberInfo}>
          <View style={styles.memberAvatar}>
            <Text style={styles.memberInitials}>
              {member.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>{member.name}</Text>
            <Text style={styles.memberEmail}>{member.email}</Text>
          </View>
        </View>
        
        <View style={styles.balanceInfo}>
          <Text style={[
            styles.balanceAmount,
            { 
              color: member.balance > 0 ? '#EF4444' : 
                    member.balance < 0 ? '#22C55E' : '#666' 
            }
          ]}>
            ${Math.abs(member.balance).toFixed(2)}
          </Text>
          <Text style={styles.balanceLabel}>
            {member.balance > 0 ? 'You owe' : 
             member.balance < 0 ? 'Owes you' : 'Settled'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6F2BD4FF" />
        <Text style={styles.loadingText}>Loading group data...</Text>
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Failed to load group</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => fetchGroupData()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settle Up</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Who do you want to pay?</Text>
          
          <View style={styles.membersList}>
            {memberBalances.map(renderMemberItem)}
            
            {memberBalances.filter(m => m.id !== user?.uid && Math.abs(m.balance) > 0.01).length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
                <Text style={styles.emptyStateText}>All settled up!</Text>
                <Text style={styles.emptyStateSubtext}>
                  No outstanding balances with other members
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showPaymentModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Settle Up</Text>
            <TouchableOpacity onPress={processPayment} disabled={uploading}>
              <Text style={[styles.saveButton, uploading && styles.disabledButton]}>
                {uploading ? 'Processing...' : 'Pay'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedMember && (
              <>
                <View style={styles.paymentInfo}>
                  <Text style={styles.sectionTitle}>Payment To</Text>
                  <View style={styles.memberDisplay}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberInitials}>
                        {selectedMember.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.memberName}>{selectedMember.name}</Text>
                      <Text style={styles.memberEmail}>{selectedMember.email}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Amount</Text>
                  <TextInput
                    style={styles.textInput}
                    value={paymentAmount}
                    onChangeText={setPaymentAmount}
                    keyboardType="decimal-pad"
                    placeholder="Enter amount"
                  />
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Description (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={paymentDescription}
                    onChangeText={setPaymentDescription}
                    placeholder="Payment description"
                    multiline
                  />
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Receipt (Optional)</Text>
                  
                  {receiptImage ? (
                    <View style={styles.receiptPreview}>
                      <Image source={{ uri: receiptImage }} style={styles.receiptImage} />
                      <TouchableOpacity 
                        style={styles.removeReceiptButton}
                        onPress={() => setReceiptImage(null)}
                      >
                        <Ionicons name="close-circle" size={24} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.receiptActions}>
                      <TouchableOpacity style={styles.receiptButton} onPress={takePhoto}>
                        <Ionicons name="camera" size={20} color="#6F2BD4FF" />
                        <Text style={styles.receiptButtonText}>Camera</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.receiptButton} onPress={pickImage}>
                        <Ionicons name="images" size={20} color="#6F2BD4FF" />
                        <Text style={styles.receiptButtonText}>Gallery</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6F2BD4FF',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#6F2BD4FF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  membersList: {
    gap: 10,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6F2BD4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberInitials: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  balanceInfo: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cancelButton: {
    color: '#666',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    color: '#6F2BD4FF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  paymentInfo: {
    marginBottom: 20,
  },
  memberDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  receiptActions: {
    flexDirection: 'row',
    gap: 15,
  },
  receiptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 6,
  },
  receiptButtonText: {
    fontSize: 14,
    color: '#6F2BD4FF',
    fontWeight: '500',
  },
  receiptPreview: {
    position: 'relative',
    marginTop: 10,
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeReceiptButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
});