import { describe, expect, it } from "vitest";
import * as Schema from "effect/Schema";

import { AssetResource } from "./assets.ts";
import { ServerFont, ServerFontId } from "./fonts.ts";

describe("server fonts contract", () => {
  it("accepts a sixteen character lowercase hex font id", () => {
    expect(Schema.decodeUnknownSync(ServerFontId)("0123456789abcdef")).toBe("0123456789abcdef");
  });

  it("rejects ids that could carry a path", () => {
    for (const bad of ["../../etc/passwd", "0123456789ABCDEF", "short", "/usr/share/fonts/a.ttf"]) {
      expect(() => Schema.decodeUnknownSync(ServerFontId)(bad)).toThrow();
    }
  });

  it("decodes the server-font asset resource", () => {
    const resource = Schema.decodeUnknownSync(AssetResource)({
      _tag: "server-font",
      fontId: "0123456789abcdef",
    });
    expect(resource._tag).toBe("server-font");
  });

  it("rejects formats other than ttf and otf", () => {
    expect(() =>
      Schema.decodeUnknownSync(ServerFont)({
        fontId: "0123456789abcdef",
        family: "A",
        style: "Regular",
        weight: 400,
        italic: false,
        format: "woff2",
        fileName: "a.woff2",
      }),
    ).toThrow();
  });
});
