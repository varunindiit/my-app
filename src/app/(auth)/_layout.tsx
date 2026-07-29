import { Stack } from "expo-router";
import { useTheme } from "@/theme";

/** Authentication flow stack. */
export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      initialRouteName="login"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="login" />
    </Stack>
  );
}
