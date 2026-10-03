import { View } from "react-native";
import { ScopedTheme } from "uniwind";

import type { MobileThemeAppearance, MobileThemeId } from "../../../../lib/mobileTheme";
import { getMobileUniwindThemeName } from "../../../../lib/mobileThemeRuntime";

const CHIP_CLASS_NAMES = ["bg-primary", "bg-success", "bg-merged"] as const;

export function ThemeSwatch(props: {
  readonly appearance: MobileThemeAppearance;
  readonly themeId: MobileThemeId;
}) {
  return (
    <ScopedTheme theme={getMobileUniwindThemeName(props.themeId, props.appearance)}>
      <View
        accessibilityElementsHidden
        className="size-12 overflow-hidden rounded-md border border-border bg-screen"
        importantForAccessibility="no-hide-descendants"
      >
        <View className="absolute -bottom-8 -right-8 size-16 rotate-45 bg-card" />
        <View className="absolute left-1.5 top-1.5 flex-row gap-0.5">
          {CHIP_CLASS_NAMES.map((chipClassName) => (
            <View className={`size-1.5 rounded-full ${chipClassName}`} key={chipClassName} />
          ))}
        </View>
      </View>
    </ScopedTheme>
  );
}
