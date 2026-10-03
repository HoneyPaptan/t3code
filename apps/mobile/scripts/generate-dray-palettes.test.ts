import * as NodeFS from "node:fs";
import * as NodePath from "node:path";
import { describe, expect, it } from "vite-plus/test";

import { getGeneratedDrayPaletteOutputs } from "./generate-dray-palettes.mts";

describe("generate Dray palettes", () => {
  it("keeps the committed hex palettes current", () => {
    const staleOutputs = getGeneratedDrayPaletteOutputs()
      .filter(
        ([filename, contents]) =>
          !NodeFS.existsSync(filename) || NodeFS.readFileSync(filename, "utf8") !== contents,
      )
      .map(([filename]) => NodePath.relative(import.meta.dirname, filename));

    expect(
      staleOutputs,
      "Run `vp run --filter @t3tools/mobile generate` and commit the generated outputs.",
    ).toEqual([]);
  });
});
