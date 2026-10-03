import { createFontsEnvironmentAtoms } from "@t3tools/client-runtime/state/fonts";

import { connectionAtomRuntime } from "../connection/runtime";

export const fontsEnvironment = createFontsEnvironmentAtoms(connectionAtomRuntime);
