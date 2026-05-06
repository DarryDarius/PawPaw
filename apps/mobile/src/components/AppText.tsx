import { Text, TextProps } from "react-native";
import { cn } from "@/src/utils/cn";

type AppTextProps = TextProps & {
  variant?: "title" | "subtitle" | "body" | "caption";
};

export function AppText({ variant = "body", className, ...props }: AppTextProps) {
  return (
    <Text
      className={cn(
        "text-paw-ink",
        variant === "title" && "text-3xl font-extrabold",
        variant === "subtitle" && "text-lg font-bold",
        variant === "body" && "text-[15px] leading-6",
        variant === "caption" && "text-xs text-paw-muted",
        className,
      )}
      {...props}
    />
  );
}
