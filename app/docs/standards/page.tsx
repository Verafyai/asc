import DocsFrame from "@/components/DocsFrame";
import { Code, DocHead, H2, Status } from "@/components/DocBits";
import { pageMeta } from "@/lib/page-meta";
import { CHECKSUM_COMMAND } from "@/lib/standards";
import { getSample } from "@/lib/samples";

export const metadata = pageMeta("Standards and certification", "/docs/standards");

const CERTIFY = `const cert = await asc.certify({
  repo: 'github.com/example/agent',
  commit: '9f3c2e1',
  standards: ['EAO@1.0'],
  jury: { size: 5, quorum: 4, tier: 'standard' },
});
// cert.outcome: 'PASS' or 'NOT CERTIFIED', with a score, a report and an ASCII badge`;

export default function Page() {
  const ci = getSample("certify-in-ci")!;
  return (
    <DocsFrame current="/docs/standards">
      <Status />
      <DocHead title="Standards and certification" intro="A standard is a short list of things a kind of software must never do. A certificate checks one commit against one." />
      <p className="d-mut">There are five drafts: EDO, EAO, ETC, EVC and EMO. Read them on <a href="/standards">Standards</a>, or certify a repo on <a href="/certify">Certify</a>.</p>

      <H2>Claim a standard</H2>
      <p className="d-mut">Add <code>asc.yml</code> to your repo to say which standards cover which folders.</p>
      <Code code={ci.rules} title="asc.yml" pill="planned" lang="YAML" />

      <H2>Certify</H2>
      <p className="d-mut">Run <code>asc.certify(...)</code> or the GitHub Action. The jury reviews each rule against the code and cites file and line. The result is PASS or NOT CERTIFIED, with a score, a report and an ASCII badge.</p>
      <Code code={CERTIFY} title="asc.certify()" pill="planned" lang="TypeScript" />
      <Code code={ci.code[0].text} title="GitHub Action" pill="planned" lang="YAML" />

      <H2>Scoring</H2>
      <p className="d-mut">Score is passed weight over evaluable weight. Critical rules weigh 3. PASS means no fail, no needs_evidence, and at least 60 percent of the weight evaluable. Otherwise NOT CERTIFIED.</p>
      <p className="d-mut">A certificate covers one commit. Its code checksum is SHA-256 over the sorted path and blob list:</p>
      <Code code={CHECKSUM_COMMAND} title="code checksum" />

      <p className="d-mut">A certificate is a code review of one commit, not a legal, regulatory or safety certification.</p>
    </DocsFrame>
  );
}
