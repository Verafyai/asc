// Two years later, a forum post shows the proposal's "audit vendor" was a
// council member's company. Anyone may challenge the ruling that allowed it
// (SIMD 3, "Challenges and later review"). Illustrative.
import { PublicKey } from '@solana/web3.js';
declare const rulings: {
  openChallenge(a: {
    ruling: PublicKey;
    grounds: 'new_evidence' | 'false_evidence' | 'error' | 'changed_rules';
    newEvidence: { kind: 'web_page' | 'other'; label: string; storage: { link: string } | { inline: string } }[];
    jury: { evaluators: number; quorum: number; assurance: 'L1' | 'L2'; distinctFamilies: true };
    budget: number;   // pays the challenge jury; the bond is locked separately
  }): Promise<{ request: PublicKey }>;
};

export async function challengeProposal42(ruling: PublicKey, budget: number) {
  return rulings.openChallenge({
    ruling,
    grounds: 'new_evidence',
    newEvidence: [
      { kind: 'web_page', label: 'Forum post, 2028-03-02', storage: { link: 'https://forum.example-dao.org/t/4410' } },
      { kind: 'other', label: 'Company registry extract', storage: { inline: '...' } },
    ],
    // Must be at least the ReviewPolicy floor, with no family from the original jury.
    jury: { evaluators: 7, quorum: 5, assurance: 'L1', distinctFamilies: true },
    budget,
  });
  // If overturned, the original ruling stays on chain, marked overturned, and
  // links to this one. The proposal already executed; the DAO's own program
  // decides the remedy (here, flag the recipient and open a clawback vote).
}
