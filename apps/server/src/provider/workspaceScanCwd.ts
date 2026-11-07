import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Option from "effect/Option";

import * as ThreadManagementService from "../orchestration-v2/ThreadManagementService.ts";
import * as ProjectService from "../project/ProjectService.ts";
import { makeIsManagedWorktreePath } from "../worktreesDirectory.ts";

export interface WorkspaceScanCwdLookups {
  readonly exists: (cwd: string) => Effect.Effect<boolean>;
  readonly isManagedWorktreePath: (cwd: string) => Effect.Effect<boolean>;
  readonly ownerWorkspaceRoot: (worktreePath: string) => Effect.Effect<string | undefined>;
}

export const resolveWorkspaceScanCwd = Effect.fn("resolveWorkspaceScanCwd")(function* (
  lookups: WorkspaceScanCwdLookups,
  cwd: string,
) {
  if (yield* lookups.exists(cwd)) return cwd;
  if (!(yield* lookups.isManagedWorktreePath(cwd))) return cwd;
  return (yield* lookups.ownerWorkspaceRoot(cwd)) ?? cwd;
});

export const makeResolveWorkspaceScanCwd = Effect.gen(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  const threads = yield* ThreadManagementService.ThreadManagementService;
  const projects = yield* ProjectService.ProjectService;
  const isManagedWorktreePath = yield* makeIsManagedWorktreePath;

  const ownerWorkspaceRoot = (worktreePath: string) =>
    threads.getShellSnapshot({ worktreePath }).pipe(
      Effect.flatMap((snapshot) => {
        const owner = snapshot.threads[0] ?? snapshot.archivedThreads[0];
        return owner === undefined
          ? Effect.undefined
          : projects
              .getById(owner.projectId)
              .pipe(Effect.map((project) => Option.getOrUndefined(project)?.workspaceRoot));
      }),
      Effect.orElseSucceed(() => undefined),
    );

  const lookups: WorkspaceScanCwdLookups = {
    exists: (cwd) => fileSystem.exists(cwd).pipe(Effect.orElseSucceed(() => true)),
    isManagedWorktreePath,
    ownerWorkspaceRoot,
  };
  return (cwd: string) => resolveWorkspaceScanCwd(lookups, cwd);
});
