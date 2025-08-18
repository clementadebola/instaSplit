import { ThemeProvider as NavigationThemeProvider, Theme as NavigationTheme } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "../contexts/AuthContexts"; // Adjust path as needed
import { ThemeProvider, useTheme } from "../theme/themeContext";

SplashScreen.preventAutoHideAsync();

// This component handles the authentication routing logic
function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (user) {
      const isNewUser =
        user.metadata?.creationTime === user.metadata?.lastSignInTime;

      if (inAuthGroup) {
        if (isNewUser) {
          router.replace("/(auth)/welcome"); // 👈 route to your welcome screen
        } else {
          router.replace("/(tabs)/home");
        }
      }
    } else if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
      //  router.replace("/(auth)/welcome");
    }
  }, [user, segments, isLoading]);

  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(group)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

function AppNavigator() {
  const { theme, darkMode } = useTheme();

  // Create a Navigation-compatible theme
  const navigationTheme: NavigationTheme = {
    dark: darkMode,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.notification,
    },
    fonts: {
      regular: {
        fontFamily: "",
        fontWeight: "bold"
      },
      medium: {
        fontFamily: "",
        fontWeight: "bold"
      },
      bold: {
        fontFamily: "",
        fontWeight: "bold"
      },
      heavy: {
        fontFamily: "",
        fontWeight: "bold"
      }
    }
  };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
      <StatusBar style={darkMode ? "light" : "dark"} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}