# Test report — 23 Oct 2026

Measured on commit state of this report with Node 24.22, `npm ci` from `package-lock.json`.

## Results

| Check                            | Command                    | Result                                                           |
| -------------------------------- | -------------------------- | ---------------------------------------------------------------- |
| Unit tests                       | `npm test`                 | **160 passed, 0 failed** (141 existing + 19 added)               |
| Line coverage of tested modules  | `npm run test:coverage`    | **99.79 %** lines, 95.70 % branches, 96.05 % functions           |
| Accessibility (axe + keyboard)   | `npm run test:a11y`        | **22 passed, 0 failed** (11 scenarios x desktop/mobile Chromium) |
| TypeScript                       | `npm run typecheck`        | Passed, 0 errors                                                 |
| Lint                             | `npm run lint`             | 0 errors, 13 advisory warnings (react-hooks/exhaustive-deps)     |
| Production build                 | `npm run build`            | Passed                                                           |
| Live database isolation (RLS)    | `npm run test:integration` | **Not run** — needs a dedicated Supabase test project            |
| Manual scenarios                 | `tests/manual/`            | **Not run** — scenarios written, results not recorded            |
| Cypress end-to-end (FR-01/02/04) | —                          | **Not started**                                                  |
| k6 load test, 50 users (NFR-01)  | —                          | **Not started**                                                  |

Coverage is measured over the modules the unit suite loads (backend handlers,
auth, queries, shared libraries, scheduling logic). It is not whole-application
coverage; React components are exercised only by the accessibility suite.

## Added in this iteration

`tests/unit/frontend/schedule.test.mjs` (19 tests). To make the logic testable
without a browser, two pure functions were moved out of React component files
with no behaviour change:

| New module                      | Moved from                                                       | Tests                                                                                                                                                 |
| ------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `features/sessions/schedule.ts` | `SessionsPanel.tsx` (`expandSessions`, meeting-finder bucketing) | weekly recurrence, `recurrence_end`, range filtering, sorting, unique keys; 30-minute availability overlap, ranking, ties, per-member counting, limit |
| `features/tasks/errors.ts`      | `TaskBoard.tsx` (`taskErrorMessage`)                             | RLS denial (`42501`) message and pass-through                                                                                                         |

## Traceability: requirements to tests

| Requirement                      | Automated evidence                                                                                                | Gap                                              |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| FR-01 sign-in / profile          | `auth.test.mjs`, `auth-middleware.test.mjs`, `queries.test.mjs`                                                   | E2E sign-in flow (Cypress) not run               |
| FR-02 teams / invites            | `queries.test.mjs`, `sample-workspace.test.mjs`                                                                   | E2E create/join; invite races need live DB tests |
| FR-03 calendar + overlap         | `schedule.test.mjs` (new)                                                                                         | Time-zone / DST cases are manual                 |
| FR-04 task board                 | `queries.test.mjs`, `schedule.test.mjs` (errors)                                                                  | Drag-and-drop E2E not run                        |
| FR-05 notes / files              | `queries.test.mjs`                                                                                                | Upload and signed-URL checks are manual          |
| FR-06 notifications              | `queries.test.mjs`                                                                                                | -                                                |
| FR-07 dashboard                  | `queries.test.mjs` (activity)                                                                                     | Totals vs. records is manual                     |
| FR-08 AI matching                | `ai-gateway.test.mjs`, `ai-handlers.test.mjs`                                                                     | 20-sample relevance review not done              |
| FR-09 permissions                | `auth-middleware.test.mjs`, `cron-auth.test.mjs`, `ai-handlers.test.mjs`, `database-isolation.test.mjs` (skipped) | Live RLS verification pending                    |
| FR-10 task filters               | -                                                                                                                 | UI only; covered by manual scenario              |
| NFR-01 performance               | -                                                                                                                 | k6 not run                                       |
| NFR-02 security                  | `auth-middleware.test.mjs`, `cron-auth.test.mjs`                                                                  | -                                                |
| NFR-03 usability / accessibility | `components.spec.ts` (22 checks)                                                                                  | Screen-reader spot check manual                  |

## Quality criteria from the proposal

| Criterion                                           | Target  | Current                                                    | Met?    |
| --------------------------------------------------- | ------- | ---------------------------------------------------------- | ------- |
| Automated suite pass rate before sprint review      | >= 90 % | 182 / 182 = 100 %                                          | Yes     |
| Critical-flow tests passing before final submission | 100 %   | Cypress flows not yet written                              | Pending |
| Line coverage on core logic                         | >= 70 % | 99.79 % (loaded modules)                                   | Yes     |
| Critical defects resolved before delivery           | 0 open  | No defect log in the repository; team to confirm from Jira | Pending |
| AI suggestions manually reviewed                    | >= 20   | 0 reviewed                                                 | Pending |
