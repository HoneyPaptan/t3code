import { DEFAULT_BASE_FONT_SIZE, normalizeBaseFontSize } from "./appearancePreferences";

export function resolveAndroidControlSizing(baseFontSize: number) {
  const scale = normalizeBaseFontSize(baseFontSize) / DEFAULT_BASE_FONT_SIZE;
  const iconSize = Math.round(24 * scale);
  const buttonSize = Math.max(48, Math.round(48 * scale));
  const compactIconSize = Math.round(20 * scale);
  const compactButtonSize = Math.max(44, Math.round(44 * scale));
  const fabSize = Math.max(48, Math.round(56 * scale));

  return {
    scale,
    iconSize,
    smallIconSize: Math.round(16 * scale),
    mediumIconSize: Math.round(18 * scale),
    buttonSize,
    compactIconSize,
    compactButtonSize,
    fabSize,
    largeFabSize: Math.round(96 * scale),
    menuWidth: Math.round(250 * scale),
    fabClearance: fabSize * 3 + 52,
  };
}
