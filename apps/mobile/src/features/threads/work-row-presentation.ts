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

export function shouldShowWorkRowFailureGlyph(input: {
  readonly status: "success" | "failure" | "neutral" | null;
  readonly iconIsDestructive: boolean;
}): boolean {
  return input.status === "failure" && !input.iconIsDestructive;
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
