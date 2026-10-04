import { memo } from "react";
import { View } from "react-native";
import type { EnvironmentProject } from "@t3tools/client-runtime/state/shell";

import { ProjectFavicon } from "../../components/ProjectFavicon";
import { SymbolView } from "../../components/AppSymbol";
import { AppText } from "../../components/AppText";
import { cn } from "../../lib/cn";
import {
  projectIconColorClassNames,
  resolveProjectChipGlyph,
  type ProjectIconGlyph,
} from "../../lib/projectIcon";

export const NO_PROJECT_LABEL = "No project";

const CHIP_SLOT_CLASS_NAME = "size-5 items-center justify-center overflow-hidden rounded-md";
const NO_PROJECT_GLYPH_SIZE = 16;

function ProjectChipGlyph(props: { readonly glyph: ProjectIconGlyph }) {
  if (props.glyph.kind === "emoji") {
    return (
      <AppText allowFontScaling={false} className="text-xs leading-none">
        {props.glyph.emoji}
      </AppText>
    );
  }
  return (
    <AppText
      allowFontScaling={false}
      className={cn(
        "text-[9px] font-t3-bold leading-none",
        projectIconColorClassNames(props.glyph.color).text,
      )}
      numberOfLines={1}
    >
      {props.glyph.text}
    </AppText>
  );
}

export const ProjectChip = memo(function ProjectChip(props: {
  readonly projectTitle: string | null;
  readonly project?: EnvironmentProject | null;
  readonly dimmed?: boolean;
}) {
  const dimmedClassName = props.dimmed && "opacity-60";
  if (props.projectTitle === null) {
    return (
      <View className={cn(CHIP_SLOT_CLASS_NAME, dimmedClassName)}>
        <SymbolView
          name={{ ios: "folder", android: "folder" }}
          size={NO_PROJECT_GLYPH_SIZE}
          tintColorClassName="accent-foreground/40"
          type="monochrome"
        />
      </View>
    );
  }
  const projectIcon = props.project?.projectIcon;
  const glyph = resolveProjectChipGlyph(projectIcon, props.projectTitle);
  const glyphBackground =
    glyph.kind === "monogram" ? projectIconColorClassNames(glyph.color).background : undefined;
  const initials = (
    <View className={cn(CHIP_SLOT_CLASS_NAME, glyphBackground)}>
      <ProjectChipGlyph glyph={glyph} />
    </View>
  );
  if (props.project && !projectIcon) {
    return (
      <View className={cn(CHIP_SLOT_CLASS_NAME, dimmedClassName)}>
        <ProjectFavicon
          environmentId={props.project.environmentId}
          faviconPath={props.project.faviconPath}
          fallback={initials}
          projectTitle={props.projectTitle}
          size={20}
          workspaceRoot={props.project.workspaceRoot}
        />
      </View>
    );
  }
  return <View className={dimmedClassName || undefined}>{initials}</View>;
});
