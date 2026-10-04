import {
  Box,
  Button,
  Column,
  LinearProgressIndicator,
  Spacer,
  Text,
} from "@expo/ui/jetpack-compose";
import {
  background,
  cornerRadius,
  fillMaxSize,
  fillMaxWidth,
  height,
  padding,
  paddingAll,
} from "@expo/ui/jetpack-compose/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";
import type { ReactNode } from "react";

import {
  SUBSCRIPTION_USAGE_FALLBACK_PALETTES,
  type SubscriptionUsageFallbackPalettes,
} from "./subscriptionUsagePalette";
import type { SubscriptionUsageSnapshot } from "./subscriptionUsageSnapshot";

type SubscriptionUsageProps = SubscriptionUsageSnapshot & {
  palettes?: SubscriptionUsageFallbackPalettes;
};

export function SubscriptionUsage(props: SubscriptionUsageProps, environment: WidgetEnvironment) {
  "widget";
  const now = Date.now();
  const limit = 2;
  const palette =
    props.palette ?? props.palettes?.[environment.colorScheme === "dark" ? "dark" : "light"];
  if (!palette) {
    return (
      <Button modifiers={[fillMaxSize()]} onClick={() => {}}>
        <Text>Open T3 to connect</Text>
      </Button>
    );
  }
  const apart = (key: string, start: ReactNode, end: ReactNode) => (
    <Box key={key} modifiers={[fillMaxWidth()]}>
      <Box contentAlignment="centerStart" modifiers={[fillMaxWidth()]}>
        {start}
      </Box>
      <Box contentAlignment="centerEnd" modifiers={[fillMaxWidth()]}>
        {end}
      </Box>
    </Box>
  );
  const asOf = props.checkedAt
    ? `As of ${new Date(props.checkedAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`
    : "";
  return (
    <Button
      colors={{ containerColor: palette.surface }}
      modifiers={[fillMaxSize(), cornerRadius(14)]}
      onClick={() => {}}
    >
      <Column modifiers={[fillMaxSize(), paddingAll(16)]}>
        {apart(
          "header",
          <Text
            color={palette.foregroundMuted}
            maxLines={1}
            style={{ fontSize: 13, fontWeight: "500" }}
          >
            Subscription usage
          </Text>,
          asOf ? (
            <Text color={palette.foregroundMuted} maxLines={1} style={{ fontSize: 11 }}>
              {asOf}
            </Text>
          ) : null,
        )}
        {props.providers.map((provider, index) => {
          const stale =
            provider.windows.length > 0 && provider.expiresAt > 0 && now >= provider.expiresAt;
          const shown = stale ? [] : provider.windows.slice(0, limit);
          const hidden = stale ? 0 : (provider.totalWindows ?? provider.windows.length) - limit;
          return (
            <Column key={provider.name} modifiers={[fillMaxWidth(), padding(0, 12, 0, 0)]}>
              {index > 0 ? (
                <Spacer modifiers={[fillMaxWidth(), height(1), background(palette.hairline)]} />
              ) : null}
              <Column modifiers={[fillMaxWidth(), padding(0, index > 0 ? 12 : 0, 0, 0)]}>
                <Text color={palette.foreground} maxLines={1} style={{ fontSize: 15 }}>
                  {provider.name}
                </Text>
                {shown.length === 0 ? (
                  <Text color={palette.foregroundMuted} maxLines={1} style={{ fontSize: 13 }}>
                    {stale ? "Open T3 to refresh" : provider.detail}
                  </Text>
                ) : null}
                {shown.map((window) => (
                  <Column key={window.label} modifiers={[fillMaxWidth(), padding(0, 8, 0, 0)]}>
                    {apart(
                      window.label,
                      <Text color={palette.foregroundMuted} maxLines={1} style={{ fontSize: 13 }}>
                        {window.label}
                      </Text>,
                      <Text color={palette.foreground} maxLines={1} style={{ fontSize: 13 }}>
                        {`${window.remaining}% left`}
                      </Text>,
                    )}
                    <Column modifiers={[fillMaxWidth(), padding(0, 6, 0, 6)]}>
                      <LinearProgressIndicator
                        progress={window.remaining / 100}
                        color={window.remaining < 10 ? palette.danger : palette.fill}
                        trackColor={palette.track}
                        modifiers={[fillMaxWidth(), height(4)]}
                      />
                    </Column>
                    <Text color={palette.foregroundMuted} maxLines={1} style={{ fontSize: 11 }}>
                      {window.reset}
                    </Text>
                  </Column>
                ))}
                {hidden > 0 ? (
                  <Text color={palette.foregroundMuted} maxLines={1} style={{ fontSize: 11 }}>
                    {`${hidden} more in T3`}
                  </Text>
                ) : null}
              </Column>
            </Column>
          );
        })}
        {props.checkedAt ? null : (
          <Column modifiers={[fillMaxWidth(), padding(0, 12, 0, 0)]}>
            <Text color={palette.foregroundMuted} maxLines={1} style={{ fontSize: 13 }}>
              Tap to connect in T3
            </Text>
          </Column>
        )}
      </Column>
    </Button>
  );
}

export default createWidget("SubscriptionUsage", SubscriptionUsage, {
  checkedAt: 0,
  providers: [
    { name: "Codex", detail: "Open T3 to connect", windows: [], expiresAt: 0, totalWindows: 0 },
    { name: "Claude", detail: "Open T3 to connect", windows: [], expiresAt: 0, totalWindows: 0 },
  ],
  palettes: SUBSCRIPTION_USAGE_FALLBACK_PALETTES,
});
