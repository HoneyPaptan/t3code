export type FontFileFormat = "ttf" | "otf";

export interface FontFace {
  readonly fontId: string;
  readonly format: FontFileFormat;
}

export interface FontChoice extends FontFace {
  readonly family: string;
  readonly medium?: FontFace;
  readonly bold?: FontFace;
}

export interface FontPreferences {
  readonly sans?: FontChoice;
  readonly mono?: FontChoice;
}

const FONT_ID_PATTERN = /^[0-9a-f]{16}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeFontFace(value: unknown): FontFace | undefined {
  if (!isRecord(value)) return undefined;
  const { fontId, format } = value;
  if (typeof fontId !== "string" || !FONT_ID_PATTERN.test(fontId)) return undefined;
  if (format !== "ttf" && format !== "otf") return undefined;
  return { fontId, format };
}

function sanitizeFontChoice(value: unknown): FontChoice | undefined {
  if (!isRecord(value)) return undefined;
  const regular = sanitizeFontFace(value);
  const family = typeof value.family === "string" ? value.family : "";
  if (regular === undefined || family.trim().length === 0) return undefined;
  const medium = sanitizeFontFace(value.medium);
  const bold = sanitizeFontFace(value.bold);
  return {
    ...regular,
    family,
    ...(medium === undefined ? {} : { medium }),
    ...(bold === undefined ? {} : { bold }),
  };
}

export function sanitizeFontPreferences(value: unknown): FontPreferences | undefined {
  if (!isRecord(value)) return undefined;
  const sans = sanitizeFontChoice(value.sans);
  const mono = sanitizeFontChoice(value.mono);
  if (sans === undefined && mono === undefined) return undefined;
  return {
    ...(sans === undefined ? {} : { sans }),
    ...(mono === undefined ? {} : { mono }),
  };
}

export function withFontChoice(
  fonts: FontPreferences | undefined,
  kind: keyof FontPreferences,
  choice: FontChoice | null,
): FontPreferences {
  const { [kind]: _replaced, ...rest } = fonts ?? {};
  return choice === null ? rest : { ...rest, [kind]: choice };
}
