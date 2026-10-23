# TeamUp

**Group 6 | CSE 6324 | Advanced Topics in Software Engineering**

TeamUp helps students organize project teams, track tasks, schedule study
sessions, share resources, and plan their work with an AI assistant.

## Requirements

- Node.js 24 or newer and npm
- A Supabase project providing PostgreSQL, authentication, and storage
- Access to the configured AI gateway for AI features (optional for core usage)

## Run locally

1. Clone the repository and enter the project directory:

   ```sh
   git clone https://github.com/malaika-farooq/TeamUp_AdvSE-.git
   cd TeamUp_AdvSE-
   ```

2. Install dependencies:

   ```sh
   npm ci
   ```

3. Copy `.env.example` to `.env`:

   ```sh
   # macOS / Linux
   cp .env.example .env
   ```

   ```powershell
   # Windows PowerShell
   Copy-Item .env.example .env
   ```

4. Fill in your Supabase URL, publishable key, and project ID. Set
   `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` to the matching values for
   server-side authentication. Never use a service-role key in a `VITE_` variable.

5. Use a backend with the schema and storage policies in `drizzle/migrations/`
   already applied. For a new backend, see the [database guide](drizzle/README.md)
   before applying migrations. Configure email/OAuth redirect URLs in your
   authentication provider for your local address. Database setup is separate
   from starting the frontend; this repository does not start PostgreSQL for you.

6. Start the app:

   ```sh
   npm run dev -- --host 127.0.0.1 --port 3000
   ```

   Open **http://127.0.0.1:3000**. Register or sign in to use protected features.

PowerShell users with restricted script execution can use `npm.cmd` in place
of `npm`.

## Environment configuration

| Variable                        | Purpose                                                  |
| ------------------------------- | -------------------------------------------------------- |
| `VITE_SUPABASE_URL`             | Browser backend URL                                      |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public browser API key                                   |
| `VITE_SUPABASE_PROJECT_ID`      | Backend project identifier                               |
| `SUPABASE_URL`                  | Server backend URL                                       |
| `SUPABASE_PUBLISHABLE_KEY`      | Server authentication API key                            |
| `AI_GATEWAY_API_KEY`            | Optional server credential for the configured AI gateway |
| `DATABASE_MIGRATION_URL`        | Privileged PostgreSQL connection for migration tooling   |

Keep `.env` and server credentials out of source control. AI calls use the
existing gateway contract; using another provider requires adapting that client.

## Project structure

```text
src/
  frontend/       UI components, feature API clients, hooks, providers
  backend/
    api/          Server endpoints
    ai/           AI handlers and gateway client
  routes/         TanStack route declarations and screens
  integrations/   Authentication and backend connections
  types/          Shared database-derived types
  lib/            Shared utilities and error handling
drizzle/          PostgreSQL migrations and policies
supabase/         Backend project configuration
tests/            Unit, accessibility, integration, and manual cases
docs/             Architecture and technology guides
```

The frontend and backend run together in TanStack Start. Supabase Auth issues
JWT access tokens; protected server functions verify claims, while database
row-level security enforces access to records.

## Tests

```sh
npm test
npm run test:coverage
npx playwright install chromium
npm run test:a11y
npm run test:integration
```

- Unit tests run without a live backend.
- Accessibility tests mount production UI components in Chromium and check
  WCAG A/AA rules, accessible names, keyboard operation, focus handling,
  announcements, and responsive layouts on desktop and mobile viewports.
- Integration tests require explicit opt-in and a dedicated test database;
  otherwise they report skipped.

See [tests/testreadme.md](tests/testreadme.md) for setup, scope, and limitations.
Automated checks complement manual keyboard and screen-reader testing; they
are not a claim of full accessibility compliance.

## Build and checks

```sh
npm run build
npm run preview
npm run lint
```

The accessibility fixture runs independently of Supabase. To type-check app
source after installing dependencies, run `npx tsc --noEmit`.

## Technology

React, TypeScript, TanStack Start/Router/Query, Tailwind CSS, PostgreSQL,
Supabase, Playwright, and axe-core.

See the [source guide](src/README.md), [project guide](docs/README.md), and
[database guide](drizzle/README.md) for implementation details.

## Project management and quality evidence

- [Agile execution (Scrum), Definition of Done and sprint backlog](docs/agile/README.md)
- [Contribution workflow](CONTRIBUTING.md) — backlog IDs in branches, commits and pull requests
- [Test report](docs/testing/TEST_REPORT.md) and [risk register](docs/testing/RISK_REGISTER.md)
- [Proposal and progress report documents](docs/reports/)
- CI: `.github/workflows/ci.yml` runs type check, lint, unit tests with coverage, build and accessibility tests
