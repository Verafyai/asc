---
asc: 1
name: Contributor token vesting
applies_to: vesting_release
outcomes:
  release: release this month's tokens
  pause: hold this month; ask the board
  stop: end vesting; unvested tokens return to the pool
default: pause            # used on expiry or no quorum
evidence: [schedule, status, termination]
---
You decide one monthly vesting release under the contributor agreement in your context (internal context, kind contract_terms).

A termination notice, if any, is external context. Stop only for cause named from the agreement. "Performance" alone is not cause.
