import { describe, expect, it } from "vite-plus/test";

import { DEFAULT_FONT_FAMILY_NAMES } from "./fontFamilyStore";
import {
  createMobileThemeRuntimeOperations,
  getMobileUniwindThemeName,
  type MobileThemeRuntimeState,
} from "./mobileThemeRuntime";

const initialState: MobileThemeRuntimeState = {
  baseFontSize: 16,
  fontFamilies: DEFAULT_FONT_FAMILY_NAMES,
  themeAppearance: "light",
  themeMode: "system",
};

describe("mobileThemeRuntime", () => {
  it("keeps the default palette on Uniwind's built-in appearance themes", () => {
    expect(getMobileUniwindThemeName("t3-code", "light")).toBe("light");
    expect(getMobileUniwindThemeName("t3-code", "dark")).toBe("dark");
  });

  it("maps custom palettes and appearances to registered themes", () => {
    expect(getMobileUniwindThemeName("t3-chat", "dark")).toBe("t3-chat-dark");
  });

  it("hydrates text variables and clears the native appearance override", () => {
    const operations = createMobileThemeRuntimeOperations(null, initialState);
    const variableOperations = operations.filter(
      (operation) => operation.kind === "update-text-variables",
    );

    expect(variableOperations).toHaveLength(22);
    expect(variableOperations.at(-1)?.themeName).toBe("cobalt2-dark");
    expect(operations.at(-1)).toEqual({
      kind: "set-appearance-mode",
      appearance: "light",
      themeMode: "system",
    });
  });

  it("leaves the stylesheet fonts alone while the defaults are active", () => {
    const operations = createMobileThemeRuntimeOperations(null, initialState);

    expect(operations.some((operation) => operation.kind === "update-font-variables")).toBe(false);
  });

  it("swaps font variables for every theme when a server font becomes active", () => {
    const fontFamilies = {
      ...DEFAULT_FONT_FAMILY_NAMES,
      regular: "ServerFont-a",
      bold: "ServerFont-b",
    };
    const operations = createMobileThemeRuntimeOperations(initialState, {
      ...initialState,
      fontFamilies,
    });

    expect(operations).toHaveLength(22);
    expect(operations[0]).toEqual({
      kind: "update-font-variables",
      themeName: "light",
      variables: {
        "--font-sans": "ServerFont-a",
        "--font-medium": "Geist-Medium",
        "--font-bold": "ServerFont-b",
        "--font-mono": "GeistMono-Regular",
      },
    });
  });

  it("lets system appearance changes flow through the root ScopedTheme only", () => {
    const operations = createMobileThemeRuntimeOperations(initialState, {
      ...initialState,
      themeAppearance: "dark",
    });

    expect(operations).toEqual([]);
  });

  it("updates native appearance once when the selected mode changes", () => {
    const operations = createMobileThemeRuntimeOperations(initialState, {
      ...initialState,
      themeAppearance: "dark",
      themeMode: "dark",
    });

    expect(operations).toEqual([
      {
        kind: "set-appearance-mode",
        appearance: "dark",
        themeMode: "dark",
      },
    ]);
  });

  it("updates text variables for every theme without switching palettes", () => {
    const operations = createMobileThemeRuntimeOperations(initialState, {
      ...initialState,
      baseFontSize: 18,
    });

    expect(operations).toHaveLength(22);
    expect(operations.every((operation) => operation.kind === "update-text-variables")).toBe(true);
    expect(operations.at(-1)).toMatchObject({
      kind: "update-text-variables",
      themeName: "cobalt2-dark",
    });
  });

  it("does no native work when persistence echoes an already-applied state", () => {
    expect(createMobileThemeRuntimeOperations(initialState, initialState)).toEqual([]);
  });
});
