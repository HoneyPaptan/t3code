import {
  DEFAULT_FONT_FAMILY_NAMES,
  fontFamilyStore,
  type FontFamilyNames,
} from "./fontFamilyStore";

export const MONO_FONT_FAMILY = DEFAULT_FONT_FAMILY_NAMES.mono;

/**
 * Resolves a font family for APIs that require a style object or native prop.
 * Prefer Uniwind font classes when the target component accepts `className`.
 */
export function useFontFamily(weight: keyof FontFamilyNames): string {
  return fontFamilyStore.use()[weight];
}
