import { useEffect } from "react";

import { useClientSettings } from "../hooks/useSettings";
import { ensureServerFontFamilyLoaded, findServerFontFamily } from "../serverFonts";
import {
  useFontEnvironmentId,
  useServerFontFamilies,
  useServerFontUrlResolver,
} from "../state/fonts";

export function ServerFontSync() {
  const environmentId = useFontEnvironmentId();
  const families = useServerFontFamilies();
  const resolveUrl = useServerFontUrlResolver(environmentId);
  const fontFamilySans = useClientSettings((settings) => settings.fontFamilySans);
  const fontFamilyCode = useClientSettings((settings) => settings.fontFamilyCode);
  const fontFamilyComposer = useClientSettings((settings) => settings.fontFamilyComposer);
  const fontFamilyTerminal = useClientSettings((settings) => settings.fontFamilyTerminal);

  useEffect(() => {
    const wanted = new Set([
      fontFamilySans,
      fontFamilyCode,
      fontFamilyComposer,
      fontFamilyTerminal,
    ]);
    for (const name of wanted) {
      const entry = findServerFontFamily(families, name);
      if (entry === null) continue;
      void ensureServerFontFamilyLoaded(entry, resolveUrl).catch(() => undefined);
    }
  }, [
    families,
    fontFamilyCode,
    fontFamilyComposer,
    fontFamilySans,
    fontFamilyTerminal,
    resolveUrl,
  ]);

  return null;
}
