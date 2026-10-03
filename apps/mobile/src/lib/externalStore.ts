import { useSyncExternalStore } from "react";

export interface ExternalStore<T> {
  readonly get: () => T;
  readonly set: (next: T) => void;
  readonly subscribe: (listener: () => void) => () => void;
  readonly use: () => T;
}

export function createExternalStore<T>(initial: T): ExternalStore<T> {
  let current = initial;
  const listeners = new Set<() => void>();
  const get = () => current;
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };
  const set = (next: T) => {
    if (Object.is(next, current)) return;
    current = next;
    for (const listener of listeners) listener();
  };
  return { get, set, subscribe, use: () => useSyncExternalStore(subscribe, get, get) };
}
