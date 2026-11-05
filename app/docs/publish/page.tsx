import DocsFrame from "@/components/DocsFrame";
import { Code, DocHead, H2, Pill, Status } from "@/components/DocBits";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta("Publish an ASC", "/docs/publish");

const PUBLISH = `import { asc } from '@verafy/asc';
import fs from 'node:fs';

const draft = await asc.draft({ text: fs.readFileSync('withdrawals.asc.md', 'utf8') });
console.log(draft.report);          // compiled steps and the loophole report: read it

const published = await asc.publish(draft, { signer });
// { id: 'asc_hotwallet_v1', version: '1.0.0', url: 'https://asc.verafy.ai/...' }`;

export default function Page() {
  return (
    <DocsFrame current="/docs/publish">
      <Status />
      <DocHead title="Publish an ASC" intro="Publishing turns your file into rules that can't change, with an id any caller can use." />
      <Code code={"npx asc publish withdrawals.asc.md"} title="terminal" pill="planned" />
      <Code code={PUBLISH} title="asc.draft() and asc.publish()" pill="planned" lang="TypeScript" />

      <H2>What publishing does</H2>
      <ol className="d-mut">
        <li><b>Draft.</b> Your English is compiled into steps.</li>
        <li><b>Loophole report.</b> The steps are read back against the English, and any gap is listed.</li>
        <li><b>Your sign-off.</b> Nothing is written until you sign.</li>
        <li><b>Written to Solana.</b> The rules can&apos;t change after that. You get an id, like <code>asc_hotwallet_v1</code>, and a public page.</li>
      </ol>

      <H2>Versions</H2>
      <p className="d-mut">Publishing again makes <code>@1.1.0</code>. Old rulings keep pointing at the version they used. Callers can pin a version, like <code>asc_hotwallet_v1@1.0.0</code>. Without a pin, the current version is used and recorded on the ruling.</p>

      <H2>Private ASCs <Pill kind="planned" /></H2>
      <p className="d-mut">The rules are encrypted so only the jury can read them. Its limit: any juror could leak the rules.</p>

      <H2>What it costs</H2>
      <p className="d-mut">A draft is 2 credits. Publishing is the network cost plus 10%. See <a href="/docs/credits">Credits and pricing</a>.</p>

      <p className="d-dim" style={{ marginTop: 32 }}>ASCs are stored on Solana with IQ Labs inscriptions. <a href="/docs/under-the-hood">Under the hood</a>.</p>
    </DocsFrame>
  );
}
