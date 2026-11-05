---
id: EVC
title: Ethical Vesting Contracts
version: 1.0
status: Draft
type: Standard
category: Finance
author: Rex St. John
created: 2026-11-04
requires: ASC-0
inscription: none (inscribed when status becomes Final)
---

# EVC v1.0: Ethical Vesting Contracts

> **Draft.** First version of this standard, published for review. Wording and rules may change before it's inscribed as Final.

## Abstract
Eight things a token vesting contract must never do, for team, investor and grant vesting.

## Scope
Vesting programs and contracts, their deploy scripts, and the published vesting terms.

## Keywords
"MUST NOT", "MUST" and "SHOULD" are used as in RFC 2119. Every rule in this standard is a MUST NOT: a vesting contract that does any of these things fails the rule.

## Rules

### EVC-01: MUST NOT release tokens before the cliff.
- **Check:** Claims before the cliff timestamp return zero or revert.
- **Evidence the jury reads:** claim logic, cliff constant
- **Severity:** critical

### EVC-02: MUST NOT release faster than the schedule.
- **Check:** Released amount never exceeds the schedule at the current time.
- **Evidence the jury reads:** vesting math, rounding
- **Severity:** critical

### EVC-03: MUST NOT let the issuer take back vested tokens.
- **Check:** Revocation, if any, applies only to unvested tokens.
- **Evidence the jury reads:** revoke function
- **Severity:** critical

### EVC-04: MUST NOT change the schedule, beneficiary or token without consent and a timelock.
- **Check:** Changes need the beneficiary's signature and a delay.
- **Evidence the jury reads:** admin and update functions
- **Severity:** critical

### EVC-05: MUST NOT let an admin withdraw unvested tokens outside the declared terms.
- **Check:** Admin withdrawals follow the published revocation terms only.
- **Evidence the jury reads:** withdraw and sweep functions
- **Severity:** critical

### EVC-06: MUST NOT lose tokens when a beneficiary changes.
- **Check:** Transfers of a grant keep the full vested and unvested amounts.
- **Evidence the jury reads:** beneficiary transfer logic
- **Severity:** normal

### EVC-07: MUST NOT sit behind an upgradeable proxy without a timelock.
- **Check:** Upgrades, if possible, are timelocked and announced.
- **Evidence the jury reads:** proxy and upgrade authority
- **Severity:** normal

### EVC-08: MUST NOT hide the schedule.
- **Check:** Cliff, duration and amounts are readable on chain and match the published terms.
- **Evidence the jury reads:** view functions, terms reference
- **Severity:** normal

## Verdicts and scoring
Each rule gets one verdict from the AI jury, by quorum, with file and line citations:
- `pass`: the code shows the rule is met.
- `fail`: the code shows the rule is broken.
- `needs_evidence`: the rule applies, but the code doesn't show either way.
- `not_evaluable_from_code`: the rule depends on servers, contracts or practices outside the repository.

**Score** = (sum of weights of `pass` rules) / (sum of weights of rules that aren't `not_evaluable_from_code`) x 100. Critical rules weigh 3, others 1.

**Result: PASS** when there are no `fail` and no `needs_evidence` verdicts, and at least 60% of the rules' total weight was evaluable from code. Otherwise **NOT CERTIFIED**, with the reasons listed.

## Certification
See [CERTIFICATION.md](../CERTIFICATION.md): a review is pinned to one repository push (commit), checksummed, scored, and inscribed on Solana with the report and the ASCII badge in [badges/EVC.txt](../badges/EVC.txt).

## Changelog
- 1.0 (2026-11-04): first draft.

## Badge
```
+------------------------------------------+
|   [====|====|====|----]   ASC  EVC v1.0  |
|   cliff  25%  50%   ...   ETHICAL        |
|     \__ on schedule __/   VESTING        |
|                           CONTRACTS      |
|                           PASS  8/8      |
|  {repo}@{sha7}                           |
|  sha256:{sum12}   {date}                 |
+------------------------------------------+
```
