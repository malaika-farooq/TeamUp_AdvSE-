
# TeamUp Requirements Test Cases

## 1. Purpose

This document defines test cases for TeamUp functional requirements (FR-01 to FR-10), non-functional requirements (NFR-01 to NFR-05), and AI recommendation acceptance.

These test cases are separate from the existing Bun automated tests.

## 2. Functional Test Cases

### TC-01: User Registration and Sign-In
**Requirement:** FR-01

**Steps:**
1. Open TeamUp.
2. Register using valid user details.
3. Sign in using valid credentials.
4. Attempt sign-in using invalid credentials.

**Expected Result:** Valid credentials are accepted and invalid credentials are rejected.

**Status:** Partial — unit tests reported passing; Cypress end-to-end test not run.

### TC-02: User Profile Management
**Requirement:** FR-01

**Steps:**
1. Sign in.
2. Open the profile page.
3. Update profile information.
4. Save and reload the profile.

**Expected Result:** Profile information is saved and displayed correctly.

**Status:** Partial.

### TC-03: Team Creation and Membership
**Requirement:** FR-02

**Steps:**
1. Create a new team.
2. Invite another user.
3. Submit a membership request.
4. Approve the request as team owner.
5. Attempt approval as a non-owner.

**Expected Result:** The owner can approve requests; unauthorized users cannot.

**Status:** Partial — unit and manual flow reported passing; live permission test not run.

### TC-04: Team and Task Permissions
**Requirements:** FR-02, FR-04

**Steps:**
1. Sign in as team owner.
2. Create and assign a task.
3. Sign in as a regular member.
4. Attempt an owner-restricted action.

**Expected Result:** Only authorized users can perform restricted actions.

**Status:** Partial.

### TC-05: Shared Calendar
**Requirement:** FR-03

**Steps:**
1. Create a meeting.
2. Enter availability for multiple members.
3. Check overlapping availability.
4. Create a weekly recurring meeting.

**Expected Result:** Availability overlaps and weekly recurrence are calculated correctly.

**Status:** Pass — 19 tests reported; editing and deleting sessions remain unavailable.

### TC-06: Task Board and Filtering
**Requirements:** FR-04, FR-10

**Steps:**
1. Create a task.
2. Assign a team member.
3. Set a due date.
4. Update task status.
5. Filter by owner, due date, and status.

**Expected Result:** Task operations and filters return correct results.

**Status:** Partial — unit and manual checks reported; UI filtering not automated.

### TC-07: Shared Resources
**Requirement:** FR-05

**Steps:**
1. Open team resources.
2. Add a note, link, or file.
3. Save the resource.
4. Verify access from the correct team.
5. Attempt access from an unrelated team.

**Expected Result:** Resources are saved and restricted to the appropriate team.

**Status:** Partial — unit tests reported; UI automation not run.

### TC-08: Notifications
**Requirement:** FR-06

**Steps:**
1. Invite a team member.
2. Assign a task.
3. Modify a meeting.
4. Check generated notifications.

**Expected Result:** Relevant notifications are created for each action.

**Status:** Partial — query tests reported passing; additional workflow verification remains.

### TC-09: Progress Dashboard
**Requirement:** FR-07

**Steps:**
1. Create tasks with different statuses.
2. Complete one task.
3. Make another task overdue.
4. Open the dashboard.
5. Check progress and recent activity.

**Expected Result:** Dashboard displays accurate completion, overdue, and activity information.

**Status:** Partial — query tests reported passing; load test not run.

### TC-10: Access Permissions
**Requirement:** FR-09

**Steps:**
1. Sign in as an owner.
2. Attempt restricted operations.
3. Repeat as a member.
4. Repeat as a non-member.

**Expected Result:** Unauthorized operations are rejected.

**Status:** Partial — unit tests reported; live role-based testing not completed.

### TC-11: Error Messages and Accessibility
**Requirements:** FR-09, NFR-03

**Steps:**
1. Submit invalid input.
2. Trigger an unauthorized operation.
3. Verify error messages.
4. Run accessibility checks.

**Expected Result:** Errors are understandable and the interface is accessible.

**Status:** Partial — 22/22 accessibility checks reported; usability timing not measured.

### TC-12: Authentication Security
**Requirement:** NFR-02

**Steps:**
1. Request a protected endpoint without authentication.
2. Repeat with an invalid session token.
3. Repeat with a valid session token.

**Expected Result:** Protected endpoints reject unauthorized requests.

**Status:** Partial — unit tests reported; penetration and live isolation testing not completed.

## 3. AI Test Cases

### TC-AI01: AI Teammate Suggestions
**Requirement:** FR-08

**Steps:**
1. Sign in.
2. Open the AI Assistant.
3. Request teammate recommendations.
4. Inspect the suggested candidates and explanations.

**Expected Result:** Up to four relevant suggestions are returned with explanations.

**Status:** Fail / Partial — handler tests reported passing, but the hosted run returned no recommendations.

### TC-AI02: Accept AI Recommendation
**Requirement:** FR-08

**Steps:**
1. Generate AI recommendations.
2. Select a recommendation.
3. Click Accept.
4. Verify the resulting action or saved state.

**Expected Result:** The selected recommendation is accepted and recorded.

**Status:** Not verified — accept control was not available in the reported hosted run.

### TC-AI03: Decline and Review AI Recommendations
**Requirements:** FR-08, AI acceptance requirement

**Steps:**
1. Generate AI recommendations.
2. Decline a recommendation.
3. Record accepted and declined suggestions.
4. Review at least 20 recommendations.
5. Calculate the acceptance rate.

**Expected Result:** Accept/decline actions work and an acceptance rate is reported from at least 20 reviewed recommendations.

**Status:** Not run — 0 of 20 recommendations reviewed.

## 4. Non-Functional Test Cases

### TC-P01: Performance
**Requirement:** NFR-01

**Steps:**
1. Configure a k6 load test.
2. Simulate 50 concurrent users.
3. Record response times.
4. Calculate the percentage below 2 seconds.

**Expected Result:** At least 95% of responses complete within 2 seconds.

**Status:** Not run.

### TC-R01: AI Failure Recovery
**Requirement:** NFR-04

**Steps:**
1. Simulate an AI gateway failure.
2. Request an AI recommendation.
3. Observe the application response.

**Expected Result:** The application handles AI failures safely without crashing.

**Status:** Partial — fallback reported tested.

### TC-R02: Availability
**Requirement:** NFR-04

**Steps:**
1. Collect service uptime records.
2. Measure availability over a defined period.
3. Calculate uptime percentage.

**Expected Result:** At least 99% availability.

**Status:** Not measured.

### TC-S01: Scalability
**Requirement:** NFR-05

**Steps:**
1. Prepare 100 user profiles.
2. Prepare 50 groups.
3. Execute representative application operations.
4. Check for errors or schema changes.

**Expected Result:** The system supports the required profiles and groups without schema changes.

**Status:** Not run.

### TC-U01: First-Time User Usability
**Requirement:** NFR-03

**Steps:**
1. Recruit a first-time user.
2. Start a timer.
3. Ask the user to create their first group.
4. Record completion time.

**Expected Result:** First group created within 5 minutes.

**Status:** Not run.

## 5. Testing Notes

The statuses above reflect the requirements traceability table supplied for the project. They are not results of a new test execution.

Existing Bun tests are maintained separately under the original tests directory. Unexecuted or partially verified test cases must not be reported as fully passed.
