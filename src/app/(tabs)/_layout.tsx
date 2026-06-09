import { FloatingTabBar } from "@/components/navigation/FloatingTabBar";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={() => <FloatingTabBar />}
      initialRouteName="home"
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="explorer" />
    </Tabs>
  );
}
