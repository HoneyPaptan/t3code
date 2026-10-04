import type { ComponentProps, ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { cn } from "../lib/cn";
import { AppText as Text } from "./AppText";
import { SymbolView } from "./AppSymbol";

const COMPOSER_TOOLBAR_GAP = 8;
const COMPOSER_CONTROL_ICON_SIZE = 14;
const COMPOSER_CONTROL_CHEVRON_SIZE = 12;
const COMPOSER_ACTION_ICON_SIZE = 16;
const COMPOSER_TOOLBAR_FADE_WIDTH = 18;
const COMPOSER_TOOLBAR_SCROLL_EPSILON = 4;

export function ComposerInlineControl(props: {
  readonly accessibilityHint?: string;
  readonly accessibilityLabel?: string;
  readonly disabled?: boolean;
  readonly emphasized?: boolean;
  readonly icon?: ComponentProps<typeof SymbolView>["name"];
  readonly renderIcon?: (size: number) => ReactNode;
  readonly label: string;
  readonly maxWidth?: ViewStyle["maxWidth"];
  readonly onPress?: () => void;
  readonly quiet?: boolean;
  readonly selected?: boolean;
  readonly static?: boolean;
  readonly chevronDirection?: "down" | "right";
  readonly showChevron?: boolean;
}) {
  const isHighlighted = props.emphasized || props.selected;
  return (
    <Pressable
      accessibilityLabel={props.accessibilityLabel ?? props.label}
      accessibilityHint={props.accessibilityHint}
      accessibilityRole={props.static ? undefined : "button"}
      accessibilityState={
        props.static ? undefined : { disabled: props.disabled, selected: props.selected }
      }
      className="min-h-9 flex-row items-center gap-1 rounded-md px-1.5 active:bg-subtle"
      disabled={props.disabled || props.static}
      hitSlop={{ top: 4, bottom: 4 }}
      onPress={props.onPress}
      style={{ maxWidth: props.maxWidth, opacity: props.disabled ? 0.45 : 1 }}
    >
      {props.renderIcon ? (
        <View className="size-3.5 shrink-0 items-center justify-center">
          {props.renderIcon(COMPOSER_CONTROL_ICON_SIZE)}
        </View>
      ) : props.icon ? (
        <SymbolView
          name={props.icon}
          size={COMPOSER_CONTROL_ICON_SIZE}
          tintColorClassName={isHighlighted ? "accent-icon" : "accent-icon-muted"}
          type="monochrome"
        />
      ) : null}
      <Text
        className={cn(
          "max-w-[176px] shrink text-[13px] leading-[18px]",
          isHighlighted
            ? "text-foreground"
            : props.quiet
              ? "text-foreground-muted/60"
              : "text-foreground-muted",
        )}
        numberOfLines={1}
      >
        {props.label}
      </Text>
      {props.showChevron === false ? null : (
        <View className="opacity-60">
          <SymbolView
            name={props.chevronDirection === "right" ? "chevron.right" : "chevron.down"}
            size={COMPOSER_CONTROL_CHEVRON_SIZE}
            tintColorClassName="accent-foreground-muted"
            type="monochrome"
          />
        </View>
      )}
    </Pressable>
  );
}

export function ComposerToolbarRow(props: {
  readonly children: ReactNode;
  readonly paddingBottom?: number;
  readonly paddingHorizontal?: number;
  readonly paddingTop?: number;
  readonly style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      className="flex-row items-center gap-0.5"
      style={[
        {
          paddingBottom: props.paddingBottom ?? 0,
          paddingHorizontal: props.paddingHorizontal ?? 4,
          paddingTop: props.paddingTop ?? 0,
        },
        props.style,
      ]}
    >
      {props.children}
    </View>
  );
}

export function ComposerToolbarScroller(props: {
  readonly children: ReactNode;
  readonly align?: "start" | "end";
  /** Only for non-Uniwind surfaces such as the native terminal palette. */
  readonly fadeOpaque?: string;
  /** Only for non-Uniwind surfaces such as the native terminal palette. */
  readonly fadeTransparent?: string;
  /** Semantic Uniwind surface behind the toolbar. Defaults to card. */
  readonly fadeSurface?: "card" | "sheet";
  readonly contentPaddingRight?: number;
}) {
  const [metrics, setMetrics] = useState({
    contentWidth: 0,
    offsetX: 0,
    viewportWidth: 0,
  });

  const scrollEdges = useMemo(() => {
    const maxOffset = Math.max(0, metrics.contentWidth - metrics.viewportWidth);
    return {
      showLeftFade: metrics.offsetX > COMPOSER_TOOLBAR_SCROLL_EPSILON,
      showRightFade: metrics.offsetX < maxOffset - COMPOSER_TOOLBAR_SCROLL_EPSILON,
    };
  }, [metrics]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const viewportWidth = event.nativeEvent.layout.width;
    setMetrics((current) =>
      current.viewportWidth === viewportWidth ? current : { ...current, viewportWidth },
    );
  }, []);

  const handleContentSizeChange = useCallback((contentWidth: number) => {
    setMetrics((current) =>
      current.contentWidth === contentWidth ? current : { ...current, contentWidth },
    );
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    setMetrics((current) =>
      Math.abs(current.offsetX - offsetX) < 1 ? current : { ...current, offsetX },
    );
  }, []);

  return (
    <View className="relative min-w-0 flex-1">
      <ScrollView
        horizontal
        keyboardShouldPersistTaps="always"
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleLayout}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: "center",
          flexGrow: props.align === "end" ? 1 : undefined,
          justifyContent: props.align === "end" ? "flex-end" : undefined,
          gap: COMPOSER_TOOLBAR_GAP,
          paddingLeft: 0,
          paddingRight: props.contentPaddingRight ?? 1,
        }}
      >
        {props.children}
      </ScrollView>
      {scrollEdges.showLeftFade ? (
        <View
          className={cn(
            "absolute inset-y-0 left-0",
            props.fadeOpaque === undefined && "bg-linear-to-r to-transparent",
            props.fadeOpaque === undefined &&
              (props.fadeSurface === "sheet" ? "from-sheet" : "from-card"),
          )}
          pointerEvents="none"
          style={{
            width: COMPOSER_TOOLBAR_FADE_WIDTH,
            experimental_backgroundImage:
              props.fadeOpaque === undefined
                ? undefined
                : `linear-gradient(to right, ${props.fadeOpaque} 0%, ${props.fadeTransparent ?? "transparent"} 100%)`,
          }}
        />
      ) : null}
      {scrollEdges.showRightFade ? (
        <View
          className={cn(
            "absolute inset-y-0 right-0",
            props.fadeOpaque === undefined && "bg-linear-to-r from-transparent",
            props.fadeOpaque === undefined &&
              (props.fadeSurface === "sheet" ? "to-sheet" : "to-card"),
          )}
          pointerEvents="none"
          style={{
            width: COMPOSER_TOOLBAR_FADE_WIDTH,
            experimental_backgroundImage:
              props.fadeOpaque === undefined
                ? undefined
                : `linear-gradient(to right, ${props.fadeTransparent ?? "transparent"} 0%, ${props.fadeOpaque} 100%)`,
          }}
        />
      ) : null}
    </View>
  );
}

export function ComposerActionButton(props: {
  readonly accessibilityLabel: string;
  readonly disabled?: boolean;
  readonly icon: ComponentProps<typeof SymbolView>["name"];
  readonly onPress: () => void;
  readonly variant?: "primary" | "danger";
  readonly onLongPress?: PressableProps["onLongPress"];
  readonly onTouchStart?: PressableProps["onTouchStart"];
}) {
  const isDanger = props.variant === "danger";
  const isQuiet = props.disabled && !isDanger;
  return (
    <Pressable
      accessibilityLabel={props.accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: props.disabled }}
      className={cn(
        "size-9 shrink-0 items-center justify-center rounded-full active:opacity-70",
        isDanger ? "bg-danger" : isQuiet ? "bg-subtle" : "bg-primary",
      )}
      disabled={props.disabled}
      hitSlop={4}
      onPress={props.onPress}
      onLongPress={props.onLongPress}
      onTouchStart={props.onTouchStart}
    >
      <SymbolView
        name={props.icon}
        size={COMPOSER_ACTION_ICON_SIZE}
        weight="semibold"
        tintColorClassName={
          isDanger
            ? "accent-danger-foreground"
            : isQuiet
              ? "accent-foreground-muted"
              : "accent-primary-foreground"
        }
        type="monochrome"
      />
    </Pressable>
  );
}

export function ComposerToolbarButton(props: {
  readonly icon?: ComponentProps<typeof SymbolView>["name"];
  readonly iconNode?: ReactNode;
  readonly label?: string;
  readonly accessibilityLabel?: string;
  readonly active?: boolean;
  readonly disabled?: boolean;
  readonly maxWidth?: number;
  readonly minWidth?: number;
  readonly onPress?: () => void;
  readonly showChevron?: boolean;
  readonly textTransform?: "none" | "uppercase";
  readonly variant?: "default" | "primary" | "danger";
  readonly className?: string;
  readonly style?: StyleProp<ViewStyle>;
}) {
  const variant = props.variant ?? "default";
  const isCircle = !props.label && props.showChevron === false;
  const iconTintClassName =
    variant === "primary"
      ? props.disabled
        ? "accent-icon-subtle"
        : "accent-send-foreground"
      : variant === "danger"
        ? "accent-danger-foreground"
        : "accent-icon";

  return (
    <Pressable
      accessibilityLabel={props.accessibilityLabel ?? props.label}
      accessibilityRole="button"
      disabled={props.disabled}
      onPress={props.onPress}
      className={cn(
        "min-h-9 max-w-[172px] flex-row items-center justify-center rounded-full border active:opacity-70",
        variant === "primary" && "shadow-lg shadow-primary-shadow/20 disabled:shadow-none",
        isCircle ? "w-9" : "gap-1.5 px-3",
        variant === "primary"
          ? props.disabled
            ? "bg-subtle-strong"
            : "bg-send"
          : variant === "danger"
            ? "bg-danger"
            : props.active
              ? "bg-subtle"
              : undefined,
        variant === "default"
          ? props.active
            ? "border-border"
            : "border-border-subtle"
          : variant === "danger"
            ? "border-danger-border"
            : props.disabled
              ? "border-border-subtle"
              : "border-send-foreground/20",
        props.className,
      )}
      style={({ pressed }) => [
        {
          maxWidth: props.maxWidth,
          minWidth: props.minWidth,
          opacity: props.disabled ? 0.55 : pressed ? 0.72 : 1,
        },
        props.style,
      ]}
    >
      {props.iconNode ? (
        <View className="size-3.5 items-center justify-center">{props.iconNode}</View>
      ) : props.icon ? (
        <SymbolView
          name={props.icon}
          size={COMPOSER_CONTROL_ICON_SIZE}
          tintColorClassName={iconTintClassName}
          type="monochrome"
        />
      ) : null}
      {props.label ? (
        <Text
          className={cn(
            "shrink text-center text-[13px] leading-[18px]",
            variant === "primary"
              ? props.disabled
                ? "text-foreground-muted"
                : "text-primary-foreground"
              : "text-foreground",
          )}
          ellipsizeMode="tail"
          numberOfLines={1}
          style={{ textTransform: props.textTransform ?? "none" }}
        >
          {props.label}
        </Text>
      ) : null}
      {props.showChevron === false ? null : (
        <SymbolView
          name="chevron.down"
          size={COMPOSER_CONTROL_CHEVRON_SIZE}
          tintColorClassName={iconTintClassName}
          type="monochrome"
        />
      )}
    </Pressable>
  );
}
