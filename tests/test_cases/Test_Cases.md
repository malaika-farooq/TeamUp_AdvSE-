# TeamUp Automated Test Cases

**Testing framework:** Bun Test 1.4.4  
**Test source:** `teammates-and-markdown.test.ts`

| Test ID | Test case | Expected result | Status |
|---|---|---|---|
| TC01 | Teammate candidate limit | Returns at most four candidates | Pass |
| TC02 | Existing team member exclusion | Excludes existing team members | Pass |
| TC03 | Discoverability validation | Excludes non-discoverable students | Pass |
| TC04 | Common-interest matching | Excludes candidates with nothing in common | Pass |
| TC05 | Course-based ranking | Ranks a shared course above a single new skill | Pass |
| TC06 | Recommendation explanation | Uses only existing facts | Pass |
| TC07 | Markdown bold formatting | Correctly renders bold formatting | Pass |
| TC08 | Markdown heading formatting | Separates headings correctly | Pass |
| TC09 | Case-insensitive skill matching | Matches skills regardless of case | Pass |
| TC10 | Required skill filtering | Filters and ranks candidates by required skills | Pass |
| TC11 | Workload classification | Evaluates workload levels | Pass |
| TC12 | Workload-based ranking | Ranks heavily loaded students lower | Pass |
| TC13 | Workload-only matching | Does not match based on workload alone | Pass |
| TC14 | Session slot ranking | Prioritizes availability and caps duration at 90 minutes | Pass |
| TC15 | Next occurrence calculation | Finds the next matching weekday | Pass |
| TC16 | Availability filtering | Excludes unavailable students and avoids heavy workloads when requested | Pass |

**Result:** 16 passed, 0 failed.