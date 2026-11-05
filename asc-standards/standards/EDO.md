---
id: EDO
title: Ethical Device Operations
version: 1.0
status: Draft
type: Standard
category: Devices
author: Rex St. John
created: 2026-11-04
requires: ASC-0
inscription: none (inscribed when status becomes Final)
---

# EDO v1.0: Ethical Device Operations

> **Draft.** First version of this standard, published for review. Wording and rules may change before it's inscribed as Final.

## Abstract
Five things a consumer device must never do: smart TVs, streaming boxes, speakers, cameras, toys, appliances and in-car systems, and the software that runs them.

## Scope
Device firmware, companion apps and the SDKs they bundle. Server behavior is checked only where the repository contains it.

## Keywords
"MUST NOT", "MUST" and "SHOULD" are used as in RFC 2119. Every rule in this standard is a MUST NOT: a device that does any of these things fails the rule.

## Rules

### EDO-01: MUST NOT listen or watch without a visible indicator.
- **Check:** Microphone and camera capture paths turn on a light or on-screen indicator in the same code path; no background capture.
- **Evidence the jury reads:** permission manifests (RECORD_AUDIO, CAMERA, entitlements), capture call sites, indicator code
- **Severity:** critical

### EDO-02: MUST NOT profile the owner from what they watch, say or do without opt-in.
- **Check:** Automatic content recognition, screen fingerprinting and voice profiling are off by default and gated by an explicit opt-in.
- **Evidence the jury reads:** SDK dependencies, default settings, consent screens
- **Severity:** critical

### EDO-03: MUST NOT sell or share personal data without opt-in.
- **Check:** No ad-tech or data-broker SDK sends identifiers before consent; consent is recorded.
- **Evidence the jury reads:** network endpoints, SDK list, consent checks before calls
- **Severity:** critical

### EDO-04: MUST NOT require an account or internet for basic functions.
- **Check:** Power, inputs, volume, local playback and setup work with no network and no sign-in.
- **Evidence the jury reads:** setup flow, network-required guards
- **Severity:** normal

### EDO-05: MUST NOT remotely remove features the owner paid for.
- **Check:** No server-controlled kill switch or flag disables shipped core features; updates don't remove them.
- **Evidence the jury reads:** remote config and feature-flag clients, update scripts
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
See [CERTIFICATION.md](../CERTIFICATION.md): a review is pinned to one repository push (commit), checksummed, scored, and inscribed on Solana with the report and the ASCII badge in [badges/EDO.txt](../badges/EDO.txt).

## Changelog
- 1.0 (2026-11-04): first draft.

## Proposed for v1.1
Injecting ads into HDMI and other inputs; dark patterns in consent; no published security-update end date; no data export and delete; hidden automated decisions about the owner; tracking or manipulating children.

## Badge
```
+------------------------------------------+
|  .----------------------.   ASC  EDO     |
|  |  [ ]  ETHICAL   [o]  |   v1.0         |
|  |   DEVICE OPERATIONS  |                |
|  '----------.-----------'   PASS  5/5    |
|           _|_|_                          |
|  {repo}@{sha7}                           |
|  sha256:{sum12}   {date}                 |
+------------------------------------------+
```
