// The on-chain side. The payout fails unless a quorum of listed jurors signed
// "allow" for this exact withdrawal under this exact ASC.
// Illustrative, Anchor-style. Not a deployed program.
pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let action = Action::withdrawal(ctx.accounts.to.key(), amount);

    // Juror signatures ride in this transaction (Ed25519 precompile).
    // verify_ruling checks the ASC id, action hash, juror keys and quorum.
    verify_ruling(&ctx.accounts.asc, &action, &ctx.accounts.instructions)?.require(Outcome::Allow)?;

    // Hard caps still apply in code, whatever the jury said.
    require!(amount <= ctx.accounts.asc.max_single, AscError::OverCap);
    transfer(ctx, amount)
}
