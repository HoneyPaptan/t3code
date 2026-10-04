import { flattenThemeColor, type MobileThemeVariables } from "../lib/mobileTheme";
import type { SubscriptionUsagePalette } from "./subscriptionUsagePalette";

export function createSubscriptionUsagePalette(
  variables: MobileThemeVariables,
): SubscriptionUsagePalette {
  const surface = flattenThemeColor(variables["--color-grouped-card"], variables["--color-screen"]);
  const opaque = (color: string) => flattenThemeColor(color, surface);
  return {
    surface,
    foreground: opaque(variables["--color-foreground"]),
    foregroundMuted: opaque(variables["--color-foreground-muted"]),
    hairline: opaque(variables["--color-border-subtle"]),
    track: opaque(variables["--color-subtle"]),
    fill: opaque(variables["--color-primary"]),
    danger: opaque(variables["--color-danger-foreground"]),
  };
}
