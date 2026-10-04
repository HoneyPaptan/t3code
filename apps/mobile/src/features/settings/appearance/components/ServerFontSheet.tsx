import { useMemo, useState } from "react";
import { FlatList, Modal, Platform, Pressable, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SymbolView } from "../../../../components/AppSymbol";
import { AppText as Text } from "../../../../components/AppText";
import { filterFontFamilies, type FontFamilyEntry } from "../../../../lib/serverFontPlan";
import type { FontKind } from "../../../../lib/serverFonts";
import { useServerFontSelection } from "../serverFontSelection";

const DEFAULT_ROW_KEY = "default";

type SheetRow = { readonly key: string; readonly entry: FontFamilyEntry | null };

function SheetRowView(props: {
  readonly label: string;
  readonly selected: boolean;
  readonly onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: props.selected }}
      className="flex-row items-center gap-4 border-b border-border-subtle px-5 py-4 active:opacity-70"
      onPress={props.onPress}
    >
      <Text className="flex-1 text-lg text-foreground android:text-base" numberOfLines={1}>
        {props.label}
      </Text>
      {props.selected ? (
        <SymbolView
          name="checkmark"
          size={18}
          tintColorClassName="accent-icon"
          type="monochrome"
          weight="semibold"
        />
      ) : null}
    </Pressable>
  );
}

export function ServerFontSheet(props: {
  readonly kind: FontKind;
  readonly title: string;
  readonly selectedFamily: string | null;
  readonly visible: boolean;
  readonly onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const selection = useServerFontSelection(props.kind);
  const rows = useMemo<ReadonlyArray<SheetRow>>(
    () => [
      { key: DEFAULT_ROW_KEY, entry: null },
      ...filterFontFamilies(selection.families, query).map((entry) => ({
        key: entry.regular.fontId,
        entry,
      })),
    ],
    [query, selection.families],
  );
  const emptyMessage = !selection.isConnected
    ? "Connect to your laptop to browse its fonts."
    : selection.isLoadingCatalog
      ? "Loading fonts"
      : selection.catalogFailed
        ? "Could not read the font list from your laptop."
        : null;

  const choose = (entry: FontFamilyEntry | null) => {
    selection.select(entry);
    props.onClose();
  };

  return (
    <Modal
      animationType="slide"
      presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
      visible={props.visible}
      onRequestClose={props.onClose}
      onDismiss={() => setQuery("")}
    >
      <View
        className="flex-1 bg-screen"
        style={{ paddingTop: Platform.OS === "ios" ? 0 : insets.top }}
      >
        <View className="flex-row items-center justify-between gap-3 px-5 pb-2 pt-4">
          <Text className="text-xl font-t3-bold text-foreground">{props.title}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={props.onClose}
            className="active:opacity-70"
          >
            <Text className="text-lg font-t3-medium text-foreground-muted">Done</Text>
          </Pressable>
        </View>
        <View className="mx-5 mb-2 min-h-[38px] flex-row items-center gap-2 rounded-xl bg-grouped-card px-3 py-1.5">
          <SymbolView
            name="magnifyingglass"
            size={15}
            tintColorClassName="accent-foreground-muted"
            type="monochrome"
          />
          <TextInput
            accessibilityLabel="Search fonts"
            placeholder="Search fonts"
            placeholderTextColorClassName="accent-placeholder"
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
            className="flex-1 px-0 py-0 font-sans text-base text-foreground"
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <FlatList
          data={rows}
          keyExtractor={(row) => row.key}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={20}
          windowSize={7}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 18) + 18 }}
          ListFooterComponent={
            emptyMessage === null ? undefined : (
              <Text className="p-5 text-center text-foreground-muted/60">{emptyMessage}</Text>
            )
          }
          renderItem={({ item }) =>
            item.entry === null ? (
              <SheetRowView
                label="Default (Geist)"
                selected={props.selectedFamily === null}
                onPress={() => choose(null)}
              />
            ) : (
              <SheetRowView
                label={item.entry.family}
                selected={props.selectedFamily === item.entry.family}
                onPress={() => choose(item.entry)}
              />
            )
          }
        />
      </View>
    </Modal>
  );
}
