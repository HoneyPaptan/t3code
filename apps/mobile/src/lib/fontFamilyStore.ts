import { createExternalStore } from "./externalStore";

export interface FontFamilyNames {
  readonly regular: string;
  readonly medium: string;
  readonly bold: string;
  readonly mono: string;
}

export const DEFAULT_FONT_FAMILY_NAMES: FontFamilyNames = {
  regular: "Geist-Regular",
  medium: "Geist-Medium",
  bold: "Geist-Bold",
  mono: "GeistMono-Regular",
};

export const fontFamilyStore = createExternalStore<FontFamilyNames>(DEFAULT_FONT_FAMILY_NAMES);

export function fontFamilyNamesEqual(a: FontFamilyNames, b: FontFamilyNames): boolean {
  return a.regular === b.regular && a.medium === b.medium && a.bold === b.bold && a.mono === b.mono;
}

export function fontFamilyVariables(names: FontFamilyNames): Readonly<Record<string, string>> {
  return {
    "--font-sans": names.regular,
    "--font-medium": names.medium,
    "--font-bold": names.bold,
    "--font-mono": names.mono,
  };
}
