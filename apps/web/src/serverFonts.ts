import type { ServerFont, ServerFontId } from "@t3tools/contracts";

export interface ServerFontFamily {
  readonly family: string;
  readonly faces: ReadonlyArray<ServerFont>;
}

export type ServerFontUrlResolver = (fontId: ServerFontId) => Promise<string | null>;

function compareFaces(left: ServerFont, right: ServerFont): number {
  if (left.weight !== right.weight) return left.weight - right.weight;
  return Number(left.italic) - Number(right.italic);
}

function groupByFamily(fonts: ReadonlyArray<ServerFont>): Map<string, ServerFont[]> {
  const families = new Map<string, ServerFont[]>();
  for (const font of fonts) {
    const faces = families.get(font.family);
    if (faces === undefined) families.set(font.family, [font]);
    else faces.push(font);
  }
  return families;
}

export function listServerFontFamilies(
  fonts: ReadonlyArray<ServerFont>,
): ReadonlyArray<ServerFontFamily> {
  return [...groupByFamily(fonts).entries()]
    .map(([family, faces]) => ({ family, faces: [...faces].sort(compareFaces) }))
    .sort((left, right) => left.family.localeCompare(right.family));
}

function normalizeFamilyName(name: string): string {
  return name
    .trim()
    .replace(/^(['"])(.*)\1$/, "$2")
    .toLowerCase();
}

export function findServerFontFamily(
  families: ReadonlyArray<ServerFontFamily>,
  name: string,
): ServerFontFamily | null {
  const wanted = normalizeFamilyName(name);
  if (wanted.length === 0) return null;
  return families.find((entry) => normalizeFamilyName(entry.family) === wanted) ?? null;
}

function fontFaceDescriptors(face: ServerFont): FontFaceDescriptors {
  return { weight: String(face.weight), style: face.italic ? "italic" : "normal" };
}

async function loadFace(face: ServerFont, resolveUrl: ServerFontUrlResolver): Promise<void> {
  const url = await resolveUrl(face.fontId);
  if (url === null) throw new Error("The server did not hand out this font.");
  const fontFace = new FontFace(face.family, `url("${url}")`, fontFaceDescriptors(face));
  document.fonts.add(await fontFace.load());
}

const faceLoads = new Map<ServerFontId, Promise<void>>();

function ensureFaceLoaded(face: ServerFont, resolveUrl: ServerFontUrlResolver): Promise<void> {
  const pending = faceLoads.get(face.fontId);
  if (pending !== undefined) return pending;
  const load = loadFace(face, resolveUrl).catch((cause: unknown) => {
    faceLoads.delete(face.fontId);
    throw cause;
  });
  faceLoads.set(face.fontId, load);
  return load;
}

export async function ensureServerFontFamilyLoaded(
  entry: ServerFontFamily,
  resolveUrl: ServerFontUrlResolver,
): Promise<void> {
  await Promise.all(entry.faces.map((face) => ensureFaceLoaded(face, resolveUrl)));
}
