# Product and sprint backlog — status at 23 Oct 2026

Estimates and priorities are the approved proposal values (story points). Status
is what the repository contains today; "Evidence" lists the files that implement
and test the item.

| ID    | User story                                                        | Pri.   | SP  | Planned sprint | Status      | Evidence (repository)                                                                                                                                                                                             |
| ----- | ----------------------------------------------------------------- | ------ | --- | -------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PB-01 | Register, sign in, manage profile (courses, skills, availability) | Must   | 8   | Sprint 1       | Done        | `routes/auth.tsx`, `reset-password.tsx`, `_authenticated/onboarding.tsx`, `settings.tsx`; `tests/unit/frontend/auth.test.mjs`, `backend/auth-middleware.test.mjs`                                                 |
| PB-02 | Create team, invite, request to join, owner approves              | Must   | 8   | Sprint 1       | Done        | `_authenticated/teams.index.tsx`, `teams.$teamId.tsx`, `discover.tsx`, `invite.$token.tsx`; `drizzle/migrations/0000_*`                                                                                           |
| PB-03 | Shared calendar with availability-based meeting times             | Must   | 8   | Sprint 2       | Done        | `features/sessions/components/SessionsPanel.tsx`, `features/sessions/schedule.ts`; `tests/unit/frontend/schedule.test.mjs`                                                                                        |
| PB-04 | Tasks with owners, due dates, status on a shared board            | Must   | 5   | Sprint 2       | Done        | `features/tasks/components/TaskBoard.tsx`, `features/tasks/errors.ts`; `tests/unit/frontend/queries.test.mjs`                                                                                                     |
| PB-05 | Shared notes, links and file references                           | Must   | 5   | Sprint 3       | Done        | `features/resources/components/ResourcesPanel.tsx`, `drizzle/migrations/0001_storage_policies.sql`                                                                                                                |
| PB-06 | In-app notifications (invites, assignments, meetings)             | Should | 5   | Sprint 3       | Done        | `features/notifications/api/queries.ts`, `components/layout/AppShell.tsx`                                                                                                                                         |
| PB-07 | Progress dashboard (completion, overdue, recent activity)         | Must   | 8   | Sprint 4       | Done        | `_authenticated/dashboard.tsx`, `features/activity/api/queries.ts`                                                                                                                                                |
| PB-08 | AI teammate / session suggestions                                 | Should | 8   | Sprint 4       | In progress | `backend/ai/ai.functions.ts` (`suggestTeammates`, `draftTaskPlan`, `summarizeTeam`), `gateway.server.ts`, `_authenticated/assistant.tsx`; `tests/unit/backend/ai-*.test.mjs`. Pending: 20-sample relevance review |
| PB-09 | Release workflows with verified permissions and clear errors      | Must   | 5   | Sprint 5       | In progress | Error handling in task/session flows, accessibility suite (`tests/accessibility/`), RLS policies. Pending: live permission tests                                                                                  |
| PB-10 | Filter tasks by owner, due date, status                           | Should | 3   | Sprint 6       | Done        | `FilterSelect` in `TaskBoard.tsx`                                                                                                                                                                                 |

## Progress summary

- Story points planned: **63**. Done items are PB-01 (8), PB-02 (8), PB-03 (8), PB-04 (5), PB-05 (5), PB-06 (5), PB-07 (8), PB-10 (3) = **50 SP (79%)**.
- In progress: PB-08 (8) and PB-09 (5) = **13 SP (21%)**.

> Note: the proposal plans four two-week sprints but assigns PB-09 and PB-10 to Sprints 5 and 6.
> The team must either extend the sprint count or pull these items into Sprint 4; the report
> records this as a schedule variance.
