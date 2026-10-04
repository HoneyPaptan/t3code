import { describe, expect, it } from "vite-plus/test";

import { resolveAndroidControlSizing } from "./androidControlSizing";

describe("Android control sizing", () => {
  it.each([
    [11, 17, 48, 48, 172],
    [16, 24, 48, 56, 250],
    [22, 33, 66, 77, 344],
  ])("scales controls at %ipt", (fontSize, iconSize, buttonSize, fabSize, menuWidth) => {
    expect(resolveAndroidControlSizing(fontSize)).toMatchObject({
      iconSize,
      buttonSize,
      fabSize,
      menuWidth,
    });
  });

  it.each([
    [11, 15, 44],
    [16, 20, 44],
    [22, 28, 61],
  ])("scales compact controls at %ipt", (fontSize, compactIconSize, compactButtonSize) => {
    expect(resolveAndroidControlSizing(fontSize)).toMatchObject({
      compactIconSize,
      compactButtonSize,
    });
  });
});
