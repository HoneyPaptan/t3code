import { describe, expect, it } from "vite-plus/test";
import { MOBILE_THEME_IDS } from "@t3tools/shared/themePalettes";

import { getMobileThemeVariables } from "./mobileTheme";
import { createNativeComposerTheme } from "./nativeComposerTheme";

describe("native composer colors", () => {
  it.each(MOBILE_THEME_IDS)("delivers parsable colors for %s in both appearances", (themeId) => {
    for (const appearance of ["light", "dark"] as const) {
      const variables = getMobileThemeVariables(themeId, appearance);
      const theme = createNativeComposerTheme(variables);
      for (const color of Object.values(theme)) expect(color).toMatch(/^#[\da-f]{6}$/i);
      expect(theme.text).toBe(variables["--color-foreground"]);
      expect(theme.skillBorder).not.toBe(theme.skillBackground);
    }
  });

  it("flattens Material You alpha colors over the composer rather than falling back to defaults", () => {
    const theme = createNativeComposerTheme({
      ...getMobileThemeVariables("t3-code", "light"),
      "--color-screen": "#ffffffff",
      "--color-grouped-card": "#ffffffff",
      "--color-foreground": "#000000",
      "--color-update": "#0000000d",
      "--color-update-foreground": "#000000",
      "--color-inline-skill-background": "#ffffffff",
      "--color-inline-skill-border": "#00000080",
    });
    expect(theme.chipBackground).toBe("#f2f2f2");
    expect(theme.chipBorder).toBe(theme.chipBackground);
    expect(theme.chipText).toBe("#000000");
    expect(theme.fileTint).toBe(theme.chipText);
    expect(theme.placeholder).toBe("#808080");
    expect(theme.skillBorder).toBe("#7f7f7f");
  });
});
