# Run TeamUp on localhost

This guide runs the real TeamUp application locally while keeping its existing Lovable Cloud database, authentication and saved records.

## 1. What you need

- A computer with [Bun](https://bun.sh/) installed.
- The clean `TeamUp_Localhost_Project.zip` source archive.
- An internet connection, because the local app connects to Lovable Cloud.

You do **not** need to create a second database or a separate backend account for this demo. The project already has a persistent Cloud backend.

## 2. Start the app

1. Extract the ZIP. Open the extracted `TeamUp` folder in a terminal.
2. Install the exact locked dependencies:

   ```sh
   bun install --frozen-lockfile
   ```

3. The archive includes a `.env` containing only the project's public Cloud connection settings. If you copied the source without that file, create it from the template:

   ```sh
   cp .env.example .env
   ```

4. Start the development server:

   ```sh
   bun run dev
   ```

5. Open the localhost address printed in the terminal.

Do not run `bun run build` merely to start the local demo.

## 3. Sign in and demonstrate saved data

Use an existing TeamUp account, or this sample student account:

- **Email:** `maya.chen@studysync-demo.dev`
- **Password:** `StudySyncDemo1!`

The tasks, teams, resources, chat threads and other records are loaded from the existing Cloud backend. They are not temporary browser fixtures.

**Important:** localhost and the published app use the same backend. Creating, editing or deleting a record locally changes the shared saved data. Use the sample workspace for demonstrations.

For a localhost presentation, email/password sign-in is the dependable option. Google sign-in uses an external redirect flow and may require the localhost callback to be allowed separately; it has not been verified from a downloaded local copy.

## 4. AI features

The AI uses NVIDIA NIM through server-side code. Create a key at https://build.nvidia.com/settings/api-keys and add `NVIDIA_API_KEY=nvapi-...` to your local `.env` (and to your host's server secrets when deploying). It is never exposed to the browser.

- Without `NVIDIA_API_KEY` the AI Assistant shows a "not configured" message; the rest of the app works.
- The repository deliberately contains no AI key, service-role key or database password.
- Never put a private key in a `VITE_*` variable; those values are exposed to the browser.
- Optionally set `NVIDIA_MODEL` to use a different NIM model.

Published TeamUp site: **https://team-up-plan.lovable.app**

Publish the latest project changes before the demonstration so the published AI Assistant matches the local source.

## 5. Data safety and backups

- The source ZIP is a code backup, not a dump of live user records.
- The existing Cloud backend continues to store the application's records even when the local server is stopped.
- The SQL migrations in `drizzle/migrations/` preserve the schema, security policies and database functions needed to rebuild the structure.
- Do not commit real user exports, private credentials or service-role keys to GitHub.
- If an independent database copy is required later, export the Cloud data separately and configure a separate backend deliberately; do not overwrite the shared project during a demo.

## 6. Quick checks before presenting

```sh
bun test
bun run lint
```

Then confirm these flows in the browser:

1. Email/password sign-in.
2. Dashboard and team data load.
3. A sample task opens and can be edited by an authorized account.
4. Calendar, resources and saved AI threads load.
5. The published site is available for the live AI demonstration.

## 7. Common problems

### Missing backend environment variables

Confirm that `.env` is in the folder containing `package.json`, then stop and restart `bun run dev`.

### A clean sign-in cannot see a team's private data

Sign in with an account that is actually a member of that team. Row Level Security intentionally hides private records from other users.

### AI works on the published site but not in the downloaded copy

This is the managed-key limitation described above, not lost data or a missing database table.

### Dependency or native-package errors

Remove the local `node_modules` folder, then run `bun install --frozen-lockfile` again using a current Bun release.
