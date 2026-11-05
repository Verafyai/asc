// The treasury bot proposes a trade; the jury rules; the multisig only signs an allowed trade.
// @verafy/asc is the planned SDK. Illustrative.
import { asc } from '@verafy/asc';

const ASC_ID = process.env.ASC_TREASURY_ID!;

export async function proposeTrade(trade: Trade, reason: string) {
  const ruling = await asc.requestRuling({
    asc: ASC_ID,
    jury: { size: 5, quorum: 4, tier: 'frontier' },
    action: { type: 'treasury_trade', ...trade },
    evidence: {
      holdings: await treasury.holdings(),
      market: await venues.depth(trade.venue, trade.pair),
      reason,
    },
  });

  if (ruling.outcome === 'deny') return { status: 'denied', reasons: asc.reasons(ruling) };

  const size = ruling.outcome === 'shrink' ? ruling.amount : trade.size; // jury can only lower it
  return multisig.propose({ ...trade, size }, { attach: ruling.attestations });
}
