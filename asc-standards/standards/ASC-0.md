---
id: ASC-0
title: Standards process and numbering
version: 1.0
status: Draft
type: Meta
author: Rex St. John
created: 2026-11-04
---

# ASC-0 v1.0: Standards process and numbering

## Names and versions
- Each standard has a three-letter code starting with E for Ethical: **E** + subject + **O**perations, **C**onduct or **C**ontracts (EDO, EAO, ETC, EVC, EMO).
- Versions are `MAJOR.MINOR`. A new or removed rule, or a changed meaning, is a MAJOR change. Wording, checks and evidence lists are MINOR. Written as `EDO v1.0`.
- Rule ids are `{CODE}-{NN}` (EDO-01). A rule id is never reused for a different rule.

## Statuses
`Draft` → `Review` → `Final` → `Superseded`. Only `Final` versions are inscribed. A certificate always names the exact version it was checked against.

## Format
Every standard is one Markdown file in `standards/` with the front matter shown in this file, then: Abstract, Scope, Keywords, Rules (each with Check, Evidence and Severity), Verdicts and scoring, Certification, Changelog, Badge.

## Inscription
When a version becomes Final, its Markdown file is inscribed on Solana with IQ Labs `writer.codeIn`. The inscription id (`policyTx`) and the SHA-256 of the file (`policyRef`) are added to the front matter in the same pull request.

## Changes
Open a pull request. Rex reviews. Changes to a Final standard create a new version; the old one stays inscribed and valid for the certificates that used it.
