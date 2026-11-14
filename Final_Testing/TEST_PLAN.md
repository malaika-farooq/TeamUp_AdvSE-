# Test plan

## Goal

Show that every feature works as a student would use it, that the features work _together_, and that there is no way to
get past the rules (see someone else's team, pretend to be someone else, run code through a note, reach a dead end).

## Levels

1. **Unit tests** (`tests/`): each rule on its own (ranking, due dates, validation, filters) and each screen driven like
   a person would (typing, clicking, uploading) against an in-memory stand-in for Supabase.
2. **System tests** (`Final_Testing/system`): several screens and two different students sharing one database.
3. **Regression tests** (`Final_Testing/regression`): one test for every bug found while testing.
4. **Database tests** (`Final_Testing/database`): every migration applied to a real Postgres engine (PGlite); permissions
   attacked as an outsider, a member, an owner and a signed-out visitor.
5. **Load tests** (`Final_Testing/load`): time budgets with thousands of records. The web-server load plan is in
   `Tests_Requirements/load_testing`.

## Entry and exit

- Entry: `bun install`, no environment variables needed.
- Exit ("done"): `bun run test:final` reports **PASS** with 0 failed; `npx tsc --noEmit` is clean; `npx eslint` has no
  errors on changed files; `bunx vite build` succeeds.

## Defects found and fixed while testing (this round)

| Defect                                                                                   | How it was found            | Fix                                                                        |
| ---------------------------------------------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------- |
| A plain member was shown the owner's role in the app (buttons the database would refuse) | System test of two students | "My teams" now reads only the student's own membership                     |
| Clicking a step's text in "Break down a task" ticked or unticked its box                 | Screen test                 | Checkbox and text box no longer share a label                              |
| Notes/links: a `javascript:` link could be saved and run                                 | Review of link handling     | Only web addresses are accepted, in the app and in the database            |
| Signed-out visitors could run `create_team` and any future elevated function             | Database audit              | Migration 0013 closes every elevated function except the invitation lookup |
| Opening a team you can't access was a dead end                                           | System test                 | "Back to My Teams" and "Find a team to join"                               |
| Study Partners opened on an empty tab while a request was waiting                        | System test                 | Opens on Requests until the student picks a tab                            |
| A meeting could end before it started or last days                                       | Review                      | Session form is checked before saving                                      |
| Progress figures slowed to ~9 s with 20,000 tasks                                        | Load test                   | One pass per member, cheaper overdue check                                 |
| Deleting a task and commenting left no trace in the history                              | Functionality 6 review      | Both are now logged                                                        |
| The activity history could only show the latest 50 events                                | Functionality 6 review      | Paged history with person / type / period filters                          |
