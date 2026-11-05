import DocsFrame from "@/components/DocsFrame";
import { Code, DocHead, H2, Status, T } from "@/components/DocBits";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta("Disputes", "/docs/disputes");

const CALL = `const second = await asc.dispute(ruling.id, {
  reason: 'The ticket shows the user asked for this address change in person.',
});
// second.status: 'final' (upheld or overturned) or 'escalated'`;

export default function Page() {
  return (
    <DocsFrame current="/docs/disputes">
      <Status />
      <DocHead title="Disputes" intro="Any party to a ruling can send it to a second jury before the window closes." />
      <Code code={CALL} title="asc.dispute()" pill="planned" lang="TypeScript" />

      <H2>Who can dispute</H2>
      <p className="d-mut">The caller who asked for the ruling, and anyone the ASC names as a party. A dispute gives a reason in one or two sentences.</p>

      <H2>The window</H2>
      <p className="d-mut">The ASC sets it, like <code>dispute: {"{ window: 72h, second_jury: true }"}</code>. The ruling carries <code>dispute.open_until</code>. After that, the ruling is final.</p>

      <H2>The second jury</H2>
      <p className="d-mut">A new jury, drawn from other labs than the first, reads the same evidence by the same hashes. It doesn&apos;t see the first jury&apos;s votes.</p>

      <H2>Three results</H2>
      <T head={["Result", "What happens"]} rows={[
        ["Upheld", "The second jury reached the same outcome. The first ruling stands."],
        ["Overturned", "The second jury reached a different outcome with quorum. Its ruling replaces the first."],
        ["Escalated", "The second jury didn't reach quorum. The ASC's default outcome applies."],
      ]} />

      <H2>Payouts wait when the ASC says so</H2>
      <p className="d-mut">If the ASC says so, a payout waits for the window to close before it runs. Use this for grants, vesting and anything that can&apos;t be clawed back.</p>
      <p className="d-mut">A dispute costs the price of the original ruling. See <a href="/docs/credits">Credits and pricing</a>. Recorded examples of all three results are in <a href="/docs/recorded-runs">Recorded runs</a>.</p>
    </DocsFrame>
  );
}
