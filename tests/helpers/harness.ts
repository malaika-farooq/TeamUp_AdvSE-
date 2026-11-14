// Shared, resettable state behind the module stand-ins in tests/setup/mocks.tsx.
// Every test calls resetHarness() first, so tests never leak into each other.
import { mock } from "bun:test";
import { createFake, type FakeSupabase } from "./fake-supabase";

export type TestUser = { id: string; email: string; user_metadata: Record<string, unknown> };

type Harness = {
  fake: FakeSupabase;
  user: TestUser | null;
  signOut: ReturnType<typeof mock>;
  navigate: ReturnType<typeof mock>;
  toast: {
    success: ReturnType<typeof mock>;
    error: ReturnType<typeof mock>;
    warning: ReturnType<typeof mock>;
    message: ReturnType<typeof mock>;
  };
  theme: {
    theme: "light" | "dark";
    setTheme: ReturnType<typeof mock>;
    toggle: ReturnType<typeof mock>;
  };
  sample: { create: ReturnType<typeof mock>; remove: ReturnType<typeof mock> };
  /** The AI server functions: matching, session planning and the team tools. */
  ai: {
    suggestPartners: ReturnType<typeof mock>;
    proposeSessions: ReturnType<typeof mock>;
    planTasks: ReturnType<typeof mock>;
    suggestTeammates: ReturnType<typeof mock>;
    breakdown: ReturnType<typeof mock>;
  };
  search: Record<string, unknown>;
  params: Record<string, string>;
  confetti: ReturnType<typeof mock>;
};

export const h = {} as Harness;

export function resetHarness(user: TestUser | null = defaultUser()) {
  h.fake = createFake(user?.id ?? "user-1");
  h.user = user;
  h.signOut = mock(async () => {});
  h.navigate = mock(() => {});
  h.toast = { success: mock(), error: mock(), warning: mock(), message: mock() };
  h.theme = { theme: "light", setTheme: mock(), toggle: mock() };
  h.search = {};
  h.params = {};
  h.confetti = mock();
  h.sample = { create: mock(async () => ({})), remove: mock(async () => ({})) };
  h.ai = {
    suggestPartners: mock(async () => ({ suggestions: [], empty: "no_matches" })),
    proposeSessions: mock(async () => ({ proposals: [] })),
    planTasks: mock(async () => ({ tasks: [] })),
    suggestTeammates: mock(async () => ({ suggestions: [], empty: null })),
    breakdown: mock(async () => ({ steps: [] })),
  };
  return h;
}

export function defaultUser(): TestUser {
  return {
    id: "user-1",
    email: "maya.chen@example.edu",
    user_metadata: { display_name: "Maya Chen" },
  };
}

/** A saved profile row as the database would return it. */
export function profileRow(over: Record<string, unknown> = {}) {
  return {
    id: "user-1",
    display_name: "Maya Chen",
    avatar_url: null,
    university: "Northbridge University",
    major: "Computer Science",
    bio: "Loves databases.",
    timezone: "America/Toronto",
    discoverable: true,
    onboarded: true,
    ...over,
  };
}

resetHarness();
