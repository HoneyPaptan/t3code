import { EnvironmentId, ProjectId, ThreadId } from "@t3tools/contracts";
import type { EnvironmentThreadShell } from "@t3tools/client-runtime/state/shell";
import { describe, expect, it } from "vite-plus/test";

import { makeThreadShellFixture } from "../../test-fixtures";
import { resolveTerminalTarget } from "./terminalTarget";

const environmentId = EnvironmentId.make("environment-test");
const NOW = "2026-06-10T12:00:00.000Z";

function thread(
  id: string,
  overrides: Partial<EnvironmentThreadShell> = {},
): EnvironmentThreadShell {
  return makeThreadShellFixture({
    environmentId,
    id: ThreadId.make(id),
    projectId: ProjectId.make("project-1"),
    title: id,
    archivedAt: null,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    latestUserMessageAt: null,
    ...overrides,
  });
}

describe("resolveTerminalTarget", () => {
  it("returns null when no thread exists", () => {
    expect(resolveTerminalTarget({ openThreadKey: null, threads: [], now: NOW })).toBeNull();
  });

  it("prefers the open thread even when it is settled", () => {
    const threads = [
      thread("newer", { latestUserMessageAt: "2026-06-09T00:00:00.000Z" }),
      thread("open", { settledOverride: "settled" }),
    ];
    expect(
      resolveTerminalTarget({ openThreadKey: `${environmentId}:open`, threads, now: NOW }),
    ).toEqual({ environmentId, threadId: ThreadId.make("open") });
  });

  it("falls back to the most recently active unsettled thread", () => {
    const threads = [
      thread("old", { latestUserMessageAt: "2026-06-02T00:00:00.000Z" }),
      thread("fresh", { latestUserMessageAt: "2026-06-08T00:00:00.000Z" }),
      thread("settled-fresher", {
        latestUserMessageAt: "2026-06-09T00:00:00.000Z",
        settledOverride: "settled",
      }),
    ];
    expect(resolveTerminalTarget({ openThreadKey: null, threads, now: NOW })?.threadId).toBe(
      ThreadId.make("fresh"),
    );
  });

  it("ignores an open key that matches no known thread", () => {
    const threads = [thread("only")];
    expect(
      resolveTerminalTarget({ openThreadKey: `${environmentId}:missing`, threads, now: NOW })
        ?.threadId,
    ).toBe(ThreadId.make("only"));
  });

  it("skips archived and snoozed threads and returns null when nothing is left", () => {
    const threads = [
      thread("archived", { archivedAt: "2026-06-05T00:00:00.000Z" }),
      thread("snoozed", { snoozedUntil: "2026-06-11T00:00:00.000Z" }),
    ];
    expect(resolveTerminalTarget({ openThreadKey: null, threads, now: NOW })).toBeNull();
  });
});
