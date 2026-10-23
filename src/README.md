# Source organization

```text
src/
  routes/                 TanStack route declarations and screens
  frontend/
    components/           Layout, shared states, and UI primitives
    features/             Feature UI, browser API clients, and constants
    hooks/                Shared React hooks
    providers/            Theme provider
  backend/
    api/settings/         Sample workspace server endpoints
    ai/                   AI endpoints and gateway calls
  integrations/           Supabase and authentication connections and middleware
  types/                  Shared database-derived domain types
  lib/                    Shared utilities, animation, and error handling
```

Put UI code in frontend/, server endpoints in backend/api/, and AI server
logic in backend/ai/. Import modules directly using the @/ alias.

Frontend features/<feature>/api/ modules call Supabase from the browser;
they are API clients. Backend *.functions.ts modules use TanStack Start
server functions, whose handlers execute on the server. Authorization remains
enforced by server middleware and PostgreSQL row-level security.

TanStack Start serves the frontend and backend as one application. Routing
files stay in routes/ so TanStack can discover them by filename. Keep router.tsx,
start.ts, and server.ts as framework entry points. Never edit routeTree.gen.ts
by hand.

PostgreSQL migrations stay in root drizzle/; Supabase configuration stays in
supabase/. Shared domain types in types/domain.ts derive from generated
Supabase types. See the [database guide](../drizzle/README.md) for the schema
and the empty generated schema.ts placeholder. No separate models directory
is needed for the current SQL-based database definitions.
