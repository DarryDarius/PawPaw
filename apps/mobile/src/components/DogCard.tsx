import { Image } from "expo-image";
import { View } from "react-native";
import { ApiRecommendation } from "@/src/types/api";
import { Button } from "./Button";
import { Card } from "./Card";
import { AppText } from "./AppText";
import { Badge } from "./Badge";
import { ScoreBadge } from "./ScoreBadge";
import { SafetyBadge } from "./SafetyBadge";

const fallbackImage = "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1200&q=80";

type DogCardProps = {
  recommendation: ApiRecommendation;
  onLike?: () => void;
  onPass?: () => void;
  onReport?: () => void;
  onBlock?: () => void;
  disabled?: boolean;
};

export function DogCard({ recommendation, onLike, onPass, onReport, onBlock, disabled }: DogCardProps) {
  const { pet, owner, score, reasons } = recommendation;
  return (
    <Card className="overflow-hidden p-0">
      <Image source={{ uri: pet.avatarUrl || fallbackImage }} className="h-80 w-full bg-paw-mint" contentFit="cover" />
      <View className="gap-4 p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <AppText variant="title">{pet.name}</AppText>
            <AppText className="text-paw-muted">
              {pet.breed || "Mixed breed"} · {owner.neighborhood || pet.neighborhood || "Nearby"}
            </AppText>
          </View>
          <ScoreBadge score={score} />
        </View>

        <View className="flex-row flex-wrap gap-2">
          <SafetyBadge vaccineStatus={pet.vaccineStatus} />
          <Badge label={`${pet.energyLevel || "medium"} energy`} tone="mint" />
          {(pet.personalityTags || []).slice(0, 3).map((tag) => (
            <Badge key={tag} label={tag} />
          ))}
        </View>

        <View className="gap-2 rounded-paw bg-paw-paper p-3">
          <AppText className="font-bold">Why this match</AppText>
          {reasons.slice(0, 4).map((reason) => (
            <AppText key={reason} className="text-paw-muted">
              - {reason}
            </AppText>
          ))}
        </View>

        <View className="flex-row gap-3">
          <Button className="flex-1" label="Pass" variant="outline" onPress={onPass} disabled={disabled} />
          <Button className="flex-1" label="Like" onPress={onLike} disabled={disabled} />
        </View>
        <View className="flex-row gap-3">
          <Button className="flex-1" label="Report" variant="ghost" onPress={onReport} />
          <Button className="flex-1" label="Block" variant="ghost" onPress={onBlock} />
        </View>
      </View>
    </Card>
  );
}
