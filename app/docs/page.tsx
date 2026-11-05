import DocsFrame from "@/components/DocsFrame";
import { Code, DocHead, H2, Pill, QUICK_RULES, REQUEST_SHORT, Status } from "@/components/DocBits";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta("Quickstart", "/docs");

const WORDS: [string, string][] = [
  ["ASC", "A published set of rules in plain English: a policy, a DAO constitution, an exchange's internal checks, an agent's limits, a model's behavior rules. It has an id like asc_hotwallet_v1."],
  ["Ruling", "A jury's signed decision on one action under one ASC."],
  ["Jury", "The models you ask for a ruling: how many, how many must agree, and which tier."],
  ["Juror", "One model on the jury. It signs its vote with its own wallet."],
  ["Quorum", "How many jurors must agree before a ruling counts. Below it, the ASC's default outcome applies."],
  ["Standard", "A published list of things a kind of software must never do (EDO, EAO, ETC, EVC, EMO)."],
  ["Certificate", "A jury's code review of one commit against one standard."],
  ["Credits", "What you pay in. Every paid call is quoted in credits before it runs."],
];

export default function Page() {
  return (
    <DocsFrame current="/docs">
      <Status />
      <DocHead title="Quickstart" intro="Write a rule in English, publish it, and ask a jury to rule on a real request." />
      <p><a className="d-btn p sm" href="/docs/request-a-ruling">Jump to requestRuling()</a></p>

      <H2>1. Write it</H2>
      <p className="d-mut">Save this as <code>withdrawals.asc.md</code>. Rule 1 is a hard limit. Rule 5 is a judgment call that code can't make.</p>
      <Code code={QUICK_RULES} title="withdrawals.asc.md" />
      <p className="d-mut">The full file is in the <a href="/code/exchange-withdrawals">exchange withdrawals sample</a>. <a href="/docs/write">Write an ASC</a> explains every field.</p>

      <H2>2. Try it free</H2>
      <p className="d-mut">Paste the rules into the <a href="/sandbox">Sandbox</a>, send a request and pick how the jury behaves. A simulated jury costs nothing. <Pill kind="live" /></p>

      <H2>3. Publish it</H2>
      <Code code={"npm i @verafy/asc\nnpx asc publish withdrawals.asc.md"} title="terminal" pill="planned" />
      <p className="d-mut">You get an ASC id, like <code>asc_hotwallet_v1</code>. Publishing shows you the compiled steps and the loophole report first, and nothing goes on chain until you sign. See <a href="/docs/publish">Publish an ASC</a>.</p>

      <H2>4. Request a ruling</H2>
      <Code code={REQUEST_SHORT} title="asc.requestRuling()" pill="planned" lang="TypeScript" />
      <p className="d-mut">Every parameter is in <a href="/docs/request-a-ruling#parameters">Request a ruling</a>.</p>

      <H2>5. Use the result</H2>
      <p className="d-mut"><code>ruling.outcome</code> is <code>allow</code> or <code>hold</code>. Pass <code>ruling.attestations</code> to your payout program, and it checks the signatures itself. See <a href="/docs/enforce">Enforce a ruling</a>.</p>

      <H2 id="words">Words we use</H2>
      <dl className="d-glossary">
        {WORDS.map(([w, d]) => <div key={w}><dt>{w}</dt><dd className="d-mut">{d}</dd></div>)}
      </dl>
    </DocsFrame>
  );
}
