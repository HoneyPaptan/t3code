import type { MenuAction } from "@react-native-menu/menu";

export type MenuRow = {
  readonly action: MenuAction;
  readonly separatorBefore: boolean;
};

const isVisible = (action: MenuAction) => !(action.attributes?.hidden ?? false);
const isDestructive = (action: MenuAction) => action.attributes?.destructive ?? false;
const isInlineGroup = (action: MenuAction) => action.displayInline ?? false;

function startsDestructiveRun(action: MenuAction, previous: MenuAction | undefined) {
  return previous !== undefined && isDestructive(action) && !isDestructive(previous);
}

function splitBeforeDestructive(group: readonly MenuAction[]): MenuAction[][] {
  const groups: MenuAction[][] = [];
  group.forEach((action, index) => {
    const current = groups[groups.length - 1];
    if (current === undefined || startsDestructiveRun(action, group[index - 1])) {
      groups.push([action]);
    } else {
      current.push(action);
    }
  });
  return groups;
}

function collectGroups(actions: readonly MenuAction[]): MenuAction[][] {
  const groups: MenuAction[][] = [];
  let loose: MenuAction[] = [];
  const closeLoose = () => {
    if (loose.length > 0) groups.push(loose);
    loose = [];
  };
  for (const action of actions.filter(isVisible)) {
    if (isInlineGroup(action)) {
      closeLoose();
      groups.push((action.subactions ?? []).filter(isVisible));
    } else {
      loose.push(action);
    }
  }
  closeLoose();
  return groups;
}

export function resolveMenuRows(actions: readonly MenuAction[]): MenuRow[] {
  return collectGroups(actions)
    .flatMap(splitBeforeDestructive)
    .flatMap((group, groupIndex) =>
      group.map((action, index) => ({
        action,
        separatorBefore: groupIndex > 0 && index === 0,
      })),
    );
}
