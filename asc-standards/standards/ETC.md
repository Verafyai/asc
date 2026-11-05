---
id: ETC
title: Ethical Treasury Conduct
version: 1.0
status: Draft
type: Standard
category: Finance
author: Rex St. John
created: 2026-11-04
requires: ASC-0
inscription: none (inscribed when status becomes Final)
---

# ETC v1.0: Ethical Treasury Conduct

> **Draft.** First version of this standard, published for review. Wording and rules may change before it's inscribed as Final.

## Abstract
Twelve things an on-chain treasury must never do: DAO treasuries, exchange hot wallets, protocol reserves and company wallets run by smart contracts.

## Scope
Treasury programs and contracts (Solana programs, Solidity), their deploy and upgrade scripts, and the inscribed treasury policy.

## Keywords
"MUST NOT", "MUST" and "SHOULD" are used as in RFC 2119. Every rule in this standard is a MUST NOT: a treasury that does any of these things fails the rule.

## Rules

### ETC-01: MUST NOT move funds without the declared signer quorum.
- **Check:** Every outflow requires the declared M-of-N signatures.
- **Evidence the jury reads:** signer checks, multisig config
- **Severity:** critical

### ETC-02: MUST NOT send more than the per-transaction cap.
- **Check:** Transfers are clamped or rejected above the cap.
- **Evidence the jury reads:** transfer functions, cap constants
- **Severity:** critical

### ETC-03: MUST NOT exceed the daily outflow cap.
- **Check:** A rolling outflow total is tracked and enforced.
- **Evidence the jury reads:** outflow accounting, time windows
- **Severity:** critical

### ETC-04: MUST NOT pay addresses outside the allowlist, or new ones before a delay.
- **Check:** Payees are checked against an allowlist with an add-time delay.
- **Evidence the jury reads:** allowlist storage, delay checks
- **Severity:** critical

### ETC-05: MUST NOT let one key upgrade the program or change signers.
- **Check:** Upgrades and signer changes need the quorum and a timelock.
- **Evidence the jury reads:** upgrade authority, timelock, admin functions
- **Severity:** critical

### ETC-06: MUST NOT hold unbounded token approvals to external contracts.
- **Check:** Approvals are exact amounts and revoked after use.
- **Evidence the jury reads:** approve and delegate calls
- **Severity:** normal

### ETC-07: MUST NOT invest outside the declared asset policy.
- **Check:** Swaps and deposits are limited to listed assets and concentration limits.
- **Evidence the jury reads:** swap and deposit paths, asset lists
- **Severity:** normal

### ETC-08: MUST NOT rely on a single price feed without staleness and deviation checks.
- **Check:** Prices are checked for age and against a second source or band.
- **Evidence the jury reads:** oracle reads, staleness and deviation checks
- **Severity:** normal

### ETC-09: MUST NOT move funds without an event or log.
- **Check:** Every outflow emits an event with amount, payee and reason.
- **Evidence the jury reads:** events and logs
- **Severity:** normal

### ETC-10: MUST NOT commingle user funds with treasury funds.
- **Check:** User deposits and treasury reserves are separate accounts.
- **Evidence the jury reads:** account layout
- **Severity:** critical

### ETC-11: MUST NOT run without an emergency pause that one key can't lift.
- **Check:** A pause exists; unpausing needs the quorum.
- **Evidence the jury reads:** pause and unpause functions
- **Severity:** normal

### ETC-12: MUST NOT operate without its policy inscribed and referenced.
- **Check:** The treasury policy is inscribed (an ASC) and its hash is stored in the program.
- **Evidence the jury reads:** policy reference, inscription id
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
See [CERTIFICATION.md](../CERTIFICATION.md): a review is pinned to one repository push (commit), checksummed, scored, and inscribed on Solana with the report and the ASCII badge in [badges/ETC.txt](../badges/ETC.txt).

## Changelog
- 1.0 (2026-11-04): first draft.

## Badge
```
+------------------------------------------+
|   ___________       ASC  ETC   v1.0      |
|  |  _______  |      ETHICAL TREASURY     |
|  | | (@)   | |      CONDUCT              |
|  | |_______| |                           |
|  |___________|      PASS  12/12          |
|  {repo}@{sha7}                           |
|  sha256:{sum12}   {date}                 |
+------------------------------------------+
```
