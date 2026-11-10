# TeamUp — Project Structure and Team Responsibilities

This document maps the **current TeamUp project** to a four-person ownership model for the report, presentation, future maintenance, and further development. It is a proposed responsibility split, not a claim about who historically wrote the existing code.

The repository keeps the runnable TanStack Start layout. Files should not be moved into separate `frontend/` and `backend/` folders because TanStack Start intentionally combines React routes and server functions in one application.

## 1. Ownership at a glance

| Person | Primary ownership | Supporting ownership |
|---|---|---|
| **Malaika** | Frontend and AI integration | UI/UX, architecture documentation, integration coordination, presentation/demo, GitHub and release coordination |
| **Aditi** | Backend and server logic | Authentication flow, authorization checks, server-side business rules, API/server-function integration |
| **Krishan** | Testing and quality assurance | Test planning, regression testing, accessibility checks, permission/security testing, release verification |
| **Amogh** | Database and DBMS | Schema, migrations, constraints, indexes, RLS policies, storage policies, database functions, data integrity and query performance |

This is balanced by **responsibility**, not by counting files. Malaika has the broadest visible scope, so Aditi owns all non-AI server behavior, Krishan owns the complete quality process, and Amogh owns all data and database-security behavior.

## 2. Best logical project structure

```text
TeamUp/
├── src/
│   ├── routes/                    # Pages, protected routes and HTTP endpoints
│   │   ├── _authenticated/        # Dashboard, teams, tasks, calendar, resources, AI, settings
│   │   ├── api/                   # AI streaming HTTP endpoints
│   │   ├── __root.tsx             # Shared document and application root
│   │   ├── index.tsx              # Public landing page
│   │   ├── auth.tsx               # Sign-in and sign-up
│   │   ├── invite.$token.tsx      # Invitation acceptance
│   │   └── reset-password.tsx     # Password recovery
│   ├── components/
│   │   ├── app/                   # Product UI: shell, tasks, sessions, resources, AI
│   │   ├── ai-elements/           # Chat and Markdown presentation primitives
│   │   └── ui/                    # Reusable accessible UI primitives
│   ├── lib/
│   │   ├── ai-*.ts                # AI client, context, gateway and server functions
│   │   ├── auth.tsx               # Client authentication state
│   │   ├── route-auth.ts          # Bearer-token verification for HTTP endpoints
│   │   ├── queries.ts             # Shared data operations and activity logging
│   │   ├── sample.functions.ts    # Sample-workspace server operations
│   │   └── *.ts / *.tsx           # Theme, Markdown, ranking, utilities and errors
│   ├── integrations/
│   │   └── supabase/              # Generated backend clients, auth middleware and types
│   ├── hooks/                     # Shared React hooks
│   ├── assets/                    # Application images
│   ├── generated/                 # Generated AI model types
│   ├── router.tsx                 # Router setup
│   ├── start.ts                   # Server-function middleware setup
│   ├── server.ts                  # Server entry and catastrophic-error handling
│   └── styles.css                 # Tailwind theme and global design tokens
├── drizzle/
│   ├── schema.ts                  # Database schema definition
│   └── migrations/                # SQL schema, RLS, storage and AI migrations
├── supabase/
│   └── config.toml                # Managed backend configuration
├── tests/                         # Business-rule regression tests
├── public/                        # Public static files
├── docs/                          # Project documentation
├── package.json                   # Dependencies and commands
├── vite.config.ts                 # Application build configuration
├── tsconfig.json                  # TypeScript configuration
├── drizzle.config.ts              # Database migration configuration
├── eslint.config.js               # Lint rules
└── README.md                      # Setup and repository guide
```

Generated files such as `src/routeTree.gen.ts`, backend generated types, `node_modules/`, and build output should not be manually reorganized.

## 3. Detailed section ownership

### Malaika — Frontend and AI integration

**Frontend**

- Public landing, authentication screens, onboarding and protected application pages.
- Dashboard, team workspace, task board, calendar, resources, discovery, settings and profile UI.
- Desktop navigation, mobile navigation, responsive layouts and light/dark themes.
- Loading, empty, error and success states; dialogs, notifications and confirmations.
- Animation, reduced-motion behavior, keyboard interaction and visible focus states.
- Reusable components in `src/components/` and global styling in `src/styles.css`.

**AI integration**

- AI Assistant pages, saved-thread interface, floating helper and chat UI.
- Task-plan, task-breakdown, progress-summary, study-guide, quiz, agenda, check-in and teammate-idea tools.
- Streaming client in `src/lib/ai-client.ts`.
- AI server integration in `src/lib/ai-gateway.ts`, `src/lib/ai-context.ts`, and `src/lib/ai.functions.ts`.
- AI HTTP endpoints in `src/routes/api/ai.chat.ts` and `src/routes/api/ai.write.ts`.
- Markdown cleanup and deterministic teammate-ranking rules.

**Additional items assigned to Malaika as requested**

- Overall UI/UX consistency and final integration between the four areas.
- Architecture and project-structure documentation.
- Presentation, demonstration flow and submission coordination.
- GitHub synchronization and publish/release coordination.

### Aditi — Backend and server logic

- Server startup, request handling and server-function middleware.
- Authenticated server operations and protected-route behavior.
- Bearer-token verification for server HTTP endpoints.
- Team creation, membership, invitations, join requests and role-change business rules.
- Task, checklist, comment, session, RSVP, resource and notification business operations.
- Activity logging with the authenticated user as the actor.
- Sample-workspace creation and removal operations.
- Server-side validation, authorization failures and safe error responses.
- Coordination with Amogh on database functions and with Malaika on AI endpoint integration.

Main locations: `src/server.ts`, `src/start.ts`, `src/lib/route-auth.ts`, `src/lib/queries.ts`, `src/lib/sample.functions.ts`, non-AI server operations, and generated auth middleware integration.

### Krishan — Testing and quality assurance

- Maintain and expand automated business-rule tests in `tests/`.
- Unit tests for ranking, Markdown, validation, permissions and date/recurrence behavior.
- Integration tests for authentication, invitations, join requests, task permissions, notifications and resource access.
- End-to-end checks for sign-up/sign-in, onboarding, team creation, task assignment/editing, calendar editing, file access and AI chat persistence.
- Verify role boundaries: visitor, member, admin and owner.
- Verify that removing a member revokes team data and file access.
- Test failed saves, rollback behavior, empty states, API failures and duplicate submissions.
- Test mobile layouts, keyboard-only operation, reduced motion and visible focus.
- Maintain a release checklist and retest fixes after changes.

**Current state:** baseline business-rule tests exist in `tests/teammates-and-markdown.test.ts`; broader automated coverage remains a testing responsibility rather than something to claim as complete.

### Amogh — Database and DBMS

- Database schema and migrations for profiles, teams, memberships, tasks, sessions, resources, notifications, activity and AI threads/messages.
- Primary keys, foreign keys, unique constraints, checks, indexes and cascade behavior.
- Row Level Security policies for every application table.
- Role-aware database functions for invitations, join requests, membership checks and aggregated availability.
- Private file and avatar storage policies.
- Prevention of duplicate memberships, duplicate invitation redemption and unauthorized access.
- Data integrity, migration review, query performance and database backup/recovery planning.
- ER diagram and database-section documentation.

Main locations: `drizzle/schema.ts`, `drizzle/migrations/`, `drizzle.config.ts`, `supabase/config.toml`, and generated database types.

## 4. Feature-by-feature responsibility matrix

| Project section | Lead | Must coordinate with | Current implementation state |
|---|---|---|---|
| Landing, sign-in UI and onboarding UI | Malaika | Aditi, Krishan | Implemented |
| Responsive application shell and themes | Malaika | Krishan | Implemented |
| Dashboard, teams, tasks, calendar and resources UI | Malaika | Aditi, Amogh | Implemented |
| AI Assistant UI and all AI tools | Malaika | Aditi, Amogh, Krishan | Implemented |
| Authentication/session enforcement | Aditi | Malaika, Amogh | Implemented |
| Team, invitation and join-request operations | Aditi | Amogh, Krishan | Implemented |
| Task/session/resource server operations | Aditi | Amogh, Malaika | Implemented |
| Notifications and activity operations | Aditi | Amogh, Malaika | Implemented |
| Schema, migrations and constraints | Amogh | Aditi | Implemented |
| RLS and private-storage policies | Amogh | Aditi, Krishan | Implemented |
| Realtime-enabled records | Amogh | Aditi, Malaika | Implemented for tasks, notifications and activity |
| Automated regression suite | Krishan | All | Baseline present; expand coverage |
| Full cross-browser and accessibility audit | Krishan | Malaika | Ongoing responsibility |
| Architecture, presentation and release coordination | Malaika | All | Documentation and coordination responsibility |

## 5. Missing areas now explicitly covered

The original four-role idea did not mention these areas. They are assigned as follows:

- **UI/UX and design system:** Malaika.
- **Authentication and authorization logic:** Aditi, with Amogh owning RLS and Krishan verifying permission boundaries.
- **Security and privacy verification:** Krishan owns the test plan; Aditi and Amogh fix issues in their respective layers.
- **DevOps, GitHub and publishing:** Malaika.
- **Documentation, diagrams, presentation and demo:** Malaika coordinates; each person documents their own section.
- **Final integration and release approval:** Malaika coordinates, Krishan verifies the release checklist.

## 6. Recommended report wording

> TeamUp follows a layered full-stack architecture. Malaika is responsible for the React frontend, user experience, AI integration, and overall coordination. Aditi is responsible for TypeScript server logic, authentication flow, authorization checks, and business operations. Amogh is responsible for the PostgreSQL schema, migrations, constraints, indexes, Row Level Security, storage policies, and data integrity. Krishan is responsible for automated and manual testing, regression checks, accessibility, security-permission testing, and release verification. Shared integration issues are resolved by the relevant owners together.

## 7. Practical collaboration rule

Every feature change should identify its owners before work begins:

1. **Malaika** updates the visible experience and any AI interaction.
2. **Aditi** updates server behavior and authorization checks.
3. **Amogh** updates schema, migrations, RLS or storage rules when data changes.
4. **Krishan** adds or updates regression checks and verifies the finished flow.

A feature is ready to present only when the relevant owners have reviewed it and Krishan has verified the main success, failure and permission-denied paths.
