import { describe, expect, it, vi } from "vite-plus/test";

vi.mock("@expo/ui/jetpack-compose", () => ({
  Box: "Box",
  Button: "Button",
  Column: "Column",
  LinearProgressIndicator: "LinearProgressIndicator",
  Spacer: "Spacer",
  Text: "Text",
}));

vi.mock("@expo/ui/jetpack-compose/modifiers", () => ({
  background: (color: string) => ({ background: color }),
  cornerRadius: (value: number) => ({ cornerRadius: value }),
  fillMaxSize: () => "fillMaxSize",
  fillMaxWidth: () => "fillMaxWidth",
  height: (value: number) => ({ height: value }),
  padding: (...values: number[]) => ({ padding: values }),
  paddingAll: (value: number) => ({ paddingAll: value }),
}));

vi.mock("expo-widgets", () => ({
  createWidget: vi.fn((name: string, layout: unknown) => ({ layout, name })),
}));

import { SubscriptionUsage } from "./SubscriptionUsage.android";
import { SUBSCRIPTION_USAGE_FALLBACK_PALETTES } from "./subscriptionUsagePalette";
import type { SubscriptionUsageSnapshot } from "./subscriptionUsageSnapshot";

const palette = {
  surface: "#101010",
  foreground: "#f0f0f0",
  foregroundMuted: "#a0a0a0",
  hairline: "#202020",
  track: "#303030",
  fill: "#40a040",
  danger: "#d03030",
};

const now = Date.parse("2026-09-05T12:00:00.000Z");
const provider = {
  name: "Codex",
  detail: "Subscription remaining",
  windows: [
    { kind: "session", label: "5 hours", remaining: 60, reset: "Next reset Sep 5, 5:00 PM" },
    { kind: "weekly", label: "Weekly", remaining: 8, reset: "Next reset Sep 9, 9:00 AM" },
  ],
  expiresAt: now + 60_000,
  totalWindows: 2,
} satisfies SubscriptionUsageSnapshot["providers"][number];
const snapshot = {
  checkedAt: now,
  url: "t3code-dev://settings/usage?tab=limits",
  palette,
  providers: [provider, { ...provider, name: "Claude" }],
} satisfies SubscriptionUsageSnapshot;

type RenderProps = Parameters<typeof SubscriptionUsage>[0];

function render(props: RenderProps, colorScheme: "light" | "dark" = "dark") {
  vi.setSystemTime(now);
  return JSON.stringify(SubscriptionUsage(props, { colorScheme, configuration: undefined }));
}

describe("SubscriptionUsage Android layout", () => {
  it("renders each window with its remaining share, bar, and reset", () => {
    const tree = render(snapshot);
    expect(tree).toContain('"5 hours"');
    expect(tree).toContain("60% left");
    expect(tree).toContain('"progress":0.6');
    expect(tree).toContain(`"color":"${palette.fill}"`);
    expect(tree).toContain(`"trackColor":"${palette.track}"`);
    expect(tree).toContain("Next reset Sep 5, 5:00 PM");
    expect(tree).toContain('"progress":0.08');
    expect(tree).toContain(`"color":"${palette.danger}"`);
    expect(tree).toContain("As of ");
    expect(tree).toContain("Subscription usage");
  });

  it("draws the card on the palette surface with a 4 dp bar and one hairline between providers", () => {
    const tree = render(snapshot);
    expect(tree).toContain(`"containerColor":"${palette.surface}"`);
    expect(tree).toContain('{"cornerRadius":14}');
    expect(tree).toContain('{"height":4}');
    expect(tree.match(new RegExp(`"background":"${palette.hairline}"`, "g"))).toHaveLength(1);
  });

  it("keeps the bar on the fill colour at exactly ten percent", () => {
    const tree = render({
      ...snapshot,
      providers: [{ ...provider, windows: [{ ...provider.windows[0]!, remaining: 10 }] }],
    });
    expect(tree).toContain(`"color":"${palette.fill}"`);
    expect(tree).not.toContain(palette.danger);
  });

  it("drops the bars and asks for a refresh once the snapshot expires", () => {
    const tree = render({
      ...snapshot,
      providers: [{ ...provider, expiresAt: now - 1 }],
    });
    expect(tree).toContain("Open T3 to refresh");
    expect(tree).not.toContain("LinearProgressIndicator");
    expect(tree).not.toContain("more in T3");
  });

  it("counts the quotas that did not fit", () => {
    const tree = render({ ...snapshot, providers: [{ ...provider, totalWindows: 5 }] });
    expect(tree).toContain("3 more in T3");
  });

  it("keeps quotas without an expiry deadline visible", () => {
    const tree = render({ ...snapshot, providers: [{ ...provider, expiresAt: 0 }] });
    expect(tree).toContain("60% left");
    expect(tree).not.toContain("Open T3 to refresh");
  });

  it("invites connecting when nothing has been checked", () => {
    const tree = render({ checkedAt: 0, palette, providers: [] }, "light");
    expect(tree).toContain("Tap to connect in T3");
    expect(tree).not.toContain("As of ");
    expect(tree).toContain(`"containerColor":"${palette.surface}"`);
  });

  it("falls back to the embedded palette for the widget colour scheme before the app publishes", () => {
    const initial = {
      ...snapshot,
      palette: undefined,
      palettes: SUBSCRIPTION_USAGE_FALLBACK_PALETTES,
    };
    expect(render(initial, "light")).toContain(
      `"containerColor":"${SUBSCRIPTION_USAGE_FALLBACK_PALETTES.light.surface}"`,
    );
    expect(render(initial, "dark")).toContain(
      `"containerColor":"${SUBSCRIPTION_USAGE_FALLBACK_PALETTES.dark.surface}"`,
    );
  });

  it("prefers the published palette over the embedded fallback", () => {
    const tree = render({ ...snapshot, palettes: SUBSCRIPTION_USAGE_FALLBACK_PALETTES });
    expect(tree).toContain(`"containerColor":"${palette.surface}"`);
  });

  it("still renders text when no palette exists at all", () => {
    const tree = render({ ...snapshot, palette: undefined });
    expect(tree).toContain("Open T3 to connect");
  });
});
