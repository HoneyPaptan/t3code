import { Pressable, type StyleProp, type ViewStyle } from "react-native";

import { cn } from "../lib/cn";
import { AppText } from "./AppText";
import { SymbolView } from "./AppSymbol";

/** Shared compose action for the floating button and empty workspace. */
export function MaterialNewThreadButton(props: {
  readonly onPress: () => void;
  readonly extended?: boolean;
  readonly expanded?: boolean;
  readonly className?: string;
  readonly style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityLabel="New thread"
      accessibilityRole="button"
      onPress={props.onPress}
      className={cn(
        "min-h-11 min-w-11 flex-row items-center justify-center gap-2 rounded-xl bg-primary px-4 active:opacity-70",
        props.className,
      )}
      style={props.style}
    >
      <SymbolView
        name="square.and.pencil"
        size={18}
        tintColorClassName="accent-primary-foreground"
        type="monochrome"
      />
      {props.extended && props.expanded !== false ? (
        <AppText className="text-sm font-t3-medium text-primary-foreground">New thread</AppText>
      ) : null}
    </Pressable>
  );
}
