import DocsFrame from "@/components/DocsFrame";
import { DocHead, H2, Status, T } from "@/components/DocBits";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta("Credits and pricing", "/docs/credits");

export default function Page() {
  return (
    <DocsFrame current="/docs/credits">
      <Status />
      <DocHead title="Credits and pricing" intro="Every paid call is quoted in credits first, and the charge never goes above the quote." />

      <H2>How you pay</H2>
      <p className="d-mut">Every paid call is quoted first. You confirm, it runs, and the charge never goes above the quote. No quorum, a timeout or a failed run costs 0. Use <code>maxCredits</code> to cap any call.</p>

      <H2>What&apos;s free</H2>
      <ul className="d-mut">
        <li>The <a href="/sandbox">Sandbox</a> with a simulated jury.</li>
        <li>Reading every page, and viewing certificates.</li>
        <li><code>asc.quote</code>, which prices a call without running it.</li>
      </ul>

      <H2>Proposed prices</H2>
      <T head={["Action", "Price (proposed)"]} rows={[
        [<>Ruling, 5 jurors, <code key="t">standard</code></>, "25 credits"],
        ["Each juror above 5", "5 credits"],
        [<>Tier <code key="f">fast</code> / <code key="r">frontier</code></>, ""],
        ["Draft (compile + loophole check)", "2 credits"],
        ["Publish", "network cost plus 10%"],
        ["Dispute (second jury)", "the price of the original ruling"],
        ["Certify, 12 rules, about 120 files", "about 400 credits"],
      ]} />
      <p className="d-dim" style={{ fontSize: 14 }}>Prices for the <code>fast</code> and <code>frontier</code> tiers aren&apos;t set yet.</p>

      <H2>A worked example</H2>
      <p className="d-mut">Five jurors on a withdrawal: 25 credits. A dispute: 25 more. The model cost behind it is about half a cent per ruling; see <a href="/performance">Performance</a>.</p>
    </DocsFrame>
  );
}
