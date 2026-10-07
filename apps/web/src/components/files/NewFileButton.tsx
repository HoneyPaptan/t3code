import {
  isAtomCommandInterrupted,
  squashAtomCommandFailure,
} from "@t3tools/client-runtime/state/runtime";
import { newDocContents, newDocRelativePath } from "@t3tools/client-runtime/docEditor";
import { AuthFilesystemWriteScope, type EnvironmentId } from "@t3tools/contracts";
import { FilePlusIcon } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { toastManager } from "~/components/ui/toast";
import { Tooltip, TooltipPopup, TooltipTrigger } from "~/components/ui/tooltip";
import { projectEnvironment } from "~/state/projects";
import { useEnvironmentScope } from "~/state/session";
import { useAtomCommand } from "~/state/use-atom-command";

export function NewFileButton(props: {
  environmentId: EnvironmentId;
  cwd: string;
  onCreated: (relativePath: string) => void;
}) {
  const canWriteFiles = useEnvironmentScope(props.environmentId, AuthFilesystemWriteScope);
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState("");
  const [saving, setSaving] = useState(false);
  const inputId = useId();
  const writeProjectFile = useAtomCommand(projectEnvironment.writeFile, { reportFailure: false });

  if (!canWriteFiles) return null;

  const create = async () => {
    const relativePath = newDocRelativePath(path);
    if (!relativePath) {
      toastManager.add({ type: "warning", title: "Enter a file name inside the project" });
      return;
    }
    setSaving(true);
    const result = await writeProjectFile({
      environmentId: props.environmentId,
      input: {
        cwd: props.cwd,
        relativePath,
        contents: newDocContents(relativePath),
        createOnly: true,
      },
    });
    setSaving(false);
    if (result._tag === "Success") {
      setOpen(false);
      setPath("");
      props.onCreated(result.value.relativePath);
      return;
    }
    if (isAtomCommandInterrupted(result)) return;
    const error = squashAtomCommandFailure(result);
    const message = error instanceof Error ? error.message : "";
    toastManager.add({
      type: "error",
      title: "Could not create file",
      description: /EEXIST|exists/i.test(message)
        ? `${relativePath} already exists.`
        : message || "An error occurred while creating the file.",
    });
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="New file"
              onClick={() => setOpen(true)}
            />
          }
        >
          <FilePlusIcon />
        </TooltipTrigger>
        <TooltipPopup>New file</TooltipPopup>
      </Tooltip>
      <Dialog open={open} onOpenChange={(next) => !saving && setOpen(next)}>
        <DialogPopup className="max-w-md">
          <DialogHeader>
            <DialogTitle>New file</DialogTitle>
            <DialogDescription>
              Path inside the project. Folders are created for you, and names without an extension
              become markdown.
            </DialogDescription>
          </DialogHeader>
          <DialogPanel>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void create();
              }}
            >
              <label htmlFor={inputId} className="grid gap-1.5">
                <span className="text-xs font-medium text-foreground">File path</span>
                <Input
                  id={inputId}
                  value={path}
                  onChange={(event) => setPath(event.target.value)}
                  placeholder="notes/idea.md"
                  spellCheck={false}
                  autoFocus
                  disabled={saving}
                />
              </label>
            </form>
          </DialogPanel>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => void create()} disabled={saving}>
              {saving ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </>
  );
}
