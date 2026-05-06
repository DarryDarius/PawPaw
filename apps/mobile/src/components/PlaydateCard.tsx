import { View } from "react-native";
import { ApiPlaydate } from "@/src/types/api";
import { AppText } from "./AppText";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Card } from "./Card";

type PlaydateCardProps = {
  playdate: ApiPlaydate;
  onConfirm?: () => void;
  onCancel?: () => void;
  onCheckIn?: () => void;
};

export function PlaydateCard({ playdate, onConfirm, onCancel, onCheckIn }: PlaydateCardProps) {
  const other = playdate.participants?.[0]?.pet;
  return (
    <Card className="gap-3">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <AppText className="font-bold">{other?.name ? `${other.name} at ${playdate.location.name}` : playdate.location.name}</AppText>
          <AppText variant="caption">{playdate.startAt}</AppText>
        </View>
        <Badge label={playdate.status} tone={playdate.status === "completed" ? "teal" : "warning"} />
      </View>
      <AppText className="text-paw-muted">{playdate.location.safetyNotes || "Public place meetup."}</AppText>
      <View className="flex-row flex-wrap gap-2">
        <Button label="Confirm" variant="outline" onPress={onConfirm} />
        <Button label="Check in" variant="secondary" onPress={onCheckIn} />
        <Button label="Cancel" variant="ghost" onPress={onCancel} />
      </View>
    </Card>
  );
}
