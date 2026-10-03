import * as Schema from "effect/Schema";

import { NonNegativeInt, TrimmedNonEmptyString } from "./baseSchemas.ts";

export const SERVER_FONT_ID_LENGTH = 16;

export const ServerFontId = TrimmedNonEmptyString.check(
  Schema.isPattern(new RegExp(`^[0-9a-f]{${SERVER_FONT_ID_LENGTH}}$`)),
);
export type ServerFontId = typeof ServerFontId.Type;

export const ServerFontFormat = Schema.Literals(["ttf", "otf"]);
export type ServerFontFormat = typeof ServerFontFormat.Type;

export const ServerFont = Schema.Struct({
  fontId: ServerFontId,
  family: TrimmedNonEmptyString.check(Schema.isMaxLength(256)),
  style: TrimmedNonEmptyString.check(Schema.isMaxLength(256)),
  weight: NonNegativeInt.check(Schema.isGreaterThanOrEqualTo(100), Schema.isLessThanOrEqualTo(900)),
  italic: Schema.Boolean,
  format: ServerFontFormat,
  fileName: TrimmedNonEmptyString.check(Schema.isMaxLength(512)),
});
export type ServerFont = typeof ServerFont.Type;

export const FontsListInput = Schema.Struct({});
export type FontsListInput = typeof FontsListInput.Type;

export const FontsListResult = Schema.Struct({
  fonts: Schema.Array(ServerFont),
});
export type FontsListResult = typeof FontsListResult.Type;
