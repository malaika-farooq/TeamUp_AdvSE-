
# TeamUp Load Test Cases

## Purpose
Evaluate TeamUp performance and scalability under concurrent usage.

## Performance Requirement
NFR-01: 95% of responses should complete within 2 seconds with 50 concurrent users.

| ID | Test Scenario | Test Steps | Expected Result | Status |
|---|---|---|---|---|
| LT-01 | 10 concurrent users | Simulate 10 users accessing a representative endpoint | Responses complete without unexpected errors | Not Run |
| LT-02 | 25 concurrent users | Simulate 25 concurrent users | Application remains responsive | Not Run |
| LT-03 | 50 concurrent users | Simulate 50 concurrent users | At least 95% of responses complete under 2 seconds | Not Run |
| LT-04 | Dashboard load | Simulate concurrent dashboard requests | Responses are correct and performance is recorded | Not Run |
| LT-05 | Task retrieval load | Simulate concurrent task-list requests | Task data is returned correctly | Not Run |
| LT-06 | Sustained load | Maintain 50 concurrent users for a defined duration | Response times and errors are recorded | Not Run |
| LT-07 | Scalability | Test operations involving 100 profiles and 50 groups | System handles the specified data scale | Not Run |

## Metrics to Record
- Concurrent users
- Total requests
- Average response time
- 95th-percentile response time
- Error rate
- Test duration

## Execution Notes
Use k6 or another suitable load-testing tool.
Use an authorized test environment and representative test data.
Do not run high-load tests against the public deployment without team approval.

No load tests have been executed as part of this document.
