import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../theme/themeContext';
import { Contact } from '../utils/constants';

interface AddFriendsStepProps {
  contacts: Contact[];
  selectedContacts: Contact[];
  setSelectedContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  contactsLoading: boolean;
}

export default function AddFriendsStep({
  contacts,
  selectedContacts,
  setSelectedContacts,
  contactsLoading
}: AddFriendsStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, darkMode } = useTheme();

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleContactSelection = (contact: Contact) => {
    setSelectedContacts(prev => {
      const isSelected = prev.find(c => c.id === contact.id);
      if (isSelected) {
        return prev.filter(c => c.id !== contact.id);
      } else {
        return [...prev, contact];
      }
    });
  };

  // Generate a color for each contact based on their name
  const getAvatarColor = (name: string) => {
    const colors = [
      theme.colors.primary,
      theme.colors.secondary,
      '#10B981', // emerald
      '#F59E0B', // amber
      '#EF4444', // red
      '#8B5CF6', // violet
      '#06B6D4', // cyan
      '#84CC16', // lime
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Create theme-aware styles
  const themedStyles = StyleSheet.create({
    stepContent: {
      padding: 20,
    },
    stepTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 8,
    },
    stepDescription: {
      fontSize: 16,
      color: theme.colors.secondaryText,
      marginBottom: 24,
      lineHeight: 22,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 16,
      fontSize: 16,
      color: theme.colors.text,
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: theme.colors.secondaryText,
    },
    contactsList: {
      paddingBottom: 20,
    },
    contactCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    selectedContactCard: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.2,
    },
    contactAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    contactInitial: {
      fontSize: 18,
      fontWeight: '600',
      color: 'white',
    },
    contactInfo: {
      flex: 1,
    },
    contactName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    contactPhone: {
      fontSize: 14,
      color: theme.colors.secondaryText,
    },
    selectionIndicator: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.card,
    },
    selectedIndicator: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      transform: [{ scale: 1.1 }],
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    emptyStateText: {
      fontSize: 16,
      color: theme.colors.secondaryText,
      textAlign: 'center',
      marginTop: 12,
    },
    selectedCountBadge: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginLeft: 8,
    },
    selectedCountText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
    },
  });

  const renderEmptyState = () => (
    <View style={themedStyles.emptyState}>
      <Feather name="users" size={48} color={theme.colors.secondaryText} />
      <Text style={themedStyles.emptyStateText}>
        {searchQuery 
          ? `No contacts found matching "${searchQuery}"`
          : "No contacts available.\nYou can still create a group and add members later."
        }
      </Text>
    </View>
  );

  return (
    <View style={themedStyles.stepContent}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text style={themedStyles.stepTitle}>👥 Add Friends</Text>
        {selectedContacts.length > 0 && (
          <View style={themedStyles.selectedCountBadge}>
            <Text style={themedStyles.selectedCountText}>
              {selectedContacts.length}
            </Text>
          </View>
        )}
      </View>
      <Text style={themedStyles.stepDescription}>
        Select friends to split expenses with {selectedContacts.length > 0 && `(${selectedContacts.length} selected)`}
      </Text>
      
      <View style={themedStyles.searchContainer}>
        <Feather 
          name="search" 
          size={20} 
          color={theme.colors.secondaryText} 
          style={themedStyles.searchIcon} 
        />
        <TextInput
          style={themedStyles.searchInput}
          placeholder="Search contacts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.colors.secondaryText}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name="x" size={20} color={theme.colors.secondaryText} />
          </TouchableOpacity>
        )}
      </View>

      {contactsLoading ? (
        <View style={themedStyles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={themedStyles.loadingText}>Loading contacts...</Text>
        </View>
      ) : filteredContacts.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelected = selectedContacts.find(c => c.id === item.id);
            return (
              <TouchableOpacity
                style={[
                  themedStyles.contactCard,
                  isSelected && themedStyles.selectedContactCard
                ]}
                onPress={() => toggleContactSelection(item)}
                activeOpacity={0.8}
              >
                <View style={[
                  themedStyles.contactAvatar,
                  { backgroundColor: getAvatarColor(item.name) }
                ]}>
                  <Text style={themedStyles.contactInitial}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={themedStyles.contactInfo}>
                  <Text style={themedStyles.contactName}>{item.name}</Text>
                  <Text style={themedStyles.contactPhone}>
                    {item.phoneNumbers?.[0]?.number || 'No phone'}
                  </Text>
                </View>
                <View style={[
                  themedStyles.selectionIndicator,
                  isSelected && themedStyles.selectedIndicator
                ]}>
                  {isSelected && (
                    <Feather name="check" size={16} color="white" />
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={themedStyles.contactsList}
        />
      )}
    </View>
  );
}