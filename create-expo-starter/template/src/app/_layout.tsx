import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Provider, useSelector } from "react-redux";
import FlashMessage from "react-native-flash-message";

import store, { RootState } from "../redux/store";
import { THEME } from "../theme";
import { FONT_ASSETS } from "../theme/fonts";
import "../localization/i18n";

// Keep the native splash visible until fonts are ready.
SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * Root navigator — the single Stack that owns every route group.
 *
 * `Stack.Protected` declaratively guards each flow by auth state: only the
 * matching group is mounted, and expo-router automatically redirects to the
 * first available route whenever the guard flips (login / logout). This is the
 * protected-routes pattern — no manual redirects needed.
 */
const RootNavigator = () => {
  const isLoggedIn = useSelector((s: RootState) => s.auth.isLoggedIn);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: THEME.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
};

/** Root layout — global providers, fonts/splash, then the root navigator. */
export default function RootLayout() {
  const [fontsLoaded] = useFonts(FONT_ASSETS);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <Provider store={store}>
          <KeyboardProvider>
            <StatusBar style="dark" />
            <RootNavigator />
            <FlashMessage position="top" duration={1500} />
          </KeyboardProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
