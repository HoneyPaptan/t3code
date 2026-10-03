import { THEME_COLOR_ROLES } from "@t3tools/shared/themePalettes";
import { describe, expect, it } from "vite-plus/test";

import { DRAY_PALETTES } from "./drayPalettes.generated.ts";
import { getDrayThemeColors } from "./drayPalettes.ts";
import { DRAY_ROLE_MAP, DRAY_THEME_IDS, DRAY_THEMES, DRAY_TOKENS } from "./drayTokens.ts";
import {
  DEFAULT_MOBILE_THEME_ID,
  MOBILE_THEME_OPTIONS,
  getMobileThemeVariables,
  isDarkOnlyMobileTheme,
  normalizeMobileThemeId,
} from "./mobileTheme.ts";
import { getMobileUniwindThemeName } from "./mobileThemeRuntime.ts";

const HEX = /^#[\da-f]{6}$/;

function channelsOf(hex: string) {
  return [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
}

function luminance(hex: string) {
  const [red, green, blue] = channelsOf(hex).map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * red! + 0.7152 * green! + 0.0722 * blue!;
}

function contrast(first: string, second: string) {
  const [high, low] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (high! + 0.05) / (low! + 0.05);
}

describe("Dray themes", () => {
  it("makes Gruvbox the mobile default and keeps Gruvbox first in the picker", () => {
    expect(DEFAULT_MOBILE_THEME_ID).toBe("gruvbox");
    expect(normalizeMobileThemeId("missing-theme")).toBe("gruvbox");
    expect(MOBILE_THEME_OPTIONS[0]).toEqual({ id: "gruvbox", label: "Gruvbox", darkOnly: false });
  });

  it("lists only the Dray set in the picker, in order", () => {
    expect(MOBILE_THEME_OPTIONS.map((option) => option.id)).toEqual([
      "gruvbox",
      "default",
      "catppuccin",
      "one-dark-pro",
      "cobalt2",
    ]);
    expect(MOBILE_THEME_OPTIONS.map((option) => option.id)).toEqual(DRAY_THEME_IDS);
    for (const hidden of [
      "t3-code",
      "t3-chat",
      "grove",
      "ocean",
      "ember",
      "iris",
      "material-you",
    ]) {
      expect(MOBILE_THEME_OPTIONS.some((option) => option.id === hidden)).toBe(false);
      expect(normalizeMobileThemeId(hidden)).toBe("gruvbox");
    }
  });

  it("flags the dark only themes so the picker can say so", () => {
    expect(
      MOBILE_THEME_OPTIONS.filter((option) => option.darkOnly).map((option) => option.id),
    ).toEqual(["one-dark-pro", "cobalt2"]);
    expect(isDarkOnlyMobileTheme("cobalt2")).toBe(true);
    expect(isDarkOnlyMobileTheme("gruvbox")).toBe(false);
    expect(isDarkOnlyMobileTheme("ocean")).toBe(false);
  });

  it("maps every theme colour role to a Dray token", () => {
    expect(Object.keys(DRAY_ROLE_MAP).sort()).toEqual([...THEME_COLOR_ROLES].sort());
    for (const token of Object.values(DRAY_ROLE_MAP)) {
      expect(DRAY_TOKENS).toContain(token);
    }
  });

  it("resolves every palette to opaque hex for every token", () => {
    for (const theme of DRAY_THEMES) {
      const appearances = Object.keys(DRAY_PALETTES[theme.id]);
      expect(appearances, theme.id).toEqual(theme.darkOnly ? ["dark"] : ["light", "dark"]);
      for (const palette of Object.values(DRAY_PALETTES[theme.id])) {
        expect(Object.keys(palette).sort()).toEqual([...DRAY_TOKENS].sort());
        for (const hex of Object.values(palette)) expect(hex).toMatch(HEX);
      }
    }
  });

  it("keeps the Gruvbox hand-written values and the grey ramp at their known hex", () => {
    expect(DRAY_PALETTES.gruvbox.dark?.background).toBe("#1d2021");
    expect(DRAY_PALETTES.gruvbox.light?.foreground).toBe("#3c3836");
    expect(DRAY_PALETTES.default.dark?.background).toBe("#0a0a0a");
    expect(DRAY_PALETTES.default.dark?.surfaceCard).toBe("#171717");
    expect(DRAY_PALETTES.default.dark?.foreground).toBe("#fafafa");
  });

  it("reuses the dark palette for the light variant of a dark only theme", () => {
    for (const theme of DRAY_THEMES.filter((candidate) => candidate.darkOnly)) {
      expect(getDrayThemeColors(theme.id, "light")).toEqual(getDrayThemeColors(theme.id, "dark"));
    }
  });

  it("names the uniwind variants of Dray themes by id and appearance", () => {
    expect(getMobileUniwindThemeName("gruvbox", "dark")).toBe("gruvbox-dark");
    expect(getMobileUniwindThemeName("one-dark-pro", "light")).toBe("one-dark-pro-light");
    expect(getMobileUniwindThemeName("t3-code", "dark")).toBe("dark");
  });

  it.each(DRAY_THEME_IDS)("keeps %s readable in both appearances", (themeId) => {
    for (const appearance of ["light", "dark"] as const) {
      const variables = getMobileThemeVariables(themeId, appearance);
      const colors = getDrayThemeColors(themeId, appearance);
      expect(variables["--color-screen"]).toBe(colors.canvas);
      expect(variables["--color-card"]).toBe(colors.surface);
      for (const [foreground, surface] of [
        ["--color-foreground", "--color-screen"],
        ["--color-foreground", "--color-card"],
        ["--color-foreground-muted", "--color-screen"],
        ["--color-foreground-muted", "--color-card"],
        ["--color-primary-foreground", "--color-primary"],
        ["--color-md-code-text", "--color-md-code-bg"],
        ["--color-drawer-foreground", "--color-drawer"],
        ["--color-drawer-foreground-muted", "--color-drawer"],
      ] as const) {
        expect(
          contrast(variables[foreground], variables[surface]),
          `${themeId} ${appearance}: ${foreground} on ${surface}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
      expect(
        contrast(variables["--color-user-bubble-foreground"], variables["--color-user-bubble"]),
        `${themeId} ${appearance} user bubble`,
      ).toBeGreaterThanOrEqual(themeId === "default" && appearance === "light" ? 3 : 4.5);
    }
  });
});
