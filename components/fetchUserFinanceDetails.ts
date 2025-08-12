import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";

export const fetchUserFinanceDetails = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        balance: data.balance ?? 0,
        pendingBills: data.pendingBills ?? 0,
      };
    } else {
      return { balance: 0, pendingBills: 0 };
    }
  } catch (error) {
    console.error("Error fetching finance details:", error);
    return { balance: 0, pendingBills: 0 };
  }
};
