import { ActivityIndicator, View } from "react-native";

import { SymbolView } from "../../components/AppSymbol";
import { ThinkingOrb } from "../../components/ThinkingOrb";
import {
  THREAD_LIST_V2_STATUS_GLYPH_LABEL,
  THREAD_LIST_V2_STATUS_GLYPH_SYMBOL,
  type ThreadListV2StatusGlyph,
} from "./thread-list-v2-status-glyph";

const STATUS_GLYPH_SIZE = 14;
const DEFAULT_STATUS_SLOT_SIZE = 16;
const ORB_MIN_SLOT_SIZE = 20;

export function ThreadStatusGlyph(props: {
  readonly glyph: ThreadListV2StatusGlyph;
  readonly iconTintClassName: string;
  readonly slotSize?: number;
}) {
  const slotSize = props.slotSize ?? DEFAULT_STATUS_SLOT_SIZE;
  return (
    <View
      accessible
      accessibilityLabel={THREAD_LIST_V2_STATUS_GLYPH_LABEL[props.glyph]}
      className="items-center justify-center"
      style={{ width: slotSize, height: slotSize }}
    >
      {props.glyph === "running" ? (
        slotSize >= ORB_MIN_SLOT_SIZE ? (
          <ThinkingOrb state="working" size={ORB_MIN_SLOT_SIZE} />
        ) : (
          <ActivityIndicator colorClassName={props.iconTintClassName} size="small" />
        )
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
