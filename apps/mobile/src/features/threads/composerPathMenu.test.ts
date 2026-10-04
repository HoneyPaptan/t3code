import { describe, expect, it } from "vite-plus/test";
import { detectComposerTrigger } from "@t3tools/shared/composerTrigger";

import {
  buildComposerPathItems,
  composerCommandEmptyText,
  composerPopoverMaxHeight,
  shouldShowComposerCommandPopover,
} from "./composerPathMenu";

describe("composer path menu", () => {
  it("detects a bare @ as a path trigger with an empty query", () => {
    expect(detectComposerTrigger("look at @", 9)).toEqual({
      kind: "path",
      query: "",
      rangeStart: 8,
      rangeEnd: 9,
    });
  });

  it("maps files and directories to rows with a basename label and parent description", () => {
    expect(
      buildComposerPathItems([
        { path: "apps/mobile/src/App.tsx", kind: "file" },
        { path: "apps/mobile", kind: "directory" },
        { path: "README.md", kind: "file" },
      ]),
    ).toEqual([
      {
        id: "path:file:apps/mobile/src/App.tsx",
        type: "path",
        path: "apps/mobile/src/App.tsx",
        kind: "file",
        label: "App.tsx",
        description: "apps/mobile/src",
      },
      {
        id: "path:directory:apps/mobile",
        type: "path",
        path: "apps/mobile",
        kind: "directory",
        label: "mobile",
        description: "apps",
      },
      {
        id: "path:file:README.md",
        type: "path",
        path: "README.md",
        kind: "file",
        label: "README.md",
        description: "",
      },
    ]);
  });

  it("explains an empty file menu", () => {
    expect(
      composerCommandEmptyText({ triggerKind: "path", isLoading: false, hasProject: false }),
    ).toBe("Pick a project to mention its files");
    expect(
      composerCommandEmptyText({ triggerKind: "path", isLoading: true, hasProject: true }),
    ).toBe("Searching files");
    expect(
      composerCommandEmptyText({ triggerKind: "path", isLoading: false, hasProject: true }),
    ).toBe("No files match");
  });

  it("keeps the popover open for path triggers even with no rows", () => {
    expect(shouldShowComposerCommandPopover({ triggerKind: "path", itemCount: 0 })).toBe(true);
    expect(shouldShowComposerCommandPopover({ triggerKind: "slash-command", itemCount: 0 })).toBe(
      false,
    );
    expect(shouldShowComposerCommandPopover({ triggerKind: null, itemCount: 3 })).toBe(false);
  });

  it("scales the popover with the window and clamps it", () => {
    expect(composerPopoverMaxHeight(400)).toBe(200);
    expect(composerPopoverMaxHeight(800)).toBe(272);
    expect(composerPopoverMaxHeight(2000)).toBe(340);
  });
});
