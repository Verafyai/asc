// Reading a ruling from a calling program, per the SIMD draft section
// "Reading a ruling from another program". Anchor-style. Illustrative: the
// inference programs program is not deployed, so its id below is a placeholder.
//
// Rulings take seconds to minutes, so every guarded action is two-phase:
//   tx 1: the client calls RequestRuling with the exact action as the input.
//   tx 2: the program performs the action only if a final Ruling exists for
//         that exact input, under the rules it trusts. That check is below.

use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::hash;

pub const INFERENCE_PROGRAMS_ID: Pubkey = pubkey!("Inference1111111111111111111111111111111111");

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, PartialOrd)]
pub enum Assurance { L0 = 0, L1 = 1, L2 = 2 }

/// What the calling program insists on. Everything here is pinned in the Ruling.
pub struct Expect<'a> {
    pub inference_program: Pubkey,
    pub prompt_hash: [u8; 32],        // the instructions this program trusts
    pub context_hash: [u8; 32],       // the internal context it trusts
    pub ext_context_hash: [u8; 32],   // what this program injected, or zero
    pub input: &'a [u8],              // the exact action about to run
    pub min_quorum: u8,
    pub min_assurance: Assurance,
    pub min_confidence: u8,           // weigh agreement first; this is a floor
    pub dispute_window_passed: bool,  // for high-value actions
}

/// Subset of the Ruling account this check needs (see the SIMD for the full layout).
#[account]
pub struct Ruling {
    pub ruling_request: Pubkey,
    pub inference_program: Pubkey,
    pub prompt_hash: [u8; 32],
    pub context_hash: [u8; 32],
    pub ext_context_hash: [u8; 32],
    pub input_hash: [u8; 32],
    pub outcome: u8,
    pub assurance: u8,
    pub agreeing: u8,
    pub answered: u8,
    pub confidence_mean: u8,
    pub confidence_min: u8,
    pub status: u8, // 0 awaiting opinion, 1 final, 2 disputed, 3 overturned, 4 upheld
}

#[error_code]
pub enum RulingError {
    #[msg("ruling is not owned by the inference programs program")] WrongOwner,
    #[msg("ruling applied different rules than this program trusts")] WrongRules,
    #[msg("ruling is for a different action")] WrongInput,
    #[msg("no quorum: treat as no ruling")] NoQuorum,
    #[msg("assurance below what this action requires")] LowAssurance,
    #[msg("ruling is not final")] NotFinal,
}

/// Returns the outcome id if, and only if, the ruling may be acted on.
pub fn read_ruling(ruling_ai: &AccountInfo, e: &Expect) -> Result<u8> {
    require_keys_eq!(*ruling_ai.owner, INFERENCE_PROGRAMS_ID, RulingError::WrongOwner);
    let r = Ruling::try_deserialize(&mut &ruling_ai.data.borrow()[..])?;

    require_keys_eq!(r.inference_program, e.inference_program, RulingError::WrongRules);
    require!(r.prompt_hash == e.prompt_hash, RulingError::WrongRules);
    require!(r.context_hash == e.context_hash, RulingError::WrongRules);
    require!(r.ext_context_hash == e.ext_context_hash, RulingError::WrongRules);
    require!(r.input_hash == hash(e.input).to_bytes(), RulingError::WrongInput);

    require!(r.agreeing >= e.min_quorum, RulingError::NoQuorum);
    require!(r.assurance >= e.min_assurance as u8, RulingError::LowAssurance);
    require!(r.confidence_min >= e.min_confidence, RulingError::NoQuorum);
    let settled = r.status == 1 || r.status == 4;
    require!(settled && e.dispute_window_passed, RulingError::NotFinal);

    Ok(r.outcome)
}

// The same check is available as an instruction: a CPI to ReadRuling sets
// Solana return data to (ruling, outcome, assurance, agreeing, answered,
// confidence_mean, summary_hash). Use whichever fits your program.
