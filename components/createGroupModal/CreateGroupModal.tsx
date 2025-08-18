import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import * as SMS from "expo-sms";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";
import { useTheme } from "../../theme/themeContext";

// Import components
import StepIndicator from "./components/StepIndicator";
import GroupDetailsStep from "./components/groupDetailsStep";
import AddFriendsStep from "./components/addFriendsStep";
import AddBillsStep from "./components/addBillsStep";
import SplitOptionsStep from "./components/splitOptionsStep";

// import constants
import { CATEGORIES, Contact, Bill, GroupMember } from "./utils/constants";

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onGroupCreated: () => void;
  currentUserId: string;
}

export default function CreateGroupModal({
  visible,
  onClose,
  onGroupCreated,
  currentUserId,
}: CreateGroupModalProps) {
  // Form states
  const [groupName, setGroupName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [splitType, setSplitType] = useState<"equal" | "percentage">("equal");
  const [customPercentages, setCustomPercentages] = useState<{
    [key: string]: number;
  }>({});
  const [loading, setLoading] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Theme context
  const { theme, darkMode } = useTheme();

  // Load contacts when modal opens
  useEffect(() => {
    if (visible) {
      loadContacts();
      resetForm();
    }
  }, [visible]);

  const loadContacts = async () => {
    setContactsLoading(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        });

        const formattedContacts: Contact[] = data
          .filter((contact): contact is Contacts.Contact => {
            return !!(
              contact.name &&
              contact.phoneNumbers &&
              contact.phoneNumbers.length > 0
            );
          })
          .map(
            (contact): Contact => ({
              id: contact.id || Math.random().toString(),
              name: contact.name || "Unknown",
              phoneNumbers:
                contact.phoneNumbers?.map((phone) => ({
                  number: phone.number || "",
                  label: phone.label,
                  id: phone.id,
                })) || [],
            })
          )
          .sort((a, b) => a.name.localeCompare(b.name));

        setContacts(formattedContacts);
      } else {
        Alert.alert(
          "Permission Required",
          "You can still create a group without contacts access. You can add members manually later.",
          [{ text: "OK", style: "default" }]
        );
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
      Alert.alert(
        "Error",
        "Unable to load contacts. You can still create a group and add members manually."
      );
    } finally {
      setContactsLoading(false);
    }
  };

  const sendInvites = async (groupId: string, groupName: string) => {
    if (selectedContacts.length === 0) return;

    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        const phoneNumbers = selectedContacts
          .map((contact) => contact.phoneNumbers?.[0]?.number)
          .filter(Boolean) as string[];

        if (phoneNumbers.length > 0) {
          const message = `🧾 You've been invited to join "${groupName}" for bill splitting! Group ID: ${groupId}. Download our app to manage shared expenses easily.`;
          
          await SMS.sendSMSAsync(phoneNumbers, message);
          console.log("Invites sent successfully");
        }
      }
    } catch (error) {
      console.error("Error sending invites:", error);
      // Don't show error to user as this is a bonus feature
    }
  };

  const calculateSplitAmounts = () => {
    const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const totalMembers = selectedContacts.length + 1;

    if (splitType === "equal") {
      const amountPerPerson = totalAmount / totalMembers;
      return { totalAmount, amountPerPerson, splitAmounts: {} };
    } else {
      const splitAmounts: { [key: string]: number } = {};
      
      // Calculate amounts for selected contacts
      selectedContacts.forEach((contact) => {
        const percentage = customPercentages[contact.id] || 0;
        splitAmounts[contact.id] = (totalAmount * percentage) / 100;
      });

      // Calculate current user's amount (remaining percentage)
      const usedPercentage = Object.values(customPercentages).reduce(
        (sum, p) => sum + p,
        0
      );
      const currentUserPercentage = Math.max(0, 100 - usedPercentage);
      splitAmounts[currentUserId] = (totalAmount * currentUserPercentage) / 100;

      return { totalAmount, amountPerPerson: 0, splitAmounts };
    }
  };

  const validateForm = (): string | null => {
    if (!groupName.trim()) return "Please enter a group name";
    
    if (!selectedCategory && !customCategory.trim()) {
      return "Please select or enter a category";
    }
    
    if (bills.length === 0) return "Please add at least one bill";
    
    // Allow creating group without contacts (solo group)
    // if (selectedContacts.length === 0) return "Please add at least one friend";

    if (splitType === "percentage" && selectedContacts.length > 0) {
      const totalPercentage = Object.values(customPercentages).reduce(
        (sum, p) => sum + p,
        0
      );
      if (totalPercentage > 100) {
        return "Total percentage cannot exceed 100%";
      }
      if (totalPercentage < 0) {
        return "Percentages cannot be negative";
      }
    }

    return null;
  };

  const createGroup = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert("Validation Error", validationError);
      return;
    }

    setLoading(true);

    try {
      const { totalAmount, amountPerPerson, splitAmounts } = calculateSplitAmounts();
      const finalCategory = selectedCategory || customCategory.trim();
      const selectedCategoryData = CATEGORIES.find(cat => cat.name === selectedCategory);

      // Build members list
      const members: GroupMember[] = [
        {
          id: currentUserId,
          name: "You",
          isAdmin: true,
          amount: splitType === "equal" 
            ? amountPerPerson 
            : splitAmounts[currentUserId] || 0,
        },
        ...selectedContacts.map((contact) => ({
          id: contact.id,
          name: contact.name,
          phone: contact.phoneNumbers?.[0]?.number || "",
          isAdmin: false,
          amount: splitType === "equal" 
            ? amountPerPerson 
            : splitAmounts[contact.id] || 0,
        })),
      ];

      // Prepare group data for Firebase
      const groupData = {
        // Basic info
        title: groupName.trim(),
        category: finalCategory,
        categoryIcon: selectedCategoryData?.icon || "📝",
        categoryColor: selectedCategoryData?.color || theme.colors.primary,
        
        // Dates and timestamps
        date: new Date().toLocaleDateString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Financial details
        totalAmount: totalAmount,
        amount: `$${totalAmount.toFixed(2)}`,
        
        // Member details
        members: members.length,
        membersList: members,
        
        // Status and activity
        status: "active" as const,
        owedAmount: `$${(splitType === "equal" 
          ? amountPerPerson 
          : splitAmounts[currentUserId] || 0).toFixed(2)}`,
        recentActivity: "Group created",
        
        // Admin and permissions
        admin: currentUserId,
        createdBy: currentUserId,
        
        // Bills and splitting
        bills: bills,
        splitType: splitType,
        splitPercentages: splitType === "percentage" ? customPercentages : null,
        
        // Metadata
        isActive: true,
        invitesSent: selectedContacts.length > 0,
      };

      // Save to Firebase
      console.log("Creating group with data:", groupData);
      const groupRef = await addDoc(collection(db, "groups"), groupData);
      console.log("Group created with ID:", groupRef.id);

      // Send invites if there are contacts
      if (selectedContacts.length > 0) {
        await sendInvites(groupRef.id, groupName);
      }

      // Success feedback
      const memberCount = selectedContacts.length;
      const successMessage = memberCount > 0 
        ? `Group "${groupName}" created successfully!\n\n💬 Invites sent to ${memberCount} friend${memberCount !== 1 ? "s" : ""}.`
        : `Group "${groupName}" created successfully!\n\nYou can add members later from the group settings.`;

      Alert.alert(
        "Success! 🎉",
        successMessage,
        [
          {
            text: "Great!",
            onPress: () => {
              resetForm();
              onClose();
              onGroupCreated();
            },
          },
        ]
      );

    } catch (error) {
      console.error("Error creating group:", error);
      
      let errorMessage = "Failed to create group. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('network')) {
          errorMessage = "Network error. Please check your internet connection.";
        } else if (error.message.includes('permission')) {
          errorMessage = "Permission error. Please check your Firebase settings.";
        }
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setGroupName("");
    setSelectedCategory("");
    setCustomCategory("");
    setSelectedContacts([]);
    setBills([]);
    setSplitType("equal");
    setCustomPercentages({});
    setCurrentStep(1);
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return groupName.trim() && (selectedCategory || customCategory.trim());
      case 2:
        return true; // Allow proceeding even without contacts
      case 3:
        return bills.length > 0;
      case 4:
        return true; // Final step validation happens in createGroup
      default:
        return true;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Group Details";
      case 2: return "Add Friends";
      case 3: return "Add Bills";
      case 4: return "Split Options";
      default: return "Create Group";
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <GroupDetailsStep
            groupName={groupName}
            setGroupName={setGroupName}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            customCategory={customCategory}
            setCustomCategory={setCustomCategory}
          />
        );

      case 2:
        return (
          <AddFriendsStep
            contacts={contacts}
            selectedContacts={selectedContacts}
            setSelectedContacts={setSelectedContacts}
            contactsLoading={contactsLoading}
          />
        );

      case 3:
        return (
          <AddBillsStep
            bills={bills}
            setBills={setBills}
            currentUserId={currentUserId}
          />
        );

      case 4:
        return (
          <SplitOptionsStep
            splitType={splitType}
            setSplitType={setSplitType}
            selectedContacts={selectedContacts}
            customPercentages={customPercentages}
            setCustomPercentages={setCustomPercentages}
            bills={bills}
          />
        );

      default:
        return null;
    }
  };

  // Create theme-aware styles
  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.colors.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerButton: {
      minWidth: 60,
      alignItems: "center",
    },
    headerTitleContainer: {
      alignItems: "center",
      flex: 1,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
    },
    headerSubtitle: {
      fontSize: 12,
      color: theme.colors.secondaryText,
      marginTop: 2,
    },
    nextButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.primary,
    },
    navigation: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: theme.colors.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
    },
    backButtonText: {
      fontSize: 16,
      color: theme.colors.primary,
      marginLeft: 4,
    },
    content: {
      flex: 1,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={themedStyles.container}>
        <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

        {/* Header */}
        <View style={themedStyles.header}>
          <TouchableOpacity
            onPress={onClose}
            disabled={loading}
            style={themedStyles.headerButton}
          >
            <Feather name="x" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          
          <View style={themedStyles.headerTitleContainer}>
            <Text style={themedStyles.headerTitle}>Create Group</Text>
            <Text style={themedStyles.headerSubtitle}>{getStepTitle()}</Text>
          </View>
          
          <TouchableOpacity
            onPress={
              currentStep === 4
                ? createGroup
                : () => setCurrentStep((prev) => prev + 1)
            }
            disabled={loading || !canProceedToNextStep()}
            style={[
              themedStyles.headerButton,
              { opacity: !canProceedToNextStep() || loading ? 0.5 : 1 },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text style={themedStyles.nextButtonText}>
                {currentStep === 4 ? "Create" : "Next"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} />

        {/* Navigation */}
        <View style={themedStyles.navigation}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={themedStyles.backButton}
              onPress={() => setCurrentStep((prev) => prev - 1)}
              disabled={loading}
            >
              <Feather name="chevron-left" size={20} color={theme.colors.primary} />
              <Text style={themedStyles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <View 
          style={themedStyles.content} 
          // showsVerticalScrollIndicator={false}
          // keyboardShouldPersistTaps="handled"
        >
          {renderStepContent()}
        </View>
      </SafeAreaView>
    </Modal>
  );
}