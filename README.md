# TeamUp

TeamUp is a collaborative study and team-planning web app. Students create or join teams, plan and assign tasks, schedule meetings, share resources, find study partners, and use an AI assistant that works from their own team's data.

## Features

- **Profiles:** profile photo, enrolled courses, skills with a 1–5 level, and weekly availability (quick Morning/Afternoon/Evening blocks or exact times), editable any time in Settings, with a completeness meter.
- **Accounts:** email/password and Google sign-in, plus a three-step onboarding.
- **Teams:** public or private teams with owner / admin / member roles, plus a full invitation and request workflow (see below).
- **Tasks and calendar:** priorities, due dates, assignees, checklists, comments, study sessions with RSVP.
- **Resources:** notes, links and files per team (private storage).
- **Study partners:** requests, accepted partners, and group study sessions with accept/decline.
- **AI Assistant:** task plans and breakdowns, progress summaries, weekly check-ins, meeting agendas, study guides, quizzes, teammate ideas, study-partner matching, study-session planning, and saved chat threads.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, TanStack Start / Router / Query, Tailwind CSS, shadcn/ui, Motion, dnd-kit, Recharts |
| Server | TanStack Start server functions and server routes, built with Nitro |
| Data and auth | Supabase: PostgreSQL, Auth (JWT), Row Level Security, Storage, realtime |
| AI | NVIDIA NIM (OpenAI-compatible API), called only from the server |

## Run locally

Requirements: [Bun](https://bun.sh/) or Node.js 20+ with npm.

1. Install dependencies:

   ```sh
   bun install --frozen-lockfile    # or: npm install
   ```

2. Create your environment file and fill it in (see [Environment variables](#environment-variables)):

   ```sh
   cp .env.example .env
   ```

   **Important:** `.env` is not stored in git, and `.env.example` only contains placeholders
   (`https://your-project-ref.supabase.co`). You must replace the Supabase URL and publishable key with the
   real ones for the project you want to use (ask the project owner, or copy them from Supabase → Project
   Settings → API). If you leave the placeholders, sign-in fails with **"Failed to fetch"**. Restart
   `bun run dev` after changing `.env`.

3. Set up the database (see [Database setup](#database-setup)).
4. Start the dev server and open <http://localhost:3000>:

   ```sh
   bun run dev    # or: npm run dev
   ```

### Environment variables

| Variable | Where it is used | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` | Browser | Public values only |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_PROJECT_ID` | Server | Same project as above |
| `NVIDIA_API_KEY` | Server only | Create one at <https://build.nvidia.com/settings/api-keys>. Without it the AI Assistant shows "not configured"; the rest of the app works |
| `NVIDIA_MODEL` | Server only | Optional. Default `nvidia/nemotron-3.5-lightning-30b-a3b` |

Never put a private key, service-role key or database password in a `VITE_*` variable (those reach the browser), and never commit `.env`.

### Database setup

Migrations are plain SQL files in `drizzle/migrations/`. Run them **in order** in the Supabase SQL editor:

| File | Adds |
| --- | --- |
| `0000_studysync_core_schema.sql` | Core tables, RLS, signup trigger (`handle_new_user`) |
| `0001_storage_policies.sql` | Private file and avatar storage policies |
| `0002_ai_chat_threads.sql` | `ai_threads`, `ai_messages` |
| `0003_ai_team_context_functions.sql` | Aggregate-only helper functions for AI context |
| `0004_teammates_can_read_profiles.sql` | Teammate profile visibility |
| `0005_study_partners.sql` | Partner requests, study sessions, matching RPCs |
| `0006_partner_time_preferences.sql` | Time-window preference matching |
| `0007_profile_completion.sql` | Storage buckets (`avatars`, `team-files`), de-duplicates skills/courses, all-or-nothing save functions for courses, skills and availability, partner photos |
| `0008_team_workflow.sql` | Team roles and the invitation / join-request workflow. All membership, role, invitation and request changes now go through checked functions (before, any student could write those tables directly). Run after 0007 |
| `0009_member_permissions.sql` | Role-based permissions for team content: members can only change their own tasks/sessions/notes/files, admins manage everything except visibility and deletion, authorship can't be rewritten. Run after 0008 |

If study-partner features say matching "isn't set up in the database yet", migrations 0005 and 0006 have not been run.

If saving courses, skills, availability or a profile photo says "isn't set up", migration 0007 has not been run. If team invitations, join requests or role changes say "isn't set up", migration 0008 has not been run. Migration 0009 has no screen message: if members can still edit or delete each other's items, run it.

**Test data (optional):** open `supabase/seed.sql`, set `my_email` to the email of an account you have already signed up with, then run it in the SQL editor. It creates sample students (`@teamup.test`), courses, skills, availability, teams, tasks, sessions, partner requests and notifications around your account. Cleanup deletes the `@teamup.test` users and the seeded teams.

### Supabase auth settings

- **Email confirmation:** if "Confirm email" is on (Authentication → Providers → Email), new users must click the emailed link before signing in, and the built-in mailer is rate-limited. Turn it off while testing.
- **Google sign-in:** add `http://localhost:3000` to Authentication → URL Configuration → Redirect URLs.

## How teams, invitations and requests work

| What | Owner | Admin | Member |
| --- | :---: | :---: | :---: |
| See tasks, sessions, files and activity | Yes | Yes | Yes |
| Create tasks, sessions and notes, upload files, comment | Yes | Yes | Yes |
| Edit a task | Any | Any | Own, or assigned to them |
| Delete a task | Any | Any | Own |
| Edit or delete a session, note or file | Any | Any | Own |
| Delete a comment | Any | Any | Own |
| Invite people, answer join requests, remove members | Yes | Yes (admins can only remove plain members) | No |
| Edit team details | Yes | Yes | No |
| Change admin roles, transfer ownership | Yes | No | No |
| Make the team public or private, delete the team | Yes | No | No |

The Members tab shows this table with your own role highlighted, and the screens hide or disable anything your role can't do.

- **Join requests:** students ask to join a *public* team from Discover with an optional message. Owners and admins are notified, see who is asking (name, photo, courses, skills) and approve or decline; the student is notified. The student can cancel a pending request, and can ask again 7 days after a decline.
- **Invitations:** owners and admins invite a discoverable student by name (from the team's Members tab, Discover, or the AI "Teammate ideas" tool). The student sees it in **My Teams** and in notifications and can accept or decline. A shareable invitation link works once and expires after 7 days; only the owner can create admin invitations.
- **Ownership:** a team always has exactly one owner. Transfer ownership to leave; if you are the only member, leaving deletes the team.
- These rules are enforced in the database (`0008_team_workflow.sql`), not just hidden in the screens.

## Commands

```sh
bun run dev       # Start the development server (port 3000)
bun run build     # Production build
bun run lint      # ESLint
bun run format    # Prettier (writes files)
bun test          # Business-rule tests in tests/ (requires Bun)
```

## Project layout

```text
TeamUp/
├── src/
│   ├── routes/            File-based routes: pages, protected screens, /api/ai/* endpoints
│   ├── components/        Product UI (app/), AI chat primitives (ai-elements/), UI primitives (ui/)
│   ├── lib/               Server functions, AI gateway/context, ranking rules, auth, utilities
│   ├── integrations/      Supabase clients, auth middleware and generated types
│   ├── hooks/, assets/    Shared hooks and images
│   ├── router.tsx         Router setup
│   ├── start.ts           Server-function middleware
│   ├── server.ts          Server entry with SSR error handling
│   └── styles.css         Tailwind theme and design tokens
├── drizzle/migrations/    SQL schema, RLS, storage and RPC migrations
├── supabase/              Supabase config and seed.sql
├── tests/                 Business-rule tests, test cases and results
├── docs/                  Report diagrams
└── .env.example           Environment template
```

The project keeps the standard TanStack Start full-stack layout. Do not split it into `frontend/` and `backend/` folders; that would break route discovery and imports.

### Routing

Routing is file-based: every `.tsx` file under `src/routes/` is a route (`index.tsx` → `/`, `teams.$teamId.tsx` → `/teams/:teamId`, `_authenticated/` → pages behind sign-in, `api/` → HTTP endpoints). `__root.tsx` is the only root layout. `src/routeTree.gen.ts` is generated by Vite; never edit it by hand.

## Architecture rules

These rules keep the app secure and predictable. Please keep to them when changing code.

- **AI calls:** model calls go through the NVIDIA NIM helpers in `src/lib/ai-gateway.ts` (plain `fetch`, key in `NVIDIA_API_KEY`). They are called only from server functions or `/api/ai/*` server routes, so the key never reaches the browser.
- **AI context:** `src/lib/ai-context.ts` builds context with the caller's own Supabase client after a membership check, so Row Level Security stays in force. Records are wrapped as untrusted `<records>` data.
- **Streaming endpoints:** `/api/ai/chat` and `/api/ai/write` verify the bearer token in the handler via `src/lib/route-auth.ts`, because server routes are not covered by server-function auth middleware.
- **Chat threads:** stored in `ai_threads` and `ai_messages`, one route per thread (`/assistant/chat/$threadId`). The server reloads history from the database and dedupes user messages by `client_id` instead of trusting client-sent history.
- **Private data:** availability and similar data reach the AI only as computed aggregates through security-definer RPCs (overlap minutes, workload counts, shared free windows), never as raw rows.
- **Deterministic ranking:** teammate and study-partner suggestions are ranked in code first. Only positive facts are sent to the model under short keys, and the model writes the reasons only.
- **Tests:** rules that must not regress live as pure modules in `src/lib/` with `bun:test` files in the root `tests/` folder, which is kept outside the app's tsconfig so test types don't leak into the build.

## Team responsibilities

| Person | Primary ownership |
| --- | --- |
| Malaika | Frontend, UI/UX, AI integration, architecture documentation, release coordination |
| Aditi | Backend and server logic, authentication flow, authorization checks, business rules |
| Krishan | Testing and quality assurance, accessibility, permission and security testing |
| Amogh | Database schema, migrations, constraints, RLS and storage policies, data integrity |

## Troubleshooting

- **Missing Supabase environment variables:** confirm `.env` sits next to `package.json`, then restart the dev server.
- **"Failed to fetch" when signing in:** the browser can't reach Supabase. Check `VITE_SUPABASE_URL` and `SUPABASE_URL` in `.env` are the real project URL (not `your-project-ref`), that the project isn't paused in the Supabase dashboard, and that your network or an ad blocker isn't blocking `*.supabase.co`.
- **Sign-up or sign-in fails:** check email confirmation and redirect settings above, and that migration 0000 has been run.
- **A team's data is missing:** sign in as a member of that team; Row Level Security hides private records from everyone else.
- **Route "not found" after adding a file:** restart the dev server so the route tree regenerates.
- **Dependency or native-package errors:** delete `node_modules` and reinstall.
