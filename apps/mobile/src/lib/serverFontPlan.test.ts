import type { ServerFont } from "@t3tools/contracts";
import { describe, expect, it } from "vite-plus/test";

import { filterFontFamilies, listFontFamilies, planFontChoice } from "./serverFontPlan";

function font(
  fontId: string,
  family: string,
  weight: number,
  overrides: Partial<ServerFont> = {},
): ServerFont {
  return {
    fontId,
    family,
    style: "Regular",
    weight,
    italic: false,
    format: "ttf",
    fileName: `${fontId}.ttf`,
    ...overrides,
  } as ServerFont;
}

const INTER_ITALIC = font("a000000000000001", "Inter", 400, { italic: true });
const INTER_BOLD = font("a000000000000002", "Inter", 700);
const INTER_REGULAR = font("a000000000000003", "Inter", 400);
const INTER_MEDIUM = font("a000000000000004", "Inter", 500, { format: "otf" });
const FIRA = font("b000000000000001", "Fira Code", 300);
const ZILLA = font("c000000000000001", "Zilla Slab", 400);
const ALL = [INTER_ITALIC, INTER_BOLD, INTER_REGULAR, INTER_MEDIUM, ZILLA, FIRA];

describe("listFontFamilies", () => {
  it("collapses faces into one sorted entry per family", () => {
    expect(listFontFamilies(ALL).map((entry) => entry.family)).toEqual([
      "Fira Code",
      "Inter",
      "Zilla Slab",
    ]);
  });

  it("represents a family by its upright face nearest to regular", () => {
    const inter = listFontFamilies(ALL).find((entry) => entry.family === "Inter");
    expect(inter?.regular.fontId).toBe(INTER_REGULAR.fontId);
  });

  it("falls back to an italic face when a family has no upright one", () => {
    const [entry] = listFontFamilies([INTER_ITALIC]);
    expect(entry?.regular.fontId).toBe(INTER_ITALIC.fontId);
  });
});

describe("filterFontFamilies", () => {
  const entries = listFontFamilies(ALL);

  it("matches a case insensitive substring", () => {
    expect(filterFontFamilies(entries, "  CODE ").map((entry) => entry.family)).toEqual([
      "Fira Code",
    ]);
  });

  it("returns every family for a blank query", () => {
    expect(filterFontFamilies(entries, "  ")).toHaveLength(3);
  });
});

describe("planFontChoice", () => {
  const inter = listFontFamilies(ALL).find((entry) => entry.family === "Inter")!;

  it("maps medium and bold faces when the family ships them", () => {
    expect(planFontChoice(ALL, inter, true)).toEqual({
      fontId: INTER_REGULAR.fontId,
      format: "ttf",
      family: "Inter",
      medium: { fontId: INTER_MEDIUM.fontId, format: "otf" },
      bold: { fontId: INTER_BOLD.fontId, format: "ttf" },
    });
  });

  it("leaves styles unset for a family without them", () => {
    const zilla = listFontFamilies(ALL).find((entry) => entry.family === "Zilla Slab")!;
    expect(planFontChoice(ALL, zilla, true)).toEqual({
      fontId: ZILLA.fontId,
      format: "ttf",
      family: "Zilla Slab",
    });
  });

  it("skips styles entirely when asked for a regular only choice", () => {
    expect(planFontChoice(ALL, inter, false)).toEqual({
      fontId: INTER_REGULAR.fontId,
      format: "ttf",
      family: "Inter",
    });
  });
});
