// A grantee claims a milestone. The jury reads the grant and the delivered work, then rules.
// @verafy/asc is the planned SDK. Illustrative.
import { asc } from '@verafy/asc';

const ASC_ID = process.env.ASC_GRANTS_ID!;

export async function claimMilestone(grantId: string, milestone: number, claim: string, links: string[]) {
  const grant = await grants.get(grantId);

  const ruling = await asc.requestRuling({
    asc: ASC_ID,
    jury: { size: 5, quorum: 4, tier: 'standard' },
    action: { type: 'milestone_claim', grant: grantId, milestone, max_usd: grant.milestones[milestone].usd },
    evidence: {
      grant: grant.text,
      claim,
      links: await asc.snapshot(links),   // fetches each link once, stores it, returns content hashes
    },
  });

  // Escrow pays at most the milestone amount, whatever the outcome says.
  if (ruling.outcome === 'pay') await escrow.release(grantId, milestone, 1.0, ruling.attestations);
  if (ruling.outcome === 'partial') await escrow.release(grantId, milestone, 0.5, ruling.attestations);

  await forum.post(grantId, asc.summary(ruling)); // the votes and reasons, in public
  return ruling;
}
