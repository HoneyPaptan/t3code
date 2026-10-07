import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/reactivity";
import { useCallback, useMemo } from "react";

import { resolveBackgroundPictureLook } from "../../../lib/backgroundPicture";
import {
  deleteBackgroundPicture,
  pickBackgroundPicture,
  type BackgroundPicturePick,
} from "../../../lib/backgroundPictureFile";
import { mobilePreferencesAtom, updateMobilePreferencesAtom } from "../../../state/preferences";

export function useBackgroundPicture() {
  const preferencesResult = useAtomValue(mobilePreferencesAtom);
  const savePreferences = useAtomSet(updateMobilePreferencesAtom);
  const stored = AsyncResult.isSuccess(preferencesResult) ? preferencesResult.value : null;
  const uri = stored?.backgroundPictureUri ?? null;
  const look = useMemo(() => resolveBackgroundPictureLook(stored ?? {}), [stored]);

  const choosePicture = useCallback(async (): Promise<BackgroundPicturePick> => {
    const pick = await pickBackgroundPicture();
    if (pick.type === "picked") {
      savePreferences({ backgroundPictureUri: pick.uri });
      deleteBackgroundPicture(uri);
    }
    return pick;
  }, [savePreferences, uri]);

  const removePicture = useCallback(() => {
    savePreferences({ backgroundPictureUri: null });
    deleteBackgroundPicture(uri);
  }, [savePreferences, uri]);

  const setStrength = useCallback(
    (backgroundPictureStrength: number) => savePreferences({ backgroundPictureStrength }),
    [savePreferences],
  );

  const setBlur = useCallback(
    (backgroundPictureBlur: number) => savePreferences({ backgroundPictureBlur }),
    [savePreferences],
  );

  return { uri, ...look, choosePicture, removePicture, setStrength, setBlur };
}
