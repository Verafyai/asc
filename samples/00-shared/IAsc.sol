// SPDX-License-Identifier: MIT
// The on-chain side of an ASC on EVM chains. Planned interface, illustrative.
// EVM calls can't wait for models, so it's two steps: requestRuling, then verifyRuling.
pragma solidity ^0.8.24;

interface IAsc {
    enum Tier { Fast, Standard, Frontier }
    enum Outcome { None, Allow, Deny, Hold, Partial, Release, Stop }

    struct Jury { uint8 size; uint8 quorum; Tier tier; }

    /// Ask the jury to rule on `action` under the published ASC `ascId`.
    /// Emits RulingRequested; the jury answers off chain with signed votes.
    function requestRuling(bytes32 ascId, bytes calldata action, Jury calldata jury)
        external returns (bytes32 requestId);

    /// Check the jurors' signed votes for `requestId` and return the outcome
    /// they reached. Reverts if signatures, juror keys, ASC id or quorum don't check out.
    function verifyRuling(bytes32 requestId, bytes calldata attestations)
        external view returns (Outcome);

    event RulingRequested(bytes32 indexed requestId, bytes32 indexed ascId, bytes32 actionHash, Jury jury);
}
