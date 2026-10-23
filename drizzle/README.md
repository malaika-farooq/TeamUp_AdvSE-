# PostgreSQL database

The application connects to a Supabase backend, which provides PostgreSQL,
authentication, and storage. A separate `postgres/` source folder is not needed.

| File or directory                           | Purpose                                                         |
| ------------------------------------------- | --------------------------------------------------------------- |
| `migrations/0000_studysync_core_schema.sql` | Database schema, tables, and access policies                    |
| `migrations/0001_storage_policies.sql`      | Storage access policies                                         |
| `migrations/meta/`                          | Drizzle migration journal and schema snapshots                  |
| `schema.ts`                                 | Generated placeholder; currently contains no table definitions  |
| `../drizzle.config.ts`                      | PostgreSQL migration connection and output configuration        |
| `../supabase/config.toml`                   | Supabase project configuration                                  |
| `../src/integrations/supabase/`             | Backend clients, authentication middleware, and generated types |
| `../src/frontend/features/*/api/`           | Feature-specific queries to the backend                         |

The SQL migrations describe the database in this source download. Do not use
the empty `schema.ts` as a complete model or generate replacement migrations
from it without first reconciling it with the existing SQL schema.

Browser connection settings are documented in the root `.env.example`.
Drizzle reads `DATABASE_MIGRATION_URL` from the process environment for its
database connection, falling back to the existing provider-managed variable. Never expose that privileged URL in a `VITE_` variable.

This reorganization does not provision or migrate a database. Keep migration
filenames, order, and metadata intact so existing deployments retain their
migration history.

## Set up a new development backend

1. Create a dedicated Supabase development project and obtain its project URL
   and publishable key from the project settings.
2. In the SQL editor for that fresh project, execute
   `migrations/0000_studysync_core_schema.sql` first.
3. Execute `migrations/0001_storage_policies.sql` next. This configures the
   private storage buckets and their access policies.
4. Copy the matching connection values into the root `.env` file using
   `.env.example` as the template. Configure authentication redirect URLs for
   `http://127.0.0.1:3000` and its password recovery route. Enable the Google
   provider separately if you want Google sign-in.
5. Start the app using the commands in the root README, create a test account,
   and create a team to verify the connection.

These SQL files create schema objects and are not intended to be replayed
blindly against an existing database. For an existing project, inspect its
current schema and migration history before applying changes. Manual SQL setup
does not populate Drizzle's database-side migration journal; reconcile that
history before later using the migration CLI against the same database.
