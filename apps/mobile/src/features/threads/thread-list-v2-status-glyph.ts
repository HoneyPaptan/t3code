import type { AppSymbolName } from "../../components/AppSymbol";
import type { ThreadListV2Status } from "./threadListV2";

export type ThreadListV2StatusGlyph = "running" | "snoozed" | "settled" | "pinned" | "idle";

export function resolveThreadListV2StatusGlyph(input: {
  readonly status: ThreadListV2Status;
  readonly variant: "card" | "slim";
  readonly snoozed: boolean;
  readonly pinned: boolean;
}): ThreadListV2StatusGlyph {
  if (input.snoozed) return "snoozed";
  if (input.variant === "slim") return "settled";
  if (input.status === "working") return "running";
  if (input.pinned) return "pinned";
  return "idle";
}

export const THREAD_LIST_V2_STATUS_GLYPH_SYMBOL: Record<
  Exclude<ThreadListV2StatusGlyph, "running">,
  AppSymbolName
> = {
  snoozed: "clock",
  settled: "checkmark",
  pinned: "pin",
  idle: { ios: "sparkles", android: "auto_awesome" },
};

export const THREAD_LIST_V2_STATUS_GLYPH_LABEL: Record<ThreadListV2StatusGlyph, string> = {
  running: "Running",
  snoozed: "Snoozed",
  settled: "Settled",
  pinned: "Pinned",
  idle: "Idle",
};
