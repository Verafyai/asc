import DocsFrame from "@/components/DocsFrame";
import { Code, DocHead, H2, Pill, Status, T } from "@/components/DocBits";
import { pageMeta } from "@/lib/page-meta";
import { getSample, sharedFile } from "@/lib/samples";

export const metadata = pageMeta("Enforce a ruling", "/docs/enforce");

export default function Page() {
  const ex = getSample("exchange-withdrawals")!;
  const dao = getSample("dao-constitution")!;
  const rust = ex.code.find((f) => f.name.endsWith(".rs"))!;
  const guard = dao.code.find((f) => f.name === "ConstitutionGuard.sol")!;
  return (
    <DocsFrame current="/docs/enforce">
      <Status />
      <DocHead title="Enforce a ruling" intro="Your contract checks the jurors' signatures itself. A ruling only counts on chain if it verifies there." />
      <div className="d-card" style={{ fontFamily: "var(--font-mono)", fontSize: 15, margin: "8px 0 18px" }}>withdraw() → requestRuling(asc, action, jury) → jury votes → verifyRuling → allow: runs, else: revert</div>
      <T head={["Chain", "Call", "Status"]} rows={[
        ["Solana", <><code>verify_ruling(&amp;asc, &amp;action, &amp;instructions) -&gt; Outcome</code>. The juror signatures ride in the same transaction (Ed25519 precompile). It fails if the ASC id, action hash, juror keys or quorum don&apos;t match.</>, <Pill key="p" kind="planned" />],
        ["EVM", <><code>requestRuling(ascId, action, jury)</code> emits an event; then <code>verifyRuling(requestId, attestations)</code> returns the outcome. Two steps, because a contract can&apos;t wait for models.</>, <Pill key="p" kind="planned" />],
      ]} />

      <H2>Solana</H2>
      <p className="d-mut">Your backend calls <code>asc.requestRuling</code>, then sends the payout with <code>ruling.attestations</code> in the same transaction. The program checks them.</p>
      <Code code={rust.text} title={rust.name} pill="illustrative" lang="Rust" />
      <p className="d-mut">Full sample: <a href="/code/exchange-withdrawals">Exchange withdrawal checks</a>.</p>

      <H2>EVM</H2>
      <p className="d-mut">Step 1 asks the jury. Step 2 executes with the jurors&apos; signed votes.</p>
      <Code code={sharedFile("IAsc.sol")} title="IAsc.sol" pill="planned" lang="Solidity" />
      <Code code={guard.text} title={guard.name} pill="illustrative" lang="Solidity" />
      <p className="d-mut">Full sample: <a href="/code/dao-constitution">A DAO constitution that can block a vote</a>.</p>

      <H2>Keep hard caps in your code</H2>
      <p className="d-mut">Hard caps stay in the contract&apos;s own code. Never let a ruling raise a cap. A ruling only chooses among the outcomes your ASC lists, and the cap check runs whatever the jury said.</p>
    </DocsFrame>
  );
}
