import { describe, expect, it } from "vite-plus/test";

import {
  LIVE_THINKING_ROW_PRESENTATION,
  LIVE_WORK_GROUP_TITLE,
  resolveWorkGroupHeaderPresentation,
  resolveWorkRowLabelRole,
  shouldShowWorkRowFailureGlyph,
} from "./work-row-presentation";

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

describe("resolveWorkGroupHeaderPresentation", () => {
  it("titles a live group Working… with the listening orb and keeps the summary", () => {
    const header = resolveWorkGroupHeaderPresentation({
      live: true,
      summary: "Thinking",
      hasFailure: false,
    });
    expect(header.title).toBe("Working…");
    expect(header.orbState).toBe("listening");
    expect(header.summary).toBe("Thinking");
    expect(header.accessibilityLabel).toBe("Working… Thinking");
  });

  it("drops the title and orb once settled", () => {
    expect(
      resolveWorkGroupHeaderPresentation({
        live: false,
        summary: "Ran 3 commands",
        hasFailure: true,
      }),
    ).toEqual({
      title: null,
      summary: "Ran 3 commands",
      orbState: null,
      accessibilityLabel: "Ran 3 commands, tool call failed",
    });
  });

  it("is deterministic for the same input", () => {
    const labels = new Set(
      Array.from(
        { length: 32 },
        () =>
          resolveWorkGroupHeaderPresentation({ live: true, summary: "x", hasFailure: false }).title,
      ),
    );
    expect([...labels]).toEqual([LIVE_WORK_GROUP_TITLE]);
  });
});

describe("live turn indicators", () => {
  it("shows at most one orb and never two Thinking rows", () => {
    const header = resolveWorkGroupHeaderPresentation({
      live: true,
      summary: "Thinking",
      hasFailure: false,
    });
    const orbs = [header.orbState, LIVE_THINKING_ROW_PRESENTATION.orbState].filter(
      (state) => state !== null,
    );
    expect(orbs).toEqual(["listening"]);
    expect(LIVE_THINKING_ROW_PRESENTATION.showIcon).toBe(false);
    const rowTitles = [header.title, LIVE_THINKING_ROW_PRESENTATION.label];
    expect(rowTitles.filter((title) => title === "Thinking")).toHaveLength(1);
  });
});
