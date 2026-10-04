import { createPortal } from "react-dom";

import { useBackgroundPicture } from "../backgroundPicture";
import { useClientSettings } from "../hooks/useSettings";

export function BackgroundPictureLayer() {
  const picture = useBackgroundPicture();
  const strength = useClientSettings((settings) => settings.backgroundPictureStrength);
  const blur = useClientSettings((settings) => settings.backgroundPictureBlur);

  if (picture === null || typeof document === "undefined") return null;

  return createPortal(
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[2147483647] overflow-hidden bg-white mix-blend-multiply dark:bg-black dark:mix-blend-screen"
    >
      <img
        alt=""
        className="absolute max-w-none object-cover"
        draggable={false}
        src={picture.dataUrl}
        style={{
          inset: `${-blur * 2}px`,
          width: `calc(100% + ${blur * 4}px)`,
          height: `calc(100% + ${blur * 4}px)`,
          opacity: strength / 100,
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
        }}
      />
    </div>,
    document.body,
  );
}
