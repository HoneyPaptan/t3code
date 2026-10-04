import { renderToStaticMarkup } from "react-dom/server";
import { MODE_FRAMES, resolvePreset, STATE_TO_MODE, type OrbState } from "thinking-orbs/engine";
import { describe, expect, it, vi } from "vite-plus/test";

vi.mock("react-native", () => ({
  View: "div",
  AppState: {
    currentState: "active",
    addEventListener: () => ({ remove: vi.fn() }),
  },
  AccessibilityInfo: {
    isReduceMotionEnabled: () => Promise.resolve(false),
    addEventListener: () => ({ remove: vi.fn() }),
  },
}));
vi.mock("react-native-svg", () => ({
  Svg: "svg",
  G: "g",
  Circle: "circle",
  Line: "line",
}));
vi.mock("../lib/useUniwindTheme", () => ({
  useUniwindTheme: () => ({
    "--color-foreground": "#111111",
    "--color-foreground-muted": "#999999",
  }),
}));

import { ThinkingOrb, mixInk } from "./ThinkingOrb";

const ORB_STATES = Object.keys(STATE_TO_MODE) as ReadonlyArray<OrbState>;

describe("thinking orb engine", () => {
  it.each(ORB_STATES)("draws at least one dot for %s at size 20", (state) => {
    const resolved = resolvePreset(state, 20);
    const frame = MODE_FRAMES[resolved.mode](20, 0, resolved.opts);

    expect(frame.dots.length).toBeGreaterThan(0);
  });
});

describe("mixInk", () => {
  it("returns the base ink at white 0 and the highlight ink at white 1", () => {
    expect(mixInk("#102030", "#f0e0d0", 0)).toBe("#102030");
    expect(mixInk("#102030", "#f0e0d0", 1)).toBe("#f0e0d0");
  });

  it("meets in the middle and clamps out of range values", () => {
    expect(mixInk("#000000", "#ffffff", 0.5)).toBe("#808080");
    expect(mixInk("#000000", "#ffffff", 4)).toBe("#ffffff");
    expect(mixInk("#000000", "#ffffff", -1)).toBe("#000000");
  });

  it("accepts rgb() theme values", () => {
    expect(mixInk("rgb(0, 0, 0)", "rgba(255, 255, 255, 0.5)", 1)).toBe("#ffffff");
  });
});

describe("ThinkingOrb", () => {
  it("renders an svg with circles for the listening state", () => {
    const markup = renderToStaticMarkup(<ThinkingOrb state="listening" size={20} />);

    expect(markup).toContain("<svg");
    expect(markup).toContain("<circle");
  });
});
