import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { authenticateCronRequest } from "../../../src/integrations/supabase/cron-auth.ts";

const saved = { ...process.env };
const request = (token) =>
  new Request("https://example.invalid", {
    headers: token === undefined ? {} : { authorization: token },
  });
beforeEach(() => {
  process.env.LOVABLE_CRON_SECRET = "current-test-secret";
  delete process.env.LOVABLE_CRON_SECRET_PREVIOUS;
});
afterEach(() => {
  process.env = { ...saved };
});
test("missing configuration returns a generic 500", async () => {
  delete process.env.LOVABLE_CRON_SECRET;
  const response = await authenticateCronRequest(request());
  assert.equal(response.status, 500);
  assert.equal(await response.text(), "Server configuration error");
});
for (const token of [
  undefined,
  "Basic secret",
  "Bearer wrong",
  "Bearer a,b",
  "Bearer a b",
  "Bearer tiny",
]) {
  test(`unauthorized cron token: ${String(token)}`, async () => {
    const response = await authenticateCronRequest(request(token));
    assert.equal(response.status, 401);
    assert.equal(await response.text(), "Unauthorized");
  });
}
test("accepts the current secret", async () => {
  assert.equal(await authenticateCronRequest(request("Bearer current-test-secret")), null);
});
test("accepts the previous secret during rotation", async () => {
  process.env.LOVABLE_CRON_SECRET_PREVIOUS = "previous-test-secret";
  assert.equal(await authenticateCronRequest(request("Bearer previous-test-secret")), null);
});
test("rejects the old secret once rotation completes", async () => {
  const response = await authenticateCronRequest(request("Bearer previous-test-secret"));
  assert.equal(response.status, 401);
});
test("different-length attacker token returns 401 rather than throwing", async () => {
  const response = await authenticateCronRequest(request(`Bearer ${"x".repeat(4096)}`));
  assert.equal(response.status, 401);
});
