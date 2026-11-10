// Verifies the signed-in student's token for server route handlers (/api/ai/*).
// Call only inside a server handler.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type AuthedClient = SupabaseClient<Database>;

function supabaseFetch(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) new Headers(init.headers).forEach((v, k) => headers.set(k, v));
    if (
      (key.startsWith("sb_publishable_") || key.startsWith("sb_secret_")) &&
      headers.get("Authorization") === `Bearer ${key}`
    ) {
      headers.delete("Authorization");
    }
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };
}

export async function authenticateRequest(
  request: Request,
): Promise<{ supabase: AuthedClient; userId: string } | null> {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Backend is not configured.");
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7);
  if (token.split(".").length !== 3) return null;
  const supabase = createClient<Database>(url, key, {
    global: { fetch: supabaseFetch(key), headers: { Authorization: `Bearer ${token}` } },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) return null;
  return { supabase, userId: data.claims.sub };
}

export function jsonError(status: number, message: string) {
  return Response.json({ error: message }, { status });
}
