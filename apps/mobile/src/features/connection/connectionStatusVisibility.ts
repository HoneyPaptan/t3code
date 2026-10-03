import type { EnvironmentConnectionPhase } from "@t3tools/client-runtime/connection";

export const OFF_STATUS_LABEL = "Off";

export function isStatusRestatedByIndicators(
  phase: EnvironmentConnectionPhase,
  statusLabel: string | null,
): boolean {
  return phase === "connected" || statusLabel === OFF_STATUS_LABEL;
}
