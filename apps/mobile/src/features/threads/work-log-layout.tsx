import { AppText as Text } from "../../components/AppText";
import type { ComponentProps, ReactNode } from "react";
import { Pressable, View } from "react-native";
import { THREAD_WORK_ROW_MIN_HEIGHT, type deriveThreadWorkLogSizing } from "../../lib/layout";
import type { WorkRowLabelRole } from "./work-row-presentation";

export const WORK_LABEL_ROLE_STYLE: Record<
  WorkRowLabelRole,
  { readonly text: string; readonly color: string }
> = {
  name: { text: "text-chat", color: "text-foreground/80" },
  argument: { text: "font-mono text-tool", color: "text-foreground-muted" },
  heading: { text: "text-chat", color: "text-foreground-muted" },
  group: { text: "text-chat", color: "text-foreground-muted" },
};

const LABEL_TONE_CLASS = {
  danger: "text-chat text-danger-foreground",
  warning: "text-chat text-warning-foreground",
} as const;

function labelClassName(role: WorkRowLabelRole, tone: "default" | "danger" | "warning"): string {
  if (tone !== "default") return LABEL_TONE_CLASS[tone];
  const style = WORK_LABEL_ROLE_STYLE[role];
  return `${style.text} ${style.color}`;
}

function workLogBlockClassName(
  layout: "standalone" | "group-header",
  continues: boolean,
  opensRows: boolean,
): string {
  if (layout === "group-header") return opensRows ? "-mx-1 mb-3 px-1" : "-mx-1 px-1";
  return continues ? "-mx-1 px-1" : "-mx-1 mb-1.5 px-1";
}

export function WorkLogBlock({
  children,
  layout = "standalone",
  continues = false,
  opensRows = false,
}: {
  children: ReactNode;
  layout?: "standalone" | "group-header";
  continues?: boolean | undefined;
  opensRows?: boolean | undefined;
}) {
  return <View className={workLogBlockClassName(layout, continues, opensRows)}>{children}</View>;
}

export function WorkLogRows({ children }: { children: ReactNode }) {
  return <View className="gap-1.5">{children}</View>;
}

export function WorkLogIconSlot({ children }: { children: ReactNode }) {
  return <View className="relative size-5 shrink-0 items-center justify-center">{children}</View>;
}

export function WorkLogPressable({
  children,
  rowSizing,
  ...props
}: Omit<ComponentProps<typeof Pressable>, "children" | "className" | "style" | "hitSlop"> & {
  children: ReactNode;
  rowSizing?: ReturnType<typeof deriveThreadWorkLogSizing>;
}) {
  return (
    <Pressable {...props} hitSlop={4} className="rounded-md px-0.5 py-0 active:bg-subtle">
      <View
        className="flex-row items-center gap-2"
        style={{ minHeight: rowSizing?.estimatedRowHeight ?? THREAD_WORK_ROW_MIN_HEIGHT }}
      >
        {children}
      </View>
    </Pressable>
  );
}

export function WorkLogLabel({
  children,
  role = "name",
  tone = "default",
}: {
  children: ReactNode;
  role?: WorkRowLabelRole;
  tone?: "default" | "danger" | "warning";
}) {
  return (
    <Text
      selectable={false}
      numberOfLines={1}
      ellipsizeMode="tail"
      className={`min-w-0 flex-1 ${labelClassName(role, tone)}`}
    >
      {children}
    </Text>
  );
}
