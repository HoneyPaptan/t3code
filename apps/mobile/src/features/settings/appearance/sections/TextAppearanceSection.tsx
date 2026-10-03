import { useState } from "react";

import {
  BASE_FONT_SIZE_STEP,
  MAX_BASE_FONT_SIZE,
  MIN_BASE_FONT_SIZE,
} from "../../../../lib/appearancePreferences";
import { SettingsSection } from "../../components/SettingsSection";
import { useAppearancePreferences } from "../AppearancePreferencesProvider";
import {
  AppearancePreviewSeparator,
  TextAppearancePreview,
} from "../components/AppearancePreviews";
import { FontSizeSliderRow } from "../components/FontSizeSliderRow";
import { ServerFontRow } from "../components/ServerFontRow";
import { ServerFontSheet } from "../components/ServerFontSheet";
import { useFontPreferences, useServerFontStatus } from "../serverFontSelection";

const DEFAULT_FAMILY_LABEL = "Geist";

export function TextAppearanceSection() {
  const { isReady, appearance, setBaseFontSize } = useAppearancePreferences();
  const fonts = useFontPreferences();
  const sansStatus = useServerFontStatus("sans");
  const monoStatus = useServerFontStatus("mono");
  const [openSheet, setOpenSheet] = useState<"sans" | "mono" | null>(null);

  return (
    <SettingsSection title="Text">
      <TextAppearancePreview fontSize={appearance.baseFontSize} />
      <AppearancePreviewSeparator />
      <FontSizeSliderRow
        disabled={!isReady}
        icon="textformat.size"
        label="Text size"
        max={MAX_BASE_FONT_SIZE}
        min={MIN_BASE_FONT_SIZE}
        onChange={setBaseFontSize}
        step={BASE_FONT_SIZE_STEP}
        value={appearance.baseFontSize}
        valueLabel={`${appearance.baseFontSize} pt`}
      />
      <AppearancePreviewSeparator />
      <ServerFontRow
        icon="textformat.size"
        label="App font"
        familyLabel={fonts?.sans?.family ?? DEFAULT_FAMILY_LABEL}
        status={sansStatus}
        onPress={() => setOpenSheet("sans")}
      />
      <AppearancePreviewSeparator />
      <ServerFontRow
        icon="chevron.left.forwardslash.chevron.right"
        label="Code font"
        familyLabel={fonts?.mono?.family ?? DEFAULT_FAMILY_LABEL}
        status={monoStatus}
        onPress={() => setOpenSheet("mono")}
      />
      <ServerFontSheet
        kind="sans"
        title="App font"
        selectedFamily={fonts?.sans?.family ?? null}
        visible={openSheet === "sans"}
        onClose={() => setOpenSheet(null)}
      />
      <ServerFontSheet
        kind="mono"
        title="Code font"
        selectedFamily={fonts?.mono?.family ?? null}
        visible={openSheet === "mono"}
        onClose={() => setOpenSheet(null)}
      />
    </SettingsSection>
  );
}
