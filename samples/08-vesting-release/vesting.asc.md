---
asc: 1
name: Contributor token vesting
version: 1.0.0
applies_to: vesting_release
outcomes:
  release: release this month's tokens
  pause: hold this month; ask the board
  stop: end vesting; unvested tokens return to the pool
default: pause
caps: { per_release: from_schedule }
min_jury: { size: 5, quorum: 4, different_labs: true }   # callers can ask for more, never less
timeout: 10m
dispute: { window: 14d, second_jury: true }
evidence:
  - schedule       # grant, cliff, monthly amount
  - status         # active, on leave, or ended; with the date
  - termination    # if ended: the written notice and its stated reason
---

1. Before the 12-month cliff, release nothing.
2. Release on schedule while the contributor is active or on approved leave.
3. Stop only if their work ended for cause, and the written notice names a
   specific reason from the contributor agreement. "Performance" alone is not cause.
4. If their work ended without cause, keep releasing for 3 months, then stop.
5. If the notice and the status disagree, pause and ask the board.
