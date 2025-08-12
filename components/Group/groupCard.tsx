import React from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet
}
from 'react-native'
import { AntDesign } from "@expo/vector-icons"
import { router } from "expo-router";
import { Group } from "@/utils/groupsData";

// interface Group{
//   id: string;
//   title: string;
//   date: string;
//   members: string;
//   amount: string;
//   status: 'owed' | 'owing';
//   owedAmount: string;
//   recentActivity: string;
//   icon: any;
//   category: string;
//   admin: string;
//   membersList: GroupMember[];
//   bills: Bill[];
//   splitType: 'equal' | 'percentage';
//   splitPercentages?: { [userId: string]: number};
// }

interface GroupMember{
  id: string;
  name: string;
  phone?: string;
  isAdmin: boolean;
  amount: number;
}

interface Bill{
  id: string;
  name: string;
  amount: number;
  paidBy: string;
  date: string;
}

interface GroupCardProps{
  group: Group;
  onPress: (groupId: string) => void; 
}

const GroupCard : React.FC<GroupCardProps> =({ group, onPress}) =>{

  const handleGroupPress = (groupId: string) => {
      router.push(`/group/${groupId}`);
    };


  return(

     <TouchableOpacity 
      key={group.id}
      style={styles.groupCard}
      onPress={() => handleGroupPress(group.id)}
      activeOpacity={0.7}
    >
      <View style={styles.groupHeader}>
        <View style={styles.groupLeft}>
          <Image
            source={group.icon}
            style={styles.groupIcon}
          />
          <View style={styles.groupInfo}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <Text style={styles.groupDate}>{group.date}</Text>
            <Text style={styles.groupMembers}>{group.members} members</Text>
          </View>
        </View>
        <View style={styles.groupRight}>
          <Text style={styles.groupAmount}>{group.amount}</Text>
          <AntDesign name="right" size={16} color="#666" />
        </View>
      </View>
      
      <View style={[
        styles.statusTag, 
        { backgroundColor: group.status === 'owed' ? "#d0f5d6" : "#ffe6e6" }
      ]}>
        <Text style={{ 
          color: group.status === 'owed' ? "#008000" : "#cc0000",
          fontWeight: "500"
        }}>
          {group.status === 'owed' 
            ? `You are owed ${group.owedAmount}` 
            : `You owe ${group.owedAmount}`
          }
        </Text>
      </View>
      
      <View style={styles.recentActivity}>
        <Text style={styles.recentActivityText}>
          <AntDesign name="clockcircleo" size={12} color="#666" /> {group.recentActivity}
        </Text>
      </View>
    </TouchableOpacity>

  );
};

const styles = StyleSheet.create({

  groupCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
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
  groupIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  groupInfo: {
    flex: 1,
  },
  groupTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#333",
    marginBottom: 2,
  },
  groupDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  groupMembers: {
    fontSize: 12,
    color: "#999",
  },
  groupRight: {
    alignItems: "flex-end",
    flexDirection: "row",
    // alignItems: "center",
    gap: 8,
  },
  groupAmount: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#333",
  },
  statusTag: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  recentActivity: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  recentActivityText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
   

});

export default GroupCard;

 