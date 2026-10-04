import type { ProviderInteractionMode, RuntimeMode } from "@t3tools/contracts";
import type { ComponentProps, ReactNode } from "react";
import { View } from "react-native";

import { ComposerAttachmentButton } from "../../components/ComposerAttachmentButton";
import {
  type ComposerControlSize,
  ComposerControlSeparator,
  ComposerInlineControl,
  ComposerToolbarScroller,
} from "../../components/ComposerToolbar";
import { ProviderIcon } from "../../components/ProviderIcon";
import type { ModelOption } from "../../lib/modelOptions";
import { runtimeModeLabel } from "./thread-settings-options";

const PLAN_ICON = { ios: "list.bullet.clipboard", android: "auto_awesome" } as const;
const LOCK_ICON = { ios: "lock", android: "lock" } as const;
const BUILD_ICON = { ios: "hammer", android: "construction" } as const;
const COMPOSER_CONTROL_GAP = 4;

export function ComposerFooterControls(props: {
  readonly attachment: ComponentProps<typeof ComposerAttachmentButton>;
  readonly attachmentPlacement?: "leading" | "trailing";
  readonly disabled?: boolean;
  readonly interactionMode?: {
    readonly mode: ProviderInteractionMode;
    readonly onToggle: () => void;
  };
  readonly modelFallbackLabel: string;
  readonly modelOption: ModelOption | null;
  readonly onOpenSettings: () => void;
  readonly reasoningLabel: string | null;
  readonly runtimeMode: RuntimeMode;
  readonly size?: ComposerControlSize;
}) {
  const size = props.size ?? "sm";
  const isPlan = props.interactionMode?.mode === "plan";
  const attachmentButton = <ComposerAttachmentButton {...props.attachment} />;
  const isTrailingAttachment = props.attachmentPlacement === "trailing";
  const controls = (
    <>
      <ComposerInlineControl
        accessibilityLabel="Model and reasoning settings"
        disabled={props.disabled}
        renderIcon={(iconSize) => (
          <ProviderIcon
            iconUrl={props.modelOption?.providerIconUrl}
            provider={props.modelOption?.providerDriver}
            size={iconSize}
          />
        )}
        label={props.modelOption?.label ?? props.modelFallbackLabel}
        onPress={props.onOpenSettings}
        size={size}
      />
      {props.reasoningLabel === null ? null : (
        <ComposerInlineControl
          accessibilityLabel={`Reasoning: ${props.reasoningLabel}`}
          disabled={props.disabled}
          label={props.reasoningLabel}
          onPress={props.onOpenSettings}
          quiet
          size={size}
        />
      )}
      <ComposerControlSeparator size={size} />
      <ComposerInlineControl
        accessibilityLabel={`Access: ${runtimeModeLabel(props.runtimeMode)}`}
        disabled={props.disabled}
        icon={LOCK_ICON}
        label={runtimeModeLabel(props.runtimeMode)}
        onPress={props.onOpenSettings}
        size={size}
      />
      {props.interactionMode === undefined ? null : (
        <>
          <ComposerControlSeparator size={size} />
          <ComposerInlineControl
            accessibilityHint={`Switches to ${isPlan ? "Build" : "Plan"} mode`}
            accessibilityLabel={`Interaction mode: ${isPlan ? "Plan" : "Build"}`}
            disabled={props.disabled}
            icon={isPlan ? PLAN_ICON : BUILD_ICON}
            label={isPlan ? "Plan" : "Build"}
            onPress={props.interactionMode.onToggle}
            selected={isPlan}
            showChevron={false}
            size={size}
          />
        </>
      )}
    </>
  );
  return (
    <View className="min-w-0 flex-1 flex-row items-center gap-2">
      {isTrailingAttachment ? null : attachmentButton}
      <ComposerControlTrack size={size}>{controls}</ComposerControlTrack>
      {isTrailingAttachment ? attachmentButton : null}
    </View>
  );
}

function ComposerControlTrack(props: {
  readonly children: ReactNode;
  readonly size: ComposerControlSize;
}) {
  if (props.size === "xs") {
    return (
      <View className="min-w-0 flex-1 flex-row items-center gap-1 overflow-hidden">
        {props.children}
      </View>
    );
  }
  return (
    <ComposerToolbarScroller gap={COMPOSER_CONTROL_GAP}>{props.children}</ComposerToolbarScroller>
  );
}
