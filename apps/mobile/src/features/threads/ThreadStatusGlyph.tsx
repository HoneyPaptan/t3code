import { ActivityIndicator, View } from "react-native";

import { SymbolView } from "../../components/AppSymbol";
import {
  THREAD_LIST_V2_STATUS_GLYPH_LABEL,
  THREAD_LIST_V2_STATUS_GLYPH_SYMBOL,
  type ThreadListV2StatusGlyph,
} from "./thread-list-v2-status-glyph";

const STATUS_GLYPH_SIZE = 14;

export function ThreadStatusGlyph(props: {
  readonly glyph: ThreadListV2StatusGlyph;
  readonly iconTintClassName: string;
}) {
  return (
    <View
      accessible
      accessibilityLabel={THREAD_LIST_V2_STATUS_GLYPH_LABEL[props.glyph]}
      className="size-4 items-center justify-center"
    >
      {props.glyph === "running" ? (
        <ActivityIndicator colorClassName={props.iconTintClassName} size="small" />
      ) : (
        <SymbolView
          name={THREAD_LIST_V2_STATUS_GLYPH_SYMBOL[props.glyph]}
          size={STATUS_GLYPH_SIZE}
          tintColorClassName={props.iconTintClassName}
          type="monochrome"
        />
      )}
    </View>
  );
}
