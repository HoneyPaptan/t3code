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
