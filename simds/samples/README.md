# Sample code: inference programs (Actually Smart Contracts)

Every sample follows the three draft SIMDs. Illustrative until the SDK ships.

| Folder | Program | Internal context | Each call injects | Shows |
|---|---|---|---|---|
| 01-exchange-withdrawals | Hot wallet withdrawals | Withdrawal policy, encrypted, from git | Support ticket | Two-phase withdraw, callbacks, needs funds |
| 02-dao-constitution | DAO constitution | Constitution, frozen, from git | Forum thread (snapshotted at vote close), decoded calldata | Execute after ruling; challenge years later |
| 03-dao-grant-milestones | Grant milestones | Grant program rules, from a web page | Claim, repo at a commit, links | External context of three kinds |
| 04-agent-spending | Agent spending | Spending rules | Owner's task, vendor page | System 1 screen, then the full jury |
| 05-agent-customer-data | Customer data | Data rules, encrypted | Message, recipient, ticket | Redact outcome |
| 06-model-output | Model behavior audit | Behavior rules | Prompt and answer | Batch audit, cited failures |
| 07-treasury-rebalancing | Treasury trades | Constitution article + treasury policy | Operator's reason | Two context entries, shrink outcome |
| 08-vesting-release | Contributor vesting | Agreement, frozen, encrypted | Termination notice | Resume after an overturned stop |
| 09-certify-in-ci | Repository certification | Standards from asc-standards at a commit | This commit | A certificate is a ruling |
| 10-prediction-market | Forecast and resolver | Resolution rules (resolver only) | Evidence, then the official source | Forecast before, resolution after, scoring |

`00-shared/` holds the SDK types (`inference-programs.ts`), the on-chain check
(`read_ruling.rs`) and an example ruling (`ruling.example.json`).

Each folder has `program.asc.md` (the prompt, in the format of SIMD 1
Appendix A), `context/` (the internal context), `program.json` (the
arguments to `CreateInferenceProgram`) and the calling code.
