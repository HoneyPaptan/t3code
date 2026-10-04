import { describe, expect, it } from "vite-plus/test";

import { resolveThreadFeedFixedItemSize } from "./thread-feed-item-size";

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
    expect(resolveThreadFeedFixedItemSize("thinking", true)).toBe(48);
  });
});
