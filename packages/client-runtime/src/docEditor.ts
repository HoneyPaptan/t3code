export const DOC_EDITOR_PAGE_PATH = "/doc-editor.html";

export type DocEditorHostMessage =
  | { readonly type: "load"; readonly markdown: string; readonly plain: boolean }
  | { readonly type: "setPlain"; readonly plain: boolean };

export type DocEditorPageMessage =
  | { readonly type: "ready" }
  | { readonly type: "change"; readonly markdown: string }
  | { readonly type: "plainChanged"; readonly plain: boolean };

export interface DocEditorPageTheme {
  readonly background: string;
  readonly foreground: string;
  readonly muted: string;
  readonly border: string;
  readonly accent: string;
}

const THEME_KEYS = ["background", "foreground", "muted", "border", "accent"] as const;

export const isDocEditablePath = (path: string): boolean =>
  /\.(?:md|mdx|markdown|txt)$/i.test(path);

export const isPlainTextDocPath = (path: string): boolean => !/\.(?:md|mdx|markdown)$/i.test(path);

export function docEditorPageUrl(httpBaseUrl: string, theme?: DocEditorPageTheme): string {
  const url = new URL(DOC_EDITOR_PAGE_PATH, httpBaseUrl);
  if (theme) for (const key of THEME_KEYS) url.searchParams.set(key, theme[key]);
  return url.toString();
}

export function readDocEditorPageTheme(search: string): Partial<DocEditorPageTheme> {
  const params = new URLSearchParams(search);
  const theme: Partial<Record<(typeof THEME_KEYS)[number], string>> = {};
  for (const key of THEME_KEYS) {
    const value = params.get(key);
    if (value && /^[#a-z0-9(),.%\s-]{1,64}$/i.test(value)) theme[key] = value;
  }
  return theme;
}

function parseJsonObject(raw: unknown): Record<string, unknown> | null {
  if (typeof raw !== "string") return null;
  try {
    const value: unknown = JSON.parse(raw);
    return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function parseDocEditorHostMessage(raw: unknown): DocEditorHostMessage | null {
  const value = parseJsonObject(raw);
  if (value?.type === "load" && typeof value.markdown === "string") {
    return { type: "load", markdown: value.markdown, plain: value.plain === true };
  }
  if (value?.type === "setPlain") return { type: "setPlain", plain: value.plain === true };
  return null;
}

export function parseDocEditorPageMessage(raw: unknown): DocEditorPageMessage | null {
  const value = parseJsonObject(raw);
  if (value?.type === "ready") return { type: "ready" };
  if (value?.type === "change" && typeof value.markdown === "string") {
    return { type: "change", markdown: value.markdown };
  }
  if (value?.type === "plainChanged") return { type: "plainChanged", plain: value.plain === true };
  return null;
}

export function newDocRelativePath(input: string): string | null {
  const path = input
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\.?\/+/, "")
    .replace(/\/{2,}/g, "/");
  if (!path || path.endsWith("/") || path.split("/").some((part) => part === "..")) return null;
  const name = path.slice(path.lastIndexOf("/") + 1);
  return name.includes(".") ? path : `${path}.md`;
}

export function newDocContents(relativePath: string): string {
  if (isPlainTextDocPath(relativePath)) return "";
  const name = relativePath.slice(relativePath.lastIndexOf("/") + 1).replace(/\.[^.]+$/, "");
  return `# ${name.replace(/[-_]+/g, " ").trim() || "Untitled"}\n\n`;
}
