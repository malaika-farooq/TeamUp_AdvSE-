import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { reportRuntimeError } from "../../../src/lib/error-reporting.ts";

afterEach(() => {
  delete globalThis.window;
});
test("server-side reporting is safe without window", () => {
  assert.doesNotThrow(() => reportRuntimeError(new Error("server error")));
});
test("browser reporting is safe when preview hooks are absent", () => {
  globalThis.window = { location: { pathname: "/tasks" } };
  assert.doesNotThrow(() => reportRuntimeError(new Error("browser error")));
});
test("reports the original exception, route, context, and boundary metadata", () => {
  const calls = [];
  globalThis.window = {
    location: { pathname: "/tasks" },
    __lovableEvents: { captureException: (...args) => calls.push(args) },
  };
  const error = new Error("render failed");
  reportRuntimeError(error, { boundary: "root" });
  assert.deepEqual(calls, [
    [
      error,
      { source: "react_error_boundary", route: "/tasks", boundary: "root" },
      {
        mechanism: "react_error_boundary",
        handled: false,
        severity: "error",
      },
    ],
  ]);
});
for (const [name, error, message] of [
  ["Error", new Error("render failed"), "render failed"],
  ["string", "thrown string", "thrown string"],
  ["null", null, "null"],
  ["Response", new Response(null, { status: 403 }), "Response 403"],
]) {
  test(`preview runtime hook receives useful details for ${name}`, () => {
    let payload;
    globalThis.window = {
      location: { pathname: "/dashboard" },
      __lovableReportRuntimeError: (value) => {
        payload = value;
      },
    };
    reportRuntimeError(error);
    assert.equal(payload.message, message);
    assert.equal(payload.filename, "/dashboard");
    if (error instanceof Error) assert.equal(payload.stack, error.stack);
    else assert.equal("stack" in payload, false);
  });
}
