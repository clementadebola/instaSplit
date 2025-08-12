// import { initializeApp, FirebaseApp } from "firebase/app";
// import { initializeAuth, Auth } from "firebase/auth";
// import { getFirestore, Firestore } from "firebase/firestore";
// import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

import Constants from "expo-constants";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// ✅ Firebase config from env
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || "",
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || "",
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || "",
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || "",
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || "",
  appId: Constants.expoConfig?.extra?.firebaseAppId || "",
  measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId || "",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const database = getDatabase(app); 
export const storage = getStorage(app);






// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import Constants from "expo-constants";

// const firebaseConfig = {
//   apiKey: Constants.expoConfig?.extra?.firebaseApiKey || "",
//   authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || "",
//   projectId: Constants.expoConfig?.extra?.firebaseProjectId || "",
//   storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || "",
//   messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || "",
//   appId: Constants.expoConfig?.extra?.firebaseAppId || "",
//   measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId || "",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);

// export { auth };
