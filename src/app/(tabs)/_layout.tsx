import React from "react";
import { Tabs } from "expo-router";
import BottomTabBar from "../../components/BottomTabBar";

/** Home flow bottom tabs — Home and Profile. */
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "transparent" },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
