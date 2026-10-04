import {
  resolveProviderSkillSourceKind,
  type ProviderSkillSourceKind,
} from "@t3tools/client-runtime/providerSkills";
import type {
  PullRequestContextMetadata,
  ScopedThreadRef,
  ServerProviderSkill,
  ServerProviderSlashCommand,
} from "@t3tools/contracts";
import type { ComposerTriggerKind } from "@t3tools/shared/composerTrigger";
import { memo } from "react";
import { Pressable, ScrollView, View, useWindowDimensions, type ViewStyle } from "react-native";

import { SymbolView, type AppSymbolName } from "../../components/AppSymbol";
import { AppText as Text } from "../../components/AppText";
import { GlassSurface } from "../../components/GlassSurface";
import { PierreEntryIcon } from "../../components/PierreEntryIcon";
import { MOBILE_RADIUS } from "../../lib/radius";
import { composerCommandEmptyText, composerPopoverMaxHeight } from "./composerPathMenu";

export type ComposerCommandItem =
  | {
      readonly id: string;
      readonly type: "pull-request";
      readonly pullRequest: PullRequestContextMetadata;
      readonly label: string;
      readonly description: string;
    }
  | {
      readonly id: string;
      readonly type: "path";
      readonly path: string;
      readonly kind: "file" | "directory";
      readonly label: string;
      readonly description: string;
    }
  | {
      readonly id: string;
      readonly type: "thread";
      readonly thread: ScopedThreadRef;
      readonly label: string;
      readonly description: string;
    }
  | {
      readonly id: string;
      readonly type: "slash-command";
      readonly command: string;
      readonly label: string;
      readonly description: string;
    }
  | {
      readonly id: string;
      readonly type: "provider-slash-command";
      readonly command: ServerProviderSlashCommand;
      readonly label: string;
      readonly description: string;
    }
  | {
      readonly id: string;
      readonly type: "skill";
      readonly skill: ServerProviderSkill;
      readonly label: string;
      readonly description: string;
    };

interface ComposerCommandPopoverProps {
  readonly items: ReadonlyArray<ComposerCommandItem>;
  readonly triggerKind: ComposerTriggerKind | null;
  readonly isLoading: boolean;
  readonly hasProject: boolean;
  readonly error?: string | null;
  readonly onSelect: (item: ComposerCommandItem) => void;
}

function PopoverSurface(props: { readonly children: React.ReactNode; readonly style?: ViewStyle }) {
  const baseStyle: ViewStyle = {
    borderRadius: MOBILE_RADIUS.xl,
    overflow: "hidden",
    ...props.style,
  };

  return (
    <GlassSurface
      glassEffectStyle="clear"
      tintColorClassName="accent-glass-surface"
      fallbackClassName="border-border-subtle"
      style={baseStyle}
    >
      {props.children}
    </GlassSurface>
  );
}

const SKILL_SOURCE_SYMBOL_BY_KIND: Record<ProviderSkillSourceKind, AppSymbolName> = {
  app: "square.grid.2x2",
  repo: "folder",
  project: "folder",
  personal: "person.crop.circle",
  system: "gearshape",
  other: "cube",
};

function itemIcon(item: ComposerCommandItem): AppSymbolName | null {
  switch (item.type) {
    case "pull-request":
      return { ios: "arrow.triangle.pull", android: "merge" };
    case "slash-command":
    case "provider-slash-command":
      return "terminal";
    case "skill":
      return SKILL_SOURCE_SYMBOL_BY_KIND[resolveProviderSkillSourceKind(item.skill)];
    case "path":
      return null;
    case "thread":
      return "text.bubble";
  }
}

function groupLabel(triggerKind: ComposerTriggerKind | null): string | null {
  switch (triggerKind) {
    case "pull-request":
      return "Pull requests";
    case "slash-command":
      return "Commands";
    case "skill":
      return "Skills";
    case "path":
      return "Files";
    default:
      return null;
  }
}

const CommandRow = memo(function CommandRow(props: {
  readonly item: ComposerCommandItem;
  readonly onPress: () => void;
  readonly isSlashSkill: boolean;
}) {
  const iconName = itemIcon(props.item);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={props.onPress}
      className="min-h-11 flex-row items-center gap-2 rounded-md px-2.5 active:bg-subtle"
    >
      {props.item.type === "path" ? (
        <PierreEntryIcon path={props.item.path} kind={props.item.kind} size={16} />
      ) : iconName ? (
        <SymbolView
          name={iconName}
          size={14}
          tintColorClassName={"accent-icon-subtle"}
          type="monochrome"
        />
      ) : null}
      <Text className="shrink-0 text-sm font-t3-medium text-foreground" numberOfLines={1}>
        {props.isSlashSkill && props.item.type === "skill" ? (
          <>
            <Text className="text-foreground-muted">skill:</Text>
            {props.item.skill.name}
          </>
        ) : (
          props.item.label
        )}
      </Text>
      {props.item.description ? (
        <Text className="min-w-0 flex-1 text-xs text-foreground-muted/60" numberOfLines={1}>
          {props.item.description}
        </Text>
      ) : null}
    </Pressable>
  );
});

export const ComposerCommandPopover = memo(function ComposerCommandPopover(
  props: ComposerCommandPopoverProps,
) {
  const label = groupLabel(props.triggerKind);
  const { height: windowHeight } = useWindowDimensions();

  return (
    <PopoverSurface>
      {label ? (
        <View className="px-3 pt-2 pb-1">
          <Text className="text-xs text-foreground-muted/50">{label}</Text>
        </View>
      ) : null}
      {props.items.length > 0 ? (
        <ScrollView
          className="px-1.5 pb-1.5"
          keyboardDismissMode="none"
          keyboardShouldPersistTaps="always"
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: composerPopoverMaxHeight(windowHeight) }}
        >
          {props.items.map((item) => (
            <CommandRow
              key={item.id}
              item={item}
              onPress={() => props.onSelect(item)}
              isSlashSkill={props.triggerKind === "slash-command" && item.type === "skill"}
            />
          ))}
        </ScrollView>
      ) : (
        <View className="min-h-11 justify-center px-3.5 pb-1.5">
          <Text className="text-xs text-foreground-muted/60">
            {props.error ??
              composerCommandEmptyText({
                triggerKind: props.triggerKind,
                isLoading: props.isLoading,
                hasProject: props.hasProject,
              })}
          </Text>
        </View>
      )}
    </PopoverSurface>
  );
});
