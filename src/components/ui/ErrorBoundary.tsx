import { memo, PureComponent } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import i18n from "@/lib/i18n";
import type { ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundaryClass extends PureComponent<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (__DEV__) {
      console.error("ErrorBoundary caught:", error);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return <ErrorFallback onReset={this.handleReset} />;
    }
    return this.props.children;
  }
}

const ErrorFallback = memo(function ErrorFallback({
  onReset,
}: {
  onReset: () => void;
}) {
  return (
    <View className="absolute inset-0 items-center justify-center bg-white/95 z-50 px-8">
      <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
      <Text className="mt-4 text-lg font-semibold text-gray-900 text-center">
        {i18n.t("errors.boundaryTitle")}
      </Text>
      <Text className="mt-2 text-sm text-gray-500 text-center">
        {i18n.t("errors.boundaryDesc")}
      </Text>
      <TouchableOpacity
        onPress={onReset}
        className="mt-6 rounded-full bg-primary px-8 py-3"
        activeOpacity={0.7}
      >
        <Text className="text-sm font-semibold text-white">{i18n.t("errors.tryAgain")}</Text>
      </TouchableOpacity>
    </View>
  );
});

export { ErrorBoundaryClass as ErrorBoundary };
