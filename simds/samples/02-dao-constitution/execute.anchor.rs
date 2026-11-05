// A governance program that executes a passed proposal only after a final
// ruling against the DAO constitution. Illustrative, Anchor-style.
use anchor_lang::prelude::*;
use crate::read_ruling::{read_ruling, Assurance, Expect};

const ALLOW: u8 = 0;

/// Phase 1, in the same transaction that closes the vote: ask for a ruling.
/// The forum thread is snapshotted at this moment, so later edits can't change
/// what the jury reads (SIMD 1, "Linked content").
pub fn close_vote(ctx: Context<CloseVote>, nonce: u64) -> Result<()> {
    let p = &ctx.accounts.proposal;
    inference_programs::cpi::request_ruling(ctx.accounts.request_ctx(), RequestRulingArgs {
        nonce,
        request_prompt: format!("May proposal {} be executed under the constitution?", p.id),
        input: p.execution_action().to_bytes(),             // the exact calldata
        ext_context: vec![
            ext::snapshot_link(&p.forum_url),               // kind: discussion
            ext::content(&ctx.accounts.decoded_calldata),   // kind: other
        ],
        jury: JurySpec { evaluators: 7, quorum: 5, assurance: 1, distinct_families: true, ..Default::default() },
        budget: ctx.accounts.config.ruling_budget,          // from a prior QuoteRuling
        refund_to: ctx.accounts.treasury.key(),
        callback: Some((crate::ID, EVENT_FINAL | EVENT_EXPIRED)),
    })
}

/// Phase 2: anyone can execute once the ruling is final, the 72-hour dispute
/// window has passed, and nothing is under review.
pub fn execute(ctx: Context<Execute>) -> Result<()> {
    let p = &ctx.accounts.proposal;
    let cfg = &ctx.accounts.config;
    let outcome = read_ruling(&ctx.accounts.ruling, &Expect {
        inference_program: cfg.constitution_program,
        prompt_hash: cfg.trusted_prompt_hash,
        context_hash: cfg.trusted_context_hash,             // the frozen constitution
        ext_context_hash: p.ext_context_hash,
        input: &p.execution_action().to_bytes(),
        min_quorum: 5,
        min_assurance: Assurance::L1,
        min_confidence: 0,
        dispute_window_passed: Clock::get()?.slot > p.ruling_final_slot + cfg.dispute_slots,
    })?;
    require!(outcome == ALLOW, GovError::BlockedByConstitution);
    p.execute(ctx.remaining_accounts)
}
