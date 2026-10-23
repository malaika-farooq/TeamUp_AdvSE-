# TeamUp test guide

The suite contains **141 automated unit tests** and **6 opt-in, read-only
database integration tests**. A separate accessibility suite runs **22 browser
checks**. Additional browser and database-write scenarios are listed separately
as manual cases. This is a starting regression suite, not proof that
every possible input or user journey has been tested.

## Requirements and commands

Use **Node.js 24 or newer**. The unit suite uses Node's built-in test runner and
native TypeScript support, so no dependency installation or backend credentials
are needed to run it. It executes application modules with explicit external
boundary mocks; it does not start Vite or compile the React application.

From the project root:

```sh
npm test
npm run test:unit
npm run test:coverage
npm run test:integration
```

PowerShell users whose execution policy blocks `npm.ps1` can use `npm.cmd`.
The equivalent dependency-free commands are:

```sh
node tests/run.mjs
node tests/run.mjs unit
node tests/run.mjs unit --coverage
node tests/run.mjs integration
```

`npm test` runs the unit suite only. The runner discovers `.test.mjs` files
recursively inside the selected suite and returns a nonzero exit code on failure.
Test files run in separate processes; cases within a file use sequential state
and restore their mocked globals and environment settings.

## Directory structure

```text
tests/
  testreadme.md
  run.mjs
  .env.example
  helpers/
    modules.mjs                 Alias resolution and explicit dependency mocks
    supabase.mjs                Queued database responses and recorded filters
  unit/
    backend/
      ai-gateway.test.mjs       AI HTTP requests, errors, and JSON extraction
      ai-handlers.test.mjs      Membership gates, planning, summary, matching
      auth-middleware.test.mjs  Token verification and scoped client creation
      cron-auth.test.mjs        Cron authorization and secret rotation
      sample-workspace.test.mjs Sample creation, idempotency, scoped deletion
    frontend/
      auth.test.mjs             OAuth session handoff and RPC token attachment
      queries.test.mjs          Feature query behavior and database errors
    shared/
      error-reporting.test.mjs  SSR safety and browser telemetry forwarding
      results.test.mjs          Database results, safe accents, error recovery
  accessibility/
    components.spec.ts          Browser accessibility and keyboard tests
    playwright.config.ts        Desktop/mobile Chromium projects
    vite.config.ts              Isolated production-component harness
    fixture/                    Test-only HTML and React entry
  integration/
    database-isolation.test.mjs Live Supabase SELECT isolation checks
  manual/
    browser-and-database.md     Browser, accessibility, write-policy scenarios
```

## Automated coverage

| Area                  | Cases exercised                                                                                                                                                                                                                                          |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Feature queries       | Empty team lists avoid requests; team-ID scoping; sort direction; missing profiles; profile joins independent of result order; role mapping; empty results; database errors; notification and activity limits; insert payload ownership and optional IDs |
| Server authentication | Missing configuration/request/header; wrong scheme; empty/malformed token; rejected claims; missing subject; verification network error; verified user context; session persistence disabled; downstream failures                                        |
| API-key handling      | Opaque publishable/secret API keys are not forwarded as JWT bearer tokens; user bearer tokens and legacy keys are preserved; request/init headers merge correctly                                                                                        |
| Cron authentication   | Missing configuration; absent/invalid credentials; malformed bearer values; current/previous secrets; completed rotation; different-length attacker tokens                                                                                               |
| OAuth/RPC             | Signed-in/out headers; provider options; redirect without session handoff; provider errors; successful session installation; thrown session-storage errors                                                                                               |
| AI gateway            | Neutral/legacy key selection; missing key; request headers and body; credits/rate limits; upstream HTTP/network/JSON failures; absent content; fenced/nested JSON; malformed output fallback                                                             |
| AI handlers           | Team/user membership scoping; deny before provider calls; supplied team facts; empty records; summary query scoping and limits; discoverable candidates; exclude existing members; no candidate fast path                                                |
| Sample workspace      | Return existing workspace without duplicates; failed create RPC; seeded tasks and valid session times; attendee branching; resource/user ownership; notifications; delete only the caller's sample teams; delete failure                                 |
| Shared behavior       | Preserve successful values; propagate database errors; safe accent fallback; error page recovery controls; SSR without window; optional telemetry hooks; Error/string/null/Response reporting                                                            |

The AI gateway helpers were moved into `src/backend/ai/gateway.server.ts` so
their real HTTP/error/parsing behavior can be tested independently. Server
function handlers still use the same helpers.

## UI accessibility tests

Install project dependencies and the Chromium browser, then run:

```sh
npm ci
npx playwright install chromium
npm run test:a11y
npm run test:a11y:report
```

The suite runs 11 scenarios in each of two Chromium projects: desktop and
mobile (22 browser checks). It starts a dedicated Vite fixture at
http://127.0.0.1:4174 and mounts the actual production components and styles.
No Supabase account, test user, or AI credential is required. The fixture is
not a second application or a production route.

Coverage includes light/dark axe-core WCAG 2 A/AA and 2.1 A/AA scans, accessible
input labels/descriptions, keyboard checkbox/switch behavior, disabled-button
tab order, dialog name/description, focus trapping and restoration, arrow-key
tabs, live loading/error states, retry interaction, and horizontal reflow.
Axe rules are not disabled to hide failures. Reports and failure traces stay
in ignored playwright-report/ and test-results/ directories.

These are component integration tests, not full authenticated-page or
screen-reader tests. Public/protected pages, custom task dialogs, navigation,
file uploads, and screen-reader experience still need the manual scenarios.

## Database integration setup

Use a dedicated Supabase test project containing the application migrations.
Provision two normal authenticated test users:

1. An owner with a **private** test team.
2. An outsider who is not a member of that team.

Seed at least one record for that team in each of `team_members`, `tasks`,
`sessions`, `resources`, and `activity_logs`. The team row itself is also tested.
Use the users' valid access tokens and the project's publishable key; do not
use a service-role key, which bypasses row-level security.

Export the variables listed in `tests/.env.example` in your shell. For example:

```powershell
$env:RUN_DATABASE_TESTS = '1'
$env:TEST_SUPABASE_URL = 'https://your-test-project.supabase.co'
$env:TEST_SUPABASE_PUBLISHABLE_KEY = 'your-test-publishable-key'
$env:TEST_OWNER_TOKEN = 'owner-test-user-access-token'
$env:TEST_OUTSIDER_TOKEN = 'outsider-test-user-access-token'
$env:TEST_PRIVATE_TEAM_ID = 'your-private-team-uuid'
npm.cmd run test:integration
```

The example file is documentation; it is not automatically loaded. Without
opt-in the integration tests explicitly skip. With opt-in, missing settings
fail the run. Each test first proves the owner can read a populated fixture,
then requires an empty response for the outsider. An HTTP error fails the test
instead of being mistaken for successful isolation. Tests make GET requests
only and use a 15-second request timeout.

## Limits and remaining work

- Unit mocks do not verify Supabase's actual RLS or JWT signature verification.
  The authentication tests check the application's handling of verification
  results; the provider library performs verification in production.
- Handler tests call the real handler bodies with supplied context/data. Their
  framework wrappers are mocked, so they do not verify Zod input validation,
  middleware registration, CSRF protection, RPC transport, or bundling.
- The Node unit suite does not mount React. The separate accessibility suite
  mounts selected production components in Chromium; it does not mount full
  authenticated pages, providers, or drag-and-drop boards. Follow the
  [browser/database cases](manual/browser-and-database.md) for those checks.
- Database writes, storage policies, invitation races, and concurrent updates
  require additional live integration tests. The six automated database checks
  exercise SELECT isolation only.
- JSON extraction is tested, but it does not establish that AI output conforms
  to a task or teammate schema or that provider recommendations are accurate.
- Some existing write helpers do not inspect resolved database error objects.
  The suite checks their payloads; it does not claim reliable error propagation
  for every write or transactional sample creation.
- Coverage output includes loaded modules, not every application file. A high
  percentage there is not whole-project coverage or proof of correctness.
- Run the production build, TypeScript, and lint checks separately once the
  application dependencies are installed. Unit success does not replace them.

## Adding tests

Mirror the frontend/backend/shared organization under `unit/`. Test observable
behavior and failure paths, use fake identifiers and credentials, and mock only
external boundaries. Queue every expected database response; unexpected requests
and unconsumed fixtures fail tests. Keep network-dependent checks under
`integration/`, behind explicit opt-in, and document any fixture requirements.

Validation results are reported with the corresponding commit. Live database
tests require explicit configuration; a skipped test is not a passing database
check. Manual browser scenarios remain distinct from automated checks.

## Verified results

- Unit suite: 141 passed.
- Chromium accessibility suite: 22 passed across desktop and mobile projects.
- Application and accessibility-harness TypeScript checks: passed.
- Production build: passed.
- Lint: no errors; existing advisory warnings remain.
- Live database isolation checks: not configured; previously reported skipped.
- Manual screen-reader and full authenticated-page scenarios: not executed.
