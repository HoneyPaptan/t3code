import { describe, expect, it } from "vite-plus/test";

import {
  backgroundPictureBlurRadius,
  resolveBackgroundPictureLook,
  sanitizeBackgroundPictureBlur,
  sanitizeBackgroundPictureStrength,
  sanitizeBackgroundPictureUri,
} from "./backgroundPicture";

describe("background picture preferences", () => {
  it("clamps strength and blur into the shared ranges", () => {
    expect(sanitizeBackgroundPictureStrength(5)).toBe(10);
    expect(sanitizeBackgroundPictureStrength(95)).toBe(90);
    expect(sanitizeBackgroundPictureStrength(42.6)).toBe(43);
    expect(sanitizeBackgroundPictureBlur(-3)).toBe(0);
    expect(sanitizeBackgroundPictureBlur(60)).toBe(40);
  });

  it("drops values that are not finite numbers", () => {
    expect(sanitizeBackgroundPictureStrength("50")).toBeUndefined();
    expect(sanitizeBackgroundPictureStrength(Number.NaN)).toBeUndefined();
    expect(sanitizeBackgroundPictureBlur(Number.POSITIVE_INFINITY)).toBeUndefined();
  });

  it("keeps only local file pictures and an explicit removal", () => {
    expect(sanitizeBackgroundPictureUri("file:///data/user/0/app/files/a.jpg")).toBe(
      "file:///data/user/0/app/files/a.jpg",
    );
    expect(sanitizeBackgroundPictureUri(null)).toBeNull();
    expect(sanitizeBackgroundPictureUri("https://example.com/a.jpg")).toBeUndefined();
    expect(sanitizeBackgroundPictureUri(7)).toBeUndefined();
  });

  it("falls back to the shared defaults", () => {
    expect(resolveBackgroundPictureLook({})).toEqual({ strength: 30, blur: 0 });
    expect(
      resolveBackgroundPictureLook({ backgroundPictureStrength: 70, backgroundPictureBlur: 12 }),
    ).toEqual({ strength: 70, blur: 12 });
  });

  it("maps the blur range onto the Android blur radius cap", () => {
    expect(backgroundPictureBlurRadius(0)).toBe(0);
    expect(backgroundPictureBlurRadius(20)).toBe(13);
    expect(backgroundPictureBlurRadius(40)).toBe(25);
  });
});
