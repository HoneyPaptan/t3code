import type { ServerFont } from "@t3tools/contracts";
import { describe, expect, it } from "vite-plus/test";

import { findServerFontFamily, listServerFontFamilies } from "./serverFonts";

let nextFontId = 0;

function face(family: string, weight: number, italic = false): ServerFont {
  nextFontId += 1;
  return {
    fontId: nextFontId.toString(16).padStart(16, "0") as ServerFont["fontId"],
    family,
    style: italic ? "Italic" : "Regular",
    weight,
    italic,
    format: "ttf",
    fileName: `${family}.ttf`,
  };
}

describe("listServerFontFamilies", () => {
  it("groups faces by family, sorted by name with weights ascending", () => {
    const families = listServerFontFamilies([
      face("Zed Mono", 700),
      face("Inter", 400, true),
      face("Inter", 400),
      face("Inter", 700),
      face("Zed Mono", 400),
    ]);

    expect(families.map((entry) => entry.family)).toEqual(["Inter", "Zed Mono"]);
    expect(families[0]?.faces.map((entry) => [entry.weight, entry.italic])).toEqual([
      [400, false],
      [400, true],
      [700, false],
    ]);
    expect(families[1]?.faces.map((entry) => entry.weight)).toEqual([400, 700]);
  });

  it("returns no families for an empty catalog", () => {
    expect(listServerFontFamilies([])).toEqual([]);
  });
});

describe("findServerFontFamily", () => {
  const families = listServerFontFamilies([face("JetBrains Mono", 400), face("Inter", 400)]);

  it("matches a configured family name ignoring case, quotes and whitespace", () => {
    expect(findServerFontFamily(families, ' "jetbrains mono" ')?.family).toBe("JetBrains Mono");
    expect(findServerFontFamily(families, "Inter")?.family).toBe("Inter");
  });

  it("returns null for an unset or unknown family", () => {
    expect(findServerFontFamily(families, "")).toBeNull();
    expect(findServerFontFamily(families, "Menlo")).toBeNull();
  });
});
