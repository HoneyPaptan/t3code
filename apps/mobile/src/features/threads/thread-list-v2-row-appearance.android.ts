import type { ViewStyle } from "react-native";
import type { MobileThemeVariables } from "../../lib/mobileTheme";
import { MONO_FONT_FAMILY } from "../../lib/useFontFamily";
import { MOBILE_RADIUS } from "../../lib/radius";

export const THREAD_LIST_V2_MONO_FONT = MONO_FONT_FAMILY;
export const THREAD_LIST_V2_ROW_CONTENT_CLASS_NAME = "min-h-16 justify-center px-4 py-3";

export const selectedThreadRowColors = {
  foregroundClassName: "text-thread-selected-foreground",
  mutedForegroundClassName: "text-thread-selected-foreground-muted",
  iconTintClassName: "accent-thread-selected-foreground",
  mutedIconTintClassName: "accent-thread-selected-foreground-muted",
};

export function getThreadListV2NewBranchMenuTitle(branch: string) {
  return `New thread on ${branch}`;
}

export function getThreadListV2RowAppearance(
  theme: MobileThemeVariables,
  sidebarPane: boolean,
  selected: boolean,
) {
  const selectedBackgroundColor = theme["--color-thread-selected"];
  const backgroundColor = theme[sidebarPane ? "--color-drawer" : "--color-screen"];
  const selectedSurfaceColor = sidebarPane
    ? selectedBackgroundColor
    : theme["--color-grouped-card"];
  const rowRadius = sidebarPane ? MOBILE_RADIUS.md : MOBILE_RADIUS.xl;
  const style: ViewStyle = {
    backgroundColor: selected ? selectedSurfaceColor : backgroundColor,
    borderRadius: rowRadius,
  };
  const swipeContainerStyle: ViewStyle = {
    borderRadius: rowRadius,
    overflow: "hidden",
    marginHorizontal: 8,
    marginVertical: 2,
  };

  return {
    className: undefined,
    interactionClassName: sidebarPane ? "bg-thread-hover" : "bg-row-hover",
    interactionOpacity: selected ? 0 : 1,
    foregroundClassName: sidebarPane ? "text-drawer-foreground" : "text-foreground",
    mutedForegroundClassName: sidebarPane
      ? "text-drawer-foreground-muted"
      : "text-foreground-muted",
    tertiaryForegroundClassName: sidebarPane
      ? "text-drawer-foreground-muted/60"
      : "text-foreground-muted/60",
    mutedIconTintClassName: sidebarPane
      ? "accent-drawer-foreground-muted"
      : "accent-foreground-muted",
    tertiaryIconTintClassName: sidebarPane
      ? "accent-drawer-foreground-muted"
      : "accent-foreground-tertiary",
    style,
    cardStyle: sidebarPane ? { ...style, paddingHorizontal: 12, paddingVertical: 10 } : style,
    swipeContainerStyle,
    swipeBackgroundColor: backgroundColor,
    providerIconSurfaceColor: selected ? selectedSurfaceColor : backgroundColor,
  };
}
