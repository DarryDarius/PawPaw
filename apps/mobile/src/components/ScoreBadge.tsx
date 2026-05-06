import { View } from "react-native";
import { AppText } from "./AppText";

export function ScoreBadge({ score }: { score: number }) {
  return (
    <View className="h-16 w-16 items-center justify-center rounded-paw bg-paw-coral">
      <AppText className="text-2xl font-extrabold leading-7 text-white">{score}</AppText>
      <AppText variant="caption" className="font-bold text-white">
        score
      </AppText>
    </View>
  );
}
