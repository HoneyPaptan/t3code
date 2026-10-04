import { createElement, type ComponentType } from "react";
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
  Path: "path",
}));
vi.mock("react-native-reanimated", () => ({
  default: {
    createAnimatedComponent:
      (component: ComponentType<Record<string, unknown>>) =>
      ({ animatedProps, ...rest }: { readonly animatedProps: Record<string, unknown> }) =>
        createElement(component, { ...rest, ...animatedProps }),
  },
  cancelAnimation: vi.fn(),
  Easing: { linear: (value: number) => value },
  makeMutable: (value: unknown) => ({ value }),
  useAnimatedProps: (updater: () => Record<string, unknown>) => updater(),
  useSharedValue: (value: unknown) => ({ value }),
  withRepeat: (animation: unknown, count: number, reverse: boolean) => ({
    animation,
    count,
    reverse,
  }),
  withTiming: (target: number, config: unknown) => ({ target, config }),
}));
vi.mock("../lib/useUniwindTheme", () => ({
  useUniwindTheme: () => ({
    "--color-foreground": "#111111",
    "--color-foreground-muted": "#999999",
  }),
}));

import { driveOrbProgress, ThinkingOrb, mixInk } from "./ThinkingOrb";
import {
  buildOrbFrameWindow,
  ORB_FRAME_RATE,
  ORB_MAX_BUCKETS,
  ORB_STATIC_FRAME_INDEX,
  ORB_WINDOW_FRAMES,
  orbFrameWindow,
  sampleOrbFrames,
} from "./thinkingOrbFrames";

const ORB_STATES = Object.keys(STATE_TO_MODE) as ReadonlyArray<OrbState>;
const DOT_SEGMENT =
  /^(M-?[\d.]+ -?[\d.]+a[\d.]+ [\d.]+ 0 1 0 [\d.]+ 0a[\d.]+ [\d.]+ 0 1 0 -?[\d.]+ 0)+$/;

const MEASURED_BUCKETS: Record<20 | 64, Record<OrbState, number>> = {
  20: {
    working: 3,
    searching: 7,
    solving: 4,
    listening: 4,
    connecting: 4,
    weaving: 9,
    composing: 7,
    breathing: 2,
    shaping: 1,
  },
  64: {
    working: 3,
    searching: 7,
    solving: 4,
    listening: 4,
    connecting: 6,
    weaving: 9,
    composing: 7,
    breathing: 2,
    shaping: 1,
  },
};

describe("thinking orb engine", () => {
  it.each(ORB_STATES)("draws at least one dot for %s at size 20", (state) => {
    const resolved = resolvePreset(state, 20);
    const frame = MODE_FRAMES[resolved.mode](20, 0, resolved.opts);

    expect(frame.dots.length).toBeGreaterThan(0);
  });
});

describe("orb frame window", () => {
  it("samples a fixed window at the frame rate with one path per bucket per frame", () => {
    const window = orbFrameWindow("working", 20);

    expect(window.frameCount).toBe(ORB_WINDOW_FRAMES);
    expect(window.durationMs).toBeCloseTo(((ORB_WINDOW_FRAMES - 1) / ORB_FRAME_RATE) * 1000);
    expect(window.paths).toHaveLength(window.buckets.length);
    for (const frames of window.paths) expect(frames).toHaveLength(ORB_WINDOW_FRAMES);
  });

  it.each([20, 64] as const)("keeps every state within the bucket cap at size %i", (size) => {
    const counts = Object.fromEntries(
      ORB_STATES.map((state) => [state, orbFrameWindow(state, size).buckets.length]),
    );

    expect(counts).toEqual(MEASURED_BUCKETS[size]);
    for (const count of Object.values(counts)) expect(count).toBeLessThanOrEqual(ORB_MAX_BUCKETS);
  });

  it("draws every working frame as dot arcs with two decimal coordinates", () => {
    const window = orbFrameWindow("working", 20);

    for (let frame = 0; frame < window.frameCount; frame += 1) {
      const drawn = window.paths.map((frames) => frames[frame]!).filter((d) => d.length > 0);
      expect(drawn.length).toBeGreaterThan(0);
      for (const d of drawn) {
        expect(d).toMatch(DOT_SEGMENT);
        expect(d).not.toMatch(/\.\d{3}/);
      }
    }
  });

  it("paints lines first, then dots from faded to strong ink", () => {
    const window = orbFrameWindow("connecting", 64);
    const kinds = window.buckets.map((bucket) => bucket.kind);
    const dotWhites = window.buckets
      .filter((bucket) => bucket.kind === "dot")
      .map((bucket) => bucket.white);

    expect(kinds.indexOf("dot")).toBeGreaterThan(kinds.lastIndexOf("line"));
    expect(dotWhites).toEqual([...dotWhites].sort((left, right) => right - left));
  });

  it("gives an empty path to a bucket with nothing to draw in a frame", () => {
    const window = buildOrbFrameWindow([
      { dots: [{ x: 10, y: 10, z: 0, r: 1, white: 0.1 }], lines: [] },
      { dots: [{ x: 10, y: 10, z: 0, r: 1, white: 0.7 }], lines: [] },
    ]);

    expect(window.paths.map((frames) => frames.map((d) => d.length > 0))).toEqual([
      [false, true],
      [true, false],
    ]);
  });

  it("samples engine time scaled by the preset speed", () => {
    const resolved = resolvePreset("listening", 20);
    const third = MODE_FRAMES[resolved.mode](
      20,
      (3 / ORB_FRAME_RATE) * resolved.speed,
      resolved.opts,
    );

    expect(sampleOrbFrames("listening", 20)[3]).toEqual(third);
  });
});

describe("orb progress", () => {
  const window = orbFrameWindow("working", 20);

  it("ping pongs across the whole window while moving", () => {
    const progress = { value: 9 } as never as Parameters<typeof driveOrbProgress>[0];

    driveOrbProgress(progress, window, false);

    expect(progress.value).toEqual({
      animation: {
        target: window.frameCount - 1,
        config: expect.objectContaining({ duration: window.durationMs }),
      },
      count: -1,
      reverse: true,
    });
  });

  it("holds the static frame when motion is reduced or paused", () => {
    const progress = { value: 37 } as never as Parameters<typeof driveOrbProgress>[0];

    driveOrbProgress(progress, window, true);

    expect(progress.value).toBe(ORB_STATIC_FRAME_INDEX);
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
  it("renders one path per ink bucket showing the static frame", () => {
    const window = orbFrameWindow("listening", 20);
    const markup = renderToStaticMarkup(<ThinkingOrb state="listening" size={20} />);

    expect(markup).toContain("<svg");
    expect(markup.match(/<path /g)).toHaveLength(window.buckets.length);
    for (const frames of window.paths) {
      expect(markup).toContain(`d="${frames[ORB_STATIC_FRAME_INDEX]}"`);
    }
  });

  it("inks the strongest bucket nearest the foreground colour", () => {
    const markup = renderToStaticMarkup(<ThinkingOrb state="listening" size={20} />);

    expect(markup).toContain(`fill="${mixInk("#111111", "#999999", 0.1)}"`);
  });
});
