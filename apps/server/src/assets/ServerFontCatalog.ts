import * as NodeCrypto from "node:crypto";
import { SERVER_FONT_ID_LENGTH, type ServerFont, type ServerFontFormat } from "@t3tools/contracts";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Path from "effect/Path";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";

const FC_LIST_TIMEOUT = "10 seconds";
const FC_LIST_FORMAT = "%{family}\t%{style}\t%{file}\t%{weight}\t%{slant}\n";
const FONTCONFIG_ITALIC_SLANT_THRESHOLD = 100;
const FONTCONFIG_WEIGHT_TO_CSS: ReadonlyArray<readonly [number, number]> = [
  [20, 100],
  [45, 200],
  [65, 300],
  [90, 400],
  [140, 500],
  [190, 600],
  [202, 700],
  [207, 800],
];
const CSS_WEIGHT_BLACK = 900;
const FONT_FORMAT_BY_EXTENSION: Readonly<Record<string, ServerFontFormat>> = {
  ".ttf": "ttf",
  ".otf": "otf",
};

export interface ServerFontEntry extends ServerFont {
  readonly absolutePath: string;
}

export class ServerFontCatalog extends Context.Service<
  ServerFontCatalog,
  {
    readonly list: Effect.Effect<ReadonlyArray<ServerFont>>;
    readonly find: (fontId: string) => Effect.Effect<ServerFontEntry | null>;
  }
>()("t3/assets/ServerFontCatalog") {}

export function fontIdForPath(absolutePath: string): string {
  return NodeCrypto.createHash("sha256")
    .update(absolutePath)
    .digest("hex")
    .slice(0, SERVER_FONT_ID_LENGTH);
}

export function cssWeightFromFontconfig(fontconfigWeight: number): number {
  const band = FONTCONFIG_WEIGHT_TO_CSS.find(([upperBound]) => fontconfigWeight <= upperBound);
  return band ? band[1] : CSS_WEIGHT_BLACK;
}

function firstListed(value: string): string {
  return (value.split(",")[0] ?? "").trim();
}

function parseFontLine(
  line: string,
  extensionOf: (filePath: string) => string,
  baseNameOf: (filePath: string) => string,
): ServerFontEntry | null {
  const [familyField, styleField, absolutePath, weightField, slantField] = line.split("\t");
  if (!familyField || !styleField || !absolutePath || !weightField || !slantField) return null;

  const format = FONT_FORMAT_BY_EXTENSION[extensionOf(absolutePath).toLowerCase()];
  const family = firstListed(familyField);
  const style = firstListed(styleField);
  const weight = Number(weightField);
  const slant = Number(slantField);
  if (!format || family === "" || style === "") return null;
  if (!Number.isFinite(weight) || !Number.isFinite(slant)) return null;

  return {
    fontId: fontIdForPath(absolutePath),
    family,
    style,
    weight: cssWeightFromFontconfig(weight),
    italic: slant >= FONTCONFIG_ITALIC_SLANT_THRESHOLD,
    format,
    fileName: baseNameOf(absolutePath),
    absolutePath,
  };
}

function compareEntries(left: ServerFontEntry, right: ServerFontEntry): number {
  return (
    left.family.localeCompare(right.family) ||
    left.weight - right.weight ||
    Number(left.italic) - Number(right.italic) ||
    left.fileName.localeCompare(right.fileName)
  );
}

export function parseFontCatalog(
  output: string,
  pathOps: Pick<Path.Path, "extname" | "basename">,
): ReadonlyArray<ServerFontEntry> {
  const entriesById = new Map<string, ServerFontEntry>();
  for (const line of output.split(/\r?\n/u)) {
    const entry = parseFontLine(line, pathOps.extname, pathOps.basename);
    if (entry && !entriesById.has(entry.fontId)) entriesById.set(entry.fontId, entry);
  }
  return [...entriesById.values()].toSorted(compareEntries);
}

const scanInstalledFonts = (
  path: Path.Path,
  spawner: ChildProcessSpawner.ChildProcessSpawner["Service"],
) =>
  spawner
    .string(
      ChildProcess.make("fc-list", ["--format", FC_LIST_FORMAT], {
        stdin: "ignore",
        stderr: "ignore",
      }),
    )
    .pipe(
      Effect.timeout(FC_LIST_TIMEOUT),
      Effect.map((output) => parseFontCatalog(output, path)),
      Effect.tapError((cause) => Effect.logWarning("Failed to scan installed fonts.", { cause })),
      Effect.orElseSucceed((): ReadonlyArray<ServerFontEntry> => []),
    );

function toPublicFont(entry: ServerFontEntry): ServerFont {
  return {
    fontId: entry.fontId,
    family: entry.family,
    style: entry.style,
    weight: entry.weight,
    italic: entry.italic,
    format: entry.format,
    fileName: entry.fileName,
  };
}

export const make = Effect.gen(function* () {
  const path = yield* Path.Path;
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const catalog = yield* Effect.cached(scanInstalledFonts(path, spawner));
  return ServerFontCatalog.of({
    list: Effect.map(catalog, (entries) => entries.map(toPublicFont)),
    find: (fontId) =>
      Effect.map(catalog, (entries) => entries.find((entry) => entry.fontId === fontId) ?? null),
  });
});

export const layer = Layer.effect(ServerFontCatalog, make);
