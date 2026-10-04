import type { MenuAction } from "@react-native-menu/menu";

export interface MaterialMenuPopupProps {
  readonly actions: readonly MenuAction[];
  readonly title?: string;
  readonly parent: MenuAction | null;
  readonly onPress: (action: MenuAction) => void;
  readonly onBack: () => void;
}

export function MaterialMenuPopup(_props: MaterialMenuPopupProps) {
  return null;
}
