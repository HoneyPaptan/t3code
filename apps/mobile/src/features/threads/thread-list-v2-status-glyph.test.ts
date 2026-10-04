import { describe, expect, it } from "vite-plus/test";

import { resolveThreadListV2StatusGlyph } from "./thread-list-v2-status-glyph";

const base = { status: "ready", variant: "card", snoozed: false, pinned: false } as const;

describe("resolveThreadListV2StatusGlyph", () => {
  it("shows the agent spark for an idle active thread", () => {
    expect(resolveThreadListV2StatusGlyph(base)).toBe("idle");
  });

  it("shows a spinner while the thread is running", () => {
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
