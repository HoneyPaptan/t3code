import type { ReactNode } from "react";
import { View } from "react-native";

import {
  COMPOSER_STRIP_INSET,
  COMPOSER_STRIP_OVERLAP,
  COMPOSER_STRIP_PADDING_BOTTOM,
  COMPOSER_STRIP_PADDING_END,
  COMPOSER_STRIP_PADDING_START,
  COMPOSER_STRIP_PADDING_TOP,
  COMPOSER_STRIP_RADIUS,
  COMPOSER_SURFACE_BORDER_WIDTH,
} from "./composerChrome";

export function ComposerModelStrip(props: { readonly children: ReactNode }) {
  return (
    <View
      className="border-border-subtle bg-grouped-card"
      style={{
        zIndex: 0,
        marginTop: -COMPOSER_STRIP_OVERLAP,
        marginHorizontal: COMPOSER_STRIP_INSET,
        borderWidth: COMPOSER_SURFACE_BORDER_WIDTH,
        borderTopWidth: 0,
        borderBottomLeftRadius: COMPOSER_STRIP_RADIUS,
        borderBottomRightRadius: COMPOSER_STRIP_RADIUS,
        paddingTop: COMPOSER_STRIP_PADDING_TOP,
        paddingBottom: COMPOSER_STRIP_PADDING_BOTTOM,
        paddingStart: COMPOSER_STRIP_PADDING_START,
        paddingEnd: COMPOSER_STRIP_PADDING_END,
      }}
    >
      {props.children}
    </View>
  );
}
