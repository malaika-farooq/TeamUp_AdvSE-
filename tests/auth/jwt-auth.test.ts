// Every protected server call carries the student's sign-in token (a JWT issued by Supabase Auth) and the
// server checks it before doing anything. These tests cover the checks in src/lib/route-auth.ts, which guards
// the streaming AI endpoints (/api/ai/chat and /api/ai/write).
import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

let claims: { data: { claims: { sub: string } } | null; error: Error | null } = {
  data: { claims: { sub: "user-123" } },
  error: null,
};
const calls: string[] = [];
mock.module("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      getClaims: async (token: string) => {
        calls.push(token);
        return claims;
      },
    },
  }),
}));

const { authenticateRequest } = await import("../../src/lib/route-auth");
const request = (authorization?: string) =>
  new Request("http://localhost/api/ai/chat", {
    method: "POST",
    headers: authorization ? { authorization } : {},
  });
// Three dot-separated parts, like a real JWT (the content is checked by Supabase, which is stubbed here).
const JWT = "aaa.bbb.ccc";

const saved = { url: process.env["SUPABASE_URL"], key: process.env["SUPABASE_PUBLISHABLE_KEY"] };
beforeEach(() => {
  process.env["SUPABASE_URL"] = "https://example.supabase.co";
  process.env["SUPABASE_PUBLISHABLE_KEY"] = "sb_publishable_test";
  claims = { data: { claims: { sub: "user-123" } }, error: null };
  calls.length = 0;
});
afterEach(() => {
  process.env["SUPABASE_URL"] = saved.url;
  process.env["SUPABASE_PUBLISHABLE_KEY"] = saved.key;
});

describe("Server checks the sign-in token (JWT)", () => {
  test("a valid token gives the student's id", async () => {
    const auth = await authenticateRequest(request(`Bearer ${JWT}`));
    expect(auth?.userId).toBe("user-123");
    expect(calls).toEqual([JWT]);
  });
  test("no Authorization header is refused", async () => {
    expect(await authenticateRequest(request())).toBeNull();
    expect(calls).toHaveLength(0);
  });
  test("only Bearer tokens are accepted", async () => {
    expect(await authenticateRequest(request(`Basic ${btoa("user:pass")}`))).toBeNull();
    expect(await authenticateRequest(request(JWT))).toBeNull();
    expect(calls).toHaveLength(0);
  });
  test("something that isn't shaped like a JWT is refused before it is even checked", async () => {
    for (const bad of ["Bearer ", "Bearer abc", "Bearer a.b", "Bearer a.b.c.d", "Bearer null"]) {
      expect(await authenticateRequest(request(bad))).toBeNull();
    }
    expect(calls).toHaveLength(0);
  });
  test("a token Supabase rejects (forged, expired or revoked) is refused", async () => {
    claims = { data: null, error: new Error("invalid JWT: signature is invalid") };
    expect(await authenticateRequest(request(`Bearer ${JWT}`))).toBeNull();
  });
  test("a token with no subject is refused", async () => {
    claims = { data: { claims: {} as never }, error: null };
    expect(await authenticateRequest(request(`Bearer ${JWT}`))).toBeNull();
  });
  test("a server with no Supabase settings fails loudly instead of letting anyone in", async () => {
    delete process.env["SUPABASE_URL"];
    await expect(authenticateRequest(request(`Bearer ${JWT}`))).rejects.toThrow(
      "Backend is not configured.",
    );
  });
});
