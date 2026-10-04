import type { MenuAction } from "@react-native-menu/menu";
import { describe, expect, it } from "vite-plus/test";

import { resolveMenuRows } from "./menuRows";

const ids = (rows: ReturnType<typeof resolveMenuRows>) => rows.map(({ action }) => action.id);
const separators = (rows: ReturnType<typeof resolveMenuRows>) =>
  rows.map(({ separatorBefore }) => separatorBefore);

describe("menu rows", () => {
  it("keeps a plain list in one group with no separators", () => {
    const rows = resolveMenuRows([
      { id: "a", title: "A" },
      { id: "b", title: "B" },
    ]);
    expect(ids(rows)).toEqual(["a", "b"]);
    expect(separators(rows)).toEqual([false, false]);
  });

  it("separates a destructive row from the rows before it", () => {
    const rows = resolveMenuRows([
      { id: "pin", title: "Pin" },
      { id: "rename", title: "Rename" },
      { id: "delete", title: "Delete", attributes: { destructive: true } },
    ]);
    expect(separators(rows)).toEqual([false, false, true]);
  });

  it("does not separate a menu that is only destructive rows", () => {
    const rows = resolveMenuRows([
      { id: "a", title: "A", attributes: { destructive: true } },
      { id: "b", title: "B", attributes: { destructive: true } },
    ]);
    expect(separators(rows)).toEqual([false, false]);
  });

  it("flattens inline groups and separates each group", () => {
    const actions: MenuAction[] = [
      { id: "first", title: "First" },
      {
        id: "group",
        title: "",
        displayInline: true,
        subactions: [
          { id: "g1", title: "G1" },
          { id: "g2", title: "G2" },
        ],
      },
      { id: "last", title: "Last" },
    ];
    const rows = resolveMenuRows(actions);
    expect(ids(rows)).toEqual(["first", "g1", "g2", "last"]);
    expect(separators(rows)).toEqual([false, true, false, true]);
  });

  it("keeps named submenus as drill in rows", () => {
    const rows = resolveMenuRows([
      { id: "snooze", title: "Snooze", subactions: [{ id: "later", title: "Later" }] },
    ]);
    expect(ids(rows)).toEqual(["snooze"]);
  });

  it("drops hidden rows and the separators that guarded them", () => {
    const rows = resolveMenuRows([
      { id: "a", title: "A" },
      { id: "gone", title: "Gone", attributes: { hidden: true, destructive: true } },
      { id: "b", title: "B" },
    ]);
    expect(ids(rows)).toEqual(["a", "b"]);
    expect(separators(rows)).toEqual([false, false]);
  });
});
