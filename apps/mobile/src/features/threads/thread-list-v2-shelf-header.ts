export type ThreadListV2ShelfKind = "snoozed" | "settled";

export function resolveThreadListV2ShelfHeader(input: {
  readonly kind: ThreadListV2ShelfKind;
  readonly count: number;
  readonly expanded: boolean;
}) {
  const name = input.kind === "snoozed" ? "Snoozed" : "Settled";
  return {
    label: `${name} (${input.count})`,
    accessibilityLabel: `${input.count} ${input.kind} ${input.count === 1 ? "thread" : "threads"}`,
    accessibilityHint: `${input.expanded ? "Collapses" : "Expands"} the ${input.kind} threads.`,
  };
}
