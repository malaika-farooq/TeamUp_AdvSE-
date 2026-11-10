<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- AI model calls go through `@lovable.dev/ai-gateway` helpers in `src/lib/ai-gateway.ts`, called only from server functions or `/api/ai/*` server routes — keeps the key server-side and error messages consistent.
- Assistant context is built by `src/lib/ai-context.ts` using the caller's own Supabase client after a membership check — RLS stays in force and records are wrapped as untrusted `<records>` data.
- Streaming endpoints (`/api/ai/chat`, `/api/ai/write`) verify the bearer token in-handler via `src/lib/route-auth.ts` — server routes are not covered by server-function auth middleware.
- Chat threads live in `ai_threads`/`ai_messages` (one route per thread: `/assistant/chat/$threadId`); the server reloads history from the database and dedupes user messages by `client_id` instead of trusting client-sent history.
- Private data like availability is only exposed to the AI as computed aggregates via security-definer RPCs (e.g. overlap minutes) — never raw slots.
- Business rules that must not regress (e.g. teammate ranking, AI Markdown cleanup) live as pure modules in `src/lib/` with `bun test` files in root `tests/` — tests stay outside the app's tsconfig so `bun:test` types don't leak into the build.
- AI teammate suggestions rank candidates in code first and send only positive facts to the model under short keys; the AI writes reasons only — keeps rankings deterministic and stops the model inventing or listing missing facts.
