import { colors } from "@/constants/colors";
import type { KeyboardTypeOptions, ReturnKeyTypeOptions, TextInputProps } from "react-native";
import { Text, TextInput, View } from "react-native";

interface FormInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  autoFocus?: boolean;
  maxLength?: number;
  returnKeyType?: ReturnKeyTypeOptions;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoCorrect?: boolean;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  editable?: boolean;
  multiline?: boolean;
  className?: string;
}

export function FormInput({
  value,
  onChangeText,
  placeholder,
  label,
  autoFocus = false,
  maxLength,
  returnKeyType,
  autoCapitalize = "words",
  autoCorrect = false,
  keyboardType,
  secureTextEntry,
  editable = true,
  multiline,
  className,
}: FormInputProps) {
  return (
    <View className={className}>
      {label && (
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {label}
        </Text>
      )}
      <TextInput
        className="rounded-xl bg-gray-100 px-4 h-12 text-base text-gray-900"
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        autoFocus={autoFocus}
        maxLength={maxLength}
        returnKeyType={returnKeyType}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        editable={editable}
        multiline={multiline}
      />
    </View>
  );
}
