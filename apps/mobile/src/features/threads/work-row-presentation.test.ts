import { describe, expect, it } from "vite-plus/test";

import { resolveWorkRowLabelRole, shouldShowWorkRowFailureGlyph } from "./work-row-presentation";

describe("resolveWorkRowLabelRole", () => {
  it("styles a bare shell command as an argument", () => {
    expect(
      resolveWorkRowLabelRole({
        hasToolPresentation: false,
        isReasoning: false,
        command: "pnpm test",
      }),
    ).toBe("argument");
  });

  it("styles named tools as a name and reasoning as a group label", () => {
    expect(
      resolveWorkRowLabelRole({ hasToolPresentation: true, isReasoning: false, command: "ls" }),
    ).toBe("name");
    expect(
      resolveWorkRowLabelRole({ hasToolPresentation: false, isReasoning: true, command: "ls" }),
    ).toBe("group");
  });

  it("treats a blank or missing command as a name", () => {
    expect(
      resolveWorkRowLabelRole({ hasToolPresentation: false, isReasoning: false, command: "  " }),
    ).toBe("name");
    expect(
      resolveWorkRowLabelRole({
        hasToolPresentation: false,
        isReasoning: false,
        command: undefined,
      }),
    ).toBe("name");
  });
});

describe("shouldShowWorkRowFailureGlyph", () => {
  it("shows the glyph only for failed rows whose icon is not already destructive", () => {
    expect(shouldShowWorkRowFailureGlyph({ status: "failure", iconIsDestructive: false })).toBe(
      true,
    );
    expect(shouldShowWorkRowFailureGlyph({ status: "failure", iconIsDestructive: true })).toBe(
      false,
    );
    expect(shouldShowWorkRowFailureGlyph({ status: "success", iconIsDestructive: false })).toBe(
      false,
    );
    expect(shouldShowWorkRowFailureGlyph({ status: null, iconIsDestructive: false })).toBe(false);
  });
});
