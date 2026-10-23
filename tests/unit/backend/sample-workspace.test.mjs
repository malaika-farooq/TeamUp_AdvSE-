import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { installMocks, serverFunctionBoundary } from "../../helpers/modules.mjs";
import { createDatabase, ok, failure } from "../../helpers/supabase.mjs";

const db = createDatabase();
installMocks({
  "@tanstack/react-start": serverFunctionBoundary,
  "src/integrations/supabase/auth-middleware.ts": { requireSupabaseAuth: () => {} },
});
const { createSampleWorkspace, removeSampleWorkspace } =
  await import("../../../src/backend/api/settings/sample.functions.ts");
const context = { supabase: db, userId: "user-1" };
beforeEach(() => db.reset());
afterEach(() => assert.equal(db.pending(), 0));

test("existing sample workspace returns its ID without creating duplicate data", async () => {
  db.queue(ok({ id: "existing" }));
  assert.deepEqual(await createSampleWorkspace({ context }), {
    teamId: "existing",
    created: false,
  });
  assert.equal(db.calls.length, 1);
  assert.ok(
    db.calls[0].operations.some(
      (op) => op[0] === "eq" && op[1] === "created_by" && op[2] === "user-1",
    ),
  );
});
for (const [result, error] of [
  [failure("team creation denied"), /team creation denied/],
  [ok(null), /Could not create sample team/],
]) {
  test(`team creation failure stops seeding: ${error}`, async () => {
    db.queue(ok(null), ok({ id: "course-1" }), result);
    await assert.rejects(createSampleWorkspace({ context }), error);
    assert.equal(db.calls.length, 3);
  });
}
for (const sessions of [[{ id: "session-1" }, { id: "session-2" }], []]) {
  test(`sample creation seeds scoped tasks, sessions, and resources (${sessions.length} returned sessions)`, async () => {
    db.queue(ok(null), ok({ id: "course-1" }), ok("team-1"), ok(null), ok(null), ok(sessions));
    if (sessions.length) db.queue(ok(null));
    db.queue(ok(null), ok(null), ok(null));
    assert.deepEqual(await createSampleWorkspace({ context }), { teamId: "team-1", created: true });
    const rpc = db.calls.find((call) => call.rpc === "create_team");
    assert.equal(rpc.args._visibility, "private");
    assert.equal(rpc.args._course_id, "course-1");
    const tasks = db.calls.find((call) => call.table === "tasks").operations[0][1];
    assert.equal(tasks.length, 8);
    assert.ok(
      tasks.every(
        (task) =>
          task.team_id === "team-1" &&
          task.created_by === "user-1" &&
          task.assignee_id === "user-1",
      ),
    );
    assert.equal(new Set(tasks.map((task) => task.position)).size, tasks.length);
    assert.ok(tasks.every((task) => Number.isFinite(Date.parse(task.due_date))));
    assert.ok(
      tasks.every((task) =>
        task.status === "done" ? task.completed_at !== null : task.completed_at === null,
      ),
    );
    const scheduled = db.calls.find((call) => call.table === "sessions").operations[0][1];
    assert.ok(
      scheduled.every((session) => Date.parse(session.ends_at) > Date.parse(session.starts_at)),
    );
    const attendees = db.calls.find((call) => call.table === "session_attendees");
    if (sessions.length)
      assert.deepEqual(
        attendees.operations[0][1],
        sessions.map((s) => ({ session_id: s.id, user_id: "user-1", status: "accepted" })),
      );
    else assert.equal(attendees, undefined);
    const resources = db.calls.find((call) => call.table === "resources").operations[0][1];
    assert.ok(
      resources.every(
        (resource) => resource.team_id === "team-1" && resource.created_by === "user-1",
      ),
    );
    const notification = db.calls.find((call) => call.table === "notifications").operations[0][1];
    assert.equal(notification.user_id, "user-1");
    assert.equal(notification.link, "/teams/team-1");
  });
}
test("sample removal deletes only sample teams created by the authenticated user", async () => {
  db.queue(ok(null));
  assert.deepEqual(await removeSampleWorkspace({ context }), { ok: true });
  assert.deepEqual(db.calls, [
    {
      table: "teams",
      operations: [["delete"], ["eq", "created_by", "user-1"], ["eq", "is_sample", true]],
    },
  ]);
});
test("sample removal surfaces database failure", async () => {
  db.queue(failure("delete denied"));
  await assert.rejects(removeSampleWorkspace({ context }), /delete denied/);
});
