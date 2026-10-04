import { Pressable, type StyleProp, type ViewStyle } from "react-native";

import { cn } from "../lib/cn";
import { AppText } from "./AppText";
import { SymbolView, type AppSymbolName } from "./AppSymbol";

const FLOATING_ACTION_ICON_SIZE = 18;

export function MaterialFloatingActionButton(props: {
  readonly onPress: () => void;
  readonly label: string;
  readonly icon: AppSymbolName;
  readonly variant?: "extended" | "large";
  readonly expanded?: boolean;
  readonly tone?: "primary" | "secondary";
  readonly disabled?: boolean;
  readonly className?: string;
  readonly style?: StyleProp<ViewStyle>;
}) {
  const primary = props.tone === "primary";
  const showLabel = props.variant === "extended" && props.expanded !== false;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.label}
      accessibilityState={{ disabled: props.disabled === true }}
      disabled={props.disabled}
      onPress={props.onPress}
      className={cn(
        "min-h-11 min-w-11 flex-row items-center justify-center gap-2 rounded-xl active:opacity-70",
        primary ? "bg-primary" : "border border-border-subtle bg-grouped-card",
        showLabel ? "px-4" : "px-3",
        props.disabled && "opacity-40",
        props.className,
      )}
      style={props.style}
    >
      <SymbolView
        name={props.icon}
        size={FLOATING_ACTION_ICON_SIZE}
        tintColorClassName={primary ? "accent-primary-foreground" : "accent-icon"}
      />
      {showLabel ? (
        <AppText
          className={cn(
            "text-sm font-t3-medium",
            primary ? "text-primary-foreground" : "text-foreground",
          )}
        >
          {props.label}
        </AppText>
      ) : null}
    </Pressable>
  );
}
