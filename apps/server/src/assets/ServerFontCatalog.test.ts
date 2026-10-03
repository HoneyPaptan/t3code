import * as NodeServices from "@effect/platform-node/NodeServices";
import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as PlatformError from "effect/PlatformError";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";
import { ChildProcessSpawner } from "effect/unstable/process";
import * as NodePath from "node:path";

import * as ServerFontCatalog from "./ServerFontCatalog.ts";

const FIXTURE = [
  "Noto Sans,Noto Sans Medium\tMedium,Regular\t/usr/share/fonts/noto/NotoSans-Medium.ttf\t100\t0",
  "Geist Mono\tItalic\t/usr/share/fonts/OTF/GeistMono-Italic.otf\t80\t100",
  "Geist Mono\tRegular\t/usr/share/fonts/OTF/GeistMono-Regular.otf\t80\t0",
  "Geist Mono\tRegular\t/usr/share/fonts/OTF/GeistMono-Regular.otf\t80\t0",
  "Terminus\tRegular\t/usr/share/fonts/misc/ter-u12n.pcf.gz\t80\t0",
  "Fira Sans\tBold\t/usr/share/fonts/TTC/Fira.ttc\t200\t0",
  "Broken Row\tRegular",
  "",
].join("\n");

const posixPath = { extname: NodePath.posix.extname, basename: NodePath.posix.basename };

function spawnerPrinting(output: string) {
  return ChildProcessSpawner.make(() =>
    Effect.succeed(
      ChildProcessSpawner.makeHandle({
        pid: ChildProcessSpawner.ProcessId(1),
        exitCode: Effect.succeed(ChildProcessSpawner.ExitCode(0)),
        isRunning: Effect.succeed(false),
        kill: () => Effect.void,
        unref: Effect.succeed(Effect.void),
        stdin: Sink.drain,
        stdout: Stream.make(new TextEncoder().encode(output)),
        stderr: Stream.empty,
        all: Stream.make(new TextEncoder().encode(output)),
        getInputFd: () => Sink.drain,
        getOutputFd: () => Stream.empty,
      }),
    ),
  );
}

function catalogLayerPrinting(output: string) {
  return ServerFontCatalog.layer.pipe(
    Layer.provide(
      Layer.succeed(ChildProcessSpawner.ChildProcessSpawner, spawnerPrinting(output)).pipe(
        Layer.provideMerge(NodeServices.layer),
      ),
    ),
  );
}

describe("parseFontCatalog", () => {
  const entries = ServerFontCatalog.parseFontCatalog(FIXTURE, posixPath);

  it("keeps only ttf and otf files and skips malformed rows", () => {
    expect(entries.map((entry) => entry.fileName)).toEqual([
      "GeistMono-Regular.otf",
      "GeistMono-Italic.otf",
      "NotoSans-Medium.ttf",
    ]);
  });

  it("dedupes repeated files and sorts by family then weight", () => {
    expect(entries.map((entry) => entry.family)).toEqual(["Geist Mono", "Geist Mono", "Noto Sans"]);
  });

  it("uses the first family and style and converts weight and slant", () => {
    const noto = entries.find((entry) => entry.family === "Noto Sans");
    expect(noto).toMatchObject({ style: "Medium", weight: 500, italic: false, format: "ttf" });
    const italic = entries.find((entry) => entry.fileName === "GeistMono-Italic.otf");
    expect(italic).toMatchObject({ italic: true, weight: 400, format: "otf" });
  });

  it("derives a stable sixteen character id that carries no path", () => {
    const again = ServerFontCatalog.parseFontCatalog(FIXTURE, posixPath);
    expect(again.map((entry) => entry.fontId)).toEqual(entries.map((entry) => entry.fontId));
    for (const entry of entries) {
      expect(entry.fontId).toMatch(/^[0-9a-f]{16}$/);
      expect(entry.fontId).toBe(ServerFontCatalog.fontIdForPath(entry.absolutePath));
    }
  });
});

describe("cssWeightFromFontconfig", () => {
  it("maps fontconfig weights onto the css scale", () => {
    expect(ServerFontCatalog.cssWeightFromFontconfig(0)).toBe(100);
    expect(ServerFontCatalog.cssWeightFromFontconfig(80)).toBe(400);
    expect(ServerFontCatalog.cssWeightFromFontconfig(100)).toBe(500);
    expect(ServerFontCatalog.cssWeightFromFontconfig(200)).toBe(700);
    expect(ServerFontCatalog.cssWeightFromFontconfig(210)).toBe(900);
  });
});

describe("ServerFontCatalog service", () => {
  it.effect("lists public fonts without absolute paths and finds them by id", () =>
    Effect.gen(function* () {
      const catalog = yield* ServerFontCatalog.ServerFontCatalog;
      const fonts = yield* catalog.list;
      expect(fonts).toHaveLength(3);
      expect(JSON.stringify(fonts)).not.toContain("/usr/share");
      const found = yield* catalog.find(fonts[0]!.fontId);
      expect(found?.absolutePath).toBe("/usr/share/fonts/OTF/GeistMono-Regular.otf");
    }).pipe(Effect.provide(catalogLayerPrinting(FIXTURE))),
  );

  it.effect("returns null for an unknown id and for a client supplied path", () =>
    Effect.gen(function* () {
      const catalog = yield* ServerFontCatalog.ServerFontCatalog;
      expect(yield* catalog.find("0000000000000000")).toBeNull();
      expect(yield* catalog.find("/usr/share/fonts/OTF/GeistMono-Regular.otf")).toBeNull();
    }).pipe(Effect.provide(catalogLayerPrinting(FIXTURE))),
  );

  it.effect("lists nothing when fc-list is missing", () =>
    Effect.gen(function* () {
      const catalog = yield* ServerFontCatalog.ServerFontCatalog;
      expect(yield* catalog.list).toEqual([]);
    }).pipe(
      Effect.provide(
        ServerFontCatalog.layer.pipe(
          Layer.provide(
            Layer.succeed(
              ChildProcessSpawner.ChildProcessSpawner,
              ChildProcessSpawner.make(() =>
                Effect.fail(
                  PlatformError.systemError({
                    _tag: "NotFound",
                    module: "ChildProcess",
                    method: "spawn",
                    description: "fc-list",
                  }),
                ),
              ),
            ).pipe(Layer.provideMerge(NodeServices.layer)),
          ),
        ),
      ),
    ),
  );
});
