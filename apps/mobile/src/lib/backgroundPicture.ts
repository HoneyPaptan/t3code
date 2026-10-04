import {
  DEFAULT_BACKGROUND_PICTURE_BLUR,
  DEFAULT_BACKGROUND_PICTURE_STRENGTH,
  MAX_BACKGROUND_PICTURE_BLUR,
  MAX_BACKGROUND_PICTURE_STRENGTH,
  MIN_BACKGROUND_PICTURE_BLUR,
  MIN_BACKGROUND_PICTURE_STRENGTH,
} from "@t3tools/contracts";

const ANDROID_MAX_BLUR_RADIUS = 25;

function integerWithin(value: unknown, min: number, max: number): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function sanitizeBackgroundPictureStrength(value: unknown): number | undefined {
  return integerWithin(value, MIN_BACKGROUND_PICTURE_STRENGTH, MAX_BACKGROUND_PICTURE_STRENGTH);
}

export function sanitizeBackgroundPictureBlur(value: unknown): number | undefined {
  return integerWithin(value, MIN_BACKGROUND_PICTURE_BLUR, MAX_BACKGROUND_PICTURE_BLUR);
}

export function sanitizeBackgroundPictureUri(value: unknown): string | null | undefined {
  if (value === null) return null;
  return typeof value === "string" && value.startsWith("file://") ? value : undefined;
}

export function resolveBackgroundPictureLook(preferences: {
  readonly backgroundPictureStrength?: number;
  readonly backgroundPictureBlur?: number;
}): { readonly strength: number; readonly blur: number } {
  return {
    strength:
      sanitizeBackgroundPictureStrength(preferences.backgroundPictureStrength) ??
      DEFAULT_BACKGROUND_PICTURE_STRENGTH,
    blur:
      sanitizeBackgroundPictureBlur(preferences.backgroundPictureBlur) ??
      DEFAULT_BACKGROUND_PICTURE_BLUR,
  };
}

export function backgroundPictureBlurRadius(blur: number): number {
  return Math.round((blur / MAX_BACKGROUND_PICTURE_BLUR) * ANDROID_MAX_BLUR_RADIUS);
}
