import { SymbolView } from "../../components/AppSymbol";
import { Platform, Pressable } from "react-native";

import { AppText as Text } from "../../components/AppText";
import { cn } from "../../lib/cn";
import { MaterialButton } from "../../components/MaterialButton";

export function ConnectionSheetButton(props: {
  readonly icon: React.ComponentProps<typeof SymbolView>["name"];
  readonly label: string;
  readonly disabled?: boolean;
  readonly tone?: "primary" | "secondary" | "danger";
  readonly compact?: boolean;
  readonly fullWidth?: boolean;
  readonly onPress: () => void;
}) {
  if (Platform.OS === "android")
    return (
      <MaterialButton
        label={props.label}
        disabled={props.disabled}
        onPress={props.onPress}
        tone={props.tone}
        fullWidth={props.fullWidth}
      />
    );
  const tone = props.tone ?? "secondary";

  const textColorClassName =
    tone === "primary"
      ? "accent-primary-foreground"
      : tone === "danger"
        ? "accent-danger-foreground"
        : "accent-secondary-foreground";

  return (
    <Pressable
      accessibilityLabel={props.label}
      accessibilityRole="button"
      accessibilityState={{ disabled: props.disabled ?? false }}
      className={cn(
        props.compact
          ? "min-h-[42px] flex-row items-center justify-center gap-1.5 rounded-lg px-3.5 py-2.5"
          : "min-h-[48px] flex-row items-center justify-center gap-2 rounded-lg px-4 py-3",
        "disabled:opacity-50",
        tone === "primary"
          ? "bg-primary shadow-md shadow-primary-shadow/15"
          : tone === "danger"
            ? "border border-danger-border bg-danger"
            : "border border-border bg-secondary",
      )}
      disabled={props.disabled}
      onPress={props.onPress}
    >
      <SymbolView
        name={props.icon}
        size={props.compact ? 13 : 14}
        tintColorClassName={textColorClassName}
        type="monochrome"
      />
      <Text
        className={cn(
          "text-xs font-t3-bold tracking-[0.8px] uppercase",
          tone === "primary"
            ? "text-primary-foreground"
            : tone === "danger"
              ? "text-danger-foreground"
              : "text-secondary-foreground",
        )}
      >
        {props.label}
      </Text>
    </Pressable>
  );
}
