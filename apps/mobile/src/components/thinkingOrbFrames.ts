import {
  MODE_FRAMES,
  resolvePreset,
  type Dot,
  type Line,
  type OrbFrame,
  type OrbSize,
  type OrbState,
} from "thinking-orbs/engine";

export const ORB_FRAME_RATE = 30;
export const ORB_WINDOW_FRAMES = 72;
export const ORB_STATIC_FRAME_INDEX = 0;
export const ORB_MAX_BUCKETS = 12;

const WHITE_BUCKETS = 4;
const WHITE_SPAN = 0.8;
const ALPHA_LEVELS = 3;
const LINE_WIDTH_STEP = 0.25;

export type OrbInkKind = "dot" | "line";

export interface OrbInkBucket {
  readonly kind: OrbInkKind;
  readonly white: number;
  readonly opacity: number;
  readonly strokeWidth: number;
}

export interface OrbFrameWindow {
  readonly buckets: ReadonlyArray<OrbInkBucket>;
  readonly paths: ReadonlyArray<ReadonlyArray<string>>;
  readonly frameCount: number;
  readonly durationMs: number;
}

interface BucketDraft extends OrbInkBucket {
  readonly key: string;
  readonly whiteBucket: number;
  readonly alphaLevel: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function whiteBucketOf(white: number): number {
  return clamp(Math.floor(white / (WHITE_SPAN / WHITE_BUCKETS)), 0, WHITE_BUCKETS - 1);
}

function alphaLevelOf(alpha: number | undefined): number {
  return clamp(Math.round((alpha ?? 1) * ALPHA_LEVELS), 1, ALPHA_LEVELS);
}

function lineWidthOf(line: Line): number {
  return Math.max(LINE_WIDTH_STEP, Math.round(line.w / LINE_WIDTH_STEP) * LINE_WIDTH_STEP);
}

function draftBucket(
  kind: OrbInkKind,
  white: number,
  alpha: number | undefined,
  strokeWidth: number,
): BucketDraft {
  const whiteBucket = whiteBucketOf(white);
  const alphaLevel = alphaLevelOf(alpha);
  return {
    key: `${kind}:${whiteBucket}:${alphaLevel}:${strokeWidth}`,
    kind,
    whiteBucket,
    alphaLevel,
    white: ((whiteBucket + 0.5) * WHITE_SPAN) / WHITE_BUCKETS,
    opacity: alphaLevel / ALPHA_LEVELS,
    strokeWidth,
  };
}

function dotBucket(dot: Dot): BucketDraft {
  return draftBucket("dot", dot.white, dot.a, 0);
}

function lineBucket(line: Line): BucketDraft {
  return draftBucket("line", line.white, line.a, lineWidthOf(line));
}

function dotSegment(dot: Dot): string {
  const r = round2(dot.r);
  return `M${round2(dot.x - dot.r)} ${round2(dot.y)}a${r} ${r} 0 1 0 ${round2(dot.r * 2)} 0a${r} ${r} 0 1 0 ${round2(-dot.r * 2)} 0`;
}

function lineSegment(line: Line): string {
  return `M${round2(line.x1)} ${round2(line.y1)}L${round2(line.x2)} ${round2(line.y2)}`;
}

function paintOrder(left: BucketDraft, right: BucketDraft): number {
  if (left.kind !== right.kind) return left.kind === "line" ? -1 : 1;
  if (left.whiteBucket !== right.whiteBucket) return right.whiteBucket - left.whiteBucket;
  if (left.alphaLevel !== right.alphaLevel) return left.alphaLevel - right.alphaLevel;
  return left.strokeWidth - right.strokeWidth;
}

export function sampleOrbFrames(
  state: OrbState,
  size: OrbSize,
  frameCount = ORB_WINDOW_FRAMES,
): ReadonlyArray<OrbFrame> {
  const resolved = resolvePreset(state, size);
  const draw = MODE_FRAMES[resolved.mode];
  return Array.from({ length: frameCount }, (_, index) =>
    draw(size, (index / ORB_FRAME_RATE) * resolved.speed, resolved.opts),
  );
}

function collectBuckets(frames: ReadonlyArray<OrbFrame>): ReadonlyArray<BucketDraft> {
  const drafts = new Map<string, BucketDraft>();
  for (const frame of frames) {
    for (const line of frame.lines) {
      const draft = lineBucket(line);
      if (!drafts.has(draft.key)) drafts.set(draft.key, draft);
    }
    for (const dot of frame.dots) {
      const draft = dotBucket(dot);
      if (!drafts.has(draft.key)) drafts.set(draft.key, draft);
    }
  }
  return [...drafts.values()].sort(paintOrder);
}

function framePaths(frame: OrbFrame, slotOf: ReadonlyMap<string, number>, bucketCount: number) {
  const segments: Array<Array<string>> = Array.from({ length: bucketCount }, () => []);
  for (const line of frame.lines)
    segments[slotOf.get(lineBucket(line).key)!]!.push(lineSegment(line));
  for (const dot of frame.dots) segments[slotOf.get(dotBucket(dot).key)!]!.push(dotSegment(dot));
  return segments.map((parts) => parts.join(""));
}

export function buildOrbFrameWindow(frames: ReadonlyArray<OrbFrame>): OrbFrameWindow {
  const drafts = collectBuckets(frames);
  const slotOf = new Map(drafts.map((draft, slot) => [draft.key, slot] as const));
  const perFrame = frames.map((frame) => framePaths(frame, slotOf, drafts.length));
  return {
    buckets: drafts.map(({ kind, white, opacity, strokeWidth }) => ({
      kind,
      white,
      opacity,
      strokeWidth,
    })),
    paths: drafts.map((_, slot) => perFrame.map((paths) => paths[slot]!)),
    frameCount: frames.length,
    durationMs: (Math.max(1, frames.length - 1) / ORB_FRAME_RATE) * 1000,
  };
}

const windowCache = new Map<string, OrbFrameWindow>();

export function orbFrameWindow(state: OrbState, size: OrbSize): OrbFrameWindow {
  const key = `${state}:${size}`;
  const cached = windowCache.get(key);
  if (cached) return cached;
  const built = buildOrbFrameWindow(sampleOrbFrames(state, size));
  windowCache.set(key, built);
  return built;
}
