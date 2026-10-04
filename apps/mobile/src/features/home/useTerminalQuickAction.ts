import { useNavigation } from "@react-navigation/native";
import { useCallback, useMemo } from "react";

import { useNavigationThreadShells } from "../../state/entities";
import { resolveTerminalTarget } from "./terminalTarget";

export function useTerminalQuickAction(openThreadKey: string | null) {
  const navigation = useNavigation();
  const threads = useNavigationThreadShells();
  const target = useMemo(
    () => resolveTerminalTarget({ openThreadKey, threads, now: new Date().toISOString() }),
    [openThreadKey, threads],
  );
  const open = useCallback(() => {
    if (target !== null) navigation.navigate("ThreadTerminal", target);
  }, [navigation, target]);
  return { available: target !== null, open };
}
