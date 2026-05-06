import { TextInput, TextInputProps, View } from "react-native";
import { AppText } from "./AppText";

type FormFieldProps = TextInputProps & {
  label: string;
};

export function FormField({ label, ...props }: FormFieldProps) {
  return (
    <View className="gap-2">
      <AppText className="font-bold">{label}</AppText>
      <TextInput
        className="h-12 rounded-paw border border-paw-line bg-white px-3 text-[15px] text-paw-ink"
        placeholderTextColor="#786A60"
        autoCapitalize="none"
        {...props}
      />
    </View>
  );
}
