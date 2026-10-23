# Browser and database test cases

These are manual scenarios, not automated passing tests. Run against a dedicated
test project with an owner, admin, member, non-member, and signed-out browser.
Record the date, browser, build, actual result, and pass/fail for each scenario.

| Area                   | Scenarios and expected results                                                                                                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Registration           | Valid signup; invalid email; short password; duplicate email; confirmation required; provider errors. Invalid input stays on the form with useful feedback; successful signup follows the configured confirmation flow.        |
| Sign-in                | Valid credentials, incorrect password, unknown email, expired session, unavailable backend, Google OAuth success/cancel/failure. Protected pages require a valid session.                                                      |
| Redirects              | Open each protected URL signed out; sign in and verify the intended destination. Test external and malformed redirect values: they must not navigate users to an untrusted site.                                               |
| Password reset         | Request reset for an existing/unknown email; valid, expired, and reused recovery links; mismatched/short passwords. Only a valid recovery session can change the password.                                                     |
| Session lifecycle      | Refresh signed in; sign out; navigate back; token expiry; multiple tabs. Protected data must not remain available after sign-out.                                                                                              |
| Onboarding/settings    | Save valid profile fields; reject invalid input; retry a failed save; refresh to verify persistence; upload a valid avatar; reject forbidden file types and oversized uploads.                                                 |
| Dashboard              | No teams, populated teams, failed query, loading state; task and session totals match persisted records.                                                                                                                       |
| Teams                  | Create/edit/delete a team; validation errors; private/public visibility; leave team; owner transfer; invite acceptance, expired/reused invite, join-request approve/deny. Enforce each role's permissions.                     |
| Tasks                  | Create/edit/delete; empty and long titles; all priorities/statuses; assignment; due dates; board drag/drop; refresh and confirm order; failed mutation feedback; concurrent edits. Only authorized members can mutate tasks.   |
| Sessions/calendar      | Create/edit/delete; date boundaries; end before start; overlapping sessions; recurrence and recurrence end; RSVP; timezone and daylight-saving transitions. Verify both displayed and stored times.                            |
| Resources              | Create/edit/delete notes and links; upload/download/delete files; invalid URLs; empty content; large uploads; failed upload cleanup. Non-members must not obtain private files via guessed paths or expired signed URLs.       |
| Discovery              | Empty search; course/university filters; hidden profiles; public/private teams; duplicate join requests. Only discoverable profile fields are exposed.                                                                         |
| AI                     | Each feature with valid membership; non-member call; signed-out call; invalid team UUID; no candidates; provider timeout, credit exhaustion, rate limiting, malformed output. No unauthorized team data reaches the provider.  |
| Sample workspace       | Create once; create again; remove; remove twice; attempt removal of a real team or another user's team. Real workspaces remain intact.                                                                                         |
| Notifications/activity | Read/unread behavior, duplicate notifications, valid deep links, empty lists, pagination/limits, unauthorized reads and inserts.                                                                                               |
| Theme/responsiveness   | Persist light/dark choice; system preference; refresh; blocked storage; desktop, tablet, mobile; navigation drawer and overflowing content.                                                                                    |
| Accessibility          | Keyboard-only navigation; visible focus; dialog focus trap and restoration; labels; error announcements; screen reader names; contrast; reduced motion.                                                                        |
| Resilience             | Offline mode, reconnect, slow API, failed server rendering, invalid URL, deleted records. Recovery controls work and sensitive errors are not exposed.                                                                         |
| PostgreSQL RLS         | For each table test SELECT/INSERT/UPDATE/DELETE as every relevant role, including cross-team IDs. Test direct REST/RPC calls as well as the UI. Verify allowed operations persist and forbidden operations do not change rows. |
| Storage policies       | Member/non-member/anonymous reads and writes for team files and avatars; forged owner/team path; overwrite/delete another user's object; signed URL expiry.                                                                    |
| Server transport       | Real TanStack RPC: token attachment, middleware registration, POST validation, CSRF rejection, expired JWT, server/client bundling. Unit mocks do not establish these guarantees.                                              |
| Deployment             | Production build; direct route refresh; environment variables; SPA/server assets; no privileged keys in browser bundles; smoke-test auth and one authorized CRUD flow.                                                         |

The read-only automated integration suite covers a subset of SELECT isolation.
It does not cover database writes, storage policies, browser interaction, or
concurrent users. Those scenarios remain unverified until executed here or
implemented in a browser/database integration harness.
