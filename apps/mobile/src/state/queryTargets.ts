import type { EnvironmentId, ThreadId } from "@t3tools/contracts";

export interface CheckpointDiffTarget {
  readonly environmentId: EnvironmentId | null;
  readonly threadId: ThreadId | null;
  readonly fromTurnCount: number | null;
  readonly toTurnCount: number | null;
  readonly ignoreWhitespace: boolean;
}

export function normalizeComposerPathSearchQuery(query: string | null): string {
  return query?.trim() ?? "";
}

export function buildComposerPathSearchTarget(
  target: {
    readonly environmentId: EnvironmentId | null;
    readonly cwd: string | null;
    readonly query: string | null;
  },
  limit: number,
) {
  if (target.environmentId === null || target.cwd === null || target.query === null) {
    return null;
  }
  return {
    environmentId: target.environmentId,
    input: { cwd: target.cwd, query: target.query, limit },
  } as const;
}

export function buildCheckpointDiffTargets(target: CheckpointDiffTarget) {
  if (
    target.environmentId === null ||
    target.threadId === null ||
    target.fromTurnCount === null ||
    target.toTurnCount === null
  ) {
    return { fullThread: null, turn: null } as const;
  }

  if (target.fromTurnCount === 0) {
    return {
      fullThread: {
        environmentId: target.environmentId,
        input: {
          threadId: target.threadId,
          toTurnCount: target.toTurnCount,
          ignoreWhitespace: target.ignoreWhitespace,
        },
      },
      turn: null,
    } as const;
  }

  return {
    fullThread: null,
    turn: {
      environmentId: target.environmentId,
      input: {
        threadId: target.threadId,
        fromTurnCount: target.fromTurnCount,
        toTurnCount: target.toTurnCount,
        ignoreWhitespace: target.ignoreWhitespace,
      },
    },
  } as const;
}
