import { describe, expect, it } from "vite-plus/test";

import { fitWithinSide, isStorableBackgroundPicture } from "./backgroundPicture";

describe("fitWithinSide", () => {
  it("keeps pictures that already fit", () => {
    expect(fitWithinSide(1200, 800)).toEqual({ width: 1200, height: 800 });
  });

  it("scales the longest side down and keeps the aspect ratio", () => {
    expect(fitWithinSide(4000, 3000)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithinSide(1000, 5000, 500)).toEqual({ width: 100, height: 500 });
  });

  it("never returns an empty side", () => {
    expect(fitWithinSide(10000, 1)).toEqual({ width: 1600, height: 1 });
    expect(fitWithinSide(0, 0)).toEqual({ width: 1, height: 1 });
  });
});

describe("isStorableBackgroundPicture", () => {
  it("accepts an image data URL within the cap", () => {
    expect(isStorableBackgroundPicture("data:image/jpeg;base64,AAAA")).toBe(true);
  });

  it("rejects anything that is not an image data URL", () => {
    expect(isStorableBackgroundPicture("https://example.com/a.jpg")).toBe(false);
    expect(isStorableBackgroundPicture("data:text/plain;base64,AAAA")).toBe(false);
  });

  it("rejects pictures above the storage cap", () => {
    expect(isStorableBackgroundPicture(`data:image/jpeg;base64,${"A".repeat(3_500_000)}`)).toBe(
      false,
    );
  });
});
