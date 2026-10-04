export const HOME_FAB_BUTTON_SIZE = 44;
export const HOME_FAB_GAP = 12;

export function resolveHomeFabPillBottom(insetBottom: number, sidebar: boolean): number {
  return sidebar ? Math.max(insetBottom, 12) + 6 : Math.max(insetBottom, 16) + 16;
}

export function resolveHomeFabAccessoriesBottom(insetBottom: number, sidebar: boolean): number {
  return resolveHomeFabPillBottom(insetBottom, sidebar) + HOME_FAB_BUTTON_SIZE + HOME_FAB_GAP;
}
