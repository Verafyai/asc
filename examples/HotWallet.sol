// ILLUSTRATIVE. Not a deployed interface. Two steps on EVM.
contract HotWallet {
  IPolicy policy; bytes32 constant POLICY = 0x...;
  function requestWithdraw(address to, uint256 amt) external {
    policy.request(POLICY, abi.encode(to, amt, block.chainid)); // jury is asked
  }
  function release(uint256 id, bytes calldata attestations) external {
    require(policy.allowed(id, attestations), "policy: refused");
    _send(pending[id].to, pending[id].amt);
  }
}
