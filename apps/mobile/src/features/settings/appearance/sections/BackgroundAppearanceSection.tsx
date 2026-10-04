import {
  MAX_BACKGROUND_PICTURE_BLUR,
  MAX_BACKGROUND_PICTURE_STRENGTH,
  MIN_BACKGROUND_PICTURE_BLUR,
  MIN_BACKGROUND_PICTURE_STRENGTH,
} from "@t3tools/contracts";
import { useState } from "react";
import { Alert } from "react-native";

import { SettingsActionRow } from "../../components/SettingsActionRow";
import { SettingsSection } from "../../components/SettingsSection";
import { FontSizeSliderRow } from "../components/FontSizeSliderRow";
import { useBackgroundPicture } from "../useBackgroundPicture";

export function BackgroundAppearanceSection() {
  const { uri, strength, blur, choosePicture, removePicture, setStrength, setBlur } =
    useBackgroundPicture();
  const [choosing, setChoosing] = useState(false);
  const hasPicture = uri !== null;

  const handleChoose = async () => {
    setChoosing(true);
    try {
      const pick = await choosePicture();
      if (pick.type === "failed") Alert.alert("Background picture not set", pick.message);
    } finally {
      setChoosing(false);
    }
  };

  return (
    <SettingsSection title="Background">
      <SettingsActionRow
        disabled={choosing}
        icon="photo"
        label={hasPicture ? "Change picture" : "Choose picture"}
        loading={choosing}
        onPress={() => void handleChoose()}
      />
      {hasPicture ? (
        <>
          <FontSizeSliderRow
            icon="sun.max"
            label="Strength"
            max={MAX_BACKGROUND_PICTURE_STRENGTH}
            min={MIN_BACKGROUND_PICTURE_STRENGTH}
            onChange={setStrength}
            step={5}
            value={strength}
            valueLabel={`${strength}%`}
          />
          <FontSizeSliderRow
            icon="eye"
            label="Blur"
            max={MAX_BACKGROUND_PICTURE_BLUR}
            min={MIN_BACKGROUND_PICTURE_BLUR}
            onChange={setBlur}
            step={1}
            value={blur}
            valueLabel={`${blur} px`}
          />
          <SettingsActionRow
            icon="trash"
            label="Remove picture"
            onPress={removePicture}
            tone="danger"
          />
        </>
      ) : null}
    </SettingsSection>
  );
}
