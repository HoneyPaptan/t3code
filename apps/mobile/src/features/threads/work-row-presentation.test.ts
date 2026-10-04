import { describe, expect, it } from "vite-plus/test";

import {
  LIVE_THINKING_ROW_PRESENTATION,
  LIVE_WORK_GROUP_TITLE,
  resolveWorkGroupHeaderPresentation,
  resolveWorkRowHead,
  resolveWorkRowLabelRole,
  SETTLED_THOUGHT_LABEL,
  workRowFailureLabel,
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

describe("workRowFailureLabel", () => {
  it("labels only failed rows with the failed word", () => {
    expect(workRowFailureLabel("failure")).toBe("failed");
    expect(workRowFailureLabel("success")).toBeNull();
    expect(workRowFailureLabel("neutral")).toBeNull();
    expect(workRowFailureLabel(null)).toBeNull();
  });
});

describe("resolveWorkRowHead", () => {
  const base = {
    hasToolPresentation: false,
    isReasoning: false,
    live: false,
    command: undefined,
  } as const;

  it("splits a tool row into its tool name and a mono summary", () => {
    expect(
      resolveWorkRowHead({
        ...base,
        label: "pnpm test",
        toolName: "Command",
        command: "pnpm test",
      }),
    ).toEqual({ name: "Command", nameRole: "name", summary: "pnpm test" });
  });

  it("drops the summary when it repeats the tool name", () => {
    expect(
      resolveWorkRowHead({
        ...base,
        label: "Link PR",
        toolName: "link pr",
        hasToolPresentation: true,
      }),
    ).toEqual({ name: "Link PR", nameRole: "name", summary: null });
  });

  it("keeps a nameless row on its single label", () => {
    expect(resolveWorkRowHead({ ...base, label: "src/app.ts", toolName: undefined })).toEqual({
      name: "src/app.ts",
      nameRole: "name",
      summary: null,
    });
  });

  it("names a settled reasoning row Thought and keeps a live one on its preview", () => {
    expect(
      resolveWorkRowHead({
        ...base,
        label: "Checking the cache",
        toolName: undefined,
        isReasoning: true,
      }),
    ).toEqual({ name: SETTLED_THOUGHT_LABEL, nameRole: "group", summary: null });
    expect(
      resolveWorkRowHead({
        ...base,
        label: "Checking the cache",
        toolName: undefined,
        isReasoning: true,
        live: true,
      }),
    ).toEqual({ name: "Checking the cache", nameRole: "group", summary: null });
  });
});

describe("resolveWorkGroupHeaderPresentation", () => {
  it("titles a live group Working… with the listening orb and keeps the summary", () => {
    const header = resolveWorkGroupHeaderPresentation({
      live: true,
      summary: "Thought",
      hasFailure: false,
    });
    expect(header.title).toBe("Working…");
    expect(header.orbState).toBe("listening");
    expect(header.summary).toBe("Thought");
    expect(header.accessibilityLabel).toBe("Working… Thought");
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
  it("gives the placeholder row the same Working… orb header as a live group", () => {
    const header = resolveWorkGroupHeaderPresentation({
      live: true,
      summary: "Thought",
      hasFailure: false,
    });
    expect(LIVE_THINKING_ROW_PRESENTATION.label).toBe(header.title);
    expect(LIVE_THINKING_ROW_PRESENTATION.orbState).toBe(header.orbState);
    expect(LIVE_THINKING_ROW_PRESENTATION.showIcon).toBe(false);
    expect(LIVE_THINKING_ROW_PRESENTATION.label).not.toBe("Thinking");
  });
});
