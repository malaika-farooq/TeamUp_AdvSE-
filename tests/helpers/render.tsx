import type { ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/** Renders a component with a fresh data cache (no retries, so errors show immediately). */
export function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, refetchOnWindowFocus: false } },
  });
  // applyAccept: false lets tests upload a wrong file type, as a real person could by dragging it in.
  const user = userEvent.setup({ applyAccept: false });
  return {
    user,
    client,
    ...render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>),
  };
}

/** A promise you resolve yourself, for checking what the screen shows while a save is in flight. */
export function deferred<T = void>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}
