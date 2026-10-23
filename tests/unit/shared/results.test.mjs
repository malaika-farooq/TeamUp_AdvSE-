import { test } from "node:test";
import assert from "node:assert/strict";
import { unwrap } from "../../../src/lib/supabase-result.ts";
import { accentClasses } from "../../../src/frontend/features/teams/presentation.ts";
import { renderErrorPage } from "../../../src/lib/error-page.ts";

for (const data of [[], { id: "team-1" }, 0, false, "", null]) {
  test(`unwrap preserves successful ${JSON.stringify(data)}`, () => {
    assert.equal(unwrap({ data, error: null }), data);
  });
}
test("unwrap propagates database error even when data is present", () => {
  assert.throws(
    () => unwrap({ data: [], error: { message: "permission denied" } }),
    /permission denied/,
  );
});
for (const accent of ["teal", "lavender", "blue", "primary"]) {
  test(`accent ${accent} has matching background, text and border`, () => {
    assert.equal(accentClasses(accent), `bg-${accent}/15 text-${accent} border-${accent}/30`);
  });
}
for (const accent of [undefined, null, "", "unknown", "<script>"]) {
  test(`unrecognized accent ${String(accent)} uses the safe default`, () => {
    assert.equal(accentClasses(accent), accentClasses("teal"));
  });
}
test("SSR failure page offers refresh and home recovery without exposing a stack", () => {
  const html = renderErrorPage();
  assert.match(html, /<!doctype html>/i);
  assert.match(html, /location.reload\(\)/);
  assert.match(html, /href="\/"/);
  assert.doesNotMatch(html, /process\.env|stack trace/i);
});
