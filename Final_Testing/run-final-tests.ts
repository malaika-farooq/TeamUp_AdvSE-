// Runs every kind of test for TeamUp and writes Final_Testing/reports/TEST_REPORT.md (plus one log per suite).
//   bun run test:final
// Optional: set PGLITE_PATH (or install @electric-sql/pglite) so the database security tests run instead of skipping.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const reports = join(import.meta.dir, "reports");
mkdirSync(join(reports, "logs"), { recursive: true });

type Suite = { id: string; name: string; paths: string[]; covers: string };
const suites: Suite[] = [
  {
    id: "unit",
    name: "Unit and screen tests",
    paths: ["tests"],
    covers:
      "Functionalities 1-6, AI Teammate Matching, Additional AI features, rules and every screen",
  },
  {
    id: "system",
    name: "System tests (whole workflows)",
    paths: ["Final_Testing/system"],
    covers:
      "Assign -> notify -> finish -> dashboard; AI matching to booked session; access control",
  },
  {
    id: "regression",
    name: "Regression tests",
    paths: ["Final_Testing/regression"],
    covers: "Bugs found and fixed during testing must not come back",
  },
  {
    id: "database",
    name: "Database security and workflow tests",
    paths: ["Final_Testing/database"],
    covers: "Row-level security, permissions, migrations, reminders",
  },
  {
    id: "load",
    name: "Load and performance tests",
    paths: ["Final_Testing/load"],
    covers: "Engines and screens with thousands of records",
  },
];

type Result = {
  suite: Suite;
  pass: number;
  fail: number;
  skip: number;
  files: number;
  seconds: number;
  code: number;
};

async function run(suite: Suite): Promise<Result> {
  const started = performance.now();
  const proc = Bun.spawn([process.execPath, "test", ...suite.paths], {
    cwd: root,
    stdout: "pipe",
    stderr: "pipe",
    env: process.env,
  });
  const [out, err] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const code = await proc.exited;
  const text = `${out}\n${err}`;
  writeFileSync(join(reports, "logs", `${suite.id}.log`), text.replace(new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g"), ""));
  const num = (re: RegExp) => Number(text.match(re)?.[1] ?? 0);
  return {
    suite,
    pass: num(/^\s*(\d+) pass/m),
    fail: num(/^\s*(\d+) fail/m),
    skip: num(/^\s*(\d+) skip/m),
    files: num(/across (\d+) file/),
    seconds: Math.round((performance.now() - started) / 100) / 10,
    code,
  };
}

const results: Result[] = [];
for (const s of suites) {
  process.stdout.write(`Running ${s.name}... `);
  const r = await run(s);
  results.push(r);
  console.log(
    `${r.pass} passed, ${r.fail} failed${r.skip ? `, ${r.skip} skipped` : ""} (${r.seconds}s)`,
  );
}

const total = results.reduce(
  (a, r) => ({ pass: a.pass + r.pass, fail: a.fail + r.fail, skip: a.skip + r.skip }),
  {
    pass: 0,
    fail: 0,
    skip: 0,
  },
);
const verdict = total.fail === 0 && results.every((r) => r.code === 0) ? "PASS" : "FAIL";
const when = new Date().toISOString().replace("T", " ").slice(0, 16);
const rows = results
  .map(
    (r) =>
      `| ${r.suite.name} | ${r.files} | ${r.pass} | ${r.fail} | ${r.skip} | ${r.seconds}s | ${r.fail === 0 && r.code === 0 ? "Pass" : "FAIL"} |`,
  )
  .join("\n");
const skipNote = total.skip
  ? "\n> Some tests were skipped. The database tests need the dev tool PGlite (`npm i -D @electric-sql/pglite`, or set `PGLITE_PATH`). Skipped tests are not counted as passed.\n"
  : "";

writeFileSync(
  join(reports, "TEST_REPORT.md"),
  `# TeamUp final test report

**Result: ${verdict}**  ·  Run on ${when} (UTC)  ·  ${total.pass} passed, ${total.fail} failed, ${total.skip} skipped

| Suite | Files | Passed | Failed | Skipped | Time | Result |
|---|---|---|---|---|---|---|
${rows}
${skipNote}
What each suite covers:

${results.map((r) => `- **${r.suite.name}:** ${r.suite.covers}`).join("\n")}

Full output for each suite is in \`Final_Testing/reports/logs/\`. How requirements map to tests: \`Final_Testing/TRACEABILITY.md\`.
`,
);
console.log(
  `\n${verdict}: ${total.pass} passed, ${total.fail} failed, ${total.skip} skipped. Report: Final_Testing/reports/TEST_REPORT.md`,
);
process.exit(verdict === "PASS" ? 0 : 1);
