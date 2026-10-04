import { getDrayPalette } from "../lib/drayPalettes.ts";

export interface SubscriptionUsagePalette {
  surface: string;
  foreground: string;
  foregroundMuted: string;
  hairline: string;
  track: string;
  fill: string;
  danger: string;
}

export type SubscriptionUsageFallbackPalettes = Readonly<
  Record<"light" | "dark", SubscriptionUsagePalette>
>;

function fallbackPalette(appearance: "light" | "dark"): SubscriptionUsagePalette {
  const dray = getDrayPalette("gruvbox", appearance);
  return {
    surface: dray.surfaceCard,
    foreground: dray.foreground,
    foregroundMuted: dray.mutedForeground,
    hairline: dray.hairline,
    track: dray.muted,
    fill: dray.buttonPrimary,
    danger: dray.destructive,
  };
}

export const SUBSCRIPTION_USAGE_FALLBACK_PALETTES: SubscriptionUsageFallbackPalettes = {
  light: fallbackPalette("light"),
  dark: fallbackPalette("dark"),
};
