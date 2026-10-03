import { describe, expect, it } from "vite-plus/test";

import { isStatusRestatedByIndicators, OFF_STATUS_LABEL } from "./connectionStatusVisibility";

describe("isStatusRestatedByIndicators", () => {
  it("hides the word when the dot and the switch already say it", () => {
    expect(isStatusRestatedByIndicators("connected", "Connected")).toBe(true);
    expect(isStatusRestatedByIndicators("available", OFF_STATUS_LABEL)).toBe(true);
  });

  it("keeps the word when it carries a state or a reason", () => {
    expect(isStatusRestatedByIndicators("connecting", "Connecting...")).toBe(false);
    expect(isStatusRestatedByIndicators("error", "Connection failed")).toBe(false);
    expect(isStatusRestatedByIndicators("offline", "Offline")).toBe(false);
    expect(isStatusRestatedByIndicators("unsupported", "Client not supported")).toBe(false);
    expect(isStatusRestatedByIndicators("available", "Available")).toBe(false);
  });
});
