import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { installMocks, middlewareBoundary } from "../../helpers/modules.mjs";

let session, oauthResult, sessionError;
const oauthCalls = [],
  sessionCalls = [];
const supabase = {
  auth: {
    getSession: async () => ({ data: { session } }),
    setSession: async (tokens) => {
      sessionCalls.push(tokens);
      if (sessionError) throw sessionError;
      return { error: null };
    },
  },
};
installMocks({
  "@tanstack/react-start": middlewareBoundary,
  "src/integrations/supabase/client.ts": { supabase },
  "@lovable.dev/cloud-auth-js": {
    createLovableAuth: () => ({
      signInWithOAuth: async (...args) => {
        oauthCalls.push(args);
        return oauthResult;
      },
    }),
  },
});
const { attachSupabaseAuth } = await import("../../../src/integrations/supabase/auth-attacher.ts");
const { authProvider } = await import("../../../src/integrations/auth/provider.ts");
beforeEach(() => {
  session = null;
  sessionError = undefined;
  oauthResult = { tokens: { access_token: "test-access", refresh_token: "test-refresh" } };
  oauthCalls.length = 0;
  sessionCalls.length = 0;
});
for (const [name, value, headers] of [
  ["signed out", null, {}],
  ["signed in", { access_token: "user-token" }, { Authorization: "Bearer user-token" }],
  ["missing access token", {}, {}],
]) {
  test(`RPC auth headers: ${name}`, async () => {
    session = value;
    const result = await attachSupabaseAuth({ next: async (args) => args });
    assert.deepEqual(result, { headers });
  });
}
test("OAuth success installs the returned session and forwards options", async () => {
  const result = await authProvider.auth.signInWithOAuth("google", {
    redirect_uri: "https://example.invalid/dashboard",
    extraParams: { prompt: "consent" },
  });
  assert.equal(result, oauthResult);
  assert.deepEqual(sessionCalls, [oauthResult.tokens]);
  assert.deepEqual(oauthCalls, [
    [
      "google",
      { redirect_uri: "https://example.invalid/dashboard", extraParams: { prompt: "consent" } },
    ],
  ]);
});
test("OAuth without options forwards an empty extraParams object", async () => {
  await authProvider.auth.signInWithOAuth("google");
  assert.deepEqual(oauthCalls[0], ["google", { extraParams: {} }]);
});
test("OAuth redirect does not install a session", async () => {
  oauthResult = { redirected: true };
  assert.equal(await authProvider.auth.signInWithOAuth("google"), oauthResult);
  assert.deepEqual(sessionCalls, []);
});
test("OAuth provider error is returned without installing a session", async () => {
  oauthResult = { error: new Error("provider declined") };
  assert.equal(await authProvider.auth.signInWithOAuth("google"), oauthResult);
  assert.deepEqual(sessionCalls, []);
});
for (const error of [new Error("storage failed"), "storage failed"]) {
  test(`OAuth normalizes thrown session errors: ${typeof error}`, async () => {
    sessionError = error;
    const result = await authProvider.auth.signInWithOAuth("google");
    assert.ok(result.error instanceof Error);
    assert.equal(result.error.message, "storage failed");
  });
}
