import { describe, expect, it } from "vite-plus/test";

import {
  COMPOSER_COLLAPSED_CHROME,
  COMPOSER_EXPANDED_CHROME,
  composerDockPaddingVertical,
  composerEditorVerticalPadding,
} from "./composerChrome";

describe("composer chrome", () => {
  it("sums the resting composer: dock, pill border and padding, one line editor row, visible model strip", () => {
    expect(COMPOSER_COLLAPSED_CHROME).toBe(6 * 2 + 1 * 2 + 8 * 2 + 32 + (20 + 36 + 4 + 1 - 16));
    expect(COMPOSER_COLLAPSED_CHROME).toBe(107);
  });

  it("sums the open composer: dock, pill border and padding, tall editor, visible model strip", () => {
    expect(COMPOSER_EXPANDED_CHROME).toBe(8 * 2 + 1 * 2 + 14 + 72 + 8 + (20 + 36 + 4 + 1 - 16));
    expect(COMPOSER_EXPANDED_CHROME).toBe(157);
  });

  it("keeps the resting composer shorter than the open one", () => {
    expect(COMPOSER_COLLAPSED_CHROME).toBeLessThan(COMPOSER_EXPANDED_CHROME);
  });

  it("uses the dock padding the chrome sums count", () => {
    expect(composerDockPaddingVertical(false)).toBe(6);
    expect(composerDockPaddingVertical(true)).toBe(8);
  });

  it("centres a single line inside the resting editor", () => {
    expect(composerEditorVerticalPadding(false, 22)).toBe(5);
    expect(composerEditorVerticalPadding(true, 22)).toBe(4);
  });
});
