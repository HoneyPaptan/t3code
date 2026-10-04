import { useMemo } from "react";

import { fontFamilyStore } from "../../lib/fontFamilyStore";
import { cachedFacePath } from "../../lib/serverFonts";
import { useFontPreferences } from "../settings/appearance/serverFontSelection";
import { resolveTerminalFontFaces, type TerminalFontFaces } from "./terminalFontFaces";

export function useTerminalFontFaces(): TerminalFontFaces | null {
  const choice = useFontPreferences()?.mono;
  const activeMonoName = fontFamilyStore.use().mono;
  return useMemo(
    () => resolveTerminalFontFaces({ choice, activeMonoName, facePath: cachedFacePath }),
    [choice, activeMonoName],
  );
}
