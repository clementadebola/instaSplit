// import React, { useState, useEffect } from 'react';
// import {
//   Modal,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   FlatList,
//   Alert,
//   StyleSheet,
//   ActivityIndicator,
//   Dimensions,
//   SafeAreaView,
//   StatusBar,
// } from 'react-native';
// import { AntDesign, MaterialIcons, Feather } from '@expo/vector-icons';
// import * as Contacts from 'expo-contacts';
// import * as SMS from 'expo-sms';
// import { firebase } from '../config/firebase';

// const { width } = Dimensions.get('window');

// interface Contact {
//   id: string;
//   name: string;
//   phoneNumbers?: { number: string }[];
// }

// interface Bill {
//   id: string;
//   name: string;
//   amount: number;
//   paidBy: string;
//   date: string;
// }

// interface GroupMember {
//   id: string;
//   name: string;
//   phone?: string;
//   isAdmin: boolean;
//   amount: number;
// }

// interface CreateGroupModalProps {
//   visible: boolean;
//   onClose: () => void;
//   onGroupCreated: () => void;
//   currentUserId: string;
// }

// const CATEGORIES = [
//   { name: 'Food & Dining', icon: '🍽️', color: '#FF6B6B' },
//   { name: 'Entertainment', icon: '🎬', color: '#4ECDC4' },
//   { name: 'Travel', icon: '✈️', color: '#45B7D1' },
//   { name: 'Shopping', icon: '🛍️', color: '#96CEB4' },
//   { name: 'Utilities', icon: '⚡', color: '#FFEAA7' },
//   { name: 'Rent', icon: '🏠', color: '#DDA0DD' },
//   { name: 'Groceries', icon: '🛒', color: '#98D8C8' },
//   { name: 'Transportation', icon: '🚗', color: '#F7DC6F' },
//   { name: 'Healthcare', icon: '🏥', color: '#F1948A' },
//   { name: 'Other', icon: '📝', color: '#85C1E9' }
// ];

// export default function CreateGroupModal({
//   visible,
//   onClose,
//   onGroupCreated,
//   currentUserId
// }: CreateGroupModalProps) {
//   // Form states
//   const [groupName, setGroupName] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [customCategory, setCustomCategory] = useState('');
//   const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
//   const [contacts, setContacts] = useState<Contact[]>([]);
//   const [bills, setBills] = useState<Bill[]>([]);
//   const [newBillName, setNewBillName] = useState('');
//   const [newBillAmount, setNewBillAmount] = useState('');
//   const [splitType, setSplitType] = useState<'equal' | 'percentage'>('equal');
//   const [customPercentages, setCustomPercentages] = useState<{ [key: string]: number }>({});
//   const [loading, setLoading] = useState(false);
//   const [contactsLoading, setContactsLoading] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [currentStep, setCurrentStep] = useState(1);

//   // Load contacts when modal opens
//   useEffect(() => {
//     if (visible) {
//       loadContacts();
//       resetForm();
//     }
//   }, [visible]);

//   const loadContacts = async () => {
//     setContactsLoading(true);
//     try {
//       const { status } = await Contacts.requestPermissionsAsync();
//       if (status === 'granted') {
//         const { data } = await Contacts.getContactsAsync({
//           fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
//         });
        
//         const formattedContacts = data
//           .filter(contact => contact.name && contact.phoneNumbers?.length)
//           .map(contact => ({
//             id: contact.id || Math.random().toString(),
//             name: contact.name || 'Unknown',
//             phoneNumbers: contact.phoneNumbers
//           }))
//           .sort((a, b) => a.name.localeCompare(b.name));
        
//         setContacts(formattedContacts);
//       } else {
//         Alert.alert('Permission Required', 'Please allow access to contacts to add friends to your group.');
//       }
//     } catch (error) {
//       console.error('Error loading contacts:', error);
//       Alert.alert('Error', 'Failed to load contacts. Please try again.');
//     } finally {
//       setContactsLoading(false);
//     }
//   };

//   const filteredContacts = contacts.filter(contact =>
//     contact.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const toggleContactSelection = (contact: Contact) => {
//     setSelectedContacts(prev => {
//       const isSelected = prev.find(c => c.id === contact.id);
//       if (isSelected) {
//         return prev.filter(c => c.id !== contact.id);
//       } else {
//         return [...prev, contact];
//       }
//     });
//   };

//   const addBill = () => {
//     if (!newBillName.trim()) {
//       Alert.alert('Error', 'Please enter a bill name');
//       return;
//     }
    
//     const amount = parseFloat(newBillAmount.trim());
//     if (isNaN(amount) || amount <= 0) {
//       Alert.alert('Error', 'Please enter a valid amount');
//       return;
//     }

//     const bill: Bill = {
//       id: Date.now().toString(),
//       name: newBillName.trim(),
//       amount: amount,
//       paidBy: currentUserId,
//       date: new Date().toISOString()
//     };
    
//     setBills(prev => [...prev, bill]);
//     setNewBillName('');
//     setNewBillAmount('');
//   };

//   const removeBill = (billId: string) => {
//     setBills(prev => prev.filter(bill => bill.id !== billId));
//   };

//   const calculateSplitAmounts = () => {
//     const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
//     const totalMembers = selectedContacts.length + 1;
    
//     if (splitType === 'equal') {
//       const amountPerPerson = totalAmount / totalMembers;
//       return { totalAmount, amountPerPerson, splitAmounts: {} };
//     } else {
//       const splitAmounts: { [key: string]: number } = {};
//       selectedContacts.forEach(contact => {
//         const percentage = customPercentages[contact.id] || 0;
//         splitAmounts[contact.id] = (totalAmount * percentage) / 100;
//       });
      
//       const usedPercentage = Object.values(customPercentages).reduce((sum, p) => sum + p, 0);
//       const currentUserPercentage = Math.max(0, 100 - usedPercentage);
//       splitAmounts[currentUserId] = (totalAmount * currentUserPercentage) / 100;
      
//       return { totalAmount, amountPerPerson: 0, splitAmounts };
//     }
//   };

//   const sendInvites = async (groupId: string, groupName: string) => {
//     try {
//       const isAvailable = await SMS.isAvailableAsync();
//       if (isAvailable && selectedContacts.length > 0) {
//         const phoneNumbers = selectedContacts
//           .map(contact => contact.phoneNumbers?.[0]?.number)
//           .filter(Boolean) as string[];
        
//         if (phoneNumbers.length > 0) {
//           const message = `🧾 You've been invited to join "${groupName}" for bill splitting! Download our app to manage shared expenses easily.`;
//           await SMS.sendSMSAsync(phoneNumbers, message);
//         }
//       }
//     } catch (error) {
//       console.error('Error sending invites:', error);
//     }
//   };

//   const validateForm = (): string | null => {
//     if (!groupName.trim()) return 'Please enter a group name';
//     if (!selectedCategory && !customCategory) return 'Please select or enter a category';
//     if (bills.length === 0) return 'Please add at least one bill';
//     if (selectedContacts.length === 0) return 'Please add at least one friend';
    
//     if (splitType === 'percentage') {
//       const totalPercentage = Object.values(customPercentages).reduce((sum, p) => sum + p, 0);
//       if (totalPercentage > 100) return 'Total percentage cannot exceed 100%';
//     }
    
//     return null;
//   };

//   const createGroup = async () => {
//     const validationError = validateForm();
//     if (validationError) {
//       Alert.alert('Error', validationError);
//       return;
//     }

//     setLoading(true);

//     try {
//       const { totalAmount, amountPerPerson, splitAmounts } = calculateSplitAmounts();
      
//       const members: GroupMember[] = [
//         {
//           id: currentUserId,
//           name: 'You',
//           isAdmin: true,
//           amount: splitType === 'equal' ? amountPerPerson : (splitAmounts[currentUserId] || 0)
//         },
//         ...selectedContacts.map(contact => ({
//           id: contact.id,
//           name: contact.name,
//           phone: contact.phoneNumbers?.[0]?.number,
//           isAdmin: false,
//           amount: splitType === 'equal' ? amountPerPerson : (splitAmounts[contact.id] || 0)
//         }))
//       ];

//       const selectedCategoryData = CATEGORIES.find(cat => cat.name === selectedCategory);

//       const newGroup = {
//         title: groupName.trim(),
//         category: selectedCategory || customCategory,
//         categoryIcon: selectedCategoryData?.icon || '📝',
//         categoryColor: selectedCategoryData?.color || '#85C1E9',
//         date: new Date().toLocaleDateString(),
//         members: members.length,
//         amount: `$${totalAmount.toFixed(2)}`,
//         status: 'owing' as const,
//         owedAmount: `$${(splitType === 'equal' ? amountPerPerson : splitAmounts[currentUserId] || 0).toFixed(2)}`,
//         recentActivity: 'Group created',
//         admin: currentUserId,
//         membersList: members,
//         bills,
//         splitType,
//         splitPercentages: splitType === 'percentage' ? customPercentages : undefined,
//         createdBy: currentUserId,
//       };

//       const groupRef = await firebase.firestore().collection('groups').add({
//         ...newGroup,
//         createdAt: firebase.firestore.FieldValue.serverTimestamp(),
//         updatedAt: firebase.firestore.FieldValue.serverTimestamp()
//       });

//       await sendInvites(groupRef.id, groupName);

//       Alert.alert(
//         'Success! 🎉', 
//         `Group "${groupName}" has been created successfully!\n\n💬 Invites have been sent to ${selectedContacts.length} friend${selectedContacts.length !== 1 ? 's' : ''}.`,
//         [
//           {
//             text: 'Great!',
//             onPress: () => {
//               resetForm();
//               onClose();
//               onGroupCreated();
//             }
//           }
//         ]
//       );

//     } catch (error) {
//       console.error('Error creating group:', error);
//       Alert.alert('Error', 'Failed to create group. Please check your internet connection and try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setGroupName('');
//     setSelectedCategory('');
//     setCustomCategory('');
//     setSelectedContacts([]);
//     setBills([]);
//     setNewBillName('');
//     setNewBillAmount('');
//     setSplitType('equal');
//     setCustomPercentages({});
//     setSearchQuery('');
//     setCurrentStep(1);
//   };

//   const updatePercentage = (contactId: string, percentage: string) => {
//     const numPercentage = parseFloat(percentage) || 0;
//     setCustomPercentages(prev => ({
//       ...prev,
//       [contactId]: Math.min(100, Math.max(0, numPercentage))
//     }));
//   };

//   const getTotalBillAmount = () => bills.reduce((sum, bill) => sum + bill.amount, 0);

//   const canProceedToNextStep = () => {
//     switch (currentStep) {
//       case 1:
//         return groupName.trim() && (selectedCategory || customCategory);
//       case 2:
//         return selectedContacts.length > 0;
//       case 3:
//         return bills.length > 0;
//       default:
//         return true;
//     }
//   };

//   const renderStepIndicator = () => (
//     <View style={styles.stepIndicator}>
//       {[1, 2, 3, 4].map((step) => (
//         <View key={step} style={styles.stepContainer}>
//           <View style={[
//             styles.stepCircle,
//             currentStep >= step ? styles.activeStep : styles.inactiveStep
//           ]}>
//             <Text style={[
//               styles.stepText,
//               currentStep >= step ? styles.activeStepText : styles.inactiveStepText
//             ]}>
//               {step}
//             </Text>
//           </View>
//           {step < 4 && (
//             <View style={[
//               styles.stepLine,
//               currentStep > step ? styles.activeStepLine : styles.inactiveStepLine
//             ]} />
//           )}
//         </View>
//       ))}
//     </View>
//   );

//   const renderStepContent = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <View style={styles.stepContent}>
//             <Text style={styles.stepTitle}>📝 Group Details</Text>
//             <Text style={styles.stepDescription}>Let's start by naming your group and choosing a category</Text>
            
//             <View style={styles.section}>
//               <Text style={styles.sectionTitle}>Group Name *</Text>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Weekend Trip, House Expenses..."
//                 value={groupName}
//                 onChangeText={setGroupName}
//                 maxLength={50}
//                 placeholderTextColor="#999"
//               />
//             </View>

//             <View style={styles.section}>
//               <Text style={styles.sectionTitle}>Category *</Text>
//               <ScrollView 
//                 horizontal 
//                 showsHorizontalScrollIndicator={false} 
//                 contentContainerStyle={styles.categoriesScrollContainer}
//               >
//                 {CATEGORIES.map((category) => (
//                   <TouchableOpacity
//                     key={category.name}
//                     style={[
//                       styles.categoryCard,
//                       selectedCategory === category.name && styles.selectedCategoryCard
//                     ]}
//                     onPress={() => {
//                       setSelectedCategory(category.name);
//                       setCustomCategory('');
//                     }}
//                   >
//                     <Text style={styles.categoryIcon}>{category.icon}</Text>
//                     <Text style={[
//                       styles.categoryText,
//                       selectedCategory === category.name && styles.selectedCategoryText
//                     ]}>
//                       {category.name}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </ScrollView>
              
//               <TextInput
//                 style={[styles.input, { marginTop: 12 }]}
//                 placeholder="Or enter a custom category"
//                 value={customCategory}
//                 onChangeText={(text) => {
//                   setCustomCategory(text);
//                   if (text) setSelectedCategory('');
//                 }}
//                 maxLength={30}
//                 placeholderTextColor="#999"
//               />
//             </View>
//           </View>
//         );

//       case 2:
//         return (
//           <View style={styles.stepContent}>
//             <Text style={styles.stepTitle}>👥 Add Friends</Text>
//             <Text style={styles.stepDescription}>
//               Select friends to split expenses with ({selectedContacts.length} selected)
//             </Text>
            
//             <View style={styles.searchContainer}>
//               <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
//               <TextInput
//                 style={styles.searchInput}
//                 placeholder="Search contacts..."
//                 value={searchQuery}
//                 onChangeText={setSearchQuery}
//                 placeholderTextColor="#999"
//               />
//             </View>

//             {contactsLoading ? (
//               <View style={styles.loadingContainer}>
//                 <ActivityIndicator size="large" color="#007AFF" />
//                 <Text style={styles.loadingText}>Loading contacts...</Text>
//               </View>
//             ) : (
//               <FlatList
//                 data={filteredContacts}
//                 keyExtractor={(item) => item.id}
//                 renderItem={({ item }) => (
//                   <TouchableOpacity
//                     style={styles.contactCard}
//                     onPress={() => toggleContactSelection(item)}
//                   >
//                     <View style={styles.contactAvatar}>
//                       <Text style={styles.contactInitial}>
//                         {item.name.charAt(0).toUpperCase()}
//                       </Text>
//                     </View>
//                     <View style={styles.contactInfo}>
//                       <Text style={styles.contactName}>{item.name}</Text>
//                       <Text style={styles.contactPhone}>
//                         {item.phoneNumbers?.[0]?.number || 'No phone'}
//                       </Text>
//                     </View>
//                     <View style={[
//                       styles.selectionIndicator,
//                       selectedContacts.find(c => c.id === item.id) && styles.selectedIndicator
//                     ]}>
//                       {selectedContacts.find(c => c.id === item.id) && (
//                         <Feather name="check" size={16} color="white" />
//                       )}
//                     </View>
//                   </TouchableOpacity>
//                 )}
//                 showsVerticalScrollIndicator={false}
//                 contentContainerStyle={styles.contactsList}
//               />
//             )}
//           </View>
//         );

//       case 3:
//         return (
//           <View style={styles.stepContent}>
//             <Text style={styles.stepTitle}>💰 Add Bills</Text>
//             <Text style={styles.stepDescription}>Add the expenses you want to split</Text>
            
//             <View style={styles.addBillCard}>
//               <Text style={styles.addBillTitle}>Add New Bill</Text>
//               <View style={styles.addBillForm}>
//                 <TextInput
//                   style={[styles.input, styles.billNameInput]}
//                   placeholder="Bill name (Dinner, Uber, etc.)"
//                   value={newBillName}
//                   onChangeText={setNewBillName}
//                   maxLength={30}
//                   placeholderTextColor="#999"
//                 />
//                 <View style={styles.amountInputContainer}>
//                   <Text style={styles.currencySymbol}>$</Text>
//                   <TextInput
//                     style={[styles.input, styles.amountInput]}
//                     placeholder="0.00"
//                     value={newBillAmount}
//                     onChangeText={setNewBillAmount}
//                     keyboardType="decimal-pad"
//                     placeholderTextColor="#999"
//                   />
//                 </View>
//                 <TouchableOpacity style={styles.addBillButton} onPress={addBill}>
//                   <Feather name="plus" size={20} color="white" />
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {bills.length > 0 && (
//               <View style={styles.billsList}>
//                 <Text style={styles.billsListTitle}>Added Bills</Text>
//                 {bills.map((bill) => (
//                   <View key={bill.id} style={styles.billCard}>
//                     <View style={styles.billCardContent}>
//                       <Text style={styles.billName}>{bill.name}</Text>
//                       <Text style={styles.billAmount}>${bill.amount.toFixed(2)}</Text>
//                     </View>
//                     <TouchableOpacity 
//                       style={styles.deleteBillButton}
//                       onPress={() => removeBill(bill.id)}
//                     >
//                       <Feather name="trash-2" size={16} color="#ff4444" />
//                     </TouchableOpacity>
//                   </View>
//                 ))}
//                 <View style={styles.totalCard}>
//                   <Text style={styles.totalText}>Total: ${getTotalBillAmount().toFixed(2)}</Text>
//                 </View>
//               </View>
//             )}
//           </View>
//         );

//       case 4:
//         return (
//           <View style={styles.stepContent}>
//             <Text style={styles.stepTitle}>⚖️ Split Options</Text>
//             <Text style={styles.stepDescription}>Choose how to divide the expenses</Text>
            
//             <View style={styles.splitTypeContainer}>
//               <TouchableOpacity
//                 style={[
//                   styles.splitTypeCard,
//                   splitType === 'equal' && styles.selectedSplitCard
//                 ]}
//                 onPress={() => setSplitType('equal')}
//               >
//                 <MaterialIcons name="equalizer" size={24} color={splitType === 'equal' ? 'white' : '#007AFF'} />
//                 <Text style={[
//                   styles.splitTypeTitle,
//                   splitType === 'equal' && styles.selectedSplitTitle
//                 ]}>
//                   Equal Split
//                 </Text>
//                 <Text style={[
//                   styles.splitTypeDescription,
//                   splitType === 'equal' && styles.selectedSplitDescription
//                 ]}>
//                   Everyone pays the same amount
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[
//                   styles.splitTypeCard,
//                   splitType === 'percentage' && styles.selectedSplitCard
//                 ]}
//                 onPress={() => setSplitType('percentage')}
//               >
//                 <MaterialIcons name="pie-chart" size={24} color={splitType === 'percentage' ? 'white' : '#007AFF'} />
//                 <Text style={[
//                   styles.splitTypeTitle,
//                   splitType === 'percentage' && styles.selectedSplitTitle
//                 ]}>
//                   Custom Split
//                 </Text>
//                 <Text style={[
//                   styles.splitTypeDescription,
//                   splitType === 'percentage' && styles.selectedSplitDescription
//                 ]}>
//                   Set custom percentages
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             {splitType === 'percentage' && selectedContacts.length > 0 && (
//               <View style={styles.percentageContainer}>
//                 <Text style={styles.percentageTitle}>Set Custom Percentages</Text>
//                 {selectedContacts.map((contact) => (
//                   <View key={contact.id} style={styles.percentageRow}>
//                     <Text style={styles.percentageName}>{contact.name}</Text>
//                     <View style={styles.percentageInputContainer}>
//                       <TextInput
//                         style={styles.percentageInput}
//                         placeholder="0"
//                         value={customPercentages[contact.id]?.toString() || ''}
//                         onChangeText={(text) => updatePercentage(contact.id, text)}
//                         keyboardType="numeric"
//                         maxLength={3}
//                         placeholderTextColor="#999"
//                       />
//                       <Text style={styles.percentageSymbol}>%</Text>
//                     </View>
//                   </View>
//                 ))}
//                 <View style={styles.remainingPercentage}>
//                   <Text style={styles.remainingText}>
//                     Your share: {100 - Object.values(customPercentages).reduce((sum, p) => sum + p, 0)}%
//                   </Text>
//                 </View>
//               </View>
//             )}

//             {bills.length > 0 && (
//               <View style={styles.previewCard}>
//                 <Text style={styles.previewTitle}>💸 Split Preview</Text>
//                 <View style={styles.previewContent}>
//                   <Text style={styles.previewTotal}>Total: ${getTotalBillAmount().toFixed(2)}</Text>
//                   {splitType === 'equal' ? (
//                     <Text style={styles.previewAmount}>
//                       Per person: ${(getTotalBillAmount() / (selectedContacts.length + 1)).toFixed(2)}
//                     </Text>
//                   ) : (
//                     <View>
//                       {selectedContacts.map((contact) => {
//                         const percentage = customPercentages[contact.id] || 0;
//                         const amount = (getTotalBillAmount() * percentage) / 100;
//                         return (
//                           <Text key={contact.id} style={styles.previewAmount}>
//                             {contact.name}: ${amount.toFixed(2)} ({percentage}%)
//                           </Text>
//                         );
//                       })}
//                       <Text style={styles.previewAmount}>
//                         You: ${((getTotalBillAmount() * (100 - Object.values(customPercentages).reduce((sum, p) => sum + p, 0))) / 100).toFixed(2)} ({100 - Object.values(customPercentages).reduce((sum, p) => sum + p, 0)}%)
//                       </Text>
//                     </View>
//                   )}
//                 </View>
//               </View>
//             )}
//           </View>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       presentationStyle="formSheet"
//       onRequestClose={onClose}
//     >
//       <SafeAreaView style={styles.container}>
//         <StatusBar barStyle="dark-content" />
        
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={onClose} disabled={loading} style={styles.headerButton}>
//             <Feather name="x" size={24} color="#007AFF" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Create Group</Text>
//           <TouchableOpacity 
//             onPress={currentStep === 4 ? createGroup : () => setCurrentStep(prev => prev + 1)}
//             disabled={loading || !canProceedToNextStep()}
//             style={[styles.headerButton, { opacity: (!canProceedToNextStep() || loading) ? 0.5 : 1 }]}
//           >
//             {loading ? (
//               <ActivityIndicator size="small" color="#007AFF" />
//             ) : (
//               <Text style={styles.nextButtonText}>
//                 {currentStep === 4 ? 'Create' : 'Next'}
//               </Text>
//             )}
//           </TouchableOpacity>
//         </View>

//         {/* Step Indicator */}
//         {renderStepIndicator()}

//         {/* Navigation */}
//         <View style={styles.navigation}>
//           {currentStep > 1 && (
//             <TouchableOpacity 
//               style={styles.backButton}
//               onPress={() => setCurrentStep(prev => prev - 1)}
//             >
//               <Feather name="chevron-left" size={20} color="#007AFF" />
//               <Text style={styles.backButtonText}>Back</Text>
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* Content */}
//         <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//           {renderStepContent()}
//         </ScrollView>
//       </SafeAreaView>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     backgroundColor: 'white',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e9ecef',
//   },
//   headerButton: {
//     minWidth: 60,
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#212529',
//   },
//   nextButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#007AFF',
//   },
//   stepIndicator: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 20,
//     backgroundColor: 'white',
//   },
//   stepContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   stepCircle: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   activeStep: {
//     backgroundColor: '#007AFF',
//   },
//   inactiveStep: {
//     backgroundColor: '#e9ecef',
//   },
//   stepText: {
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   activeStepText: {
//     color: 'white',
//   },
//   inactiveStepText: {
//     color: '#6c757d',
//   },
//   stepLine: {
//     width: 40,
//     height: 2,
//     marginHorizontal: 8,
//   },
//   activeStepLine: {
//     backgroundColor: '#007AFF',
//   },
//   inactiveStepLine: {
//     backgroundColor: '#e9ecef',
//   },
//   navigation: {
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     backgroundColor: 'white',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e9ecef',
//   },
//   backButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   backButtonText: {
//     fontSize: 16,
//     color: '#007AFF',
//     marginLeft: 4,
//   },
//   content: {
//     flex: 1,
//   },
//   stepContent: {
//     padding: 20,
//   },
//   stepTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#212529',
//     marginBottom: 8,
//   },
//   stepDescription: {
//     fontSize: 16,
//     color: '#6c757d',
//     marginBottom: 24,
//     lineHeight: 22,
//   },
//   section: {
//     marginBottom: 24,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#495057',
//     marginBottom: 12,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#dee2e6',
//     borderRadius: 12,
//     padding: 16,
//     fontSize: 16,
//     backgroundColor: 'white',
//     color: '#212529',
//   },
//   categoriesScrollContainer: {
//     paddingRight: 20,
//   },
//   categoryCard: {
//     alignItems: 'center',
//     padding: 16,
//     marginRight: 12,
//     borderRadius: 12,
//     backgroundColor: 'white',
//     borderWidth: 2,
//     borderColor: '#dee2e6',
//     minWidth: 100,
//   },
//   selectedCategoryCard: {
//     borderColor: '#007AFF',
//     backgroundColor: '#007AFF',
//   },
//   categoryIcon: {
//     fontSize: 24,
//     marginBottom: 8,
//   },
//   categoryText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: '#495057',
//     textAlign: 'center',
//   },
//   selectedCategoryText: {
//     color: 'white',
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#dee2e6',
//     paddingHorizontal: 16,
//     marginBottom: 16,
//   },
//   searchIcon: {
//     marginRight: 12,
//   },
//   searchInput: {
//     flex: 1,
//     paddingVertical: 16,
//     fontSize: 16,
//     color: '#212529',
//   },
//   loadingContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 40,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: '#6c757d',
//   },
//   contactsList: {
//     paddingBottom: 20,
//   },
//   contactCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#dee2e6',
//   },
//   contactAvatar: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: '#007AFF',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },
//   contactInitial: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: 'white',
//   },
//   contactInfo: {
//     flex: 1,
//   },
//   contactName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#212529',
//     marginBottom: 2,
//   },
//   contactPhone: {
//     fontSize: 14,
//     color: '#6c757d',
//   },
//   selectionIndicator: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: '#dee2e6',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'white',
//   },
//   selectedIndicator: {
//     backgroundColor: '#007AFF',
//     borderColor: '#007AFF',
//   },
//   addBillCard: {
//     backgroundColor: 'white',
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: '#dee2e6',
//   },
//   addBillTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#212529',
//     marginBottom: 16,
//   },
//   addBillForm: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   billNameInput: {
//     flex: 2,
//     marginRight: 12,
//   },
//   amountInputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//     marginRight: 12,
//   },
//   currencySymbol: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#495057',
//     marginRight: 8,
//   },
//   amountInput: {
//     flex: 1,
//   },
//   addBillButton: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#007AFF',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   billsList: {
//     marginTop: 8,
//   },
//   billsListTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#212529',
//     marginBottom: 16,
//   },
//   billCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#dee2e6',
//   },
//   billCardContent: {
//     flex: 1,
//   },
//   billName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#212529',
//     marginBottom: 4,
//   },
//   billAmount: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#007AFF',
//   },
//   deleteBillButton: {
//     padding: 8,
//   },
//   totalCard: {
//     backgroundColor: '#007AFF',
//     borderRadius: 12,
//     padding: 16,
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   totalText: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: 'white',
//   },
//   splitTypeContainer: {
//     flexDirection: 'row',
//     marginBottom: 24,
//   },
//   splitTypeCard: {
//     flex: 1,
//     backgroundColor: 'white',
//     borderRadius: 16,
//     padding: 20,
//     alignItems: 'center',
//     marginRight: 12,
//     borderWidth: 2,
//     borderColor: '#dee2e6',
//   },
//   selectedSplitCard: {
//     backgroundColor: '#007AFF',
//     borderColor: '#007AFF',
//   },
//   splitTypeTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#212529',
//     marginTop: 8,
//     marginBottom: 4,
//   },
//   selectedSplitTitle: {
//     color: 'white',
//   },
//   splitTypeDescription: {
//     fontSize: 12,
//     color: '#6c757d',
//     textAlign: 'center',
//   },
//   selectedSplitDescription: {
//     color: 'rgba(255, 255, 255, 0.8)',
//   },
//   percentageContainer: {
//     backgroundColor: 'white',
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: '#dee2e6',
//   },
//   percentageTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#212529',
//     marginBottom: 16,
//   },
//   percentageRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   percentageName: {
//     fontSize: 16,
//     color: '#495057',
//     flex: 1,
//   },
//   percentageInputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   percentageInput: {
//     borderWidth: 1,
//     borderColor: '#dee2e6',
//     borderRadius: 8,
//     padding: 8,
//     width: 60,
//     textAlign: 'center',
//     fontSize: 16,
//     backgroundColor: '#f8f9fa',
//   },
//   percentageSymbol: {
//     fontSize: 16,
//     color: '#6c757d',
//     marginLeft: 8,
//   },
//   remainingPercentage: {
//     marginTop: 12,
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#dee2e6',
//   },
//   remainingText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#007AFF',
//     textAlign: 'center',
//   },
//   previewCard: {
//     backgroundColor: 'white',
//     borderRadius: 16,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: '#dee2e6',
//   },
//   previewTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#212529',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   previewContent: {
//     alignItems: 'center',
//   },
//   previewTotal: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#007AFF',
//     marginBottom: 8,
//   },
//   previewAmount: {
//     fontSize: 16,
//     color: '#495057',
//     marginBottom: 4,
//   },
// });