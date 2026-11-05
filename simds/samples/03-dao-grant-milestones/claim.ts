// A grantee claims a milestone. The grants program asks for a ruling with the
// claim and its links as external context, then releases the tranche.
import { ip, type RequestRuling } from '../00-shared/inference-programs';
declare const GRANTS_IP: any, GRANTS_PROGRAM: any, GRANTS_TREASURY: any;

export async function claimMilestone(grantId: string, n: number, claim: string, repo: { url: string; commit: string }, links: string[]) {
  const call: Omit<RequestRuling, 'budget'> = {
    program: GRANTS_IP,
    requestPrompt: `Was milestone ${n} of grant ${grantId} delivered as described?`,
    input: { type: 'milestone_claim', grantId, milestone: n },
    externalContext: {
      entries: [
        { kind: 'other', label: 'Claim', storage: { inline: claim } },
        { kind: 'other', label: 'Repository', storage: { git: { repo: repo.url, commit: repo.commit, path: '/' } } },
        ...links.map((l, i) => ({ kind: 'web_page' as const, label: `Link ${i + 1}`, storage: { link: l } })),
      ],
    },
    jury: { evaluators: 5, quorum: 4, assurance: 'L1', distinctFamilies: true },
    maxInputTokens: 16000,
    maxOutputTokens: 900,
    refundTo: GRANTS_TREASURY,
    callback: { program: GRANTS_PROGRAM, events: ['final', 'needs_funds', 'expired'] },
  };
  const quote = await ip.quoteRuling(call);
  return ip.requestRuling({ ...call, budget: quote.total });
  // Links are snapshotted before the request is created: a broken or private
  // link counts as not delivered (rule 2 of the grant program rules).
}
