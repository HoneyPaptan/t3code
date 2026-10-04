import { effectiveSnoozed } from "@t3tools/client-runtime/state/thread-settled";
import type { EnvironmentThreadShell } from "@t3tools/client-runtime/state/shell";

export interface TerminalTarget {
  readonly environmentId: EnvironmentThreadShell["environmentId"];
  readonly threadId: EnvironmentThreadShell["id"];
}

type TerminalCandidate = EnvironmentThreadShell;

function candidateKey(candidate: Pick<TerminalCandidate, "environmentId" | "id">): string {
  return `${candidate.environmentId}:${candidate.id}`;
}

function activityTimestampMs(candidate: TerminalCandidate): number {
  const parsed = Date.parse(
    candidate.latestUserMessageAt ?? candidate.updatedAt ?? candidate.createdAt,
  );
  return Number.isNaN(parsed) ? 0 : parsed;
}

function isUnsettledAndReachable(candidate: TerminalCandidate, now: string): boolean {
  return (
    candidate.archivedAt === null &&
    candidate.lineage.relationshipToParent !== "subagent" &&
    candidate.settledOverride !== "settled" &&
    !effectiveSnoozed(candidate, { now })
  );
}

function toTarget(candidate: TerminalCandidate): TerminalTarget {
  return { environmentId: candidate.environmentId, threadId: candidate.id };
}

export function resolveTerminalTarget(input: {
  readonly openThreadKey: string | null;
  readonly threads: ReadonlyArray<TerminalCandidate>;
  readonly now: string;
}): TerminalTarget | null {
  const open =
    input.openThreadKey === null
      ? undefined
      : input.threads.find((thread) => candidateKey(thread) === input.openThreadKey);
  if (open !== undefined) return toTarget(open);
  const mostRecent = input.threads
    .filter((thread) => isUnsettledAndReachable(thread, input.now))
    .reduce<TerminalCandidate | null>(
      (best, thread) =>
        best === null || activityTimestampMs(thread) > activityTimestampMs(best) ? thread : best,
      null,
    );
  return mostRecent === null ? null : toTarget(mostRecent);
}
