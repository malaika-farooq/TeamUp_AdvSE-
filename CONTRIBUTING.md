# Contributing to TeamUp

Group 6 — CSE 6324. We work in Scrum sprints; see [docs/agile/README.md](docs/agile/README.md).

## Workflow

1. Pick a story from the Jira board / [sprint backlog](docs/agile/SPRINT_BACKLOG.md) and open (or find) a GitHub issue using the **User story** template.
2. Branch from `main` using the backlog ID: `feature/PB-04-task-filters`, `fix/PB-03-recurrence-end`, `test/PB-03-availability-overlap`.
3. Commit in small steps. Start every message with the ID: `PB-03: add availability overlap tests`.
4. Run the checks locally (Node 24+):
   ```sh
   npm run typecheck && npm run lint && npm test && npm run build
   ```
5. Open a pull request. Fill in the template — it is the Definition of Done. Another member reviews before merge.
6. CI (`.github/workflows/ci.yml`) must be green before merging.

Never commit `.env` files or service-role keys.
