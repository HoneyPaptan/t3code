import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { resolveStorage } from "./lib/storage";

const BACKGROUND_PICTURE_STORAGE_KEY = "t3code:background-picture:v1";
const BACKGROUND_PICTURE_MAX_SIDE = 1600;
const BACKGROUND_PICTURE_QUALITY = 0.85;
const BACKGROUND_PICTURE_MAX_DATA_URL_LENGTH = 3_500_000;

export interface BackgroundPicture {
  readonly dataUrl: string;
  readonly name: string;
}

interface BackgroundPictureState {
  picture: BackgroundPicture | null;
  setPicture: (picture: BackgroundPicture) => void;
  clearPicture: () => void;
}

export function fitWithinSide(
  width: number,
  height: number,
  maxSide: number = BACKGROUND_PICTURE_MAX_SIDE,
): { readonly width: number; readonly height: number } {
  const scale = Math.min(1, maxSide / Math.max(width, height, 1));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export function isStorableBackgroundPicture(dataUrl: string): boolean {
  return (
    dataUrl.startsWith("data:image/") && dataUrl.length <= BACKGROUND_PICTURE_MAX_DATA_URL_LENGTH
  );
}

export async function encodeBackgroundPicture(file: Blob): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const size = fitWithinSide(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext("2d");
    if (context === null) throw new Error("This browser cannot prepare the picture.");
    context.drawImage(bitmap, 0, 0, size.width, size.height);
    return canvas.toDataURL("image/jpeg", BACKGROUND_PICTURE_QUALITY);
  } finally {
    bitmap.close();
  }
}

function backgroundPictureStorage() {
  try {
    return resolveStorage(typeof window === "undefined" ? null : window.localStorage);
  } catch {
    return resolveStorage(null);
  }
}

export const useBackgroundPictureStore = create<BackgroundPictureState>()(
  persist(
    (set) => ({
      picture: null,
      setPicture: (picture) => set({ picture }),
      clearPicture: () => set({ picture: null }),
    }),
    {
      name: BACKGROUND_PICTURE_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(backgroundPictureStorage),
      partialize: (state) => ({ picture: state.picture }),
    },
  ),
);

export function useBackgroundPicture(): BackgroundPicture | null {
  return useBackgroundPictureStore((state) => state.picture);
}
