import type { MenuAction } from "@react-native-menu/menu";
import { useMemo, type ReactNode } from "react";
import { Pressable, View } from "react-native";

import { useAppearancePreferences } from "../features/settings/appearance/AppearancePreferencesProvider";
import { cn } from "../lib/cn";
import { AppText } from "./AppText";
import { isAppSymbolName, SymbolView, type AppSymbolName } from "./AppSymbol";
import type { MaterialMenuPopupProps } from "./MaterialMenuPopup";
import { resolveMenuRows } from "./menuRows";
import { useAndroidControlSizing } from "./useAndroidControlSizing";

function MenuIcon(props: { readonly name: AppSymbolName; readonly destructive?: boolean }) {
  const { mediumIconSize } = useAndroidControlSizing();
  return (
    <SymbolView
      name={props.name}
      size={mediumIconSize}
      type="monochrome"
      tintColorClassName={
        props.destructive ? "accent-danger-foreground" : "accent-foreground-muted"
      }
    />
  );
}

function MenuTrailingIcon(props: { readonly name: AppSymbolName; readonly muted: boolean }) {
  const { smallIconSize } = useAndroidControlSizing();
  return (
    <SymbolView
      name={props.name}
      size={smallIconSize}
      type="monochrome"
      tintColorClassName={props.muted ? "accent-foreground-muted/50" : "accent-foreground"}
    />
  );
}

function MenuItem(props: {
  readonly label: string;
  readonly subtitle?: string;
  readonly leading?: ReactNode;
  readonly trailing?: ReactNode;
  readonly destructive?: boolean;
  readonly disabled?: boolean;
  readonly onPress: () => void;
}) {
  const { themeVariables } = useAppearancePreferences();
  return (
    <Pressable
      accessibilityRole="menuitem"
      accessibilityState={{ disabled: props.disabled }}
      android_ripple={{ color: themeVariables["--color-subtle-strong"] }}
      className={cn(
        "min-h-11 flex-row items-center gap-3 px-3 py-1.5",
        props.disabled && "opacity-45",
      )}
      disabled={props.disabled}
      onPress={props.onPress}
    >
      {props.leading}
      <View className="min-w-0 flex-1">
        <AppText
          className={cn("text-sm text-foreground", props.destructive && "text-danger-foreground")}
          numberOfLines={2}
        >
          {props.label}
        </AppText>
        {props.subtitle ? (
          <AppText className="text-xs text-foreground-muted/60" numberOfLines={2}>
            {props.subtitle}
          </AppText>
        ) : null}
      </View>
      {props.trailing}
    </Pressable>
  );
}

function MenuSeparator() {
  return <View className="mx-3 my-1 h-px bg-border-subtle" />;
}

function actionTrailing(action: MenuAction) {
  if ((action.subactions?.length ?? 0) > 0) {
    return <MenuTrailingIcon name="chevron.right" muted />;
  }
  return action.state === "on" ? <MenuTrailingIcon name="checkmark" muted={false} /> : null;
}

export function MaterialMenuPopup(props: MaterialMenuPopupProps) {
  const rows = useMemo(() => resolveMenuRows(props.actions), [props.actions]);
  return (
    <View accessibilityRole="menu" className="py-1">
      {props.parent ? (
        <>
          <MenuItem
            label={props.parent.title}
            leading={<MenuIcon name="arrow.left" />}
            onPress={props.onBack}
          />
          <MenuSeparator />
        </>
      ) : props.title ? (
        <AppText className="px-3 pb-1 pt-2 text-xs text-foreground-muted/50">{props.title}</AppText>
      ) : null}
      {rows.map(({ action, separatorBefore }, index) => (
        <View key={action.id ?? `${index}-${action.title}`}>
          {separatorBefore ? <MenuSeparator /> : null}
          <MenuItem
            label={action.title}
            subtitle={action.subtitle}
            leading={
              action.image && isAppSymbolName(action.image) ? (
                <MenuIcon name={action.image} destructive={action.attributes?.destructive} />
              ) : null
            }
            trailing={actionTrailing(action)}
            destructive={action.attributes?.destructive}
            disabled={action.attributes?.disabled}
            onPress={() => props.onPress(action)}
          />
        </View>
      ))}
    </View>
  );
}
