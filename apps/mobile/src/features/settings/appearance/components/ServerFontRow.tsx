import { Platform, Pressable, View } from "react-native";

import { SymbolView, type AppSymbolName } from "../../../../components/AppSymbol";
import { AppText as Text } from "../../../../components/AppText";
import type { ServerFontStatus } from "../serverFontSelection";

const STATUS_HINTS: Record<ServerFontStatus, string | null> = {
  idle: null,
  loading: "Downloading from your laptop",
  failed: "Could not load this font. Check the laptop connection and try again.",
};

export function ServerFontRow(props: {
  readonly icon: AppSymbolName;
  readonly label: string;
  readonly familyLabel: string;
  readonly status: ServerFontStatus;
  readonly onPress: () => void;
}) {
  const hint = STATUS_HINTS[props.status];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${props.label}, ${props.familyLabel}`}
      className="gap-1 p-4 active:opacity-70"
      onPress={props.onPress}
    >
      <View className="flex-row items-center gap-4">
        <SymbolView
          name={props.icon}
          size={Platform.OS === "android" ? 24 : 22}
          tintColorClassName="accent-icon"
          type="monochrome"
          weight="regular"
        />
        <Text className="flex-1 text-lg font-t3-medium text-foreground android:text-base">
          {props.label}
        </Text>
        <Text className="shrink text-base text-foreground-muted/60" numberOfLines={1}>
          {props.familyLabel}
        </Text>
        <SymbolView
          name="chevron.right"
          size={14}
          tintColorClassName="accent-foreground-muted"
          type="monochrome"
          weight="semibold"
        />
      </View>
      {hint === null ? null : (
        <Text
          className={
            props.status === "failed"
              ? "text-sm leading-normal text-danger-foreground"
              : "text-sm leading-normal text-foreground-muted/60"
          }
        >
          {hint}
        </Text>
      )}
    </Pressable>
  );
}
