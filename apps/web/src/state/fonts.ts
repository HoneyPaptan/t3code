import { createFontsEnvironmentAtoms } from "@t3tools/client-runtime/state/fonts";
import { assetUrlStateFromResult } from "@t3tools/client-runtime/state/assets";
import type { EnvironmentId, FontsListResult } from "@t3tools/contracts";
import { useCallback, useMemo } from "react";

import { connectionAtomRuntime } from "../connection/runtime";
import {
  listServerFontFamilies,
  type ServerFontFamily,
  type ServerFontUrlResolver,
} from "../serverFonts";
import { assetEnvironment } from "./assets";
import { useConnectedEnvironmentIds } from "./environments";
import { type EnvironmentQueryView, useEnvironmentQuery } from "./query";
import { usePreparedConnection } from "./session";
import { useAtomQueryRunner } from "./use-atom-query-runner";

export const fontsEnvironment = createFontsEnvironmentAtoms(connectionAtomRuntime);

const NO_FAMILIES: ReadonlyArray<ServerFontFamily> = [];

export function useFontEnvironmentId(): EnvironmentId | null {
  const connected = useConnectedEnvironmentIds();
  return connected[0] ?? null;
}

export function useServerFontCatalog(
  environmentId: EnvironmentId | null,
): EnvironmentQueryView<FontsListResult> {
  return useEnvironmentQuery(
    environmentId === null ? null : fontsEnvironment.list({ environmentId, input: {} }),
  );
}

export function useServerFontFamilies(): ReadonlyArray<ServerFontFamily> {
  const environmentId = useFontEnvironmentId();
  const catalog = useServerFontCatalog(environmentId);
  const fonts = catalog.data?.fonts;
  return useMemo(
    () => (fonts === undefined ? NO_FAMILIES : listServerFontFamilies(fonts)),
    [fonts],
  );
}

export function useServerFontFamilyNames(): ReadonlyArray<string> {
  const families = useServerFontFamilies();
  return useMemo(() => families.map((entry) => entry.family), [families]);
}

export function useServerFontUrlResolver(
  environmentId: EnvironmentId | null,
): ServerFontUrlResolver {
  const connection = usePreparedConnection(environmentId);
  const httpBaseUrl = connection._tag === "Some" ? connection.value.httpBaseUrl : null;
  const createUrl = useAtomQueryRunner(assetEnvironment.createUrl, {
    refresh: true,
    reportFailure: false,
  });
  return useCallback(
    async (fontId) => {
      if (environmentId === null || httpBaseUrl === null) return null;
      const resource = { _tag: "server-font", fontId } as const;
      const state = assetUrlStateFromResult(
        await createUrl({ environmentId, input: { resource } }),
        httpBaseUrl,
      );
      return state._tag === "Success" ? state.url : null;
    },
    [createUrl, environmentId, httpBaseUrl],
  );
}
