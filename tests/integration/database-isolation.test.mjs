import { test } from "node:test";
import assert from "node:assert/strict";

// Read-only integration checks. Fixtures must already exist in a dedicated
// Supabase test project. No service-role key is used: RLS must remain active.
const names = [
  "TEST_SUPABASE_URL",
  "TEST_SUPABASE_PUBLISHABLE_KEY",
  "TEST_OWNER_TOKEN",
  "TEST_OUTSIDER_TOKEN",
  "TEST_PRIVATE_TEAM_ID",
];
const missing = names.filter((name) => !process.env[name]);
const enabled = process.env.RUN_DATABASE_TESTS === "1";
const skip = !enabled
  ? "Set RUN_DATABASE_TESTS=1 to opt in"
  : missing.length
    ? `Missing: ${missing.join(", ")}`
    : false;
if (enabled && missing.length)
  throw new Error(
    `Database tests requested but configuration is incomplete: ${missing.join(", ")}`,
  );

async function rows(table, filter, token) {
  const url = new URL(`/rest/v1/${table}`, process.env.TEST_SUPABASE_URL);
  url.searchParams.set("select", "id");
  for (const [key, value] of Object.entries(filter)) url.searchParams.set(key, `eq.${value}`);
  const headers = { apikey: process.env.TEST_SUPABASE_PUBLISHABLE_KEY };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
  // Errors fail instead of being treated as successful isolation: this catches
  // invalid/expired credentials and missing tables or grants.
  assert.equal(
    response.status,
    200,
    `${table}: expected a successful REST query, got ${response.status}`,
  );
  const data = await response.json();
  assert.ok(Array.isArray(data));
  return data;
}

for (const table of ["teams", "team_members", "tasks", "sessions", "resources", "activity_logs"]) {
  test(`RLS: outsider cannot read the private team's ${table}`, { skip }, async () => {
    const filter = { [table === "teams" ? "id" : "team_id"]: process.env.TEST_PRIVATE_TEAM_ID };
    const visible = await rows(table, filter, process.env.TEST_OWNER_TOKEN);
    assert.ok(
      visible.length > 0,
      `Seed at least one ${table} fixture; empty owner results cannot prove isolation`,
    );
    const denied = await rows(table, filter, process.env.TEST_OUTSIDER_TOKEN);
    assert.deepEqual(denied, [], `Private ${table} leaked to a non-member`);
  });
}
