import { View } from "react-native";
import { AppText } from "./AppText";
import { cn } from "@/src/utils/cn";

type BadgeProps = {
  label: string;
  tone?: "coral" | "teal" | "mint" | "warning" | "neutral";
};

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  return (
    <View
      className={cn(
        "self-start rounded-md px-2.5 py-1",
        tone === "coral" && "bg-paw-coral/10",
        tone === "teal" && "bg-paw-teal/10",
        tone === "mint" && "bg-paw-mint",
        tone === "warning" && "bg-amber-100",
        tone === "neutral" && "bg-paw-sky",
      )}
    >
      <AppText
        variant="caption"
        className={cn(
          "font-bold",
          tone === "coral" && "text-paw-coral",
          tone === "teal" && "text-paw-teal",
          tone === "mint" && "text-paw-teal",
          tone === "warning" && "text-amber-800",
        )}
      >
        {label}
      </AppText>
    </View>
  );
}
