import { Directory, File, Paths } from "expo-file-system";
import * as Font from "expo-font";

import {
  DEFAULT_FONT_FAMILY_NAMES,
  fontFamilyStore,
  type FontFamilyNames,
} from "./fontFamilyStore";
import type { FontChoice, FontFace, FontPreferences } from "./fontPreferences";

export type FontKind = "sans" | "mono";

export type FaceUrlResolver = (face: FontFace) => Promise<string | null>;

const FONT_KINDS: ReadonlyArray<FontKind> = ["sans", "mono"];

const requestSequence: Record<FontKind, number> = { sans: 0, mono: 0 };

function fontsDirectory(): Directory {
  return new Directory(Paths.cache, "fonts");
}

function faceFile(face: FontFace): File {
  return new File(fontsDirectory(), `${face.fontId}.${face.format}`);
}

export function serverFontName(face: FontFace): string {
  return `ServerFont-${face.fontId}`;
}

function isCached(face: FontFace): boolean {
  return faceFile(face).exists;
}

export function cachedFacePath(face: FontFace): string | null {
  const file = faceFile(face);
  return file.exists ? decodeURI(file.uri.replace(/^file:\/\//, "")) : null;
}

async function downloadFace(face: FontFace, resolveUrl: FaceUrlResolver): Promise<void> {
  const url = await resolveUrl(face);
  if (url === null) throw new Error("The laptop did not hand out this font.");
  const directory = fontsDirectory();
  directory.create({ idempotent: true, intermediates: true });
  const staging = new File(directory, `${face.fontId}.${face.format}.part`);
  if (staging.exists) staging.delete();
  await File.downloadFileAsync(url, staging);
  staging.moveSync(faceFile(face), { overwrite: true });
}

async function loadFaceFile(face: FontFace, name: string): Promise<void> {
  try {
    await Font.loadAsync({ [name]: { uri: faceFile(face).uri } });
  } catch (cause) {
    faceFile(face).delete();
    throw cause;
  }
}

async function registerFace(face: FontFace, resolveUrl: FaceUrlResolver | null): Promise<string> {
  const name = serverFontName(face);
  if (Font.isLoaded(name)) return name;
  if (!isCached(face)) {
    if (resolveUrl === null) throw new Error("This font is not downloaded yet.");
    await downloadFace(face, resolveUrl);
  }
  await loadFaceFile(face, name);
  return name;
}

async function registerStyleFace(
  face: FontFace | undefined,
  resolveUrl: FaceUrlResolver | null,
  fallback: string,
): Promise<string> {
  if (face === undefined) return fallback;
  return registerFace(face, resolveUrl).catch(() => fallback);
}

async function registerSans(
  choice: FontChoice,
  resolveUrl: FaceUrlResolver | null,
): Promise<Partial<FontFamilyNames>> {
  const regular = await registerFace(choice, resolveUrl);
  const [medium, bold] = await Promise.all([
    registerStyleFace(choice.medium, resolveUrl, regular),
    registerStyleFace(choice.bold, resolveUrl, regular),
  ]);
  return { regular, medium, bold };
}

async function registerMono(
  choice: FontChoice,
  resolveUrl: FaceUrlResolver | null,
): Promise<Partial<FontFamilyNames>> {
  return { mono: await registerFace(choice, resolveUrl) };
}

function defaultNames(kind: FontKind): Partial<FontFamilyNames> {
  const { regular, medium, bold, mono } = DEFAULT_FONT_FAMILY_NAMES;
  return kind === "sans" ? { regular, medium, bold } : { mono };
}

function resolveNames(
  kind: FontKind,
  choice: FontChoice | null,
  resolveUrl: FaceUrlResolver | null,
): Promise<Partial<FontFamilyNames>> {
  if (choice === null) return Promise.resolve(defaultNames(kind));
  return kind === "sans" ? registerSans(choice, resolveUrl) : registerMono(choice, resolveUrl);
}

export async function applyServerFont(
  kind: FontKind,
  choice: FontChoice | null,
  resolveUrl: FaceUrlResolver | null,
): Promise<void> {
  requestSequence[kind] += 1;
  const ticket = requestSequence[kind];
  const names = await resolveNames(kind, choice, resolveUrl);
  if (ticket !== requestSequence[kind]) return;
  fontFamilyStore.set({ ...fontFamilyStore.get(), ...names });
}

export async function restoreCachedServerFonts(fonts: FontPreferences | undefined): Promise<void> {
  if (fonts === undefined) return;
  await Promise.all(
    FONT_KINDS.map(async (kind) => {
      const choice = fonts[kind];
      if (choice === undefined || !isCached(choice)) return;
      await applyServerFont(kind, choice, null).catch(() => undefined);
    }),
  );
}
