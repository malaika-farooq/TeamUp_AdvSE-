
# TeamUp Regression Test Cases

## Purpose
Verify that existing functionality continues working after code changes.

| ID | Test Scenario | Test Steps | Expected Result | Status |
|---|---|---|---|---|
| RT-01 | Login regression | Log in after an application update | Login still works | Not Run |
| RT-02 | Team creation regression | Create a new team | Team creation still works | Not Run |
| RT-03 | Task creation regression | Create and save a task | Task is saved correctly | Not Run |
| RT-04 | Task status regression | Change task status and reload | Updated status persists | Not Run |
| RT-05 | Calendar regression | Create a meeting and reload | Meeting remains visible | Not Run |
| RT-06 | AI suggestion regression | Request teammate suggestions | Existing recommendation behavior remains correct | Not Run |
| RT-07 | Dashboard regression | Update task progress | Dashboard reflects the change | Not Run |
| RT-08 | Resource regression | Save and reopen a resource | Resource remains available | Not Run |
| RT-09 | Permissions regression | Attempt unauthorized team actions | Restricted actions remain blocked | Not Run |
| RT-10 | Navigation regression | Open dashboard, tasks, calendar, resources, and AI pages | Pages load without navigation errors | Not Run |

## Execution Notes
Run these tests after changes to the application.
Record the tested commit, actual results, and any defects.
