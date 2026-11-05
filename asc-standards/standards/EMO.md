---
id: EMO
title: Ethical Model Operations
version: 1.0
status: Draft
type: Standard
category: Models
author: Rex St. John
created: 2026-11-04
requires: ASC-0
inscription: none (inscribed when status becomes Final)
---

# EMO v1.0: Ethical Model Operations

> **Draft.** First version of this standard, published for review. Wording and rules may change before it's inscribed as Final.

## Abstract
Ten things a deployed AI model must never do: model APIs, chat apps and products that serve a model to people.

## Scope
The serving code, model routing, data handling and logging in the repository.

## Keywords
"MUST NOT", "MUST" and "SHOULD" are used as in RFC 2119. Every rule in this standard is a MUST NOT: a model deployment that does any of these things fails the rule.

## Rules

### EMO-01: MUST NOT serve a different model than the one it names.
- **Check:** Responses carry the exact model id and version actually served; no silent fallback to another model.
- **Evidence the jury reads:** routing, fallback logic, response metadata
- **Severity:** critical

### EMO-02: MUST NOT change a pinned model version silently.
- **Check:** A pinned version stays pinned; changes are announced in config and responses.
- **Evidence the jury reads:** version pinning, release config
- **Severity:** normal

### EMO-03: MUST NOT train on user data without opt-in.
- **Check:** Prompts and outputs are excluded from training pipelines unless the user opted in.
- **Evidence the jury reads:** data pipelines, opt-in flags
- **Severity:** critical

### EMO-04: MUST NOT keep prompts longer than the declared retention.
- **Check:** Retention is configured and deletion jobs exist.
- **Evidence the jury reads:** retention config, deletion jobs
- **Severity:** normal

### EMO-05: MUST NOT leak one user's data into another user's context.
- **Check:** Caches, memories and retrieval are scoped per user or tenant.
- **Evidence the jury reads:** cache keys, memory and retrieval scoping
- **Severity:** critical

### EMO-06: MUST NOT send prompts to undeclared third parties.
- **Check:** Prompts go only to declared processors.
- **Evidence the jury reads:** outbound calls, processor list
- **Severity:** critical

### EMO-07: MUST NOT insert undisclosed paid placements into answers.
- **Check:** Sponsored content, if any, is labeled in the response.
- **Evidence the jury reads:** ranking and injection code, labels
- **Severity:** normal

### EMO-08: MUST NOT present generated content as human-made.
- **Check:** Generated media and text are labeled where the product publishes them.
- **Evidence the jury reads:** publishing paths, labels and metadata
- **Severity:** normal

### EMO-09: MUST NOT run without a way to report harmful outputs.
- **Check:** A report path exists and reports are stored.
- **Evidence the jury reads:** report endpoints, storage
- **Severity:** normal

### EMO-10: MUST NOT claim results it can't reproduce.
- **Check:** Published evals and benchmarks include configs that reproduce them.
- **Evidence the jury reads:** eval configs, published numbers
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
See [CERTIFICATION.md](../CERTIFICATION.md): a review is pinned to one repository push (commit), checksummed, scored, and inscribed on Solana with the report and the ASCII badge in [badges/EMO.txt](../badges/EMO.txt).

## Changelog
- 1.0 (2026-11-04): first draft.

## Badge
```
+------------------------------------------+
|    o---o---o        ASC  EMO   v1.0      |
|     \ / \ /         ETHICAL MODEL        |
|      o---o          OPERATIONS           |
|     / \ / \                              |
|    o---o---o        PASS  10/10          |
|  {repo}@{sha7}                           |
|  sha256:{sum12}   {date}                 |
+------------------------------------------+
```
