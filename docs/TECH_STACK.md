# TeamUp — Tech Stack

## Frontend

- React 19 (written in TypeScript / TSX)
- Tailwind CSS v4 (styling, light + dark themes)
- shadcn/ui + Radix UI (buttons, dialogs, menus, tabs…)
- TanStack Router / TanStack Start (pages and routing)
- TanStack Query (data loading and caching)
- Motion (animations), dnd-kit (drag-and-drop task board)
- Recharts (progress charts), lucide-react (icons), sonner (toasts)

## Backend

- TanStack Start server functions (TypeScript)
- Supabase: PostgreSQL database, Auth (JWT, email + Google), Storage, Realtime
- Row-Level Security policies in SQL (drizzle/migrations)
- AI gateway (Google Gemini) for task plans, summaries, teammate ideas

## Tooling

- Vite 7 (build), Bun / npm (packages), Drizzle Kit (migrations), ESLint + Prettier

## Folder guide

- src/routes/ — every page (landing, auth, dashboard, teams, tasks, calendar, resources, AI assistant, settings)
- src/frontend/features/ - feature UI, browser API clients, and constants
- src/backend/api/ - server endpoints
- src/backend/ai/ - AI server functions and gateway calls
- src/frontend/components/ui/ — reusable UI library (shadcn)
- src/lib/ ? shared utilities, animation, database result handling, and error reporting
- src/frontend/providers/ ? application theme provider
- src/types/ ? shared database-derived domain types
- src/frontend/components/layout/ ? application shell and navigation
- src/frontend/components/shared/ ? loading, empty, and error states
- src/integrations/ — backend client setup
- drizzle/migrations/ — database tables, security rules, storage
- public/ — static files

## Run locally

npm install, copy .env.example to .env and fill in values, then npm run dev
