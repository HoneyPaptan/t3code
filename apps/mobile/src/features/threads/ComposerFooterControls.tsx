import type { ProviderInteractionMode, RuntimeMode } from "@t3tools/contracts";
import type { ComponentProps } from "react";
import { ScrollView, View } from "react-native";

import { ComposerAttachmentButton } from "../../components/ComposerAttachmentButton";
import { ComposerInlineControl } from "../../components/ComposerToolbar";
import { ProviderIcon } from "../../components/ProviderIcon";
import type { ModelOption } from "../../lib/modelOptions";
import { runtimeModeLabel } from "./thread-settings-options";

const PLAN_ICON = { ios: "list.bullet.clipboard", android: "auto_awesome" } as const;
const LOCK_ICON = { ios: "lock", android: "lock" } as const;
const BUILD_ICON = { ios: "hammer", android: "construction" } as const;

export function ComposerFooterControls(props: {
  readonly attachment: ComponentProps<typeof ComposerAttachmentButton>;
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
}) {
  const isPlan = props.interactionMode?.mode === "plan";
  return (
    <View className="min-w-0 flex-1 flex-row items-center gap-0.5">
      <ComposerAttachmentButton {...props.attachment} />
      <ScrollView
        horizontal
        className="min-w-0 flex-1"
        contentContainerClassName="items-center gap-0.5"
        keyboardShouldPersistTaps="always"
        showsHorizontalScrollIndicator={false}
      >
        <ComposerInlineControl
          accessibilityLabel="Model and reasoning settings"
          disabled={props.disabled}
          renderIcon={(size) => (
            <ProviderIcon
              iconUrl={props.modelOption?.providerIconUrl}
              provider={props.modelOption?.providerDriver}
              size={size}
            />
          )}
          label={props.modelOption?.label ?? props.modelFallbackLabel}
          onPress={props.onOpenSettings}
        />
        {props.reasoningLabel === null ? null : (
          <ComposerInlineControl
            accessibilityLabel={`Reasoning: ${props.reasoningLabel}`}
            disabled={props.disabled}
            label={props.reasoningLabel}
            onPress={props.onOpenSettings}
            quiet
          />
        )}
        <ComposerInlineControl
          accessibilityLabel={`Access: ${runtimeModeLabel(props.runtimeMode)}`}
          disabled={props.disabled}
          icon={LOCK_ICON}
          label={runtimeModeLabel(props.runtimeMode)}
          onPress={props.onOpenSettings}
        />
        {props.interactionMode === undefined ? null : (
          <ComposerInlineControl
            accessibilityHint={`Switches to ${isPlan ? "Build" : "Plan"} mode`}
            accessibilityLabel={`Interaction mode: ${isPlan ? "Plan" : "Build"}`}
            disabled={props.disabled}
            icon={isPlan ? PLAN_ICON : BUILD_ICON}
            label={isPlan ? "Plan" : "Build"}
            onPress={props.interactionMode.onToggle}
            showChevron={false}
          />
        )}
      </ScrollView>
    </View>
  );
}
