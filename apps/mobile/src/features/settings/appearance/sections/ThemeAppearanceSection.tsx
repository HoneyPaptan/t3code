import { Pressable, View } from "react-native";
import { ScopedTheme, ScopedVariables } from "uniwind";

import { SymbolView } from "../../../../components/AppSymbol";
import { AppText as Text } from "../../../../components/AppText";
import {
  MOBILE_THEME_OPTIONS,
  type MobileThemeAppearance,
  type MobileThemeId,
  type MobileThemeIds,
  type MobileThemeMode,
} from "../../../../lib/mobileTheme";
import { getMobileUniwindThemeName } from "../../../../lib/mobileThemeRuntime";
import { cn } from "../../../../lib/cn";
import { useAppearancePreferences } from "../AppearancePreferencesProvider";
import { ThemeSwatch } from "../components/ThemeSwatch";

const APPEARANCE_MODES: ReadonlyArray<{
  readonly id: MobileThemeMode;
  readonly label: string;
}> = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

const appearanceChoices: ReadonlyArray<{
  readonly appearance: MobileThemeAppearance;
  readonly symbol: "sun.max" | "moon";
}> = [
  { appearance: "light", symbol: "sun.max" },
  { appearance: "dark", symbol: "moon" },
];

const themeHint = (darkOnly: boolean) =>
  darkOnly ? "Always dark, also in light mode" : "Light and dark";

function AppearanceChoice(props: {
  readonly appearance: MobileThemeAppearance;
  readonly disabled: boolean;
  readonly label: string;
  readonly onPress: () => void;
  readonly selected: boolean;
  readonly symbol: "sun.max" | "moon";
}) {
  return (
    <Pressable
      accessibilityHint={`Sets the ${props.appearance} appearance only`}
      accessibilityLabel={`${props.label} ${props.appearance} theme`}
      accessibilityRole="button"
      accessibilityState={{ disabled: props.disabled, selected: props.selected }}
      className={cn("size-7 items-center justify-center rounded-md", props.selected && "bg-card")}
      disabled={props.disabled}
      hitSlop={8}
      onPress={props.onPress}
    >
      <SymbolView
        name={props.symbol}
        size={14}
        tintColorClassName={props.selected ? "accent-icon" : "accent-icon-muted"}
        type="monochrome"
        weight="medium"
      />
    </Pressable>
  );
}

function ThemeCard(props: {
  readonly appearance: MobileThemeAppearance;
  readonly darkOnly: boolean;
  readonly disabled: boolean;
  readonly darkSelected: boolean;
  readonly label: string;
  readonly lightSelected: boolean;
  readonly onSelectBoth: () => void;
  readonly onSelect: (appearance: MobileThemeAppearance) => void;
  readonly themeId: MobileThemeId;
}) {
  const selected = props.lightSelected || props.darkSelected;
  const selectedByAppearance = { light: props.lightSelected, dark: props.darkSelected };

  return (
    <View
      className={cn(
        "flex-row items-center gap-3 rounded-md px-2 py-2",
        selected && "bg-thread-selected",
      )}
    >
      <Pressable
        accessibilityHint="Sets both light and dark appearances"
        accessibilityLabel={`${props.label} theme`}
        accessibilityRole="button"
        accessibilityState={{
          disabled: props.disabled,
          selected: props.lightSelected && props.darkSelected,
        }}
        className="absolute inset-0 rounded-md active:bg-thread-hover"
        disabled={props.disabled}
        onPress={props.onSelectBoth}
      />
      <View pointerEvents="none">
        <ThemeSwatch appearance={props.appearance} themeId={props.themeId} />
      </View>
      <View className="min-w-0 flex-1 gap-0.5" pointerEvents="none">
        <Text
          className={cn(
            "text-sm font-t3-medium",
            selected ? "text-thread-selected-foreground" : "text-foreground",
          )}
          numberOfLines={1}
        >
          {props.label}
        </Text>
        <Text
          className={cn(
            "text-xs",
            selected ? "text-thread-selected-foreground-muted" : "text-foreground-muted/60",
          )}
          numberOfLines={1}
        >
          {themeHint(props.darkOnly)}
        </Text>
      </View>
      <View className="flex-row items-center gap-0.5">
        {appearanceChoices.map((choice) => (
          <AppearanceChoice
            appearance={choice.appearance}
            disabled={props.disabled}
            key={choice.appearance}
            label={props.label}
            onPress={() => props.onSelect(choice.appearance)}
            selected={selectedByAppearance[choice.appearance]}
            symbol={choice.symbol}
          />
        ))}
      </View>
    </View>
  );
}

function PreviewPane(props: { readonly compact?: boolean }) {
  return (
    <View className="flex-1 overflow-hidden bg-screen">
      <View
        className={cn("bg-card", props.compact ? "h-[18px] gap-0.5 px-1" : "h-[18px] gap-1 px-1.5")}
      >
        <View className="mt-2 flex-row items-center gap-1">
          <View className="size-1.5 rounded-full bg-primary" />
          <View className="h-1 flex-1 rounded-full bg-foreground-muted" />
        </View>
      </View>
      <View
        className={
          props.compact ? "flex-1 justify-between px-1 py-2" : "flex-1 justify-between px-1.5 py-2"
        }
      >
        <View className="gap-1">
          <View className="h-1.5 w-[72%] rounded-full bg-subtle-strong" />
          <View className="h-1.5 w-[46%] rounded-full bg-subtle-strong" />
        </View>
        <View className="items-end gap-1 pb-2">
          <View className="h-3 w-[78%] rounded-full bg-user-bubble" />
          <View className="h-1 w-[38%] rounded-full bg-foreground-muted" />
        </View>
      </View>
    </View>
  );
}

function ModePreview(props: { readonly mode: MobileThemeMode; readonly themeIds: MobileThemeIds }) {
  const { themeVariablesByAppearance } = useAppearancePreferences();
  if (props.mode === "system") {
    return (
      <View className="h-24 w-14 self-center rounded-lg border-[1.5px] border-border bg-drawer p-[3px]">
        <View className="flex-1 flex-row overflow-hidden rounded-md">
          <ScopedTheme theme={getMobileUniwindThemeName(props.themeIds.light, "light")}>
            <ScopedVariables variables={themeVariablesByAppearance.light}>
              <PreviewPane compact />
            </ScopedVariables>
          </ScopedTheme>
          <ScopedTheme theme={getMobileUniwindThemeName(props.themeIds.dark, "dark")}>
            <ScopedVariables variables={themeVariablesByAppearance.dark}>
              <PreviewPane compact />
            </ScopedVariables>
          </ScopedTheme>
        </View>
        <View className="absolute bottom-[6px] left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-foreground-muted" />
      </View>
    );
  }

  return (
    <ScopedTheme theme={getMobileUniwindThemeName(props.themeIds[props.mode], props.mode)}>
      <View className="h-24 w-14 self-center rounded-lg border-[1.5px] border-border bg-drawer p-[3px]">
        <View className="flex-1 flex-row overflow-hidden rounded-md">
          <ScopedVariables variables={themeVariablesByAppearance[props.mode]}>
            <PreviewPane />
          </ScopedVariables>
        </View>
        <View className="absolute bottom-[6px] left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-foreground-muted" />
      </View>
    </ScopedTheme>
  );
}

function ModeCard(props: {
  readonly disabled: boolean;
  readonly label: string;
  readonly mode: MobileThemeMode;
  readonly onPress: () => void;
  readonly selected: boolean;
  readonly themeIds: MobileThemeIds;
}) {
  return (
    <Pressable
      accessibilityLabel={`${props.label} appearance`}
      accessibilityRole="radio"
      accessibilityState={{ checked: props.selected, disabled: props.disabled }}
      className={cn(
        "min-w-0 flex-1 gap-2 rounded-lg border border-border p-3 active:scale-[0.97]",
        props.selected ? "bg-thread-selected" : "bg-grouped-card",
      )}
      disabled={props.disabled}
      onPress={props.onPress}
    >
      <ModePreview mode={props.mode} themeIds={props.themeIds} />
      <Text
        className={
          props.selected
            ? "text-center text-sm font-t3-medium text-thread-selected-foreground"
            : "text-center text-sm text-foreground-muted"
        }
      >
        {props.label}
      </Text>
    </Pressable>
  );
}

function SectionLabel({ children }: { readonly children: string }) {
  return <Text className="px-2 text-sm font-t3-medium text-foreground-muted/70">{children}</Text>;
}

export function ThemeAppearanceSection() {
  const {
    isReady,
    setThemeIdForAppearance,
    setThemeIdForBothAppearances,
    setThemeMode,
    themeAppearance,
    themeIds,
    themeMode,
  } = useAppearancePreferences();

  return (
    <View className="gap-6">
      <View className="gap-2">
        <SectionLabel>Color scheme</SectionLabel>
        <View accessibilityRole="radiogroup" className="flex-row gap-2">
          {APPEARANCE_MODES.map((mode) => (
            <ModeCard
              disabled={!isReady}
              key={mode.id}
              label={mode.label}
              mode={mode.id}
              onPress={() => setThemeMode(mode.id)}
              selected={mode.id === themeMode}
              themeIds={themeIds}
            />
          ))}
        </View>
      </View>

      <View className="gap-3">
        <SectionLabel>Themes</SectionLabel>
        <View className="gap-px">
          {MOBILE_THEME_OPTIONS.map((theme) => (
            <ThemeCard
              appearance={themeAppearance}
              darkOnly={theme.darkOnly}
              disabled={!isReady}
              key={theme.id}
              label={theme.label}
              darkSelected={theme.id === themeIds.dark}
              lightSelected={theme.id === themeIds.light}
              onSelect={(appearance) => setThemeIdForAppearance(appearance, theme.id)}
              onSelectBoth={() => setThemeIdForBothAppearances(theme.id)}
              themeId={theme.id}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
