import {
  DEFAULT_BACKGROUND_PICTURE_BLUR,
  DEFAULT_BACKGROUND_PICTURE_STRENGTH,
  MAX_BACKGROUND_PICTURE_BLUR,
  MAX_BACKGROUND_PICTURE_STRENGTH,
  MIN_BACKGROUND_PICTURE_BLUR,
  MIN_BACKGROUND_PICTURE_STRENGTH,
} from "@t3tools/contracts";
import { type ChangeEvent, type CSSProperties, useRef, useState } from "react";

import {
  encodeBackgroundPicture,
  isStorableBackgroundPicture,
  useBackgroundPicture,
  useBackgroundPictureStore,
} from "../../backgroundPicture";
import { Button } from "../ui/button";
import { toastManager } from "../ui/toast";
import { SettingResetButton, SettingsRow } from "./settingsLayout";
import { searchableSetting } from "./settingsSearch";
import { useScopedSettings, useUpdateScopedSettings } from "./useScopedSettings";

function sliderProgressStyle(value: number, min: number, max: number): CSSProperties {
  const ratio = (value - min) / (max - min);
  return {
    "--settings-slider-progress": `${ratio * 100}%`,
    "--settings-slider-fill-offset": `${0.5 - ratio}rem`,
  } as CSSProperties;
}

function reportPictureFailure(description: string) {
  toastManager.add({ type: "error", title: "Background picture not set", description });
}

function BackgroundPictureSlider(props: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  valueLabel: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex w-full items-center gap-3 sm:w-52">
      <output
        className="min-w-12 rounded-md bg-muted px-2 py-1 text-center font-mono text-xs font-medium tabular-nums text-foreground"
        htmlFor={props.id}
      >
        {props.valueLabel}
      </output>
      <input
        aria-label={props.label}
        className="settings-slider min-w-0 flex-1"
        id={props.id}
        max={props.max}
        min={props.min}
        onChange={(event) => {
          const value = Number(event.currentTarget.value);
          if (Number.isInteger(value) && value >= props.min && value <= props.max) {
            props.onChange(value);
          }
        }}
        step={props.step}
        style={sliderProgressStyle(props.value, props.min, props.max)}
        type="range"
        value={props.value}
      />
    </div>
  );
}

export function BackgroundPictureSettings() {
  const picture = useBackgroundPicture();
  const setPicture = useBackgroundPictureStore((state) => state.setPicture);
  const clearPicture = useBackgroundPictureStore((state) => state.clearPicture);
  const settings = useScopedSettings();
  const updateSettings = useUpdateScopedSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preparing, setPreparing] = useState(false);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (file === undefined) return;
    setPreparing(true);
    try {
      const dataUrl = await encodeBackgroundPicture(file);
      if (!isStorableBackgroundPicture(dataUrl)) {
        reportPictureFailure("This picture is too large to keep. Try a smaller one.");
        return;
      }
      try {
        setPicture({ dataUrl, name: file.name });
      } catch {
        clearPicture();
        reportPictureFailure("The browser has no room left to keep this picture.");
      }
    } catch {
      reportPictureFailure("This file could not be read as a picture.");
    } finally {
      setPreparing(false);
    }
  };

  return (
    <>
      <SettingsRow
        {...searchableSetting("setting-background-picture")}
        title="Background picture"
        description="A picture behind the whole app, kept on this device only."
        control={
          <div className="flex items-center gap-2">
            {picture === null ? null : (
              <img
                alt=""
                className="size-8 shrink-0 rounded-md border border-border object-cover"
                src={picture.dataUrl}
              />
            )}
            <Button
              disabled={preparing}
              onClick={() => fileInputRef.current?.click()}
              size="xs"
              variant="outline"
            >
              {picture === null ? "Choose" : "Change"}
            </Button>
            {picture === null ? null : (
              <Button onClick={clearPicture} size="xs" variant="ghost-destructive">
                Remove
              </Button>
            )}
            <input
              accept="image/*"
              className="hidden"
              onChange={(event) => void handleFileChange(event)}
              ref={fileInputRef}
              type="file"
            />
          </div>
        }
      />
      {picture === null ? null : (
        <>
          <SettingsRow
            {...searchableSetting("setting-background-picture-strength")}
            title="Picture strength"
            description="How much of the picture shows through the app."
            resetAction={
              settings.backgroundPictureStrength !== DEFAULT_BACKGROUND_PICTURE_STRENGTH ? (
                <SettingResetButton
                  label="picture strength"
                  onClick={() =>
                    updateSettings({
                      backgroundPictureStrength: DEFAULT_BACKGROUND_PICTURE_STRENGTH,
                    })
                  }
                />
              ) : null
            }
            control={
              <BackgroundPictureSlider
                id="background-picture-strength"
                label="Picture strength"
                max={MAX_BACKGROUND_PICTURE_STRENGTH}
                min={MIN_BACKGROUND_PICTURE_STRENGTH}
                onChange={(backgroundPictureStrength) =>
                  updateSettings({ backgroundPictureStrength })
                }
                step={5}
                value={settings.backgroundPictureStrength}
                valueLabel={`${settings.backgroundPictureStrength}%`}
              />
            }
          />
          <SettingsRow
            {...searchableSetting("setting-background-picture-blur")}
            title="Picture blur"
            description="Softens the picture so the content above stays easy to read."
            resetAction={
              settings.backgroundPictureBlur !== DEFAULT_BACKGROUND_PICTURE_BLUR ? (
                <SettingResetButton
                  label="picture blur"
                  onClick={() =>
                    updateSettings({ backgroundPictureBlur: DEFAULT_BACKGROUND_PICTURE_BLUR })
                  }
                />
              ) : null
            }
            control={
              <BackgroundPictureSlider
                id="background-picture-blur"
                label="Picture blur"
                max={MAX_BACKGROUND_PICTURE_BLUR}
                min={MIN_BACKGROUND_PICTURE_BLUR}
                onChange={(backgroundPictureBlur) => updateSettings({ backgroundPictureBlur })}
                step={1}
                value={settings.backgroundPictureBlur}
                valueLabel={`${settings.backgroundPictureBlur}px`}
              />
            }
          />
        </>
      )}
    </>
  );
}
