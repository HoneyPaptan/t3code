export type WorkRowLabelRole = "name" | "argument" | "heading" | "group";

export function resolveWorkRowLabelRole(input: {
  readonly hasToolPresentation: boolean;
  readonly isReasoning: boolean;
  readonly command: string | null | undefined;
}): WorkRowLabelRole {
  if (input.isReasoning) return "group";
  if (input.hasToolPresentation) return "name";
  return input.command?.trim() ? "argument" : "name";
}

export const WORK_ROW_FAILURE_LABEL = "failed";
export const SETTLED_THOUGHT_LABEL = "Thought";

export function workRowFailureLabel(
  status: "success" | "failure" | "neutral" | null,
): string | null {
  return status === "failure" ? WORK_ROW_FAILURE_LABEL : null;
}

export interface WorkRowHead {
  readonly name: string;
  readonly nameRole: WorkRowLabelRole;
  readonly summary: string | null;
}

function sameRowText(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

export function resolveWorkRowHead(input: {
  readonly label: string;
  readonly toolName: string | null | undefined;
  readonly hasToolPresentation: boolean;
  readonly isReasoning: boolean;
  readonly live: boolean;
  readonly command: string | null | undefined;
}): WorkRowHead {
  if (input.isReasoning && !input.live) {
    return { name: SETTLED_THOUGHT_LABEL, nameRole: "group", summary: null };
  }
  const toolName = input.toolName?.trim();
  if (!input.isReasoning && toolName && !sameRowText(toolName, input.label)) {
    return { name: toolName, nameRole: "name", summary: input.label.trim() || null };
  }
  return {
    name: input.label,
    nameRole: resolveWorkRowLabelRole(input),
    summary: null,
  };
}

export const LIVE_WORK_GROUP_TITLE = "Working…";
export const LIVE_THINKING_LABEL = "Thinking";

export interface WorkGroupHeaderPresentation {
  readonly title: string | null;
  readonly summary: string;
  readonly orbState: "listening" | null;
  readonly accessibilityLabel: string;
}

export function resolveWorkGroupHeaderPresentation(input: {
  readonly live: boolean;
  readonly summary: string;
  readonly hasFailure: boolean;
}): WorkGroupHeaderPresentation {
  const failureSuffix = input.hasFailure ? ", tool call failed" : "";
  if (!input.live) {
    return {
      title: null,
      summary: input.summary,
      orbState: null,
      accessibilityLabel: `${input.summary}${failureSuffix}`,
    };
  }
  return {
    title: LIVE_WORK_GROUP_TITLE,
    summary: input.summary,
    orbState: "listening",
    accessibilityLabel: `${LIVE_WORK_GROUP_TITLE} ${input.summary}${failureSuffix}`,
  };
}

export interface LiveThinkingRowPresentation {
  readonly label: string;
  readonly orbState: null;
  readonly showIcon: false;
}

export const LIVE_THINKING_ROW_PRESENTATION: LiveThinkingRowPresentation = {
  label: LIVE_THINKING_LABEL,
  orbState: null,
  showIcon: false,
};
