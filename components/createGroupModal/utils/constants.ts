export interface Contact {
  id: string;
  name: string;
  phoneNumbers?: { number: string }[];
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  paidBy: string;
  date: string;
}

export interface GroupMember {
  id: string;
  name: string;
  phone?: string;
  isAdmin: boolean;
  amount: number;
}

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onGroupCreated: () => void;
  currentUserId: string;
}

export const CATEGORIES = [
  { name: "Food & Dining", icon: "🍽️", color: "#FF6B6B" },
  { name: "Entertainment", icon: "🎬", color: "#4ECDC4" },
  { name: "Travel", icon: "✈️", color: "#45B7D1" },
  { name: "Shopping", icon: "🛍️", color: "#96CEB4" },
  { name: "Utilities", icon: "⚡", color: "#FFEAA7" },
  { name: "Rent", icon: "🏠", color: "#DDA0DD" },
  { name: "Groceries", icon: "🛒", color: "#98D8C8" },
  { name: "Transportation", icon: "🚗", color: "#F7DC6F" },
  { name: "Healthcare", icon: "🏥", color: "#F1948A" },
  { name: "Other", icon: "📝", color: "#85C1E9" },
];