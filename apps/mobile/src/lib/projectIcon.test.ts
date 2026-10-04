import { describe, expect, it } from "vite-plus/test";

import { projectChipColor, projectMonogram, resolveProjectChipGlyph } from "./projectIcon";

describe("resolveProjectChipGlyph", () => {
  it("derives a two letter monogram with a stable colour from the project title", () => {
    const first = resolveProjectChipGlyph(null, "Dizzaract OS");
    const second = resolveProjectChipGlyph(undefined, "Dizzaract OS");
    expect(first).toEqual(second);
    expect(first.kind).toBe("monogram");
    if (first.kind === "monogram") expect(first.text).toHaveLength(2);
  });

  it("keeps an explicit emoji icon", () => {
    expect(resolveProjectChipGlyph({ kind: "emoji", emoji: "🚀" }, "Anything")).toEqual({
      kind: "emoji",
      emoji: "🚀",
    });
  });

  it("keeps the colour of an explicit monogram icon", () => {
    expect(
      resolveProjectChipGlyph({ kind: "monogram", text: "ZZ", color: "rose" }, "Anything"),
    ).toEqual({ kind: "monogram", text: "ZZ", color: "rose" });
  });

  it("spreads different projects across more than one colour", () => {
    const colours = new Set(
      ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot", "golf"].map((title) => {
        const glyph = resolveProjectChipGlyph(null, title);
        return glyph.kind === "monogram" ? glyph.color : "emoji";
      }),
    );
    expect(colours.size).toBeGreaterThan(1);
  });
});

describe("projectChipColor", () => {
  it("ignores case and surrounding whitespace so the colour matches web", () => {
    expect(projectChipColor("  Dizzaract OS ")).toBe(projectChipColor("dizzaract os"));
  });

  it("falls back to a stable colour for an empty title", () => {
    expect(projectChipColor("   ")).toBe(projectChipColor(""));
  });
});

describe("projectMonogram", () => {
  it.each([
    ["Dizzaract OS", "DO"],
    ["t3code", "T3"],
    ["synara", "SA"],
    ["   ", "PR"],
    ["éclair", "ÉR"],
  ])("derives %s as %s", (title, monogram) => {
    expect(projectMonogram(title)).toBe(monogram);
  });

  it("always yields upper case text of at most two letters", () => {
    for (const title of ["a", "ab cd ef", "x-y-z", "123", "日本語プロジェクト"]) {
      const text = projectMonogram(title);
      expect(text).toBe(text.toUpperCase());
      expect(Array.from(text).length).toBeLessThanOrEqual(2);
    }
  });
});
