import { View } from "react-native";
import { AppText } from "./AppText";
import { Button } from "./Button";

type EmptyStateProps = {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, body, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center gap-3 rounded-paw border border-dashed border-paw-line bg-white p-6">
      <AppText variant="subtitle" className="text-center">
        {title}
      </AppText>
      <AppText className="text-center text-paw-muted">{body}</AppText>
      {actionLabel && onAction ? <Button label={actionLabel} variant="secondary" onPress={onAction} /> : null}
    </View>
  );
}
