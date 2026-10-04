import { useState } from "react";

import { ConfirmDialogCard } from "./ConfirmDialogCard";
import type { MaterialConfirmDialogProps } from "./MaterialConfirmDialog";

export function MaterialConfirmDialog(props: MaterialConfirmDialogProps) {
  const isTextInput = props.inputInitialValue !== undefined;
  const [value, setValue] = useState(props.inputInitialValue ?? "");
  const changeText = (next: string) => {
    setValue(next);
    props.onInputChange?.(next);
  };
  const confirmDisabled = (props.confirmDisabled ?? false) || (isTextInput && !value.trim());
  const confirm = () => {
    if (confirmDisabled) return;
    props.onConfirm(isTextInput ? value : undefined);
  };
  return (
    <ConfirmDialogCard
      request={props.request}
      isTextInput={isTextInput}
      value={value}
      onChangeText={changeText}
      confirmDisabled={confirmDisabled}
      onCancel={props.onCancel}
      onConfirm={confirm}
    />
  );
}
