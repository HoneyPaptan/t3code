import { createFontsEnvironmentAtoms } from "@t3tools/client-runtime/state/fonts";
import { assetUrlStateFromResult } from "@t3tools/client-runtime/state/assets";
import type { EnvironmentId, FontsListResult } from "@t3tools/contracts";
import { useCallback } from "react";

import { connectionAtomRuntime } from "../connection/runtime";
import type { FontFace } from "../lib/fontPreferences";
import { assetEnvironment } from "./assets";
import { useEnvironments } from "./environments";
import { type EnvironmentQueryView, useEnvironmentQuery } from "./query";
import { usePreparedConnection } from "./session";
import { useAtomQueryRunner } from "./use-atom-query-runner";

export const fontsEnvironment = createFontsEnvironmentAtoms(connectionAtomRuntime);

export function useFontEnvironmentId(): EnvironmentId | null {
  const { environments } = useEnvironments();
  return (
    environments.find((environment) => environment.connection.phase === "connected")
      ?.environmentId ?? null
  );
}

export function useServerFontCatalog(
  environmentId: EnvironmentId | null,
): EnvironmentQueryView<FontsListResult> {
  return useEnvironmentQuery(
    environmentId === null ? null : fontsEnvironment.list({ environmentId, input: {} }),
  );
}

export function useServerFontUrlResolver(
  environmentId: EnvironmentId | null,
): (face: FontFace) => Promise<string | null> {
  const connection = usePreparedConnection(environmentId);
  const httpBaseUrl = connection._tag === "Some" ? connection.value.httpBaseUrl : null;
  const createUrl = useAtomQueryRunner(assetEnvironment.createUrl, {
    refresh: true,
    reportFailure: false,
  });
  return useCallback(
    async (face) => {
      if (environmentId === null || httpBaseUrl === null) return null;
      const resource = { _tag: "server-font", fontId: face.fontId } as const;
      const state = assetUrlStateFromResult(
        await createUrl({ environmentId, input: { resource } }),
        httpBaseUrl,
      );
      return state._tag === "Success" ? state.url : null;
    },
    [createUrl, environmentId, httpBaseUrl],
  );
}
