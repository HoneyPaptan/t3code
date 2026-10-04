import { Modal, Pressable, View } from "react-native";

import { cn } from "../lib/cn";
import { AppText, AppTextInput } from "./AppText";
import type { ConfirmDialogRequest } from "./ConfirmDialog.types";

export interface ConfirmDialogCardProps {
  readonly request: Pick<
    ConfirmDialogRequest,
    "title" | "message" | "cancelText" | "confirmText" | "destructive"
  >;
  readonly isTextInput: boolean;
  readonly value: string;
  readonly onChangeText: (value: string) => void;
  readonly confirmDisabled: boolean;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

function DialogButton(props: {
  readonly label: string;
  readonly tone: "quiet" | "primary" | "danger";
  readonly disabled?: boolean;
  readonly onPress: () => void;
}) {
  return (
    <View className="overflow-hidden rounded-lg">
      <Pressable
        accessibilityRole="button"
        disabled={props.disabled}
        className="min-h-11 items-center justify-center px-4 active:bg-subtle"
        onPress={props.onPress}
      >
        <AppText
          className={cn(
            "text-sm font-t3-medium",
            props.tone === "quiet" && "text-foreground-muted",
            props.tone === "primary" && "text-primary-text",
            props.tone === "danger" && "text-danger-foreground",
            props.disabled && "opacity-45",
          )}
        >
          {props.label}
        </AppText>
      </Pressable>
    </View>
  );
}

export function ConfirmDialogCard(props: ConfirmDialogCardProps) {
  const { request } = props;
  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={props.onCancel}
    >
      <View className="flex-1 items-center justify-center bg-backdrop px-8">
        <View className="w-full max-w-sm rounded-2xl border border-border-subtle bg-grouped-card px-5 pb-3 pt-5">
          <AppText className="text-base font-t3-medium text-foreground">{request.title}</AppText>
          {props.isTextInput ? (
            <AppTextInput
              accessibilityLabel={request.title}
              autoFocus
              className="mt-4 min-h-11 rounded-lg border border-border-subtle bg-screen px-3 text-base text-foreground"
              onChangeText={props.onChangeText}
              onSubmitEditing={props.confirmDisabled ? undefined : props.onConfirm}
              returnKeyType="done"
              selectTextOnFocus
              value={props.value}
            />
          ) : request.message !== undefined ? (
            <AppText className="mt-2 text-sm text-foreground-muted">{request.message}</AppText>
          ) : null}
          <View className="mt-4 flex-row justify-end gap-1">
            <DialogButton
              label={request.cancelText ?? "Cancel"}
              tone="quiet"
              onPress={props.onCancel}
            />
            <DialogButton
              label={request.confirmText}
              tone={request.destructive ? "danger" : "primary"}
              disabled={props.confirmDisabled}
              onPress={props.onConfirm}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
