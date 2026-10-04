import { describe, expect, it } from "vite-plus/test";

import { workCountsSummary } from "./workCountsSummary";

function activity(
  workEntry: Partial<Parameters<typeof workCountsSummary>[0][number]["workEntry"]>,
  options: { toolLike?: boolean; status?: "success" | "failure" | "neutral" | null } = {},
) {
  return {
    toolLike: options.toolLike ?? true,
    status: options.status ?? "success",
    workEntry: {
      id: "entry",
      createdAt: "2026-06-20T00:00:00.000Z",
      label: "entry",
      tone: "tool" as const,
      ...workEntry,
    },
  };
}

describe("workCountsSummary", () => {
  it("counts edits, file reads and commands in herdr order", () => {
    expect(
      workCountsSummary([
        activity({ itemType: "command_execution", command: "ls" }),
        activity({ itemType: "file_change", changedFiles: ["a.ts"] }),
        activity({ requestKind: "file-read" }),
        activity({ requestKind: "file-read" }),
        activity({ itemType: "command_execution", command: "pwd" }),
      ]),
    ).toBe("1 edit · 2 file reads · 2 commands");
  });

  it("appends the failed count last and ignores reasoning rows", () => {
    expect(
      workCountsSummary([
        activity({ itemType: "reasoning" }, { toolLike: false }),
        activity({ itemType: "command_execution", command: "false" }, { status: "failure" }),
      ]),
    ).toBe("1 command · 1 failed");
  });

  it("returns an empty string when nothing tool like ran", () => {
    expect(workCountsSummary([activity({ itemType: "reasoning" }, { toolLike: false })])).toBe("");
  });
});
