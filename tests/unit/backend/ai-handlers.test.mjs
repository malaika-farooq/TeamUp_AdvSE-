import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { installMocks, serverFunctionBoundary } from "../../helpers/modules.mjs";
import { createDatabase, ok, failure } from "../../helpers/supabase.mjs";
import { parseJsonBlock } from "../../../src/backend/ai/gateway.server.ts";

const db = createDatabase();
let response;
const prompts = [];
// These tests invoke handlers directly with validated data. Zod validation and
// TanStack transport/middleware registration are outside this unit boundary.
installMocks({
  "@tanstack/react-start": serverFunctionBoundary,
  zod: { z: {} },
  "src/integrations/supabase/auth-middleware.ts": { requireSupabaseAuth: () => {} },
  "src/backend/ai/gateway.server.ts": {
    parseJsonBlock,
    callAI: async (messages) => {
      prompts.push(messages);
      return response;
    },
  },
});
const { draftTaskPlan, summarizeTeam, suggestTeammates } =
  await import("../../../src/backend/ai/ai.functions.ts");
const args = { data: { teamId: "team-1" }, context: { supabase: db, userId: "user-1" } };
beforeEach(() => {
  db.reset();
  prompts.length = 0;
  response = "[]";
});
afterEach(() => assert.equal(db.pending(), 0));
for (const [name, handler] of [
  ["planning", draftTaskPlan],
  ["summary", summarizeTeam],
  ["matching", suggestTeammates],
]) {
  for (const result of [ok(null), failure("database unavailable")]) {
    test(`${name}: missing verified membership blocks data access and AI calls`, async () => {
      db.queue(result);
      await assert.rejects(handler(args), /not a member/);
      assert.equal(db.calls.length, 1);
      assert.equal(prompts.length, 0);
      assert.deepEqual(db.calls[0].operations, [
        ["select", "role"],
        ["eq", "team_id", "team-1"],
        ["eq", "user_id", "user-1"],
        ["maybeSingle"],
      ]);
    });
  }
}
test("planning uses team facts and returns parsed suggestions", async () => {
  db.queue(
    ok({ role: "member" }),
    ok({ name: "Study group", project_goal: "Build demo", deadline: "2026-12-01" }),
    ok([{ user_id: "user-1" }]),
    ok([{ skill_id: "s" }]),
  );
  response = '[{"title":"Plan demo","priority":"high","dueOffsetDays":2}]';
  assert.deepEqual(await draftTaskPlan(args), {
    suggestions: [{ title: "Plan demo", priority: "high", dueOffsetDays: 2 }],
  });
  assert.match(prompts[0][1].content, /Study group/);
  assert.match(prompts[0][1].content, /Build demo/);
  assert.match(prompts[0][1].content, /Members: 1/);
  assert.deepEqual(db.calls[3].operations[1], ["in", "user_id", ["user-1"]]);
});
test("planning tolerates missing optional records and unusable AI JSON", async () => {
  db.queue(ok({ role: "member" }), ok(null), ok(null), ok(null));
  response = "No plan available";
  assert.deepEqual(await draftTaskPlan(args), { suggestions: [] });
  assert.match(prompts[0][1].content, /Goal: not specified/);
  assert.deepEqual(db.calls[3].operations[1], [
    "in",
    "user_id",
    ["00000000-0000-0000-0000-000000000000"],
  ]);
});
test("summary gathers only the requested team records and returns provider text", async () => {
  db.queue(
    ok({ role: "member" }),
    ok([{ title: "Build demo", status: "todo" }]),
    ok([{ title: "Kickoff", content: "Scope" }]),
    ok([{ summary: "Task added" }]),
  );
  response = "## Next steps\nBuild demo";
  assert.deepEqual(await summarizeTeam(args), { summary: response });
  for (const call of db.calls.slice(1))
    assert.ok(
      call.operations.some((op) => op[0] === "eq" && op[1] === "team_id" && op[2] === "team-1"),
    );
  assert.ok(
    db.calls[2].operations.some((op) => op[0] === "eq" && op[1] === "kind" && op[2] === "note"),
  );
  assert.deepEqual(db.calls[2].operations.at(-1), ["limit", 10]);
  assert.deepEqual(db.calls[3].operations.at(-1), ["limit", 30]);
  assert.match(prompts[0][1].content, /Build demo/);
  assert.match(prompts[0][1].content, /Kickoff/);
});
test("summary handles empty records", async () => {
  db.queue(ok({ role: "member" }), ok(null), ok(null), ok(null));
  response = "No recorded progress";
  assert.deepEqual(await summarizeTeam(args), { summary: response });
  assert.match(prompts[0][1].content, /TASKS:\n\[\]/);
});
for (const candidates of [[], [{ id: "user-1", display_name: "Existing member" }]]) {
  test(`matching avoids AI calls when the candidate pool has ${candidates.length} existing members only`, async () => {
    db.queue(ok({ role: "member" }), ok([{ user_id: "user-1" }]), ok(candidates));
    assert.deepEqual(await suggestTeammates(args), { suggestions: [] });
    assert.equal(prompts.length, 0);
  });
}
test("matching uses discoverable profiles and excludes current team members from the AI prompt", async () => {
  db.queue(
    ok({ role: "member" }),
    ok([{ user_id: "user-1" }]),
    ok([
      { id: "user-1", display_name: "Existing member" },
      { id: "candidate-1", display_name: "Candidate" },
    ]),
    ok([{ user_id: "user-1", course_id: "course-1" }]),
    ok([{ user_id: "candidate-1", course_id: "course-1" }]),
  );
  response = '[{"name":"Candidate","reason":"Shared course"}]';
  assert.deepEqual(await suggestTeammates(args), {
    suggestions: [{ name: "Candidate", reason: "Shared course" }],
  });
  assert.ok(
    db.calls[2].operations.some(
      (op) => op[0] === "eq" && op[1] === "discoverable" && op[2] === true,
    ),
  );
  assert.deepEqual(db.calls[2].operations.at(-1), ["limit", 40]);
  assert.deepEqual(db.calls[4].operations[1], ["in", "user_id", ["candidate-1"]]);
  assert.match(prompts[0][1].content, /Candidate/);
  assert.doesNotMatch(prompts[0][1].content, /Existing member/);
});
