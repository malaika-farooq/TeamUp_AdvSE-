# Backend

- api/settings/sample.functions.ts: authenticated endpoints for creating and
  removing the sample workspace.
- ai/ai.functions.ts: authenticated AI endpoints for task planning, team
  summaries, and teammate suggestions, including gateway calls.

Define endpoints with TanStack Start's createServerFn. Keep privileged work
inside server handlers and use authentication middleware from
@/integrations/supabase/auth-middleware as appropriate.

Frontend modules can import server functions through TanStack Start's server
function mechanism. Keep privileged database clients out of frontend modules.
PostgreSQL schema and security policies live in root drizzle/.
