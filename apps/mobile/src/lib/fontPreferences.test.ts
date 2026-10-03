import { describe, expect, it } from "vitest";

import { sanitizeFontPreferences } from "./fontPreferences";

const FONT_ID = "0123456789abcdef";
const BOLD_ID = "fedcba9876543210";

describe("sanitizeFontPreferences", () => {
  it("keeps valid choices with their medium and bold faces", () => {
    const sans = {
      fontId: FONT_ID,
      format: "ttf",
      family: "Inter",
      bold: { fontId: BOLD_ID, format: "otf" },
    };
    const mono = { fontId: BOLD_ID, format: "otf", family: "Fira Code" };
    expect(sanitizeFontPreferences({ sans, mono })).toEqual({ sans, mono });
  });

  it("drops a malformed face but keeps the choice", () => {
    expect(
      sanitizeFontPreferences({
        sans: {
          fontId: FONT_ID,
          format: "ttf",
          family: "Inter",
          medium: { fontId: "../etc/passwd", format: "ttf" },
          bold: { fontId: BOLD_ID, format: "woff" },
        },
      }),
    ).toEqual({ sans: { fontId: FONT_ID, format: "ttf", family: "Inter" } });
  });

  it("drops a choice with a malformed font id or format", () => {
    expect(
      sanitizeFontPreferences({
        sans: { fontId: "../etc/passwd", format: "ttf", family: "Inter" },
        mono: { fontId: FONT_ID, format: "ttf", family: "Fira Code" },
      }),
    ).toEqual({ mono: { fontId: FONT_ID, format: "ttf", family: "Fira Code" } });
    expect(
      sanitizeFontPreferences({ sans: { fontId: FONT_ID, format: "ttc", family: "Inter" } }),
    ).toBeUndefined();
  });

  it("drops a choice with a blank or non string family", () => {
    expect(
      sanitizeFontPreferences({ sans: { fontId: FONT_ID, format: "ttf", family: "  " } }),
    ).toBeUndefined();
    expect(
      sanitizeFontPreferences({ sans: { fontId: FONT_ID, format: "ttf", family: 4 } }),
    ).toBeUndefined();
  });

  it("rejects non object values", () => {
    expect(sanitizeFontPreferences(null)).toBeUndefined();
    expect(sanitizeFontPreferences("Inter")).toBeUndefined();
    expect(sanitizeFontPreferences([])).toBeUndefined();
    expect(sanitizeFontPreferences({})).toBeUndefined();
  });
});
