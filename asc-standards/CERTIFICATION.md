# Certification rules v1.0 (Draft)

How a repository push is checked against an ASC standard and recorded on chain.

## 1. What gets certified
One **repository push**: a GitHub repository at one commit. Nothing else. A new push needs a new certificate; a re-check re-judges only the rules whose evidence files changed.

## 2. Checksum
The certificate identifies the exact code by three values:
- `commit`: the full git commit SHA.
- `tree`: the git tree SHA of that commit (`git rev-parse <commit>^{tree}`).
- `codeChecksum`: SHA-256 over the sorted list of `path<TAB>blob-sha<LF>` for every file in the tree. Anyone can recompute it from a clone:
  ```
  git ls-tree -r <commit> | awk '{print $4"\t"$3}' | LC_ALL=C sort | sha256sum
  ```

## 3. The review
1. Fetch the repository at the commit (public by URL; private through a read-only GitHub App).
2. For each rule, collect only the files its **Evidence** line names (manifests, SDK setup, transfer functions and so on), with static checks first.
3. Quote the cost in credits; the requester confirms.
4. The AI jury rules on each rule by commit and reveal. Each juror returns `verdict`, reasons and citations (`file`, `lines`). A citation that doesn't exist at the commit invalidates that vote. Quorum decides; no quorum gives `needs_evidence`.

## 4. Score and result
- Verdicts: `pass`, `fail`, `needs_evidence`, `not_evaluable_from_code`.
- Weights: critical rules 3, others 1.
- **Score** = passed weight / evaluable weight x 100 (evaluable = not `not_evaluable_from_code`).
- **PASS** when no rule is `fail` or `needs_evidence` and at least 60% of total weight was evaluable. Otherwise **NOT CERTIFIED**.

## 5. What is inscribed
One inscription per certificate, written with IQ Labs `writer.codeIn` on Solana, containing:
1. the certificate JSON ([schema](schema/certificate.schema.json)): repository, commit, tree, codeChecksum, standard code, version and `policyRef`, per-rule verdicts with citations, score, result, juror attestations, the hash of the full report;
2. the **summary report**: per rule, the verdict and up to three citations;
3. the **ASCII badge** from `badges/{CODE}.txt` with `{repo}`, `{sha7}`, `{sum12}` and `{date}` filled in, or `badges/FAIL.txt` when not certified.

The full report (all reasons and every citation) is stored off chain; its SHA-256 is in the certificate. Keep the inscription under 8.5 KB.

## 6. Badge rules
- Badges are plain ASCII, 44 columns wide, at most 9 lines, so they render the same in a terminal, a README and an explorer.
- A badge appears only on PASS. The badge names the standard and version, the repository and short commit, the first 12 characters of `codeChecksum`, and the date.
- Anyone can verify a badge: read the inscription, recompute `codeChecksum` from the commit, compare.

## 7. Limits
- A certificate covers what is in the repository at that commit. Server behavior, deployed binaries and business practices are outside it (`not_evaluable_from_code`).
- It is a code review against a published standard, not a legal, regulatory or safety certification.
- Proof of which model answered each vote is planned (Anthropic's FlashProve prototype), not live.

## 8. Wallets
Attaching a Solana wallet (to sign requests, pay in credits or SOL, and own certificates): **coming soon.**
