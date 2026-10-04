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

export function getThreadListV2NewBranchMenuTitle(_branch: string) {
  return "New thread on branch";
}

export function getThreadListV2RowAppearance(
  theme: MobileThemeVariables,
  sidebarPane: boolean,
  selected: boolean,
) {
  const selectedBackgroundColor = theme["--color-thread-selected"];
  const style: ViewStyle | undefined = sidebarPane
    ? {
        backgroundColor: selected ? selectedBackgroundColor : theme["--color-drawer"],
        borderRadius: MOBILE_RADIUS.md,
      }
    : undefined;
  const swipeContainerStyle: ViewStyle = sidebarPane
    ? { borderRadius: MOBILE_RADIUS.md, overflow: "hidden" }
    : {
        borderRadius: MOBILE_RADIUS.xl,
        overflow: "hidden",
        marginHorizontal: 8,
        marginVertical: 2,
      };

  return {
    className: sidebarPane ? undefined : selected ? "bg-grouped-card rounded-xl" : "bg-screen",
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
    cardStyle: sidebarPane ? { ...style, paddingHorizontal: 12, paddingVertical: 10 } : undefined,
    swipeContainerStyle,
    swipeBackgroundColor: theme[sidebarPane ? "--color-drawer" : "--color-screen"],
    providerIconSurfaceColor: sidebarPane
      ? selected
        ? selectedBackgroundColor
        : theme["--color-drawer"]
      : selected
        ? theme["--color-grouped-card"]
        : theme["--color-screen"],
  };
}
