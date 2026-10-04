import { useAtomValue } from "@effect/atom-react";
import { Atom } from "effect/reactivity";
import * as Linking from "expo-linking";
import { useEffect, useMemo } from "react";
import { Platform } from "react-native";
import { environmentCatalog } from "../connection/catalog";
import { useAppearancePreferences } from "../features/settings/appearance/AppearancePreferencesProvider";
import { environmentPresentations } from "../state/presentation";
import { publishSubscriptionUsage } from "./publishSubscriptionUsage";
import { useSubscriptionUsage } from "./useSubscriptionUsage";
import { buildSubscriptionUsageSnapshot } from "./subscriptionUsageSnapshot";
import { createSubscriptionUsagePalette } from "./subscriptionUsageThemePalette";

const snapshotAtom = Atom.make((get) =>
  buildSubscriptionUsageSnapshot(
    get(environmentPresentations.presentationsAtom),
    Linking.createURL("settings/usage", { queryParams: { tab: "limits" } }),
    // Android scrolls the full list; iOS stores a bounded widget timeline.
    Platform.OS === "android" ? Infinity : 6,
  ),
).pipe(Atom.withEquality((a, b) => JSON.stringify(a) === JSON.stringify(b)));

export function SubscriptionUsageCoordinator() {
  const catalog = useAtomValue(environmentCatalog.catalogValueAtom);
  const snapshot = useAtomValue(snapshotAtom);
  const { themeVariables } = useAppearancePreferences();
  const palette = useMemo(() => createSubscriptionUsagePalette(themeVariables), [themeVariables]);
  useSubscriptionUsage(catalog.isReady);
  useEffect(() => {
    if (!catalog.isReady) return;
    void Promise.resolve()
      .then(() => publishSubscriptionUsage({ ...snapshot, palette }))
      .catch((error: unknown) => {
        console.warn("Could not update subscription usage widget", error);
      });
  }, [catalog.isReady, snapshot, palette]);
  return null;
}
