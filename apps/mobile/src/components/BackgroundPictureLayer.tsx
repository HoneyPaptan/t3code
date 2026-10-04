import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { useAppearancePreferences } from "../features/settings/appearance/AppearancePreferencesProvider";
import { useBackgroundPicture } from "../features/settings/appearance/useBackgroundPicture";
import { backgroundPictureBlurRadius } from "../lib/backgroundPicture";

export function BackgroundPictureLayer() {
  const { themeAppearance } = useAppearancePreferences();
  const { uri, strength, blur } = useBackgroundPicture();
  if (uri === null) return null;
  const dark = themeAppearance === "dark";

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: dark ? "#000000" : "#ffffff",
          mixBlendMode: dark ? "screen" : "multiply",
        },
      ]}
    >
      <Image
        blurRadius={backgroundPictureBlurRadius(blur)}
        contentFit="cover"
        source={{ uri }}
        style={[StyleSheet.absoluteFill, { opacity: strength / 100 }]}
      />
    </View>
  );
}
