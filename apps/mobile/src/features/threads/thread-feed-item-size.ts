import { THREAD_WORK_ROW_MIN_HEIGHT } from "../../lib/layout";
import type { ThreadFeedEntry } from "../../lib/threadActivity";

// These rows are pure timeline chrome whose rendered height is independent of
// their content. Content-driven rows must be measured by LegendList: returning
// a fixed size makes the list skip native measurement entirely.
const TURN_FOLD_COLLAPSED_BOTTOM_MARGIN = 3.5;
const WORK_BLOCK_OPEN_BOTTOM_MARGIN = 10.5;

export function resolveThreadFeedFixedItemSize(
  entryType: ThreadFeedEntry["type"],
  expanded = false,
): number | undefined {
  switch (entryType) {
    case "run-fold":
      return (
        THREAD_WORK_ROW_MIN_HEIGHT +
        (expanded ? WORK_BLOCK_OPEN_BOTTOM_MARGIN : TURN_FOLD_COLLAPSED_BOTTOM_MARGIN)
      );
    case "work-toggle":
      return THREAD_WORK_ROW_MIN_HEIGHT + (expanded ? WORK_BLOCK_OPEN_BOTTOM_MARGIN : 0);
    case "thinking":
      return THREAD_WORK_ROW_MIN_HEIGHT;
    case "activity-group":
    case "message":
      return undefined;
  }
}
