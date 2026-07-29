import { Tabs } from "expo-router";
import BottomTabBar from "@/components/BottomTabBar";

/** Signed-in flow bottom tabs. */
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "transparent" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      {/* #if gallery */}
      <Tabs.Screen name="components" options={{ title: "Components" }} />
      {/* #endif */}
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
