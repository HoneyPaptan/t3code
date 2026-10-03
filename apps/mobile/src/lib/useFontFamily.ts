const FONT_FAMILIES = {
  regular: "Geist-Regular",
  medium: "Geist-Medium",
  bold: "Geist-Bold",
  mono: "GeistMono-Regular",
} as const;

export const MONO_FONT_FAMILY = FONT_FAMILIES.mono;

/**
 * Resolves a font family for APIs that require a style object or native prop.
 * Prefer Uniwind font classes when the target component accepts `className`.
 */
export function useFontFamily(weight: keyof typeof FONT_FAMILIES): string {
  return FONT_FAMILIES[weight];
}
