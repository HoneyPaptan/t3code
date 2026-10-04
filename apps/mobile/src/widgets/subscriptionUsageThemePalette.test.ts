import { describe, expect, it } from "vite-plus/test";
import { DEFAULT_MOBILE_THEME_ID, getMobileThemeVariables } from "../lib/mobileTheme";
import { SUBSCRIPTION_USAGE_FALLBACK_PALETTES } from "./subscriptionUsagePalette";
import { createSubscriptionUsagePalette } from "./subscriptionUsageThemePalette";

const opaqueHex = /^#[\da-f]{6}$/i;

describe("subscription usage palette", () => {
  it.each(["light", "dark"] as const)("flattens the %s theme variables to opaque hex", (scheme) => {
    const palette = createSubscriptionUsagePalette(
      getMobileThemeVariables(DEFAULT_MOBILE_THEME_ID, scheme),
    );
    expect(Object.values(palette)).toHaveLength(7);
    for (const color of Object.values(palette)) expect(color).toMatch(opaqueHex);
  });

  it("maps theme roles onto the widget roles", () => {
    const variables = getMobileThemeVariables(DEFAULT_MOBILE_THEME_ID, "dark");
    const palette = createSubscriptionUsagePalette(variables);
    expect(palette.surface).toBe(variables["--color-grouped-card"]);
    expect(palette.foreground).toBe(variables["--color-foreground"]);
    expect(palette.fill).toBe(variables["--color-primary"]);
    expect(palette.danger).toBe(variables["--color-danger-foreground"]);
  });

  it("keeps the embedded fallback aligned with the default theme surface", () => {
    for (const scheme of ["light", "dark"] as const) {
      const themed = createSubscriptionUsagePalette(
        getMobileThemeVariables(DEFAULT_MOBILE_THEME_ID, scheme),
      );
      expect(SUBSCRIPTION_USAGE_FALLBACK_PALETTES[scheme].surface).toBe(themed.surface);
      expect(SUBSCRIPTION_USAGE_FALLBACK_PALETTES[scheme].foreground).toBe(themed.foreground);
    }
  });
});
