import type { FontChoice, FontFace } from "../../lib/fontPreferences";
import { serverFontName } from "../../lib/serverFonts";

export interface TerminalFontFaces {
  readonly regularPath: string;
  readonly boldPath: string | null;
}

export function resolveTerminalFontFaces(input: {
  readonly choice: FontChoice | undefined;
  readonly activeMonoName: string;
  readonly facePath: (face: FontFace) => string | null;
}): TerminalFontFaces | null {
  const { choice } = input;
  if (choice === undefined || input.activeMonoName !== serverFontName(choice)) return null;
  const regularPath = input.facePath(choice);
  if (regularPath === null) return null;
  return {
    regularPath,
    boldPath: choice.bold === undefined ? null : input.facePath(choice.bold),
  };
}
