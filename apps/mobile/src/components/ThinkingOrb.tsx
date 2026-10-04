import { memo, useEffect, useMemo, useState } from "react";
import { AccessibilityInfo, AppState, View } from "react-native";
import { Circle, G, Line, Svg } from "react-native-svg";
import {
  MODE_FRAMES,
  resolvePreset,
  type OrbFrame,
  type OrbSize,
  type OrbState,
  type Resolved,
} from "thinking-orbs/engine";

import { useUniwindTheme } from "../lib/useUniwindTheme";
import { themeColorToNativeColor } from "../lib/mobileTheme";

export type ThinkingOrbState = OrbState;

const MAX_FRAMES_PER_SECOND = 30;
const FRAME_INTERVAL_MS = 1000 / MAX_FRAMES_PER_SECOND;
const STATIC_FRAME_TIME = 0;
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

function frameAt(resolved: Resolved, size: OrbSize, seconds: number): OrbFrame {
  return MODE_FRAMES[resolved.mode](size, seconds, resolved.opts);
}

function liveSeconds(speed: number): number {
  return (performance.now() / 1000) * speed;
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

function useOrbFrame(state: OrbState, size: OrbSize, paused: boolean): OrbFrame {
  const resolved = useMemo(() => resolvePreset(state, size), [state, size]);
  const appIsActive = useAppIsActive();
  const reduceMotion = useReduceMotion();
  const [frame, setFrame] = useState(() => frameAt(resolved, size, STATIC_FRAME_TIME));

  useEffect(() => {
    if (reduceMotion) {
      setFrame(frameAt(resolved, size, STATIC_FRAME_TIME));
      return;
    }
    setFrame(frameAt(resolved, size, liveSeconds(resolved.speed)));
    if (paused || !appIsActive) return;

    let handle = 0;
    let lastPaintMs = performance.now();
    const step = () => {
      const nowMs = performance.now();
      if (nowMs - lastPaintMs >= FRAME_INTERVAL_MS) {
        lastPaintMs = nowMs;
        setFrame(frameAt(resolved, size, liveSeconds(resolved.speed)));
      }
      handle = requestAnimationFrame(step);
    };
    handle = requestAnimationFrame(step);
    return () => cancelAnimationFrame(handle);
  }, [appIsActive, paused, reduceMotion, resolved, size]);

  return frame;
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
  const frame = useOrbFrame(props.state, size, props.paused ?? false);
  const strong = theme["--color-foreground"];
  const faded = theme["--color-foreground-muted"];
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
        <G>
          {frame.lines.map((line, index) => (
            <Line
              key={index}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={mixInk(strong, faded, line.white)}
              strokeWidth={line.w}
              strokeOpacity={line.a ?? 1}
              strokeLinecap="round"
            />
          ))}
        </G>
        <G>
          {frame.dots.map((dot, index) => (
            <Circle
              key={index}
              cx={dot.x}
              cy={dot.y}
              r={dot.r}
              fill={mixInk(strong, faded, dot.white)}
              fillOpacity={dot.a ?? 1}
            />
          ))}
        </G>
      </Svg>
    </View>
  );
}

export const ThinkingOrb = memo(ThinkingOrbView);
