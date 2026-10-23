import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { installMocks } from "../../helpers/modules.mjs";
import { createDatabase, ok, failure } from "../../helpers/supabase.mjs";

const db = createDatabase();
installMocks({ "src/integrations/supabase/client.ts": { supabase: db } });
const { fetchProfile } = await import("../../../src/frontend/features/profiles/api/queries.ts");
const { fetchMyTeams, fetchTeamMembers } =
  await import("../../../src/frontend/features/teams/api/queries.ts");
const { fetchTasks } = await import("../../../src/frontend/features/tasks/api/queries.ts");
const { fetchSessions } = await import("../../../src/frontend/features/sessions/api/queries.ts");
const { fetchResources } = await import("../../../src/frontend/features/resources/api/queries.ts");
const { fetchActivity, logActivity } =
  await import("../../../src/frontend/features/activity/api/queries.ts");
const { fetchNotifications, notify } =
  await import("../../../src/frontend/features/notifications/api/queries.ts");
beforeEach(() => db.reset());
afterEach(() => assert.equal(db.pending(), 0, "All expected queries must run"));

for (const [name, fetcher, table, sort, ascending] of [
  ["tasks", fetchTasks, "tasks", "position", true],
  ["sessions", fetchSessions, "sessions", "starts_at", true],
  ["resources", fetchResources, "resources", "updated_at", false],
  ["activity", fetchActivity, "activity_logs", "created_at", false],
]) {
  test(`${name}: no teams returns [] without a database request`, async () => {
    assert.deepEqual(await fetcher([]), []);
    assert.equal(db.calls.length, 0);
  });
  test(`${name}: scopes results to the supplied teams and orders them`, async () => {
    const rows = [{ id: "record-1" }];
    db.queue(ok(rows));
    assert.equal(await fetcher(["team-1", "team-2"]), rows);
    assert.equal(db.calls[0].table, table);
    assert.ok(
      db.calls[0].operations.some(
        (op) => JSON.stringify(op) === JSON.stringify(["in", "team_id", ["team-1", "team-2"]]),
      ),
    );
    assert.ok(
      db.calls[0].operations.some(
        (op) => JSON.stringify(op) === JSON.stringify(["order", sort, { ascending }]),
      ),
    );
  });
  test(`${name}: database errors reject`, async () => {
    db.queue(failure("access denied"));
    await assert.rejects(fetcher(["team-1"]), /access denied/);
  });
  test(`${name}: an empty database result remains empty`, async () => {
    db.queue(ok([]));
    assert.deepEqual(await fetcher(["team-1"]), []);
  });
}
test("profile: returns the requested user and applies an ID filter", async () => {
  db.queue(ok({ id: "user-1" }));
  assert.deepEqual(await fetchProfile("user-1"), { id: "user-1" });
  assert.deepEqual(db.calls[0].operations, [
    ["select", "*"],
    ["eq", "id", "user-1"],
    ["maybeSingle"],
  ]);
});
test("profile: missing user returns null", async () => {
  db.queue(ok(null));
  assert.equal(await fetchProfile("missing"), null);
});
test("profile: database error rejects", async () => {
  db.queue(failure("profile unavailable"));
  await assert.rejects(fetchProfile("u"), /profile unavailable/);
});
test("teams: no memberships avoids fetching teams", async () => {
  db.queue(ok([]));
  assert.deepEqual(await fetchMyTeams(), []);
  assert.equal(db.calls.length, 1);
});
test("teams: assigns roles by team ID rather than response order", async () => {
  db.queue(
    ok([
      { team_id: "a", role: "owner" },
      { team_id: "b", role: "admin" },
    ]),
    ok([{ id: "b" }, { id: "a" }]),
  );
  assert.deepEqual(await fetchMyTeams(), [
    { id: "b", role: "admin" },
    { id: "a", role: "owner" },
  ]);
  assert.deepEqual(db.calls[1].operations[1], ["in", "id", ["a", "b"]]);
});
test("teams: missing role defaults to member", async () => {
  db.queue(ok([{ team_id: "a", role: null }]), ok([{ id: "a" }]));
  assert.equal((await fetchMyTeams())[0].role, "member");
});
test("teams: membership failure stops before fetching teams", async () => {
  db.queue(failure("memberships unavailable"));
  await assert.rejects(fetchMyTeams(), /memberships unavailable/);
  assert.equal(db.calls.length, 1);
});
test("teams: team query failure propagates", async () => {
  db.queue(ok([{ team_id: "a" }]), failure("teams unavailable"));
  await assert.rejects(fetchMyTeams(), /teams unavailable/);
});
test("members: joins profiles by user ID and preserves missing profiles", async () => {
  db.queue(ok([{ user_id: "a" }, { user_id: "b" }]), ok([{ id: "b", display_name: "B" }]));
  assert.deepEqual(await fetchTeamMembers("team-1"), [
    { user_id: "a", profile: null },
    { user_id: "b", profile: { id: "b", display_name: "B" } },
  ]);
  assert.deepEqual(db.calls[0].operations[1], ["eq", "team_id", "team-1"]);
});
test("members: empty membership avoids profile request", async () => {
  db.queue(ok([]));
  assert.deepEqual(await fetchTeamMembers("t"), []);
  assert.equal(db.calls.length, 1);
});
test("members: membership errors propagate", async () => {
  db.queue(failure("members unavailable"));
  await assert.rejects(fetchTeamMembers("t"), /members unavailable/);
});
test("members: profile lookup errors propagate", async () => {
  db.queue(ok([{ user_id: "a" }]), failure("profiles unavailable"));
  await assert.rejects(fetchTeamMembers("t"), /profiles unavailable/);
});
test("notifications: newest first with a 50-record limit", async () => {
  db.queue(ok([{ id: "n" }]));
  assert.deepEqual(await fetchNotifications(), [{ id: "n" }]);
  assert.deepEqual(db.calls[0], {
    table: "notifications",
    operations: [
      ["select", "*"],
      ["order", "created_at", { ascending: false }],
      ["limit", 50],
    ],
  });
});
test("notifications: errors propagate", async () => {
  db.queue(failure("offline"));
  await assert.rejects(fetchNotifications(), /offline/);
});
test("activity: default limit is 25", async () => {
  db.queue(ok([]));
  await fetchActivity(["t"]);
  assert.deepEqual(db.calls[0].operations.at(-1), ["limit", 25]);
});
test("activity: explicit limit is respected", async () => {
  db.queue(ok([]));
  await fetchActivity(["t"], 7);
  assert.deepEqual(db.calls[0].operations.at(-1), ["limit", 7]);
});
for (const entityId of [undefined, "task-1"]) {
  test(`activity insert: entity ID ${entityId ?? "omitted"}`, async () => {
    db.queue(ok(null));
    await logActivity("t", "u", "created", "Created task", entityId);
    assert.deepEqual(db.calls[0], {
      table: "activity_logs",
      operations: [
        [
          "insert",
          {
            team_id: "t",
            actor_id: "u",
            action: "created",
            summary: "Created task",
            entity_id: entityId ?? null,
          },
        ],
      ],
    });
  });
}
for (const dedupeKey of [undefined, "dedupe-1"]) {
  test(`notification insert: dedupe key ${dedupeKey ?? "omitted"}`, async () => {
    db.queue(ok(null));
    await notify("u", "task", "Title", "Body", "/tasks", dedupeKey);
    assert.deepEqual(db.calls[0], {
      table: "notifications",
      operations: [
        [
          "insert",
          {
            user_id: "u",
            type: "task",
            title: "Title",
            body: "Body",
            link: "/tasks",
            dedupe_key: dedupeKey ?? null,
          },
        ],
      ],
    });
  });
}
