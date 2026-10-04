import {
  THREAD_FEED_BLOCK_GAP,
  THREAD_FEED_GROUP_CHILD_GAP,
  THREAD_WORK_ROW_MIN_HEIGHT,
} from "../../lib/layout";
import type { ThreadFeedEntry } from "../../lib/threadActivity";

type ThreadFeedChromeEntryType = Extract<
  ThreadFeedEntry["type"],
  "run-fold" | "work-toggle" | "thinking"
>;

export function threadFeedChromeRowGap(
  entryType: ThreadFeedChromeEntryType,
  expanded = false,
): number {
  return entryType === "work-toggle" && expanded
    ? THREAD_FEED_GROUP_CHILD_GAP
    : THREAD_FEED_BLOCK_GAP;
}

export function workLogBlockBottomGap(
  layout: "standalone" | "group-header",
  continues: boolean,
  opensRows: boolean,
): number {
  if (layout === "group-header") return threadFeedChromeRowGap("work-toggle", opensRows);
  return continues ? 0 : THREAD_FEED_BLOCK_GAP;
}

function chromeRowFixedSize(entryType: ThreadFeedChromeEntryType, expanded: boolean): number {
  return THREAD_WORK_ROW_MIN_HEIGHT + threadFeedChromeRowGap(entryType, expanded);
}

export function resolveThreadFeedFixedItemSize(
  entryType: ThreadFeedEntry["type"],
  expanded = false,
): number | undefined {
  switch (entryType) {
    case "run-fold":
    case "work-toggle":
      return chromeRowFixedSize(entryType, expanded);
    case "thinking":
      return expanded ? undefined : chromeRowFixedSize(entryType, expanded);
    case "activity-group":
    case "message":
      return undefined;
  }
}
