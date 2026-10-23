import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { callAI, parseJsonBlock } from "../../../src/backend/ai/gateway.server.ts";

const env = { ...process.env };
const messages = [{ role: "user", content: "Plan a study session" }];
beforeEach(() => {
  delete process.env.AI_GATEWAY_API_KEY;
  delete process.env.LOVABLE_API_KEY;
});
afterEach(() => {
  process.env = { ...env };
});
test("missing AI key rejects before making a network call", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("unexpected fetch");
  });
  await assert.rejects(callAI(messages), /AI is not configured/);
  assert.equal(fetch.mock.callCount(), 0);
});
for (const [name, neutral, legacy, expected] of [
  ["neutral setting", "new-key", undefined, "new-key"],
  ["legacy fallback", undefined, "old-key", "old-key"],
  ["neutral takes precedence", "new-key", "old-key", "new-key"],
]) {
  test(`AI credential selection: ${name}`, async (t) => {
    if (neutral) process.env.AI_GATEWAY_API_KEY = neutral;
    if (legacy) process.env.LOVABLE_API_KEY = legacy;
    let sent;
    t.mock.method(globalThis, "fetch", async (url, init) => {
      sent = { url, init };
      return Response.json({ choices: [{ message: { content: "Plan" } }] });
    });
    assert.equal(await callAI(messages), "Plan");
    assert.equal(sent.url, "https://ai.gateway.lovable.dev/v1/chat/completions");
    assert.equal(sent.init.method, "POST");
    assert.equal(sent.init.headers.Authorization, `Bearer ${expected}`);
    assert.equal(sent.init.headers["Content-Type"], "application/json");
    const body = JSON.parse(sent.init.body);
    assert.deepEqual(body.messages, messages);
    assert.equal(typeof body.model, "string");
  });
}
for (const [status, error] of [
  [429, /busy/],
  [402, /credits are exhausted/],
  [500, /unavailable \(500\)/],
  [401, /unavailable \(401\)/],
]) {
  test(`AI gateway HTTP ${status} becomes an actionable error`, async (t) => {
    process.env.AI_GATEWAY_API_KEY = "test-key";
    t.mock.method(globalThis, "fetch", async () => new Response("upstream error", { status }));
    await assert.rejects(callAI(messages), error);
  });
}
for (const response of [{}, { choices: [] }, { choices: [{ message: {} }] }]) {
  test(`missing AI content returns an empty string: ${JSON.stringify(response)}`, async (t) => {
    process.env.AI_GATEWAY_API_KEY = "test-key";
    t.mock.method(globalThis, "fetch", async () => Response.json(response));
    assert.equal(await callAI(messages), "");
  });
}
test("network failure propagates", async (t) => {
  process.env.AI_GATEWAY_API_KEY = "test-key";
  t.mock.method(globalThis, "fetch", async () => {
    throw new Error("network offline");
  });
  await assert.rejects(callAI(messages), /network offline/);
});
test("invalid upstream JSON rejects", async (t) => {
  process.env.AI_GATEWAY_API_KEY = "test-key";
  t.mock.method(globalThis, "fetch", async () => new Response("not json"));
  await assert.rejects(callAI(messages), SyntaxError);
});
for (const [name, input, expected] of [
  ["array", '[{"title":"Study"}]', [{ title: "Study" }]],
  ["object", '{"summary":"Done"}', { summary: "Done" }],
  ["code fence", '```json\n[{"title":"Study"}]\n```', [{ title: "Study" }]],
  ["surrounding prose", "Result: [1,2] Thanks.", [1, 2]],
  ["nested JSON", '[{"items":[{"id":1}]}]', [{ items: [{ id: 1 }] }]],
  ["empty array", "[]", []],
]) {
  test(`AI JSON parsing: ${name}`, () => assert.deepEqual(parseJsonBlock(input, null), expected));
}
for (const input of ["", "No recommendations", "[invalid]", '{"broken":}', "null"]) {
  test(`unusable AI JSON uses the supplied fallback: ${JSON.stringify(input)}`, () => {
    const fallback = [];
    assert.equal(parseJsonBlock(input, fallback), fallback);
  });
}
