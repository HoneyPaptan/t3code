#!/usr/bin/env node

import * as NodeFS from "node:fs";
import * as NodePath from "node:path";
import { formatHex, interpolate, parse, toGamut, type Color, type Rgb } from "culori";

import {
  DRAY_THEMES,
  DRAY_TOKENS,
  type DrayPalette,
  type DrayThemeId,
  type DrayToken,
} from "../src/lib/drayTokens.ts";

type Appearance = "light" | "dark";

type TokenSpec =
  | string
  | { readonly alias: DrayToken }
  | { readonly mix: readonly [first: DrayToken, second: DrayToken, firstShare: number] }
  | { readonly tint: readonly [token: DrayToken, alpha: number] };

type Ramp = Readonly<Record<DrayToken, TokenSpec>>;
type Overrides = Readonly<Partial<Record<DrayToken, TokenSpec>>>;

const GENERATED_PATH = NodePath.resolve(
  import.meta.dirname,
  "../src/lib/drayPalettes.generated.ts",
);

const DARK_RAMP: Ramp = {
  background: "oklch(0.145 0 0)",
  foreground: "oklch(0.985 0 0)",
  surfaceCard: "oklch(0.205 0 0)",
  surfaceRaised: "oklch(0.19 0 0)",
  muted: "oklch(0.269 0 0)",
  secondary: { alias: "muted" },
  surfaceSelected: { mix: ["foreground", "background", 0.15] },
  mutedForeground: "oklch(0.708 0 0)",
  primary: "oklch(0.922 0 0)",
  primaryForeground: "oklch(0.205 0 0)",
  buttonPrimary: { alias: "primary" },
  buttonPrimaryForeground: { alias: "primaryForeground" },
  buttonPrimaryHover: { mix: ["background", "buttonPrimary", 0.12] },
  ring: "oklch(0.556 0 0)",
  destructive: "oklch(0.704 0.191 22.216)",
  destructiveSurface: { tint: ["destructive", 0.14] },
  accentAdd: "oklch(0.7 0.15 163)",
  accentMerged: "oklch(0.63 0.23 304)",
  border: "oklch(1 0 0 / 10%)",
  input: "oklch(1 0 0 / 15%)",
  sidebarBorder: "oklch(1 0 0 / 8%)",
  hairline: "oklch(1 0 0 / 6%)",
  hairlineStrong: "oklch(1 0 0 / 8%)",
  accentThinking: "oklch(0.62 0.04 264)",
  accentCommand: "oklch(0.82 0.13 90)",
  accentCommandSurface: { tint: ["accentCommand", 0.14] },
  accentMention: "oklch(0.82 0.13 230)",
  accentMentionSurface: { tint: ["accentMention", 0.14] },
  accentIssue: "oklch(0.82 0.13 310)",
  accentSession: "oklch(0.82 0.13 160)",
  surfaceWell: "oklch(0 0 0 / 22%)",
  userBubble: { alias: "surfaceCard" },
  userBubbleForeground: { alias: "foreground" },
};

const LIGHT_RAMP: Ramp = {
  background: "oklch(0.965 0 0)",
  foreground: "oklch(0.22 0 0)",
  surfaceCard: "oklch(1 0 0)",
  surfaceRaised: "oklch(0.94 0 0)",
  muted: "oklch(0.92 0 0)",
  secondary: { alias: "surfaceCard" },
  surfaceSelected: { mix: ["foreground", "background", 0.1] },
  mutedForeground: "oklch(0.52 0 0)",
  primary: "oklch(0.28 0 0)",
  primaryForeground: "oklch(0.99 0 0)",
  buttonPrimary: { alias: "primary" },
  buttonPrimaryForeground: { alias: "primaryForeground" },
  buttonPrimaryHover: { mix: ["background", "buttonPrimary", 0.12] },
  ring: "oklch(0.62 0 0)",
  destructive: "oklch(0.55 0.2 25)",
  destructiveSurface: { tint: ["destructive", 0.12] },
  accentAdd: "oklch(0.585 0.174 163)",
  accentMerged: "oklch(0.56 0.2 304)",
  border: "oklch(0 0 0 / 10%)",
  input: "oklch(0 0 0 / 14%)",
  sidebarBorder: "oklch(0 0 0 / 8%)",
  hairline: "oklch(0 0 0 / 9%)",
  hairlineStrong: "oklch(0 0 0 / 13%)",
  accentThinking: "oklch(0.55 0.05 264)",
  accentCommand: "oklch(0.65 0.14 78)",
  accentCommandSurface: { tint: ["accentCommand", 0.12] },
  accentMention: "oklch(0.55 0.16 245)",
  accentMentionSurface: { tint: ["accentMention", 0.12] },
  accentIssue: "oklch(0.55 0.16 310)",
  accentSession: "oklch(0.55 0.16 160)",
  surfaceWell: "oklch(0 0 0 / 7%)",
  userBubble: { alias: "surfaceCard" },
  userBubbleForeground: { alias: "foreground" },
};

const RAMPS: Readonly<Record<Appearance, Ramp>> = { dark: DARK_RAMP, light: LIGHT_RAMP };

const PALETTE_OVERRIDES: Readonly<
  Record<DrayThemeId, Readonly<Partial<Record<Appearance, Overrides>>>>
> = {
  gruvbox: {
    dark: {
      background: "#1d2021",
      surfaceRaised: "#282828",
      surfaceCard: "#32302f",
      muted: "#3c3836",
      mutedForeground: "#a89984",
      foreground: "#ebdbb2",
      primary: "#ebdbb2",
      primaryForeground: "#1d2021",
      ring: "#7c6f64",
      destructive: "#fb4934",
      accentCommand: "#fabd2f",
      accentMention: "#83a598",
      accentThinking: "#928374",
    },
    light: {
      background: "#fbf1c7",
      surfaceRaised: "#f2e5bc",
      surfaceCard: "#f9f5d7",
      muted: "#ebdbb2",
      mutedForeground: "#7c6f64",
      foreground: "#3c3836",
      primary: "#3c3836",
      primaryForeground: "#fbf1c7",
      ring: "#7c6f64",
      destructive: "#9d0006",
      accentCommand: "#b57614",
      accentMention: "#076678",
      accentThinking: "#928374",
    },
  },
  default: {
    dark: {},
    light: {
      background: "oklch(0.965 0.012 250)",
      surfaceRaised: "oklch(0.94 0.01 250)",
      surfaceCard: "oklch(0.99 0.004 250)",
      muted: "oklch(0.92 0.01 250)",
      mutedForeground: "oklch(0.52 0.01 250)",
      foreground: "oklch(0.22 0.01 250)",
      primary: "oklch(0.65 0.17 250)",
      primaryForeground: "oklch(0.99 0 0)",
      buttonPrimary: "oklch(0.28 0.01 250)",
      buttonPrimaryForeground: { alias: "surfaceCard" },
      ring: { alias: "primary" },
      destructive: "oklch(0.55 0.2 25)",
      accentCommand: "oklch(0.65 0.14 78)",
      accentMention: "oklch(0.55 0.16 245)",
      accentThinking: "oklch(0.55 0.05 264)",
      surfaceSelected: "oklch(0.9 0.012 250)",
      userBubble: { alias: "primary" },
      userBubbleForeground: { alias: "primaryForeground" },
    },
  },
  catppuccin: {
    dark: {
      background: "#181825",
      surfaceRaised: "#1e1e2e",
      surfaceCard: "#313244",
      muted: "#45475a",
      mutedForeground: "#a6adc8",
      foreground: "#cdd6f4",
      primary: "#cdd6f4",
      primaryForeground: "#181825",
      ring: "#7f849c",
      destructive: "#f38ba8",
      accentCommand: "#f9e2af",
      accentMention: "#89b4fa",
      accentThinking: "#9399b2",
    },
    light: {
      background: "#e6e9ef",
      surfaceRaised: "#dce0e8",
      surfaceCard: "#eff1f5",
      muted: "#ccd0da",
      mutedForeground: "#6c6f85",
      foreground: "#4c4f69",
      primary: "#4c4f69",
      primaryForeground: "#eff1f5",
      ring: "#8c8fa1",
      destructive: "#d20f39",
      accentCommand: "#df8e1d",
      accentMention: "#1e66f5",
      accentThinking: "#8c8fa1",
    },
  },
  "one-dark-pro": {
    dark: {
      background: "#1e2227",
      surfaceRaised: "#23272e",
      surfaceCard: "#323842",
      muted: "#3e4452",
      mutedForeground: "#9da5b4",
      foreground: "#d7dae0",
      primary: "#d7dae0",
      primaryForeground: "#1e2227",
      ring: "#4d78cc",
      destructive: "#e06c75",
      accentCommand: "#e5c07b",
      accentMention: "#61afef",
      accentThinking: "#7f848e",
    },
  },
  cobalt2: {
    dark: {
      background: "#193549",
      surfaceRaised: "#243e51",
      surfaceCard: "#1f4662",
      muted: "#355166",
      mutedForeground: "#aaa",
      foreground: "#fff",
      primary: "#fff",
      primaryForeground: "#193549",
      ring: "#437da3",
      destructive: "#ff628c",
      accentCommand: "#ffc600",
      accentMention: "#9effff",
      accentThinking: "#0088ff",
    },
  },
};

const toSrgb = toGamut("rgb", "oklch");

const asRgb = (color: Color): Rgb => {
  const converted = toSrgb(color);
  return { ...converted, alpha: color.alpha ?? 1 } as Rgb;
};

const compositeOver = (foreground: Rgb, backdrop: Rgb): Rgb => {
  const alpha = foreground.alpha ?? 1;
  return {
    mode: "rgb",
    r: foreground.r * alpha + backdrop.r * (1 - alpha),
    g: foreground.g * alpha + backdrop.g * (1 - alpha),
    b: foreground.b * alpha + backdrop.b * (1 - alpha),
  };
};

const withAlpha = (color: Rgb, alpha: number): Rgb => ({ ...color, alpha });

const parseColor = (value: string): Color => {
  const parsed = parse(value);
  if (!parsed) throw new Error(`Unparseable colour ${value}.`);
  return parsed;
};

const resolvePalette = (ramp: Ramp, overrides: Overrides): DrayPalette => {
  const specs: Ramp = { ...ramp, ...overrides };
  const resolved = new Map<DrayToken, Rgb>();

  const background = (): Rgb => resolveToken("background");

  const resolveSpec = (spec: TokenSpec): Rgb => {
    if (typeof spec === "string") return compositeOpaque(asRgb(parseColor(spec)));
    if ("alias" in spec) return resolveToken(spec.alias);
    if ("tint" in spec) {
      return compositeOver(withAlpha(resolveToken(spec.tint[0]), spec.tint[1]), background());
    }
    const [first, second, firstShare] = spec.mix;
    return asRgb(interpolate([resolveToken(second), resolveToken(first)], "oklab")(firstShare));
  };

  const compositeOpaque = (color: Rgb): Rgb =>
    (color.alpha ?? 1) < 1 ? compositeOver(color, background()) : color;

  const resolveToken = (token: DrayToken): Rgb => {
    const cached = resolved.get(token);
    if (cached) return cached;
    const color = resolveSpec(specs[token]);
    resolved.set(token, color);
    return color;
  };

  return Object.fromEntries(
    DRAY_TOKENS.map((token) => [token, formatHex(resolveToken(token))]),
  ) as DrayPalette;
};

const resolveAllPalettes = () =>
  Object.fromEntries(
    DRAY_THEMES.map((theme) => [
      theme.id,
      Object.fromEntries(
        (["light", "dark"] as const).flatMap((appearance) => {
          const overrides = PALETTE_OVERRIDES[theme.id][appearance];
          return overrides
            ? [[appearance, resolvePalette(RAMPS[appearance], overrides)] as const]
            : [];
        }),
      ),
    ]),
  );

const renderKey = (key: string) => (/^[A-Za-z_$][\w$]*$/u.test(key) ? key : JSON.stringify(key));

const renderPalettesModule = (): string => {
  const themes = Object.entries(resolveAllPalettes())
    .map(([themeId, appearances]) => {
      const modes = Object.entries(appearances as Record<string, DrayPalette>)
        .map(([appearance, palette]) => {
          const tokens = Object.entries(palette)
            .map(([token, hex]) => `      ${renderKey(token)}: "${hex}",`)
            .join("\n");
          return `    ${appearance}: {\n${tokens}\n    },`;
        })
        .join("\n");
      return `  ${renderKey(themeId)}: {\n${modes}\n  },`;
    })
    .join("\n");
  return [
    'import type { DrayThemePalettes } from "./drayTokens.ts";',
    "",
    `export const DRAY_PALETTES: DrayThemePalettes = {\n${themes}\n};`,
    "",
  ].join("\n");
};

export const getGeneratedDrayPaletteOutputs = (): ReadonlyArray<
  readonly [filename: string, contents: string]
> => [[GENERATED_PATH, renderPalettesModule()]];

if (import.meta.main) {
  const checkOnly = process.argv.includes("--check");
  for (const [filename, contents] of getGeneratedDrayPaletteOutputs()) {
    const current = NodeFS.existsSync(filename) ? NodeFS.readFileSync(filename, "utf8") : null;
    if (current === contents) continue;
    if (checkOnly) {
      console.error(
        `${NodePath.relative(process.cwd(), filename)} is stale. Run vp run --filter @t3tools/mobile generate.`,
      );
      process.exitCode = 1;
      continue;
    }
    NodeFS.writeFileSync(filename, contents);
  }
}
