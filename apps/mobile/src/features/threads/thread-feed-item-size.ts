import {
  THREAD_FEED_BLOCK_GAP,
  THREAD_FEED_GROUP_CHILD_GAP,
  THREAD_WORK_ROW_MIN_HEIGHT,
} from "../../lib/layout";
import type { ThreadFeedEntry } from "../../lib/threadActivity";

export function resolveThreadFeedFixedItemSize(
  entryType: ThreadFeedEntry["type"],
  expanded = false,
): number | undefined {
  switch (entryType) {
    case "run-fold":
      return THREAD_WORK_ROW_MIN_HEIGHT + THREAD_FEED_BLOCK_GAP;
    case "work-toggle":
      return (
        THREAD_WORK_ROW_MIN_HEIGHT +
        (expanded ? THREAD_FEED_GROUP_CHILD_GAP : THREAD_FEED_BLOCK_GAP)
      );
    case "thinking":
      return THREAD_WORK_ROW_MIN_HEIGHT + THREAD_FEED_BLOCK_GAP;
    case "activity-group":
    case "message":
      return undefined;
  }
}
