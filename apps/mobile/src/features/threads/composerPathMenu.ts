import type { ProjectEntry } from "@t3tools/contracts";
import type { ComposerTriggerKind } from "@t3tools/shared/composerTrigger";

export const COMPOSER_NO_PROJECT_TEXT = "Pick a project to mention its files";
export const COMPOSER_SEARCHING_FILES_TEXT = "Searching files";
export const COMPOSER_NO_FILES_TEXT = "No files match";

export interface ComposerPathItem {
  readonly id: string;
  readonly type: "path";
  readonly path: string;
  readonly kind: ProjectEntry["kind"];
  readonly label: string;
  readonly description: string;
}

export function buildComposerPathItems(
  entries: ReadonlyArray<ProjectEntry>,
): ReadonlyArray<ComposerPathItem> {
  return entries.map((entry) => {
    const segments = entry.path.split("/");
    return {
      id: `path:${entry.kind}:${entry.path}`,
      type: "path",
      path: entry.path,
      kind: entry.kind,
      label: segments[segments.length - 1] ?? entry.path,
      description: segments.length > 1 ? segments.slice(0, -1).join("/") : "",
    };
  });
}

export function composerCommandEmptyText(input: {
  readonly triggerKind: ComposerTriggerKind | null;
  readonly isLoading: boolean;
  readonly hasProject: boolean;
}): string {
  switch (input.triggerKind) {
    case "path":
      if (!input.hasProject) return COMPOSER_NO_PROJECT_TEXT;
      return input.isLoading ? COMPOSER_SEARCHING_FILES_TEXT : COMPOSER_NO_FILES_TEXT;
    case "pull-request":
      return input.isLoading ? "Loading" : "No matching pull requests";
    case "skill":
      return input.isLoading ? "Loading" : "No skills found";
    case "slash-command":
      return input.isLoading ? "Loading" : "No matching commands";
    default:
      return input.isLoading ? "Loading" : "No results";
  }
}

export function shouldShowComposerCommandPopover(input: {
  readonly triggerKind: ComposerTriggerKind | null;
  readonly itemCount: number;
}): boolean {
  if (input.triggerKind === null) return false;
  return (
    input.itemCount > 0 || input.triggerKind === "pull-request" || input.triggerKind === "path"
  );
}

const POPOVER_MIN_HEIGHT = 200;
const POPOVER_MAX_HEIGHT = 340;
const POPOVER_WINDOW_FRACTION = 0.34;

export function composerPopoverMaxHeight(windowHeight: number): number {
  return Math.min(
    POPOVER_MAX_HEIGHT,
    Math.max(POPOVER_MIN_HEIGHT, Math.round(windowHeight * POPOVER_WINDOW_FRACTION)),
  );
}
