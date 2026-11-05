// Monthly vesting release, gated on a ruling under the contributor agreement.
// A "stop" can be challenged later by the contributor with new evidence; if it
// is overturned, vesting resumes from the overturn. Illustrative.
use anchor_lang::prelude::*;
use crate::read_ruling::{read_ruling, Assurance, Expect};

const RELEASE: u8 = 0;
const PAUSE: u8 = 1;
const STOP: u8 = 2;

pub fn release(ctx: Context<Release>, month: u16) -> Result<()> {
    let v = &mut ctx.accounts.vesting;
    require!(month >= v.cliff_months, VestError::BeforeCliff);   // rule 1, in code
    let outcome = read_ruling(&ctx.accounts.ruling, &Expect {
        inference_program: v.inference_program,
        prompt_hash: v.prompt_hash,
        context_hash: v.context_hash,        // the frozen, encrypted agreement
        ext_context_hash: v.pending_ext_context_hash,
        input: &Action::vesting_release(v.key(), month).to_bytes(),
        min_quorum: 4,
        min_assurance: Assurance::L1,
        min_confidence: 0,
        dispute_window_passed: true,
    })?;
    match outcome {
        RELEASE => transfer(ctx, v.monthly_amount),
        PAUSE => Ok(()),
        STOP => { v.stopped_by = Some(ctx.accounts.ruling.key()); Ok(()) }
        _ => err!(VestError::UnknownOutcome),
    }
}

/// Called after ResolveChallenge. If the ruling that stopped vesting was
/// overturned, vesting resumes. Past releases are not touched.
pub fn on_review(ctx: Context<OnReview>) -> Result<()> {
    let v = &mut ctx.accounts.vesting;
    let stopped_by = v.stopped_by.ok_or(VestError::NotStopped)?;
    let r = ctx.accounts.ruling_header();               // the Ruling that stopped it
    require_keys_eq!(r.key, stopped_by, VestError::WrongRuling);
    if r.review_status == 2 /* overturned */ {
        v.stopped_by = None;
        emit!(VestingResumed { vesting: v.key(), overturned_by: r.reviewed_by });
    }
    Ok(())
}
