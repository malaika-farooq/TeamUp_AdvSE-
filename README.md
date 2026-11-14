# TeamUp

TeamUp is a collaborative study and team-planning web app. Students create or join teams, plan and assign tasks, find common meeting times, share notes and links, get notified about deadlines, follow their team's progress, find study partners, and use an AI feature (**AI Teammate Matching**) that works from their own profile, skills, availability and workload.

## 1. Project information

|                         |                                                                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Team ID**             |  6  |
| **Repository**          | <https://github.com/malaika-farooq/TeamUp_AdvSE-> (branch `latest`)                                                                                          |
| **Final tested commit** | Run `git rev-parse HEAD` on the branch you submit and write the hash here: `__________`. The run that verified it is `Final_Testing/reports/TEST_REPORT.md`. |
| **Live deployment**     | Vercel (see [Deployment] (#deployment))  https://teamupadvse.vercel.app/     | 

### Team

| Member             | Student ID             | Area                                                                                                                                                    |
| ------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Malaika Farooq** | 1002311562             | Product Workflow, frontend and UI/UX, all six functionalities, AI integration, database migrations and security hardening, deployment, final testing and release |
| Krishan Lnu        | 1002306864             | Testing documentation, requirement, system and regression test cases, JMeter load plan, Playwright tests                                                |
| Aditi Vishal       | 1002387938             | Backend Development and business-rule review and Integration, testing review                                                                                                                       |
| Amogh Dhole        | 1002055522             | Database schema design and migration testing review                                                                                                                                  |

### Who built what (from the git history)

On the submitted branch (`latest`), **23 of the 33 commits (about 70%) are Malaika's** and 10 are Krishan's. The features table below says which part each person delivered; every migration from `0007` to `0013`, every screen described in section 8, the AI feature, and all test suites under `tests/` and `Final_Testing/` were added by Malaika. See `git shortlog -sn latest` to check.

| Contributor    | Commits | Delivered                                                                                                                                                                                                              |
| -------------- | ------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Malaika Farooq |      23 | Project structure, Supabase integration and authentication, Functionalities 1-6, AI Teammate Matching and the additional AI features, migrations 0007-0013, 800+ automated tests, final test suites, Vercel deployment |
| Krishan Lnu    |      10 | Testing documentation (`tests/test_results`, `Tests_Requirements/`), requirement / system / regression / load test cases, JMeter plan, Playwright specs                                                                |

## 2. Features

| Functionality                                  | What it does                                                                                                                                                                                                                      | Built by |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **1. Profiles**                                | Photo, enrolled courses, skills (1-5), weekly availability (quick blocks or exact times), completeness meter                                                                                                                      | Malaika  |
| **2. Teams, invitations, roles**               | Public/private teams, invitation links and direct invitations, join requests with approve/decline, owner / admin / member permissions enforced in the database                                                                    | Malaika  |
| **3. Meeting times**                           | Every member marks free time; the team's **Meeting times** tab shows a free-time map, ranks the best common times (30 min-2 h), converts time zones, reminds people who haven't added any, and books the chosen time in one click | Malaika  |
| **4. Task board**                              | To Do / In Progress / Done, drag-and-drop or status menu, assignees, due dates ("Overdue by 2 days"), priorities, edit after creating, filters, checklist, comments                                                               | Malaika  |
| **5. Shared notes, links and notifications**   | Markdown notes, safe web links and files with tags and search, edit conflict detection; a bell, a Notifications page, and automatic deadline reminders                                                                            | Malaika  |
| **6. Progress dashboard and activity history** | **Progress** tab (tasks by status, upcoming deadlines, per-member contributions) and **Activity** tab (filters by person, type and period, paged history)                                                                         | Malaika  |
| **AI Teammate Matching**                       | Suggests study partners and group sessions from profile, skills, availability and workload; send requests, plan and book sessions                                                                                                 | Malaika  |
| **Additional AI features**                     | Plan tasks, break down a task, progress summary, weekly check-in, meeting agenda, study guide, practice quiz, teammate ideas, saved chat threads                                                                                  | Malaika  |
| **Sign-in**                                    | Email/password and Google, three-step onboarding, JWT-protected server calls                                                                                                                                                      | Malaika  |
| **Test documentation and load/browser tests**  | Requirement, system, regression and load test cases, JMeter plan, Playwright specs                                                                                                                                                | Krishan  |

## 3. Directory map

```text
TeamUp/
├── README.md                    This file
├── src/                         Application source code
│   ├── routes/                  Pages (file-based), /api/ai/* endpoints, protected screens
│   ├── components/              Product UI (app/), AI chat pieces (ai-elements/), UI primitives (ui/)
│   ├── lib/                     Rules and server functions: ranking, task board, progress, notifications, AI gateway, auth
│   ├── integrations/supabase/   Supabase clients, JWT auth middleware, generated types
│   └── styles.css, router.tsx   Theme and router setup
├── drizzle/migrations/          SQL schema, security policies and functions (0000-0013), run in order
├── supabase/                    Supabase config and seed.sql (sample data)
├── tests/                       Unit and screen tests, grouped by area; test_cases/, test_results/ (test cases and earlier results)
├── Final_Testing/               Final test effort: system, regression, database-security and load tests, plan, traceability, report
│   ├── README.md                How to run and what each suite covers
│   ├── TEST_PLAN.md             Test levels, exit criteria, defects found and fixed
│   ├── TRACEABILITY.md          Requirement -> test mapping
│   └── reports/                 TEST_REPORT.md (latest run) and logs/ (full output per suite)
├── Tests_Requirements/          Requirement, system, regression and load test cases; JMeter plan; Playwright spec
├── docs/diagrams/               Design evidence: architecture, use-case/user flow, screen map, state diagrams (Mermaid)
├── public/                      Icons and static files
└── .env.example                 Environment template (placeholders only)
```

## 4. Prerequisites and installation

| Need     | Version                                                                                                                                             |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| OS       | Windows 10/11, macOS or Linux                                                                                                                       |
| Runtime  | [Bun](https://bun.sh/) 1.4+ (recommended) **or** Node.js 20+ with npm                                                                               |
| Accounts | A free [Supabase](https://supabase.com) project; an [NVIDIA NIM](https://build.nvidia.com/settings/api-keys) API key for the AI features (optional) |

```sh
git clone https://github.com/malaika-farooq/TeamUp_AdvSE-.git
cd TeamUp_AdvSE-
git checkout latest
bun install --frozen-lockfile        # or: npm install
```

### Dependencies

Everything below is declared in `package.json` and installed by the command above; you do not install these by hand. The only things you must set up yourself are the **system requirements** and **external services**.

**System requirements**

| Requirement      | Notes                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| Git              | To clone the repository                                                                                 |
| Bun 1.4+ **or** Node.js 20.19+ with npm | One of the two is required to install packages and run scripts (`bun test` is used for tests) |
| Internet access  | Needed for Supabase, the NVIDIA NIM API and the Google Fonts stylesheet                                 |
| Modern browser   | Current Chrome, Edge, Firefox or Safari                                                                 |

**External services** (see [Configuration](#5-configuration))

| Service                                         | Required?                                            |
| ----------------------------------------------- | ---------------------------------------------------- |
| Supabase project (database, auth, file storage) | Yes. Run the migrations in `drizzle/migrations/`     |
| NVIDIA NIM API key                              | Optional. Only the AI features need it               |
| Google OAuth client                             | Optional. Only for "Continue with Google"            |

**Main runtime packages**

| Area             | Packages                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| Framework        | `react`, `react-dom`, `@tanstack/react-start`, `@tanstack/react-router`, `@tanstack/react-query`      |
| Backend / data   | `@supabase/supabase-js`, `zod`                                                                        |
| AI               | `ai`, `@ai-sdk/react`, `streamdown`, `@streamdown/code`, `use-stick-to-bottom`                        |
| Styling / UI     | `tailwindcss`, `@tailwindcss/vite`, `tw-animate-css`, `@radix-ui/react-*`, `class-variance-authority`, `clsx`, `tailwind-merge`, `cmdk`, `vaul`, `sonner` |
| Icons / motion   | `lucide-react`, `motion`                                                                              |
| Forms / dates    | `react-hook-form`, `@hookform/resolvers`, `date-fns`, `react-day-picker`, `input-otp`                 |
| Boards / charts  | `@dnd-kit/core`, `@dnd-kit/sortable`, `recharts`, `embla-carousel-react`, `react-resizable-panels`    |
| Utilities        | `nanoid`                                                                                              |

**Development and test packages:** `vite`, `@vitejs/plugin-react`, `nitro`, `typescript`, `eslint` (with its plugins), `prettier`, `drizzle-kit`, `drizzle-orm`, `postgres`, `happy-dom`, `@happy-dom/global-registrator` and `@testing-library/*`.

**Extra package for the database tests only (not in `package.json`):** `@electric-sql/pglite` (`npm i -D @electric-sql/pglite`). Without it those tests are skipped. See [Automated tests](#9-automated-tests).

## 5. Configuration

Copy the template and fill in your own values. **Never commit `.env`, and never put a secret in a `VITE_*` variable (those reach the browser).**

```sh
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
```

| Variable                                                    | Used by          | Example value                                                                                          |
| ----------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------ |
| `VITE_SUPABASE_URL`, `SUPABASE_URL`                         | Browser / server | `https://your-project-ref.supabase.co`                                                                 |
| `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_PUBLISHABLE_KEY` | Browser / server | `sb_publishable_xxxxxxxx` (public key from Supabase → Project Settings → API)                          |
| `VITE_SUPABASE_PROJECT_ID`, `SUPABASE_PROJECT_ID`           | Browser / server | `your-project-ref`                                                                                     |
| `NVIDIA_API_KEY`                                            | Server only      | `nvapi-xxxxxxxx` (optional; without it AI features say "not configured" and the rest of the app works) |
| `NVIDIA_MODEL`                                              | Server only      | optional, default `nvidia/nemotron-3.5-lightning-30b-a3b`                                              |

If you leave the placeholder URL, sign-in fails with **"Failed to fetch"**. Restart the dev server after changing `.env`.

### Supabase settings

- **Authentication → Providers → Email:** turn "Confirm email" off while testing (the built-in mailer is rate-limited).
- **Authentication → Providers → Google (optional):** paste the Google OAuth Client ID **and Client Secret** and save, or "Continue with Google" returns `Unsupported provider: missing OAuth secret`. In Google Cloud add `https://<project-ref>.supabase.co/auth/v1/callback` as an authorized redirect URI.
- **Authentication → URL Configuration:** add `http://localhost:3000/**` and your deployed address (for example `https://your-app.vercel.app/**`) under Redirect URLs.

### Database setup

Run the SQL files in `drizzle/migrations/` **in order** in the Supabase SQL editor (do not re-run earlier ones after a "type already exists" message; that just means they were applied):

| File                                   | Adds                                                                                                                          |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `0000`-`0004`                          | Core schema and security policies, storage policies, AI chat threads, AI context helpers, teammate profile visibility         |
| `0005`, `0006`                         | Study partners, partner requests, study sessions, time-window matching                                                        |
| `0007_profile_completion.sql`          | Storage buckets (`avatars`, `team-files`), de-duplication, all-or-nothing save functions for courses, skills and availability |
| `0008_team_workflow.sql`               | Roles, invitations and join requests through checked functions                                                                |
| `0009_member_permissions.sql`          | Owner / admin / member permission rules for team content                                                                      |
| `0010_team_availability.sql`           | Teammates read each other's free time (nothing else); once-a-day reminder to people with none                                 |
| `0011_task_board.sql`                  | Three-column board, finish times kept by the database, assignees must be team members                                         |
| `0012_resources_and_notifications.sql` | Note edit versions, web-address-only links, deadline reminders, notifications can't be rewritten                              |
| `0013_lock_down_functions.sql`         | Signed-out visitors can run no elevated function except the invitation lookup                                                 |

Screens tell you which migration is missing if one is ("isn't set up in the database yet").

### Sample data

1. Run the app (below), **sign up** with your own email, and sign in once.
2. Open `supabase/seed.sql`, set `my_email` to that email, and run it in the SQL editor. It creates sample students (`@teamup.test`), courses, skills, availability, teams, tasks, sessions, partner requests and notifications around your account. Example sample login after seeding: `zara@teamup.test` / `Password123!`.
3. Or, inside the app, open **Settings → Account → Create sample workspace** for a quick team with tasks and notes.

## 6. Launch

```sh
bun run dev        # or: npm run dev     -> http://localhost:3000
bun run build      # production build
```

### Deployment

The site is deployed on **Vercel** (Nitro `vercel` preset). Set the same environment variables in Vercel → Settings → Environment Variables (all of `VITE_SUPABASE_*`, `SUPABASE_*` and `NVIDIA_API_KEY`) for the **same Supabase project** you configured, then redeploy (the `VITE_` values are baked in at build time).

## 7. Authentication (JWT)

TeamUp uses **JWT-based authentication** through Supabase Auth:

1. Signing in (email/password or Google) returns a signed **JWT access token** (plus a refresh token), kept by the Supabase client in the browser.
2. Every call to the database sends that token; PostgreSQL **Row Level Security** reads the user id from it (`auth.uid()`), so a student can only reach their own teams' data.
3. Every server call carries it as `Authorization: Bearer <token>`. Server functions (`src/integrations/supabase/auth-middleware.ts`) and the streaming AI endpoints (`src/lib/route-auth.ts`) reject a missing, non-Bearer, malformed, forged, expired or subject-less token before doing anything. Protected pages redirect signed-out visitors to the sign-in page.
4. Tests: `tests/auth/jwt-auth.test.ts` (token checks), `tests/auth/auth-flows.test.tsx` (sign-in flows), `Final_Testing/system/access-control.test.tsx` (route guard), `Final_Testing/database/security.test.ts` (row-level security).

The tokens are issued and signed by Supabase; the app does not mint its own.

## 8. Demonstrating the core features (including the AI feature)

Sign in (or use a seeded account), then:

1. **Profile (Settings):** add a photo, courses, skills and weekly availability; save. The photo appears in the top bar at once.
2. **Teams:** _My Teams → Create team_ (public), then invite a seeded student; as that student accept it, or _Discover → Request to join_ and approve it as owner.
3. **Task board (Tasks):** _New task_, assign it, set a due date; move it with the status menu or by dragging. The assignee gets a notification.
4. **Meeting times (team page → Meeting times):** _Mark my free time_, see the free-time map and the ranked best times, press _Schedule meeting_.
5. **Notes and links (Resources):** share a note and a link; teammates are notified. Try a `javascript:` link: it is refused.
6. **Notifications (bell → View all):** open one to jump to the page; deadline reminders appear for tasks due within 24 hours.
7. **Progress and Activity (team page):** see tasks by status, upcoming deadlines, per-member contributions, and filter the history.
8. **AI Teammate Matching (sidebar):** _Study partners_ → add a wanted skill (for example `SQL`), tick a time such as _Mon Evening_, tick _Only students who aren't overloaded_, press **Find study partners**. Each match shows why (shared courses, skills, free hours) and the student's workload level. _Send request_; as the other student accept it under _Study Partners_; then _Group sessions_ → pick the partner → **Suggest session times** → **Create & invite**.
9. **Additional AI features** (same page, needs a team): _Plan tasks_, _Break down a task_, _Progress summary_, _Study guide_, _Practice quiz_, _Teammate ideas_, and the chat box. Everything the AI writes is a draft; nothing is saved until you choose to.

## 9. Automated tests

```sh
bun test                 # everything, quickly (about 3 minutes)
bun run test:final       # every suite, and writes Final_Testing/reports/TEST_REPORT.md
npx tsc --noEmit         # type check
bun run lint             # lint
```

| Where                       | What                                                                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/`                    | Unit and screen tests per area: settings, auth (including JWT checks), AI, meeting times, task board, resources, notifications, progress |
| `Final_Testing/system/`     | Whole workflows with two students: assign -> notify -> finish -> dashboard; AI matching to a booked session; access control              |
| `Final_Testing/regression/` | One test per bug found during testing; Markdown can't run code                                                                           |
| `Final_Testing/database/`   | Row-level security and workflow tests on every migration                                                                                 |
| `Final_Testing/load/`       | Speed with thousands of records                                                                                                          |
| `Tests_Requirements/`       | Requirement/system/regression/load test cases, JMeter plan, Playwright spec                                                              |

- **Test cases:** `tests/test_cases/`, `Tests_Requirements/`, and the mapping in `Final_Testing/TRACEABILITY.md`.
- **Results and logs:** `Final_Testing/reports/TEST_REPORT.md` (latest run) and `Final_Testing/reports/logs/` (full output of each suite); earlier results are in `tests/test_results/`.
- **Database tests** apply every migration to an in-memory Postgres (PGlite). They need the dev tool: `npm i -D @electric-sql/pglite` (or set `PGLITE_PATH`). Without it they are **skipped, not passed**, and the report shows the skip.

### Test limitations

- The automated tests use a faithful stand-in for Supabase and a replacement for the AI, so they never call the live NVIDIA service or your live Supabase project. The real AI answer quality must be judged by hand (section 8).
- A real browser is not used by `bun test`. The Playwright spec and JMeter plan in `Tests_Requirements/` need their own tools (Playwright, JMeter) and a signed-in session (`save-login.cjs` saves one).
- Dragging task cards can't be simulated in the test browser; the status menu uses the same code and is tested.

## 10. Known limitations, external services and troubleshooting

### Known limitations

- AI features need an NVIDIA API key and depend on that service being reachable; answers vary and may be wrong, which is why they are always drafts.
- Free time is stored as a weekly pattern, not for specific dates, so a one-off conflict (an exam week) isn't modelled.
- Deadline reminders are created when the app is opened and every 10 minutes while it is open, not by a background job; nobody is reminded while the app is closed.
- No email or push notifications; notifications are in-app only.
- Recurring sessions don't get "starting soon" reminders.

### External services and access

- **Supabase** (database, auth, storage): required; the SQL migrations need access to the project's SQL editor.
- **NVIDIA NIM** (AI): optional; without a key everything except the AI features works.
- **Google OAuth** (optional sign-in) and **Vercel** (deployment).

### Troubleshooting

- **"Failed to fetch" when signing in:** `.env` still has the placeholder URL, the Supabase project is paused, or a blocker is stopping `*.supabase.co`. Fix `.env` and restart.
- **Google says `Unsupported provider: missing OAuth secret`:** the Google provider in Supabase has no Client Secret, or the deployed site points at a different Supabase project than the one you configured.
- **A screen says something "isn't set up":** run the migration it names (section 5).
- **Missing Supabase environment variables:** `.env` must sit next to `package.json`; restart the dev server.
- **A team's data is missing:** sign in as a member; row-level security hides private data from everyone else.
- **Route "not found" after adding a file:** restart the dev server so the route tree regenerates.
- **Vercel build fails:** make sure `.vercel/` is not committed (it is in `.gitignore`) and that all environment variables are set.

## Appendix: how teams, invitations and requests work

| What                                                    | Owner |                   Admin                    |          Member          |
| ------------------------------------------------------- | :---: | :----------------------------------------: | :----------------------: |
| See tasks, sessions, files and activity                 |  Yes  |                    Yes                     |           Yes            |
| Create tasks, sessions and notes, upload files, comment |  Yes  |                    Yes                     |           Yes            |
| Edit a task                                             |  Any  |                    Any                     | Own, or assigned to them |
| Delete a task                                           |  Any  |                    Any                     |           Own            |
| Edit or delete a session, note or file                  |  Any  |                    Any                     |           Own            |
| Delete a comment                                        |  Any  |                    Any                     |           Own            |
| Invite people, answer join requests, remove members     |  Yes  | Yes (admins can only remove plain members) |            No            |
| Edit team details                                       |  Yes  |                    Yes                     |            No            |
| Change admin roles, transfer ownership                  |  Yes  |                     No                     |            No            |
| Make the team public or private, delete the team        |  Yes  |                     No                     |            No            |

- **Join requests:** students ask to join a _public_ team from Discover with an optional message. Owners and admins are notified and approve or decline; the student can cancel, and can ask again 7 days after a decline.
- **Invitations:** owners and admins invite a discoverable student by name, or share a link that works once and expires after 7 days; only the owner can create admin invitations.
- **Ownership:** a team always has exactly one owner. Transfer ownership to leave; if you are the only member, leaving deletes the team.
- These rules are enforced in the database (`0008` and `0009`), not just hidden in the screens.

## Appendix: architecture rules

- **AI calls** go through `src/lib/ai-gateway.ts` and run only on the server, so the key never reaches the browser.
- **AI context** is built with the caller's own Supabase client after a membership check, so row-level security stays in force. Records are wrapped as untrusted data.
- **Streaming endpoints** (`/api/ai/chat`, `/api/ai/write`) verify the bearer token themselves via `src/lib/route-auth.ts`.
- **Private data** (availability and similar) reaches the AI only as computed aggregates, never as raw rows.
- **Ranking is deterministic:** teammate and study-partner suggestions are ranked in code; the model only writes the reasons.
- **Tests** for rules live as pure modules in `src/lib/` with `bun:test` files in `tests/`.
- Keep the standard TanStack Start layout (no `frontend/` / `backend/` split). `src/routeTree.gen.ts` is generated; never edit it by hand.
