import type { ThemeAppearance, ThemeColors } from "@t3tools/shared/themePalettes";

import { DRAY_PALETTES } from "./drayPalettes.generated.ts";
import { drayPaletteToThemeColors, type DrayPalette, type DrayThemeId } from "./drayTokens.ts";

export function getDrayPalette(themeId: DrayThemeId, appearance: ThemeAppearance): DrayPalette {
  const palettes = DRAY_PALETTES[themeId];
  const palette = palettes[appearance] ?? palettes.dark;
  if (!palette) throw new Error(`Dray theme ${themeId} has no palette.`);
  return palette;
}

export function getDrayThemeColors(themeId: DrayThemeId, appearance: ThemeAppearance): ThemeColors {
  return drayPaletteToThemeColors(getDrayPalette(themeId, appearance));
}
