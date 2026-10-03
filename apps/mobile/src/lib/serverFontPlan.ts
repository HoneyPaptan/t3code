import type { ServerFont } from "@t3tools/contracts";

import type { FontChoice, FontFace } from "./fontPreferences";

export interface FontFamilyEntry {
  readonly family: string;
  readonly regular: ServerFont;
}

const REGULAR_WEIGHT = 400;
const MEDIUM_WEIGHT = 500;
const BOLD_WEIGHT = 700;

function toFace(font: ServerFont): FontFace {
  return { fontId: font.fontId, format: font.format };
}

function distanceFromRegular(font: ServerFont): number {
  return Math.abs(font.weight - REGULAR_WEIGHT);
}

function pickRegular(faces: ReadonlyArray<ServerFont>): ServerFont {
  const upright = faces.filter((font) => !font.italic);
  const candidates = upright.length > 0 ? upright : faces;
  return candidates.reduce((best, font) =>
    distanceFromRegular(font) < distanceFromRegular(best) ? font : best,
  );
}

function groupByFamily(fonts: ReadonlyArray<ServerFont>): Map<string, ServerFont[]> {
  const families = new Map<string, ServerFont[]>();
  for (const font of fonts) {
    const faces = families.get(font.family);
    if (faces === undefined) families.set(font.family, [font]);
    else faces.push(font);
  }
  return families;
}

export function listFontFamilies(fonts: ReadonlyArray<ServerFont>): ReadonlyArray<FontFamilyEntry> {
  return [...groupByFamily(fonts)]
    .map(([family, faces]) => ({ family, regular: pickRegular(faces) }))
    .toSorted((a, b) => a.family.localeCompare(b.family));
}

export function filterFontFamilies(
  entries: ReadonlyArray<FontFamilyEntry>,
  query: string,
): ReadonlyArray<FontFamilyEntry> {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) return entries;
  return entries.filter((entry) => entry.family.toLowerCase().includes(needle));
}

function findUprightFace(
  fonts: ReadonlyArray<ServerFont>,
  family: string,
  weight: number,
  regular: ServerFont,
): FontFace | undefined {
  const match = fonts.find(
    (font) =>
      font.family === family &&
      !font.italic &&
      font.weight === weight &&
      font.fontId !== regular.fontId,
  );
  return match === undefined ? undefined : toFace(match);
}

export function planFontChoice(
  fonts: ReadonlyArray<ServerFont>,
  entry: FontFamilyEntry,
  withStyles: boolean,
): FontChoice {
  const choice: FontChoice = { ...toFace(entry.regular), family: entry.family };
  if (!withStyles) return choice;
  const medium = findUprightFace(fonts, entry.family, MEDIUM_WEIGHT, entry.regular);
  const bold = findUprightFace(fonts, entry.family, BOLD_WEIGHT, entry.regular);
  return {
    ...choice,
    ...(medium === undefined ? {} : { medium }),
    ...(bold === undefined ? {} : { bold }),
  };
}
