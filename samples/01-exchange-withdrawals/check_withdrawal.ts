// The exchange's withdrawal service asks the jury before it signs anything.
// @verafy/asc is the planned SDK. Illustrative: not run against a validator.
import { asc } from '@verafy/asc';

const ASC_ID = process.env.ASC_WITHDRAWALS_ID!; // from `asc publish withdrawals.asc.md`

export async function approveWithdrawal(w: Withdrawal) {
  const ruling = await asc.requestRuling({
    asc: ASC_ID,
    jury: { size: 5, quorum: 4, tier: 'standard' },
    action: { type: 'withdrawal', to: w.to, amount_usd: w.amountUsd, asset: w.asset, chain: w.chain },
    evidence: {
      account: await accounts.securitySummary(w.accountId),   // { age_days, kyc_level, changes_48h: ['email', '2fa'] }
      destination: await registry.lookup(w.accountId, w.to),  // { registered, hours_since_registration, used_before }
      ticket: w.ticketId ? await support.transcript(w.ticketId) : null,
      totals: await ledger.todaySummary(),                    // { sent_today_usd, hot_wallet_usd }
    },
  });

  if (ruling.outcome === 'allow') {
    // The jurors' signatures go into the payout transaction; the program re-checks them.
    return payouts.send(w, ruling.attestations);
  }
  await reviews.open(w, {
    reason: ruling.rulesBroken,      // e.g. [{ rule: 5, votes: 5, note: 'email and 2FA changed 3h ago; new address' }]
    votes: ruling.votes,
  });
  return { status: 'held', ruling: ruling.id };
}
