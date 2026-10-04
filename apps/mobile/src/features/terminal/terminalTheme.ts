import {
  flattenThemeColor,
  type MobileThemeId,
  type MobileThemeVariables,
} from "../../lib/mobileTheme";
import { getMobileThemeRuntimeVariables } from "../../lib/mobileThemeVariables";

export type TerminalAppearanceScheme = "light" | "dark";

export interface TerminalTheme {
  readonly background: string;
  readonly foreground: string;
  readonly mutedForeground: string;
  readonly border: string;
  readonly cursorForeground: string;
  readonly cursorBackground: string;
  readonly palette: TerminalPalette;
}

type TerminalPalette = readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

const PIERRE_LIGHT_PALETTE: TerminalPalette = [
  "#1F1F21",
  "#ff2e3f",
  "#0dbe4e",
  "#ffca00",
  "#009fff",
  "#c635e4",
  "#08c0ef",
  "#c6c6c8",
  "#1F1F21",
  "#ff2e3f",
  "#0dbe4e",
  "#ffca00",
  "#009fff",
  "#c635e4",
  "#08c0ef",
  "#c6c6c8",
];

const PIERRE_DARK_PALETTE: TerminalPalette = [
  "#141415",
  "#ff2e3f",
  "#0dbe4e",
  "#ffca00",
  "#009fff",
  "#c635e4",
  "#08c0ef",
  "#c6c6c8",
  "#141415",
  "#ff2e3f",
  "#0dbe4e",
  "#ffca00",
  "#009fff",
  "#c635e4",
  "#08c0ef",
  "#c6c6c8",
];

const PIERRE_PALETTES: Readonly<Record<TerminalAppearanceScheme, TerminalPalette>> = {
  light: PIERRE_LIGHT_PALETTE,
  dark: PIERRE_DARK_PALETTE,
};

const GRUVBOX_DARK_PALETTE: TerminalPalette = [
  "#282828",
  "#cc241d",
  "#98971a",
  "#d79921",
  "#458588",
  "#b16286",
  "#689d6a",
  "#a89984",
  "#928374",
  "#fb4934",
  "#b8bb26",
  "#fabd2f",
  "#83a598",
  "#d3869b",
  "#8ec07c",
  "#ebdbb2",
];

const GRUVBOX_LIGHT_PALETTE: TerminalPalette = [
  "#3c3836",
  "#cc241d",
  "#98971a",
  "#d79921",
  "#458588",
  "#b16286",
  "#689d6a",
  "#a89984",
  "#7c6f64",
  "#9d0006",
  "#79740e",
  "#b57614",
  "#076678",
  "#8f3f71",
  "#427b58",
  "#928374",
];

const CATPPUCCIN_DARK_PALETTE: TerminalPalette = [
  "#45475a",
  "#f38ba8",
  "#a6e3a1",
  "#f9e2af",
  "#89b4fa",
  "#f5c2e7",
  "#94e2d5",
  "#bac2de",
  "#585b70",
  "#f38ba8",
  "#a6e3a1",
  "#f9e2af",
  "#89b4fa",
  "#f5c2e7",
  "#94e2d5",
  "#a6adc8",
];

const CATPPUCCIN_LIGHT_PALETTE: TerminalPalette = [
  "#5c5f77",
  "#d20f39",
  "#40a02b",
  "#df8e1d",
  "#1e66f5",
  "#ea76cb",
  "#179299",
  "#acb0be",
  "#6c6f85",
  "#d20f39",
  "#40a02b",
  "#df8e1d",
  "#1e66f5",
  "#ea76cb",
  "#179299",
  "#bcc0cc",
];

const ONE_DARK_PRO_PALETTE: TerminalPalette = [
  "#3f4451",
  "#e06c75",
  "#98c379",
  "#e5c07b",
  "#61afef",
  "#c678dd",
  "#56b6c2",
  "#abb2bf",
  "#4f5666",
  "#ff616e",
  "#a5e075",
  "#f0a45d",
  "#4dc4ff",
  "#de73ff",
  "#4cd1e0",
  "#e6e6e6",
];

const COBALT2_PALETTE: TerminalPalette = [
  "#000000",
  "#ff0000",
  "#38de21",
  "#ffe50a",
  "#1460d2",
  "#ff005d",
  "#00bbbb",
  "#bbbbbb",
  "#555555",
  "#f40e17",
  "#3bd01d",
  "#edc809",
  "#5555ff",
  "#ff55ff",
  "#6ae3fa",
  "#ffffff",
];

const ANSI_PALETTES: Readonly<
  Partial<Record<MobileThemeId, Readonly<Record<TerminalAppearanceScheme, TerminalPalette>>>>
> = {
  gruvbox: { light: GRUVBOX_LIGHT_PALETTE, dark: GRUVBOX_DARK_PALETTE },
  catppuccin: { light: CATPPUCCIN_LIGHT_PALETTE, dark: CATPPUCCIN_DARK_PALETTE },
  "one-dark-pro": { light: ONE_DARK_PRO_PALETTE, dark: ONE_DARK_PRO_PALETTE },
  cobalt2: { light: COBALT2_PALETTE, dark: COBALT2_PALETTE },
};

function getAnsiPalette(themeId: MobileThemeId, scheme: TerminalAppearanceScheme): TerminalPalette {
  return (ANSI_PALETTES[themeId] ?? PIERRE_PALETTES)[scheme];
}

function getThemeVariables(
  themeId: MobileThemeId,
  scheme: TerminalAppearanceScheme,
): MobileThemeVariables {
  return getMobileThemeRuntimeVariables(themeId, scheme, "android");
}

export function getMobileTerminalTheme(
  themeId: MobileThemeId,
  scheme: TerminalAppearanceScheme,
  variables: MobileThemeVariables = getThemeVariables(themeId, scheme),
): TerminalTheme {
  const background = variables["--color-screen"];
  return {
    background,
    foreground: flattenThemeColor(variables["--color-foreground"], background),
    mutedForeground: flattenThemeColor(variables["--color-foreground-muted"], background),
    border: variables["--color-border"],
    cursorForeground: flattenThemeColor(variables["--color-primary"], background),
    cursorBackground: background,
    palette: getAnsiPalette(themeId, scheme),
  };
}

export function buildGhosttyThemeConfig(theme: TerminalTheme): string {
  const lines = [
    `background = ${theme.background}`,
    `foreground = ${theme.foreground}`,
    `cursor-color = ${theme.cursorForeground}`,
    `cursor-text = ${theme.cursorBackground}`,
  ];

  for (const [index, color] of theme.palette.entries()) {
    lines.push(`palette = ${index}=${color}`);
  }

  return `${lines.join("\n")}\n`;
}
