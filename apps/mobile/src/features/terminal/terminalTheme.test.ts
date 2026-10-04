import { describe, expect, it } from "vite-plus/test";

import {
  getMobileThemeVariables,
  MOBILE_THEME_IDS,
  type MobileThemeId,
} from "../../lib/mobileTheme";
import { DRAY_THEME_IDS } from "../../lib/drayTokens";

import { buildGhosttyThemeConfig, getMobileTerminalTheme } from "./terminalTheme";

const SCHEMES = ["light", "dark"] as const;

describe("getMobileTerminalTheme", () => {
  it.each(DRAY_THEME_IDS.flatMap((id) => SCHEMES.map((scheme) => [id, scheme] as const)))(
    "follows the %s theme variables in %s",
    (themeId, scheme) => {
      const variables = getMobileThemeVariables(themeId, scheme);
      const terminal = getMobileTerminalTheme(themeId, scheme);

      expect(terminal.background).toBe(variables["--color-screen"]);
      expect(terminal.foreground).toBe(variables["--color-foreground"]);
      expect(terminal.border).toBe(variables["--color-border"]);
      expect(terminal.cursorBackground).toBe(terminal.background);
    },
  );

  it("resolves every theme id, material you included, to opaque hex colors", () => {
    for (const themeId of MOBILE_THEME_IDS) {
      for (const scheme of SCHEMES) {
        const terminal = getMobileTerminalTheme(themeId, scheme);
        expect(terminal.foreground).toMatch(/^#[\da-f]{6}$/i);
        expect(terminal.mutedForeground).toMatch(/^#[\da-f]{6}$/i);
        expect(terminal.cursorForeground).toMatch(/^#[\da-f]{6}$/i);
      }
    }
  });

  it("prefers explicit variables over the registered theme", () => {
    const variables = {
      ...getMobileThemeVariables("gruvbox", "dark"),
      "--color-screen": "#010203",
    };

    expect(getMobileTerminalTheme("material-you", "dark", variables).background).toBe("#010203");
  });

  it("gives each Dray theme its own ANSI palette and shares one for the rest", () => {
    const gruvbox = getMobileTerminalTheme("gruvbox", "dark").palette;
    const cobalt = getMobileTerminalTheme("cobalt2", "dark").palette;
    const stock = getMobileTerminalTheme("t3-code", "dark").palette;
    const materialYou = getMobileTerminalTheme("material-you", "dark").palette;

    expect(gruvbox).not.toEqual(cobalt);
    expect(gruvbox).not.toEqual(stock);
    expect(materialYou).toEqual(stock);
  });

  it("keeps the light palette distinct from the dark one for themes with both", () => {
    const themeIds: ReadonlyArray<MobileThemeId> = ["gruvbox", "catppuccin", "default"];
    for (const themeId of themeIds) {
      expect(getMobileTerminalTheme(themeId, "light").palette).not.toEqual(
        getMobileTerminalTheme(themeId, "dark").palette,
      );
    }
  });
});

describe("buildGhosttyThemeConfig", () => {
  it("serializes theme colors into a ghostty config file", () => {
    const terminal = getMobileTerminalTheme("gruvbox", "dark");
    const config = buildGhosttyThemeConfig(terminal);

    expect(config).toContain(`background = ${terminal.background}`);
    expect(config).toContain(`foreground = ${terminal.foreground}`);
    expect(config).toContain(`cursor-color = ${terminal.cursorForeground}`);
    expect(config).toContain("palette = 0=#282828");
    expect(config).toContain("palette = 15=#ebdbb2");
    expect(config.endsWith("\n")).toBe(true);
  });
});
