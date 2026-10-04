import { fontFamilyStore, type FontFamilyNames } from "./fontFamilyStore";

/**
 * Resolves a font family for APIs that require a style object or native prop.
 * Prefer Uniwind font classes when the target component accepts `className`.
 */
export function useFontFamily(weight: keyof FontFamilyNames): string {
  return fontFamilyStore.use()[weight];
}
