import { PropsWithChildren } from "react";
import { View, ViewProps } from "react-native";
import { cn } from "@/src/utils/cn";

export function Card({ children, className, ...props }: PropsWithChildren<ViewProps & { className?: string }>) {
  return (
    <View className={cn("rounded-paw border border-paw-line bg-white p-4 shadow-sm", className)} {...props}>
      {children}
    </View>
  );
}
