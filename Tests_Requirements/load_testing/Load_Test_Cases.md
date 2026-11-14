# TeamUp Load Test Cases

## Purpose
Evaluate TeamUp performance and scalability under concurrent usage.

## Performance Requirement
NFR-01: 95% of responses should complete within 2 seconds with 50 concurrent users.

## Load Test Results

| ID | Test Scenario | Test Steps | Expected Result | Status |
|---|---|---|---|---|
| LT-01 | 10 concurrent users | Configure 10 JMeter threads with a 10-second ramp-up and execute homepage requests | Responses complete without unexpected errors | PASS |
| LT-02 | 25 concurrent users | Configure 25 JMeter threads with a 10-second ramp-up and execute homepage requests | Application remains responsive | PASS |
| LT-03 | 50 concurrent users | Configure 50 JMeter threads with a 10-second ramp-up and execute homepage requests | At least 95% of responses complete under 2 seconds | PASS — Local Homepage |
| LT-04 | Dashboard load | Identify and verify a Dashboard teams API request | Responses are correct and performance is recorded under concurrent load | PARTIAL |
| LT-05 | Task retrieval load | Simulate concurrent task-list requests | Task data is returned correctly | NOT RUN |
| LT-06 | Sustained load | Configure 50 JMeter threads with a 10-second ramp-up and maintain repeated homepage requests for 60 seconds | Response times and errors are recorded | PASS |
| LT-07 | Scalability | Prepare 100 profiles and 50 teams in a separate Supabase testing database | System handles the specified data scale | PARTIAL |

## Performance Metrics

| Metric | LT-01 | LT-02 | LT-03 | LT-06 |
|---|---|---|---|---|
| Concurrent Users Configured | 10 | 25 | 50 | 50 |
| Total Requests | 10 | 25 | 50 | 68,209 |
| Average Response Time | 18 ms | 18 ms | 16 ms | 40 ms |
| Minimum Response Time | 13 ms | 12 ms | 7 ms | 2 ms |
| Maximum Response Time | 25 ms | 27 ms | 28 ms | 160 ms |
| 95th-Percentile Response Time | Not recorded | Not recorded | Not recorded | Not recorded |
| Error Rate | 0% | 0% | 0% | 0% |
| Throughput | 1.1/sec | 2.6/sec | 5.1/sec | 1,136/sec |
| Test Duration | Not recorded | Not recorded | Not recorded | Approximately 60 seconds |

## Additional Test Results

### LT-04 — Dashboard Load
A Supabase teams API request was identified using Chrome Developer Tools and returned HTTP status 200. Concurrent Dashboard API load testing has not been completed.

### LT-07 — Scalability
A separate Supabase testing database was prepared with:
- 100 user profiles
- 50 teams
- 50 owner memberships

The test data was verified using SQL queries. Application-level scalability testing has not been completed.

## Execution Notes

- Testing Tool: Apache JMeter 5.6.3
- Test Environment: Local TeamUp application
- Tested Endpoint: Local homepage
- Backend: Supabase
- Completed Homepage Load Tests: 4
- Partially Completed Tests: 2
- Tests Not Run: 1

The initial load tests used a 10-second ramp-up period and one request per thread. Therefore, they do not establish that 50 requests were processed simultaneously.

## Conclusion

Four local homepage load tests were successfully completed using Apache JMeter. LT-01, LT-02, LT-03, and LT-06 reported a 0% error rate and response times below 2 seconds.

The sustained load test processed 68,209 requests over approximately 60 seconds, with an average response time of 40 milliseconds and throughput of 1,136 requests per second.

Scalability test data consisting of 100 profiles and 50 teams was successfully prepared. Dashboard API connectivity was also verified.

Further testing is required for authenticated Dashboard requests, task retrieval, and application-level scalability. Full NFR-01 compliance has not yet been established.

**Overall Result: 4 PASS, 2 PARTIAL, 1 NOT RUN.**