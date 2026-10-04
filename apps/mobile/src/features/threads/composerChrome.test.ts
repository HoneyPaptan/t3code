import { describe, expect, it } from "vite-plus/test";

import {
  COMPOSER_COLLAPSED_CHROME,
  COMPOSER_EXPANDED_CHROME,
  composerDockPaddingVertical,
  composerEditorVerticalPadding,
} from "./composerChrome";

describe("composer chrome", () => {
  it("sums the resting composer: dock, border, one line editor row with send, controls strip", () => {
    expect(COMPOSER_COLLAPSED_CHROME).toBe(6 * 2 + 1 * 2 + 8 + 36 + 36 + 8);
    expect(COMPOSER_COLLAPSED_CHROME).toBe(102);
  });

  it("sums the open composer: dock, border, body padding, editor, footer row and padding", () => {
    expect(COMPOSER_EXPANDED_CHROME).toBe(8 * 2 + 1 * 2 + 16 + 72 + 8 + 36 + 16);
    expect(COMPOSER_EXPANDED_CHROME).toBe(166);
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
