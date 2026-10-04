import { describe, expect, it } from "vite-plus/test";

import {
  HOME_FAB_BUTTON_SIZE,
  HOME_FAB_GAP,
  resolveHomeFabAccessoriesBottom,
  resolveHomeFabPillBottom,
} from "./homeFabStack";

describe("home floating button stack", () => {
  it("keeps the pill clear of the gesture bar on the phone layout", () => {
    expect(resolveHomeFabPillBottom(0, false)).toBe(32);
    expect(resolveHomeFabPillBottom(24, false)).toBe(40);
  });

  it("sits tighter in the sidebar layout", () => {
    expect(resolveHomeFabPillBottom(0, true)).toBe(18);
  });

  it("places the terminal and filter column one gap above the pill", () => {
    expect(resolveHomeFabAccessoriesBottom(24, false)).toBe(
      resolveHomeFabPillBottom(24, false) + HOME_FAB_BUTTON_SIZE + HOME_FAB_GAP,
    );
  });
});
