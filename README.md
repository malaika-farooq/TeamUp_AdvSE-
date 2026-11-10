# TeamUp

TeamUp is a collaborative study and team-planning application built with React 19, TypeScript, TanStack Start, Tailwind CSS and Lovable Cloud. It includes team workspaces, tasks, study sessions, resources, notifications, progress tracking and an AI study assistant.

## Run locally

```sh
bun install --frozen-lockfile
cp .env.example .env   # skip this if .env already exists
bun run dev
```

Open the localhost address printed in the terminal.

The public `.env` settings connect localhost to the existing Cloud backend, so saved teams, tasks and other records remain available. Use email/password sign-in for the local demo.

**AI limitation:** Lovable's managed AI credential is not exportable. Use the preview or published site for AI features; see [the complete localhost guide](docs/LOCALHOST_SETUP.md) before presenting.

## Start here

- [Localhost setup, demo account and data-safety guide](docs/LOCALHOST_SETUP.md)
- [Project structure and four-person responsibilities](docs/PROJECT_STRUCTURE_AND_TEAM.md)
- [Architecture rules](AGENTS.md)
- [Route guide](src/routes/README.md)
- [Current roadmap](roadmap.md)

## Organized project map

```text
TeamUp/
├── src/
│   ├── routes/          Pages, protected screens and HTTP endpoints
│   ├── components/      Product UI, AI interface and reusable UI primitives
│   ├── lib/             Client/server logic, AI integration and business rules
│   ├── integrations/    Generated Cloud clients and authentication integration
│   ├── hooks/           Shared React hooks
│   ├── assets/          Application images
│   ├── generated/       Generated AI model types
│   ├── router.tsx       Router setup
│   ├── start.ts         Server-function middleware
│   ├── server.ts        Server entry
│   └── styles.css       Tailwind theme and global design tokens
├── drizzle/
│   ├── migrations/      SQL schema, RLS, storage and AI migrations
│   └── schema.ts        Database schema definition
├── tests/               Automated business-rule tests
├── public/              Public static files
├── docs/                Setup, structure and team documentation
├── supabase/            Managed backend configuration
├── .env.example         Public connection-settings template
├── package.json         Dependencies and commands
└── README.md            This guide
```

The project intentionally uses the standard TanStack Start full-stack layout. Separating it into arbitrary `frontend/` and `backend/` folders would break route discovery and imports. Backend ownership and file locations are mapped clearly in the team guide instead.

## Useful commands

```sh
bun run dev       # Start the development server
bun run build     # Build the application
bun run lint      # Run lint checks
bun test          # Run business-rule tests
bun run format    # Format source files
```

## Main technologies

- **Frontend:** React 19, TypeScript, TanStack Start/Router/Query, Tailwind CSS, Motion, dnd-kit and Recharts.
- **Backend:** TypeScript server functions and TanStack server routes.
- **Data and auth:** Lovable Cloud with PostgreSQL, JWT authentication, Row Level Security, private storage and realtime.
- **AI:** Lovable AI Gateway through server-side helpers using `google/gemini-3.8-flash`.

Never commit private keys, service-role credentials, downloaded dependencies, generated build output or real user data.
