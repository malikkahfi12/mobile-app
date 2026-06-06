import { useEffect, useState, memo } from "react";
import { Animated } from "react-native";

interface SkeletonBlockProps {
  width?: number;
  height: number;
  borderRadius?: number;
  flex?: number;
  className?: string;
}

export const SkeletonBlock = memo(function SkeletonBlock({
  width,
  height,
  borderRadius = 8,
  flex,
  className,
}: SkeletonBlockProps) {
  const [opacity] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={className}
      style={{ width, height, borderRadius, flex, opacity }}
    />
  );
});
