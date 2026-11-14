# Final testing

This folder tracks the complete test effort for TeamUp: unit, system, regression, database-security and load tests,
and the report of the latest run. Everything here runs offline; no Supabase project, login or AI key is needed.

## Run it

```bash
bun run test:final      # runs every suite and writes reports/TEST_REPORT.md
bun test                # just the tests, quickly
bun test Final_Testing/system   # one suite
```

The database tests apply every migration to an in-memory Postgres (PGlite). They need one optional dev tool:
`npm i -D @electric-sql/pglite` (or set `PGLITE_PATH` to its `index.js`). Without it they are **skipped, not passed**,
and the report says so.

## What is in here

| Folder / file     | What it is                                                                                                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `system/`         | Whole workflows across several screens and two signed-in students (assign a task, get notified, finish it, see the dashboard and history agree; AI matching from search to a booked session; sign-in rules). |
| `regression/`     | One test for every real bug found while testing (member shown the owner's role, step checkbox toggled by typing, unsafe Markdown, ...). If one fails, an old bug is back.                                    |
| `database/`       | Row-level-security audit: an outsider sees and changes nothing, nobody can pretend to be someone else, history can't be rewritten, signed-out visitors can't run database functions.                         |
| `load/`           | Speed with thousands of tasks, notes, notifications and students, and a dashboard with 2,000 tasks.                                                                                                          |
| `TEST_PLAN.md`    | What is tested, how, and what "done" means.                                                                                                                                                                  |
| `TRACEABILITY.md` | Every requirement (Functionality 1-6, AI, Additional AI features) mapped to the tests that prove it.                                                                                                         |
| `reports/`        | `TEST_REPORT.md` (latest run) and `logs/` (full output of each suite).                                                                                                                                       |

The unit and screen tests live in `/tests` (one folder per area). The web-server load plan (JMeter) and the browser
tests (Playwright) written by the team are in `/Tests_Requirements`; they need their own tools and are not run by bun.

## What the tests can and cannot show

- They prove the app's rules and screens against a faithful stand-in for Supabase, and the database rules against a real
  Postgres engine. They do not call the live NVIDIA AI service or the live Supabase project, and a real browser is not
  used (use the Playwright and JMeter files for that).
- Drag-and-drop of task cards can't be simulated here; the status menu uses the same code and is tested.
- Before a release also run the SQL files in `drizzle/migrations` (in order) on the Supabase project the site uses.
