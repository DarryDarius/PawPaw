import { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
}>;

export function Screen({ children, scroll = true }: ScreenProps) {
  const content = <View className="gap-4 px-4 pb-8 pt-4">{children}</View>;

  return (
    <SafeAreaView className="flex-1 bg-paw-paper" edges={["top", "left", "right"]}>
      {scroll ? <ScrollView contentInsetAdjustmentBehavior="automatic">{content}</ScrollView> : content}
    </SafeAreaView>
  );
}
