// Phase 2 of 2: the hot wallet program pays only on a final "allow" ruling
// for this exact withdrawal, under the rules it trusts. Illustrative.
use anchor_lang::prelude::*;
use crate::read_ruling::{read_ruling, Assurance, Expect};

const ALLOW: u8 = 0; // index of "allow" in the prompt's outcome list

pub fn withdraw(ctx: Context<Withdraw>, id: [u8; 16], amount: u64) -> Result<()> {
    let cfg = &ctx.accounts.config;
    let action = Action::withdrawal(id, ctx.accounts.to.key(), amount).to_bytes();

    let outcome = read_ruling(&ctx.accounts.ruling, &Expect {
        inference_program: cfg.inference_program,
        prompt_hash: cfg.trusted_prompt_hash,    // pinned when this program was configured
        context_hash: cfg.trusted_context_hash,  // the withdrawal policy it trusts
        ext_context_hash: ctx.accounts.request_meta.ext_context_hash, // ticket, if any
        input: &action,
        min_quorum: 4,
        min_assurance: Assurance::L1,
        min_confidence: 0,
        dispute_window_passed: true,             // withdrawals don't wait for disputes
    })?;
    require!(outcome == ALLOW, WalletError::Held);

    // Hard limits stay in code, whatever the ruling says.
    require!(amount <= cfg.max_single, WalletError::OverCap);
    require!(cfg.sent_today + amount <= cfg.max_daily, WalletError::OverCap);

    transfer(ctx, amount)
}

/// Callback target for NotifyCaller. Callbacks only notify; re-check before acting.
pub fn on_ruling_event(ctx: Context<OnEvent>, event: u8, shortfall: u64) -> Result<()> {
    match event {
        1 /* needs funds */ => emit!(NeedsFunds { request: ctx.accounts.request.key(), shortfall }),
        2 /* expired */     => emit!(Held { request: ctx.accounts.request.key() }),
        _ => {}
    }
    Ok(())
}
