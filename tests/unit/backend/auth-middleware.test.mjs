import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { installMocks, middlewareBoundary } from "../../helpers/modules.mjs";

let request, claimsResult, clientArgs, nextCalls;
const client = {
  auth: {
    getClaims: async (token) => {
      client.token = token;
      return claimsResult;
    },
  },
};
installMocks({
  "@tanstack/react-start": middlewareBoundary,
  "@tanstack/react-start/server": { getRequest: () => request },
  "@supabase/supabase-js": {
    createClient: (...args) => {
      clientArgs = args;
      return client;
    },
  },
});
const { requireSupabaseAuth } =
  await import("../../../src/integrations/supabase/auth-middleware.ts");
const savedEnv = { ...process.env };
const next = async (value) => {
  nextCalls.push(value);
  return "allowed";
};
beforeEach(() => {
  process.env.SUPABASE_URL = "https://example.invalid";
  process.env.SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
  request = new Request("https://example.invalid", { headers: { authorization: "Bearer a.b.c" } });
  claimsResult = { data: { claims: { sub: "user-1", role: "authenticated" } }, error: null };
  clientArgs = undefined;
  nextCalls = [];
  delete client.token;
});
afterEach(() => {
  process.env = { ...savedEnv };
});
for (const missing of ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY"]) {
  test(`rejects missing server setting ${missing}`, async (t) => {
    t.mock.method(console, "error", () => {});
    delete process.env[missing];
    await assert.rejects(requireSupabaseAuth({ next }), new RegExp(missing));
    assert.equal(clientArgs, undefined);
    assert.equal(nextCalls.length, 0);
  });
}
for (const [name, makeRequest, error] of [
  ["missing request", () => undefined, /No request headers/],
  ["missing header", () => new Request("https://example.invalid"), /No authorization header/],
  [
    "non-Bearer scheme",
    () => ({ headers: new Headers({ authorization: "Basic abc" }) }),
    /Only Bearer/,
  ],
  ["empty token", () => ({ headers: { get: () => "Bearer " } }), /No token/],
  [
    "malformed JWT",
    () => ({ headers: new Headers({ authorization: "Bearer not-a-jwt" }) }),
    /Invalid token/,
  ],
]) {
  test(`rejects ${name} before creating a client`, async () => {
    request = makeRequest();
    await assert.rejects(requireSupabaseAuth({ next }), error);
    assert.equal(clientArgs, undefined);
    assert.equal(nextCalls.length, 0);
  });
}
for (const [name, response, error] of [
  ["verification error", { data: null, error: { message: "invalid signature" } }, /Invalid token/],
  ["missing claims", { data: {}, error: null }, /Invalid token/],
  ["missing user ID", { data: { claims: {} }, error: null }, /No user ID/],
]) {
  test(`rejects ${name} without invoking the handler`, async () => {
    claimsResult = response;
    await assert.rejects(requireSupabaseAuth({ next }), error);
    assert.equal(nextCalls.length, 0);
  });
}
test("valid claims pass the verified user and scoped client to the handler", async () => {
  assert.equal(await requireSupabaseAuth({ next }), "allowed");
  assert.equal(client.token, "a.b.c");
  assert.deepEqual(nextCalls, [
    { context: { supabase: client, userId: "user-1", claims: claimsResult.data.claims } },
  ]);
  assert.equal(clientArgs[0], "https://example.invalid");
  assert.equal(clientArgs[2].global.headers.Authorization, "Bearer a.b.c");
  assert.equal(clientArgs[2].auth.persistSession, false);
  assert.equal(clientArgs[2].auth.autoRefreshToken, false);
});
test("verification network failure rejects without invoking the handler", async (t) => {
  t.mock.method(client.auth, "getClaims", async () => {
    throw new Error("network failure");
  });
  await assert.rejects(requireSupabaseAuth({ next }), /network failure/);
  assert.equal(nextCalls.length, 0);
});
test("downstream handler errors propagate", async () => {
  await assert.rejects(
    requireSupabaseAuth({
      next: async () => {
        throw new Error("handler failed");
      },
    }),
    /handler failed/,
  );
});
for (const [key, bearer, expected] of [
  ["sb_publishable_key", "sb_publishable_key", null],
  ["sb_secret_key", "sb_secret_key", null],
  ["sb_publishable_key", "user.jwt.token", "Bearer user.jwt.token"],
  ["legacy.jwt.key", "legacy.jwt.key", "Bearer legacy.jwt.key"],
]) {
  test(`request headers: key ${key}, bearer ${bearer}`, async (t) => {
    process.env.SUPABASE_PUBLISHABLE_KEY = key;
    await requireSupabaseAuth({ next });
    let sent;
    t.mock.method(globalThis, "fetch", async (input, init) => {
      sent = { input, init };
      return new Response("{}");
    });
    const customFetch = clientArgs[2].global.fetch;
    await customFetch(
      new Request("https://example.invalid", {
        headers: { "x-request": "kept", authorization: "Bearer old.token.value" },
      }),
      {
        headers: { authorization: `Bearer ${bearer}`, "x-extra": "added" },
      },
    );
    assert.equal(sent.init.headers.get("authorization"), expected);
    assert.equal(sent.init.headers.get("apikey"), key);
    assert.equal(sent.init.headers.get("x-request"), "kept");
    assert.equal(sent.init.headers.get("x-extra"), "added");
  });
}
