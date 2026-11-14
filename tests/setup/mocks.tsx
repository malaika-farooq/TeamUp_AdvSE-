// Replaces the parts of the app that talk to the outside world (Supabase, sign-in, toasts, routing,
// server functions, theme) with the resettable test state in tests/helpers/harness.ts.
import { mock } from "bun:test";
import type { ReactNode } from "react";
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
  Link: ({ children }: { children?: ReactNode }) => <a>{children}</a>,
  createFileRoute: () => (opts: unknown) => opts,
}));

mock.module("@tanstack/react-start", () => ({
  useServerFn: <T,>(fn: T) => fn,
  createServerFn: () => ({}),
}));

mock.module("@/lib/sample.functions", () => ({
  createSampleWorkspace: (...a: unknown[]) => h.sample.create(...a),
  removeSampleWorkspace: (...a: unknown[]) => h.sample.remove(...a),
}));
