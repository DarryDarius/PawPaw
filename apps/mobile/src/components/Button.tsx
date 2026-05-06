import { Pressable, PressableProps } from "react-native";
import { AppText } from "./AppText";
import { cn } from "@/src/utils/cn";

type ButtonProps = PressableProps & {
  label: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
};

export function Button({ label, variant = "primary", className, disabled, ...props }: ButtonProps & { className?: string }) {
  return (
    <Pressable
      className={cn(
        "h-12 items-center justify-center rounded-paw px-4",
        variant === "primary" && "bg-paw-coral",
        variant === "secondary" && "bg-paw-mint",
        variant === "outline" && "border border-paw-line bg-white",
        variant === "ghost" && "bg-transparent",
        variant === "danger" && "bg-red-600",
        disabled && "opacity-50",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      <AppText
        className={cn(
          "font-bold",
          (variant === "primary" || variant === "danger") && "text-white",
          variant === "secondary" && "text-paw-teal",
          (variant === "outline" || variant === "ghost") && "text-paw-ink",
        )}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
