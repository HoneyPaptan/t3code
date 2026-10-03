import type { ThemeAppearance, ThemeColorRole, ThemeColors } from "@t3tools/shared/themePalettes";

export const DRAY_THEMES = [
  { id: "gruvbox", label: "Gruvbox", darkOnly: false },
  { id: "default", label: "Dray", darkOnly: false },
  { id: "catppuccin", label: "Catppuccin", darkOnly: false },
  { id: "one-dark-pro", label: "One Dark Pro", darkOnly: true },
  { id: "cobalt2", label: "Cobalt2", darkOnly: true },
] as const;

export type DrayThemeId = (typeof DRAY_THEMES)[number]["id"];
export const DRAY_THEME_IDS = DRAY_THEMES.map((theme) => theme.id);

export const DRAY_TOKENS = [
  "background",
  "surfaceRaised",
  "surfaceCard",
  "muted",
  "secondary",
  "mutedForeground",
  "foreground",
  "primary",
  "primaryForeground",
  "buttonPrimary",
  "buttonPrimaryForeground",
  "buttonPrimaryHover",
  "ring",
  "destructive",
  "destructiveSurface",
  "accentAdd",
  "accentMerged",
  "accentCommand",
  "accentCommandSurface",
  "accentMention",
  "accentMentionSurface",
  "accentThinking",
  "accentIssue",
  "accentSession",
  "border",
  "input",
  "sidebarBorder",
  "hairline",
  "hairlineStrong",
  "surfaceSelected",
  "surfaceWell",
  "userBubble",
  "userBubbleForeground",
] as const;

export type DrayToken = (typeof DRAY_TOKENS)[number];
export type DrayPalette = Readonly<Record<DrayToken, string>>;
export type DrayThemePalettes = Readonly<
  Record<DrayThemeId, Readonly<Partial<Record<ThemeAppearance, DrayPalette>>>>
>;

export const DRAY_ROLE_MAP: Readonly<Record<ThemeColorRole, DrayToken>> = {
  canvas: "background",
  chrome: "background",
  toolbar: "background",
  toolbarForeground: "foreground",
  toolbarBorder: "hairline",
  toolbarControl: "surfaceCard",
  toolbarControlForeground: "foreground",
  toolbarControlHover: "muted",
  surface: "surfaceCard",
  surfaceRaised: "surfaceRaised",
  surfaceOverlay: "surfaceCard",
  text: "foreground",
  textMuted: "mutedForeground",
  border: "border",
  input: "input",
  focus: "ring",
  accent: "accentCommand",
  accentForeground: "primaryForeground",
  secondary: "secondary",
  secondaryForeground: "foreground",
  muted: "muted",
  mutedForeground: "mutedForeground",
  placeholder: "mutedForeground",
  secondaryLabel: "mutedForeground",
  iconMuted: "mutedForeground",
  error: "destructive",
  errorForeground: "destructive",
  errorSurface: "destructiveSurface",
  warning: "accentCommand",
  warningForeground: "accentCommand",
  warningSurface: "accentCommandSurface",
  update: "accentMention",
  updateForeground: "accentMention",
  updateSurface: "accentMentionSurface",
  accentSurface: "accentCommandSurface",
  accentSurfaceForeground: "accentCommand",
  messageSurface: "userBubble",
  messageForeground: "userBubbleForeground",
  messageAction: "buttonPrimary",
  messageActionForeground: "buttonPrimaryForeground",
  messageActionHover: "buttonPrimaryHover",
  codeBackground: "surfaceRaised",
  codeForeground: "foreground",
  sidebar: "surfaceRaised",
  sidebarForeground: "foreground",
  sidebarMutedForeground: "mutedForeground",
  sidebarControlSurface: "surfaceCard",
  sidebarRowHover: "muted",
  sidebarRowActive: "surfaceSelected",
  sidebarRowSelected: "surfaceSelected",
  sidebarBorder: "sidebarBorder",
  terminalBackground: "background",
  terminalForeground: "foreground",
  terminalCursor: "foreground",
  terminalSelection: "surfaceSelected",
  terminalScrollbar: "muted",
  terminalScrollbarHover: "ring",
};

export function drayPaletteToThemeColors(palette: DrayPalette): ThemeColors {
  return Object.fromEntries(
    Object.entries(DRAY_ROLE_MAP).map(([role, token]) => [role, palette[token]]),
  ) as ThemeColors;
}
