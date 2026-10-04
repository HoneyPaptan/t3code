import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import {
  localSnoozeDate,
  localSnoozeTime,
  resolveCustomSnooze,
  type CustomSnoozeInput,
} from "@t3tools/client-runtime/state/thread-settled";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { AppText } from "../../components/AppText";
import { SegmentedControl } from "../../components/SegmentedControl";

export function CustomSnoozeSheet(props: {
  readonly onClose: () => void;
  readonly onSnooze: (snoozedUntil: string) => void;
}) {
  const [mode, setMode] = useState<CustomSnoozeInput["mode"]>("date");
  const [date, setDate] = useState(() => new Date(Date.now() + 3_600_000));
  const [picker, setPicker] = useState<"date" | "time" | null>(null);
  const [amount, setAmount] = useState("2");
  const [unit, setUnit] = useState<"minutes" | "hours" | "days">("hours");
  const [error, setError] = useState<string | null>(null);
  return (
    <Modal visible transparent animationType="fade" onRequestClose={props.onClose}>
      <KeyboardAvoidingView
        className="flex-1 items-center justify-center bg-backdrop px-6"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="max-h-[80%] w-full max-w-md grow-0 rounded-2xl border border-border-subtle bg-grouped-card"
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ padding: 20, gap: 16 }}
        >
          <AppText accessibilityRole="header" className="text-base font-t3-medium text-foreground">
            Custom snooze
          </AppText>
          <AppText className="text-sm text-foreground-muted">
            Choose when snoozed threads return to your inbox.
          </AppText>
          <SegmentedControl
            options={
              [
                { value: "date", label: "Date and time" },
                { value: "duration", label: "Duration" },
              ] as const
            }
            selected={mode}
            onSelect={(value) => {
              setMode(value);
              setPicker(null);
              setError(null);
            }}
            role="tab"
          />
          {mode === "date" ? (
            <View className="gap-3">
              {(["date", "time"] as const).map((value) => (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityLabel={value === "date" ? "Choose date" : "Choose time"}
                  className="min-h-12 flex-row items-center justify-between rounded-lg bg-subtle px-3"
                  onPress={() => setPicker(value)}
                >
                  <AppText className="text-sm text-foreground">
                    {value === "date" ? "Date" : "Time"}
                  </AppText>
                  <AppText className="text-sm text-foreground-muted">
                    {value === "date"
                      ? date.toLocaleDateString()
                      : date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </AppText>
                </Pressable>
              ))}
              {picker && (
                <DateTimePicker
                  value={date}
                  mode={picker}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onDismiss={() => setPicker(null)}
                  onValueChange={(_, selected) => {
                    const next = new Date(date);
                    if (picker === "date")
                      next.setFullYear(
                        selected.getFullYear(),
                        selected.getMonth(),
                        selected.getDate(),
                      );
                    else next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
                    setDate(next);
                    setError(null);
                  }}
                />
              )}
            </View>
          ) : (
            <View className="gap-3">
              <AppText className="text-sm text-foreground-muted">Snooze for</AppText>
              <TextInput
                accessibilityLabel="Duration"
                className="min-h-12 rounded-lg bg-subtle px-3 text-base text-foreground"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={(value) => {
                  setAmount(value);
                  setError(null);
                }}
              />
              <View className="flex-row gap-2">
                {(["minutes", "hours", "days"] as const).map((value) => (
                  <Pressable
                    key={value}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: unit === value }}
                    className={
                      unit === value
                        ? "min-h-11 flex-1 items-center justify-center rounded-lg bg-subtle"
                        : "min-h-11 flex-1 items-center justify-center rounded-lg"
                    }
                    onPress={() => {
                      setUnit(value);
                      setError(null);
                    }}
                  >
                    <AppText className="text-sm text-foreground">
                      {value === "minutes" ? "Minutes" : value === "hours" ? "Hours" : "Days"}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
          {error && (
            <AppText accessibilityRole="alert" className="text-sm text-danger-foreground">
              {error}
            </AppText>
          )}
          <View className="flex-row justify-end gap-1">
            <Pressable
              accessibilityRole="button"
              className="min-h-11 justify-center rounded-lg px-4 active:bg-subtle"
              onPress={props.onClose}
            >
              <AppText className="text-sm font-t3-medium text-foreground-muted">Cancel</AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="min-h-11 justify-center rounded-lg px-4 active:bg-subtle"
              onPress={() => {
                const input: CustomSnoozeInput =
                  mode === "date"
                    ? { mode, date: localSnoozeDate(date), time: localSnoozeTime(date) }
                    : { mode, amount: amount.replace(",", "."), unit };
                const snoozedUntil = resolveCustomSnooze(input, new Date());
                if (!snoozedUntil) {
                  setError(
                    mode === "date"
                      ? "Choose a date and time in the future."
                      : "Enter a positive duration.",
                  );
                  return;
                }
                props.onSnooze(snoozedUntil);
                props.onClose();
              }}
            >
              <AppText className="text-sm font-t3-medium text-primary-text">Snooze</AppText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
