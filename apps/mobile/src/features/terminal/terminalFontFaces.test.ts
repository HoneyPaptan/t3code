import { describe, expect, it, vi } from "vite-plus/test";

import type { FontChoice, FontFace } from "../../lib/fontPreferences";

vi.mock("expo-file-system", () => ({ Directory: class {}, File: class {}, Paths: {} }));
vi.mock("expo-font", () => ({ loadAsync: vi.fn(), isLoaded: vi.fn() }));

import { resolveTerminalFontFaces } from "./terminalFontFaces";

const REGULAR: FontFace = { fontId: "0123456789abcdef", format: "ttf" };
const BOLD: FontFace = { fontId: "fedcba9876543210", format: "otf" };
const CHOICE: FontChoice = { ...REGULAR, family: "JetBrains Mono" };

const downloaded = (face: FontFace) => `/cache/fonts/${face.fontId}.${face.format}`;
const nothingDownloaded = () => null;

describe("resolveTerminalFontFaces", () => {
  it("returns null while the default bundled font is in use", () => {
    expect(
      resolveTerminalFontFaces({
        choice: undefined,
        activeMonoName: "GeistMono-Regular",
        facePath: downloaded,
      }),
    ).toBeNull();
  });

  it("returns null until the chosen face is registered as the active mono font", () => {
    expect(
      resolveTerminalFontFaces({
        choice: CHOICE,
        activeMonoName: "GeistMono-Regular",
        facePath: downloaded,
      }),
    ).toBeNull();
  });

  it("returns null when the chosen face file is missing", () => {
    expect(
      resolveTerminalFontFaces({
        choice: CHOICE,
        activeMonoName: "ServerFont-0123456789abcdef",
        facePath: nothingDownloaded,
      }),
    ).toBeNull();
  });

  it("returns the regular path and no bold path for a regular only choice", () => {
    expect(
      resolveTerminalFontFaces({
        choice: CHOICE,
        activeMonoName: "ServerFont-0123456789abcdef",
        facePath: downloaded,
      }),
    ).toEqual({ regularPath: "/cache/fonts/0123456789abcdef.ttf", boldPath: null });
  });

  it("returns both paths when the choice carries a bold face", () => {
    expect(
      resolveTerminalFontFaces({
        choice: { ...CHOICE, bold: BOLD },
        activeMonoName: "ServerFont-0123456789abcdef",
        facePath: downloaded,
      }),
    ).toEqual({
      regularPath: "/cache/fonts/0123456789abcdef.ttf",
      boldPath: "/cache/fonts/fedcba9876543210.otf",
    });
  });
});
