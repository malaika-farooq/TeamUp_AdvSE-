# Traceability: requirement -> tests

Paths are relative to the project root. "DB" means `Final_Testing/database/security.test.ts` (row-level security,
migrations); "SYS" means `Final_Testing/system/`.

## Functionality 1: profiles with courses, skills, weekly availability and photo

| Requirement                                                         | Tests                                                                                           |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Edit profile, courses, skills, availability, photo, theme, password | `tests/settings/*` (profile, academic, availability, appearance, account, photo-and-save, tabs) |
| Rules (courses, skills, time ranges, photo checks, completeness)    | `tests/profile-data.test.ts`, `tests/profile-queries.test.ts`                                   |
| Saved changes show everywhere (photo in the circle)                 | `tests/settings/photo-and-save.test.tsx`                                                        |

## Functionality 2: create/join teams, invitations, requests, roles and permissions

| Requirement                                   | Tests                                                  |
| --------------------------------------------- | ------------------------------------------------------ |
| Owner / admin / member permission matrix      | `tests/team-rules.test.ts`, DB ("roles inside a team") |
| A member sees their own role, not the owner's | `Final_Testing/regression/past-bugs.test.tsx`          |
| Outsiders can't see or change a private team  | DB ("outsider ..."), SYS `access-control`              |
| A team you can't open shows a way back        | SYS `access-control`                                   |

## Authentication and access

| Requirement                                                                         | Tests                            |
| ----------------------------------------------------------------------------------- | -------------------------------- |
| Sign up, sign in, Google, redirects, error messages                                 | `tests/auth/auth-flows.test.tsx` |
| Pages need a sign-in                                                                | SYS `access-control.test.tsx`    |
| Server checks the JWT (missing, non-Bearer, malformed, forged, expired, no subject) | `tests/auth/jwt-auth.test.ts`    |
| Signed-out visitors run no database function (except the invite lookup)             | DB ("structural checks")         |

## Functionality 3: availability-overlap meeting scheduling

| Requirement                                                          | Tests                                                                                 |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Best common times, time zones, ranking                               | `tests/meeting/meeting-times.test.ts`                                                 |
| Meeting times tab: map, best times, mark free time, remind, schedule | `tests/meeting/meeting-times-tab.test.tsx`, `tests/meeting/team-availability.test.ts` |
| Teammates see free time only through the team function               | DB ("notifications and free time stay private")                                       |
| Session form checks                                                  | `tests/tasks/session-form.test.ts`                                                    |

## Functionality 4: task board

| Requirement                                                          | Tests                                                                           |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| To Do / In Progress / Done, due dates, filters, ordering, validation | `tests/tasks/task-board.test.ts`                                                |
| Board, cards, status changes, permissions                            | `tests/tasks/task-board-ui.test.tsx`                                            |
| Add, assign, edit, delete, comments, checklist                       | `tests/tasks/task-create-and-panel.test.tsx`, `tests/tasks/tasks-page.test.tsx` |
| Finish times and assignee rules in the database                      | DB ("outsider", "pretend", "roles")                                             |

## Functionality 5: shared notes and links, notifications

| Requirement                                              | Tests                                                                               |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Notes, links, files: safe links, tags, search, versions  | `tests/resources/resources-lib.test.ts`, `tests/resources/resources-panel.test.tsx` |
| Notes can't run code                                     | `Final_Testing/regression/markdown-security.test.tsx`                               |
| Bell, page, mark read/unread, delete, deadline reminders | `tests/notifications/*`                                                             |
| Assign -> notified; share -> notified                    | `tests/notifications/workflow.test.tsx`, SYS `team-workflow`                        |
| Nobody reads or rewrites another person's notifications  | DB ("notifications ...")                                                            |

## Functionality 6: activity history and progress dashboard

| Requirement                                                   | Tests                                                                        |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Tasks by status, upcoming deadlines, per-member contributions | `tests/progress/progress-lib.test.ts`, `tests/progress/progress-ui.test.tsx` |
| History with filters and paging                               | `tests/progress/progress-ui.test.tsx`                                        |
| Dashboard and history follow what people do                   | SYS `team-workflow`                                                          |
| History can't be edited or faked                              | DB ("the history cannot be rewritten", "nobody can pretend ...")             |
| Speed with thousands of tasks                                 | `Final_Testing/load/performance.test.tsx`                                    |

## AI Teammate Matching

| Requirement                                        | Tests                                                                            |
| -------------------------------------------------- | -------------------------------------------------------------------------------- |
| Ranking on profile, skills, availability, workload | `tests/ai/matching-requirements.test.ts`, `tests/teammates-and-markdown.test.ts` |
| Find partners, send request, plan a session        | `tests/ai/partner-match-tool.test.tsx`, `tests/ai/session-plan-tool.test.tsx`    |
| Page layout and naming                             | `tests/ai/teammate-matching-hub.test.tsx`                                        |
| Search -> request -> accept -> session -> reply    | SYS `ai-matching-journey.test.tsx`                                               |

## Additional AI features

| Requirement                                                         | Tests                                                                              |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Plan tasks, break down a task, written drafts, teammate ideas, chat | `tests/ai/additional-ai-tools.test.tsx`, `tests/ai/teammate-matching-hub.test.tsx` |
| AI output is shown safely                                           | `Final_Testing/regression/markdown-security.test.tsx`                              |
