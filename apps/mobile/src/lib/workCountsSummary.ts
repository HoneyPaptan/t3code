import {
  toolGroupAction,
  type ToolGroupAction,
} from "@t3tools/client-runtime/work-log/presentation";

import type { ThreadFeedActivity } from "./threadActivity";

type WorkCountCategory = "edit" | "read" | "command" | "other";

type CountedActivity = Pick<ThreadFeedActivity, "toolLike" | "status" | "workEntry">;

const WORK_COUNT_ORDER: ReadonlyArray<WorkCountCategory> = ["edit", "read", "command", "other"];

const WORK_COUNT_LABEL: Record<WorkCountCategory, readonly [singular: string, plural: string]> = {
  edit: ["edit", "edits"],
  read: ["file read", "file reads"],
  command: ["command", "commands"],
  other: ["other tool", "other tools"],
};

export const WORK_COUNTS_SEPARATOR = " · ";

function workCountCategory(action: ToolGroupAction): WorkCountCategory | null {
  switch (action) {
    case "edit":
      return "edit";
    case "read":
    case "code-search":
    case "search":
      return "read";
    case "command":
      return "command";
    case "update":
      return null;
    default:
      return "other";
  }
}

function pluralCount(count: number, label: readonly [singular: string, plural: string]): string {
  return `${count} ${count === 1 ? label[0] : label[1]}`;
}

export function workCountsSummary(activities: ReadonlyArray<CountedActivity>): string {
  const counts: Record<WorkCountCategory, number> = { edit: 0, read: 0, command: 0, other: 0 };
  let failed = 0;
  for (const activity of activities) {
    if (!activity.toolLike || activity.workEntry.itemType === "reasoning") continue;
    const category = workCountCategory(toolGroupAction(activity.workEntry));
    if (category !== null) counts[category] += 1;
    if (activity.status === "failure") failed += 1;
  }
  const parts = WORK_COUNT_ORDER.filter((category) => counts[category] > 0).map((category) =>
    pluralCount(counts[category], WORK_COUNT_LABEL[category]),
  );
  if (failed > 0) parts.push(`${failed} failed`);
  return parts.join(WORK_COUNTS_SEPARATOR);
}
