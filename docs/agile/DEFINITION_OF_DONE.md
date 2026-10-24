# Definition of Done

A backlog item is **Done** only when every box is true. The same list is the
checklist in `.github/PULL_REQUEST_TEMPLATE.md`.

| #   | Criterion (from proposal §4)                    | How it is checked                                                       |
| --- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| 1   | Acceptance criteria of the story are met        | Reviewer walks through the criteria in the PR                           |
| 2   | Code reviewed and merged to `main`              | At least one approving review from another member                       |
| 3   | Relevant unit / integration tests pass          | `npm test` (and `npm run test:a11y` for UI changes) — run by CI         |
| 4   | Type check, lint and production build succeed   | `npm run typecheck`, `npm run lint`, `npm run build` — run by CI        |
| 5   | Access permissions verified for different users | Owner / admin / member / non-member cases in `tests/manual/`            |
| 6   | Documentation updated                           | README, `docs/` or `tests/testreadme.md` changed when behaviour changes |
| 7   | Deployed to the shared test environment         | Link in the PR description                                              |
| 8   | No unresolved Critical defects                  | Issue tracker label `severity: critical` is empty for the item          |
