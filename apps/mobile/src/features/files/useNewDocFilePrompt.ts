import { newDocContents, newDocRelativePath } from "@t3tools/client-runtime/docEditor";
import {
  isAtomCommandInterrupted,
  squashAtomCommandFailure,
} from "@t3tools/client-runtime/state/runtime";
import { AuthFilesystemWriteScope, type EnvironmentId } from "@t3tools/contracts";
import { useCallback } from "react";

import { showConfirmDialog, showTextInputDialog } from "../../components/ConfirmDialogHost";
import { projectEnvironment } from "../../state/projects";
import { useEnvironmentScope } from "../../state/session";
import { useAtomCommand } from "../../state/use-atom-command";

function showCreateFailure(message: string) {
  showConfirmDialog({
    title: "Could not create file",
    message,
    confirmText: "OK",
    onConfirm: () => {},
  });
}

export function useNewDocFilePrompt(params: {
  readonly environmentId: EnvironmentId | null;
  readonly cwd: string | null;
  readonly onCreated: (relativePath: string) => void;
}): (() => void) | null {
  const { environmentId, cwd, onCreated } = params;
  const canWriteFiles = useEnvironmentScope(environmentId, AuthFilesystemWriteScope);
  const writeFile = useAtomCommand(projectEnvironment.writeFile, { reportFailure: false });

  const create = useCallback(
    async (input: string) => {
      if (environmentId === null || cwd === null) return;
      const relativePath = newDocRelativePath(input);
      if (relativePath === null) {
        showCreateFailure("Enter a file name inside the project, like notes/idea.md.");
        return;
      }
      const result = await writeFile({
        environmentId,
        input: { cwd, relativePath, contents: newDocContents(relativePath), createOnly: true },
      });
      if (result._tag === "Success") {
        onCreated(result.value.relativePath);
        return;
      }
      if (isAtomCommandInterrupted(result)) return;
      const error = squashAtomCommandFailure(result);
      const message = error instanceof Error ? error.message : "";
      showCreateFailure(
        /EEXIST|exists/i.test(message)
          ? `${relativePath} already exists.`
          : message || "An error occurred while creating the file.",
      );
    },
    [cwd, environmentId, onCreated, writeFile],
  );

  const prompt = useCallback(
    () =>
      showTextInputDialog({
        title: "New file",
        initialValue: "notes/",
        confirmText: "Create",
        onConfirm: (value) => void create(value),
      }),
    [create],
  );

  return canWriteFiles && environmentId !== null && cwd !== null ? prompt : null;
}
