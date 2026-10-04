import { describe, expect, it } from "vite-plus/test";

import {
  resolveThreadListV2StatusGlyph,
  THREAD_LIST_V2_STATUS_SLOT_FOOTPRINT,
  threadListV2StatusSlotOverhang,
} from "./thread-list-v2-status-glyph";

const base = { status: "ready", variant: "card", snoozed: false, pinned: false } as const;

describe("resolveThreadListV2StatusGlyph", () => {
  it("shows the agent spark for an idle active thread", () => {
    expect(resolveThreadListV2StatusGlyph(base)).toBe("idle");
  });

  it("shows the thinking orb while the thread is running", () => {
    expect(resolveThreadListV2StatusGlyph({ ...base, status: "working" })).toBe("running");
  });

  it("shows a pin for a pinned thread that is not running", () => {
    expect(resolveThreadListV2StatusGlyph({ ...base, pinned: true })).toBe("pinned");
    expect(resolveThreadListV2StatusGlyph({ ...base, pinned: true, status: "working" })).toBe(
      "running",
    );
  });

  it("shows a check for settled and a clock for snoozed", () => {
    expect(resolveThreadListV2StatusGlyph({ ...base, variant: "slim" })).toBe("settled");
    expect(resolveThreadListV2StatusGlyph({ ...base, variant: "slim", snoozed: true })).toBe(
      "snoozed",
    );
  });
});

describe("threadListV2StatusSlotOverhang", () => {
  it.each([16, 20, 24])("keeps a %ipx slot inside the row footprint", (slotSize) => {
    const overhang = threadListV2StatusSlotOverhang(slotSize);

    expect(slotSize + overhang * 2).toBe(THREAD_LIST_V2_STATUS_SLOT_FOOTPRINT);
  });

  it("never pushes a smaller slot apart with positive margin", () => {
    expect(threadListV2StatusSlotOverhang(12)).toBe(0);
  });
});
