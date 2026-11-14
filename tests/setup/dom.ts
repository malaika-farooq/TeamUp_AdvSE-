// Gives tests a browser-like environment (document, window, events) so React components can render.
import { afterEach } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

if (typeof document === "undefined") {
  GlobalRegistrator.register({ url: "http://localhost:3000/" });
}

// Radix UI and some browsers APIs expect these; happy-dom does not provide them.
const g = globalThis as Record<string, unknown>;
g["ResizeObserver"] ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
g["IS_REACT_ACT_ENVIRONMENT"] = true;
(Element.prototype as unknown as Record<string, unknown>)["scrollIntoView"] ??= () => {};
(Element.prototype as unknown as Record<string, unknown>)["hasPointerCapture"] ??= () => false;
(Element.prototype as unknown as Record<string, unknown>)["releasePointerCapture"] ??= () => {};

// Remove rendered components after every test, in every test file. (Registered here, once, because a hook
// registered inside a shared helper module only applies to the first test file that imports it.)
const { cleanup } = await import("@testing-library/react");
afterEach(() => cleanup());
