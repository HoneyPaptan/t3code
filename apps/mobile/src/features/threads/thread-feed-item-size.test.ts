import { describe, expect, it } from "vite-plus/test";

import {
  THREAD_FEED_BLOCK_GAP,
  THREAD_FEED_GROUP_CHILD_GAP,
  deriveThreadWorkLogSizing,
} from "../../lib/layout";
import {
  resolveThreadFeedFixedItemSize,
  threadFeedChromeRowGap,
  workLogBlockBottomGap,
} from "./thread-feed-item-size";

describe("resolveThreadFeedFixedItemSize", () => {
  it("leaves activity groups to native measurement", () => {
    expect(resolveThreadFeedFixedItemSize("activity-group")).toBeUndefined();
  });

  it("keeps fixed timeline chrome on the premeasured path", () => {
    expect(resolveThreadFeedFixedItemSize("run-fold")).toBe(48);
    expect(resolveThreadFeedFixedItemSize("work-toggle")).toBe(48);
    expect(resolveThreadFeedFixedItemSize("thinking")).toBe(48);
  });

  it("adds the header to rows gap while a block is open", () => {
    expect(resolveThreadFeedFixedItemSize("run-fold", true)).toBe(48);
    expect(resolveThreadFeedFixedItemSize("work-toggle", true)).toBe(42);
  });

  it("measures an expanded thinking row instead of trusting the collapsed height", () => {
    expect(resolveThreadFeedFixedItemSize("thinking", true)).toBeUndefined();
  });

  it("equals the rendered min height plus the bottom gap at font scale 1", () => {
    const sizing = deriveThreadWorkLogSizing({ baseFontSize: 16, fontScale: 1 });
    expect(sizing.fixedRowHeight).toBe(sizing.estimatedRowHeight);
    for (const type of ["run-fold", "work-toggle", "thinking"] as const) {
      expect(resolveThreadFeedFixedItemSize(type)).toBe(
        sizing.estimatedRowHeight + threadFeedChromeRowGap(type),
      );
    }
    expect(resolveThreadFeedFixedItemSize("work-toggle", true)).toBe(
      sizing.estimatedRowHeight + workLogBlockBottomGap("group-header", false, true),
    );
    expect(resolveThreadFeedFixedItemSize("work-toggle")).toBe(
      sizing.estimatedRowHeight + workLogBlockBottomGap("group-header", false, false),
    );
  });

  it("uses the block gap for chrome rows and the child gap for an open header", () => {
    expect(threadFeedChromeRowGap("thinking")).toBe(THREAD_FEED_BLOCK_GAP);
    expect(threadFeedChromeRowGap("work-toggle", true)).toBe(THREAD_FEED_GROUP_CHILD_GAP);
  });
});
