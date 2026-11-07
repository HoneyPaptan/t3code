import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

import { resolveWorkspaceScanCwd, type WorkspaceScanCwdLookups } from "./workspaceScanCwd.ts";

const worktree = "/home/me/.t3/worktrees/repo/t3-bd52ae66";
const projectRoot = "/home/me/code/repo";

const lookups = (overrides: Partial<WorkspaceScanCwdLookups>): WorkspaceScanCwdLookups => ({
  exists: () => Effect.succeed(false),
  isManagedWorktreePath: () => Effect.succeed(true),
  ownerWorkspaceRoot: () => Effect.succeed(projectRoot),
  ...overrides,
});

describe("resolveWorkspaceScanCwd", () => {
  it.effect("scans the owning project's root when a managed worktree was removed", () =>
    Effect.gen(function* () {
      assert.strictEqual(yield* resolveWorkspaceScanCwd(lookups({}), worktree), projectRoot);
    }),
  );

  it.effect("keeps the cwd when it exists, is not managed, or has no owning thread", () =>
    Effect.gen(function* () {
      const cases: ReadonlyArray<Partial<WorkspaceScanCwdLookups>> = [
        { exists: () => Effect.succeed(true) },
        { isManagedWorktreePath: () => Effect.succeed(false) },
        { ownerWorkspaceRoot: () => Effect.undefined },
      ];
      for (const overrides of cases) {
        assert.strictEqual(yield* resolveWorkspaceScanCwd(lookups(overrides), worktree), worktree);
      }
    }),
  );
});
