export type ThreadListV2ShelfKind = "working" | "snoozed" | "settled";

const SHELF_NAME = { working: "Working", snoozed: "Snoozed", settled: "Settled" } as const;

export function resolveThreadListV2ShelfHeader(input: {
  readonly kind: ThreadListV2ShelfKind;
  readonly count: number;
  readonly expanded: boolean;
}) {
  const name = SHELF_NAME[input.kind];
  return {
    label: `${name} (${input.count})`,
    accessibilityLabel: `${input.count} ${input.kind} ${input.count === 1 ? "thread" : "threads"}`,
    accessibilityHint: `${input.expanded ? "Collapses" : "Expands"} the ${input.kind} threads.`,
  };
}
