// Monthly release. The schedule math is plain code; the jury rules only on the
// judgment clause (was it for cause?). Illustrative, Anchor-style.
pub fn release(ctx: Context<Release>) -> Result<()> {
    let grant = &mut ctx.accounts.grant;
    let due = grant.amount_due(Clock::get()?.unix_timestamp); // cliff and schedule, no models
    require!(due > 0, AscError::NothingDue);

    let action = Action::vesting_release(grant.key(), due);
    let ruling = verify_ruling(&ctx.accounts.asc, &action, &ctx.accounts.instructions)?;

    match ruling {
        Outcome::Release => transfer_to_contributor(ctx, due),
        Outcome::Stop => { grant.end(); Ok(()) }
        _ => Err(AscError::Paused.into()), // pause: nothing moves, the board is asked
    }
}
