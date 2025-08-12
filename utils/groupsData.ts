// utils/groupsData.ts
export interface Group {
  id: string;
  title: string;
  date: string;
  amount: string;
  owedAmount: string;
  status: 'owed' | 'owing';
  icon: any;
  description: string;
  members: number;
  totalExpenses: string;
  yourShare: string;
  recentActivity: string;
  expenses: Array<{
    id: number;
    description: string;
    amount: string;
    paidBy: string;
    date: string;
  }>;
  members_list: Array<{
    name: string;
    amount: string;
    status: 'owed' | 'owes' | 'paid';
  }>;
}

export const groupsData: Record<string, Group> = {
  "1": {
    id: "1",
    title: "Birthday House",
    date: "Mar 24, 2023",
    amount: "$4508.32",
    owedAmount: "$3005.43",
    status: "owed",
    icon: require("../assets/images/warrior.jpeg"),
    description: "Planning surprise birthday celebrations and managing group expenses for memorable moments.",
    members: 12,
    totalExpenses: "$4508.32",
    yourShare: "$375.69",
    recentActivity: "John paid $50 for decorations",
    expenses: [
      { id: 1, description: "Birthday cake", amount: "$180.00", paidBy: "Sarah", date: "Mar 24" },
      { id: 2, description: "Decorations", amount: "$120.50", paidBy: "John", date: "Mar 23" },
      { id: 3, description: "Venue rental", amount: "$500.00", paidBy: "Mike", date: "Mar 22" },
      { id: 4, description: "Food & drinks", amount: "$350.75", paidBy: "Lisa", date: "Mar 24" },
    ],
    members_list: [
      { name: "You", amount: "$375.69", status: "owed" },
      { name: "Sarah", amount: "$280.50", status: "paid" },
      { name: "John", amount: "$420.30", status: "owes" },
      { name: "Mike", amount: "$180.00", status: "paid" },
    ]
  },
  "2": {
    id: "2",
    title: "Weekend Getaway",
    date: "Apr 15, 2023",
    amount: "$2840.50",
    owedAmount: "$420.75",
    status: "owed",
    icon: require("../assets/images/warrior.jpeg"),
    description: "Weekend trip expenses including accommodation, food, and activities for our group adventure.",
    members: 8,
    totalExpenses: "$2840.50",
    yourShare: "$355.06",
    recentActivity: "Sarah added $120 for gas",
    expenses: [
      { id: 1, description: "Hotel accommodation", amount: "$1200.00", paidBy: "Alex", date: "Apr 15" },
      { id: 2, description: "Gas & transportation", amount: "$320.50", paidBy: "Sarah", date: "Apr 14" },
      { id: 3, description: "Meals", amount: "$480.00", paidBy: "David", date: "Apr 15" },
      { id: 4, description: "Activities", amount: "$240.00", paidBy: "Emma", date: "Apr 16" },
    ],
    members_list: [
      { name: "You", amount: "$355.06", status: "owed" },
      { name: "Alex", amount: "$420.00", status: "paid" },
      { name: "Sarah", amount: "$180.25", status: "owes" },
      { name: "David", amount: "$320.50", status: "paid" },
    ]
  },
  "3": {
    id: "3",
    title: "Office Lunch Club",
    date: "May 02, 2023",
    amount: "$1250.00",
    owedAmount: "$125.00",
    status: "owing",
    icon: require("../assets/images/warrior.jpeg"),
    description: "Daily lunch orders and office catering expenses shared among team members.",
    members: 15,
    totalExpenses: "$1250.00",
    yourShare: "$83.33",
    recentActivity: "Mike ordered lunch for everyone",
    expenses: [
      { id: 1, description: "Monday lunch", amount: "$180.00", paidBy: "Mike", date: "May 01" },
      { id: 2, description: "Tuesday lunch", amount: "$200.50", paidBy: "Anna", date: "May 02" },
      { id: 3, description: "Wednesday lunch", amount: "$175.00", paidBy: "Tom", date: "May 03" },
      { id: 4, description: "Thursday lunch", amount: "$220.25", paidBy: "Lisa", date: "May 04" },
    ],
    members_list: [
      { name: "You", amount: "$83.33", status: "owes" },
      { name: "Mike", amount: "$120.00", status: "paid" },
      { name: "Anna", amount: "$95.50", status: "paid" },
      { name: "Tom", amount: "$88.75", status: "owes" },
    ]
  }
};

export const getGroupsArray = (): Group[] => {
  return Object.values(groupsData);
};