import { flattenThemeColor, themeColorWithAlpha, type MobileThemeVariables } from "./mobileTheme";

const PLACEHOLDER_ALPHA = 0.5;

export function createNativeComposerTheme(theme: MobileThemeVariables) {
  const surface = flattenThemeColor(theme["--color-grouped-card"], theme["--color-screen"]);
  const chipBackground = flattenThemeColor(theme["--color-update"], surface);
  const chipText = flattenThemeColor(theme["--color-update-foreground"], chipBackground);
  const skillBackground = flattenThemeColor(theme["--color-inline-skill-background"], surface);
  return {
    text: flattenThemeColor(theme["--color-foreground"], surface),
    placeholder: flattenThemeColor(
      themeColorWithAlpha(theme["--color-foreground"], PLACEHOLDER_ALPHA),
      surface,
    ),
    chipBackground,
    chipBorder: chipBackground,
    chipText,
    skillBackground,
    skillBorder: flattenThemeColor(theme["--color-inline-skill-border"], skillBackground),
    skillText: flattenThemeColor(theme["--color-inline-skill-foreground"], skillBackground),
    fileTint: chipText,
  };
}
