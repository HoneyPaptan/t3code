import { memo } from "react";
import { View } from "react-native";
import type { ProjectIconOverride } from "@t3tools/contracts";

import { AppText } from "../../components/AppText";
import { cn } from "../../lib/cn";
import { projectIconColorClassNames, resolveProjectChipGlyph } from "../../lib/projectIcon";

export const NO_PROJECT_LABEL = "No project";

const CHIP_CLASS_NAME = "size-4 items-center justify-center rounded-sm";

export const ProjectChip = memo(function ProjectChip(props: {
  readonly projectTitle: string | null;
  readonly projectIcon?: ProjectIconOverride | null;
  readonly dimmed?: boolean;
}) {
  if (props.projectTitle === null) {
    return (
      <View
        className={cn(
          CHIP_CLASS_NAME,
          "border border-dashed border-border",
          props.dimmed && "opacity-60",
        )}
      />
    );
  }
  const glyph = resolveProjectChipGlyph(props.projectIcon, props.projectTitle);
  if (glyph.kind === "emoji") {
    return (
      <View className={cn(CHIP_CLASS_NAME, props.dimmed && "opacity-60")}>
        <AppText allowFontScaling={false} className="text-[10px]">
          {glyph.emoji}
        </AppText>
      </View>
    );
  }
  const colors = projectIconColorClassNames(glyph.color);
  return (
    <View className={cn(CHIP_CLASS_NAME, colors.background, props.dimmed && "opacity-60")}>
      <AppText
        allowFontScaling={false}
        className={cn("text-[10px] font-t3-bold", colors.text)}
        numberOfLines={1}
      >
        {glyph.text}
      </AppText>
    </View>
  );
});
