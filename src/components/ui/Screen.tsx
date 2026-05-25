import type { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/constants/colors";

type SafeAreaEdge = "top" | "bottom" | "left" | "right";

interface ScreenProps {
  children: ReactNode;
  backgroundColor?: string;
  edges?: SafeAreaEdge[];
}

export function Screen({
  children,
  backgroundColor = colors.background,
  edges = ["top", "bottom"],
}: ScreenProps) {
  return (
    <SafeAreaView edges={edges} className="flex-1" style={{ backgroundColor }}>
      <StatusBar style="dark" />
      {children}
    </SafeAreaView>
  );
}
