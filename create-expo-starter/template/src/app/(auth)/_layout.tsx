import React from "react";
import { Stack } from "expo-router";
import { THEME } from "../../theme";

/** Authentication flow stack. */
export default function AuthLayout() {
  return (
    <Stack
      initialRouteName="login"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: THEME.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="login" />
    </Stack>
  );
}
