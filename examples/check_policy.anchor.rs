// ILLUSTRATIVE (Anchor-style). Not a deployed program.
pub fn withdraw(ctx: Context<Withdraw>, amt: u64) -> Result<()> {
    let action = Action { to: ctx.accounts.to.key(), amt };
    // jurors' signatures ride in this transaction (Ed25519 precompile)
    check_policy(&ctx.accounts.policy, &action, &ctx.accounts.ix_sysvar)?; // deny => tx fails
    transfer(ctx, amt)
}
