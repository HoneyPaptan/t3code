import { memo, useEffect, useMemo, useState } from "react";
import { AccessibilityInfo, AppState, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  makeMutable,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { Path, Svg } from "react-native-svg";
import type { OrbSize, OrbState } from "thinking-orbs/engine";

import { useUniwindTheme } from "../lib/useUniwindTheme";
import { themeColorToNativeColor } from "../lib/mobileTheme";
import {
  ORB_STATIC_FRAME_INDEX,
  orbFrameWindow,
  type OrbFrameWindow,
  type OrbInkBucket,
} from "./thinkingOrbFrames";

export type ThinkingOrbState = OrbState;

const HEX_PATTERN = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})/i;
const RGB_PATTERN = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i;

type Channels = readonly [number, number, number];

function parseChannels(color: string): Channels | null {
  const native = themeColorToNativeColor(color.trim());
  const hex = HEX_PATTERN.exec(native);
  if (hex) return [parseInt(hex[1]!, 16), parseInt(hex[2]!, 16), parseInt(hex[3]!, 16)];
  const rgb = RGB_PATTERN.exec(native);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  return null;
}

function toHex(channels: Channels): string {
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

export function mixInk(base: string, highlight: string, white: number): string {
  const from = parseChannels(base);
  const to = parseChannels(highlight);
  if (!from || !to) return base;
  const amount = Math.min(1, Math.max(0, white));
  return toHex([
    Math.round(from[0] + (to[0] - from[0]) * amount),
    Math.round(from[1] + (to[1] - from[1]) * amount),
    Math.round(from[2] + (to[2] - from[2]) * amount),
  ]);
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface PlayableOrb {
  readonly window: OrbFrameWindow;
  readonly paths: SharedValue<ReadonlyArray<ReadonlyArray<string>>>;
}

const playableOrbs = new Map<string, PlayableOrb>();

function playableOrb(state: OrbState, size: OrbSize): PlayableOrb {
  const key = `${state}:${size}`;
  const cached = playableOrbs.get(key);
  if (cached) return cached;
  const window = orbFrameWindow(state, size);
  const playable = { window, paths: makeMutable(window.paths) };
  playableOrbs.set(key, playable);
  return playable;
}

function useAppIsActive(): boolean {
  const [active, setActive] = useState(AppState.currentState === "active");
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (next) =>
      setActive(next === "active"),
    );
    return () => subscription.remove();
  }, []);
  return active;
}

function useReduceMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    return () => subscription.remove();
  }, []);
  return reduced;
}

export function driveOrbProgress(
  progress: SharedValue<number>,
  window: OrbFrameWindow,
  still: boolean,
): void {
  cancelAnimation(progress);
  progress.value = ORB_STATIC_FRAME_INDEX;
  if (still) return;
  progress.value = withRepeat(
    withTiming(window.frameCount - 1, { duration: window.durationMs, easing: Easing.linear }),
    -1,
    true,
  );
}

function useOrbProgress(window: OrbFrameWindow, still: boolean): SharedValue<number> {
  const progress = useSharedValue(ORB_STATIC_FRAME_INDEX);
  useEffect(() => {
    driveOrbProgress(progress, window, still);
    return () => cancelAnimation(progress);
  }, [progress, still, window]);
  return progress;
}

function OrbBucketPath(props: {
  readonly bucket: OrbInkBucket;
  readonly slot: number;
  readonly playable: PlayableOrb;
  readonly progress: SharedValue<number>;
  readonly ink: string;
}) {
  const { slot, progress } = props;
  const paths = props.playable.paths;
  const animatedProps = useAnimatedProps(
    () => ({ d: paths.value[slot]?.[Math.round(progress.value)] ?? "" }),
    [paths, slot, progress],
  );
  const staticPath = props.playable.window.paths[slot]?.[ORB_STATIC_FRAME_INDEX] ?? "";

  if (props.bucket.kind === "line") {
    return (
      <AnimatedPath
        d={staticPath}
        animatedProps={animatedProps}
        stroke={props.ink}
        strokeOpacity={props.bucket.opacity}
        strokeWidth={props.bucket.strokeWidth}
        strokeLinecap="round"
      />
    );
  }
  return (
    <AnimatedPath
      d={staticPath}
      animatedProps={animatedProps}
      fill={props.ink}
      fillOpacity={props.bucket.opacity}
    />
  );
}

function ThinkingOrbView(props: {
  readonly state: OrbState;
  readonly size?: OrbSize;
  readonly paused?: boolean;
  readonly accessibilityLabel?: string;
  readonly className?: string;
}) {
  const size = props.size ?? 20;
  const theme = useUniwindTheme();
  const strong = theme["--color-foreground"];
  const faded = theme["--color-foreground-muted"];
  const playable = useMemo(() => playableOrb(props.state, size), [props.state, size]);
  const inks = useMemo(
    () => playable.window.buckets.map((bucket) => mixInk(strong, faded, bucket.white)),
    [faded, playable, strong],
  );
  const appIsActive = useAppIsActive();
  const reduceMotion = useReduceMotion();
  const still = (props.paused ?? false) || !appIsActive || reduceMotion;
  const progress = useOrbProgress(playable.window, still);
  const labelled = props.accessibilityLabel !== undefined;

  return (
    <View
      className={props.className}
      pointerEvents="none"
      accessible={labelled}
      accessibilityRole={labelled ? "image" : undefined}
      accessibilityLabel={props.accessibilityLabel}
      accessibilityElementsHidden={!labelled}
      importantForAccessibility={labelled ? "yes" : "no-hide-descendants"}
      style={{ width: size, height: size }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {playable.window.buckets.map((bucket, slot) => (
          <OrbBucketPath
            key={`${props.state}:${size}:${slot}`}
            bucket={bucket}
            slot={slot}
            playable={playable}
            progress={progress}
            ink={inks[slot]!}
          />
        ))}
      </Svg>
    </View>
  );
}

export const ThinkingOrb = memo(ThinkingOrbView);
