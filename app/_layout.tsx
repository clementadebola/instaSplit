import { ThemeProvider as NavigationThemeProvider, Theme as NavigationTheme } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { ThemeProvider, useTheme } from "../theme/themeContext";

SplashScreen.preventAutoHideAsync();

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
      <Redirect href="/(tabs)/home" />
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(group)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
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
