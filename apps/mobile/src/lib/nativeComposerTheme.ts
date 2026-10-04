import { flattenThemeColor, themeColorWithAlpha, type MobileThemeVariables } from "./mobileTheme";

const PLACEHOLDER_ALPHA = 0.5;

/** Native chip parsers need opaque hex instead of CSS rgba or platform-specific alpha order. */
export function createNativeComposerTheme(theme: MobileThemeVariables) {
  const surface = flattenThemeColor(theme["--color-grouped-card"], theme["--color-screen"]);
  const chipBackground = flattenThemeColor(theme["--color-subtle"], surface);
  const skillBackground = flattenThemeColor(theme["--color-inline-skill-background"], surface);
  return {
    text: flattenThemeColor(theme["--color-foreground"], surface),
    placeholder: flattenThemeColor(
      themeColorWithAlpha(theme["--color-foreground"], PLACEHOLDER_ALPHA),
      surface,
    ),
    chipBackground,
    chipBorder: flattenThemeColor(theme["--color-border"], chipBackground),
    chipText: flattenThemeColor(theme["--color-foreground"], chipBackground),
    skillBackground,
    skillBorder: flattenThemeColor(theme["--color-inline-skill-border"], skillBackground),
    skillText: flattenThemeColor(theme["--color-inline-skill-foreground"], skillBackground),
    fileTint: flattenThemeColor(theme["--color-icon-muted"], chipBackground),
  };
}
