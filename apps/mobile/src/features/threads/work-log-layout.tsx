import { AppText as Text } from "../../components/AppText";
import type { ComponentProps, ReactNode } from "react";
import { Pressable, View } from "react-native";
import { THREAD_WORK_ROW_MIN_HEIGHT, type deriveThreadWorkLogSizing } from "../../lib/layout";
import type { WorkRowLabelRole } from "./work-row-presentation";

export const WORK_LABEL_ROLE_STYLE: Record<
  WorkRowLabelRole,
  { readonly text: string; readonly color: string }
> = {
  name: { text: "font-t3-medium text-xs", color: "text-foreground/70" },
  argument: { text: "font-mono text-xs", color: "text-foreground-muted/60" },
  heading: { text: "text-xs", color: "text-foreground-muted/70" },
  group: { text: "font-t3-medium text-xs", color: "text-foreground/50" },
};

const LABEL_TONE_CLASS = {
  danger: "font-t3-medium text-xs text-danger-foreground",
  warning: "font-t3-medium text-xs text-warning-foreground",
} as const;

function labelClassName(role: WorkRowLabelRole, tone: "default" | "danger" | "warning"): string {
  if (tone !== "default") return LABEL_TONE_CLASS[tone];
  const style = WORK_LABEL_ROLE_STYLE[role];
  return `${style.text} ${style.color}`;
}

export function WorkLogBlock({
  children,
  layout = "standalone",
  continues = false,
}: {
  children: ReactNode;
  layout?: "standalone" | "group-header";
  continues?: boolean | undefined;
}) {
  return (
    <View className={continues || layout === "group-header" ? "-mx-1 px-1" : "-mx-1 mb-1 px-1"}>
      {children}
    </View>
  );
}

export function WorkLogRows({ children }: { children: ReactNode }) {
  return <View className="gap-px">{children}</View>;
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
        className="flex-row items-center gap-1.5"
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
