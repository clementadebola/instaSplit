import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../utils/firebaseConfig";
import { useTheme } from "../../theme/themeContext";

export default function login() {
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  //handle login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in both fields.");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Logged in successfully!");
      // No need to manually navigate - AuthContext will handle this automatically
    } catch (error: any) {
      console.error("Login Error:", error.message);
      Alert.alert("Error:", error.message);
      setLoading(false); // Only set loading to false on error
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.primary,
    },
    purpleSection: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    whiteSection: {
      flex: 2,
      backgroundColor: theme.colors.card,
      borderTopLeftRadius: 50,
      borderTopRightRadius: 50,
      padding: 35,
      alignItems: "center",
    },
    title: {
      color: "white",
      fontSize: 24,
      fontWeight: "bold",
    },
    backButton: {
      position: "absolute",
      top: 20,
      left: 16,
      backgroundColor: theme.colors.secondary,
      padding: 8,
      borderTopRightRadius: 16,
      borderBottomLeftRadius: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: "bold",
      alignSelf: "flex-start",
      marginBottom: 5,
      color: theme.colors.text,
    },
    input: {
      width: "100%",
      height: 50,
      backgroundColor: theme.colors.background,
      borderRadius: 10,
      paddingHorizontal: 15,
      marginBottom: 15,
      fontSize: 16,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    forgotPassword: {
      alignSelf: "flex-end",
      color: theme.colors.primary,
      marginBottom: 20,
      fontSize: 14,
    },
    loginButton: {
      backgroundColor: theme.colors.primary,
      padding: 12,
      borderRadius: 10,
      width: "100%",
      alignItems: "center",
      marginBottom: 15,
      opacity: loading ? 0.7 : 1,
    },
    loginButtonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: '#fff',
    },
    orText: {
      fontSize: 14,
      marginBottom: 15,
      color: theme.colors.secondaryText,
    },
    loginCont: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 20,
    },
    normalText: {
      fontSize: 16,
      color: theme.colors.text,
      fontFamily: "poppins",
      gap: 10,
    },
    login: {
      fontSize: 16,
      color: theme.colors.primary,
      marginBottom: 20,
      marginLeft: 8,
    },
    socialButtonsContainer: {
      flexDirection: "row",
      gap: 10,
    },
    socialButton: {
      backgroundColor: theme.colors.secondary,
      padding: 10,
      borderRadius: 20,
      paddingVertical: 16,
      paddingHorizontal: 50,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.purpleSection}>
        {/* Removed back button - users shouldn't be able to go back from login */}
        <Text style={styles.title}>Login to your account</Text>
      </View>

      <View style={styles.whiteSection}>
        <Text style={styles.label}>Your Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          keyboardType="email-address"
          placeholderTextColor={theme.colors.secondaryText}
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          secureTextEntry
          placeholderTextColor={theme.colors.secondaryText}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} 
         onPress={handleLogin} disabled={loading}>
          <Text style={styles.loginButtonText}> {loading ? "Logging in..." : "Login"}</Text>
        </TouchableOpacity>

        <View style={styles.loginCont}>
          <Text style={styles.normalText}>
            Dont have an account?
            <Text
              style={styles.login}
              onPress={() => router.push("/(auth)/signup")}
            >
              {" "}
              {""} Signup
            </Text>
          </Text>
        </View>

        <Text style={styles.orText}>Or login up with</Text>

        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <AntDesign name="google" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="facebook" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}