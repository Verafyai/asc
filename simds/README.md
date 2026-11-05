# The three draft SIMDs

Three companion Solana Improvement Documents that bring inference programs to
Solana. Each can be reviewed on its own. All three are drafts, open for discussion in
[SIMD discussion #724](https://github.com/solana-foundation/solana-improvement-documents/discussions/724),
and are not yet submitted as pull requests. Each is numbered `SIMD-XXXX` until it has a
pull-request number; "SIMD 1, 2, 3" below only orders the three.

| | File | Title | What it defines |
|---|---|---|---|
| SIMD 1 | [inference-programs.md](inference-programs.md) | Inference Programs | Natural-language programs on chain, their internal context (inline, a web page snapshot, or a git repository at a commit; compact, compressed or encrypted), mutability, and how a caller requests a ruling: request prompt, external context, jury shaping and an escrowed budget. |
| SIMD 2 | [inference-attestations.md](inference-attestations.md) | Inference Evaluators and Attestations | Who runs the models and what they commit to: evaluator registration, model commitments, the signed commit-then-reveal attestation, bonds and attestation challenges, assurance levels L0 to L2 with L3 reserved, and fast System 1 evaluators. |
| SIMD 3 | [inference-rulings.md](inference-rulings.md) | Inference Rulings, Disputes and Challenges | The signed ruling programs act on (outcome, summary, reasoning by hash, checked sources, certainty, signatures, sign-off, dissents), `ReadRuling`, forecasts and prediction-market resolutions, and how rulings are disputed, challenged and overturned without being erased. |

These Markdown files are the single source. The site renders them at build time
on [asc.verafy.ai/simds](https://asc.verafy.ai/simds) (`lib/simds.ts`), and the
"Download Markdown" links there serve these same files.

The overview, with the motivation and diagrams for all three, is the post
[Bringing Inference Programs To Solana](https://blog.verafy.ai/articles/20261105-simd-verifiable-inference).

## Samples

[`samples/`](samples/) holds ten samples written to the SIMD structure. Each
folder has `program.asc.md` (the prompt, in the format of SIMD 1 Appendix A),
`context/` (the internal context), `program.json` (the arguments to
`CreateInferenceProgram`) and the calling code. `samples/00-shared/` holds the
SDK types, the on-chain `read_ruling` check and an example ruling. The samples
are illustrative: no SDK or reference program is published yet. See
[samples/README.md](samples/README.md) for the table of samples.
