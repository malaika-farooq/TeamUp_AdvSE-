// Replaces the parts of the app that talk to the outside world (Supabase, sign-in, toasts, routing,
// server functions, theme) with the resettable test state in tests/helpers/harness.ts.
import { mock } from "bun:test";
import { createElement, type ReactNode } from "react";
import { h } from "../helpers/harness";

// A proxy, so tests can swap in a fresh fake for every test.
const supabase = new Proxy(
  {},
  { get: (_t, key) => (h.fake.client as unknown as Record<string | symbol, unknown>)[key] },
);

mock.module("@/integrations/supabase/client", () => ({ supabase }));

mock.module("@/lib/auth", () => ({
  useAuth: () => ({
    user: h.user,
    session: h.user ? { user: h.user } : null,
    loading: false,
    signOut: (...a: unknown[]) => h.signOut(...a),
  }),
  AuthProvider: ({ children }: { children: ReactNode }) => children,
}));

mock.module("sonner", () => ({
  toast: {
    success: (...a: unknown[]) => h.toast.success(...a),
    error: (...a: unknown[]) => h.toast.error(...a),
    warning: (...a: unknown[]) => h.toast.warning(...a),
    message: (...a: unknown[]) => h.toast.message(...a),
  },
  Toaster: () => null,
}));

mock.module("@/lib/theme", () => ({
  useTheme: () => ({
    theme: h.theme.theme,
    setTheme: (...a: unknown[]) => h.theme.setTheme(...a),
    toggle: () => h.theme.toggle(),
  }),
  ThemeProvider: ({ children }: { children: ReactNode }) => children,
  themeInitScript: "",
}));

mock.module("@tanstack/react-router", () => ({
  useNavigate:
    () =>
    (...a: unknown[]) =>
      h.navigate(...a),
  // Shows where a link points, e.g. "/auth?mode=signup", so tests can check it.
  Link: ({
    children,
    to,
    search,
  }: {
    children?: ReactNode;
    to?: string;
    search?: Record<string, unknown>;
  }) => (
    <a href={`${to ?? ""}${search?.["mode"] ? `?mode=${String(search["mode"])}` : ""}`}>
      {children}
    </a>
  ),
  createFileRoute: () => (opts: Record<string, unknown>) => ({
    ...opts,
    useSearch: () => h.search,
  }),
}));

mock.module("@tanstack/react-start", () => ({
  useServerFn: <T,>(fn: T) => fn,
  createServerFn: () => ({}),
}));

mock.module("@/lib/sample.functions", () => ({
  createSampleWorkspace: (...a: unknown[]) => h.sample.create(...a),
  removeSampleWorkspace: (...a: unknown[]) => h.sample.remove(...a),
}));

// Animations add nothing to these tests and cancelling them on unmount raises errors in the simulated browser,
// so "motion" elements become plain elements.
const MOTION_PROPS = new Set([
  "initial",
  "animate",
  "exit",
  "transition",
  "variants",
  "layout",
  "layoutId",
  "whileHover",
  "whileTap",
  "whileInView",
  "viewport",
  "drag",
  "onAnimationComplete",
]);
// One stand-in component per tag, created once: a new component on every render would make React rebuild the
// whole form after each keystroke.
const motionCache = new Map<
  string,
  (props: Record<string, unknown> & { children?: ReactNode }) => ReactNode
>();
mock.module("motion/react", () => ({
  motion: new Proxy(
    {},
    {
      get: (_t, tag: string) => {
        let component = motionCache.get(tag);
        if (!component) {
          component = ({ children, ...props }) => {
            const clean = Object.fromEntries(
              Object.entries(props).filter(([k]) => !MOTION_PROPS.has(k)),
            );
            return createElement(tag, clean, children);
          };
          motionCache.set(tag, component);
        }
        return component;
      },
    },
  ),
  AnimatePresence: ({ children }: { children?: ReactNode }) => children,
  useReducedMotion: () => true,
}));
