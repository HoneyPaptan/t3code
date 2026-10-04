import type { StyleProp, ViewStyle } from "react-native";

import { MaterialFloatingActionButton } from "./MaterialFloatingActionButton.shared";

export function MaterialScrollComposeButton(props: {
  readonly expanded: boolean;
  readonly onPress: () => void;
  readonly className?: string;
  readonly style?: StyleProp<ViewStyle>;
}) {
  return (
    <MaterialFloatingActionButton
      icon="square.and.pencil"
      label="New thread"
      tone="primary"
      variant="extended"
      expanded={props.expanded}
      onPress={props.onPress}
      className={props.className}
      style={props.style}
    />
  );
}
