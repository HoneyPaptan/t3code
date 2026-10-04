import { describe, expect, it } from "vite-plus/test";

import { resolveThreadListV2ShelfHeader } from "./thread-list-v2-shelf-header";

describe("thread list v2 shelf header", () => {
  it("shows the count in the label whether the group is open or closed", () => {
    expect(
      resolveThreadListV2ShelfHeader({ kind: "settled", count: 45, expanded: true }).label,
    ).toBe("Settled (45)");
    expect(
      resolveThreadListV2ShelfHeader({ kind: "settled", count: 45, expanded: false }).label,
    ).toBe("Settled (45)");
    expect(
      resolveThreadListV2ShelfHeader({ kind: "snoozed", count: 2, expanded: false }).label,
    ).toBe("Snoozed (2)");
  });

  it("announces the toggle that a press will perform", () => {
    expect(
      resolveThreadListV2ShelfHeader({ kind: "settled", count: 3, expanded: true })
        .accessibilityHint,
    ).toBe("Collapses the settled threads.");
    expect(
      resolveThreadListV2ShelfHeader({ kind: "snoozed", count: 1, expanded: false })
        .accessibilityHint,
    ).toBe("Expands the snoozed threads.");
  });

  it("pluralises the spoken count", () => {
    expect(
      resolveThreadListV2ShelfHeader({ kind: "settled", count: 1, expanded: true })
        .accessibilityLabel,
    ).toBe("1 settled thread");
    expect(
      resolveThreadListV2ShelfHeader({ kind: "settled", count: 45, expanded: true })
        .accessibilityLabel,
    ).toBe("45 settled threads");
  });
});
