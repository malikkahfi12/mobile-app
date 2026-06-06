import { Tabs } from "expo-router";
import { FloatingTabBar } from "@/components/navigation/FloatingTabBar";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={() => <FloatingTabBar />}
      initialRouteName="home"
    >
      <Tabs.Screen name="explorer" />
      <Tabs.Screen name="home" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
