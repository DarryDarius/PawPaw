import { Image } from "expo-image";
import { Pressable, View } from "react-native";
import { ApiMatch } from "@/src/types/api";
import { AppText } from "./AppText";
import { Badge } from "./Badge";

const fallbackImage = "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=600&q=80";

type MatchRowProps = {
  match: ApiMatch;
  onPress?: () => void;
};

export function MatchRow({ match, onPress }: MatchRowProps) {
  return (
    <Pressable className="flex-row items-center gap-3 rounded-paw border border-paw-line bg-white p-3" onPress={onPress}>
      <Image source={{ uri: match.targetPet.avatarUrl || fallbackImage }} className="h-16 w-16 rounded-paw bg-paw-mint" contentFit="cover" />
      <View className="flex-1">
        <AppText className="font-bold">{match.targetPet.name}</AppText>
        <AppText variant="caption">{match.targetPet.breed || "Matched dog"}</AppText>
      </View>
      <Badge label={match.status} tone="teal" />
    </Pressable>
  );
}
