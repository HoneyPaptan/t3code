import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { useCallback, useMemo } from "react";
import { AsyncResult } from "effect/reactivity";

import { createExternalStore } from "../../../lib/externalStore";
import { withFontChoice, type FontPreferences } from "../../../lib/fontPreferences";
import { applyServerFont, type FontKind } from "../../../lib/serverFonts";
import {
  listFontFamilies,
  planFontChoice,
  type FontFamilyEntry,
} from "../../../lib/serverFontPlan";
import {
  useFontEnvironmentId,
  useServerFontCatalog,
  useServerFontUrlResolver,
} from "../../../state/fonts";
import { mobilePreferencesAtom, updateMobilePreferencesAtom } from "../../../state/preferences";

export type ServerFontStatus = "idle" | "loading" | "failed";

const statusStores = {
  sans: createExternalStore<ServerFontStatus>("idle"),
  mono: createExternalStore<ServerFontStatus>("idle"),
};

export function useServerFontStatus(kind: FontKind): ServerFontStatus {
  return statusStores[kind].use();
}

export function useFontPreferences(): FontPreferences | undefined {
  const result = useAtomValue(mobilePreferencesAtom);
  return AsyncResult.isSuccess(result) ? result.value.fonts : undefined;
}

export function useServerFontSelection(kind: FontKind) {
  const environmentId = useFontEnvironmentId();
  const catalog = useServerFontCatalog(environmentId);
  const resolveUrl = useServerFontUrlResolver(environmentId);
  const savePreferences = useAtomSet(updateMobilePreferencesAtom);
  const fonts = catalog.data?.fonts;
  const families = useMemo(() => listFontFamilies(fonts ?? []), [fonts]);

  const select = useCallback(
    (entry: FontFamilyEntry | null) => {
      const status = statusStores[kind];
      const choice = entry === null ? null : planFontChoice(fonts ?? [], entry, kind === "sans");
      status.set("loading");
      applyServerFont(kind, choice, resolveUrl).then(
        () => {
          status.set("idle");
          savePreferences({
            transform: (current) => ({ fonts: withFontChoice(current.fonts, kind, choice) }),
          });
        },
        () => status.set("failed"),
      );
    },
    [fonts, kind, resolveUrl, savePreferences],
  );

  return {
    families,
    select,
    isConnected: environmentId !== null,
    isLoadingCatalog: catalog.isPending && fonts === undefined,
    catalogFailed: catalog.error !== null && fonts === undefined,
  };
}
