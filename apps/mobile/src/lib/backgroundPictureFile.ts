import { Directory, File, Paths } from "expo-file-system";

import { beginForegroundHandoff } from "./foreground-handoff";
import { uuidv4 } from "./uuid";

export type BackgroundPicturePick =
  | { readonly type: "picked"; readonly uri: string }
  | { readonly type: "canceled" }
  | { readonly type: "failed"; readonly message: string };

function backgroundPictureDirectory(): Directory {
  return new Directory(Paths.document, "background-picture");
}

function pictureExtension(source: File): string {
  const extension = source.extension.toLowerCase();
  return /^\.[a-z0-9]{1,5}$/.test(extension) ? extension : ".jpg";
}

async function keepPictureCopy(sourceUri: string): Promise<string> {
  const source = new File(sourceUri);
  const directory = backgroundPictureDirectory();
  directory.create({ idempotent: true, intermediates: true });
  const target = new File(directory, `${uuidv4()}${pictureExtension(source)}`);
  await source.copy(target);
  return target.uri;
}

export function deleteBackgroundPicture(uri: string | null | undefined): void {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    return;
  }
}

export async function pickBackgroundPicture(): Promise<BackgroundPicturePick> {
  let imagePicker: typeof import("expo-image-picker");
  try {
    imagePicker = await import("expo-image-picker");
  } catch {
    return { type: "failed", message: "The photo library is unavailable right now." };
  }

  const endHandoff = beginForegroundHandoff();
  let result: Awaited<ReturnType<typeof imagePicker.launchImageLibraryAsync>>;
  try {
    result = await imagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      base64: false,
      quality: 1,
      shouldDownloadFromNetwork: true,
    });
  } catch {
    return { type: "failed", message: "Could not open the photo library." };
  } finally {
    endHandoff();
  }

  const asset = result.canceled ? undefined : result.assets[0];
  if (asset === undefined) return { type: "canceled" };
  try {
    return { type: "picked", uri: await keepPictureCopy(asset.uri) };
  } catch {
    return { type: "failed", message: "Could not keep a copy of this picture." };
  }
}
