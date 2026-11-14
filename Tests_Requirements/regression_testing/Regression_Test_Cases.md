# TeamUp Regression Test Cases

## Purpose
Verify that existing functionality continues working after code changes.

| ID | Test Scenario | Test Steps | Expected Result | Status |
|---|---|---|---|---|
| RT-01 | TeamUp login page loads | Open the TeamUp application using Playwright | Login page loads successfully | PASS |
| RT-02 | TeamUp team navigation loads | Navigate to the TeamUp team page | Team navigation loads successfully | PASS |
| RT-03 | TeamUp homepage works after refresh | Open the homepage and refresh the page | Homepage loads successfully after refresh | PASS |
| RT-04 | Invalid page is handled correctly | Navigate to an invalid page URL | Invalid page is handled correctly | PASS |
| RT-05 | Login form requires an email | Submit the login form without entering an email | Email validation is displayed | PASS |
| RT-06 | Login form rejects invalid email format | Enter an invalid email address in the login form | Invalid email format is rejected | PASS |
| RT-07 | Login form remains available after refresh | Refresh the login page | Login form remains available | PASS |

## Execution Notes

- Testing Tool: Playwright
- Total Tests Executed: 7
- Tests Passed: 7
- Tests Failed: 0
- Success Rate: 100%
- Execution Time: Approximately 4.2 seconds
- Tested Commit: Not recorded

## Conclusion

All seven automated regression tests were executed successfully using Playwright. The tests covered login page loading, team navigation, homepage refresh, invalid page handling, and login form validation.

All seven tests passed with no failures reported. The results confirm that the tested application functionality worked as expected during regression testing.