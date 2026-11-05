// SPDX-License-Identifier: MIT
// A Governor that won't execute a passed proposal until the constitution's jury allows it.
// Two steps, because an EVM call can't wait for models: request, then execute with signatures.
// Illustrative. Not audited or deployed.
pragma solidity ^0.8.24;

import {Governor} from "@openzeppelin/contracts/governance/Governor.sol";
import {IAsc} from "@verafy/asc-contracts/IAsc.sol";

abstract contract ConstitutionGuard is Governor {
    IAsc public immutable asc;
    bytes32 public immutable CONSTITUTION; // ASC id of constitution.asc.md

    mapping(uint256 => bytes32) public rulingOf; // proposalId => ruling request id

    constructor(IAsc _asc, bytes32 constitution) { asc = _asc; CONSTITUTION = constitution; }

    /// Step 1: anyone can ask the jury once a proposal has passed.
    function requestRuling(uint256 proposalId) external {
        require(state(proposalId) == ProposalState.Succeeded, "not passed");
        rulingOf[proposalId] = asc.requestRuling(
            CONSTITUTION,
            abi.encode(proposalId, block.chainid),
            IAsc.Jury({size: 7, quorum: 5, tier: IAsc.Tier.Frontier})
        );
    }

    /// Step 2: execution carries the jurors' signed rulings.
    function executeWithRuling(
        address[] memory targets, uint256[] memory values, bytes[] memory calldatas,
        bytes32 descriptionHash, bytes calldata attestations
    ) external payable returns (uint256 id) {
        id = hashProposal(targets, values, calldatas, descriptionHash);
        require(asc.verifyRuling(rulingOf[id], attestations) == IAsc.Outcome.Allow, "constitution: blocked");
        return execute(targets, values, calldatas, descriptionHash);
    }

    // Plain execute() is closed, so nothing skips the check.
    function _executeOperations(uint256 id, address[] memory t, uint256[] memory v, bytes[] memory c, bytes32 d)
        internal override
    {
        require(rulingOf[id] != bytes32(0), "constitution: request a ruling first");
        super._executeOperations(id, t, v, c, d);
    }
}
