import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve, dirname } from "node:path";

const root = fileURLToPath(new URL("../../", import.meta.url));

// Each test file runs in its own Node process. Only explicitly listed
// boundaries are mocked; local application modules execute unchanged.
export function installMocks(mocks = {}) {
  const registry = new Map(Object.entries(mocks));
  globalThis.__teamupTestModules = registry;
  return registerHooks({
    resolve(specifier, context, nextResolve) {
      let target;
      if (specifier.startsWith("@/")) target = resolve(root, "src", specifier.slice(2));
      else if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
        target = resolve(dirname(fileURLToPath(context.parentURL)), specifier);
      }
      const relative = target?.replaceAll("\\", "/").slice(root.replaceAll("\\", "/").length);
      const key = registry.has(specifier)
        ? specifier
        : relative &&
          [...registry.keys()].find(
            (name) =>
              name.startsWith("src/") && [name, name.replace(/\.ts$/, "")].includes(relative),
          );
      if (key) return { url: `teamup-mock:${encodeURIComponent(key)}`, shortCircuit: true };
      if (target) {
        for (const suffix of ["", ".ts", ".tsx", "/index.ts"]) {
          if (existsSync(target + suffix) && /\.(ts|tsx|mjs|js)$/.test(target + suffix)) {
            return { url: pathToFileURL(target + suffix).href, shortCircuit: true };
          }
        }
      }
      return nextResolve(specifier, context);
    },
    load(url, context, nextLoad) {
      if (!url.startsWith("teamup-mock:")) return nextLoad(url, context);
      const key = decodeURIComponent(url.slice("teamup-mock:".length));
      const exports = Object.keys(registry.get(key))
        .map(
          (name) =>
            `export const ${name} = globalThis.__teamupTestModules.get(${JSON.stringify(key)})[${JSON.stringify(name)}];`,
        )
        .join("\n");
      return { format: "module", source: exports, shortCircuit: true };
    },
  });
}

export const middlewareBoundary = {
  createMiddleware: () => ({ server: (handler) => handler, client: (handler) => handler }),
};

export const serverFunctionBoundary = {
  ...middlewareBoundary,
  createServerFn: () => {
    const builder = {
      middleware: () => builder,
      inputValidator: () => builder,
      handler: (handler) => handler,
    };
    return builder;
  },
};
