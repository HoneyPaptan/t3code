import type { ThemeAppearance, ThemeColors } from "@t3tools/shared/themePalettes";

import { DRAY_PALETTES } from "./drayPalettes.generated.ts";
import { drayPaletteToThemeColors, type DrayThemeId } from "./drayTokens.ts";

export function getDrayThemeColors(themeId: DrayThemeId, appearance: ThemeAppearance): ThemeColors {
  const palettes = DRAY_PALETTES[themeId];
  const palette = palettes[appearance] ?? palettes.dark;
  if (!palette) throw new Error(`Dray theme ${themeId} has no palette.`);
  return drayPaletteToThemeColors(palette);
}
